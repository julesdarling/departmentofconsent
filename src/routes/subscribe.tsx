import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Layout } from "@/components/Layout";
import { Sticker } from "@/components/Sticker";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { useAuth } from "@/lib/useAuth";
import { useSubscription } from "@/lib/useSubscription";
import { PricingCard } from "@/components/PricingCard";
import { StripeEmbeddedCheckout } from "@/components/StripeEmbeddedCheckout";
import { PaymentTestModeBanner } from "@/components/PaymentTestModeBanner";

export const Route = createFileRoute("/subscribe")({
  head: () => ({ meta: [{ title: "Subscribe — Department of Consent" }] }),
  component: SubscribePage,
});

function SubscribePage() {
  const { user, loading } = useAuth();
  const { isActive, loading: subLoading } = useSubscription();
  const navigate = useNavigate();
  const [checkoutOpen, setCheckoutOpen] = useState(false);

  useEffect(() => {
    if (!loading && !user) navigate({ to: "/auth" });
  }, [loading, user, navigate]);

  useEffect(() => {
    if (isActive) navigate({ to: "/onboarding" });
  }, [isActive, navigate]);

  if (loading || subLoading || !user) {
    return <Layout><Sticker className="text-center">Loading…</Sticker></Layout>;
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
          <div className="flex justify-center">
            <Button size="lg" onClick={() => setCheckoutOpen(true)}>
              Subscribe — $9/mo
            </Button>
          </div>
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

        <PricingCard />
      </div>
    </Layout>
  );
}
