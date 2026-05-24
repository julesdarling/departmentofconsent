import {
  errorResponse,
  HttpError,
  jsonResponse,
  optionsResponse,
  readJson,
} from "../_shared/http.ts";
import { requireUser } from "../_shared/supabase.ts";
import { parseStripeEnv, stripeRequest } from "../_shared/stripe.ts";

type CheckoutBody = {
  priceId?: unknown;
  quantity?: unknown;
  customerEmail?: unknown;
  userId?: unknown;
  returnUrl?: unknown;
  environment?: unknown;
};

type StripePrice = {
  id: string;
  type: "one_time" | "recurring";
  product?: string;
};

type StripeList<T> = {
  data: T[];
};

type StripeCheckoutSession = {
  client_secret?: string | null;
};

function assertPriceId(value: unknown): string {
  if (typeof value !== "string" || !/^[a-zA-Z0-9_-]+$/.test(value)) {
    throw new HttpError(400, "Invalid priceId");
  }
  return value;
}

function assertReturnUrl(value: unknown): string {
  if (typeof value !== "string" || !/^https?:\/\//.test(value)) {
    throw new HttpError(400, "Invalid returnUrl");
  }
  return value;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return optionsResponse();
  if (req.method !== "POST") return jsonResponse({ error: "Method not allowed" }, 405);

  try {
    const { user } = await requireUser(req);
    const body = await readJson<CheckoutBody>(req);
    const environment = parseStripeEnv(body.environment);
    const priceId = assertPriceId(body.priceId);
    const returnUrl = assertReturnUrl(body.returnUrl);
    const quantity = typeof body.quantity === "number" && body.quantity > 0 ? body.quantity : 1;

    if (typeof body.userId === "string" && body.userId !== user.id) {
      throw new HttpError(403, "Cannot create checkout for another user");
    }

    const prices = await stripeRequest<StripeList<StripePrice>>(
      environment,
      `/prices?${new URLSearchParams([["lookup_keys[]", priceId]]).toString()}`,
      { method: "GET" },
    );
    const stripePrice = prices.data[0];
    if (!stripePrice) throw new HttpError(404, "Price not found");

    const params = new URLSearchParams();
    params.set("line_items[0][price]", stripePrice.id);
    params.set("line_items[0][quantity]", String(quantity));
    params.set("mode", stripePrice.type === "recurring" ? "subscription" : "payment");
    params.set("ui_mode", "embedded_page");
    params.set("return_url", returnUrl);
    params.set("metadata[userId]", user.id);

    if (typeof body.customerEmail === "string" && body.customerEmail.includes("@")) {
      params.set("customer_email", body.customerEmail);
    } else if (user.email) {
      params.set("customer_email", user.email);
    }

    if (stripePrice.type === "recurring") {
      params.set("subscription_data[metadata][userId]", user.id);
    }

    const session = await stripeRequest<StripeCheckoutSession>(environment, "/checkout/sessions", {
      method: "POST",
      body: params,
    });

    if (!session.client_secret) throw new HttpError(502, "Stripe did not return a client secret");
    return jsonResponse({ clientSecret: session.client_secret });
  } catch (error) {
    return errorResponse(error);
  }
});
