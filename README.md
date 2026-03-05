# FeatherFinder App

A birding companion app that bridges the board game Wingspan and your local environment. Discover which birds from the game live near you, track which ones you've seen and played, and grow your love of nature.

Built with React, Vite, Tailwind CSS, Leaflet + OpenStreetMap, and (planned) Supabase and eBird API.

**Language:** English only for now; internationalization (i18n) and additional languages are planned for the future.

**eBird integration:** Nearby birds are fetched from the [eBird API](https://ebird.org/api). Copy `.env.example` to `.env` and add your API key from [ebird.org/api/keygen](https://ebird.org/api/keygen). Without it, the birds page will show an error.

## Getting Started

```bash
npm install
npm run dev
```

## Features

- **Welcome screen** — Enter your zip code or use geolocation to discover birds near you
- **Location flow** — Zip validation (5-digit US) and browser geolocation with error handling
- **Nearby birds results** — Loading/error/empty/success states with real eBird observations
- **Responsive results shell** — Desktop split list/map layout and mobile Map/List modes
- **Filter controls** — Distance, species group, recent sightings, and sort order
- **Map/list sync** — Selecting a bird in the list or map keeps selection state aligned

## Testing

```bash
npm run test       # Watch mode
npm run test:run   # Single run
```

## Project Structure

- `src/components/welcome/` — Welcome screen (zip input, Discover birds near you)
- `src/components/birds/` — Results page shell, list cards, and map UI
- `src/services/nearbyBirds.ts` — Fetches nearby birds from eBird API via `/api/birds/nearby` proxy
- `src/assets/images/birds/` — Bird photos for future feather SVG hero
- `src/assets/feather-masks/` — Feather mask SVGs for future animation
