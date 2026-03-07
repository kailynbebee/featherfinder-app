<!-- @format -->

# Workflow Conventions

Project preferences for planning and executing work.

Related docs:

- [`docs/product/PRODUCT_UX_PRINCIPLES.md`](../product/PRODUCT_UX_PRINCIPLES.md)
- [`docs/content/COPY_GUIDELINES.md`](../content/COPY_GUIDELINES.md)
- [`docs/engineering/ACCESSIBILITY_IMPLEMENTATION_GUIDELINES.md`](../engineering/ACCESSIBILITY_IMPLEMENTATION_GUIDELINES.md)
- [`docs/product/WINGSPAN_GAME_CONTEXT.md`](../product/WINGSPAN_GAME_CONTEXT.md)

**Retrospective mindset** - After completing work or planning, reflect on what was overlooked and capture improvements in these docs.

## GitHub issues

- **Link all issues to the FeatherFinder App Roadmap project** when creating or updating issues.
- **Add appropriate labels** (for example `enhancement`, `bug`, `documentation`) to every issue.
- **Check for existing issues first** to avoid duplicates.
- **Update existing issues** when scope, criteria, or context changes.
- **Close duplicates and obsolete issues** with a clear note.
- **Close issues when work is done** using `(Closes #N)` in the final commit when possible.
- **Reconcile open issues with code periodically** to reduce stale backlog items.

### Generic issue format

- **Summary** - One or two sentences describing the problem or feature.
- **Proposed solution** (optional) - Bullet list of implementation notes.
- **Acceptance criteria** - Checkbox list of testable outcomes.
- **Additional context** - Links, edge cases, or relevant background.

## Commit messages

- **Include the related issue number** in every commit message.
- Format:
   - `Brief description (#123)` for in-progress work
   - `Brief description (Closes #123)` for final feature commits
- **Group commits logically** - Keep each commit scoped to one cohesive concern (for example UX behavior, docs IA, or test updates) instead of mixing unrelated changes.
- **Prefer `git mv` for file moves/renames** - Use `git mv` when restructuring paths so history stays readable and renames are tracked clearly when content changes are modest.

## Testing and quality

- **Storybook** - Add or update stories for changed UI.
- **pa11y** - Update checked URLs when routes/structure change; run a11y tests for UI changes. **Include pa11y in targeted validation before pushing** when UI or routes change, so CI does not fail and trigger failure notifications.
- **Vitest** - Add or update tests when behavior changes.

## Cursor plans and decision flow

- **Archive completed plans** in `~/.cursor/plans/archive/`.
- **Ignore plans for other projects**.
- **Amend the active plan by default** - When a plan already exists for the active task, update that plan instead of creating a new one unless a new plan is explicitly requested.
- **Quantify success criteria in every plan** with baseline, target, and actual when available.
- **Use `TBD` + a measurement plan** when baseline or actual is unknown.
- **When asked to explore in chat, stay in chat** unless a new plan is explicitly requested.
- **Present 2-3 options for decision points** with pros, cons, and one key strength.
- **Make a recommendation** after options analysis.
- **Use clickable selection prompts for decisions** when possible.
- **Prefer multiples of 3 for UX timing defaults** (for example 9s, 12s, 15s) unless constrained.
- **Push back with best-practice guidance when needed** - If a request conflicts with UX, accessibility, or engineering best practices, provide a concise pushback and recommend a safer alternative.

## Plans

- **Reference flow docs in every plan** - At the bottom of each plan, list which workflow/process docs apply (for example `docs/process/WORKFLOW_CONVENTIONS.md`, `docs/content/COPY_GUIDELINES.md`, `docs/engineering/ACCESSIBILITY_IMPLEMENTATION_GUIDELINES.md`).
