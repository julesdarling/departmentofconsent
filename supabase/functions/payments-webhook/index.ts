import { errorResponse, jsonResponse, optionsResponse } from "../_shared/http.ts";
import { createAdminClient } from "../_shared/supabase.ts";
import { parseStripeEnv, stripeWebhookSecret, type StripeEnv } from "../_shared/stripe.ts";

type StripeEvent = {
  type: string;
  data: { object: StripeSubscription };
};

type StripeSubscription = {
  id?: string;
  customer?: string;
  status?: string;
  metadata?: { userId?: string };
  items?: {
    data?: Array<{
      current_period_start?: number;
      current_period_end?: number;
      price?: {
        id?: string;
        product?: string;
        metadata?: { lovable_external_id?: string };
      };
    }>;
  };
  current_period_start?: number;
  current_period_end?: number;
  cancel_at_period_end?: boolean;
};

function toHex(buffer: ArrayBuffer): string {
  return [...new Uint8Array(buffer)].map((byte) => byte.toString(16).padStart(2, "0")).join("");
}

async function verifyWebhook(req: Request, env: StripeEnv): Promise<StripeEvent> {
  const signature = req.headers.get("stripe-signature");
  const body = await req.text();
  if (!signature || !body) throw new Error("Missing signature or body");

  let timestamp: string | undefined;
  const signatures: string[] = [];
  for (const part of signature.split(",")) {
    const [key, value] = part.split("=", 2);
    if (key === "t") timestamp = value;
    if (key === "v1" && value) signatures.push(value);
  }

  if (!timestamp || signatures.length === 0) throw new Error("Invalid signature format");
  if (Math.abs(Date.now() / 1000 - Number(timestamp)) > 300) {
    throw new Error("Webhook timestamp too old");
  }

  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(stripeWebhookSecret(env)),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const digest = await crypto.subtle.sign(
    "HMAC",
    key,
    new TextEncoder().encode(`${timestamp}.${body}`),
  );

  if (!signatures.includes(toHex(digest))) throw new Error("Invalid webhook signature");
  return JSON.parse(body) as StripeEvent;
}

function subscriptionPeriod(subscription: StripeSubscription) {
  const item = subscription.items?.data?.[0];
  return {
    item,
    priceId: item?.price?.metadata?.lovable_external_id || item?.price?.id,
    productId: item?.price?.product,
    periodStart: item?.current_period_start ?? subscription.current_period_start,
    periodEnd: item?.current_period_end ?? subscription.current_period_end,
  };
}

async function handleSubscriptionCreated(subscription: StripeSubscription, env: StripeEnv) {
  const userId = subscription.metadata?.userId;
  if (!userId || !subscription.id) {
    console.error("No userId in subscription metadata");
    return;
  }

  const { priceId, productId, periodStart, periodEnd } = subscriptionPeriod(subscription);
  const supabase = createAdminClient();

  await supabase.from("subscriptions").upsert(
    {
      user_id: userId,
      stripe_subscription_id: subscription.id,
      stripe_customer_id: subscription.customer,
      product_id: productId,
      price_id: priceId,
      status: subscription.status,
      current_period_start: periodStart ? new Date(periodStart * 1000).toISOString() : null,
      current_period_end: periodEnd ? new Date(periodEnd * 1000).toISOString() : null,
      environment: env,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "stripe_subscription_id" },
  );
}

async function handleSubscriptionUpdated(subscription: StripeSubscription, env: StripeEnv) {
  if (!subscription.id) return;
  const { priceId, productId, periodStart, periodEnd } = subscriptionPeriod(subscription);
  const supabase = createAdminClient();

  await supabase
    .from("subscriptions")
    .update({
      status: subscription.status,
      product_id: productId,
      price_id: priceId,
      current_period_start: periodStart ? new Date(periodStart * 1000).toISOString() : null,
      current_period_end: periodEnd ? new Date(periodEnd * 1000).toISOString() : null,
      cancel_at_period_end: subscription.cancel_at_period_end || false,
      updated_at: new Date().toISOString(),
    })
    .eq("stripe_subscription_id", subscription.id)
    .eq("environment", env);
}

async function handleSubscriptionDeleted(subscription: StripeSubscription, env: StripeEnv) {
  if (!subscription.id) return;
  await createAdminClient()
    .from("subscriptions")
    .update({ status: "canceled", updated_at: new Date().toISOString() })
    .eq("stripe_subscription_id", subscription.id)
    .eq("environment", env);
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return optionsResponse();
  if (req.method !== "POST") return jsonResponse({ error: "Method not allowed" }, 405);

  const rawEnv = new URL(req.url).searchParams.get("env");
  if (rawEnv !== "sandbox" && rawEnv !== "live") {
    return jsonResponse({ received: true, ignored: "invalid env" });
  }

  try {
    const env = parseStripeEnv(rawEnv);
    const event = await verifyWebhook(req, env);
    switch (event.type) {
      case "customer.subscription.created":
        await handleSubscriptionCreated(event.data.object, env);
        break;
      case "customer.subscription.updated":
        await handleSubscriptionUpdated(event.data.object, env);
        break;
      case "customer.subscription.deleted":
        await handleSubscriptionDeleted(event.data.object, env);
        break;
      default:
        console.log("Unhandled event:", event.type);
    }
    return jsonResponse({ received: true });
  } catch (error) {
    return errorResponse(error);
  }
});
