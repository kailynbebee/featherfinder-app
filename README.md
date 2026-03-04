# FeatherFinder App

A birding companion app that bridges the board game Wingspan and your local environment. Discover which birds from the game live near you, track which ones you've seen and played, and grow your love of nature.

Built with React, Vite, Tailwind CSS, and (planned) Supabase and eBird API.

## Getting Started

```bash
npm install
npm run dev
```

## Features

- **Welcome screen** — Enter your zip code or use geolocation to discover birds near you
- **Location flow** — Zip validation (5-digit US) and browser geolocation with error handling

## Testing

```bash
npm run test       # Watch mode
npm run test:run   # Single run
```

## Project Structure

- `src/components/welcome/` — Welcome screen (zip input, Discover birds near you)
- `src/assets/images/birds/` — Bird photos for future feather SVG hero
- `src/assets/feather-masks/` — Feather mask SVGs for future animation
