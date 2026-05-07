import { createFileRoute, Link } from "@tanstack/react-router";
import { Layout } from "@/components/Layout";
import { CloudButton } from "@/components/CloudButton";
import { useProfile } from "@/lib/storage";
import { useAuth } from "@/lib/useAuth";
import heroImg from "@/assets/hero.jpg";
import wordmark from "@/assets/logo.svg";
import iconWhip from "@/assets/icon-whip.png";
import iconHearts from "@/assets/icon-hearts.png";
import iconChecklist from "@/assets/icon-checklist.png";
import iconBunnies from "@/assets/icon-bunnies.png";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Dept of Consent — Kink negotiation made cute" },
      { name: "description", content: "A consent app for pickup play, first-time partners, and ongoing partners. Negotiate kinks, share limits, play safer." },
    ],
  }),
  component: Index,
});

function Index() {
  const [profile] = useProfile();
  const { user } = useAuth();
  const hasProfile = !!profile.name;
  const startTo = !user ? "/auth" : hasProfile ? "/sessions/new" : "/onboarding";

  return (
    <Layout fullBleed>
      {/* Hero */}
      <section className="relative">
        <div className="relative w-full aspect-[3/5] sm:aspect-[16/10] max-h-[760px] overflow-hidden">
          <img src={heroImg} alt="Friends laughing in a soft pile, joyful and intimate" className="w-full h-full object-cover" />
          <div className="absolute top-4 left-1/2 -translate-x-1/2 w-44 sm:w-56">
            <img src={wordmark} alt="Dept of Consent" className="w-full" />
          </div>
          <div className="absolute bottom-6 left-0 right-0 flex justify-center">
            <CloudButton to={startTo} className="cloud-btn-cta">Start negotiating</CloudButton>
          </div>
        </div>

        <div className="bg-background pt-6 pb-6 px-5 text-center">
          <p className="text-sm text-foreground/80 max-w-xs mx-auto">
            A soft place to negotiate the spicy stuff.
            For dungeon pickup play, first-time scenes,
            and growing with longer-term partners.
          </p>
        </div>
      </section>

      {/* Features section — pink */}
      <section className="bg-pinkbg py-14 px-5">
        <div className="max-w-3xl mx-auto grid grid-cols-1 sm:grid-cols-2 gap-12">
          <Feature
            icon={iconWhip}
            title="Your kinks"
            body="Curate yes / maybe / no. Reuse for every session."
          />
          <Feature
            icon={iconHearts}
            title="Two-way share"
            body="Send a link or QR. They fill their own side."
          />
          <Feature
            icon={iconChecklist}
            title="In-scene card"
            body="Big-type safewords + limits, ready when you need them."
          />
          <Feature
            icon={iconBunnies}
            title="Aftercare"
            body="Checklist + private reflection notes."
          />
        </div>

        <div className="text-center pt-12">
          <CloudButton to={startTo} className="cloud-btn-cta">Start negotiating</CloudButton>
          <p className="text-xs text-foreground/70 mt-5 max-w-xs mx-auto">
            Anonymous-first. Everything lives on this device unless you choose otherwise.
          </p>
          {hasProfile && (
            <p className="text-xs mt-3">
              <Link to="/sessions" className="underline text-coral">View saved scenes</Link>
            </p>
          )}
        </div>
      </section>
    </Layout>
  );
}

function Feature({ icon, title, body }: { icon: string; title: string; body: string }) {
  return (
    <div className="text-center space-y-3">
      <img src={icon} alt="" className="h-28 mx-auto" />
      <h2 className="font-display text-3xl text-plum">{title}</h2>
      <p className="text-sm text-foreground/80 max-w-[260px] mx-auto leading-snug">{body}</p>
    </div>
  );
}
