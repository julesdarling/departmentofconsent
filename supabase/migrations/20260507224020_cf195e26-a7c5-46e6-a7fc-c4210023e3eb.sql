-- Add support for multiple partners on a play session
ALTER TABLE public.play_sessions
  ADD COLUMN IF NOT EXISTS partner_sides jsonb NOT NULL DEFAULT '[]'::jsonb;

-- RPC: append a partner side to the session (anyone with the share token can use it)
CREATE OR REPLACE FUNCTION public.add_partner_side(p_token text, p_side jsonb)
RETURNS public.play_sessions
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
declare
  v_row public.play_sessions;
begin
  update public.play_sessions
  set partner_sides = coalesce(partner_sides, '[]'::jsonb) || jsonb_build_array(p_side),
      status = case when status in ('completed') then status else 'agreed' end,
      updated_at = now()
  where share_token = p_token
  returning * into v_row;

  if v_row.id is null then
    raise exception 'session not found';
  end if;
  return v_row;
end;
$function$;

-- Update update_play_session to also handle partner_sides patch
CREATE OR REPLACE FUNCTION public.update_play_session(p_token text, p_patch jsonb)
 RETURNS play_sessions
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
declare
  v_row public.play_sessions;
begin
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
  returning * into v_row;

  if v_row.id is null then
    raise exception 'session not found';
  end if;
  return v_row;
end;
$function$;