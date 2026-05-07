import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
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
  useSessions,
  newSession,
  type SessionSide,
} from "@/lib/storage";
import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

export const Route = createFileRoute("/sessions/new")({
  head: () => ({ meta: [{ title: "New session — Department of Consent" }] }),
  component: NewSession,
});

const STEPS = [
  "Partner",
  "Scene & logistics",
  "Privacy & sex",
  "For tonight",
  "Review",
];

function NewSession() {
  const [profile] = useProfile();
  const [ratings] = useRatings();
  const [, setSessions] = useSessions();
  const navigate = useNavigate();

  const [session] = useState(() => newSession(profile, ratings));
  const [partnerHandle, setPartnerHandle] = useState("");
  const [date, setDate] = useState(session.date);
  const [side, setSide] = useState<SessionSide>(session.ownerSide);
  const [step, setStep] = useState(0);

  const update = <K extends keyof SessionSide>(k: K, v: SessionSide[K]) =>
    setSide((p) => ({ ...p, [k]: v }));

  const save = (status: "draft" | "shared" = "shared") => {
    const final = {
      ...session,
      partnerHandle,
      date,
      status,
      ownerSide: { ...side, filledAt: new Date().toISOString() },
    };
    setSessions((p) => [...p, final]);
    navigate({ to: "/sessions/$sessionId", params: { sessionId: final.id } });
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
            <Button size="lg" className="w-full rounded-full font-semibold" onClick={() => save("shared")}>
              Save & get share link
            </Button>
            <Button size="lg" variant="outline" className="w-full rounded-full" onClick={() => save("draft")}>
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
