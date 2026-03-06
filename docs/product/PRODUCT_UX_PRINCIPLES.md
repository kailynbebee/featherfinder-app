# Product and UX Principles

Product-facing principles and UX inspiration sources for FeatherFinder.

Related docs:
- [`docs/product/WINGSPAN_GAME_CONTEXT.md`](WINGSPAN_GAME_CONTEXT.md)
- [`docs/content/COPY_GUIDELINES.md`](../content/COPY_GUIDELINES.md)

## Product principles

- **Bridge Wingspan and the real world** - Connect the game to users' local environment and encourage curiosity about nearby birds.
- **Feel seamless with the current game** - Align visual language, terminology, and interactions with Wingspan expectations.
- **Respect artists and authors** - Credit illustrators, designers, and creators where applicable.
- **Prefer open source** - Use open source tools, libraries, and data where possible.
- **Follow established UX best practices** - Apply Laws of UX and growth.design guidance for discovery, onboarding, and conversion moments.
- **Reference game context docs when shaping Wingspan-facing UX** - Use [`docs/product/WINGSPAN_GAME_CONTEXT.md`](WINGSPAN_GAME_CONTEXT.md) as the canonical game reference.

## Design and UX inspiration

Apps and resources we reference for location search, map/list layouts, and discovery UX:

- **Airbnb** - Location integrated into editable search bars; consistent search-first layouts.
- **AllTrails** - Location in URL params; recent searches in dropdowns; map + list split patterns.
- **Zillow** - Map-area search visualization patterns (boundary draw deferred/out of scope).
- **Nielsen Norman Group** - Search suggestions, labeling, and clarity patterns.
- **Algolia** - Search placement and mobile search best practices.
- **Pencil and Paper** - Search UX patterns and placeholder clarity.
- **Baymard Institute** - Travel/accommodation discovery and split-view results guidance.
- **Laws of UX** - Cognitive-load and interaction heuristics.
- **growth.design** - Behavioral UX patterns for onboarding and motivation.

## Global-use principles

FeatherFinder is built for global use:

- **Use lat-based hemisphere detection**: Northern (lat >= 0) vs Southern (lat < 0).
- **Seasonal logic must be hemisphere-aware** for breeding, migration, and nonbreeding periods.
