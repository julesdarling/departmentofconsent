import { createFileRoute, Link } from "@tanstack/react-router";
import { Layout } from "@/components/Layout";
import { CloudButton } from "@/components/CloudButton";
import { useProfile } from "@/lib/storage";
import { useAuth } from "@/lib/useAuth";
import { Check, HelpCircle } from "lucide-react";
import heroImg from "@/assets/hero-couple.jpg";
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
import iconFlogger from "@/assets/icon-flogger.png";
import iconBunnies from "@/assets/icon-bunnies.png";
import iconPup from "@/assets/icon-pup.png";
import iconMartini from "@/assets/icon-martini.png";
import iconRing from "@/assets/icon-ring.png";

const COMMUNITIES = [
  { icon: iconFlogger, label: "Kink\npractitioners" },
  { icon: iconBunnies, label: "Polyamorous\npartners" },
  { icon: iconPup, label: "Queer\ncommunities" },
  { icon: iconMartini, label: "Casual daters" },
  { icon: iconRing, label: "Long term\ncouples" },
];

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
  "What is enthusiastically on the table.",
  "What is a maybe.",
  "What is completely off limits.",
  "What needs discussion or aftercare.",
  "What words, signals, or boundaries stop the scene immediately.",
];

const STEPS = [
  { n: "Step 1", title: "Choose your interests and limits", body: "Mark kinks, activities, roles, intensity, and boundaries as yes, maybe, or no." },
  { n: "Step 2", title: "Share with your play partner", body: "Send a private link or QR code. They fill out their side separately, so nobody has to negotiate under pressure." },
  { n: "Step 3", title: "Compare and plan the scene", body: "See where you match, where you need to talk, and what should stay off the table." },
  { n: "Step 4", title: "Keep the scene card nearby", body: "Safewords, hard limits, soft limits, medical notes, aftercare needs, and scene agreements stay easy to check." },
];

function Index() {
  const [profile] = useProfile();
  const { user } = useAuth();
  const hasProfile = !!profile.name;
  const startTo = !user ? "/auth" : hasProfile ? "/sessions/new" : "/onboarding";

  return (
    <Layout fullBleed>
      {/* Top header */}
      <header className="w-full px-5 sm:px-10 pt-6 sm:pt-8 pb-2 flex items-center justify-between max-w-6xl mx-auto">
        <Link to="/" aria-label="Dept of Consent — Home" className="block">
          <img src={wordmark} alt="Dept of Consent" className="h-7 sm:h-8 w-auto" />
        </Link>
        <CloudButton to={user ? "/sessions" : "/auth"} variant="outline" className="cloud-btn-sm">
          Get started
        </CloudButton>
      </header>

      {/* 1. Hero */}
      <section className="px-5 sm:px-10 pt-4 sm:pt-10 pb-6 sm:pb-12 max-w-6xl mx-auto">
        <div className="grid md:grid-cols-[5fr_6fr] gap-8 md:gap-12 items-center">
          <div className="order-2 md:order-1 relative text-center md:text-left">
            <div className="space-y-3">
              <h1 className="font-display text-plum leading-[1.05] sm:text-4xl lg:text-[2.75rem] tracking-tight font-normal text-3xl">
                A better way to talk about limits, kinks, and aftercare.
              </h1>
              <p className="text-foreground/85 max-w-md mx-auto md:mx-0 text-base sm:text-[17px] leading-snug">
                Build a clear, cute, shareable scene agreement before you play.
              </p>
              <div className="flex justify-center md:block">
                <CloudButton to={startTo} className="!max-w-full sm:!max-w-[15rem]">Create a scene</CloudButton>
              </div>
            </div>
            <p className="text-[10px] text-muted-foreground/80 max-w-[18rem] mx-auto md:mx-0 leading-snug pt-8">
              Choose your yes / maybe / no list, compare limits with a partner, plan the scene, and keep safewords, boundaries, and aftercare visible when they actually matter.
            </p>
          </div>

          <div className="relative order-1 md:order-2">
            <div className="relative rounded-xl overflow-hidden aspect-[4/3] bg-blush">
              <img src={heroImg} alt="Friends laughing in a soft pile" className="w-full h-full object-cover" />
            </div>
            <img src={stickerWhip} alt="" aria-hidden className="absolute -left-6 sm:-left-10 bottom-4 sm:-bottom-14 w-24 sm:w-32 lg:w-36 rotate-[-18deg] pointer-events-none" />
            <img src={stickerHandcuffs} alt="" aria-hidden className="absolute -right-4 sm:-right-8 bottom-6 sm:-bottom-10 w-24 sm:w-32 lg:w-36 rotate-[8deg] pointer-events-none" />
          </div>
        </div>
      </section>


      {/* 2. "What are you into?" is not enough */}
      <section className="px-5 sm:px-10 py-8 sm:py-12 max-w-xl mx-auto relative">
        
        <img src={stickerWand} alt="" aria-hidden className="absolute -left-4 sm:-left-8 -bottom-6 sm:-bottom-10 w-20 sm:w-24 rotate-[-18deg] pointer-events-none z-10" />
        <div className="feature-card p-8 sm:p-12">
          <div className="text-center">
            <h2 className="font-display text-3xl sm:text-[2.5rem] text-plum leading-tight">
              <span className="italic">"What are you into?"</span>
              <br />is not enough.
            </h2>
            <p className="text-[15px] text-foreground/75 max-w-md mx-auto mt-4 leading-snug">
              Good scenes need more than vibes.<br />They need shared expectations.
            </p>
          </div>
          <hr className="my-7 border-plum/10 -mx-8 sm:-mx-12" />
          <div className="max-w-sm mx-auto">
            <p className="text-[13px] font-bold text-plum mb-4">
              Before play, you need to know:
            </p>
            <ul className="space-y-3 text-left">
              {QUESTIONS.map((q) => (
                <li key={q} className="flex items-start gap-3 text-[15px] text-plum">
                  <HelpCircle className="shrink-0 mt-0.5 w-5 h-5 text-coral" strokeWidth={2.25} />
                  <span>{q}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* 3. How it works */}
      <section className="px-5 sm:px-10 py-10 sm:py-16 max-w-6xl mx-auto relative">
        <div className="text-center space-y-2 mb-8 sm:mb-10">
          <h2 className="font-display text-4xl sm:text-5xl text-plum">How it works</h2>
          <p className="text-sm text-foreground/70 max-w-md mx-auto">
            A consent flow you can actually use.
          </p>
        </div>
        <div className="feature-card p-6 sm:p-10">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-10">
            {STEPS.map((s) => (
              <div key={s.n}>
                <div className="text-[13px] font-bold text-plum mb-2">{s.n}</div>
                <h3 className="font-display text-[1.5rem] text-plum leading-tight mb-3">{s.title}</h3>
                <p className="text-[14px] text-foreground/70 leading-snug">{s.body}</p>
              </div>
            ))}
          </div>
        </div>
        <div className="flex justify-center pt-8 sm:pt-10">
          <img src={stickerBoundHands} alt="" aria-hidden className="w-24 sm:w-28 rotate-[3deg]" />
        </div>
      </section>

      {/* 4. Feature cluster — staggered collage */}
      <section className="px-5 sm:px-10 py-10 sm:py-20 max-w-4xl mx-auto relative">
        <img src={stickerFeather} alt="" aria-hidden className="hidden md:block absolute -left-16 top-1/3 w-28 rotate-[-15deg] pointer-events-none" />
        <img src={stickerRope} alt="" aria-hidden className="hidden md:block absolute -right-16 top-12 w-32 rotate-[12deg] pointer-events-none" />

        <div className="flex flex-col gap-16 md:grid md:grid-cols-2 md:gap-x-10 md:gap-y-0 md:items-start relative">
          {/* Left column */}
          <div className="contents md:flex md:flex-col md:gap-16">
          {/* Personal kink menu */}
          <div className="feature-card p-6 md:p-7 order-1 md:order-none">
            <div className="relative h-44 overflow-hidden mb-2">
              <div className="flex flex-wrap gap-1.5 justify-center">
                {[
                  "+ Hand stuff", "+ Kissing", "+ Cock sucking", "+ Pussy eating", "+ Fucking",
                  "+ Anal play", "+ Toys", "+ Sensation", "+ Temperature play (ice/wax)",
                  "+ Scratching", "+ Nails and scratching", "+ Biting", "+ Tickling", "+ Ear licking",
                  "+ Electro", "+ Impact", "+ Spanking (hand)", "+ Paddling", "+ Flogging",
                  "+ Caning", "+ Face slapping", "+ Whipping", "+ Body punching",
                  "+ Face punching", "+ Rope bondage", "+ Cuffs / restraints", "+ Blindfold",
                  "+ Grabbing / restraining", "+ Hand over mouth", "+ Saran Wrap", "+ Dominance",
                ].map((c) => (
                  <span key={c} className="text-[10px] px-2 py-0.5 rounded-full border border-blush text-plum/80">{c}</span>
                ))}
              </div>
              <div className="pointer-events-none absolute inset-x-0 bottom-0 h-16 bg-gradient-to-b from-transparent to-white" />
            </div>
            <div className="text-center">
              <h3 className="font-display text-[1.75rem] sm:text-3xl text-plum leading-[1.05]">Your personal<br />kink menu</h3>
              <p className="text-[13px] text-foreground/70 mt-3 leading-snug max-w-xs mx-auto">
                Save your own interests, boundaries, and notes so you do not have to rebuild the conversation from scratch every time.
              </p>
            </div>
            <hr className="my-5 border-plum/10" />
            <p className="text-[13px] font-bold text-plum mb-2">Good for:</p>
            <ul className="space-y-1.5 text-[14px] text-plum list-disc pl-5">
              <li>New partners</li>
              <li>Dungeon pickup play</li>
              <li>Recurring scenes</li>
              <li>Long-term dynamics</li>
              <li>People who freeze when asked, "So what are you into?"</li>
            </ul>
          </div>

          {/* Scene cards */}
          <div className="feature-card p-6 md:p-7 order-3 md:order-none">
            <div className="font-mono text-[11px] leading-relaxed text-plum mb-2">
              <div className="text-no font-bold tracking-wide mb-2">SAFEWORDS</div>
              <div>Verbal:</div>
              <div>Red — stop the scene, something is wrong and we can't continue.</div>
              <div>Yellow — check in.</div>
              <div>Green — good, keep going.</div>
              <div>Mercy — no more on the same spot.</div>
              <div className="h-3" />
              <div>Non-verbal:</div>
              <div>Thumb up — keep going.</div>
              <div>Enthusiastic thumb up — more more more please.</div>
              <div className="text-plum/40">Thumb side — right here is good, no more no less.</div>
              <div className="text-plum/40">Thumb down, double tap — check in please.</div>
            </div>
            <div className="text-center mt-5">
              <h3 className="font-display text-[1.75rem] sm:text-3xl text-plum leading-[1.05]">Scene cards for when<br />brains stop working</h3>
              <p className="text-[13px] text-foreground/70 mt-3 leading-snug max-w-xs mx-auto">
                During play, details can get blurry. The scene card keeps the important stuff readable.
              </p>
            </div>
            <hr className="my-5 border-plum/10" />
            <p className="text-[13px] font-bold text-plum mb-2">Include:</p>
            <ul className="space-y-1.5 text-[14px] text-plum list-disc pl-5">
              <li>Safewords</li>
              <li>Nonverbal signals</li>
              <li>Hard limits</li>
              <li>Intensity notes</li>
              <li>Health or accessibility notes</li>
              <li>Aftercare requests</li>
              <li>Anything that must not be forgotten</li>
            </ul>
          </div>
          </div>
          {/* end left column */}

          {/* Right column */}
          <div className="contents md:flex md:flex-col md:gap-16 md:mt-20">
          {/* Two-way consent */}
          <div className="feature-card p-6 md:p-7 order-2 md:order-none">
            <div className="space-y-3 mb-2">
              <div>
                <div className="text-[11px] font-bold tracking-wide text-yes mb-1">BOTH WANT TO PLAY</div>
                <p className="text-[12px] text-foreground/70 mb-1.5">Cravings you both picked for this scene.</p>
                <div className="flex flex-wrap gap-1.5">
                  {["Paddling", "Whipping", "Cuffs / restraints"].map((c) => (
                    <span key={c} className="text-[11px] px-2.5 py-0.5 rounded-full bg-yes/20 border border-yes/40 text-plum">{c}</span>
                  ))}
                </div>
              </div>
              <div>
                <div className="text-[11px] font-bold tracking-wide text-maybe mb-1">DISCUSS</div>
                <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-maybe/20 border border-maybe/40 text-plum inline-block">Hand stuff</span>
              </div>
              <div>
                <div className="text-[11px] font-bold tracking-wide text-no mb-1">HARD LIMIT FROM ONE SIDE</div>
                <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-no/15 border border-no/30 text-plum/60 inline-block">Tickling</span>
              </div>
            </div>
            <div className="text-center mt-5">
              <h3 className="font-display text-[1.75rem] sm:text-3xl text-plum leading-[1.05]">Two-way consent, not<br />one-way permission</h3>
              <p className="text-[13px] text-foreground/70 mt-3 leading-snug max-w-xs mx-auto">
                Both people fill out their own side. The goal is not to pressure someone into agreement. The goal is to make overlap obvious and mismatches impossible to ignore.
              </p>
            </div>
            <hr className="my-5 border-plum/10" />
            <p className="text-[13px] font-bold text-plum mb-2">Use it to clarify:</p>
            <ul className="space-y-1.5 text-[14px] text-plum list-disc pl-5">
              <li>Yes / maybe / no</li>
              <li>Hard limits</li>
              <li>Soft limits</li>
              <li>Intensity levels</li>
              <li>Role preferences</li>
              <li>Safewords and signals</li>
              <li>Aftercare needs</li>
              <li>Things that require a longer conversation</li>
            </ul>
          </div>

          {/* Aftercare */}
          <div className="feature-card p-6 md:p-7 order-4 md:order-none">
            <div className="mb-2">
              <div className="font-display text-[15px] text-plum mb-3">Your aftercare list</div>
              <ul className="space-y-2 text-[14px]">
                <li className="flex items-center gap-2.5">
                  <span className="inline-flex items-center justify-center w-4 h-4 rounded-full bg-no text-white shrink-0">
                    <Check className="w-2.5 h-2.5" strokeWidth={3} />
                  </span>
                  <span className="text-plum/60 line-through">Water and electrolytes</span>
                </li>
                {["Cuddling", "Debrief scene", "Thorns and roses?"].map((item) => (
                  <li key={item} className="flex items-center gap-2.5">
                    <span className="inline-block w-4 h-4 rounded-full border-2 border-no shrink-0" />
                    <span className="text-plum">{item}</span>
                  </li>
                ))}
                {["Make a check-in plan", "Monitor for drop and do self care"].map((item) => (
                  <li key={item} className="flex items-center gap-2.5">
                    <span className="inline-block w-4 h-4 rounded-full border-2 border-plum/20 shrink-0" />
                    <span className="text-plum/40">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="text-center mt-5">
              <h3 className="font-display text-[1.75rem] sm:text-3xl text-plum leading-[1.05]">Aftercare does not have<br />to be improvised</h3>
              <p className="text-[13px] text-foreground/70 mt-3 leading-snug max-w-xs mx-auto">
                Water, food, blankets, shower, silence, cuddling, space, check-ins, reassurance, grounding, or anything else each person needs to come down safely.
              </p>
              <p className="text-[13px] text-foreground/70 mt-3 leading-snug max-w-xs mx-auto">
                You can also keep private reflection notes afterward, so future scenes get better instead of messier.
              </p>
            </div>
          </div>
          </div>
          {/* end right column */}
        </div>
      </section>

      {/* 5. Built for kinky people */}
      <section className="px-5 sm:px-10 py-10 sm:py-16 max-w-6xl mx-auto">
        <div className="relative rounded-xl overflow-hidden bg-plum text-white min-h-[420px] sm:min-h-[520px] flex flex-col">
          <img src={sectionBg} alt="" aria-hidden className="absolute inset-0 w-full h-full object-cover" />
          <div className="absolute inset-0 bg-plum/55" />
          <div className="relative flex flex-col justify-between flex-1 p-8 sm:p-12 lg:p-14">
            <h2 className="font-display text-3xl sm:text-4xl lg:text-[2.75rem] leading-[1.05] max-w-md">
              Built for kinky people who take consent seriously.
            </h2>
            <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-6 mt-10">
              <div className="text-[13px] sm:text-sm text-white/90 leading-snug max-w-sm space-y-4">
                <p>Department of Consent is for adults who want play to feel hotter because it is clearer.</p>
                <p>
                  Not colder.<br />
                  Not clinical.<br />
                  Not overcomplicated.
                </p>
                <p>Just enough structure to make the conversation easier, safer, and less awkward.</p>
              </div>
              <div className="flex items-center gap-3 shrink-0">
                <img src={flag} alt="Trans pride flag" className="h-5 w-auto" />
                <p className="text-xs sm:text-sm text-white/90 max-w-[16rem] leading-snug">
                  Department of Consent is proudly<br />trans owned and operated.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 6. Mint CTA */}
      <section className="px-5 sm:px-10 py-10 sm:py-16 max-w-5xl mx-auto relative">
        <img src={stickerCollar} alt="" aria-hidden className="hidden md:block absolute -left-4 -top-6 w-40 rotate-[-12deg] pointer-events-none z-10" />
        <img src={stickerHandcuffs} alt="" aria-hidden className="hidden md:block absolute -right-4 -bottom-8 w-40 rotate-[18deg] pointer-events-none z-10" />
        <div className="relative rounded-xl bg-mint text-white p-10 sm:p-14 text-center overflow-hidden">
          <h2 className="font-display text-3xl sm:text-4xl lg:text-[2.75rem] leading-[1.05] max-w-xl mx-auto text-white">
            Make the scene clear before you start.
          </h2>
          <p className="text-sm sm:text-base text-white/90 mt-4 max-w-xs mx-auto leading-snug">
            Create a shareable consent card in a few minutes.
          </p>
          <div className="flex justify-center pt-6">
            <CloudButton to={startTo} className="cloud-btn-white !max-w-[15rem]">Create a scene</CloudButton>
          </div>
          <p className="text-[11px] text-white/80 mt-6 max-w-sm mx-auto leading-snug">
            No more guessing. No more vague "I'm into anything." No more finding out a limit after it has already been crossed.
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

