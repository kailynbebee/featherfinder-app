# Copy and Editorial Guidelines

Editorial preferences for FeatherFinder. Use "found" language to clarify that counts reflect what the app retrieved, not the total in the wild.

Related docs:
- [`docs/process/WORKFLOW_CONVENTIONS.md`](../process/WORKFLOW_CONVENTIONS.md)
- [`docs/product/PRODUCT_UX_PRINCIPLES.md`](../product/PRODUCT_UX_PRINCIPLES.md)
- [`docs/engineering/ACCESSIBILITY_IMPLEMENTATION_GUIDELINES.md`](../engineering/ACCESSIBILITY_IMPLEMENTATION_GUIDELINES.md)

## Bird counts

- **Use:** "X birds found in this area" (or "100+ birds found in this area" at API cap)
- **Avoid:** "X birds nearby" — suggests the count of actual birds in the area
- **Rationale:** Specifies that the number is what the app found/retrieved, not a claim about total birds in the region

## Home geolocation CTA

- **Use:** "Discover Wingspan birds near you"
- **Avoid:** Extra explanatory sentence below the CTA unless required for a specific UX issue
- **Rationale:** Keeps the home screen concise while reinforcing Wingspan familiarity in the primary action
- **Use (error recovery):** "No worries — try again, or enter a location."
- **Use (denied state):** "Location access was denied. Let's try something else — enter a location instead."
- **Use (loading prompt):** "Look for the location prompt in your browser. If you don't see it, enter a location while we keep trying (15s)."
- **Avoid (error recovery):** Repeating multiple retry sentences or naming specific CTA text inside fallback error messages
- **Avoid (tone):** Repeating "no worries" across multiple nearby messages; reserve it for one key recovery touchpoint
- **Rationale (error recovery):** Keep recovery copy short, action-oriented, and resilient to CTA text changes

## Voice and pronouns

- **Use "you"** to speak directly to the user
- **Use "we"** when referring to FeatherFinder/app actions
- **Use "us"** for guided actions the user does with app support
- **Prefer American English** (for example "canceled", not "cancelled")
- **Use proper dash punctuation**: hyphen (`-`) for compounds, en dash (`–`) for numeric ranges, em dash (`—`) for parenthetical breaks in UI copy

## Reference resources

- Microsoft Writing Style Guide: <https://learn.microsoft.com/en-us/style-guide/welcome/>
- The Chicago Manual of Style (18th ed.) contents: <https://www.chicagomanualofstyle.org/book/ed18/frontmatter/toc.html>
