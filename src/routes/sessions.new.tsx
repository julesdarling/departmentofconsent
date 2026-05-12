import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { nanoid } from "nanoid";
import { toast } from "sonner";

import { Layout } from "@/components/Layout";
import { Sticker } from "@/components/Sticker";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Progress } from "@/components/ui/progress";
import { CloudButton } from "@/components/CloudButton";
import { RequireAuth } from "@/components/RequireAuth";
import { AftercareChecklist } from "@/components/AftercareChecklist";
import { Checklist } from "@/components/Checklist";

import { ChipRow } from "@/components/scene/ChipRow";
import { IntensitySlider } from "@/components/scene/IntensitySlider";
import { YnmCard, type Ynm } from "@/components/scene/YnmCard";
import { CravingsPicker } from "@/components/scene/CravingsPicker";
import { cn } from "@/lib/utils";

import {
  useProfile,
  useRatings,
  useKinks,
  useDirections,
  newSession,
  DEFAULT_SAFEWORD_ITEMS,
  type SessionSide,
  type Direction,
} from "@/lib/storage";
import { apiCreateSession } from "@/lib/sessionsApi";
import {
  MOODS,
  SETTINGS,
  DRESS,
  TIME_CONSTRAINTS,
  SUBSTANCES,
  BODY_CHECKINS,
  PARTNER_DYNAMICS,
  encodeVibe,
  encodeChips,
  decodeVibe,
  type Vibe,
} from "@/lib/sceneVocab";

export const Route = createFileRoute("/sessions/new")({
  head: () => ({ meta: [{ title: "New scene — Department of Consent" }] }),
  component: () => <RequireAuth><NewSession /></RequireAuth>,
});

const STEPS = ["Vibe", "Cravings", "Logistics", "Boundaries", "Care", "Review"];

function NewSession() {
  const [profile] = useProfile();
  const [ratings, setRatings] = useRatings();
  const [directions] = useDirections();
  const [kinks, setKinks] = useKinks();
  const navigate = useNavigate();

  const [session] = useState(() => newSession(profile, ratings, "", directions));
  const [side, setSide] = useState<SessionSide>(session.ownerSide);
  const [date, setDate] = useState(session.date);
  const [step, setStep] = useState(0);
  const [saving, setSaving] = useState(false);

  // Structured chip state — serialized into SessionSide on save.
  const [vibe, setVibe] = useState<Vibe>(() => decodeVibe(session.ownerSide.vision));
  const [settingChips, setSettingChips] = useState<string[]>([]);
  const [dressChips, setDressChips] = useState<string[]>([]);
  const [timeChips, setTimeChips] = useState<string[]>([]);
  const [substanceChips, setSubstanceChips] = useState<string[]>([]);
  const [bodyChips, setBodyChips] = useState<string[]>([]);
  const [bodyNote, setBodyNote] = useState("");
  const [dynamicsChips, setDynamicsChips] = useState<string[]>([]);
  const [musicNote, setMusicNote] = useState("");
  const [showNames, setShowNames] = useState(false);
  const [extraNote, setExtraNote] = useState("");

  // Chip-based cravings selection
  const interestedKinks = useMemo(
    () => kinks.filter((k) => ratings[k.id] === "yes" || ratings[k.id] === "maybe"),
    [kinks, ratings],
  );
  const [hellYesIds, setHellYesIds] = useState<string[]>([]);
  const [newKink, setNewKink] = useState("");

  const toggleKink = (id: string) => {
    setSide((p) => {
      const has = p.selectedKinks.includes(id);
      const dirs = { ...(p.directions || {}) };
      if (has) {
        delete dirs[id];
        return { ...p, selectedKinks: p.selectedKinks.filter((x) => x !== id), directions: dirs };
      }
      if (!dirs[id]) dirs[id] = "both";
      return { ...p, selectedKinks: [...p.selectedKinks, id], directions: dirs };
    });
    setHellYesIds((prev) => prev.filter((x) => x !== id));
  };

  const setKinkDirection = (id: string, d: Direction) => {
    setSide((p) => ({ ...p, directions: { ...(p.directions || {}), [id]: d } }));
  };

  const toggleHellYes = (id: string) => {
    setHellYesIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  };

  const addCustomKink = () => {
    const name = newKink.trim();
    if (!name) return;
    const id = "c_" + nanoid(8);
    setKinks((p) => [...p, { id, name, category: "Custom", custom: true }]);
    setRatings((p) => ({ ...p, [id]: "yes" }));
    setSide((p) => ({ ...p, selectedKinks: [...p.selectedKinks, id] }));
    setNewKink("");
  };

  // YNM state lives directly on `side` (privacy/talkingAfter/penetrativeSex).
  const setYnm = (key: "privacy" | "talkingAfter" | "penetrativeSex", v: Ynm) =>
    setSide((p) => ({ ...p, [key]: v }));

  const update = <K extends keyof SessionSide>(k: K, v: SessionSide[K]) =>
    setSide((p) => ({ ...p, [k]: v }));

  const buildSideForSave = (): SessionSide => {
    const kinkMap = Object.fromEntries(kinks.map((k) => [k.id, k.name]));
    const yesList = hellYesIds.map((id) => kinkMap[id]).filter(Boolean).join(", ");
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
      // explicitly clear the textarea-only fields the new flow doesn't collect
      intentions: "",
      goodTime: "",
      badTime: "",
      hardLimits: "",
      softLimits: "",
      filledAt: new Date().toISOString(),
    };
  };

  const save = async (status: "draft" | "shared" = "shared") => {
    setSaving(true);
    try {
      const created = await apiCreateSession({
        shareToken: session.shareToken,
        partnerHandle: "",
        date,
        status,
        ownerSide: buildSideForSave(),
      });
      navigate({ to: "/sessions/$sessionId", params: { sessionId: created.shareToken } });
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Could not save scene");
    } finally {
      setSaving(false);
    }
  };

  const pct = ((step + 1) / STEPS.length) * 100;
  const goNext = () => {
    setStep((s) => Math.min(STEPS.length - 1, s + 1));
    if (typeof window !== "undefined") window.scrollTo({ top: 0, behavior: "smooth" });
  };
  const goBack = () => {
    setStep((s) => Math.max(0, s - 1));
    if (typeof window !== "undefined") window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <Layout>
      <div className="space-y-5">
        <div>
          <div className="flex justify-between text-xs text-muted-foreground mb-1">
            <span className="font-semibold text-plum">{STEPS[step]}</span>
            <span>{step + 1} / {STEPS.length}</span>
          </div>
          <Progress value={pct} className="h-2" />
        </div>

        {step === 0 && (
          <Sticker className="space-y-5">
            <h2 className="font-display text-2xl text-plum">What's the vibe?</h2>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Date">
                <Input
                  type="date"
                  value={side.timeOfPlay ? side.timeOfPlay.slice(0, 10) : date}
                  onChange={(e) => {
                    const d = e.target.value;
                    setDate(d);
                    const t = side.timeOfPlay?.slice(11, 16) || "20:00";
                    update("timeOfPlay", d ? `${d}T${t}` : "");
                  }}
                />
              </Field>
              <Field label="Time">
                <Input
                  type="time"
                  value={side.timeOfPlay ? side.timeOfPlay.slice(11, 16) : ""}
                  onChange={(e) => {
                    const t = e.target.value;
                    const d = side.timeOfPlay?.slice(0, 10) || date;
                    update("timeOfPlay", d && t ? `${d}T${t}` : "");
                  }}
                />
              </Field>
            </div>

            <Field label="Pick the moods">
              <ChipRow
                options={MOODS}
                selected={vibe.moods}
                onChange={(moods) => setVibe((v) => ({ ...v, moods }))}
              />
            </Field>

            <Field label="How intense?">
              <IntensitySlider
                value={vibe.intensity}
                onChange={(intensity) => setVibe((v) => ({ ...v, intensity }))}
              />
            </Field>

            <Disclosure label="Add a note about the vibe (optional)">
              <Textarea
                value={vibe.note}
                onChange={(e) => setVibe((v) => ({ ...v, note: e.target.value }))}
                rows={3}
                placeholder="Anything specific you want to say in your own words…"
              />
            </Disclosure>
          </Sticker>
        )}

        {step === 1 && (
          <Sticker variant="coral" className="space-y-4">
            <h2 className="font-display text-2xl text-plum">What are you craving?</h2>
            <p className="text-xs text-muted-foreground">
              Tap to add to your scene. Then choose give / receive / both. Star a hell-yes.
            </p>
            {interestedKinks.length === 0 ? (
              <div className="rounded-2xl border-2 border-dashed border-border/40 p-6 text-center text-sm text-muted-foreground">
                Rate some kinks on your{" "}
                <Link to="/kinks" className="underline text-link">kinks page</Link> first.
              </div>
            ) : (
              <CravingsPicker
                items={interestedKinks.map((k) => ({ id: k.id, name: k.name }))}
                selectedIds={side.selectedKinks}
                directions={side.directions || {}}
                onToggle={toggleKink}
                onSetDirection={setKinkDirection}
                hellYesIds={hellYesIds}
                onToggleHellYes={toggleHellYes}
              />
            )}
            <div className="flex gap-2 pt-2">
              <Input
                value={newKink}
                onChange={(e) => setNewKink(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addCustomKink(); } }}
                placeholder="Add your own kink to the scene…"
              />
              <Button type="button" onClick={addCustomKink} disabled={!newKink.trim()}>Add</Button>
            </div>
            {side.selectedKinks.length > 0 && (
              <div className="text-xs text-center text-muted-foreground">
                {side.selectedKinks.length} on your list · {hellYesIds.length} hell-yeses
              </div>
            )}
          </Sticker>
        )}

        {step === 2 && (
          <Sticker className="space-y-5">
            <h2 className="font-display text-2xl text-plum">Where & how</h2>

            <Field label="Setting">
              <ChipRow options={SETTINGS} selected={settingChips} onChange={setSettingChips} addPlaceholder="Somewhere else…" />
            </Field>

            <Field label="What you'll wear">
              <ChipRow options={DRESS} selected={dressChips} onChange={setDressChips} addPlaceholder="Something else…" />
            </Field>

            <Field label="Music vibe">
              <Input value={musicNote} onChange={(e) => setMusicNote(e.target.value)} placeholder="A playlist, an artist, or 'silence'…" />
            </Field>

            <Field label="Time constraints">
              <ChipRow options={TIME_CONSTRAINTS} selected={timeChips} onChange={setTimeChips} addPlaceholder="Something else…" />
            </Field>

            <Field label="Substances">
              <ChipRow options={SUBSTANCES} selected={substanceChips} onChange={setSubstanceChips} addPlaceholder="Something else…" />
            </Field>
            <div className="flex items-center justify-between">
              <Label className="text-sm">Substance use is a hard limit for me</Label>
              <Switch checked={side.substancesHardLimit} onCheckedChange={(v) => update("substancesHardLimit", v)} />
            </div>

            <Field label="Body check-ins">
              <ChipRow options={BODY_CHECKINS} selected={bodyChips} onChange={setBodyChips} addPlaceholder="Something else…" />
              {bodyChips.length > 0 && (
                <Textarea
                  value={bodyNote}
                  onChange={(e) => setBodyNote(e.target.value)}
                  rows={2}
                  placeholder="Any details? (optional)"
                  className="mt-2"
                />
              )}
            </Field>

            <Field label="Other partners / dynamics">
              <ChipRow options={PARTNER_DYNAMICS} selected={dynamicsChips} onChange={setDynamicsChips} addPlaceholder="Something else…" />
            </Field>
          </Sticker>
        )}

        {step === 3 && (
          <Sticker variant="coral" className="space-y-4">
            <h2 className="font-display text-2xl text-plum">Quick boundaries</h2>
            <YnmCard
              label="Photos or videos during the scene?"
              value={(side.privacy || "") as Ynm}
              onChange={(v) => setYnm("privacy", v)}
            />
            <YnmCard
              label="Talking about it with others after?"
              value={(side.talkingAfter || "") as Ynm}
              onChange={(v) => setYnm("talkingAfter", v)}
            />
            <YnmCard
              label="Penetrative sex during the scene?"
              value={(side.penetrativeSex || "") as Ynm}
              onChange={(v) => setYnm("penetrativeSex", v)}
            />
            {(side.penetrativeSex === "yes" || side.penetrativeSex === "maybe") && (
              <div className="rounded-2xl bg-blush/40 border-2 border-coral/30 p-4 space-y-3">
                <Field label="Last STD test">
                  <Input
                    type="date"
                    value={side.stdTestDate || ""}
                    onChange={(e) => update("stdTestDate", e.target.value)}
                    max={new Date().toISOString().slice(0, 10)}
                  />
                </Field>
                <Field label="Test results">
                  <Textarea
                    value={side.stdTestResults || ""}
                    onChange={(e) => update("stdTestResults", e.target.value)}
                    rows={2}
                    placeholder="e.g. all negative on 4-panel"
                  />
                </Field>
                <YesNo
                  label="On PrEP / DoxyPEP?"
                  value={side.prepDoxypep || ""}
                  onChange={(v) => update("prepDoxypep", v)}
                />
                <YesNo
                  label="On birth control?"
                  value={side.birthControl || ""}
                  onChange={(v) => update("birthControl", v)}
                />
              </div>
            )}
          </Sticker>
        )}

        {step === 4 && (
          <Sticker className="space-y-5">
            <h2 className="font-display text-2xl text-plum">Care</h2>

            <Field label="Aftercare — what matters tonight">
              <AftercareChecklist
                selected={side.aftercareItems ?? []}
                onChange={(next: string[]) => update("aftercareItems", next)}
              />
            </Field>

            <Field label="Safewords you'll use">
              <Checklist
                defaultItems={DEFAULT_SAFEWORD_ITEMS}
                selected={side.safewordItems ?? []}
                onChange={(next: string[]) => update("safewordItems", next)}
                addPlaceholder="Add another safeword…"
              />
            </Field>

            <Disclosure
              label="Set scene-specific names? (optional)"
              open={showNames}
              onToggle={() => setShowNames((s) => !s)}
            >
              <Field label="Names you want to be called">
                <Input value={side.callMe} onChange={(e) => update("callMe", e.target.value)} placeholder={profile.callMe || "e.g. babe, sir, kitten"} />
              </Field>
              <Field label="Names that are off-limits">
                <Input value={side.dontCallMe} onChange={(e) => update("dontCallMe", e.target.value)} placeholder={profile.dontCallMe || "e.g. don't call me…"} />
              </Field>
              <Field label="How would you like your genitals referred to?">
                <Input value={side.genitalsRefer ?? ""} onChange={(e) => update("genitalsRefer", e.target.value)} placeholder="e.g. cock, pussy, parts, junk…" />
              </Field>
            </Disclosure>

            <Disclosure label="Anything else? (optional)">
              <Textarea
                value={extraNote}
                onChange={(e) => setExtraNote(e.target.value)}
                rows={3}
                placeholder="A specific scene, a fantasy, anything to brainstorm…"
              />
            </Disclosure>
          </Sticker>
        )}

        {step === 5 && (
          <Sticker variant="coral" className="space-y-4">
            <h2 className="font-display text-2xl text-plum text-center">Looks good?</h2>
            <ReviewSummary
              vibe={vibe}
              chips={{
                Setting: settingChips,
                Wearing: dressChips,
                Time: timeChips,
                Substances: substanceChips,
                Body: bodyChips,
                Dynamics: dynamicsChips,
              }}
              cravings={side.selectedKinks
                .map((id) => kinks.find((k) => k.id === id)?.name)
                .filter(Boolean) as string[]}
              hellYesCount={hellYesIds.length}
              boundaries={{
                Photos: side.privacy,
                "Talk after": side.talkingAfter || "",
                "Penetrative sex": side.penetrativeSex,
              }}
            />
            <div className="flex flex-col items-center gap-3 pt-2">
              <CloudButton onClick={saving ? undefined : () => save("shared")}>
                {saving ? "Saving..." : "Save & get share link"}
              </CloudButton>
              <CloudButton variant="outline" onClick={saving ? undefined : () => save("draft")}>
                Save as draft
              </CloudButton>
            </div>
          </Sticker>
        )}

        <div className="flex flex-col items-center gap-2">
          {step < STEPS.length - 1 && (
            <CloudButton onClick={goNext}>Next</CloudButton>
          )}
          {step > 0 && (
            <CloudButton variant="outline" onClick={goBack}>Back</CloudButton>
          )}
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

function Disclosure({
  label,
  children,
  open: openProp,
  onToggle,
}: {
  label: string;
  children: React.ReactNode;
  open?: boolean;
  onToggle?: () => void;
}) {
  const [openLocal, setOpenLocal] = useState(false);
  const open = openProp ?? openLocal;
  const toggle = onToggle ?? (() => setOpenLocal((o) => !o));
  return (
    <div className="border-t border-border/40 pt-3">
      <button
        type="button"
        onClick={toggle}
        className="w-full text-left text-sm font-semibold text-plum/80 flex items-center justify-between"
      >
        <span>{label}</span>
        <span className="text-xs">{open ? "−" : "+"}</span>
      </button>
      {open && <div className="pt-3 space-y-3">{children}</div>}
    </div>
  );
}

function YesNo({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
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

function ReviewSummary({
  vibe,
  chips,
  cravings,
  hellYesCount,
  boundaries,
}: {
  vibe: Vibe;
  chips: Record<string, string[]>;
  cravings: string[];
  hellYesCount: number;
  boundaries: Record<string, string>;
}) {
  return (
    <div className="space-y-4 text-left">
      <div>
        <div className="section-label">Vibe</div>
        <div className="flex flex-wrap gap-1.5">
          {vibe.moods.map((m) => (
            <span key={m} className="text-xs px-2 py-1 rounded-full bg-yes/20 border border-yes/40 font-semibold">
              {m}
            </span>
          ))}
          <span className="text-xs px-2 py-1 rounded-full bg-coral/15 border border-coral/40 font-semibold">
            Intensity {vibe.intensity}/5
          </span>
        </div>
        {vibe.note && <p className="text-sm mt-2 whitespace-pre-wrap text-muted-foreground italic">"{vibe.note}"</p>}
      </div>

      <div>
        <div className="section-label">Cravings ({cravings.length})</div>
        <div className="flex flex-wrap gap-1.5">
          {cravings.slice(0, 12).map((c) => (
            <span key={c} className="text-xs px-2 py-1 rounded-full bg-blush border border-coral/40 font-semibold text-plum">
              {c}
            </span>
          ))}
          {cravings.length > 12 && <span className="text-xs text-muted-foreground self-center">+{cravings.length - 12} more</span>}
        </div>
        {hellYesCount > 0 && <p className="text-xs mt-1 text-coral font-semibold">🔥 {hellYesCount} hell yes</p>}
      </div>

      {Object.entries(chips).map(([label, list]) =>
        list.length > 0 ? (
          <div key={label}>
            <div className="section-label">{label}</div>
            <div className="flex flex-wrap gap-1.5">
              {list.map((c) => (
                <span key={c} className="text-xs px-2 py-1 rounded-full bg-secondary border border-border font-medium">
                  {c}
                </span>
              ))}
            </div>
          </div>
        ) : null,
      )}

      <div>
        <div className="section-label">Boundaries</div>
        <div className="space-y-1 text-sm">
          {Object.entries(boundaries).map(([label, val]) => (
            <div key={label} className="flex justify-between border-b border-border/40 py-1">
              <span className="text-muted-foreground">{label}</span>
              <span className="font-semibold capitalize">{val || "—"}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
