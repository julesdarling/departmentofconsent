import { useEffect } from "react";
import { useNavigate } from "@tanstack/react-router";
import { useAuth } from "@/lib/useAuth";
import { useSubscription } from "@/lib/useSubscription";
import { Layout } from "@/components/Layout";
import { Sticker } from "@/components/Sticker";

export function RequireAuth({ children, requireSubscription = true }: { children: React.ReactNode; requireSubscription?: boolean }) {
  const { user, loading } = useAuth();
  const { isActive, loading: subLoading } = useSubscription();
  const navigate = useNavigate();

  useEffect(() => {
    if (loading) return;
    if (!user) {
      navigate({ to: "/auth" });
      return;
    }
    if (requireSubscription && !subLoading && !isActive) {
      navigate({ to: "/subscribe" });
    }
  }, [loading, user, subLoading, isActive, requireSubscription, navigate]);

  if (loading || !user || (requireSubscription && (subLoading || !isActive))) {
    return (
      <Layout>
        <Sticker className="text-center">Loading…</Sticker>
      </Layout>
    );
  }
  return <>{children}</>;
}
