
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS kinks_library jsonb NOT NULL DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS kink_ratings jsonb NOT NULL DEFAULT '{}'::jsonb;

ALTER TABLE public.play_sessions
  ADD COLUMN IF NOT EXISTS owner_user_id uuid,
  ADD COLUMN IF NOT EXISTS joined_user_ids uuid[] NOT NULL DEFAULT '{}'::uuid[];

CREATE INDEX IF NOT EXISTS idx_play_sessions_owner ON public.play_sessions(owner_user_id);
CREATE INDEX IF NOT EXISTS idx_play_sessions_joined ON public.play_sessions USING GIN(joined_user_ids);

CREATE OR REPLACE FUNCTION public.create_play_session(p_share_token text, p_partner_handle text, p_date text, p_status text, p_owner_side jsonb)
 RETURNS play_sessions
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
declare
  v_row public.play_sessions;
begin
  if p_share_token is null or length(p_share_token) < 12 then
    raise exception 'invalid share token';
  end if;

  insert into public.play_sessions (share_token, partner_handle, date, status, owner_side, owner_user_id)
  values (p_share_token, coalesce(p_partner_handle, ''), coalesce(p_date, ''), coalesce(p_status, 'draft'), coalesce(p_owner_side, '{}'::jsonb), auth.uid())
  returning * into v_row;

  return v_row;
end;
$function$;

CREATE OR REPLACE FUNCTION public.add_partner_side(p_token text, p_side jsonb)
 RETURNS play_sessions
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
declare
  v_row public.play_sessions;
  v_uid uuid := auth.uid();
begin
  update public.play_sessions
  set partner_sides = coalesce(partner_sides, '[]'::jsonb) || jsonb_build_array(p_side),
      status = case when status in ('completed') then status else 'agreed' end,
      joined_user_ids = case
        when v_uid is not null and not (v_uid = any(joined_user_ids))
        then array_append(joined_user_ids, v_uid)
        else joined_user_ids
      end,
      updated_at = now()
  where share_token = p_token
  returning * into v_row;

  if v_row.id is null then
    raise exception 'session not found';
  end if;
  return v_row;
end;
$function$;

CREATE OR REPLACE FUNCTION public.list_my_play_sessions()
 RETURNS SETOF play_sessions
 LANGUAGE sql
 STABLE
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  select * from public.play_sessions
  where auth.uid() is not null
    and (owner_user_id = auth.uid() or auth.uid() = any(joined_user_ids))
  order by created_at desc;
$function$;
