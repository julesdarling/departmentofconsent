## Department of Consent

A coquette, empowering web app for negotiating kink play sessions — for pickup play, first-time partners, and ongoing partners. Built around a thoughtful pre-scene questionnaire, easy sharing, and in-scene + aftercare support.

### Vibe & Visual Design

Inspired by your reference image: coquette girly, cute, empowering.
- **Palette**: soft cream/blush background, hot pink + coral red accents, deep plum text
- **Typography**: an elegant serif display (e.g. Fraunces) for headers + a clean modern sans (Inter) for body
- **Style**: rounded "sticker" cards with pink outlines mimicking the puffy stickers in the image, subtle film-grain texture, playful icon set (hearts, sparkles, cherries, lightning, flames)
- **Tone**: warm, affirming, body-positive, never clinical

### Core Flows

**1. Welcome & onboarding (anonymous-first)**
- Landing screen explains what the app is + safety promise
- Start instantly without an account; data stored locally
- Optional "Save your profile" prompt to create an account (email magic link) so kinks/limits/history persist across devices
- Profile setup: chosen name, pronouns, names you want / don't want to be called, healthcare status, emergency contact, default safewords, default aftercare needs

**2. Kinks & limits library (your evergreen profile)**
- Curated default checklist organized by category (sensation, impact, bondage, power exchange, sensory, roleplay, fluids, etc.)
- Each item rated: Yes / Maybe (soft limit) / No (hard limit) / Not sure
- Add custom items
- Edit anytime; reused as the starting point for every new session

**3. New play session questionnaire**
A guided multi-step form covering everything you listed, grouped to feel like a conversation, not a clipboard:
- *Logistics & safety*: healthcare, emergency contact, partner dynamics, time constraints, medical concerns, substances (and whether substance use is a hard limit)
- *The scene*: date, setting, music, dress, names/pronouns, intentions & feelings, what a good time vs. bad time looks like
- *Privacy*: photos/videos, sharing, talking about the scene afterward
- *Sex*: penetrative sex yes/no/conditions
- *Safewords*: pre-filled with your defaults (Red/Yellow/Green/Mercy + thumb signals), editable per session
- *Actions*: pulled from your kink library — confirm/adjust Yes / Maybe / No for this specific scene
- *Aftercare*: what you need after
- *Brainstorming space*: free text
- *Lightning round*: fast yes/no/maybe tap-through of remaining curated items + any custom items
- Progress bar + "save draft" at every step

**4. Two-way sharing**
- After completing your side, generate a session with a share link + QR code
- Partner opens link, creates their own session-side (anonymous ok), fills out their version
- Side-by-side comparison view: highlights mutual Yeses (green), one-sided Maybes (yellow flag for negotiation), any No from either party (hard stop, clearly shown), shared safewords, agreed privacy terms
- Either party can mark the session "agreed" once both are comfortable

**5. In-scene reference card**
- Quick-access screen for during play: large-type safewords (verbal + non-verbal), hard limits, agreed aftercare, emergency contact one-tap
- Designed to be readable in low light; minimal taps

**6. Aftercare & reflection**
- Post-scene checklist of agreed aftercare items
- Optional private reflection notes (how did it feel, what to adjust next time)
- Reminder nudge a day later to check in on yourself

**7. History**
- List of active + past sessions with partner name/handle, date, status (draft / shared / agreed / completed)
- Tap a session to see the full agreed terms + your private reflection
- Filter by partner, archive old sessions

### Information Architecture

```text
/                       Landing / welcome
/onboarding             Profile + kinks library setup
/kinks                  Manage evergreen kinks & limits
/sessions               History (active + past)
/sessions/new           Multi-step questionnaire
/sessions/:id           Session detail (your side)
/sessions/:id/compare   Side-by-side with partner
/sessions/:id/scene     In-scene reference card
/sessions/:id/aftercare Aftercare checklist + reflection
/join/:token            Partner entry point from link/QR
/settings               Account, defaults, export/delete data
```

### Data Model (high level)

- `profile` — name, pronouns, name preferences, healthcare, emergency contact, default safewords, default aftercare
- `kink_items` — curated catalog + user's custom items
- `kink_ratings` — user's Yes/Maybe/No per item
- `sessions` — owner, partner handle, date, setting, status, all questionnaire fields
- `session_participants` — links two profiles (or anonymous tokens) to a session
- `session_ratings` — per-session overrides of kink ratings
- `reflections` — private post-scene notes (visible only to author)

### Technical Approach (for reference)

- TanStack Start + Tailwind, shadcn components restyled to the coquette aesthetic
- Lovable Cloud for auth (anonymous + optional email upgrade), database, and RLS so each user's profile/reflections are private; sessions readable only by linked participants
- Local draft storage (IndexedDB) before account creation, then synced on sign-up
- QR generation client-side; share links are unguessable tokens
- No analytics on sensitive content; explicit "delete all my data" in settings

### Out of Scope (v1)

- Native mobile app (PWA-ready instead)
- Real-time collaborative editing of a single session (partners fill their own sides separately)
- Public profiles or partner discovery
