
-- play_sessions: one row per shared session, accessed only by random share_token
create table public.play_sessions (
  id uuid primary key default gen_random_uuid(),
  share_token text not null unique,
  partner_handle text not null default '',
  date text not null default '',
  status text not null default 'draft',
  owner_side jsonb not null default '{}'::jsonb,
  partner_side jsonb,
  reflection text,
  aftercare_completed jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index play_sessions_share_token_idx on public.play_sessions(share_token);

alter table public.play_sessions enable row level security;

-- Deny all direct access. All reads/writes go through SECURITY DEFINER RPCs below.
-- (No policies = no rows accessible directly.)

-- Token-gated RPCs ------------------------------------------------------------

create or replace function public.create_play_session(
  p_share_token text,
  p_partner_handle text,
  p_date text,
  p_status text,
  p_owner_side jsonb
)
returns public.play_sessions
language plpgsql
security definer
set search_path = public
as $$
declare
  v_row public.play_sessions;
begin
  if p_share_token is null or length(p_share_token) < 12 then
    raise exception 'invalid share token';
  end if;

  insert into public.play_sessions (share_token, partner_handle, date, status, owner_side)
  values (p_share_token, coalesce(p_partner_handle, ''), coalesce(p_date, ''), coalesce(p_status, 'draft'), coalesce(p_owner_side, '{}'::jsonb))
  returning * into v_row;

  return v_row;
end;
$$;

create or replace function public.get_play_session(p_token text)
returns public.play_sessions
language sql
security definer
set search_path = public
stable
as $$
  select * from public.play_sessions where share_token = p_token limit 1;
$$;

create or replace function public.update_play_session(
  p_token text,
  p_patch jsonb
)
returns public.play_sessions
language plpgsql
security definer
set search_path = public
as $$
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
$$;

create or replace function public.delete_play_session(p_token text)
returns void
language sql
security definer
set search_path = public
as $$
  delete from public.play_sessions where share_token = p_token;
$$;

-- Allow anonymous + authenticated callers to invoke the RPCs
grant execute on function public.create_play_session(text, text, text, text, jsonb) to anon, authenticated;
grant execute on function public.get_play_session(text) to anon, authenticated;
grant execute on function public.update_play_session(text, jsonb) to anon, authenticated;
grant execute on function public.delete_play_session(text) to anon, authenticated;
