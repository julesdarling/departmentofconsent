# Task: Static Inventory and Secret Hygiene

## Status

<!-- TODO | IN PROGRESS | DONE | SKIPPED -->
<!-- Detailed state here; PLAN.md checkbox is source of truth for completion -->

TODO

## Requires

- None

## Description

Confirm exactly how the cloned app builds today, which output directory is publishable, and which runtime behaviors require a server. Also audit committed environment files before wiring GitHub Actions so private values are not exposed in the repository or static bundle.

## Proposed Solution

Install dependencies with the repository lockfile, run the current lint/build commands, and record whether TanStack Start emits a static client artifact under `dist/client`, `dist`, or another folder. Review `.env`, `.env.development`, and `.env.production` by key name only, replace committed env files with a safe `.env.example` if needed, and confirm `.gitignore` prevents future private env commits.

## Subtasks

- [ ] Run `npm ci` and note the Node.js version required by the current dependency set.
- [ ] Run `npm run lint` and record any pre-existing issues that must be fixed before deployment.
- [ ] Run `npm run build` and identify the actual static client output directory.
- [ ] Confirm whether the build emits server artifacts that are not suitable for GitHub Pages.
- [ ] Audit env files without printing secret values; keep only browser-safe example values in the repo.
- [ ] Inventory every `server` route and `createServerFn` call that must be migrated or removed before static hosting.

## Files to Modify

- `.env` - Remove from version control if it contains real project values.
- `.env.development` - Remove from version control if it contains real project values.
- `.env.production` - Remove from version control if it contains real project values.
- `.env.example` - Add documented placeholder keys for local and GitHub Actions setup.
- `.gitignore` - Ensure local env files stay untracked.

## Verification

- [ ] Tests pass: `npm run lint` (timeout: 5min)
- [ ] Builds without errors: `npm run build` (timeout: 5min)
- [ ] Works as expected: no private env value is committed or required in the GitHub Pages artifact.

## Notes

Do not paste env values into logs, commits, PR descriptions, or task notes. Vite `VITE_` variables are public after build, so only publishable keys and client tokens belong there.
