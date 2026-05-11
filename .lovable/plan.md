
# Scene flow redesign — tap, swipe, react

Replace the current 5-step textarea-heavy form with a tap-first creator flow built on chips, sliders, yes/no/maybe toggles, and a swipe deck for kinks. The invitee no longer fills the same form — they see the creator's picks and react (agree / tweak / add / hard-no). Free-text becomes optional "add a note" attached to any chip, never the primary input.

No data is pre-filled from past scenes or profile (per your call). Profile defaults still seed the kink library and aftercare/safeword item lists, but each scene starts blank.

## Creator flow — new shape

Six short screens, each one decision per screen. Mobile-first, thumb-reachable. "Add a note" is always available but never required. Progress bar stays.

### 1. Vibe
- Date + time (existing inputs, kept as-is)
- **Mood chips** (multi-select, 2–4 picks): `Soft`, `Slow`, `Rough`, `Bratty`, `Tender`, `Dirty`, `Playful`, `Ritualistic`, `Service`, `Primal`, `Worship`, `Tease`
- **Intensity slider** 1–5: `Cozy → Edge`
- Optional: "Add a note about the vibe" (collapsed by default)

→ Replaces: `vision`, `intentions`, `goodTime`, `badTime` textareas. Stored as structured fields plus optional note. Backwards-compat: serialize chip picks into `vision` on save so existing reads still work.

### 2. Cravings (swipe deck)
- Card stack of the user's `yes` + `maybe` kinks from their library
- Swipe **right = in for this scene**, **left = not tonight**, **up = enthusiastic yes**, tap to flip card for direction (give / receive / both)
- "+" button at top to add a custom kink mid-deck
- Counter: "12 cards left"
- Skippable once 5+ are sorted

→ Replaces the current chip grid in Step 0. Same data shape (`selectedKinks` + `directions`).

### 3. Logistics (chip-first)
- **Setting**: chip row of common picks (`Home`, `Their place`, `Hotel`, `Outside`, `Play space`) + custom input
- **Dress**: chip row (`Naked`, `Lingerie`, `Streetwear`, `Gear`, `Their choice`) + custom
- **Music**: single text input (low friction, kept)
- **Time constraints**: chip row (`No rush`, `Done by 10pm`, `Done by midnight`) + custom
- **Substances**: chip row (`None`, `Weed`, `Alcohol`, `Other`) + toggle "Hard limit for me"
- **Body check-ins**: chip row of common ones (`Sore back`, `New meds`, `On period`, `Recent injury`) + "Add" — only renders an expanded note if a chip is picked

→ Replaces 6 textareas with chips. `medicalConcerns`, `partnerDynamics`, `timeConstraints`, `setting`, `dress` all become chip-arrays serialized to existing string fields (joined with `, `) for backwards compat.

### 4. Boundaries (yes / no / maybe deck)
- 6–10 quick prompts shown one at a time as YNM cards:
  - Photos / videos during?
  - Talking about it after?
  - Penetrative sex?
  - Marks visible the next day?
  - Filming sound only?
  - Recording for our eyes only?
- If "yes/maybe" on penetrative sex → reveal STD test date + results + PrEP/birth control on the same card (existing fields, kept)

→ Replaces the YesNoMaybe stack on Step 2 with one-at-a-time cards.

### 5. Care
- **Aftercare**: existing checklist, but presented as 2-column toggleable chips with icons
- **Safewords**: existing checklist, same chip treatment
- **Names**: two short inputs (call me / don't call me) — kept, but collapsed under "Want to set scene-specific names?" disclosure

→ Replaces Step 3's `hardLimits`, `softLimits`, `yesList`, `brainstorm` textareas. Hard/soft/yes lists are derived from the swipe deck (left swipe = hard limit, up-swipe = enthusiastic yes, right = yes-with-direction). The four free-text fields collapse into one optional "Anything else?" note.

### 6. Review & share
- Visual summary card (mood chips, intensity bar, top cravings, settings, YNM answers)
- Same "Save & get share link" / "Save as draft" buttons

## Invitee flow — react to creator

New route component (reuse `scene.$token.tsx` or new `respond.$token.tsx`). Invitee sees the creator's picks rendered as cards and reacts per item rather than filling a parallel form.

For each section:
- **Vibe**: Sees creator's mood chips + intensity. Taps `I'm in` / `Tweak` (opens chip picker pre-filled with creator's picks) / `Different vibe` (own picker)
- **Cravings**: Swipe deck of creator's selected kinks. Right = `Yes, with you`, left = `Not for me`, up = `Especially yes`. New screen at the end: "Anything you want to add?" → small swipe deck from invitee's own library that creator didn't pick.
- **Logistics**: Each chip row shows creator's pick highlighted. Invitee taps `Works for me` or picks alternates.
- **Boundaries**: Same YNM cards but show creator's answer; invitee picks own answer. Mismatches surface visually after.
- **Care**: Invitee picks own aftercare/safewords from same chip lists. Creator's selection is shown muted as reference.
- **Review**: Side-by-side overlap view (already exists in current scene view) — keep, adapt to new chip data.

## Data model

No DB migration required. All new chip selections serialize into existing `SessionSide` string/array fields:
- `vision` ← JSON-stringified `{ moods: string[], intensity: number, note: string }` OR human-readable join (TBD during build; pick one and stick to it)
- `setting`, `dress`, `timeConstraints`, `substances`, `medicalConcerns`, `partnerDynamics` ← comma-joined chip labels + optional note
- `hardLimits`, `softLimits`, `yesList` ← derived from swipe results, joined kink names
- `intentions`, `goodTime`, `badTime`, `brainstorm` ← either dropped from UI (still in DB, blank) or merged into one optional "note" field

This keeps existing scene view, edit, and join routes readable without schema changes. A follow-up migration can promote chips to first-class JSONB columns once the new shape settles.

## Build steps

1. Build a small library of new primitives in `src/components/scene/`:
   - `ChipRow` (multi-select chips with optional custom add)
   - `IntensitySlider`
   - `SwipeDeck` (gesture-based, with keyboard fallback for desktop)
   - `YnmCard` (one-at-a-time yes/no/maybe with optional reveal)
   - `ReactionRow` (invitee's `Works for me / Tweak / Different`)
2. Define chip vocabularies in `src/lib/sceneVocab.ts` (moods, settings, dress, substances, body check-ins, YNM prompts) so they're easy to edit.
3. Rebuild `src/routes/sessions.new.tsx` with the 6 new steps, serializing into existing `SessionSide`.
4. Build new invitee response route (extend `join.$token.tsx` or replace its body) using `ReactionRow` over creator's picks.
5. Update the scene summary view (`scene.$token.tsx`, `sessions.$sessionId.scene.tsx`) to render chips visually and surface mismatches.
6. Keep `sessions.$sessionId.edit.tsx` as a fallback "advanced" editor that exposes the underlying text fields for power users / corrections.

## Out of scope for this pass

- Voice notes + AI summary (rejected option, can revisit)
- Pre-fill from past scenes (per your call: no prefill)
- Promoting chip data to dedicated JSONB columns (follow-up migration once shape settles)
- Realtime "watch your partner respond" — separate feature
