# Workflow Conventions

Project preferences for planning and executing work. Reference this document when creating plans or making commits.

## GitHub Issues

- **Link all issues to the FeatherFinder App Roadmap project** when creating or updating issues.
- **Add appropriate labels** (e.g. `enhancement`, `bug`, `documentation`) to every issue.
- **Check for existing GitHub issues first** before creating new ones. Search open issues for similar scope or duplicates.
- **Update existing issues** when the latest info changes scope, acceptance criteria, or context. Keep tickets current.
- **Add to existing issues** when the work fits an open issue; avoid creating duplicates.
- **Close duplicates** when you find them — reference the canonical issue and close the duplicate.
- **Close obsolete issues** when something is no longer relevant. Add a logical closing note (e.g., "No longer needed", "Superseded by #X", "Fixed elsewhere").
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
- Format: `Brief description (#123)` or `Brief description (Closes #123)` for the final commit of a feature.
- Examples:
  - `Add BirdTag component (#20)`
  - `Fix geolocation error handling (#15)`
  - `Closes #20` (in PR merge commit or final commit)

This links commits to issues in GitHub and keeps work traceable.

## Global use

FeatherFinder is meant for **global use**. When building features that depend on seasons, climate, or geography:

- **Use lat-based hemisphere detection**: Northern (lat ≥ 0) vs Southern (lat < 0). Avoid Northern-only assumptions.
- **Seasonal logic**: Breeding, migration, and nonbreeding months differ by hemisphere. Use `location.lat` (or relevant lat) to pick the correct ranges.

## Product Principles

- **Bridge Wingspan and the real world** — FeatherFinder connects the board game Wingspan with users' local natural environment to encourage affinity for birds in their own backyard. Features should reinforce this connection and inspire curiosity about nearby wildlife.
- **Feel seamless with the current game** — The app should feel like a natural extension of Wingspan. Visual language, terminology, and interactions should align with the game so players feel at home.
- **Respect artists and authors** — Always credit and respect illustrators, designers, and creators. Apply attribution where it's due (e.g., in context docs, about screens, image captions).
- **Prefer open source** — Use open source tools, libraries, and data where possible to support indie development and community-driven projects.
