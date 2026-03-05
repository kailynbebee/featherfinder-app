# Workflow Conventions

Project preferences for planning and executing work. Reference this document when creating plans or making commits.

**Retrospective mindset** — After completing work or planning, reflect: What did we overlook? What would we do differently next time? What patterns or checks should we codify so we don't repeat the same oversight? Capture those insights and update this doc or our plans when they emerge.

## GitHub Issues

- **Link all issues to the FeatherFinder App Roadmap project** when creating or updating issues.
- **Add appropriate labels** (e.g. `enhancement`, `bug`, `documentation`) to every issue.
- **Check for existing GitHub issues first** before creating new ones. Search open issues for similar scope or duplicates.
- **Update existing issues** when the latest info changes scope, acceptance criteria, or context. Keep tickets current.
- **Add to existing issues** when the work fits an open issue; avoid creating duplicates.
- **Close duplicates** when you find them — reference the canonical issue and close the duplicate.
- **Close obsolete issues** when something is no longer relevant. Add a logical closing note (e.g., "No longer needed", "Superseded by #X", "Fixed elsewhere").
- **Close issues when work is done** — Use `(Closes #N)` in the final commit of a feature so GitHub auto-closes the issue when pushed. If you forgot, close manually and add a brief note linking to the implementing commit(s).
- **Periodically reconcile open issues with the codebase** — Before releases or when catching up, review open issues and close any that are already implemented. Avoids orphaned issues and keeps the backlog accurate.
- **Create new issues** only when no suitable existing issue exists. Break large features into discrete, trackable issues.
- **Link related issues** when they are distinct but related (e.g., "Relates to #X", "Blocks #Y"). This keeps the workflow informed and makes dependencies visible.
- Use issues to document scope, acceptance criteria, and context.

### Generic issue format

When creating or updating GitHub issues, use this structure. Refine it over time as patterns improve.

- **Summary** – One or two sentences describing the problem or feature.
- **Proposed solution** (optional) – Bullet list of approach or implementation notes.
- **Acceptance criteria** – Checkbox list of testable outcomes (e.g., `- [ ] Users can X`).
- **Additional context** – Links, edge cases, or background that helps future readers.

## Commit Messages

- **Include the relevant GitHub issue number** in every commit message.
- Format: `Brief description (#123)` for work-in-progress commits; `Brief description (Closes #123)` for the **final commit** of a feature. Using `Closes` auto-closes the issue when pushed to the default branch.
- Examples:
  - `Add BirdTag component (#20)` — links to issue
  - `Add BirdTag component (Closes #20)` — links and auto-closes when merged
  - `Fix geolocation error handling (#15)`
- **Prefer `(Closes #N)` on the last commit** of a feature so the issue closes automatically and the paper trail is explicit. If you forget, amend the commit message before pushing, or close the issue manually.

## Testing and Quality

- **Storybook** — Add stories for new components. When changing UI that existing stories depict (e.g. layout, header content), update those stories too. Use `npm run storybook` to verify.
- **pa11y** — When adding routes or changing page structure, add or update URLs in `.pa11yci.json` and `.pa11yci.dev.json`. Run `npm run test:a11y` before committing UI changes that affect accessibility.
- **Vitest** — Update or add unit/integration tests when behavior changes.

## Cursor Plans

- **Archive completed plans** — When a plan's work is done (implemented, superseded, or obsolete), move it to `~/.cursor/plans/archive/`. Keeps the active plans folder focused on work in progress.
- **Ignore plans for other projects** — Leave plans for different projects (e.g. Super Beats) in place; do not archive them.

## Global use

FeatherFinder is meant for **global use**. When building features that depend on seasons, climate, or geography:

- **Use lat-based hemisphere detection**: Northern (lat ≥ 0) vs Southern (lat < 0). Avoid Northern-only assumptions.
- **Seasonal logic**: Breeding, migration, and nonbreeding months differ by hemisphere. Use `location.lat` (or relevant lat) to pick the correct ranges.

## Product Principles

- **Bridge Wingspan and the real world** — FeatherFinder connects the board game Wingspan with users' local natural environment to encourage affinity for birds in their own backyard. Features should reinforce this connection and inspire curiosity about nearby wildlife.
- **Feel seamless with the current game** — The app should feel like a natural extension of Wingspan. Visual language, terminology, and interactions should align with the game so players feel at home.
- **Respect artists and authors** — Always credit and respect illustrators, designers, and creators. Apply attribution where it's due (e.g., in context docs, about screens, image captions).
- **Prefer open source** — Use open source tools, libraries, and data where possible to support indie development and community-driven projects.
