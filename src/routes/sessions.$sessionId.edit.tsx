import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { Layout } from "@/components/Layout";
import { Sticker } from "@/components/Sticker";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { useCloudSession } from "@/lib/useCloudSession";
import { useKinks, useRatings, type SessionSide } from "@/lib/storage";
import { useEffect, useMemo, useState } from "react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { RequireAuth } from "@/components/RequireAuth";

export const Route = createFileRoute("/sessions/$sessionId/edit")({
  head: () => ({ meta: [{ title: "Edit scene" }] }),
  component: () => <RequireAuth><EditScene /></RequireAuth>,
});

function EditScene() {
  const { sessionId } = Route.useParams();
  const { session, update } = useCloudSession(sessionId);
  const [kinks] = useKinks();
  const [ratings] = useRatings();
  const navigate = useNavigate();

  const [side, setSide] = useState<SessionSide | null>(null);
  const [partnerHandle, setPartnerHandle] = useState("");
  const [date, setDate] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (session && !side) {
      setSide(session.ownerSide);
      setPartnerHandle(session.partnerHandle);
      setDate(session.date);
    }
  }, [session, side]);

  const interestedKinks = useMemo(
    () => kinks.filter((k) => ratings[k.id] === "yes" || ratings[k.id] === "maybe"),
    [kinks, ratings]
  );

  if (session === undefined || !side) {
    return <Layout><Sticker className="text-center">Loading…</Sticker></Layout>;
  }
  if (!session) {
    return <Layout><Sticker className="text-center">Not found.</Sticker></Layout>;
  }

  const u = <K extends keyof SessionSide>(k: K, v: SessionSide[K]) =>
    setSide((p) => (p ? { ...p, [k]: v } : p));

  const toggleKink = (id: string) =>
    setSide((p) => {
      if (!p) return p;
      const has = p.selectedKinks.includes(id);
      return { ...p, selectedKinks: has ? p.selectedKinks.filter((x) => x !== id) : [...p.selectedKinks, id] };
    });

  const save = async () => {
    setSaving(true);
    try {
      await update({
        partner_handle: partnerHandle,
        date,
        owner_side: { ...side, filledAt: new Date().toISOString() },
      });
      toast.success("Scene updated");
      navigate({ to: "/sessions/$sessionId", params: { sessionId } });
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to save");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Layout>
      <div className="space-y-5">
        <div className="flex items-center justify-between">
          <h1 className="font-display text-3xl font-semibold text-plum">Edit scene</h1>
          <Link to="/sessions/$sessionId" params={{ sessionId }} className="text-xs text-coral underline">Cancel</Link>
        </div>

        <Sticker className="space-y-4">
          <Field label="Play partner name or handle">
            <Input value={partnerHandle} onChange={(e) => setPartnerHandle(e.target.value)} />
          </Field>
          <Field label="Date of play">
            <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
          </Field>
        </Sticker>

        <Sticker className="space-y-4">
          <h2 className="font-display text-2xl text-plum font-semibold">Scene vision</h2>
          <Field label="What are you imagining for this scene?">
            <Textarea value={side.vision} onChange={(e) => u("vision", e.target.value)} rows={5} />
          </Field>
          <div className="space-y-2">
            <Label className="doc-label">Pick what you're craving for this scene</Label>
            {interestedKinks.length === 0 ? (
              <p className="text-xs text-muted-foreground italic">
                Rate some kinks on your <Link to="/kinks" className="underline text-coral">kinks page</Link>.
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
          </div>
        </Sticker>

        <Sticker variant="coral" className="space-y-4">
          <h2 className="font-display text-2xl text-plum font-semibold">Scene & logistics</h2>
          <Field label="Setting"><Input value={side.setting} onChange={(e) => u("setting", e.target.value)} /></Field>
          <Field label="Time constraints"><Input value={side.timeConstraints} onChange={(e) => u("timeConstraints", e.target.value)} /></Field>
          <Field label="Music"><Input value={side.music} onChange={(e) => u("music", e.target.value)} /></Field>
          <Field label="Dress"><Input value={side.dress} onChange={(e) => u("dress", e.target.value)} /></Field>
          <Field label="Substances during play"><Textarea value={side.substances} onChange={(e) => u("substances", e.target.value)} rows={2} /></Field>
          <div className="flex items-center justify-between">
            <Label className="text-sm">Substance use is a hard limit for me</Label>
            <Switch checked={side.substancesHardLimit} onCheckedChange={(v) => u("substancesHardLimit", v)} />
          </div>
          <Field label="Medical concerns"><Textarea value={side.medicalConcerns} onChange={(e) => u("medicalConcerns", e.target.value)} rows={2} /></Field>
          <Field label="Other play partners / dynamics"><Textarea value={side.partnerDynamics} onChange={(e) => u("partnerDynamics", e.target.value)} rows={2} /></Field>
          <Field label="Intentions"><Textarea value={side.intentions} onChange={(e) => u("intentions", e.target.value)} rows={3} /></Field>
          <Field label="Good time looks like"><Textarea value={side.goodTime} onChange={(e) => u("goodTime", e.target.value)} rows={2} /></Field>
          <Field label="Bad time looks like"><Textarea value={side.badTime} onChange={(e) => u("badTime", e.target.value)} rows={2} /></Field>
        </Sticker>

        <Sticker className="space-y-4">
          <h2 className="font-display text-2xl text-plum font-semibold">Privacy & sex</h2>
          <Field label="Privacy"><Textarea value={side.privacy} onChange={(e) => u("privacy", e.target.value)} rows={4} /></Field>
          <Field label="Penetrative sex?"><Textarea value={side.penetrativeSex} onChange={(e) => u("penetrativeSex", e.target.value)} rows={2} /></Field>
        </Sticker>

        <Sticker variant="coral" className="space-y-4">
          <h2 className="font-display text-2xl text-plum font-semibold">For this scene</h2>
          <Field label="Names you want to be called"><Input value={side.callMe} onChange={(e) => u("callMe", e.target.value)} /></Field>
          <Field label="Off-limits names"><Input value={side.dontCallMe} onChange={(e) => u("dontCallMe", e.target.value)} /></Field>
          <Field label="Hard limits for this scene"><Textarea value={side.hardLimits} onChange={(e) => u("hardLimits", e.target.value)} rows={2} /></Field>
          <Field label="Soft limits / Maybes"><Textarea value={side.softLimits} onChange={(e) => u("softLimits", e.target.value)} rows={2} /></Field>
          <Field label="Enthusiastic Yes"><Textarea value={side.yesList} onChange={(e) => u("yesList", e.target.value)} rows={2} /></Field>
          <Field label="Brainstorm"><Textarea value={side.brainstorm} onChange={(e) => u("brainstorm", e.target.value)} rows={3} /></Field>
          <Field label="Aftercare"><Textarea value={side.aftercare} onChange={(e) => u("aftercare", e.target.value)} rows={3} /></Field>
        </Sticker>

        <div className="flex justify-center">
          <Button disabled={saving} onClick={save} size="lg">
            {saving ? "Saving…" : "Save changes"}
          </Button>
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
