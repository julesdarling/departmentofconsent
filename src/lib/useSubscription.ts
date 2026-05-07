import { useEffect, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { getStripeEnvironment } from "@/lib/stripe";
import { useAuth } from "@/lib/useAuth";

export function useSubscription() {
  const { user, loading: authLoading } = useAuth();
  const [checkedUserId, setCheckedUserId] = useState<string | null>(null);
  const [isActive, setIsActive] = useState(false);
  const fetchingFor = useRef<string | null>(null);

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      setIsActive(false);
      setCheckedUserId("__none__");
      return;
    }
    if (fetchingFor.current === user.id) return;
    fetchingFor.current = user.id;
    let cancelled = false;
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
      let active = false;
      if (data) {
        const end = data.current_period_end ? new Date(data.current_period_end as string).getTime() : null;
        const live = end === null || end > Date.now();
        const status = data.status as string;
        active =
          (["active", "trialing", "past_due"].includes(status) && live) ||
          (status === "canceled" && live);
      }
      setIsActive(active);
      setCheckedUserId(user.id);
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
  }, [user, authLoading]);

  // Synchronously loading when: auth still loading, OR we have a user but
  // haven't completed a fetch for THIS user id yet. Prevents the flash where
  // a freshly-authenticated user briefly looks like an unsubscribed one.
  const loading = authLoading || (!!user && checkedUserId !== user.id);

  return { isActive, loading };
}
