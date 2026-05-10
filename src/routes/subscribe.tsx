import { WhipLoader } from "@/components/WhipLoader";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Layout } from "@/components/Layout";
import { Sticker } from "@/components/Sticker";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useEffect, useState } from "react";
import { useAuth } from "@/lib/useAuth";
import { useSubscription } from "@/lib/useSubscription";
import { PricingCard } from "@/components/PricingCard";
import { StripeEmbeddedCheckout } from "@/components/StripeEmbeddedCheckout";
import { PaymentTestModeBanner } from "@/components/PaymentTestModeBanner";
import { useServerFn } from "@tanstack/react-start";
import { redeemPromoCode } from "@/lib/promo.functions";
import { getStripeEnvironment } from "@/lib/stripe";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/subscribe")({
  head: () => ({ meta: [{ title: "Subscribe — Department of Consent" }] }),
  component: SubscribePage,
});

function SubscribePage() {
  const { user, loading } = useAuth();
  const { isActive, loading: subLoading } = useSubscription();
  const navigate = useNavigate();
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [promoCode, setPromoCode] = useState("");
  const [redeeming, setRedeeming] = useState(false);
  const redeemFn = useServerFn(redeemPromoCode);

  useEffect(() => {
    if (!loading && !user) navigate({ to: "/auth" });
  }, [loading, user, navigate]);

  useEffect(() => {
    if (isActive) navigate({ to: "/onboarding" });
  }, [isActive, navigate]);

  const handleRedeem = async () => {
    if (!promoCode.trim()) {
      toast.error("Enter a promo code");
      return;
    }
    setRedeeming(true);
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const accessToken = sessionData.session?.access_token;
      if (!accessToken) throw new Error("Please sign in again");
      const result = await redeemFn({
        data: { code: promoCode, environment: getStripeEnvironment(), accessToken },
      });
      const days = result?.daysGranted ?? 30;
      toast.success(`Promo code applied — ${days} days unlocked!`);
      setPromoCode("");
      navigate({ to: "/onboarding" });
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Could not redeem code");
    } finally {
      setRedeeming(false);
    }
  };

  if (loading || subLoading || !user) {
    return <Layout><div className="flex items-center justify-center min-h-[60vh]"><WhipLoader /></div></Layout>;
  }

  return (
    <Layout>
      <PaymentTestModeBanner />
      <div className="space-y-5">
        <div className="text-center pt-2">
          <h1 className="font-display text-4xl text-plum tracking-tight">Become a member</h1>
          <p className="text-sm text-muted-foreground mt-2">
            Membership keeps the app online and ad-free.
          </p>
        </div>

        {!checkoutOpen ? (
          <Button size="lg" className="w-full" onClick={() => setCheckoutOpen(true)}>
            Subscribe — $9/mo
          </Button>
        ) : (
          <Sticker className="p-2">
            <StripeEmbeddedCheckout
              priceId="doc_pro_monthly"
              userId={user.id}
              customerEmail={user.email}
              returnUrl={`${window.location.origin}/checkout/return?session_id={CHECKOUT_SESSION_ID}`}
            />
          </Sticker>
        )}

        <Sticker className="space-y-3">
          <div className="space-y-1.5">
            <Label className="doc-label">Have a promo code?</Label>
            <Input
              type="text"
              value={promoCode}
              onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
              placeholder="Enter code"
              autoCapitalize="characters"
              autoComplete="off"
              maxLength={64}
            />
          </div>
          <div className="flex justify-center">
            <Button variant="outline" onClick={handleRedeem} disabled={redeeming}>
              {redeeming ? "Redeeming…" : "Redeem code"}
            </Button>
          </div>
          <p className="text-xs text-muted-foreground text-center">
            Valid codes unlock the app for a limited time.
          </p>
        </Sticker>

        <PricingCard />
      </div>
    </Layout>
  );
}

