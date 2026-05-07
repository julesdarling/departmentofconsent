import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Layout } from "@/components/Layout";
import { Sticker } from "@/components/Sticker";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useProfile } from "@/lib/storage";
import { useState } from "react";

export const Route = createFileRoute("/onboarding")({
  head: () => ({ meta: [{ title: "Set up your profile — Department of Consent" }] }),
  component: Onboarding,
});

function Onboarding() {
  const [profile, setProfile] = useProfile();
  const [draft, setDraft] = useState(profile);
  const navigate = useNavigate();

  const update = <K extends keyof typeof draft>(key: K, value: (typeof draft)[K]) =>
    setDraft((p) => ({ ...p, [key]: value }));

  return (
    <Layout>
      <div className="space-y-5">
        <div className="text-center">
          <h1 className="font-display text-3xl font-semibold text-plum">
            Tell us about you ♡
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Saved on this device. You can change anything later.
          </p>
        </div>

        <Sticker className="space-y-4">
          <Field label="Name (or handle)">
            <Input value={draft.name} onChange={(e) => update("name", e.target.value)} placeholder="What we'll call you" />
          </Field>
          <Field label="Pronouns">
            <Input value={draft.pronouns} onChange={(e) => update("pronouns", e.target.value)} placeholder="she/her, they/them, etc." />
          </Field>
          <Field label="Names you love being called">
            <Input value={draft.callMe} onChange={(e) => update("callMe", e.target.value)} placeholder="goddess, princess, sir..." />
          </Field>
          <Field label="Names that are off-limits">
            <Input value={draft.dontCallMe} onChange={(e) => update("dontCallMe", e.target.value)} />
          </Field>
        </Sticker>

        <Sticker variant="coral" className="space-y-4">
          <Field label="Healthcare access">
            <Input value={draft.healthcare} onChange={(e) => update("healthcare", e.target.value)} placeholder="e.g. yes, insured / urgent care nearby" />
          </Field>
          <Field label="Emergency contact">
            <Textarea value={draft.emergencyContact} onChange={(e) => update("emergencyContact", e.target.value)} placeholder="Name, relationship, phone" rows={2} />
          </Field>
          <Field label="Default aftercare needs">
            <Textarea value={draft.defaultAftercare} onChange={(e) => update("defaultAftercare", e.target.value)} placeholder="Cuddles, water, snacks, alone time, check-in tomorrow..." rows={3} />
          </Field>
        </Sticker>

        <Sticker className="space-y-2">
          <Label className="font-display text-base text-plum">Your default safewords</Label>
          <p className="text-xs text-muted-foreground">Pre-filled with a common set. Edit to taste.</p>
          <Textarea value={draft.defaultSafewords} onChange={(e) => update("defaultSafewords", e.target.value)} rows={10} className="font-mono text-xs" />
        </Sticker>

        <Button
          size="lg"
          className="w-full rounded-full font-semibold"
          onClick={() => {
            setProfile(draft);
            navigate({ to: "/kinks" });
          }}
        >
          Save & continue to kinks →
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
