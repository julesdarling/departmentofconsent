import { useEffect, useState, useCallback } from "react";
import { apiGetSession, apiUpdateSession, apiAddPartnerSide } from "./sessionsApi";
import type { PlaySession, SessionSide } from "./storage";

export function useCloudSession(token: string | undefined) {
  const [session, setSession] = useState<PlaySession | null | undefined>(undefined);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    if (!token) return;
    try {
      const s = await apiGetSession(token);
      setSession(s);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Failed to load");
      setSession(null);
    }
  }, [token]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const update = useCallback(
    async (
      patch: Partial<{
        partner_handle: string;
        date: string;
        status: string;
        owner_side: SessionSide;
        partner_side: SessionSide | null;
        reflection: string | null;
        aftercare_completed: string[];
      }>
    ) => {
      if (!token) return;
      const updated = await apiUpdateSession(token, patch);
      setSession(updated);
      return updated;
    },
    [token]
  );

  const addPartner = useCallback(
    async (side: SessionSide) => {
      if (!token) return;
      const updated = await apiAddPartnerSide(token, side);
      setSession(updated);
      return updated;
    },
    [token]
  );

  return { session, error, refresh, update, addPartner } as const;
}
