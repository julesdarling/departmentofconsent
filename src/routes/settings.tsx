import { createFileRoute } from "@tanstack/react-router";
import { Layout } from "@/components/Layout";
import { Sticker } from "@/components/Sticker";
import { Button } from "@/components/ui/button";
import { Link } from "@tanstack/react-router";
import { useProfile, emptyProfile } from "@/lib/storage";
import { Trash2 } from "lucide-react";

export const Route = createFileRoute("/settings")({
  head: () => ({ meta: [{ title: "Profile & settings" }] }),
  component: SettingsPage,
});

function SettingsPage() {
  const [profile, setProfile] = useProfile();

  const wipe = () => {
    if (!confirm("Erase everything stored on this device? This cannot be undone.")) return;
    localStorage.clear();
    window.location.href = "/";
  };

  return (
    <Layout>
      <div className="space-y-5">
        <h1 className="font-display text-3xl font-semibold text-plum">Profile</h1>

        <Sticker className="space-y-2">
          <Row label="Name" value={profile.name} />
          <Row label="Pronouns" value={profile.pronouns} />
          <Row label="Call me" value={profile.callMe} />
          <Row label="Don't call me" value={profile.dontCallMe} />
          <Row label="Healthcare" value={profile.healthcare} />
          <Row label="Emergency contact" value={profile.emergencyContact} />
          <Row label="Default aftercare" value={profile.defaultAftercare} />
          <Button asChild className="w-full rounded-full mt-2"><Link to="/onboarding">Edit profile</Link></Button>
        </Sticker>

        <Sticker variant="coral" className="space-y-2">
          <div className="font-display text-base text-plum">Your data</div>
          <p className="text-xs text-muted-foreground">
            Everything is stored on this device only. No accounts, no servers, no analytics on your sensitive content.
          </p>
          <Button variant="outline" onClick={() => setProfile(emptyProfile)} className="w-full rounded-full">
            Reset profile
          </Button>
          <Button variant="outline" onClick={wipe} className="w-full rounded-full text-destructive border-destructive/40">
            <Trash2 className="h-4 w-4 mr-1" /> Erase everything
          </Button>
        </Sticker>
      </div>
    </Layout>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="border-b border-border/40 pb-1.5">
      <div className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">{label}</div>
      <div className="text-sm whitespace-pre-wrap">{value || <span className="text-muted-foreground italic">not set</span>}</div>
    </div>
  );
}
