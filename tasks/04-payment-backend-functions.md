# Task: Payment Backend Functions

## Status

<!-- TODO | IN PROGRESS | DONE | SKIPPED -->
<!-- Detailed state here; PLAN.md checkbox is source of truth for completion -->

TODO

## Requires

- Task 03 must be complete

## Description

Move Stripe checkout-session creation and subscription webhook handling out of TanStack Start server routes so the frontend can be hosted on GitHub Pages. These flows require private Stripe and Supabase service-role secrets, so they must run in a backend runtime.

## Proposed Solution

Create Supabase Edge Functions for `create-checkout-session` and `payments-webhook`, porting the logic from the current server functions and webhook route. Store Stripe and Supabase service-role secrets in Supabase, update the frontend to call the Edge Function with the user's Supabase JWT, and configure Stripe webhooks to point to the Edge Function URL instead of a GitHub Pages route.

## Subtasks

- [ ] Create `supabase/functions/create-checkout-session` with the current checkout-session behavior from `src/utils/payments.functions.ts`.
- [ ] Create `supabase/functions/payments-webhook` with the current subscription upsert/update/cancel behavior from `src/routes/api/public/payments/webhook.ts`.
- [ ] Port webhook signature verification without relying on Node-only APIs that are unavailable in Supabase Edge Functions.
- [ ] Store `STRIPE_SANDBOX_API_KEY`, `STRIPE_LIVE_API_KEY`, `PAYMENTS_SANDBOX_WEBHOOK_SECRET`, `PAYMENTS_LIVE_WEBHOOK_SECRET`, and `SUPABASE_SERVICE_ROLE_KEY` as Supabase Edge Function secrets.
- [ ] Update `src/components/StripeEmbeddedCheckout.tsx` to fetch the checkout client secret from the new Edge Function.
- [ ] Update Stripe webhook endpoint URLs to the Supabase Edge Function URL for sandbox first, then live after verification.
- [ ] Remove or exclude the old TanStack Start payment server route and server function from the static build.

## Files to Modify

- `supabase/functions/create-checkout-session/index.ts` - New checkout-session Edge Function.
- `supabase/functions/payments-webhook/index.ts` - New Stripe webhook Edge Function.
- `src/components/StripeEmbeddedCheckout.tsx` - Call the Edge Function instead of `createServerFn`.
- `src/utils/payments.functions.ts` - Remove or retire the TanStack Start server function.
- `src/routes/api/public/payments/webhook.ts` - Remove or retire the TanStack Start server route.
- `src/lib/stripe.server.ts` - Move reusable server logic into Edge Function code or delete if obsolete.

## Verification

- [ ] Tests pass: `npm run lint` (timeout: 5min)
- [ ] Builds without errors: `npm run build:pages` (timeout: 5min)
- [ ] Works as expected: sandbox checkout opens, returns to `/departmentofconsent/checkout/return`, and does not call a GitHub Pages `/api` URL.
- [ ] Works as expected: a sandbox Stripe webhook updates the `subscriptions` row in Supabase.
- [ ] Works as expected: subscription status reads correctly in the app after webhook processing.

## Notes

Prefer direct Stripe API keys in the Edge Function instead of the current Lovable connector gateway unless there is an explicit reason to keep that dependency. GitHub Pages must never receive Stripe secret keys or webhook secrets.
