# Plan: Host Department of Consent on GitHub Pages

## Problem

The app is currently a TanStack Start/Lovable full-stack project, but GitHub Pages only hosts static files. The frontend can be published to GitHub Pages, but the current server routes and server functions for payments, promo codes, account deletion, webhooks, and Lovable email handlers cannot run there. The move must preserve account creation and the rest of the product while leaving the custom domain disconnected until the default Pages deployment has been verified.

## Solution

Publish the browser app to the default GitHub Pages project URL, `https://juleshaggard.github.io/departmentofconsent/`, using a GitHub Actions Pages workflow. Configure the Vite/TanStack build for a repository subpath, add SPA/deep-link fallback behavior, and make auth/payment return URLs base-path aware so `/departmentofconsent/...` is used during verification.

Keep Supabase as the product backend for auth, account data, profiles, sessions, and RLS-protected RPCs. Move all secret-bearing server work out of TanStack Start server routes and into Supabase Edge Functions, then update the frontend to call those functions. Do not add a `CNAME` file or configure a GitHub Pages custom domain in this plan.

## Tasks

<!-- Tasks are numbered in execution order. Each task depends on all previous tasks being complete. -->

- [ ] [01-static-inventory-and-secret-hygiene](tasks/01-static-inventory-and-secret-hygiene.md) - Confirm build output, runtime dependencies, and env-file safety before deployment changes.
- [ ] [02-pages-base-routing-and-static-build](tasks/02-pages-base-routing-and-static-build.md) - Configure the app to build and route correctly from `/departmentofconsent/`.
- [ ] [03-supabase-auth-and-account-creation](tasks/03-supabase-auth-and-account-creation.md) - Preserve email/password signup, password reset, and OAuth on the GitHub Pages URL.
- [ ] [04-payment-backend-functions](tasks/04-payment-backend-functions.md) - Move Stripe checkout and webhook logic to deployable backend functions.
- [ ] [05-account-admin-and-email-functions](tasks/05-account-admin-and-email-functions.md) - Move promo codes, account deletion, and email-hook behavior off GitHub Pages.
- [ ] [06-github-actions-pages-deployment](tasks/06-github-actions-pages-deployment.md) - Add a GitHub Actions workflow that deploys the static artifact to Pages.
- [ ] [07-default-pages-url-verification](tasks/07-default-pages-url-verification.md) - Verify the deployed default Pages URL before any custom-domain work.

## Dependencies

- GitHub repository admin access to enable GitHub Pages with GitHub Actions as the source.
- Supabase project access to configure Auth URLs, OAuth providers, database migrations, Edge Functions, and Edge Function secrets.
- Stripe sandbox/live access to configure checkout keys and webhook endpoints after the backend-function migration.
- GitHub Actions variables/secrets for browser-safe build values such as `VITE_SUPABASE_URL`, `VITE_SUPABASE_PUBLISHABLE_KEY`, `VITE_SUPABASE_PROJECT_ID`, and `VITE_PAYMENTS_CLIENT_TOKEN`. Values built into the frontend must be safe to expose.
- Supabase Edge Function secrets for private values such as `SUPABASE_SERVICE_ROLE_KEY`, Stripe secret keys, Stripe webhook secrets, and any email provider or Lovable API keys still required.

## Notes

- Expected verification URL: `https://juleshaggard.github.io/departmentofconsent/`.
- No custom domain should be configured yet: do not create `public/CNAME`, do not upload a `CNAME` artifact, and leave GitHub Pages custom domain settings blank until the user verifies the default Pages URL.
- Current server-only surfaces that GitHub Pages cannot host include `src/routes/api/public/payments/webhook.ts`, `src/routes/lovable/email/**`, `src/utils/payments.functions.ts`, `src/lib/promo.functions.ts`, and `src/lib/account.functions.ts`.
- Direct Supabase client features such as account creation, signin, profile storage, session RPCs, and realtime subscriptions can keep working from GitHub Pages when Supabase Auth redirect URLs and RLS policies are configured correctly.
- Build the base path through an env/config switch so a later custom-domain cutover can change the base from `/departmentofconsent/` to `/` with minimal code churn.
- Reference docs used for the plan: [GitHub Pages custom workflows](https://docs.github.com/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages), [Vite static deploy guide for GitHub Pages](https://vite.dev/guide/static-deploy.html#github-pages), and [TanStack Start static prerendering](https://tanstack.com/start/latest/docs/framework/react/guide/static-prerendering).
