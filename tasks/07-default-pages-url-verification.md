# Task: Default Pages URL Verification

## Status

<!-- TODO | IN PROGRESS | DONE | SKIPPED -->
<!-- Detailed state here; PLAN.md checkbox is source of truth for completion -->

TODO

## Requires

- Task 06 must be complete

## Description

Verify the deployed app at the default GitHub Pages project URL before any custom-domain work. This task proves that the static frontend, Supabase auth/account creation, data flows, backend functions, and deep links work together from `https://juleshaggard.github.io/departmentofconsent/`.

## Proposed Solution

Use a fresh browser session and test each critical product flow against the deployed Pages URL. Watch browser console/network output for missing assets, root-path mistakes, failed auth redirects, or calls to old TanStack Start server endpoints.

## Subtasks

- [ ] Open `https://juleshaggard.github.io/departmentofconsent/` and confirm all assets load without console errors.
- [ ] Hard-refresh `https://juleshaggard.github.io/departmentofconsent/auth` and confirm the SPA fallback works.
- [ ] Create a fresh email/password account and confirm the email.
- [ ] Complete onboarding and save profile/kink data.
- [ ] Sign out, sign back in, and confirm saved account data loads.
- [ ] Test password reset from the deployed Pages URL.
- [ ] Test Google OAuth from the deployed Pages URL if OAuth remains enabled.
- [ ] Create a scene, share/join via token link, edit scene details, and verify Supabase persistence.
- [ ] Test aftercare and session-list pages for authenticated users.
- [ ] Test sandbox checkout, webhook-driven subscription state, and checkout return URL.
- [ ] Test promo-code redemption.
- [ ] Test account deletion with a disposable test account.
- [ ] Confirm no network request targets `https://juleshaggard.github.io/departmentofconsent/api` or old Lovable-only server routes.
- [ ] Confirm GitHub Pages settings still have no custom domain and no deployed `CNAME` file.

## Files to Modify

- `PLAN.md` - Check off completed tasks after verification passes.
- `tasks/07-default-pages-url-verification.md` - Record verification notes and any defects found.

## Verification

- [ ] Tests pass: all manual verification subtasks above pass on the default Pages URL (timeout: 30min)
- [ ] Builds without errors: latest GitHub Pages deployment is green (timeout: 10min)
- [ ] Works as expected: user confirms the default Pages deployment is ready for a later custom-domain plan.

## Notes

Do not start custom-domain work in this task. The next plan after user approval should cover `departmentofconsent.com`, DNS, Pages custom domain settings, HTTPS enforcement, Supabase redirect URL additions, OAuth redirect additions, sitemap/canonical updates, and a base-path switch from `/departmentofconsent/` to `/`.
