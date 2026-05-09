CREATE OR REPLACE FUNCTION public.get_session_owner_name(p_token text)
RETURNS text
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT p.name
  FROM public.play_sessions s
  JOIN public.profiles p ON p.user_id = s.owner_user_id
  WHERE s.share_token = p_token
  LIMIT 1;
$$;

GRANT EXECUTE ON FUNCTION public.get_session_owner_name(text) TO anon, authenticated;