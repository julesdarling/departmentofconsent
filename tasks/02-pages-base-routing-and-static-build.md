# Task: Pages Base Routing and Static Build

## Status

<!-- TODO | IN PROGRESS | DONE | SKIPPED -->
<!-- Detailed state here; PLAN.md checkbox is source of truth for completion -->

TODO

## Requires

- Task 01 must be complete

## Description

Make the app load correctly from the GitHub Pages project subpath `/departmentofconsent/`. This covers bundled asset URLs, TanStack Router navigation, direct deep links, auth return URLs, static metadata, and the Pages 404 fallback.

## Proposed Solution

Add a Pages-specific build mode or env variable that sets Vite's base path to `/departmentofconsent/` while preserving `/` for local development and the later custom-domain cutover. Configure TanStack Router with the same base path, add a small URL helper for app-relative redirects, replace hard-coded root hrefs where needed, and add a post-build step that prepares the correct static artifact including `404.html`.

## Subtasks

- [ ] Add a `build:pages` script that builds with the GitHub Pages base path.
- [ ] Configure `vite.config.ts` so Pages builds use `/departmentofconsent/` and local builds use `/`.
- [ ] Configure `src/router.tsx` with the matching TanStack Router `basepath`.
- [ ] Add an app URL helper for redirects and return URLs that respects `import.meta.env.BASE_URL`.
- [ ] Update hard-coded app URLs in auth, checkout return URLs, root links, structured data, sitemap generation, and metadata.
- [ ] Replace the server `sitemap.xml` route with a static generated sitemap or a build-time generated file.
- [ ] Add a post-build artifact preparation script that copies the built `index.html` to `404.html` for GitHub Pages SPA fallback.
- [ ] Verify direct visits to nested routes such as `/departmentofconsent/auth`, `/departmentofconsent/reset-password`, and `/departmentofconsent/join/test-token`.

## Files to Modify

- `package.json` - Add `build:pages` and any artifact preparation scripts.
- `vite.config.ts` - Add Pages base-path/static build configuration.
- `src/router.tsx` - Add TanStack Router basepath.
- `src/lib/app-url.ts` - Add helper for Pages-aware absolute and relative app URLs.
- `src/routes/__root.tsx` - Update static metadata/root hrefs to respect the deployment URL.
- `src/routes/sitemap[.]xml.ts` - Remove or replace with a static sitemap generation path.
- `public/404.html` or `scripts/prepare-pages-artifact.mjs` - Add GitHub Pages fallback support.

## Verification

- [ ] Tests pass: `npm run lint` (timeout: 5min)
- [ ] Builds without errors: `npm run build:pages` (timeout: 5min)
- [ ] Works as expected: local preview of the Pages artifact works from `/departmentofconsent/` and hard-refreshing nested routes loads the app.

## Notes

Keep the base path configurable. When the custom domain is intentionally connected later, the same setup should be able to switch to `/` without rewriting route code.
