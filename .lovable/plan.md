## What's broken

Sessions are currently stored only in your phone's browser (localStorage). When you send the link or QR to a partner, their phone has no copy of the session, so the join page shows "Session not found." It will only ever work if your partner opens the link on the same device that created it — which defeats the purpose.

## Fix: put sessions in Lovable Cloud

Enable Lovable Cloud (our managed backend) so sessions live server-side and can be opened from any device. Profiles, kinks library, and ratings stay on-device — only the shared session payload goes to the server, gated by the random share token in the URL.

### Data model (single table)

`play_sessions`
- `id` (uuid, pk)
- `share_token` (text, unique, indexed) — what's in the URL
- `partner_handle`, `date`, `status`
- `owner_side` (jsonb) — full SessionSide
- `partner_side` (jsonb, nullable)
- `reflection` (text, nullable)
- `aftercare_completed` (jsonb, default `[]`)
- `created_at`, `updated_at`

Anonymous-first: no auth required. RLS policies allow:
- `select` / `update` only when the request supplies the matching `share_token` (via a SECURITY DEFINER function `get_session_by_token(token)` and `update_partner_side(token, side)` / `update_owner_side(token, side)` RPCs). The table itself denies direct row access.
- `insert` is open (creating a draft session); the inserter receives the token back.

This way, only people holding the link can read or write a session.

### App changes

- `src/lib/storage.ts` — keep local hooks for `profile`, `kinks`, `ratings`. Replace `useSessions` with cloud-backed hooks:
  - `useSessionsList()` — pulls the list of session IDs/tokens this device created (kept locally, so "My sessions" still works without an account).
  - `useSession(idOrToken)` — fetches/subscribes to one session from the server.
  - `createSession`, `updateOwnerSide`, `updatePartnerSide`, `saveReflection`, `toggleAftercareItem`, `deleteSession`.
- `src/routes/sessions.new.tsx` — on save, insert into the server, store `{id, shareToken}` in the local list.
- `src/routes/sessions.$sessionId.index.tsx` — load from server by id; live-refresh so the host sees the partner's side appear.
- `src/routes/join.$token.tsx` — load by token from server (works on any device); submit writes `partner_side`.
- `src/routes/sessions.index.tsx` — list local entries, fetch each by id for status/date display.
- `src/routes/sessions.$sessionId.aftercare.tsx` and `scene.tsx` — read from server-backed hook.

### Privacy & safety notes

- The share token is the only key. It's 16 random characters from nanoid (~95 bits of entropy) — not enumerable.
- Sessions are not tied to a user account; deleting locally also deletes server-side via the token.
- We do not log or analyze session content.
- Add a "Delete from server" action that purges the row.

### Alternative considered

Encode the entire session in the URL itself (no backend). Rejected because: (1) the partner's reply has no way back to the host without a second trip, and (2) sensitive content ends up in URL/QR/clipboard history.

## Steps

1. Enable Lovable Cloud, create the `play_sessions` table, RLS policies, and the SECURITY DEFINER RPCs for token-based access.
2. Rewrite `useSessions` into the cloud-backed hooks above; keep a local index of `{id, shareToken}` per device.
3. Update the five session routes to use the new hooks.
4. Add gentle copy on the share screen explaining "anyone with this link can fill out the partner side."
