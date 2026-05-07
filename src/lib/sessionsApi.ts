import { supabase } from "@/integrations/supabase/client";
import type { PlaySession, SessionSide } from "./storage";

type Row = {
  id: string;
  share_token: string;
  partner_handle: string;
  date: string;
  status: string;
  owner_side: unknown;
  partner_side: unknown;
  reflection: string | null;
  aftercare_completed: unknown;
  created_at: string;
  updated_at: string;
};

function rowToSession(row: Row): PlaySession {
  return {
    id: row.id,
    shareToken: row.share_token,
    partnerHandle: row.partner_handle,
    date: row.date,
    createdAt: row.created_at,
    status: row.status as PlaySession["status"],
    ownerSide: row.owner_side as SessionSide,
    partnerSide: (row.partner_side ?? undefined) as SessionSide | undefined,
    reflection: row.reflection ?? undefined,
    aftercareCompleted: (row.aftercare_completed as string[]) ?? [],
  };
}

export async function apiCreateSession(
  s: Pick<PlaySession, "shareToken" | "partnerHandle" | "date" | "status" | "ownerSide">
): Promise<PlaySession> {
  const { data, error } = await supabase.rpc("create_play_session", {
    p_share_token: s.shareToken,
    p_partner_handle: s.partnerHandle,
    p_date: s.date,
    p_status: s.status,
    p_owner_side: s.ownerSide as never,
  });
  if (error) throw error;
  return rowToSession(data as unknown as Row);
}

export async function apiGetSession(token: string): Promise<PlaySession | null> {
  const { data, error } = await supabase.rpc("get_play_session", { p_token: token });
  if (error) throw error;
  if (!data) return null;
  return rowToSession(data as unknown as Row);
}

type Patch = Partial<{
  partner_handle: string;
  date: string;
  status: string;
  owner_side: SessionSide;
  partner_side: SessionSide | null;
  reflection: string | null;
  aftercare_completed: string[];
}>;

export async function apiUpdateSession(token: string, patch: Patch): Promise<PlaySession> {
  const { data, error } = await supabase.rpc("update_play_session", {
    p_token: token,
    p_patch: patch as never,
  });
  if (error) throw error;
  return rowToSession(data as unknown as Row);
}

export async function apiDeleteSession(token: string): Promise<void> {
  const { error } = await supabase.rpc("delete_play_session", { p_token: token });
  if (error) throw error;
}
