## New homepage — desktop + mobile

Rebuild `src/routes/index.tsx` to match the mockups closely. Reorganized into 7 stacked sections, fully responsive (single column on mobile, multi-column with floating stickers on desktop).

### Layout & header

- Add a top header to the homepage only (wordmark left, "Sign In" / "My scenes" pill right). Hide the bottom nav on `/` (it stays on every other route).
- Cream background throughout, sections separated by generous vertical padding. No full-bleed hero image — the hero photo sits inside a rounded card on the right.

### Sections (top → bottom)

1. **Hero (split)** — Left: H1 *"A better way to talk about limits, kinks, and aftercare."*, supporting paragraph, mint **Create a scene** cloud CTA, tiny disclaimer line. Right: rounded photo of friends with the existing `hero.jpg`. Floating sticker decorations (whip, handcuffs) absolutely positioned around the photo on `md+`. On mobile: stacks photo above text.

2. **"What are you into? is not enough." card** — White rounded card, centered, italic display headline + subtitle. Then a checklist of 6 nuanced questions (each with a coral check-bullet):
   - "What turns you on, and how?"
   - "What's a hard no?"
   - "What scenes do you fantasize about?"
   - "What do you need to feel safe?"
   - "What kind of aftercare do you want?"
   - "What words make you feel hot — or shut down?"
   Floating wand sticker bottom-left.

3. **How it works** — Section heading + short subtitle. 4 short white step cards in a row on desktop, stacked on mobile:
   - Step 1 — Choose your interests and limits
   - Step 2 — Share with your play partner
   - Step 3 — Compare and plan the scene
   - Step 4 — Keep the scene card nearby
   Floating bound-hands sticker centered below.

4. **Feature cluster (4 stylized illustrative cards)** — White rounded cards with a small hint of mocked app UI inside each (chips, bullet lists), arranged in an asymmetric collage on desktop, stacked on mobile. Floating rope (right) and feather (left) stickers.
   - **Your personal kink menu** — small chip row + bullet list of categories.
   - **Two-way consent, not one-way permission** — paired yes/maybe/no chips.
   - **Scene cards for when brains stop working** — title + bullet list (safeword, limits, aftercare, etc.).
   - **Aftercare does not have to be improvised** — checklist mock + tagline.

5. **"Built for kinky people who take consent seriously"** — Dark photo card (uses `hero.jpg` desaturated/overlay or a dedicated photo), white headline + supporting paragraph + small trans-flag icon line ("Department of Consent is built by + for the queer, kinky, and trans communities.") Single rounded card, full width on mobile, max-w container on desktop.

6. **Mint CTA card** — Mint card, white display headline *"Make the scene clear before you start."*, short supporting line, white-fill cloud **Create a scene** button. Floating collar stickers (left) and heart-harness (right) on desktop.

7. **Giant wordmark footer** — Massive multi-color "Dept of / Consent" rendered in CSS using Instrument Serif, per-letter spans colored blue / coral / teal / purple. Scales fluidly with `clamp()`. Below it: small footer line ("Copyright Department of Consent" + Privacy / Terms links).

### Assets

Use existing assets in `src/assets/`:
- `hero.jpg`, `logo.svg`, `trans-flag.svg`
- `icon-whip.png`, `icon-hearts.png`, `icon-checklist.png`, `icon-bunnies.png`, `icon-bunny-cuddle.png`, `icon-heart-harness.png`, `icon-step1.png`, `icon-step2.png`

No new generated images required. Stickers are positioned with `absolute` + responsive offsets and hidden below `md` where they'd crowd mobile.

### Layout component change

Update `src/components/Layout.tsx` so the bottom nav is hidden on `/` (homepage gets its own top header rendered inside `index.tsx`). All other pages unchanged.

### Styles

- Add a couple of utility classes in `src/styles.css`:
  - `.giant-wordmark` — display serif, fluid `clamp(4rem, 18vw, 14rem)`, tight leading.
  - `.feature-card` — white card, soft shadow, rounded-3xl.
  - per-letter color helpers (`.lt-blue`, `.lt-coral`, `.lt-teal`, `.lt-purple`).
- Add a `--color-display-blue` and `--color-display-purple` token.

### Responsive behavior

- Mobile (`< md`): single column everywhere, photo above text in hero, stickers hidden or scaled down, feature collage becomes vertical stack matching the mobile mockup.
- Desktop (`md+`): hero is 2-col, feature cards stagger left/right, stickers float at edges.

### Out of scope

- No backend, route, or auth changes.
- No new generated images — all marketing copy + CSS only.
- Bottom nav behavior on other routes unchanged.
