import { createServerFn } from "@tanstack/react-start";
import { createClient } from "@supabase/supabase-js";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

const VALID_CODES: Record<string, { days: number }> = {
  PLSDADDY: { days: 30 },
};

export const redeemPromoCode = createServerFn({ method: "POST" })
  .inputValidator(
    (data: { code: string; environment: "sandbox" | "live"; accessToken: string }) => {
      if (typeof data.code !== "string" || data.code.length > 64) throw new Error("Invalid code");
      if (data.environment !== "sandbox" && data.environment !== "live") throw new Error("Invalid environment");
      if (typeof data.accessToken !== "string" || !data.accessToken) throw new Error("Not authenticated");
      return data;
    },
  )
  .handler(async ({ data }) => {
    // Verify the access token server-side using the publishable key client.
    const SUPABASE_URL = process.env.SUPABASE_URL!;
    const SUPABASE_PUBLISHABLE_KEY = process.env.SUPABASE_PUBLISHABLE_KEY!;
    const verifier = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
    const { data: claims, error: claimsError } = await verifier.auth.getClaims(data.accessToken);
    if (claimsError || !claims?.claims?.sub) {
      throw new Error("Not authenticated");
    }
    const userId = claims.claims.sub as string;

    const code = data.code.trim().toUpperCase();
    const promo = VALID_CODES[code];
    if (!promo) throw new Error("Invalid promo code");

    const { data: existing } = await supabaseAdmin
      .from("subscriptions")
      .select("*")
      .eq("user_id", userId)
      .eq("environment", data.environment)
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
    const promoSubId = `promo_${code}_${userId}_${now}`;

    const { error } = await supabaseAdmin.from("subscriptions").insert({
      user_id: userId,
      stripe_subscription_id: promoSubId,
      stripe_customer_id: `promo_customer_${userId}`,
      product_id: "promo",
      price_id: `promo_${code.toLowerCase()}`,
      status: "active",
      current_period_start: startIso,
      current_period_end: newEnd,
      cancel_at_period_end: true,
      environment: data.environment,
    });
    if (error) throw new Error(error.message);

    return { ok: true, daysGranted: promo.days, currentPeriodEnd: newEnd };
  });
