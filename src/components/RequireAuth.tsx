import { useEffect } from "react";
import { useNavigate } from "@tanstack/react-router";
import { useAuth } from "@/lib/useAuth";
import { Layout } from "@/components/Layout";
import { Sticker } from "@/components/Sticker";

export function RequireAuth({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !user) {
      navigate({ to: "/auth" });
    }
  }, [loading, user, navigate]);

  if (loading || !user) {
    return (
      <Layout>
        <Sticker className="text-center">Loading…</Sticker>
      </Layout>
    );
  }
  return <>{children}</>;
}
