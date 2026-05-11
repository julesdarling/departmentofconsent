import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";

import { WhipLoader } from "@/components/WhipLoader";
import { Layout } from "@/components/Layout";
import { Sticker } from "@/components/Sticker";
import { CloudButton } from "@/components/CloudButton";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checklist } from "@/components/Checklist";
import { AftercareChecklist } from "@/components/AftercareChecklist";

import { ChipRow } from "@/components/scene/ChipRow";
import { IntensitySlider } from "@/components/scene/IntensitySlider";
import { SwipeDeck, type DeckCard, type SwipeChoice } from "@/components/scene/SwipeDeck";
import { YnmCard, type Ynm } from "@/components/scene/YnmCard";
import { ReactionRow, type Reaction } from "@/components/scene/ReactionRow";

import {
  useProfile,
  useKinks,
  emptySide,
  DEFAULT_SAFEWORD_ITEMS,
  type SessionSide,
  type Direction,
} from "@/lib/storage";
import { useCloudSession } from "@/lib/useCloudSession";
import { supabase } from "@/integrations/supabase/client";
import {
  MOODS,
  SETTINGS,
  DRESS,
  TIME_CONSTRAINTS,
  SUBSTANCES,
  BODY_CHECKINS,
  PARTNER_DYNAMICS,
  decodeVibe,
  decodeChips,
  encodeVibe,
  encodeChips,
  type Vibe,
} from "@/lib/sceneVocab";

export const Route = createFileRoute("/join/$token")({
  head: () => ({ meta: [{ title: "Join a scene" }] }),
  component: JoinPage,
});

const STEPS = ["Vibe", "Cravings", "Logistics", "Boundaries", "Care"];

function JoinPage() {
  const { token } = Route.useParams();
  const [profile] = useProfile();
  const [kinks] = useKinks();
  const navigate = useNavigate();

  const { session, error, addPartner } = useCloudSession(token);

  const [side, setSide] = useState<SessionSide | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [step, setStep] = useState(0);
  const [ownerProfileName, setOwnerProfileName] = useState<string | null>(null);

  // Decoded creator state
  const ownerSide = session?.ownerSide;
  const ownerVibe = useMemo<Vibe>(() => decodeVibe(ownerSide?.vision), [ownerSide?.vision]);
  const ownerSetting = useMemo(() => decodeChips(ownerSide?.setting, SETTINGS), [ownerSide?.setting]);
  const ownerDress = useMemo(() => decodeChips(ownerSide?.dress, DRESS), [ownerSide?.dress]);
  const ownerTime = useMemo(() => decodeChips(ownerSide?.timeConstraints, TIME_CONSTRAINTS), [ownerSide?.timeConstraints]);
  const ownerSubstances = useMemo(() => decodeChips(ownerSide?.substances, SUBSTANCES), [ownerSide?.substances]);
  const ownerBody = useMemo(() => decodeChips(ownerSide?.medicalConcerns, BODY_CHECKINS), [ownerSide?.medicalConcerns]);
  const ownerDynamics = useMemo(() => decodeChips(ownerSide?.partnerDynamics, PARTNER_DYNAMICS), [ownerSide?.partnerDynamics]);

  // My state
  const [vibe, setVibe] = useState<Vibe>({ moods: [], intensity: 3, note: "" });
  const [vibeReact, setVibeReact] = useState<Reaction>("");

  const [settingChips, setSettingChips] = useState<string[]>([]);
  const [dressChips, setDressChips] = useState<string[]>([]);
  const [timeChips, setTimeChips] = useState<string[]>([]);
  const [substanceChips, setSubstanceChips] = useState<string[]>([]);
  const [bodyChips, setBodyChips] = useState<string[]>([]);
  const [bodyNote, setBodyNote] = useState("");
  const [dynamicsChips, setDynamicsChips] = useState<string[]>([]);
  const [musicNote, setMusicNote] = useState("");
  const [extraNote, setExtraNote] = useState("");

  // Swipe through creator's selected kinks
  const [hellYesIds, setHellYesIds] = useState<string[]>([]);
  const [respondedKinkIds, setRespondedKinkIds] = useState<Set<string>>(() => new Set());

  useEffect(() => {
    if (!token) return;
    supabase.rpc("get_session_owner_name", { p_token: token }).then(({ data }) => {
      if (typeof data === "string" && data.trim()) setOwnerProfileName(data.trim());
    });
  }, [token]);

  useEffect(() => {
    if (session && !side) {
      setSide(session.partnerSide ?? emptySide(profile));
    }
  }, [session, side, profile]);

  if (session === undefined) {
    return <Layout><div className="flex items-center justify-center min-h-[60vh]"><WhipLoader /></div></Layout>;
  }
  if (!session) {
    return (
      <Layout>
        <Sticker className="text-center space-y-3">
          <h1 className="font-display text-3xl text-plum">Scene not found</h1>
          <p className="text-sm text-muted-foreground">
            This invite link doesn't match anything. Ask your play partner to share it again.
          </p>
          {error && <p className="text-xs text-muted-foreground">{error}</p>}
        </Sticker>
      </Layout>
    );
  }
  if (!side || !ownerSide) return null;

  const updateField = <K extends keyof SessionSide>(k: K, v: SessionSide[K]) =>
    setSide((p) => (p ? { ...p, [k]: v } : p));

  const setYnm = (key: "privacy" | "talkingAfter" | "penetrativeSex", v: Ynm) =>
    updateField(key, v);

  const creatorName = ownerProfileName || ownerSide.name?.trim() || "Your play partner";

  const ownerKinkMap = Object.fromEntries(kinks.map((k) => [k.id, k.name]));
  const ownerSelectedIds = (ownerSide.selectedKinks || []).filter((id) => ownerKinkMap[id]);
  const deckCards: DeckCard[] = ownerSelectedIds.map((id) => ({
    id,
    name: ownerKinkMap[id],
    direction: ownerSide.directions?.[id],
  }));

  const handleSwipe = (cardId: string, choice: SwipeChoice, direction?: Direction) => {
    setSide((p) => {
      if (!p) return p;
      const ratings = { ...p.ratings };
      const dirs = { ...(p.directions || {}) };
      const sel = new Set(p.selectedKinks);
      if (choice === "no") {
        ratings[cardId] = "no";
        sel.delete(cardId);
        delete dirs[cardId];
      } else {
        ratings[cardId] = "yes";
        sel.add(cardId);
        if (direction) dirs[cardId] = direction;
      }
      return { ...p, ratings, directions: dirs, selectedKinks: Array.from(sel) };
    });
    setHellYesIds((prev) => {
      const next = prev.filter((id) => id !== cardId);
      if (choice === "hellyes") next.push(cardId);
      return next;
    });
  };

  // When invitee taps "I'm in" on a section, copy creator's chips.
  const applyVibeReaction = (r: Reaction) => {
    setVibeReact(r);
    if (r === "agree") {
      setVibe({ moods: ownerVibe.moods, intensity: ownerVibe.intensity, note: "" });
    } else if (r === "tweak" && vibe.moods.length === 0) {
      setVibe({ moods: ownerVibe.moods, intensity: ownerVibe.intensity, note: "" });
    } else if (r === "different") {
      setVibe({ moods: [], intensity: 3, note: "" });
    }
  };

  const buildSideForSave = (): SessionSide => {
    const yesList = hellYesIds.map((id) => ownerKinkMap[id]).filter(Boolean).join(", ");
    return {
      ...side,
      vision: encodeVibe(vibe),
      setting: encodeChips(settingChips),
      dress: encodeChips(dressChips),
      timeConstraints: encodeChips(timeChips),
      substances: encodeChips(substanceChips),
      medicalConcerns: encodeChips(bodyChips, bodyNote),
      partnerDynamics: encodeChips(dynamicsChips),
      music: musicNote,
      yesList,
      brainstorm: extraNote,
      intentions: "",
      goodTime: "",
      badTime: "",
      hardLimits: "",
      softLimits: "",
      filledAt: new Date().toISOString(),
    };
  };

  const submit = async () => {
    setSubmitting(true);
    try {
      await addPartner(buildSideForSave());
      navigate({ to: "/sessions/$sessionId", params: { sessionId: token } });
    } finally {
      setSubmitting(false);
    }
  };

  const goNext = () => {
    setStep((s) => Math.min(STEPS.length - 1, s + 1));
    if (typeof window !== "undefined") window.scrollTo({ top: 0, behavior: "smooth" });
  };
  const goBack = () => {
    setStep((s) => Math.max(0, s - 1));
    if (typeof window !== "undefined") window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const pct = ((step + 1) / STEPS.length) * 100;

  return (
    <Layout>
      <div className="space-y-5">
        <Sticker className="text-center space-y-2">
          <h1 className="font-display text-3xl text-plum">
            {creatorName} invited you
          </h1>
          <p className="text-sm text-muted-foreground">
            Their picks are highlighted — react and add yours.
          </p>
        </Sticker>

        <div>
          <div className="flex justify-between text-xs text-muted-foreground mb-1">
            <span className="font-semibold text-plum">{STEPS[step]}</span>
            <span>{step + 1} / {STEPS.length}</span>
          </div>
          <div className="h-2 rounded-full bg-secondary overflow-hidden">
            <div className="h-full bg-coral transition-all" style={{ width: `${pct}%` }} />
          </div>
        </div>

        {step === 0 && (
          <Sticker className="space-y-5">
            <h2 className="font-display text-2xl text-plum">{creatorName}'s vibe</h2>

            <div className="rounded-2xl bg-blush/50 border-2 border-coral/30 p-4 space-y-3">
              <div className="text-[10px] uppercase tracking-wider text-plum font-bold">{creatorName} picked</div>
              <div className="flex flex-wrap gap-1.5">
                {ownerVibe.moods.length > 0 ? ownerVibe.moods.map((m) => (
                  <span key={m} className="text-sm px-3 py-1 rounded-full bg-white border border-coral/40 font-semibold">{m}</span>
                )) : <span className="text-sm text-muted-foreground italic">No mood picks</span>}
                <span className="text-sm px-3 py-1 rounded-full bg-coral/15 border border-coral/40 font-semibold">
                  Intensity {ownerVibe.intensity}/5
                </span>
              </div>
              {ownerVibe.note && (
                <p className="text-sm whitespace-pre-wrap italic text-plum">"{ownerVibe.note}"</p>
              )}
            </div>

            <Field label="Your reaction">
              <ReactionRow value={vibeReact} onChange={applyVibeReaction} />
            </Field>

            {(vibeReact === "tweak" || vibeReact === "different") && (
              <>
                <Field label="Your moods">
                  <ChipRow
                    options={MOODS}
                    selected={vibe.moods}
                    onChange={(moods) => setVibe((v) => ({ ...v, moods }))}
                    highlightOptions={ownerVibe.moods}
                  />
                </Field>
                <Field label="Your intensity">
                  <IntensitySlider
                    value={vibe.intensity}
                    onChange={(intensity) => setVibe((v) => ({ ...v, intensity }))}
                    ghostValue={ownerVibe.intensity}
                  />
                </Field>
                <Field label="Note (optional)">
                  <Textarea
                    value={vibe.note}
                    onChange={(e) => setVibe((v) => ({ ...v, note: e.target.value }))}
                    rows={3}
                  />
                </Field>
              </>
            )}
          </Sticker>
        )}

        {step === 1 && (
          <Sticker variant="coral" className="space-y-4">
            <h2 className="font-display text-2xl text-plum">{creatorName}'s cravings</h2>
            <p className="text-xs text-muted-foreground">
              Swipe through what they picked. Right = yes with you, up = especially yes, left = not for me.
            </p>
            {deckCards.length === 0 ? (
              <div className="rounded-2xl border-2 border-dashed border-border/40 p-6 text-center text-sm text-muted-foreground">
                {creatorName} didn't pick any specific kinks for this scene.
              </div>
            ) : (
              <SwipeDeck
                cards={deckCards}
                onChoice={handleSwipe}
                noLabel="Not for me"
                yesLabel="Yes with you"
                hellYesLabel="Especially yes"
              />
            )}
            {side.selectedKinks.length > 0 && (
              <div className="text-xs text-center text-muted-foreground">
                {side.selectedKinks.length} on your list · {hellYesIds.length} especially yes
              </div>
            )}
          </Sticker>
        )}

        {step === 2 && (
          <Sticker className="space-y-5">
            <h2 className="font-display text-2xl text-plum">Where & how</h2>

            <ReactiveChipField
              label="Setting"
              creatorName={creatorName}
              creatorChips={ownerSetting.chips}
              creatorNote={ownerSetting.note}
              options={SETTINGS}
              selected={settingChips}
              onChange={setSettingChips}
            />
            <ReactiveChipField
              label="What they're wearing"
              creatorName={creatorName}
              creatorChips={ownerDress.chips}
              creatorNote={ownerDress.note}
              options={DRESS}
              selected={dressChips}
              onChange={setDressChips}
            />
            {ownerSide.music?.trim() && (
              <div className="space-y-1">
                <div className="text-[10px] uppercase tracking-wider text-plum/60 font-semibold">{creatorName}'s music</div>
                <div className="inline-block bg-blush text-plum text-sm rounded-lg rounded-bl-none px-3 py-1.5 font-medium">{ownerSide.music}</div>
              </div>
            )}
            <Field label="Your music vibe (optional)">
              <Input value={musicNote} onChange={(e) => setMusicNote(e.target.value)} />
            </Field>

            <ReactiveChipField
              label="Time constraints"
              creatorName={creatorName}
              creatorChips={ownerTime.chips}
              creatorNote={ownerTime.note}
              options={TIME_CONSTRAINTS}
              selected={timeChips}
              onChange={setTimeChips}
            />
            <ReactiveChipField
              label="Substances"
              creatorName={creatorName}
              creatorChips={ownerSubstances.chips}
              creatorNote={ownerSubstances.note}
              options={SUBSTANCES}
              selected={substanceChips}
              onChange={setSubstanceChips}
            />
            {ownerSide.substancesHardLimit && (
              <div className="text-[11px] uppercase tracking-wider text-no font-bold">
                ⚠ Substance use is a hard limit for {creatorName}
              </div>
            )}

            <ReactiveChipField
              label="Body check-ins"
              creatorName={creatorName}
              creatorChips={ownerBody.chips}
              creatorNote={ownerBody.note}
              options={BODY_CHECKINS}
              selected={bodyChips}
              onChange={setBodyChips}
            />
            {bodyChips.length > 0 && (
              <Textarea
                value={bodyNote}
                onChange={(e) => setBodyNote(e.target.value)}
                rows={2}
                placeholder="Any details? (optional)"
              />
            )}

            <ReactiveChipField
              label="Other partners / dynamics"
              creatorName={creatorName}
              creatorChips={ownerDynamics.chips}
              creatorNote={ownerDynamics.note}
              options={PARTNER_DYNAMICS}
              selected={dynamicsChips}
              onChange={setDynamicsChips}
            />
          </Sticker>
        )}

        {step === 3 && (
          <Sticker variant="coral" className="space-y-4">
            <h2 className="font-display text-2xl text-plum">Quick boundaries</h2>
            <YnmCard
              label="Photos or videos during the scene?"
              value={(side.privacy || "") as Ynm}
              onChange={(v) => setYnm("privacy", v)}
              theirName={creatorName}
              theirValue={ownerSide.privacy}
            />
            <YnmCard
              label="Talking about it with others after?"
              value={(side.talkingAfter || "") as Ynm}
              onChange={(v) => setYnm("talkingAfter", v)}
              theirName={creatorName}
              theirValue={ownerSide.talkingAfter}
            />
            <YnmCard
              label="Penetrative sex during the scene?"
              value={(side.penetrativeSex || "") as Ynm}
              onChange={(v) => setYnm("penetrativeSex", v)}
              theirName={creatorName}
              theirValue={ownerSide.penetrativeSex}
            />
            {(side.penetrativeSex === "yes" || side.penetrativeSex === "maybe") && (
              <div className="rounded-2xl bg-blush/40 border-2 border-coral/30 p-4 space-y-3">
                <Field label="Last STD test">
                  <Input
                    type="date"
                    value={side.stdTestDate || ""}
                    onChange={(e) => updateField("stdTestDate", e.target.value)}
                    max={new Date().toISOString().slice(0, 10)}
                  />
                </Field>
                <Field label="Test results">
                  <Textarea
                    value={side.stdTestResults || ""}
                    onChange={(e) => updateField("stdTestResults", e.target.value)}
                    rows={2}
                  />
                </Field>
                <YesNo label="On PrEP / DoxyPEP?" value={side.prepDoxypep || ""} onChange={(v) => updateField("prepDoxypep", v)} />
                <YesNo label="On birth control?" value={side.birthControl || ""} onChange={(v) => updateField("birthControl", v)} />
              </div>
            )}
          </Sticker>
        )}

        {step === 4 && (
          <Sticker className="space-y-5">
            <h2 className="font-display text-2xl text-plum">About you & care</h2>

            <Field label="Your name / handle">
              <Input value={side.name} onChange={(e) => updateField("name", e.target.value)} />
            </Field>
            <Field label="Pronouns">
              <Input value={side.pronouns} onChange={(e) => updateField("pronouns", e.target.value)} />
            </Field>
            <Field label="Emergency contact">
              <Textarea value={side.emergencyContact} onChange={(e) => updateField("emergencyContact", e.target.value)} rows={2} />
            </Field>

            {(ownerSide.aftercareItems?.length ?? 0) > 0 && (
              <div className="space-y-1.5">
                <div className="text-[10px] uppercase tracking-wider text-plum font-bold">{creatorName} wants for aftercare</div>
                <div className="flex flex-wrap gap-1.5">
                  {ownerSide.aftercareItems!.map((item) => (
                    <span key={item} className="text-xs px-2 py-1 rounded-full bg-blush border border-coral/40 font-medium text-plum">
                      {item}
                    </span>
                  ))}
                </div>
              </div>
            )}
            <Field label="What you'd like for aftercare">
              <AftercareChecklist
                selected={side.aftercareItems ?? []}
                onChange={(next: string[]) => updateField("aftercareItems", next)}
                extraItems={ownerSide.aftercareItems ?? []}
              />
            </Field>

            {(ownerSide.safewordItems?.length ?? 0) > 0 && (
              <div className="space-y-1.5">
                <div className="text-[10px] uppercase tracking-wider text-plum font-bold">{creatorName} uses</div>
                <div className="flex flex-wrap gap-1.5">
                  {ownerSide.safewordItems!.map((item) => (
                    <span key={item} className="text-xs px-2 py-1 rounded-full bg-blush border border-coral/40 font-medium text-plum">
                      {item}
                    </span>
                  ))}
                </div>
              </div>
            )}
            <Field label="Safewords you'll use">
              <Checklist
                defaultItems={DEFAULT_SAFEWORD_ITEMS}
                selected={side.safewordItems ?? []}
                onChange={(next: string[]) => updateField("safewordItems", next)}
                extraItems={ownerSide.safewordItems ?? []}
                addPlaceholder="Add another safeword…"
              />
            </Field>

            <Field label="Anything else? (optional)">
              <Textarea value={extraNote} onChange={(e) => setExtraNote(e.target.value)} rows={3} />
            </Field>
          </Sticker>
        )}

        <div className="flex flex-col items-center gap-2">
          {step < STEPS.length - 1 && (
            <CloudButton onClick={goNext}>Next</CloudButton>
          )}
          {step === STEPS.length - 1 && (
            <CloudButton onClick={submitting ? undefined : submit}>
              {submitting ? "Submitting..." : "Submit my side"}
            </CloudButton>
          )}
          {step > 0 && (
            <CloudButton variant="outline" onClick={goBack}>Back</CloudButton>
          )}
          <Link to="/" className="text-xs text-muted-foreground underline pt-1">Cancel</Link>
        </div>
      </div>
    </Layout>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <Label className="doc-label">{label}</Label>
      {children}
    </div>
  );
}

function YesNo({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <div className="space-y-1.5">
      <Label className="doc-label">{label}</Label>
      <div className="flex gap-2">
        {["yes", "no"].map((v) => (
          <button
            key={v}
            type="button"
            onClick={() => onChange(v)}
            className={`h-10 px-5 rounded-full text-sm font-semibold border-2 transition capitalize ${
              value === v
                ? v === "yes" ? "bg-yes/25 border-yes" : "bg-no/20 border-no"
                : "border-border/60 text-muted-foreground"
            }`}
          >
            {v}
          </button>
        ))}
      </div>
    </div>
  );
}

function ReactiveChipField({
  label,
  creatorName,
  creatorChips,
  creatorNote,
  options,
  selected,
  onChange,
}: {
  label: string;
  creatorName: string;
  creatorChips: string[];
  creatorNote: string;
  options: string[];
  selected: string[];
  onChange: (next: string[]) => void;
}) {
  const hasCreatorPicks = creatorChips.length > 0 || !!creatorNote.trim();
  return (
    <div className="space-y-2">
      <Label className="doc-label">{label}</Label>
      {hasCreatorPicks && (
        <div className="rounded-xl bg-blush/40 border border-coral/30 p-2.5 space-y-1">
          <div className="text-[10px] uppercase tracking-wider text-plum/70 font-bold">{creatorName}</div>
          <div className="flex flex-wrap gap-1.5">
            {creatorChips.map((c) => (
              <span key={c} className="text-xs px-2 py-1 rounded-full bg-white border border-coral/40 font-semibold text-plum">{c}</span>
            ))}
          </div>
          {creatorNote && <p className="text-xs italic text-plum/80">{creatorNote}</p>}
        </div>
      )}
      <ChipRow
        options={options}
        selected={selected}
        onChange={onChange}
        highlightOptions={creatorChips}
        addPlaceholder="Something else…"
      />
    </div>
  );
}
