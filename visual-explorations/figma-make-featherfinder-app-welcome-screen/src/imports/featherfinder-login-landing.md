FeatherFinder — Login/Landing Screen

OVERVIEW

Design a mobile login/landing screen for a birding companion app called FeatherFinder. The app helps users discover which birds from the board game Wingspan have been recently spotted near their location. The visual identity is inspired by the Royal Flycatcher and evokes a naturalist's field journal — layered, tactile, warm, and organic. The aesthetic bridges real bird photography with flat, graphical SVG feather elements.

All color values, font sizes, weights, spacing, and assets (including feather SVGs, bird photography, and clipping masks) are available in the dynamic frame layers. Defer to those values rather than this text description wherever possible.


SCREEN LAYOUT (Top to Bottom)

Top Navigation Bar
- Top left: A circular outlined info icon in teal. Opens an about/explainer overlay or bottom sheet describing what FeatherFinder is.
- Top right: "Log in" text in teal with a small login/door icon to its right. Navigates to a login/signup flow.
- Both elements float over the hero image area — no solid header background.

Hero Section (~65–70% of the screen)
- The centerpiece is a real photograph of a Tropical Royal Flycatcher — a small bird with a dramatic fanned coral-orange crest, pale olive-yellow body, and slightly open beak, facing the viewer nearly head-on.
- The bird photo is framed by layered SVG feather shapes at varying depths and angles, creating a collage-like composition. These are feathers, not leaves — the SVGs and their masks are included in the frame layers.
- The feathers use variations of teal (not sage, olive, or other hues). The most prominent feather is the one in the foreground. Some feathers have a darker teal polka dot pattern for texture.
- Each feather has a slight drop shadow to add dimension to the otherwise flat, graphical style.
- Behind the featured bird, additional bird photography is visible but has an 80% opacity color overlay to soften it and keep visual focus on the active/featured bird in front.
- The font used throughout is Kodchasan (Google Font, Latin writing system). Specific sizes, weights, and spacing values are in the frame.

Bird Name Label
- Below the bird photo, left-aligned: "Tropical Royal Flycatcher" in dark charcoal, Kodchasan.

Carousel Indicator
- Centered below the bird name: 3 dots representing a timed carousel.
- The active dot is a wider pill shape with a loading/progress state — it fills over a set duration, then the carousel auto-advances to the next featured bird. Users can also swipe manually to move through the carousel.
- The 3 carousel slides each feature a bird from a different Wingspan game habitat: forest, grassland, and wetland. Each slide has its own bird photo and feather arrangement.

Bottom Content Area
- The background transitions from the warm khaki tones of the hero area to a soft warm cream toward the bottom of the screen.

Search Input Field
- A large, rounded-corner input field spanning nearly the full width.
- Placeholder text: "Search by zip code" in a slightly transparent brown (value in frame).
- A teal magnifying glass/search icon inside the field on the right.
- The field has a very soft drop shadow to lift it off the background.
- This is the manual location entry path.

CTA Link
- Centered below the search field: "Discover birds near you" as an underlined text link in teal.
- This triggers browser geolocation for automatic location detection — the alternative to manual zip code entry.


ANIMATION

The feather SVGs should have a subtle, ambient animation. Inspiration: in the digital Wingspan video games, the bird illustrations have gentle, puppet-like movement — they aren't static, but the motion is soft and organic, like a slight breathing or rustling. The feathers on this screen should move in a similar spirit: gentle drifting, slight rotation, or a soft floating quality. Not bouncy or mechanical — more like they're resting in a light breeze. This animation should be continuous and subtle enough to feel alive without distracting from the bird photo or the UI elements.


DESIGN PRINCIPLES

- Layered and tactile: The feather SVGs and overlapping shapes should feel like a collage or a page from a naturalist's journal. Depth comes from layering and the slight drop shadows on feathers.
- Flat graphical style with dimension: The feathers are flat/illustrated SVGs, but the drop shadows and layering give the composition a sense of physical depth.
- Photography meets illustration: The real bird photo is the anchor of reality; the feather SVGs are the decorative/illustrative layer. The two styles coexist.
- Warm and inviting: Earthy, approachable palette. Nothing clinical or cold.
- Mobile-first: Designed for a phone screen. All tap targets generously sized.
- Coral/red-orange is NOT used on this screen. It is reserved exclusively for data visualization (bird sighting density heatmaps) on other screens.


INTERACTION SUMMARY

- Carousel: Timed auto-advancement with swipe gesture override. 3 slides, one per Wingspan habitat (forest, grassland, wetland).
- "Search by zip code": Manual location entry.
- "Discover birds near you": Triggers browser geolocation for automatic location detection.
- "Log in": Navigates to login/signup flow (not yet designed).
- Info icon: Opens about/explainer overlay or bottom sheet.