import { createFileRoute, Link } from "@tanstack/react-router";
import { Layout } from "@/components/Layout";
import { CloudButton } from "@/components/CloudButton";
import { useProfile } from "@/lib/storage";
import { useAuth } from "@/lib/useAuth";
import { Check } from "lucide-react";
import heroImg from "@/assets/hero-friends.jpg";
import sectionBg from "@/assets/section-bg.jpg";
import wordmark from "@/assets/site-logo.svg";
import footerWordmark from "@/assets/footer-wordmark.svg";
import flag from "@/assets/trans-flag.svg";
import stickerWhip from "@/assets/sticker-whip.png";
import stickerHandcuffs from "@/assets/sticker-handcuffs.png";
import stickerWand from "@/assets/sticker-wand.png";
import stickerGag from "@/assets/sticker-gag.png";
import stickerCollar from "@/assets/sticker-collar.png";
import stickerBoundHands from "@/assets/sticker-bound-hands.png";
import stickerRope from "@/assets/sticker-rope.png";
import stickerFeather from "@/assets/sticker-feather.png";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Dept of Consent — A better way to talk about limits, kinks, and aftercare" },
      { name: "description", content: "A soft place to negotiate the spicy stuff. For dungeon pickup play, first-time scenes, and growing with longer-term partners." },
    ],
  }),
  component: Index,
});

const QUESTIONS = [
  "What turns you on, and how?",
  "What's a hard no?",
  "What scenes do you fantasize about?",
  "What do you need to feel safe?",
  "What kind of aftercare do you want?",
  "What words make you feel hot — or shut down?",
];

const STEPS = [
  { n: "Step 1", title: "Choose your interests and limits", body: "Build your kink menu once. Yes, maybe, no — and what direction you want each one." },
  { n: "Step 2", title: "Share with your play partner", body: "Send a link or QR. They fill out their side privately, on their own time." },
  { n: "Step 3", title: "Compare and plan the scene", body: "See where you overlap. Talk through the details. Agree on what the scene is." },
  { n: "Step 4", title: "Keep the scene card handy", body: "Big-type safewords, limits, and aftercare in your pocket when you need them." },
];

function Index() {
  const [profile] = useProfile();
  const { user } = useAuth();
  const hasProfile = !!profile.name;
  const startTo = !user ? "/auth" : hasProfile ? "/sessions/new" : "/onboarding";

  return (
    <Layout fullBleed>
      {/* Top header */}
      <header className="w-full px-5 sm:px-10 pt-6 sm:pt-8 pb-2 flex items-center justify-between max-w-7xl mx-auto">
        <Link to="/" aria-label="Dept of Consent — Home" className="block">
          <img src={wordmark} alt="Dept of Consent" className="h-7 sm:h-8 w-auto" />
        </Link>
        <Link
          to={user ? "/sessions" : "/auth"}
          className="text-sm font-semibold text-plum/70 hover:text-plum bg-blush hover:bg-blush/80 transition px-5 py-2.5 rounded-full"
        >
          {user ? "My scenes" : "Sign in"}
        </Link>
      </header>

      {/* 1. Hero */}
      <section className="px-5 sm:px-10 pt-4 sm:pt-10 pb-6 sm:pb-12 max-w-6xl mx-auto">
        <div className="grid md:grid-cols-[5fr_6fr] gap-8 md:gap-12 items-center">
          <div className="space-y-6 order-2 md:order-1 relative">
            <h1 className="font-display text-plum leading-[1.02] text-[2.5rem] sm:text-5xl lg:text-[3.75rem] tracking-tight">
              A better way to talk about limits, kinks, and aftercare.
            </h1>
            <p className="text-foreground/85 max-w-md text-base sm:text-[17px] leading-snug">
              What words, signals, or boundaries stop the scene immediately?
            </p>
            <div className="pt-1">
              <CloudButton to={startTo} className="!max-w-[15rem]">Create a scene</CloudButton>
            </div>
            <p className="text-[10px] text-muted-foreground/80 max-w-[18rem] leading-snug pt-1">
              Department of Consent is a tool for negotiating consent, not a substitute for it.
              Your scene, your responsibility — please play safely with people you trust.
            </p>
          </div>

          <div className="relative order-1 md:order-2">
            <div className="relative rounded-3xl overflow-hidden aspect-[4/3] bg-blush">
              <img src={heroImg} alt="Friends laughing in a soft pile" className="w-full h-full object-cover" />
            </div>
            <img src={stickerWhip} alt="" aria-hidden className="absolute -left-6 sm:-left-10 -bottom-10 sm:-bottom-14 w-24 sm:w-32 lg:w-36 rotate-[-18deg] pointer-events-none drop-shadow-sm" />
            <img src={stickerHandcuffs} alt="" aria-hidden className="absolute -right-4 sm:-right-8 -bottom-6 sm:-bottom-10 w-24 sm:w-32 lg:w-36 rotate-[8deg] pointer-events-none drop-shadow-sm" />
          </div>
        </div>
      </section>

      {/* Bridge sticker */}
      <div className="flex justify-center mt-8 mb-2 sm:mt-10 sm:mb-4">
        <img src={stickerGag} alt="" aria-hidden className="w-16 sm:w-20 rotate-[10deg] pointer-events-none" />
      </div>

      {/* 2. "What are you into?" is not enough */}
      <section className="px-5 sm:px-10 py-8 sm:py-12 max-w-2xl mx-auto relative">
        <img src={stickerWand} alt="" aria-hidden className="hidden md:block absolute -left-20 bottom-12 w-24 rotate-[-18deg] pointer-events-none" />
        <div className="feature-card p-8 sm:p-12 text-center">
          <h2 className="font-display italic text-3xl sm:text-[2.25rem] text-plum leading-tight">
            <span>"What are you into?"</span>
            <br />is not enough.
          </h2>
          <p className="text-sm text-foreground/70 max-w-md mx-auto mt-4 leading-snug">
            Real consent is in the details. They need to be agreed on, before the scene starts.
          </p>
          <p className="text-[11px] uppercase tracking-[0.14em] font-bold text-plum mt-7 mb-4">
            So bring your answers to:
          </p>
          <ul className="space-y-3 text-left max-w-sm mx-auto">
            {QUESTIONS.map((q) => (
              <li key={q} className="flex items-start gap-3 text-[15px] text-plum">
                <span className="shrink-0 mt-0.5 inline-flex items-center justify-center w-5 h-5 rounded-full bg-coral text-white">
                  <Check className="w-3 h-3" strokeWidth={3} />
                </span>
                <span>{q}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* 3. How it works */}
      <section className="px-5 sm:px-10 py-10 sm:py-16 max-w-6xl mx-auto relative">
        <div className="text-center space-y-2 mb-8 sm:mb-10">
          <h2 className="font-display text-4xl sm:text-5xl text-plum">How it works</h2>
          <p className="text-sm text-foreground/70 max-w-md mx-auto">
            A scene plan in four easy steps.
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {STEPS.map((s) => (
            <div key={s.n} className="feature-card p-6">
              <div className="text-[10px] uppercase tracking-[0.14em] font-bold text-coral mb-2">{s.n}</div>
              <h3 className="font-display text-[1.375rem] text-plum leading-tight mb-2">{s.title}</h3>
              <p className="text-[13px] text-foreground/70 leading-snug">{s.body}</p>
            </div>
          ))}
        </div>
        <div className="flex justify-center pt-8 sm:pt-10">
          <img src={stickerBoundHands} alt="" aria-hidden className="w-24 sm:w-28 rotate-[3deg]" />
        </div>
      </section>

      {/* 4. Feature cluster — staggered collage */}
      <section className="px-5 sm:px-10 py-10 sm:py-20 max-w-4xl mx-auto relative">
        <img src={stickerFeather} alt="" aria-hidden className="hidden md:block absolute -left-16 top-1/3 w-28 rotate-[-15deg] pointer-events-none" />
        <img src={stickerRope} alt="" aria-hidden className="hidden md:block absolute -right-16 top-12 w-32 rotate-[12deg] pointer-events-none" />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-x-10 md:gap-y-0 relative">
          {/* Personal kink menu */}
          <div className="feature-card p-6 md:p-7 md:mt-0">
            <div className="flex flex-wrap gap-1.5 mb-5">
              {["Impact", "Bondage", "Sensation", "Power", "Service", "Roleplay", "Edgeplay", "Verbal"].map((c) => (
                <span key={c} className="text-[10px] px-2 py-0.5 rounded-full bg-blush text-plum font-semibold">{c}</span>
              ))}
            </div>
            <h3 className="font-display text-[1.75rem] sm:text-3xl text-plum leading-[1.05]">Your personal<br />kink menu</h3>
            <p className="text-[13px] text-foreground/70 mt-3 leading-snug">
              Save your yes / maybe / no list once. Reuse it for every scene, every partner. Add custom kinks any time.
            </p>
            <ul className="mt-4 space-y-1.5 text-sm text-plum">
              <li className="flex items-center gap-2"><Dot className="bg-yes" /> Impact play</li>
              <li className="flex items-center gap-2"><Dot className="bg-yes" /> Rope bondage</li>
              <li className="flex items-center gap-2"><Dot className="bg-maybe" /> Wax play</li>
              <li className="flex items-center gap-2"><Dot className="bg-no" /> Choking</li>
            </ul>
          </div>

          {/* Two-way consent */}
          <div className="feature-card p-6 md:p-7 md:mt-20">
            <div className="flex flex-wrap gap-1.5 mb-5">
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-yes/30 border border-yes text-plum font-semibold">You: yes</span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-maybe/30 border border-maybe text-plum font-semibold">Them: maybe</span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-blush text-plum font-semibold">Match</span>
            </div>
            <h3 className="font-display text-[1.75rem] sm:text-3xl text-plum leading-[1.05]">Two-way consent,<br />not one-way permission</h3>
            <p className="text-[13px] text-foreground/70 mt-3 leading-snug">
              Both people fill out their side independently. The scene plan is the overlap — what you both actively want.
            </p>
            <div className="mt-4 text-sm">
              <div className="text-[10px] uppercase font-bold text-plum/60 tracking-wider mb-1">You both said yes to</div>
              <ul className="space-y-1 text-plum">
                <li>• Impact play</li>
                <li>• Spanking</li>
                <li>• Praise</li>
                <li>• Aftercare cuddles</li>
              </ul>
            </div>
          </div>

          {/* Scene cards */}
          <div className="feature-card p-6 md:p-7 md:-mt-6">
            <div className="text-[10px] uppercase tracking-wider font-bold text-coral mb-2">Scene card · Saturday</div>
            <h3 className="font-display text-[1.75rem] sm:text-3xl text-plum leading-[1.05]">Scene cards for when<br />brains stop working</h3>
            <p className="text-[13px] text-foreground/70 mt-3 leading-snug">
              The plan you already agreed on, formatted for fast reading. Pull it up mid-scene, no scrolling required.
            </p>
            <ul className="mt-4 space-y-1.5 text-sm text-plum">
              <li>• Safeword: <strong>red</strong></li>
              <li>• Slow down: <strong>yellow</strong></li>
              <li>• Hard limits this scene</li>
              <li>• Aftercare needs</li>
              <li>• Emergency contact</li>
            </ul>
          </div>

          {/* Aftercare */}
          <div className="feature-card p-6 md:p-7 md:mt-12">
            <div className="text-[10px] uppercase tracking-wider font-bold text-coral mb-3">Aftercare checklist</div>
            <h3 className="font-display text-[1.75rem] sm:text-3xl text-plum leading-[1.05]">Aftercare doesn't<br />have to be improvised</h3>
            <p className="text-[13px] text-foreground/70 mt-3 leading-snug">
              Pick what you need ahead of time. Water. Snacks. Quiet. A specific person. A check-in tomorrow.
            </p>
            <ul className="mt-4 space-y-1.5 text-sm text-plum">
              <li className="flex items-center gap-2"><Tick /> Water + electrolytes</li>
              <li className="flex items-center gap-2"><Tick /> Cuddles, no talking</li>
              <li className="flex items-center gap-2"><Tick /> Snack within 30 min</li>
              <li className="flex items-center gap-2"><Tick /> Check-in next day</li>
            </ul>
          </div>
        </div>
      </section>

      {/* 5. Built for kinky people */}
      <section className="px-5 sm:px-10 py-10 sm:py-16 max-w-5xl mx-auto">
        <div className="relative rounded-3xl overflow-hidden bg-plum text-white min-h-[280px] sm:min-h-[360px] flex items-center">
          <img src={sectionBg} alt="" aria-hidden className="absolute inset-0 w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-r from-plum/95 via-plum/80 to-plum/40" />
          <div className="relative p-8 sm:p-12 lg:p-16 max-w-xl">
            <h2 className="font-display text-3xl sm:text-4xl lg:text-[2.75rem] leading-[1.05]">
              Built for kinky people who take consent seriously.
            </h2>
            <p className="text-sm sm:text-base text-white/85 mt-5 leading-snug max-w-md">
              Not a checklist. Not a contract. A shared place to get clear before the scene starts —
              and to take care of each other after.
            </p>
            <div className="mt-6 flex items-center gap-3">
              <img src={flag} alt="Trans pride flag" className="h-5 w-auto rounded-sm" />
              <p className="text-xs sm:text-sm text-white/85">
                Department of Consent is proudly trans owned and operated.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 6. Mint CTA */}
      <section className="px-5 sm:px-10 py-10 sm:py-16 max-w-5xl mx-auto relative">
        <img src={stickerCollar} alt="" aria-hidden className="hidden md:block absolute -left-8 top-4 w-32 rotate-[-12deg] pointer-events-none z-10" />
        <img src={stickerHandcuffs} alt="" aria-hidden className="hidden md:block absolute -right-6 -bottom-2 w-28 rotate-[18deg] pointer-events-none z-10" />
        <div className="relative rounded-3xl bg-mint text-plum p-10 sm:p-14 text-center overflow-hidden">
          <h2 className="font-display text-3xl sm:text-4xl lg:text-[2.75rem] leading-[1.05] max-w-xl mx-auto">
            Make the scene clear before you start.
          </h2>
          <p className="text-sm sm:text-base text-plum/80 mt-4 max-w-md mx-auto leading-snug">
            Build a shared scene plan in a few minutes. Free to try, no card required.
          </p>
          <div className="flex justify-center pt-6">
            <CloudButton to={startTo} variant="outline" className="!max-w-[15rem]">Create a scene</CloudButton>
          </div>
          <p className="text-[10px] text-plum/60 mt-5 max-w-xs mx-auto leading-snug">
            By creating a scene you agree to our Terms of Service and Privacy Policy.
          </p>
        </div>
      </section>

      {/* 7. Giant wordmark */}
      <section className="px-4 sm:px-8 pt-8 pb-10 max-w-[920px] mx-auto">
        <img src={footerWordmark} alt="Dept of Consent" className="w-full h-auto block" />
        <div className="text-center text-xs text-muted-foreground pt-6 space-y-2">
          <p>Copyright Department of Consent {new Date().getFullYear()}</p>
          <nav className="flex justify-center gap-6 font-semibold">
            <Link to="/privacy" className="hover:underline underline-offset-4">Privacy Policy</Link>
            <Link to="/terms" className="hover:underline underline-offset-4">Terms of Service</Link>
          </nav>
        </div>
      </section>
    </Layout>
  );
}

function Dot({ className = "" }: { className?: string }) {
  return <span className={`inline-block w-2 h-2 rounded-full ${className}`} />;
}

function Tick() {
  return (
    <span className="inline-flex items-center justify-center w-4 h-4 rounded-full bg-yes/30 border border-yes shrink-0">
      <Check className="w-2.5 h-2.5 text-plum" strokeWidth={3} />
    </span>
  );
}
