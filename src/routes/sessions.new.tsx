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
  useSessions,
  newSession,
  type SessionSide,
  type Rating,
} from "@/lib/storage";
import { useMemo, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/sessions/new")({
  head: () => ({ meta: [{ title: "New session — Department of Consent" }] }),
  component: NewSession,
});

const STEPS = [
  "Partner",
  "Logistics",
  "The scene",
  "Privacy & sex",
  "Safewords",
  "Yes / Maybe / No",
  "Aftercare",
  "Review",
];

function NewSession() {
  const [profile] = useProfile();
  const [ratings] = useRatings();
  const [kinks] = useKinks();
  const [, setSessions] = useSessions();
  const navigate = useNavigate();

  const [session] = useState(() => newSession(profile, ratings));
  const [partnerHandle, setPartnerHandle] = useState("");
  const [date, setDate] = useState(session.date);
  const [side, setSide] = useState<SessionSide>(session.ownerSide);
  const [step, setStep] = useState(0);

  const update = <K extends keyof SessionSide>(k: K, v: SessionSide[K]) =>
    setSide((p) => ({ ...p, [k]: v }));

  const setKinkRating = (id: string, r: Rating) =>
    setSide((p) => ({ ...p, ratings: { ...p.ratings, [id]: r } }));

  const grouped = useMemo(() => {
    const m = new Map<string, typeof kinks>();
    for (const k of kinks) {
      if (!m.has(k.category)) m.set(k.category, []);
      m.get(k.category)!.push(k);
    }
    return Array.from(m.entries());
  }, [kinks]);

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
          </Sticker>
        )}

        {step === 1 && (
          <Sticker variant="coral" className="space-y-4">
            <h2 className="font-display text-xl text-plum">Logistics & safety</h2>
            <Field label="Do you have healthcare?">
              <Input value={side.healthcare} onChange={(e) => update("healthcare", e.target.value)} />
            </Field>
            <Field label="Emergency contact (name + how to reach them)">
              <Textarea value={side.emergencyContact} onChange={(e) => update("emergencyContact", e.target.value)} rows={2} />
            </Field>
            <Field label="Dynamics with other partners to be aware of?">
              <Textarea value={side.partnerDynamics} onChange={(e) => update("partnerDynamics", e.target.value)} rows={2} />
            </Field>
            <Field label="Time constraints">
              <Input value={side.timeConstraints} onChange={(e) => update("timeConstraints", e.target.value)} placeholder="e.g. need to leave by 10pm" />
            </Field>
            <Field label="Medical concerns">
              <Textarea value={side.medicalConcerns} onChange={(e) => update("medicalConcerns", e.target.value)} rows={2} />
            </Field>
            <Field label="Substances during play">
              <Textarea value={side.substances} onChange={(e) => update("substances", e.target.value)} placeholder="What, how much, when" rows={2} />
            </Field>
            <div className="flex items-center justify-between">
              <Label className="text-sm">Substance use is a hard limit for me</Label>
              <Switch checked={side.substancesHardLimit} onCheckedChange={(v) => update("substancesHardLimit", v)} />
            </div>
          </Sticker>
        )}

        {step === 2 && (
          <Sticker className="space-y-4">
            <h2 className="font-display text-xl text-plum">The scene</h2>
            <Field label="Setting (where is it happening?)">
              <Input value={side.setting} onChange={(e) => update("setting", e.target.value)} />
            </Field>
            <Field label="Music">
              <Input value={side.music} onChange={(e) => update("music", e.target.value)} />
            </Field>
            <Field label="Dress (what do you want to wear?)">
              <Input value={side.dress} onChange={(e) => update("dress", e.target.value)} />
            </Field>
            <Field label="What you want to be called">
              <Input value={side.callMe} onChange={(e) => update("callMe", e.target.value)} />
            </Field>
            <Field label="What you don't want to be called">
              <Input value={side.dontCallMe} onChange={(e) => update("dontCallMe", e.target.value)} />
            </Field>
            <Field label="Intentions / feelings — how do you want to feel?">
              <Textarea value={side.intentions} onChange={(e) => update("intentions", e.target.value)} rows={3} />
            </Field>
            <Field label="What does it look like when you're having a good time?">
              <Textarea value={side.goodTime} onChange={(e) => update("goodTime", e.target.value)} rows={2} />
            </Field>
            <Field label="What does it look like when you're having a bad time?">
              <Textarea value={side.badTime} onChange={(e) => update("badTime", e.target.value)} rows={2} />
            </Field>
          </Sticker>
        )}

        {step === 3 && (
          <Sticker variant="coral" className="space-y-4">
            <h2 className="font-display text-xl text-plum">Privacy & sex</h2>
            <Field label="Privacy — photos/videos? Sharing? Talking about it after?">
              <Textarea value={side.privacy} onChange={(e) => update("privacy", e.target.value)} rows={4} />
            </Field>
            <Field label="Penetrative sex during the scene?">
              <Textarea value={side.penetrativeSex} onChange={(e) => update("penetrativeSex", e.target.value)} rows={2} placeholder="Yes / no / conditions" />
            </Field>
          </Sticker>
        )}

        {step === 4 && (
          <Sticker className="space-y-3">
            <h2 className="font-display text-xl text-plum">Safewords</h2>
            <p className="text-xs text-muted-foreground">Edit if this scene needs different signals.</p>
            <Textarea value={side.safewords} onChange={(e) => update("safewords", e.target.value)} rows={14} className="font-mono text-xs" />
          </Sticker>
        )}

        {step === 5 && (
          <div className="space-y-4">
            <Sticker variant="coral">
              <h2 className="font-display text-xl text-plum">Lightning round ✨</h2>
              <p className="text-xs text-muted-foreground mt-1">
                Tap-through. These start from your kinks library — adjust for tonight.
              </p>
            </Sticker>
            {grouped.map(([cat, items]) => (
              <Sticker key={cat} className="space-y-1">
                <div className="font-display text-base font-semibold text-coral mb-1">{cat}</div>
                {items.map((item) => (
                  <div key={item.id} className="flex items-center justify-between gap-2 py-2 border-b border-border/50 last:border-0">
                    <div className="text-sm flex-1 min-w-0 truncate">{item.name}</div>
                    <div className="flex gap-1">
                      {(["yes", "maybe", "no"] as Rating[]).map((r) => (
                        <button
                          key={r}
                          onClick={() => setKinkRating(item.id, r)}
                          className={cn(
                            "h-7 px-2.5 rounded-full text-xs font-semibold border-2 transition capitalize",
                            side.ratings[item.id] === r
                              ? r === "yes" ? "bg-yes/20 border-yes"
                              : r === "maybe" ? "bg-maybe/20 border-maybe"
                              : "bg-no/20 border-no"
                              : "border-border/60 text-muted-foreground"
                          )}
                        >
                          {r}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </Sticker>
            ))}
            <Sticker className="space-y-3">
              <Field label="Any other actions you want?">
                <Textarea value={side.actions} onChange={(e) => update("actions", e.target.value)} rows={3} />
              </Field>
              <Field label="Hard limits (No)">
                <Textarea value={side.hardLimits} onChange={(e) => update("hardLimits", e.target.value)} rows={2} />
              </Field>
              <Field label="Soft limits (Maybe)">
                <Textarea value={side.softLimits} onChange={(e) => update("softLimits", e.target.value)} rows={2} />
              </Field>
              <Field label="Enthusiastic Yes">
                <Textarea value={side.yesList} onChange={(e) => update("yesList", e.target.value)} rows={2} />
              </Field>
            </Sticker>
          </div>
        )}

        {step === 6 && (
          <Sticker variant="coral" className="space-y-4">
            <h2 className="font-display text-xl text-plum">Aftercare</h2>
            <Field label="What do you need afterward?">
              <Textarea value={side.aftercare} onChange={(e) => update("aftercare", e.target.value)} rows={5} placeholder="Cuddles, water, snacks, alone time, a check-in tomorrow..." />
            </Field>
            <Field label="Brainstorming space (anything else)">
              <Textarea value={side.brainstorm} onChange={(e) => update("brainstorm", e.target.value)} rows={4} />
            </Field>
          </Sticker>
        )}

        {step === 7 && (
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
