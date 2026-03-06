import path from 'path'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { defineConfig, loadEnv } from 'vite'
import { geocodeOne, getSuggestions, parseSuggestRequest } from './server/location/suggest'
import { reverseNominatimContext, searchNominatim } from './server/location/nominatimClient'
import { toEbirdRegionCode } from './server/location/regionCode'
import { fetchRarityFromStatusTrends } from './server/birds/statusTrendsRarity'
import { TYPICALLY_COMMON_SPECIES } from './server/birds/typicallyCommonSpecies'
import { TTLCache } from './server/location/cache'

function sendJson(res: { statusCode: number; setHeader: (name: string, value: string) => void; end: (body: string) => void }, statusCode: number, payload: unknown) {
  res.statusCode = statusCode
  res.setHeader('Content-Type', 'application/json')
  res.end(JSON.stringify(payload))
}

const EBIRD_BASE = 'https://api.ebird.org/v2'
const HOTSPOT_CACHE_TTL_MS = 2 * 60 * 1000
const NATURAL_PLACES_CACHE_TTL_MS = 3 * 60 * 1000
const hotspotCache = new TTLCache<unknown>(HOTSPOT_CACHE_TTL_MS)
const naturalPlacesCache = new TTLCache<Array<{ name: string; lat: number; lng: number }>>(NATURAL_PLACES_CACHE_TTL_MS)

function locationApiPlugin() {
  return {
    name: 'location-api',
    configureServer(server: { middlewares: { use: (path: string, handler: (req: { method?: string; url?: string }, res: { statusCode: number; setHeader: (name: string, value: string) => void; end: (body: string) => void }) => Promise<void>) => void } }) {
      server.middlewares.use('/api/location/suggest', async (req, res) => {
        if (req.method !== 'GET') {
          sendJson(res, 405, { error: 'Method not allowed' })
          return
        }
        const url = new URL(req.url ?? '/', 'http://localhost')
        const parsed = parseSuggestRequest(url)
        if (parsed.query.length < 2) {
          sendJson(res, 200, { suggestions: [] })
          return
        }
        const suggestions = await getSuggestions(parsed)
        sendJson(res, 200, { suggestions })
      })

      server.middlewares.use('/api/location/geocode', async (req, res) => {
        if (req.method !== 'GET') {
          sendJson(res, 405, { error: 'Method not allowed' })
          return
        }
        const url = new URL(req.url ?? '/', 'http://localhost')
        const query = (url.searchParams.get('q') ?? '').trim()
        const country = url.searchParams.get('country')
        if (query.length < 2) {
          sendJson(res, 400, { error: 'Query too short' })
          return
        }
        const result = await geocodeOne(query, country)
        if (!result) {
          sendJson(res, 404, { error: 'No matching location found' })
          return
        }
        sendJson(res, 200, { location: result })
      })

      server.middlewares.use('/api/location/reverse', async (req, res) => {
        if (req.method !== 'GET') {
          sendJson(res, 405, { error: 'Method not allowed' })
          return
        }
        const url = new URL(req.url ?? '/', 'http://localhost')
        const lat = url.searchParams.get('lat')
        const lng = url.searchParams.get('lng')
        if (!lat || !lng) {
          sendJson(res, 400, { error: 'lat and lng are required' })
          return
        }
        const latNum = parseFloat(lat)
        const lngNum = parseFloat(lng)
        if (Number.isNaN(latNum) || Number.isNaN(lngNum)) {
          sendJson(res, 400, { error: 'lat and lng must be valid numbers' })
          return
        }
        try {
          const ctx = await reverseNominatimContext({ lat: latNum, lng: lngNum })
          if (!ctx) {
            sendJson(res, 200, { state: null, countryCode: null, regionCode: null })
            return
          }
          const regionCode = toEbirdRegionCode(ctx.countryCode, ctx.state)
          sendJson(res, 200, {
            state: ctx.state,
            countryCode: ctx.countryCode,
            regionCode,
          })
        } catch (err) {
          const msg = err instanceof Error ? err.message : 'Reverse geocode failed'
          sendJson(res, 502, { error: msg })
        }
      })

      server.middlewares.use('/api/location/natural-places', async (req, res) => {
        if (req.method !== 'GET') {
          sendJson(res, 405, { error: 'Method not allowed' })
          return
        }
        const url = new URL(req.url ?? '/', 'http://localhost')
        const lat = url.searchParams.get('lat')
        const lng = url.searchParams.get('lng')
        const rawLimit = Number(url.searchParams.get('limit') ?? '8')
        const limit = Math.min(20, Math.max(1, Number.isFinite(rawLimit) ? rawLimit : 8))
        if (!lat || !lng) {
          sendJson(res, 400, { error: 'lat and lng are required' })
          return
        }
        const latNum = parseFloat(lat)
        const lngNum = parseFloat(lng)
        if (Number.isNaN(latNum) || Number.isNaN(lngNum)) {
          sendJson(res, 400, { error: 'lat and lng must be valid numbers' })
          return
        }
        const cacheKey = `${latNum.toFixed(3)}:${lngNum.toFixed(3)}:${limit}`
        const cached = naturalPlacesCache.get(cacheKey)
        if (cached) {
          sendJson(res, 200, cached)
          return
        }

        // Keep requests light (Nominatim policy), but target common birding place terms.
        const queries = ['wetland', 'lake', 'nature reserve', 'wildlife refuge', 'state park']
        const results: Array<{ name: string; lat: number; lng: number }> = []
        const seen = new Set<string>()

        try {
          for (const query of queries) {
            if (results.length >= limit) break
            const places = await searchNominatim({
              query,
              limit: Math.min(6, limit * 2),
              bias: { lat: latNum, lng: lngNum },
              bounded: true,
            })
            for (const place of places) {
              if (results.length >= limit) break
              const name = place.label.split(',')[0]?.trim() ?? ''
              if (!name) continue
              const key = `${name.toLowerCase()}::${place.lat.toFixed(3)}::${place.lng.toFixed(3)}`
              if (seen.has(key)) continue
              seen.add(key)
              results.push({ name, lat: place.lat, lng: place.lng })
            }
          }
          naturalPlacesCache.set(cacheKey, results)
          sendJson(res, 200, results)
        } catch (err) {
          const msg = err instanceof Error ? err.message : 'Failed to fetch natural places'
          sendJson(res, 502, { error: msg })
        }
      })

      server.middlewares.use('/api/birds/nearby', async (req, res) => {
        if (req.method !== 'GET') {
          sendJson(res, 405, { error: 'Method not allowed' })
          return
        }
        const apiKey = process.env.EBIRD_API_KEY
        if (!apiKey?.trim()) {
          sendJson(res, 503, { error: 'eBird API key not configured. Set EBIRD_API_KEY in .env' })
          return
        }
        const url = new URL(req.url ?? '/', 'http://localhost')
        const lat = url.searchParams.get('lat')
        const lng = url.searchParams.get('lng')
        const dist = url.searchParams.get('dist') ?? '25'
        const back = url.searchParams.get('back') ?? '14'
        if (!lat || !lng) {
          sendJson(res, 400, { error: 'lat and lng are required' })
          return
        }
        const ebirdUrl = new URL(`${EBIRD_BASE}/data/obs/geo/recent`)
        ebirdUrl.searchParams.set('lat', lat)
        ebirdUrl.searchParams.set('lng', lng)
        ebirdUrl.searchParams.set('dist', dist)
        ebirdUrl.searchParams.set('back', back)
        ebirdUrl.searchParams.set('maxResults', '100')
        ebirdUrl.searchParams.set('fmt', 'json')
        try {
          const ebirdRes = await fetch(ebirdUrl.toString(), {
            headers: { 'X-eBirdApiToken': apiKey },
          })
          const data = await ebirdRes.json()
          if (!ebirdRes.ok) {
            const msg = typeof data?.message === 'string' ? data.message : 'eBird API error'
            sendJson(res, ebirdRes.status === 401 ? 502 : 502, { error: msg })
            return
          }
          sendJson(res, 200, data)
        } catch (err) {
          const msg = err instanceof Error ? err.message : 'Failed to fetch from eBird'
          sendJson(res, 502, { error: msg })
        }
      })

      server.middlewares.use('/api/birds/hotspots', async (req, res) => {
        if (req.method !== 'GET') {
          sendJson(res, 405, { error: 'Method not allowed' })
          return
        }
        const apiKey = process.env.EBIRD_API_KEY
        if (!apiKey?.trim()) {
          sendJson(res, 503, { error: 'eBird API key not configured. Set EBIRD_API_KEY in .env' })
          return
        }
        const url = new URL(req.url ?? '/', 'http://localhost')
        const lat = url.searchParams.get('lat')
        const lng = url.searchParams.get('lng')
        const dist = url.searchParams.get('dist') ?? '25'
        if (!lat || !lng) {
          sendJson(res, 400, { error: 'lat and lng are required' })
          return
        }
        const latNum = parseFloat(lat)
        const lngNum = parseFloat(lng)
        const distNum = parseFloat(dist)
        if (Number.isNaN(latNum) || Number.isNaN(lngNum) || Number.isNaN(distNum)) {
          sendJson(res, 400, { error: 'lat, lng, and dist must be valid numbers' })
          return
        }
        const cacheKey = `${latNum.toFixed(3)}:${lngNum.toFixed(3)}:${distNum.toFixed(1)}`
        const cached = hotspotCache.get(cacheKey)
        if (cached) {
          sendJson(res, 200, cached)
          return
        }
        const ebirdUrl = new URL(`${EBIRD_BASE}/ref/hotspot/geo`)
        ebirdUrl.searchParams.set('lat', lat)
        ebirdUrl.searchParams.set('lng', lng)
        ebirdUrl.searchParams.set('dist', dist)
        ebirdUrl.searchParams.set('fmt', 'json')
        try {
          const ebirdRes = await fetch(ebirdUrl.toString(), {
            headers: { 'X-eBirdApiToken': apiKey },
          })
          const data = await ebirdRes.json()
          if (!ebirdRes.ok) {
            const msg = typeof data?.message === 'string' ? data.message : 'eBird API error'
            sendJson(res, 502, { error: msg })
            return
          }
          hotspotCache.set(cacheKey, data)
          sendJson(res, 200, data)
        } catch (err) {
          const msg = err instanceof Error ? err.message : 'Failed to fetch eBird hotspots'
          sendJson(res, 502, { error: msg })
        }
      })

      server.middlewares.use('/api/birds/notable', async (req, res) => {
        if (req.method !== 'GET') {
          sendJson(res, 405, { error: 'Method not allowed' })
          return
        }
        const apiKey = process.env.EBIRD_API_KEY
        if (!apiKey?.trim()) {
          sendJson(res, 503, { error: 'eBird API key not configured. Set EBIRD_API_KEY in .env' })
          return
        }
        const url = new URL(req.url ?? '/', 'http://localhost')
        const region = url.searchParams.get('region')?.trim()
        if (!region || region.length < 2) {
          sendJson(res, 400, { error: 'region is required (e.g. US-CA, CA-ON)' })
          return
        }
        const back = url.searchParams.get('back') ?? '14'
        try {
          const ebirdUrl = new URL(`${EBIRD_BASE}/data/obs/${encodeURIComponent(region)}/recent/notable`)
          ebirdUrl.searchParams.set('back', back)
          ebirdUrl.searchParams.set('maxResults', '100')
          const ebirdRes = await fetch(ebirdUrl.toString(), {
            headers: { 'X-eBirdApiToken': apiKey },
          })
          const data = await ebirdRes.json()
          if (!ebirdRes.ok) {
            const msg = typeof data?.message === 'string' ? data.message : 'eBird API error'
            sendJson(res, ebirdRes.status === 401 ? 502 : 502, { error: msg })
            return
          }
          sendJson(res, 200, data)
        } catch (err) {
          const msg = err instanceof Error ? err.message : 'Failed to fetch notable birds from eBird'
          sendJson(res, 502, { error: msg })
        }
      })

      server.middlewares.use('/api/birds/st/rarity', async (req, res) => {
        if (req.method !== 'GET') {
          sendJson(res, 405, { error: 'Method not allowed' })
          return
        }
        const accessKey = process.env.EBIRD_ST_ACCESS_KEY?.trim()
        const url = new URL(req.url ?? '/', 'http://localhost')
        const speciesParam = url.searchParams.get('species')?.trim()
        const regionCode = url.searchParams.get('regionCode') || null
        const countryCode = url.searchParams.get('countryCode') || null
        const latParam = url.searchParams.get('lat')
        if (!speciesParam || !latParam) {
          sendJson(res, 400, { error: 'species and lat are required' })
          return
        }
        const lat = parseFloat(latParam)
        if (Number.isNaN(lat)) {
          sendJson(res, 400, { error: 'lat must be a valid number' })
          return
        }
        const speciesCodes = speciesParam.split(',').map((s) => s.trim()).filter(Boolean)
        const result: Record<string, { rarity: string; abundanceMean?: number }> = {}

        if (!accessKey) {
          for (const code of speciesCodes) {
            result[code] = {
              rarity: TYPICALLY_COMMON_SPECIES.has(code) ? 'common' : 'uncommon',
            }
          }
          sendJson(res, 200, result)
          return
        }

        const stResults: Array<{ code: string; abundanceMean: number; rangePercentOccupied?: number }> = []
        for (const code of speciesCodes) {
          try {
            const st = await fetchRarityFromStatusTrends(
              code,
              regionCode,
              countryCode,
              lat,
              accessKey
            )
            if (st) {
              stResults.push({
                code,
                abundanceMean: st.abundanceMean,
                rangePercentOccupied: st.rangePercentOccupied,
              })
            } else {
              result[code] = {
                rarity: TYPICALLY_COMMON_SPECIES.has(code) ? 'common' : 'uncommon',
              }
            }
          } catch {
            result[code] = { rarity: 'uncommon' }
          }
        }

        if (stResults.length > 0) {
          const score = (r: { abundanceMean: number; rangePercentOccupied?: number }) =>
            r.rangePercentOccupied ?? r.abundanceMean
          stResults.sort((a, b) => score(b) - score(a))
          const n = stResults.length
          const commonCut = Math.ceil(n * 0.4)
          const uncommonCut = Math.ceil(n * 0.75)
          for (let i = 0; i < n; i++) {
            const r = stResults[i]!
            const tier = i < commonCut ? 'common' : i < uncommonCut ? 'uncommon' : 'rare'
            result[r.code] = { rarity: tier, abundanceMean: r.abundanceMean }
          }
        }
        sendJson(res, 200, result)
      })

      server.middlewares.use('/api/birds/image', async (req, res) => {
        if (req.method !== 'GET') {
          sendJson(res, 405, { error: 'Method not allowed' })
          return
        }
        const url = new URL(req.url ?? '/', 'http://localhost')
        const q = url.searchParams.get('q')?.trim()
        if (!q || q.length < 2) {
          sendJson(res, 400, { error: 'q (scientific name) is required' })
          return
        }
        try {
          const inatUrl = `https://api.inaturalist.org/v1/taxa?q=${encodeURIComponent(q)}&rank=species`
          const inatRes = await fetch(inatUrl, {
            headers: { Accept: 'application/json' },
          })
          const data = (await inatRes.json()) as {
            results?: Array<{
              default_photo?: {
                medium_url?: string
                attribution?: string
                attribution_name?: string
                license_code?: string
              }
            }>
          }
          const photo = data?.results?.[0]?.default_photo
          const imageUrl = photo?.medium_url ?? null
          const attribution = photo?.attribution ?? null
          const attributionName = photo?.attribution_name ?? null
          const licenseCode = photo?.license_code ?? null
          sendJson(res, 200, { url: imageUrl, attribution, attributionName, licenseCode })
        } catch (err) {
          sendJson(res, 502, { url: null, attribution: null, attributionName: null, licenseCode: null })
        }
      })
    },
  }
}

export default defineConfig(({ mode }) => {
  Object.assign(process.env, loadEnv(mode, process.cwd(), ''))
  return {
    plugins: [react(), tailwindcss(), locationApiPlugin()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
    },
    test: {
      environment: 'jsdom',
      setupFiles: ['./src/test/setup.ts'],
      include: ['src/**/*.{test,spec}.{ts,tsx}', 'server/**/*.{test,spec}.{ts,tsx}'],
    },
  }
})
