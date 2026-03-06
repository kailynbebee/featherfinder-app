# Wingspan Game Context

Reusable reference for FeatherFinder product decisions. Wingspan bridges the board game with the real world; this doc keeps game details accurate for feature work.

## Game Overview

- **Designer**: Elizabeth Hargrave
- **Publisher**: Stonemaier Games
- **Core loop**: Competitive, medium-weight, card-driven, engine-building board game. Players attract birds to wildlife preserves (forest, grassland, wetland) by spending food and eggs; birds score victory points and trigger powers.

## Illustrators (Credit Where Due)

- **Base game**: Natalia Rojas, Ana María Martínez Jaramillo
- **European Expansion**: (document when sourced)
- **Oceania Expansion**: Natalia Rojas, Ana María Martínez Jaramillo
- **Asia Expansion**: Natalia Rojas, Ana María Martínez Jaramillo
- **Americas Expansion**: Natalia Rojas, Ana Maria Martinez Jaramillo, Martha Clare

## Expansions and Bird Counts

| Expansion | Region | Notes |
|-----------|--------|-------|
| Base | North America | Core set |
| European Expansion | Europe | |
| Oceania Expansion | Oceania | |
| Asia | Asia | Standalone or expansion |
| Americas Expansion | North, Central, South America, Caribbean | Released Jan 2026. 111 new birds, 40 hummingbird cards. |

## Bird Attributes (Future Features)

- **Habitat**: Forest, Grassland, Wetland
- **Nest type**: Platform, Cavity, Ground, Bowl, etc.
- **Wingspan**: In cm (card art)
- **Victory points**: 0-10
- **Food cost**: Invertebrate, seed, fish, fruit, rodent, nectar

## Data Sources for Updates

- **Community spreadsheets**: [BoardGameGeek](https://boardgamegeek.com/filepage/193164/wingspan-spreadsheet-bird-cards-bonus-cards-end-of), [Google Sheets](https://docs.google.com/spreadsheets/d/1G8w-iSmqmXbF1pCmzsBT6GkxwwEb4vZ9L30bO-6_Z8A/edit)
- **R package**: `wingspan` (coolbutuseless) - scientific names, base + Europe + Oceania. [GitHub](https://github.com/coolbutuseless/wingspan)
- **Stonemaier**: Official announcements for new expansions

## Matching Strategy

eBird species codes (our canonical IDs) map to Wingspan birds via:

1. **Scientific name** (primary) - most reliable
2. **Normalized common name** - fallback when scientific names differ slightly

## Adding New Expansion Birds

1. Get bird list (common + scientific names) from Stonemaier/community
2. Run `scripts/update-wingspan-birds.ts` against eBird taxonomy
3. Merge output into `src/data/wingspanBirds.ts`
4. Update "Last updated" comment and expansion metadata
