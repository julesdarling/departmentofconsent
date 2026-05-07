import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { getStripeEnvironment } from "@/lib/stripe";
import { useAuth } from "@/lib/useAuth";

export function useSubscription() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [isActive, setIsActive] = useState(false);

  useEffect(() => {
    if (!user) {
      setIsActive(false);
      setLoading(false);
      return;
    }
    let cancelled = false;
    setLoading(true);
    const fetchSub = async () => {
      const { data } = await supabase
        .from("subscriptions")
        .select("*")
        .eq("user_id", user.id)
        .eq("environment", getStripeEnvironment())
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();
      if (cancelled) return;
      if (data) {
        const end = data.current_period_end ? new Date(data.current_period_end as string).getTime() : null;
        const live = end === null || end > Date.now();
        const status = data.status as string;
        setIsActive(
          (["active", "trialing", "past_due"].includes(status) && live) ||
            (status === "canceled" && live)
        );
      } else {
        setIsActive(false);
      }
      setLoading(false);
    };
    fetchSub();
    const channel = supabase
      .channel(`sub-${user.id}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "subscriptions", filter: `user_id=eq.${user.id}` },
        () => fetchSub()
      )
      .subscribe();
    return () => {
      cancelled = true;
      supabase.removeChannel(channel);
    };
  }, [user]);

  return { isActive, loading };
}
