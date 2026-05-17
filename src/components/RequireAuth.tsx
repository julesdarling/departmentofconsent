import { useEffect } from "react";
import { useNavigate } from "@tanstack/react-router";
import { useAuth } from "@/lib/useAuth";
import { useSubscription } from "@/lib/useSubscription";
import { Layout } from "@/components/Layout";
import { WhipLoader } from "@/components/WhipLoader";

export function RequireAuth({ children, requireSubscription = false }: { children: React.ReactNode; requireSubscription?: boolean }) {
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
        <div className="flex items-center justify-center min-h-[70vh]"><WhipLoader /></div>
      </Layout>
    );
  }
  return <>{children}</>;
}
