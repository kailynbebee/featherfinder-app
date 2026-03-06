# Accessibility Implementation Guidelines

Implementation-level accessibility guidance for UI engineering.

## Visually hidden semantics

- **Use `sr-only`** for labels/headings that should remain available to assistive technologies but not be visibly rendered.
- **Do not hide semantic text with tiny visual text hacks** such as `text-[1px]` with `leading-px`; these can produce anti-aliased rendering artifacts.

## Related docs

- [`docs/process/WORKFLOW_CONVENTIONS.md`](../process/WORKFLOW_CONVENTIONS.md)
- [`docs/content/COPY_GUIDELINES.md`](../content/COPY_GUIDELINES.md)
