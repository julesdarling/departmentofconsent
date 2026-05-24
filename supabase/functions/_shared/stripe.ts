import { HttpError } from "./http.ts";
import { requiredEnv } from "./supabase.ts";

export type StripeEnv = "sandbox" | "live";

export function parseStripeEnv(value: unknown): StripeEnv {
  if (value === "sandbox" || value === "live") return value;
  throw new HttpError(400, "Invalid Stripe environment");
}

function stripeSecretKey(env: StripeEnv): string {
  return env === "sandbox"
    ? requiredEnv("STRIPE_SANDBOX_API_KEY")
    : requiredEnv("STRIPE_LIVE_API_KEY");
}

export function stripeWebhookSecret(env: StripeEnv): string {
  return env === "sandbox"
    ? requiredEnv("PAYMENTS_SANDBOX_WEBHOOK_SECRET", "STRIPE_SANDBOX_WEBHOOK_SECRET")
    : requiredEnv("PAYMENTS_LIVE_WEBHOOK_SECRET", "STRIPE_LIVE_WEBHOOK_SECRET");
}

export async function stripeRequest<T>(
  env: StripeEnv,
  path: string,
  init: RequestInit = {},
): Promise<T> {
  const headers = new Headers(init.headers);
  headers.set("Authorization", `Bearer ${stripeSecretKey(env)}`);
  headers.set("Stripe-Version", "2026-03-25.dahlia");
  if (init.body) headers.set("content-type", "application/x-www-form-urlencoded");

  const response = await fetch(`https://api.stripe.com/v1${path}`, {
    ...init,
    headers,
  });

  const payload = await response.json().catch(() => null);
  if (!response.ok) {
    const message =
      payload?.error?.message || payload?.message || `Stripe request failed: ${response.status}`;
    throw new HttpError(response.status, message);
  }

  return payload as T;
}
