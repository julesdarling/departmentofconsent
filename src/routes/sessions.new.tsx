import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Layout } from "@/components/Layout";
import { Sticker } from "@/components/Sticker";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Progress } from "@/components/ui/progress";
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
import { Link } from "@tanstack/react-router";
import { apiCreateSession } from "@/lib/sessionsApi";
import { useMemo, useState } from "react";
import { nanoid } from "nanoid";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { CloudButton } from "@/components/CloudButton";
import { AftercareChecklist } from "@/components/AftercareChecklist";
import { Checklist } from "@/components/Checklist";

import { RequireAuth } from "@/components/RequireAuth";

export const Route = createFileRoute("/sessions/new")({
  head: () => ({ meta: [{ title: "New scene — Department of Consent" }] }),
  component: () => <RequireAuth><NewSession /></RequireAuth>,
});

const STEPS = [
  "Scene vision",
  "Scene & logistics",
  "Privacy & sex",
  "For this scene",
  "Review",
];

function NewSession() {
  const [profile] = useProfile();
  const [ratings, setRatings] = useRatings();
  const [directions] = useDirections();
  const [kinks, setKinks] = useKinks();
  const navigate = useNavigate();

  const [session] = useState(() => newSession(profile, ratings, "", directions));
  const [date, setDate] = useState(session.date);
  const [side, setSide] = useState<SessionSide>(session.ownerSide);
  const [step, setStep] = useState(0);
  const [saving, setSaving] = useState(false);

  const setDirection = (id: string, d: Direction) =>
    setSide((p) => ({ ...p, directions: { ...(p.directions || {}), [id]: d } }));

  const update = <K extends keyof SessionSide>(k: K, v: SessionSide[K]) =>
    setSide((p) => ({ ...p, [k]: v }));

  const interestedKinks = useMemo(
    () => kinks.filter((k) => ratings[k.id] === "yes" || ratings[k.id] === "maybe"),
    [kinks, ratings]
  );

  const toggleKink = (id: string) =>
    setSide((p) => {
      const has = p.selectedKinks.includes(id);
      return { ...p, selectedKinks: has ? p.selectedKinks.filter((x) => x !== id) : [...p.selectedKinks, id] };
    });

  const [newKink, setNewKink] = useState("");
  const addKink = () => {
    const name = newKink.trim();
    if (!name) return;
    const id = "c_" + nanoid(8);
    setKinks((p) => [...p, { id, name, category: "Custom", custom: true }]);
    setRatings((p) => ({ ...p, [id]: "yes" }));
    setSide((p) => ({ ...p, selectedKinks: [...p.selectedKinks, id] }));
    setNewKink("");
  };

  const save = async (status: "draft" | "shared" = "shared") => {
    setSaving(true);
    try {
      const created = await apiCreateSession({
        shareToken: session.shareToken,
        partnerHandle: "",
        date,
        status,
        ownerSide: { ...side, filledAt: new Date().toISOString() },
      });
      navigate({ to: "/sessions/$sessionId", params: { sessionId: created.shareToken } });
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Could not save scene");
    } finally {
      setSaving(false);
    }
  };

  const pct = ((step + 1) / STEPS.length) * 100;

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
          <Sticker className="space-y-4">
            <h2 className="font-display text-2xl text-plum">Scene vision</h2>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Date of play">
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
            <Field label="What are you imagining for this scene?">
              <Textarea
                value={side.vision}
                onChange={(e) => update("vision", e.target.value)}
                rows={5}
                placeholder="Soft and slow… rough and bratty… a long bondage tease… set the mood in your own words."
              />
            </Field>
            <div className="space-y-2">
              <Label className="doc-label">Pick what you're craving for this scene</Label>
              <p className="text-xs text-muted-foreground">
                From your kink list (yes & maybes). Tap to add. Your play partner will see what overlaps.
              </p>
              {interestedKinks.length === 0 ? (
                <p className="text-xs text-muted-foreground italic">
                  Rate some kinks on your <Link to="/kinks" className="underline text-link">kinks page</Link> to pick from them here.
                </p>
              ) : (
                <div className="flex flex-wrap gap-2 pt-1">
                  {interestedKinks.map((k) => {
                    const selected = side.selectedKinks.includes(k.id);
                    const dir = side.directions?.[k.id];
                    return (
                      <div
                        key={k.id}
                        className={cn(
                          "rounded-full border-2 transition flex items-center overflow-hidden",
                          selected ? "bg-yes/30 border-yes" : "border-border/60"
                        )}
                      >
                        <button
                          type="button"
                          onClick={() => toggleKink(k.id)}
                          className={cn(
                            "text-sm px-3 py-1.5",
                            selected ? "text-plum font-semibold" : "text-muted-foreground"
                          )}
                        >
                          {selected ? "✓ " : "+ "}{k.name}
                        </button>
                        {selected && (
                          <div className="flex border-l-2 border-yes/60">
                            {(["give", "receive", "both"] as Direction[]).map((d) => (
                              <button
                                key={d}
                                type="button"
                                onClick={() => setDirection(k.id, d)}
                                className={cn(
                                  "text-[11px] font-semibold px-2 py-1.5 capitalize transition border-r border-yes/40 last:border-r-0",
                                  dir === d ? "bg-yes/60 text-plum" : "text-plum/60 hover:bg-yes/20"
                                )}
                              >
                                {d}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
              <div className="flex gap-2 pt-2">
                <Input
                  value={newKink}
                  onChange={(e) => setNewKink(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addKink(); } }}
                  placeholder="Add your own kink…"
                />
                <Button type="button" onClick={addKink} disabled={!newKink.trim()}>Add</Button>
              </div>
            </div>
          </Sticker>
        )}

        {step === 1 && (
          <Sticker variant="coral" className="space-y-4">
            <h2 className="font-display text-2xl text-plum">Scene & logistics</h2>
            <Field label="Setting (where is it happening?)">
              <Input value={side.setting} onChange={(e) => update("setting", e.target.value)} />
            </Field>
            <Field label="Time constraints">
              <Input value={side.timeConstraints} onChange={(e) => update("timeConstraints", e.target.value)} placeholder="e.g. need to leave by 10pm" />
            </Field>
            <Field label="Music">
              <Input value={side.music} onChange={(e) => update("music", e.target.value)} />
            </Field>
            <Field label="Dress (what do you want to wear?)">
              <Input value={side.dress} onChange={(e) => update("dress", e.target.value)} />
            </Field>
            <Field label="Substances during play">
              <Textarea value={side.substances} onChange={(e) => update("substances", e.target.value)} placeholder="What, how much, when" rows={2} />
            </Field>
            <div className="flex items-center justify-between">
              <Label className="text-sm">Substance use is a hard limit for me</Label>
              <Switch checked={side.substancesHardLimit} onCheckedChange={(v) => update("substancesHardLimit", v)} />
            </div>
            <Field label="Any physical concerns specific to this scene">
              <Textarea value={side.medicalConcerns} onChange={(e) => update("medicalConcerns", e.target.value)} rows={2} placeholder="Sore shoulder, new meds..." />
            </Field>
            <Field label="Other play partners / dynamics to be aware of">
              <Textarea value={side.partnerDynamics} onChange={(e) => update("partnerDynamics", e.target.value)} rows={2} />
            </Field>
            <Field label="Intentions — how do you want to feel?">
              <Textarea value={side.intentions} onChange={(e) => update("intentions", e.target.value)} rows={3} />
            </Field>
            <Field label="What does it look like when you're having a good time?">
              <Textarea value={side.goodTime} onChange={(e) => update("goodTime", e.target.value)} rows={2} />
            </Field>
            <Field label="…and a bad time?">
              <Textarea value={side.badTime} onChange={(e) => update("badTime", e.target.value)} rows={2} />
            </Field>
          </Sticker>
        )}

        {step === 2 && (
          <Sticker className="space-y-4">
            <h2 className="font-display text-2xl text-plum">Privacy & sex</h2>
            <YesNoMaybe
              label="Photos / videos during the scene?"
              value={side.privacy}
              onChange={(v) => update("privacy", v)}
            />
            <YesNoMaybe
              label="Talking about it with others after?"
              value={side.talkingAfter || ""}
              onChange={(v) => update("talkingAfter", v)}
            />
            <YesNoMaybe
              label="Penetrative sex during the scene?"
              value={side.penetrativeSex}
              onChange={(v) => update("penetrativeSex", v)}
            />
            {(side.penetrativeSex === "yes" || side.penetrativeSex === "maybe") && (
              <div className="space-y-4 pl-3 border-l-2 border-yes/40">
                <Field label="When were you last tested for STDs?">
                  <Input
                    type="date"
                    value={side.stdTestDate || ""}
                    onChange={(e) => update("stdTestDate", e.target.value)}
                    max={new Date().toISOString().slice(0, 10)}
                  />
                </Field>
                <Field label="What were the results of your STD test?">
                  <Textarea
                    value={side.stdTestResults || ""}
                    onChange={(e) => update("stdTestResults", e.target.value)}
                    rows={2}
                    placeholder="e.g. all negative on 4-panel"
                  />
                </Field>
                <YesNoSelect
                  label="Are you on PrEP / DoxyPEP?"
                  value={side.prepDoxypep || ""}
                  onChange={(v) => update("prepDoxypep", v)}
                />
                <YesNoSelect
                  label="Are you on birth control?"
                  value={side.birthControl || ""}
                  onChange={(v) => update("birthControl", v)}
                />
              </div>
            )}
          </Sticker>
        )}

        {step === 3 && (
          <Sticker variant="coral" className="space-y-4">
            <h2 className="font-display text-2xl text-plum">For this scene</h2>
            <p className="text-xs text-muted-foreground">
              Your saved kinks ratings are already attached.{" "}
              <Link to="/kinks" className="underline text-link">Edit your kinks library</Link>{" "}
              if you need to. Below: only what's different about this scene.
            </p>
            <Field label="Names you want to be called for this scene (override)">
              <Input value={side.callMe} onChange={(e) => update("callMe", e.target.value)} placeholder={profile.callMe || "from your profile"} />
            </Field>
            <Field label="Off-limits names for this scene (override)">
              <Input value={side.dontCallMe} onChange={(e) => update("dontCallMe", e.target.value)} placeholder={profile.dontCallMe || "from your profile"} />
            </Field>
            <Field label="Extra hard limits for this scene">
              <Textarea value={side.hardLimits} onChange={(e) => update("hardLimits", e.target.value)} rows={2} />
            </Field>
            <Field label="Soft limits / Maybes for this scene">
              <Textarea value={side.softLimits} onChange={(e) => update("softLimits", e.target.value)} rows={2} />
            </Field>
            <Field label="Enthusiastic Yes for this scene">
              <Textarea value={side.yesList} onChange={(e) => update("yesList", e.target.value)} rows={2} />
            </Field>
            <Field label="Anything else to brainstorm">
              <Textarea value={side.brainstorm} onChange={(e) => update("brainstorm", e.target.value)} rows={3} />
            </Field>
            <Field label="Aftercare — pick what matters for this scene">
              <AftercareChecklist
                selected={side.aftercareItems ?? []}
                onChange={(next: string[]) => update("aftercareItems", next)}
              />
            </Field>
            <Field label="Safewords — pick the ones you'll use">
              <Checklist
                defaultItems={DEFAULT_SAFEWORD_ITEMS}
                selected={side.safewordItems ?? []}
                onChange={(next: string[]) => update("safewordItems", next)}
                addPlaceholder="Add another safeword…"
              />
            </Field>
          </Sticker>
        )}

        {step === 4 && (
          <Sticker className="space-y-3 text-center">
            <h2 className="font-display text-2xl text-plum">All set</h2>
            <p className="text-sm text-muted-foreground">
              Save your side and get a share link + QR for your partner to fill out theirs.
            </p>
            <div className="flex flex-col items-center gap-3">
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
            <CloudButton
              onClick={() => {
                setStep((s) => Math.min(STEPS.length - 1, s + 1));
                if (typeof window !== "undefined") window.scrollTo({ top: 0, behavior: "smooth" });
              }}
            >
              Next
            </CloudButton>
          )}
          {step > 0 && (
            <CloudButton
              variant="outline"
              onClick={() => {
                setStep((s) => Math.max(0, s - 1));
                if (typeof window !== "undefined") window.scrollTo({ top: 0, behavior: "smooth" });
              }}
            >
              Back
            </CloudButton>
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

const DIRECTIONS: { value: Direction; label: string }[] = [
  { value: "give", label: "Give" },
  { value: "receive", label: "Receive" },
  { value: "both", label: "Both" },
];

export function DirectionRow({
  name,
  value,
  onChange,
  badge,
}: {
  name: string;
  value: Direction | undefined;
  onChange: (d: Direction) => void;
  badge?: string;
}) {
  return (
    <div className="flex items-center justify-between gap-2 py-1.5">
      <div className="text-sm flex-1 min-w-0 truncate flex items-center gap-2">
        <span className="truncate">{name}</span>
        {badge && (
          <span className="text-[10px] uppercase tracking-wider px-1.5 py-0.5 rounded-full bg-blush text-plum font-semibold shrink-0">
            {badge}
          </span>
        )}
      </div>
      <div className="inline-flex rounded-full border border-border/60 overflow-hidden shrink-0">
        {DIRECTIONS.map((d) => (
          <button
            key={d.value}
            type="button"
            onClick={() => onChange(d.value)}
            className={cn(
              "h-7 px-2.5 text-[11px] font-semibold transition border-r border-border/60 last:border-r-0",
              value === d.value ? "bg-yes/20 text-foreground" : "text-muted-foreground hover:text-foreground"
            )}
          >
            {d.label}
          </button>
        ))}
      </div>
    </div>
  );
}

function YesNoMaybe({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  const opts: { v: string; cls: string }[] = [
    { v: "yes", cls: "bg-yes/20 border-yes" },
    { v: "maybe", cls: "bg-maybe/20 border-maybe" },
    { v: "no", cls: "bg-no/20 border-no" },
  ];
  return (
    <div className="space-y-1.5">
      <Label className="doc-label">{label}</Label>
      <div className="flex gap-2">
        {opts.map((o) => (
          <button
            key={o.v}
            type="button"
            onClick={() => onChange(o.v)}
            className={cn(
              "h-9 px-4 rounded-full text-sm font-semibold border-2 transition capitalize",
              value === o.v ? o.cls : "border-border/60 text-muted-foreground hover:text-foreground"
            )}
          >
            {o.v}
          </button>
        ))}
      </div>
    </div>
  );
}

function YesNoSelect({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  const opts: { v: string; cls: string }[] = [
    { v: "yes", cls: "bg-yes/20 border-yes" },
    { v: "no", cls: "bg-no/20 border-no" },
  ];
  return (
    <div className="space-y-1.5">
      <Label className="doc-label">{label}</Label>
      <div className="flex gap-2">
        {opts.map((o) => (
          <button
            key={o.v}
            type="button"
            onClick={() => onChange(o.v)}
            className={cn(
              "h-9 px-4 rounded-full text-sm font-semibold border-2 transition capitalize",
              value === o.v ? o.cls : "border-border/60 text-muted-foreground hover:text-foreground"
            )}
          >
            {o.v}
          </button>
        ))}
      </div>
    </div>
  );
}
