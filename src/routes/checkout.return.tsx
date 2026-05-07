import { createFileRoute } from "@tanstack/react-router";
import { Layout } from "@/components/Layout";
import { Sticker } from "@/components/Sticker";
import { CloudButton } from "@/components/CloudButton";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { getStripeEnvironment } from "@/lib/stripe";
import { useAuth } from "@/lib/useAuth";
import heartIcon from "@/assets/icon-heart-harness.png";

export const Route = createFileRoute("/checkout/return")({
  validateSearch: (search: Record<string, unknown>): { session_id?: string } => ({
    session_id: typeof search.session_id === "string" ? search.session_id : undefined,
  }),
  head: () => ({ meta: [{ title: "Welcome ♡" }] }),
  component: CheckoutReturn,
});

function CheckoutReturn() {
  const { session_id } = Route.useSearch();
  const { user, loading } = useAuth();
  const [syncing, setSyncing] = useState(true);
  const [synced, setSynced] = useState(false);

  useEffect(() => {
    if (loading || !user) return;
    let cancelled = false;
    let attempts = 0;
    const MAX = 20;
    const env = getStripeEnvironment();

    const poll = async () => {
      while (!cancelled && attempts < MAX) {
        attempts++;
        const { data } = await supabase
          .from("subscriptions")
          .select("status,current_period_end")
          .eq("user_id", user.id)
          .eq("environment", env)
          .order("created_at", { ascending: false })
          .limit(1)
          .maybeSingle();
        if (data) {
          const end = data.current_period_end ? new Date(data.current_period_end as string).getTime() : null;
          const live = end === null || end > Date.now();
          if (["active", "trialing", "past_due"].includes(data.status as string) && live) {
            if (!cancelled) {
              setSynced(true);
              setSyncing(false);
            }
            return;
          }
        }
        await new Promise((r) => setTimeout(r, 1500));
      }
      if (!cancelled) setSyncing(false);
    };
    poll();
    return () => { cancelled = true; };
  }, [user, loading]);

  return (
    <Layout>
      <div className="space-y-5">
        <Sticker variant="coral" className="text-center space-y-3">
          <img src={heartIcon} alt="" className="h-20 w-20 mx-auto" />
          <h1 className="font-display text-3xl text-plum">You're in.</h1>
          <p className="text-sm text-muted-foreground">
            {syncing
              ? "Confirming your subscription…"
              : synced
                ? (session_id ? "Subscription confirmed." : "Welcome aboard.")
                : "Subscription is taking longer than expected. Please refresh in a moment."}
          </p>
          <div className="pt-2 flex justify-center">
            <CloudButton to="/onboarding">{syncing ? "Just a sec…" : "Add new scene"}</CloudButton>
          </div>
        </Sticker>
      </div>
    </Layout>
  );
}
