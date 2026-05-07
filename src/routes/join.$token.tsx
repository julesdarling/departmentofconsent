import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Layout } from "@/components/Layout";
import { Sticker } from "@/components/Sticker";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  useSessions,
  useProfile,
  emptySide,
  getParticipantId,
  type SessionSide,
  type Rating,
} from "@/lib/storage";
import { useEffect, useMemo, useState } from "react";
import { useKinks } from "@/lib/storage";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/join/$token")({
  head: () => ({ meta: [{ title: "Join a session" }] }),
  component: JoinPage,
});

function JoinPage() {
  const { token } = Route.useParams();
  const [sessions, setSessions] = useSessions();
  const [profile] = useProfile();
  const [kinks] = useKinks();
  const navigate = useNavigate();

  const session = sessions.find((s) => s.shareToken === token);
  const [side, setSide] = useState<SessionSide | null>(null);

  useEffect(() => {
    if (session && !side) {
      // existing partner side or fresh
      if (session.partnerSide && session.partnerSide.participantId === getParticipantId()) {
        setSide(session.partnerSide);
      } else {
        setSide(emptySide(profile));
      }
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

  if (!session) {
    return (
      <Layout>
        <Sticker className="text-center space-y-3">
          <h1 className="font-display text-2xl text-plum">Session not found</h1>
          <p className="text-sm text-muted-foreground">
            This link may have been opened on a different device than the one that created the session.
            Right now sessions live on each device, so the host needs to open this link on their phone, or you both need an account (coming soon).
          </p>
        </Sticker>
      </Layout>
    );
  }

  if (!side) return null;

  const update = <K extends keyof SessionSide>(k: K, v: SessionSide[K]) =>
    setSide((p) => (p ? { ...p, [k]: v } : p));

  const setRating = (id: string, r: Rating) =>
    setSide((p) => (p ? { ...p, ratings: { ...p.ratings, [id]: r } } : p));

  const submit = () => {
    setSessions((prev) =>
      prev.map((s) =>
        s.shareToken === token
          ? { ...s, partnerSide: { ...side, filledAt: new Date().toISOString() }, status: "agreed" }
          : s
      )
    );
    navigate({ to: "/sessions/$sessionId", params: { sessionId: session.id } });
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
            <Input value={side.name} onChange={(e) => update("name", e.target.value)} />
          </Field>
          <Field label="Pronouns">
            <Input value={side.pronouns} onChange={(e) => update("pronouns", e.target.value)} />
          </Field>
          <Field label="Healthcare?">
            <Input value={side.healthcare} onChange={(e) => update("healthcare", e.target.value)} />
          </Field>
          <Field label="Emergency contact">
            <Textarea value={side.emergencyContact} onChange={(e) => update("emergencyContact", e.target.value)} rows={2} />
          </Field>
          <Field label="Medical concerns">
            <Textarea value={side.medicalConcerns} onChange={(e) => update("medicalConcerns", e.target.value)} rows={2} />
          </Field>
          <Field label="Substances">
            <Textarea value={side.substances} onChange={(e) => update("substances", e.target.value)} rows={2} />
          </Field>
        </Sticker>

        <Sticker className="space-y-3">
          <h2 className="font-display text-lg text-plum">The scene</h2>
          <Field label="What you want to be called"><Input value={side.callMe} onChange={(e) => update("callMe", e.target.value)} /></Field>
          <Field label="What you don't want to be called"><Input value={side.dontCallMe} onChange={(e) => update("dontCallMe", e.target.value)} /></Field>
          <Field label="Intentions / how you want to feel"><Textarea value={side.intentions} onChange={(e) => update("intentions", e.target.value)} rows={3} /></Field>
          <Field label="Privacy preferences"><Textarea value={side.privacy} onChange={(e) => update("privacy", e.target.value)} rows={3} /></Field>
          <Field label="Penetrative sex?"><Textarea value={side.penetrativeSex} onChange={(e) => update("penetrativeSex", e.target.value)} rows={2} /></Field>
        </Sticker>

        <Sticker variant="coral" className="space-y-2">
          <h2 className="font-display text-lg text-plum">Your safewords</h2>
          <Textarea value={side.safewords} onChange={(e) => update("safewords", e.target.value)} rows={10} className="font-mono text-xs" />
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
          <Field label="Hard limits"><Textarea value={side.hardLimits} onChange={(e) => update("hardLimits", e.target.value)} rows={2} /></Field>
          <Field label="Soft limits"><Textarea value={side.softLimits} onChange={(e) => update("softLimits", e.target.value)} rows={2} /></Field>
          <Field label="Enthusiastic Yes"><Textarea value={side.yesList} onChange={(e) => update("yesList", e.target.value)} rows={2} /></Field>
          <Field label="Aftercare needs"><Textarea value={side.aftercare} onChange={(e) => update("aftercare", e.target.value)} rows={3} /></Field>
        </Sticker>

        <Button size="lg" className="w-full rounded-full font-semibold" onClick={submit}>
          Submit my side ♡
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
