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
  useSessionIndex,
  newSession,
  type SessionSide,
} from "@/lib/storage";
import { Link } from "@tanstack/react-router";
import { apiCreateSession } from "@/lib/sessionsApi";
import { useMemo, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

export const Route = createFileRoute("/sessions/new")({
  head: () => ({ meta: [{ title: "New session — Department of Consent" }] }),
  component: NewSession,
});

const STEPS = [
  "Partner",
  "Tonight's vision",
  "Scene & logistics",
  "Privacy & sex",
  "For tonight",
  "Review",
];

function NewSession() {
  const [profile] = useProfile();
  const [ratings] = useRatings();
  const [kinks] = useKinks();
  const [, setIndex] = useSessionIndex();
  const navigate = useNavigate();

  const [session] = useState(() => newSession(profile, ratings));
  const [partnerHandle, setPartnerHandle] = useState("");
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

  const save = async (status: "draft" | "shared" = "shared") => {
    setSaving(true);
    try {
      const created = await apiCreateSession({
        shareToken: session.shareToken,
        partnerHandle,
        date,
        status,
        ownerSide: { ...side, filledAt: new Date().toISOString() },
      });
      setIndex((p) => [
        ...p,
        {
          id: created.id,
          shareToken: created.shareToken,
          partnerHandle: created.partnerHandle,
          date: created.date,
          createdAt: created.createdAt,
          role: "owner",
        },
      ]);
      navigate({ to: "/sessions/$sessionId", params: { sessionId: created.shareToken } });
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Could not save session");
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
            <h2 className="font-display text-xl text-plum">Who & when</h2>
            <Field label="Partner name or handle">
              <Input value={partnerHandle} onChange={(e) => setPartnerHandle(e.target.value)} placeholder="How you'll remember them" />
            </Field>
            <Field label="Date of play">
              <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
            </Field>
            <p className="text-xs text-muted-foreground">
              We'll use your saved profile, kinks, safewords and aftercare as the starting point.
              You can tweak anything that's different for tonight in the next steps.
            </p>
          </Sticker>
        )}

        {step === 1 && (
          <Sticker className="space-y-4">
            <h2 className="font-display text-xl text-plum">Tonight's vision</h2>
            <Field label="What are you imagining for this scene?">
              <Textarea
                value={side.vision}
                onChange={(e) => update("vision", e.target.value)}
                rows={5}
                placeholder="Soft and slow… rough and bratty… a long bondage tease… set the mood in your own words."
              />
            </Field>
            <div className="space-y-2">
              <Label className="font-display text-sm text-plum">Pick what you're craving tonight</Label>
              <p className="text-xs text-muted-foreground">
                From your kink list (yes & maybes). Tap to add. Your partner will see what overlaps.
              </p>
              {interestedKinks.length === 0 ? (
                <p className="text-xs text-muted-foreground italic">
                  Rate some kinks on your <Link to="/kinks" className="underline text-coral">kinks page</Link> to pick from them here.
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
                        {selected ? "✓ " : "+ "}{k.name}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </Sticker>
        )}

        {step === 2 && (
          <Sticker variant="coral" className="space-y-4">
            <h2 className="font-display text-xl text-plum">Scene & logistics</h2>
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
            <Field label="Medical concerns specific to tonight">
              <Textarea value={side.medicalConcerns} onChange={(e) => update("medicalConcerns", e.target.value)} rows={2} placeholder="Sore shoulder, on my period, new meds..." />
            </Field>
            <Field label="Other partners / dynamics to be aware of">
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
            <h2 className="font-display text-xl text-plum">Privacy & sex</h2>
            <Field label="Privacy — photos/videos? Sharing? Talking about it after?">
              <Textarea value={side.privacy} onChange={(e) => update("privacy", e.target.value)} rows={4} />
            </Field>
            <Field label="Penetrative sex during the scene?">
              <Textarea value={side.penetrativeSex} onChange={(e) => update("penetrativeSex", e.target.value)} rows={2} placeholder="Yes / no / conditions" />
            </Field>
          </Sticker>
        )}

        {step === 3 && (
          <Sticker variant="coral" className="space-y-4">
            <h2 className="font-display text-xl text-plum">For tonight</h2>
            <p className="text-xs text-muted-foreground">
              Your saved kinks ratings are already attached.{" "}
              <Link to="/kinks" className="underline text-coral">Edit your kinks library</Link>{" "}
              if you need to. Below: only what's different about tonight.
            </p>
            <Field label="Names you want to be called tonight (override)">
              <Input value={side.callMe} onChange={(e) => update("callMe", e.target.value)} placeholder={profile.callMe || "from your profile"} />
            </Field>
            <Field label="Off-limits names tonight (override)">
              <Input value={side.dontCallMe} onChange={(e) => update("dontCallMe", e.target.value)} placeholder={profile.dontCallMe || "from your profile"} />
            </Field>
            <Field label="Extra hard limits for this scene">
              <Textarea value={side.hardLimits} onChange={(e) => update("hardLimits", e.target.value)} rows={2} />
            </Field>
            <Field label="Soft limits / Maybes for this scene">
              <Textarea value={side.softLimits} onChange={(e) => update("softLimits", e.target.value)} rows={2} />
            </Field>
            <Field label="Enthusiastic Yes for tonight">
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
            <h2 className="font-display text-2xl text-plum">All set ♡</h2>
            <p className="text-sm text-muted-foreground">
              Save your side and get a share link + QR for {partnerHandle || "your partner"} to fill out theirs.
            </p>
            <Button size="lg" disabled={saving} className="w-full rounded-full font-semibold" onClick={() => save("shared")}>
              {saving ? "Saving..." : "Save & get share link"}
            </Button>
            <Button size="lg" disabled={saving} variant="outline" className="w-full rounded-full" onClick={() => save("draft")}>
              Save as draft
            </Button>
          </Sticker>
        )}

        <div className="flex justify-between gap-2">
          <Button
            variant="outline"
            className="rounded-full"
            disabled={step === 0}
            onClick={() => setStep((s) => Math.max(0, s - 1))}
          >
            <ChevronLeft className="h-4 w-4 mr-1" /> Back
          </Button>
          {step < STEPS.length - 1 && (
            <Button
              className="rounded-full ml-auto"
              onClick={() => setStep((s) => Math.min(STEPS.length - 1, s + 1))}
            >
              Next <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          )}
        </div>
      </div>
    </Layout>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <Label className="font-display text-sm text-plum">{label}</Label>
      {children}
    </div>
  );
}
