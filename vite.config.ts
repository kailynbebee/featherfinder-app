import path from 'path'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { geocodeOne, getSuggestions, parseSuggestRequest } from './server/location/suggest'

function sendJson(res: { statusCode: number; setHeader: (name: string, value: string) => void; end: (body: string) => void }, statusCode: number, payload: unknown) {
  res.statusCode = statusCode
  res.setHeader('Content-Type', 'application/json')
  res.end(JSON.stringify(payload))
}

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
    },
  }
}

export default {
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
