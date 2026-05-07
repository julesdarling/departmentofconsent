import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Layout } from "@/components/Layout";
import { Sticker } from "@/components/Sticker";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  useProfile,
  useSessionIndex,
  emptySide,
  type SessionSide,
  type Rating,
} from "@/lib/storage";
import { useEffect, useMemo, useState } from "react";
import { useKinks } from "@/lib/storage";
import { useCloudSession } from "@/lib/useCloudSession";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/join/$token")({
  head: () => ({ meta: [{ title: "Join a session" }] }),
  component: JoinPage,
});

function JoinPage() {
  const { token } = Route.useParams();
  const [profile] = useProfile();
  const [kinks] = useKinks();
  const [, setIndex] = useSessionIndex();
  const navigate = useNavigate();
  const { session, error, update } = useCloudSession(token);

  const [side, setSide] = useState<SessionSide | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (session && !side) {
      setSide(session.partnerSide ?? emptySide(profile));
    }
  }, [session, side, profile]);

  const grouped = useMemo(() => {
    const m = new Map<string, typeof kinks>();
    for (const k of kinks) {
      if (!m.has(k.category)) m.set(k.category, []);
      m.get(k.category)!.push(k);
    }
    return Array.from(m.entries());
  }, [kinks]);

  if (session === undefined) return <Layout><Sticker className="text-center">Loading…</Sticker></Layout>;

  if (!session) {
    return (
      <Layout>
        <Sticker className="text-center space-y-3">
          <h1 className="font-display text-2xl text-plum">Session not found</h1>
          <p className="text-sm text-muted-foreground">
            This invite link doesn't match anything. Ask your partner to share it again.
          </p>
          {error && <p className="text-xs text-muted-foreground">{error}</p>}
        </Sticker>
      </Layout>
    );
  }

  if (!side) return null;

  const updateField = <K extends keyof SessionSide>(k: K, v: SessionSide[K]) =>
    setSide((p) => (p ? { ...p, [k]: v } : p));

  const setRating = (id: string, r: Rating) =>
    setSide((p) => (p ? { ...p, ratings: { ...p.ratings, [id]: r } } : p));

  const submit = async () => {
    if (!side) return;
    setSubmitting(true);
    try {
      await update({
        partner_side: { ...side, filledAt: new Date().toISOString() },
        status: "agreed",
      });
      setIndex((prev) =>
        prev.some((s) => s.shareToken === token)
          ? prev
          : [
              ...prev,
              {
                id: session.id,
                shareToken: token,
                partnerHandle: session.ownerSide.name || "Invite",
                date: session.date,
                createdAt: new Date().toISOString(),
                role: "partner",
              },
            ]
      );
      navigate({ to: "/sessions/$sessionId", params: { sessionId: token } });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Layout>
      <div className="space-y-5">
        <Sticker className="text-center space-y-2">
          <h1 className="font-display text-2xl text-plum">
            You've been invited to negotiate ♡
          </h1>
          <p className="text-sm text-muted-foreground">
            {session.ownerSide.name || "Your partner"} wants to plan a scene with you on {session.date}.
            Fill out your side — they'll see what matches.
          </p>
        </Sticker>

        <Sticker variant="coral" className="space-y-3">
          <h2 className="font-display text-lg text-plum">Your side</h2>
          <Field label="Your name / handle">
            <Input value={side.name} onChange={(e) => updateField("name", e.target.value)} />
          </Field>
          <Field label="Pronouns">
            <Input value={side.pronouns} onChange={(e) => updateField("pronouns", e.target.value)} />
          </Field>
          <Field label="Healthcare?">
            <Input value={side.healthcare} onChange={(e) => updateField("healthcare", e.target.value)} />
          </Field>
          <Field label="Emergency contact">
            <Textarea value={side.emergencyContact} onChange={(e) => updateField("emergencyContact", e.target.value)} rows={2} />
          </Field>
          <Field label="Medical concerns">
            <Textarea value={side.medicalConcerns} onChange={(e) => updateField("medicalConcerns", e.target.value)} rows={2} />
          </Field>
          <Field label="Substances">
            <Textarea value={side.substances} onChange={(e) => updateField("substances", e.target.value)} rows={2} />
          </Field>
        </Sticker>

        <Sticker className="space-y-3">
          <h2 className="font-display text-lg text-plum">Tonight's vision</h2>
          <Field label="What are you imagining for this scene?">
            <Textarea
              value={side.vision}
              onChange={(e) => updateField("vision", e.target.value)}
              rows={5}
              placeholder="Set the mood in your own words…"
            />
          </Field>
          <div className="space-y-2">
            <Label className="font-display text-sm text-plum">Pick what you're craving tonight</Label>
            <p className="text-xs text-muted-foreground">From your kink list (yes & maybes).</p>
            <div className="flex flex-wrap gap-2 pt-1">
              {kinks
                .filter((k) => side.ratings[k.id] === "yes" || side.ratings[k.id] === "maybe")
                .map((k) => {
                  const selected = side.selectedKinks.includes(k.id);
                  return (
                    <button
                      key={k.id}
                      type="button"
                      onClick={() =>
                        setSide((p) =>
                          p
                            ? {
                                ...p,
                                selectedKinks: selected
                                  ? p.selectedKinks.filter((x) => x !== k.id)
                                  : [...p.selectedKinks, k.id],
                              }
                            : p
                        )
                      }
                      className={cn(
                        "text-sm px-3 py-1.5 rounded-full border-2 transition",
                        selected
                          ? "bg-yes/30 border-yes text-plum font-semibold"
                          : "border-border/60 text-muted-foreground"
                      )}
                    >
                      {selected ? "✓ " : "+ "}{k.name}
                    </button>
                  );
                })}
            </div>
          </div>
        </Sticker>

        <Sticker className="space-y-3">
          <h2 className="font-display text-lg text-plum">The scene</h2>
          <Field label="What you want to be called"><Input value={side.callMe} onChange={(e) => updateField("callMe", e.target.value)} /></Field>
          <Field label="What you don't want to be called"><Input value={side.dontCallMe} onChange={(e) => updateField("dontCallMe", e.target.value)} /></Field>
          <Field label="Intentions / how you want to feel"><Textarea value={side.intentions} onChange={(e) => updateField("intentions", e.target.value)} rows={3} /></Field>
          <Field label="Privacy preferences"><Textarea value={side.privacy} onChange={(e) => updateField("privacy", e.target.value)} rows={3} /></Field>
          <Field label="Penetrative sex?"><Textarea value={side.penetrativeSex} onChange={(e) => updateField("penetrativeSex", e.target.value)} rows={2} /></Field>
        </Sticker>

        <Sticker variant="coral" className="space-y-2">
          <h2 className="font-display text-lg text-plum">Your safewords</h2>
          <Textarea value={side.safewords} onChange={(e) => updateField("safewords", e.target.value)} rows={10} className="font-mono text-xs" />
        </Sticker>

        <Sticker className="space-y-3">
          <h2 className="font-display text-lg text-plum">Lightning round ✨</h2>
          {grouped.map(([cat, items]) => (
            <div key={cat}>
              <div className="font-display text-sm font-semibold text-coral mt-2 mb-1">{cat}</div>
              {items.map((item) => (
                <div key={item.id} className="flex items-center justify-between gap-2 py-1.5 border-b border-border/40 last:border-0">
                  <div className="text-sm flex-1 min-w-0 truncate">{item.name}</div>
                  <div className="flex gap-1">
                    {(["yes", "maybe", "no"] as Rating[]).map((r) => (
                      <button
                        key={r}
                        onClick={() => setRating(item.id, r)}
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
            </div>
          ))}
        </Sticker>

        <Sticker variant="coral" className="space-y-3">
          <Field label="Hard limits"><Textarea value={side.hardLimits} onChange={(e) => updateField("hardLimits", e.target.value)} rows={2} /></Field>
          <Field label="Soft limits"><Textarea value={side.softLimits} onChange={(e) => updateField("softLimits", e.target.value)} rows={2} /></Field>
          <Field label="Enthusiastic Yes"><Textarea value={side.yesList} onChange={(e) => updateField("yesList", e.target.value)} rows={2} /></Field>
          <Field label="Aftercare needs"><Textarea value={side.aftercare} onChange={(e) => updateField("aftercare", e.target.value)} rows={3} /></Field>
        </Sticker>

        <Button size="lg" disabled={submitting} className="w-full rounded-full font-semibold" onClick={submit}>
          {submitting ? "Submitting..." : "Submit my side ♡"}
        </Button>
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
