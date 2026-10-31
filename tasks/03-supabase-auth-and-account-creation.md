# Task: Supabase Auth and Account Creation

## Status

<!-- TODO | IN PROGRESS | DONE | SKIPPED -->
<!-- Detailed state here; PLAN.md checkbox is source of truth for completion -->

TODO

## Requires

- Task 02 must be complete

## Description

Ensure account creation, email confirmation, signin, password reset, session persistence, and OAuth work on the default GitHub Pages URL. The current email/password flow is already Supabase-based, but its redirect URLs assume origin-root hosting and the Google OAuth path goes through Lovable Cloud auth.

## Proposed Solution

Update auth redirects to use the Pages-aware URL helper, then replace the Lovable-specific Google auth wrapper with direct Supabase OAuth or confirm that the Lovable wrapper supports the GitHub Pages origin. Configure Supabase Auth Site URL and Additional Redirect URLs for the default Pages URL before testing account creation.

## Subtasks

- [ ] Change signup `emailRedirectTo` to `https://julesdarling.github.io/departmentofconsent/onboarding` during Pages verification.
- [ ] Change password reset `redirectTo` to `https://julesdarling.github.io/departmentofconsent/reset-password` during Pages verification.
- [ ] Replace `lovable.auth.signInWithOAuth("google")` with `supabase.auth.signInWithOAuth({ provider: "google", options: { redirectTo } })`, unless Lovable Cloud auth is intentionally retained and verified on the Pages origin.
- [ ] Configure Supabase Auth Site URL as `https://julesdarling.github.io/departmentofconsent/` for verification.
- [ ] Add Supabase Auth redirect allow-list entries for `/departmentofconsent/onboarding`, `/departmentofconsent/reset-password`, and any OAuth callback return path the app uses.
- [ ] Confirm the profile creation trigger and RLS policies still allow newly created users to save onboarding data.
- [ ] Confirm local development still works with localhost redirect URLs after the Pages changes.

## Files to Modify

- `src/routes/auth.tsx` - Update signup, reset, and OAuth redirects.
- `src/integrations/lovable/index.ts` - Remove, bypass, or isolate Lovable-specific auth behavior.
- `src/integrations/supabase/client.ts` - Keep client-side Supabase auth storage and env usage browser-safe.
- `supabase/config.toml` - Update local auth redirect defaults if the project uses local Supabase testing.

## Verification

- [ ] Tests pass: `npm run lint` (timeout: 5min)
- [ ] Builds without errors: `npm run build:pages` (timeout: 5min)
- [ ] Works as expected: create a fresh email/password account, confirm the email, land on onboarding, save profile data, sign out, and sign back in.
- [ ] Works as expected: password reset email returns to `/departmentofconsent/reset-password`.
- [ ] Works as expected: Google signin returns to `/departmentofconsent/onboarding` or the intended signed-in route.

## Notes

Do not connect the custom domain during this task. When the custom domain is approved later, add a second set of Supabase redirect URLs rather than replacing the verified GitHub Pages URLs immediately.
