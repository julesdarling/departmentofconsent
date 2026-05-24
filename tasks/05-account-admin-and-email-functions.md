# Task: Account Admin and Email Functions

## Status

<!-- TODO | IN PROGRESS | DONE | SKIPPED -->
<!-- Detailed state here; PLAN.md checkbox is source of truth for completion -->

TODO

## Requires

- Task 04 must be complete

## Description

Move remaining server-only account/admin behavior out of TanStack Start so no product feature depends on a server route hosted by GitHub Pages. This includes promo-code redemption, account deletion, and the Lovable email routes currently present under `src/routes/lovable/email`.

## Proposed Solution

Create Supabase Edge Functions for promo-code redemption and account deletion, using the caller's Supabase JWT for identity and the service role only inside the function. For auth and transactional emails, either migrate the existing Lovable email webhook/queue behavior to Edge Functions or replace it with Supabase Auth SMTP/templates, then remove the old Lovable server routes from the static app.

## Subtasks

- [ ] Create `supabase/functions/redeem-promo-code` from `src/lib/promo.functions.ts`.
- [ ] Create `supabase/functions/delete-own-account` from `src/lib/account.functions.ts`.
- [ ] Verify each function authenticates the caller with a Supabase JWT and only uses the service role server-side.
- [ ] Update `src/routes/subscribe.tsx` to call `redeem-promo-code` through `supabase.functions.invoke`.
- [ ] Update `src/routes/settings.tsx` to call `delete-own-account` through `supabase.functions.invoke`.
- [ ] Decide whether Lovable email routes are still required after leaving Lovable hosting.
- [ ] If custom email handling is required, port `src/routes/lovable/email/auth/webhook.ts`, `src/routes/lovable/email/queue/process.ts`, and preview behavior to Edge Functions.
- [ ] If Supabase-native email is enough, configure Supabase Auth email templates/SMTP and remove the Lovable email server routes from the static app.

## Files to Modify

- `supabase/functions/redeem-promo-code/index.ts` - New promo-code Edge Function.
- `supabase/functions/delete-own-account/index.ts` - New account-deletion Edge Function.
- `src/routes/subscribe.tsx` - Replace `useServerFn(redeemPromoCode)`.
- `src/routes/settings.tsx` - Replace `useServerFn(deleteOwnAccount)`.
- `src/lib/promo.functions.ts` - Remove or retire the TanStack Start server function.
- `src/lib/account.functions.ts` - Remove or retire the TanStack Start server function.
- `src/routes/lovable/email/**` - Remove, retire, or port to Edge Functions.

## Verification

- [ ] Tests pass: `npm run lint` (timeout: 5min)
- [ ] Builds without errors: `npm run build:pages` (timeout: 5min)
- [ ] Works as expected: promo-code redemption updates the user's subscription state.
- [ ] Works as expected: account deletion removes the Supabase auth user and profile, then signs the browser out.
- [ ] Works as expected: signup, recovery, and any required transactional emails are delivered without GitHub Pages server routes.

## Notes

Treat `PLSDADDY` and `YESDADDY` as product/business logic and decide whether they should remain hard-coded, move to Edge Function env, or become rows in a Supabase table.
