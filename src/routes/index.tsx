import { createFileRoute, Link } from "@tanstack/react-router";
import { Layout } from "@/components/Layout";
import { Sticker } from "@/components/Sticker";
import { Button } from "@/components/ui/button";
import { Heart, Sparkles, Shield, Zap, Flame } from "lucide-react";
import { useProfile } from "@/lib/storage";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Department of Consent — Kink negotiation made cute" },
      {
        name: "description",
        content:
          "A consent app for pickup play, first-time partners, and ongoing partners. Negotiate kinks, share limits, play safer.",
      },
      { property: "og:title", content: "Department of Consent" },
      { property: "og:description", content: "Negotiate kinks, share limits, play safer." },
    ],
  }),
  component: Index,
});

function Index() {
  const [profile] = useProfile();
  const hasProfile = !!profile.name;

  return (
    <Layout>
      <div className="space-y-6">
        <Sticker className="text-center space-y-3">
          <div className="flex justify-center gap-2 text-coral">
            <Sparkles className="h-6 w-6" />
            <Heart className="h-6 w-6 fill-primary text-primary" />
            <Sparkles className="h-6 w-6" />
          </div>
          <h1 className="font-display text-4xl font-semibold text-plum leading-tight">
            Welcome to the<br />
            Department of Consent
          </h1>
          <p className="text-muted-foreground text-sm max-w-sm mx-auto">
            A soft place to negotiate the spicy stuff. For dungeon pickup play,
            first-time scenes, and growing with longer-term partners. ✿
          </p>
          <div className="pt-2 flex flex-col gap-2">
            {hasProfile ? (
              <>
                <Button asChild size="lg" className="rounded-full font-semibold">
                  <Link to="/sessions/new">Start a new session</Link>
                </Button>
                <Button asChild size="lg" variant="outline" className="rounded-full">
                  <Link to="/sessions">My sessions</Link>
                </Button>
              </>
            ) : (
              <Button asChild size="lg" className="rounded-full font-semibold">
                <Link to="/onboarding">Get started</Link>
              </Button>
            )}
          </div>
        </Sticker>

        <div className="grid grid-cols-2 gap-3">
          <FeatureCard
            icon={<Heart className="h-5 w-5" />}
            title="Your kinks"
            body="Curate yes / maybe / no. Reuse for every session."
          />
          <FeatureCard
            icon={<Shield className="h-5 w-5" />}
            title="Two-way share"
            body="Send a link or QR. They fill their own side."
          />
          <FeatureCard
            icon={<Flame className="h-5 w-5" />}
            title="In-scene card"
            body="Big-type safewords + limits, ready when you need them."
          />
          <FeatureCard
            icon={<Zap className="h-5 w-5" />}
            title="Aftercare"
            body="Checklist + private reflection notes."
          />
        </div>

        <p className="text-center text-xs text-muted-foreground">
          Anonymous-first. Everything lives on this device unless you choose otherwise.
        </p>
      </div>
    </Layout>
  );
}

function FeatureCard({
  icon,
  title,
  body,
}: {
  icon: React.ReactNode;
  title: string;
  body: string;
}) {
  return (
    <div className="sticker-coral p-4 space-y-1">
      <div className="text-coral">{icon}</div>
      <div className="font-display font-semibold text-plum">{title}</div>
      <div className="text-xs text-muted-foreground leading-snug">{body}</div>
    </div>
  );
}
