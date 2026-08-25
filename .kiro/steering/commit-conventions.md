# Commit Conventions & Semantic Versioning

This project uses **semantic-release** with the conventional-commits preset. The commit message (which, for squash-merged PRs, is the **PR title**) determines the next version. Always choose the commit type deliberately.

## How the type maps to the version bump

Given a current version `MAJOR.MINOR.PATCH`:

| Commit type | Example | Release |
| --- | --- | --- |
| `fix:` | `fix: correct ledger balance rounding` | **patch** (x.y.Z+1) |
| `perf:` | `perf: memoize ledger balance selector` | **patch** |
| `feat:` | `feat: add ledger entry bulk remove` | **minor** (x.Y+1.0) |
| `feat!:` / `fix!:` / any `!` | `feat!: change transaction API response shape` | **major** (X+1.0.0) |
| `BREAKING CHANGE:` footer | (see below) | **major** |
| `docs:` `chore:` `style:` `refactor:` `test:` `ci:` `build:` `revert:` | `chore: bump deps` | **no release** |

Note: `refactor:` and `style:` do NOT trigger a release under the default preset. If a refactor changes user-facing behavior, it is really a `fix:` or `feat:`.

> **Note:** semantic-release uses the `conventionalcommits` preset (configured in `.releaserc.json`), so the `!` marker (e.g. `feat!:`, `fix(scope)!:`) triggers a **major** release on its own. The `BREAKING CHANGE:` footer is still supported and recommended for describing the migration.

## Breaking changes — how to flag

A breaking change bumps the **major** version. Signal it in EITHER (preferably both) of these ways:

1. Add `!` after the type/scope: `feat!: ...` or `feat(ledger)!: ...`
2. Add a footer:
   ```
   BREAKING CHANGE: <what broke and how to migrate>
   ```

## What counts as a breaking change in THIS repo (frontend)

Treat as breaking (major) when a change would break users, their stored data, or the contract with the backend/other consumers:

- **Persisted local data / IndexedDB schema**: a change to the IndexedDB store shape or a DB version bump that drops/renames stores or fields and is not backward-compatible (existing users' offline data would break or be lost).
- **Public route changes**: removing or renaming an existing route path that users may have bookmarked.
- **Shared type/contract changes** that other code or the backend relies on in an incompatible way (e.g., renaming a field the API expects).
- **Removing or renaming a user-facing feature/flow** people depend on.

NOT breaking (these are `feat`/`fix`/etc. without `!`):

- Adding a new screen, component, tab, or optional field.
- Internal refactors, styling, or state-management changes with no user-visible or data-format impact.
- Additive IndexedDB migrations that preserve existing data.

## How Kiro should decide the commit message

When asked to commit, Kiro will:

1. Review the actual diff.
2. Pick the single most significant conventional type for the change (`feat` if any user-facing capability was added; `fix` if it corrects a bug; otherwise the fitting non-releasing type).
3. Assess breaking-change criteria above. If met, use `!` AND include a `BREAKING CHANGE:` footer describing the migration.
4. Use an imperative, lowercase subject (the PR-title lint requires lowercase subject start).
5. Remember: for squash-merged PRs the **PR title** is what semantic-release analyzes — so the same rules apply to the PR title, not just local commits.

## Examples

- `feat(ledger): add multi-select bulk remove for ledger entries` → minor
- `fix(ledger): show linked transaction date instead of link date` → patch
- `feat(ledger)!: replace settlement flow with linked repayment transactions` + `BREAKING CHANGE: the SettlementDialog and isSettlement field were removed; settlements are now normal linked transactions` → major
- `chore(ci): standardize workflows on node 22` → no release
