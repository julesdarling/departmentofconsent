# Task: GitHub Actions Pages Deployment

## Status

<!-- TODO | IN PROGRESS | DONE | SKIPPED -->
<!-- Detailed state here; PLAN.md checkbox is source of truth for completion -->

TODO

## Requires

- Task 05 must be complete

## Description

Add an official GitHub Pages workflow that builds the static app and deploys it to the default Pages URL. The workflow must not configure or publish a custom domain.

## Proposed Solution

Use GitHub's Pages Actions flow with `actions/configure-pages`, `actions/upload-pages-artifact`, and `actions/deploy-pages`. Build with `npm ci` and `npm run build:pages`, pass only browser-safe Vite env values, upload the prepared static artifact directory, and rely on GitHub Pages settings with Source set to GitHub Actions.

## Subtasks

- [ ] Add `.github/workflows/deploy-pages.yml`.
- [ ] Use `contents: read`, `pages: write`, and `id-token: write` workflow permissions.
- [ ] Configure concurrency for the `github-pages` environment.
- [ ] Set browser-safe build env vars from GitHub repository variables/secrets.
- [ ] Build with `npm ci` and `npm run build:pages`.
- [ ] Upload the exact static artifact directory identified in Task 01 and prepared in Task 02.
- [ ] Confirm the artifact does not contain a `CNAME` file.
- [ ] Enable GitHub Pages source as GitHub Actions in repository settings.

## Files to Modify

- `.github/workflows/deploy-pages.yml` - New Pages deployment workflow.
- `package.json` - Ensure the workflow build script exists and is stable.

## Verification

- [ ] Tests pass: GitHub Actions lint/build job completes successfully (timeout: 10min)
- [ ] Builds without errors: GitHub Pages deployment job completes successfully (timeout: 10min)
- [ ] Works as expected: repository Environments shows a `github-pages` deployment with URL `https://julesdarling.github.io/departmentofconsent/`.
- [ ] Works as expected: GitHub Pages custom domain remains blank.

## Notes

The GitHub Pages artifact should contain only static files. Private Supabase service-role, Stripe, webhook, and email secrets belong in Supabase Edge Function secrets, not GitHub Actions build env.
