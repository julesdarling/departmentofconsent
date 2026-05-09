
-- 1. Lock down update_play_session to the owner
CREATE OR REPLACE FUNCTION public.update_play_session(p_token text, p_patch jsonb)
 RETURNS play_sessions
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
declare
  v_row public.play_sessions;
begin
  if auth.uid() is null then
    raise exception 'authentication required';
  end if;

  update public.play_sessions
  set
    partner_handle = coalesce(p_patch->>'partner_handle', partner_handle),
    date = coalesce(p_patch->>'date', date),
    status = coalesce(p_patch->>'status', status),
    owner_side = coalesce(p_patch->'owner_side', owner_side),
    partner_side = case when p_patch ? 'partner_side' then p_patch->'partner_side' else partner_side end,
    partner_sides = case when p_patch ? 'partner_sides' then p_patch->'partner_sides' else partner_sides end,
    reflection = case when p_patch ? 'reflection' then p_patch->>'reflection' else reflection end,
    aftercare_completed = coalesce(p_patch->'aftercare_completed', aftercare_completed),
    updated_at = now()
  where share_token = p_token
    and owner_user_id = auth.uid()
  returning * into v_row;

  if v_row.id is null then
    raise exception 'session not found or not authorized';
  end if;
  return v_row;
end;
$function$;

-- 2. Lock down delete_play_session to the owner
CREATE OR REPLACE FUNCTION public.delete_play_session(p_token text)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
begin
  if auth.uid() is null then
    raise exception 'authentication required';
  end if;
  delete from public.play_sessions
   where share_token = p_token
     and owner_user_id = auth.uid();
end;
$function$;

-- 3. Restrict owner-name lookup to authenticated users
REVOKE EXECUTE ON FUNCTION public.get_session_owner_name(text) FROM anon;

-- 4. Add explicit RLS policies on play_sessions (defense-in-depth;
--    SECURITY DEFINER RPCs continue to be the canonical access path)
CREATE POLICY "Owner or joined user can view session"
  ON public.play_sessions
  FOR SELECT
  TO authenticated
  USING (
    owner_user_id = auth.uid()
    OR auth.uid() = ANY(joined_user_ids)
  );

CREATE POLICY "Owner can insert session"
  ON public.play_sessions
  FOR INSERT
  TO authenticated
  WITH CHECK (owner_user_id = auth.uid());

CREATE POLICY "Owner can update session"
  ON public.play_sessions
  FOR UPDATE
  TO authenticated
  USING (owner_user_id = auth.uid())
  WITH CHECK (owner_user_id = auth.uid());

CREATE POLICY "Owner can delete session"
  ON public.play_sessions
  FOR DELETE
  TO authenticated
  USING (owner_user_id = auth.uid());

-- 5. Remove subscriptions from the realtime publication (not used by the app
--    and broadcasts customer/subscription IDs)
ALTER PUBLICATION supabase_realtime DROP TABLE public.subscriptions;
