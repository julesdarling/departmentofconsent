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
  newSession,
  type SessionSide,
} from "@/lib/storage";
import { Link } from "@tanstack/react-router";
import { apiCreateSession } from "@/lib/sessionsApi";
import { useMemo, useState } from "react";
import { nanoid } from "nanoid";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { CloudButton } from "@/components/CloudButton";

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
  const [kinks, setKinks] = useKinks();
  const navigate = useNavigate();

  const [session] = useState(() => newSession(profile, ratings));
  const [date, setDate] = useState(session.date);
  const [side, setSide] = useState<SessionSide>(session.ownerSide);
  const [step, setStep] = useState(0);
  const [saving, setSaving] = useState(false);

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
            <Field label="Date of play">
              <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
            </Field>
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
                    return (
                      <button
                        key={k.id}
                        type="button"
                        onClick={() => toggleKink(k.id)}
                        className={cn(
                          "text-sm px-3 py-1.5 rounded-full border-2 transition",
                          selected
                            ? "bg-yes/30 border-yes text-plum font-semibold"
                            : "border-border/60 text-muted-foreground hover:border-primary/50"
                        )}
                      >
                        {selected ? "Selected " : "+ "}{k.name}
                      </button>
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
            <Field label="Medical concerns specific to this scene">
              <Textarea value={side.medicalConcerns} onChange={(e) => update("medicalConcerns", e.target.value)} rows={2} placeholder="Sore shoulder, on my period, new meds..." />
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
            <Field label="Privacy — photos/videos? Sharing? Talking about it with others after?">
              <Textarea value={side.privacy} onChange={(e) => update("privacy", e.target.value)} rows={4} />
            </Field>
            <Field label="Penetrative sex during the scene?">
              <Textarea value={side.penetrativeSex} onChange={(e) => update("penetrativeSex", e.target.value)} rows={2} placeholder="Yes / no / conditions" />
            </Field>
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
            <Field label="Aftercare — anything different from your default?">
              <Textarea value={side.aftercare} onChange={(e) => update("aftercare", e.target.value)} rows={3} placeholder={profile.defaultAftercare || "from your profile"} />
            </Field>
          </Sticker>
        )}

        {step === 4 && (
          <Sticker className="space-y-3 text-center">
            <h2 className="font-display text-2xl text-plum">All set</h2>
            <p className="text-sm text-muted-foreground">
              Save your side and get a share link + QR for your partner to fill out theirs.
            </p>
            <Button size="lg" disabled={saving} className="cloud-btn-fluid" onClick={() => save("shared")}>
              {saving ? "Saving..." : "Save & get share link"}
            </Button>
            <Button size="lg" disabled={saving} variant="outline" className="cloud-btn-fluid" onClick={() => save("draft")}>
              Save as draft
            </Button>
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
