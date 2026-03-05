import path from 'path'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { defineConfig, loadEnv } from 'vite'
import { geocodeOne, getSuggestions, parseSuggestRequest } from './server/location/suggest'

function sendJson(res: { statusCode: number; setHeader: (name: string, value: string) => void; end: (body: string) => void }, statusCode: number, payload: unknown) {
  res.statusCode = statusCode
  res.setHeader('Content-Type', 'application/json')
  res.end(JSON.stringify(payload))
}

const EBIRD_BASE = 'https://api.ebird.org/v2'

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
