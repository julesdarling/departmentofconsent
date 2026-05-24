import {
  errorResponse,
  HttpError,
  jsonResponse,
  optionsResponse,
  readJson,
} from "../_shared/http.ts";
import { createAdminClient, requireUser } from "../_shared/supabase.ts";
import { parseStripeEnv } from "../_shared/stripe.ts";

type RedeemBody = {
  code?: unknown;
  environment?: unknown;
};

const FALLBACK_CODES: Record<string, { days: number }> = {
  PLSDADDY: { days: 30 },
  YESDADDY: { days: 30 },
};

function promoCodes() {
  const configured = Deno.env.get("PROMO_CODES_JSON");
  if (!configured) return FALLBACK_CODES;
  try {
    return JSON.parse(configured) as Record<string, { days: number }>;
  } catch {
    console.error("PROMO_CODES_JSON is invalid; using fallback codes");
    return FALLBACK_CODES;
  }
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return optionsResponse();
  if (req.method !== "POST") return jsonResponse({ error: "Method not allowed" }, 405);

  try {
    const { user } = await requireUser(req);
    const body = await readJson<RedeemBody>(req);
    const environment = parseStripeEnv(body.environment);
    if (typeof body.code !== "string" || body.code.length > 64) {
      throw new HttpError(400, "Invalid code");
    }

    const code = body.code.trim().toUpperCase();
    const promo = promoCodes()[code];
    if (!promo) throw new HttpError(400, "Invalid promo code");

    const supabase = createAdminClient();
    const { data: existing } = await supabase
      .from("subscriptions")
      .select("*")
      .eq("user_id", user.id)
      .eq("environment", environment)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    const now = Date.now();
    const baseEnd =
      existing?.current_period_end && new Date(existing.current_period_end).getTime() > now
        ? new Date(existing.current_period_end).getTime()
        : now;
    const newEnd = new Date(baseEnd + promo.days * 24 * 60 * 60 * 1000).toISOString();
    const startIso = new Date(now).toISOString();

    const { error } = await supabase.from("subscriptions").insert({
      user_id: user.id,
      stripe_subscription_id: `promo_${code}_${user.id}_${now}`,
      stripe_customer_id: `promo_customer_${user.id}`,
      product_id: "promo",
      price_id: `promo_${code.toLowerCase()}`,
      status: "active",
      current_period_start: startIso,
      current_period_end: newEnd,
      cancel_at_period_end: true,
      environment,
    });

    if (error) throw new Error(error.message);
    return jsonResponse({ ok: true, daysGranted: promo.days, currentPeriodEnd: newEnd });
  } catch (error) {
    return errorResponse(error);
  }
});
