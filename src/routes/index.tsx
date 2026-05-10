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
import stickerWandPink from "@/assets/sticker-wand-pink.png";
import iconFlogger from "@/assets/icon-flogger.png";
import iconBunnies from "@/assets/icon-bunnies.png";
import iconPup from "@/assets/icon-pup.png";
import iconMartini from "@/assets/icon-martini.png";
import iconRing from "@/assets/icon-ring.png";
import avatarJ from "@/assets/avatar-j.png";
import avatarR from "@/assets/avatar-r.png";
import avatarA from "@/assets/avatar-a.png";

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

const KINK_CHIPS: { label: string; selected?: "give" | "receive" | "both" }[] = [
  { label: "Hand stuff" },
  { label: "Kissing" },
  { label: "Cock sucking" },
  { label: "Pussy eating", selected: "both" },
  { label: "Fucking" },
  { label: "Anal play" },
  { label: "Toys" },
  { label: "Sensation" },
  { label: "Temperature play (ice/wax)" },
  { label: "Scratching" },
  { label: "Nails and scratching", selected: "give" },
  { label: "Biting" },
  { label: "Tickling" },
  { label: "Ear licking" },
  { label: "Electro" },
  { label: "Impact" },
  { label: "Spanking (hand)" },
  { label: "Paddling" },
  { label: "Flogging" },
  { label: "Caning" },
  { label: "Face slapping" },
  { label: "Whipping" },
  { label: "Body punching" },
  { label: "Face punching" },
  { label: "Rope bondage", selected: "receive" },
  { label: "Cuffs / restraints" },
  { label: "Blindfold" },
  { label: "Grabbing / restraining" },
  { label: "Hand over mouth" },
  { label: "Saran Wrap" },
];

const KNOW_BEFORE = [
  "Things get weird",
  "Assumptions get made",
  "Boundaries get crossed",
  "Feelings get hurt",
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
      <section className="px-5 sm:px-10 pt-4 sm:pt-6 pb-6 sm:pb-8 max-w-6xl mx-auto">
        <div className="grid md:grid-cols-[5fr_6fr] gap-8 md:gap-10 items-center">
          <div className="order-2 md:order-1 text-left">
            <p className="text-xs font-bold uppercase tracking-wide text-plum">
              Most people find out they're incompatible too late.
            </p>
            <h1 className="font-display text-4xl sm:text-5xl text-plum leading-[1.05] mt-3">
              Don't discover hard limits <em className="italic">halfway</em> through a hookup.
            </h1>
            <p className="text-base text-foreground/75 leading-snug mt-4 max-w-md">
              Compare boundaries, kinks, condom expectations, attachment styles, and dealbreakers before things get awkward, intense, or unsafe.
            </p>
            <div className="mt-5">
              <CloudButton to={startTo} className="!max-w-full sm:!max-w-[18rem]">Start playing safer</CloudButton>
            </div>

            <div className="mt-7">
              <p className="text-xs font-bold uppercase tracking-wide text-plum mb-3">
                Trusted by communities worldwide
              </p>
              <ul className="grid grid-cols-5 gap-3 max-w-md">
                {COMMUNITIES.map((c) => (
                  <li key={c.label} className="flex flex-col items-center text-center gap-1.5">
                    <img src={c.icon} alt="" aria-hidden className="w-10 h-10 sm:w-12 sm:h-12 object-contain" />
                    <span className="text-xs text-muted-foreground leading-tight whitespace-pre-line">{c.label}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="relative order-1 md:order-2">
            <div className="relative rounded-xl overflow-hidden aspect-[4/3] sm:aspect-[3/4] md:aspect-[4/5] lg:aspect-[5/4] bg-blush">
              <img src={heroImg} alt="Two partners resting together on soft sheets" className="w-full h-full object-cover" />
              <div className="absolute left-3 right-3 sm:inset-x-8 top-1/2 -translate-y-1/2 max-w-[16rem] sm:max-w-none mx-auto bg-white rounded-md p-3 sm:p-6 space-y-2.5 sm:space-y-4">
                <div>
                  <div className="text-[10px] sm:text-xs font-bold uppercase tracking-wide text-yes mb-1">Both want to play</div>
                  <p className="text-xs sm:text-sm text-foreground/75 leading-snug mb-2">Cravings you both picked for this scene.</p>
                  <div className="flex flex-wrap gap-1 sm:gap-1.5">
                    {["Paddling", "Whipping", "Cuffs / restraints"].map((c) => (
                      <span key={c} className="text-[11px] sm:text-xs px-2 sm:px-3 py-0.5 sm:py-1 rounded-full bg-yes/20 border border-yes/40 text-plum">{c}</span>
                    ))}
                  </div>
                </div>
                <div>
                  <div className="text-[10px] sm:text-xs font-bold uppercase tracking-wide text-maybe mb-1.5">Discuss</div>
                  <span className="text-[11px] sm:text-xs px-2 sm:px-3 py-0.5 sm:py-1 rounded-full bg-maybe/20 border border-maybe/40 text-plum inline-block">Hand stuff</span>
                </div>
                <div>
                  <div className="text-[10px] sm:text-xs font-bold uppercase tracking-wide text-no mb-1.5">Hard limit from one side</div>
                  <span className="text-[11px] sm:text-xs px-2 sm:px-3 py-0.5 sm:py-1 rounded-full bg-no/15 border border-no/30 text-plum inline-block">Tickling</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>


      {/* 1b. Testimonials */}
      <section className="px-5 sm:px-10 py-6 sm:py-10 max-w-4xl mx-auto">
        <h2 className="font-sans text-xs font-bold uppercase tracking-wide text-plum text-center max-w-2xl mx-auto mb-6">
          People are tired of guessing about sex and kink.
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {[
            { quote: "This removed so much awkwardness from kink negotiation.", author: "J, 31", avatar: avatarJ, pos: "center 20%" },
            { quote: "I feel safer using this with people I meet on dating apps.", author: "R, 26", avatar: avatarR, pos: "center 22%" },
            { quote: "It made bringing up condoms and hard limits dramatically easier.", author: "A, 29", avatar: avatarA, pos: "center 30%" },
          ].map((t) => (
            <figure key={t.author} className="rounded-xl bg-white p-4 flex flex-col">
              <blockquote className="font-sans italic text-xs sm:text-sm text-plum leading-snug">
                “{t.quote}”
              </blockquote>
              <figcaption className="flex items-center gap-2 mt-3">
                <span className="w-8 h-8 rounded-full bg-[oklch(0.86_0.10_5)] overflow-hidden shrink-0">
                  <img src={t.avatar} alt="" aria-hidden className="w-full h-full object-cover" style={{ objectPosition: t.pos }} />
                </span>
                <span className="font-sans text-[11px] text-muted-foreground">— {t.author}</span>
              </figcaption>
            </figure>
          ))}
        </div>
      </section>

      {/* 2. "What are you into?" is not enough */}
      <section className="px-4 sm:px-8 py-10 sm:py-14 max-w-7xl mx-auto">
        <div className="bg-white rounded-xl px-5 sm:px-10 py-10 sm:py-14">
        <div className="grid md:grid-cols-2 gap-6 md:gap-8 items-stretch">
          {/* Left card */}
          <div className="bg-white rounded-xl p-5 md:p-6 lg:p-10">
            <h2 className="font-display text-3xl sm:text-4xl text-plum leading-[1.05]">
              <span className="italic">"What are you into?"</span>
              <br />is not enough.
            </h2>
            <p className="text-base text-foreground/75 leading-snug mt-4">
              Good sex needs more than vibes.<br />It needs shared expectations.
            </p>
            <hr className="my-7 border-plum/10" />
            <p className="text-sm font-bold text-plum mb-4">
              Before play, you need to know:
            </p>
            <ul className="space-y-3 text-left">
              {QUESTIONS.map((q) => (
                <li key={q} className="flex items-start gap-3 text-sm text-plum">
                  <HelpCircle className="shrink-0 mt-0.5 w-5 h-5 text-coral" strokeWidth={2.25} />
                  <span>{q}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Right pink box containing the kink menu screenshot */}
          <div className="relative rounded-xl bg-blush/70 p-4 md:p-5 lg:p-8 flex items-center overflow-hidden">
            <div className="relative z-0 bg-white rounded-xl p-4 md:p-4 lg:p-6 w-full flex flex-col">
              <div className="flex flex-wrap gap-1.5">
                {KINK_CHIPS.map((c) => {
                  if (!c.selected) {
                    return (
                      <span key={c.label} className="text-[10px] md:text-[10px] lg:text-[12px] px-2 md:px-2 lg:px-2.5 py-0.5 sm:py-1 rounded-full border border-plum/15 text-plum/80 bg-white whitespace-nowrap">
                        + {c.label}
                      </span>
                    );
                  }
                  return (
                    <span key={c.label} className="inline-flex flex-wrap items-center gap-1 max-w-full text-[10px] md:text-[10px] lg:text-[12px] pl-2 md:pl-2 lg:pl-2.5 pr-1 py-0.5 rounded-full border border-yes/40 bg-yes/15 text-plum">
                      <span className="flex items-center gap-1 whitespace-nowrap">
                        <Check className="w-2.5 h-2.5 sm:w-3 sm:h-3" strokeWidth={3} />
                        {c.label}
                      </span>
                      <span className="flex items-center gap-0.5 ml-1">
                        {(["give", "receive", "both"] as const).map((opt) => (
                          <span
                            key={opt}
                            className={`text-[9px] sm:text-[10px] px-1 sm:px-1.5 py-0.5 rounded-full capitalize ${
                              c.selected === opt ? "bg-yes/60 text-plum font-semibold" : "text-plum/60"
                            }`}
                          >
                            {opt}
                          </span>
                        ))}
                      </span>
                    </span>
                  );
                })}
              </div>
              <div className="mt-6 flex items-center gap-2">
                <input
                  type="text"
                  placeholder="Add your own kink..."
                  readOnly
                  className="flex-1 min-w-0 text-[13px] px-3 py-2 rounded-full border border-plum/15 bg-white text-plum/60 placeholder:text-plum/40 focus:outline-none"
                />
                <button type="button" disabled className="shrink-0 text-[13px] px-5 py-2 rounded-full bg-yes/40 text-plum/70 font-semibold">
                  Add
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Know before row */}
        <div className="mt-8 sm:mt-10 flex flex-wrap items-center justify-center gap-x-8 gap-y-2 text-sm text-foreground/75">
          <span className="font-bold text-plum">Know before:</span>
          {KNOW_BEFORE.map((k) => (
            <span key={k}>{k}</span>
          ))}
        </div>
        </div>
      </section>

      {/* 3. How it works */}
      <section className="px-5 sm:px-10 py-10 sm:py-16 max-w-6xl mx-auto relative">
        <div className="text-center space-y-2 mb-8 sm:mb-10">
          <h2 className="font-display text-3xl sm:text-4xl text-plum leading-[1.05]">How it works</h2>
          <p className="text-base text-foreground/75 max-w-md mx-auto">
            A consent flow you can actually use.
          </p>
        </div>
        <div className="feature-card p-6 sm:p-10">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-10">
            {STEPS.map((s) => (
              <div key={s.n}>
                <div className="text-xs font-bold uppercase tracking-wide text-plum mb-2">{s.n}</div>
                <h3 className="font-display text-2xl text-plum leading-tight mb-3">{s.title}</h3>
                <p className="text-sm text-foreground/75 leading-snug">{s.body}</p>
              </div>
            ))}
          </div>
        </div>
        <div className="flex justify-center pt-8 sm:pt-10">
          <img src={stickerBoundHands} alt="" aria-hidden className="w-24 sm:w-28 rotate-[3deg]" />
        </div>
      </section>

      {/* removed - moved under hero */}

      {/* 4. Feature cluster — staggered collage */}
      <section className="px-5 sm:px-10 py-10 sm:py-20 max-w-4xl mx-auto relative">
        <img src={stickerFeather} alt="" aria-hidden className="hidden md:block absolute -left-32 lg:-left-40 top-1/3 w-56 lg:w-64 rotate-[-15deg] pointer-events-none" />
        <img src={stickerRope} alt="" aria-hidden className="hidden md:block absolute -right-32 lg:-right-40 top-12 w-60 lg:w-72 rotate-[12deg] pointer-events-none" />
        <img src={stickerWandPink} alt="" aria-hidden className="hidden md:block absolute -right-44 lg:-right-56 bottom-8 w-52 lg:w-64 rotate-[18deg] pointer-events-none" />

        <div className="flex flex-col gap-16 md:grid md:grid-cols-2 md:gap-x-10 md:gap-y-0 md:items-start relative">
          {/* Left column */}
          <div className="contents md:flex md:flex-col md:gap-16">
          {/* Personal kink menu */}
          <div className="feature-card p-6 md:p-7 order-1 md:order-none">
            <div className="mb-2 space-y-4">
              {[
                { label: "Rope bondage", yn: "Yes", gr: "Receive" },
                { label: "Cuffs / restraints", yn: "Yes", gr: "Receive" },
              ].map((row, i) => (
                <div key={row.label} className={i > 0 ? "pt-4 border-t border-plum/10" : ""}>
                  <div className="text-sm text-plum mb-2">{row.label}</div>
                  <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                    <div className="inline-flex rounded-full border border-plum/15 overflow-hidden text-[10px] sm:text-[11px]">
                      {["Yes", "Maybe", "No"].map((opt) => (
                        <span
                          key={opt}
                          className={`px-2 sm:px-3 py-1 ${
                            row.yn === opt ? "bg-yes/30 text-plum font-semibold" : "text-plum/60"
                          }`}
                        >
                          {opt}
                        </span>
                      ))}
                    </div>
                    <div className="inline-flex rounded-full border border-plum/15 overflow-hidden text-[10px] sm:text-[11px]">
                      {["Give", "Receive", "Both"].map((opt) => (
                        <span
                          key={opt}
                          className={`px-2 sm:px-3 py-1 ${
                            row.gr === opt ? "bg-yes/30 text-plum font-semibold" : "text-plum/60"
                          }`}
                        >
                          {opt}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="text-center">
              <h3 className="font-display text-2xl sm:text-[1.75rem] text-plum leading-tight">Your personal<br />kink menu</h3>
              <p className="text-sm text-foreground/75 mt-3 leading-snug max-w-xs mx-auto">
                Save your own interests, boundaries, and notes so you do not have to rebuild the conversation from scratch every time.
              </p>
            </div>
            <hr className="my-5 border-plum/10" />
            <p className="text-sm font-bold text-plum mb-2">Good for:</p>
            <ul className="space-y-1.5 text-sm text-plum list-disc pl-5">
              <li>New partners</li>
              <li>Dungeon pickup play</li>
              <li>Recurring scenes</li>
              <li>Long-term dynamics</li>
              <li>People who freeze when asked, "So what are you into?"</li>
            </ul>
          </div>

          {/* Scene cards */}
          <div className="feature-card p-6 md:p-7 order-3 md:order-none">
            <div className="font-mono text-xs leading-relaxed text-plum mb-2">
              <div className="text-no font-bold uppercase tracking-wide mb-2">Safewords</div>
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
              <h3 className="font-display text-2xl sm:text-[1.75rem] text-plum leading-tight">Scene cards for when<br />brains stop working</h3>
              <p className="text-sm text-foreground/75 mt-3 leading-snug max-w-xs mx-auto">
                During play, details can get blurry. The scene card keeps the important stuff readable.
              </p>
            </div>
            <hr className="my-5 border-plum/10" />
            <p className="text-sm font-bold text-plum mb-2">Include:</p>
            <ul className="space-y-1.5 text-sm text-plum list-disc pl-5">
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
                <div className="text-xs font-bold uppercase tracking-wide text-plum mb-1.5">Last STD test date</div>
                <div className="flex flex-wrap gap-1.5">
                  <span className="text-xs px-2.5 py-0.5 rounded-full border border-plum/15 text-plum"><span className="font-semibold">Creator:</span> 2026-05-01</span>
                  <span className="text-xs px-2.5 py-0.5 rounded-full border border-plum/15 text-plum"><span className="font-semibold">Play partner 1:</span> 2026-04-29</span>
                </div>
              </div>
              <div>
                <div className="text-xs font-bold uppercase tracking-wide text-plum mb-1.5">STD test results</div>
                <div className="flex flex-wrap gap-1.5">
                  <span className="text-xs px-2.5 py-0.5 rounded-full border border-plum/15 text-plum"><span className="font-semibold">Creator:</span> All Clear</span>
                  <span className="text-xs px-2.5 py-0.5 rounded-full border border-plum/15 text-plum"><span className="font-semibold">Play partner 1:</span> Clean</span>
                </div>
              </div>
              <div>
                <div className="text-xs font-bold uppercase tracking-wide text-plum mb-1.5">On PrEP / DoxyPEP</div>
                <div className="flex flex-wrap gap-1.5">
                  <span className="text-xs px-2.5 py-0.5 rounded-full bg-yes/20 border border-yes/40 text-plum"><span className="font-semibold">Creator:</span> Yes</span>
                  <span className="text-xs px-2.5 py-0.5 rounded-full bg-no/15 border border-no/30 text-plum"><span className="font-semibold">Play partner 1:</span> No</span>
                </div>
              </div>
            </div>
            <div className="text-center mt-5">
              <h3 className="font-display text-2xl sm:text-[1.75rem] text-plum leading-tight">Two-way consent, not<br />one-way permission</h3>
              <p className="text-sm text-foreground/75 mt-3 leading-snug max-w-xs mx-auto">
                Both people fill out their own side. The goal is not to pressure someone into agreement. The goal is to make overlap obvious and mismatches impossible to ignore.
              </p>
            </div>
            <hr className="my-5 border-plum/10" />
            <p className="text-sm font-bold text-plum mb-2">Use it to clarify:</p>
            <ul className="space-y-1.5 text-sm text-plum list-disc pl-5">
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
              <ul className="space-y-2 text-sm">
                <li className="flex items-center gap-2.5">
                  <span className="inline-flex items-center justify-center w-4 h-4 rounded-full bg-no text-white shrink-0">
                    <Check className="w-2.5 h-2.5" strokeWidth={3} />
                  </span>
                  <span className="text-plum/60 line-through">Water and electrolytes</span>
                </li>
                {["Cuddling", "Debrief scene", "Thorns and roses?", "Make a check-in plan", "Monitor for drop and do self care"].map((item) => (
                  <li key={item} className="flex items-center gap-2.5">
                    <span className="inline-block w-4 h-4 rounded-full border-2 border-no shrink-0" />
                    <span className="text-plum">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="text-center mt-5">
              <h3 className="font-display text-2xl sm:text-[1.75rem] text-plum leading-tight">Aftercare does not have<br />to be improvised</h3>
              <p className="text-sm text-foreground/75 mt-3 leading-snug max-w-xs mx-auto">
                Water, food, blankets, shower, silence, cuddling, space, check-ins, reassurance, grounding, or anything else each person needs to come down safely.
              </p>
              <p className="text-sm text-foreground/75 mt-3 leading-snug max-w-xs mx-auto">
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
            <h2 className="font-display text-3xl sm:text-4xl leading-[1.05] max-w-md">
              Built for kinky people who take consent seriously.
            </h2>
            <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-6 mt-10">
              <div className="text-sm text-white/90 leading-snug max-w-sm space-y-4">
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
                <p className="text-sm text-white/90 max-w-[16rem] leading-snug">
                  Department of Consent is proudly<br />trans owned and operated.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 5b. Feature grid */}
      <section className="px-5 sm:px-10 py-10 sm:py-16 max-w-6xl mx-auto">
        <h2 className="font-display text-3xl sm:text-4xl leading-[1.05] text-plum text-center max-w-2xl mx-auto">
          Everything you'd rather know beforehand.
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 mt-10">
          {[
            { title: "Hard limits", body: "Communicate non-negotiables clearly before meeting." },
            { title: "Kink compatibility", body: "See mutual interests and mismatches instantly." },
            { title: "Protection preferences", body: "Reduce awkward condom and STI conversations." },
            { title: "Aftercare expectations", body: "Clarify emotional and physical needs afterward." },
            { title: "Dynamic preferences", body: "Discuss dominance, submission, praise, degradation, service, ownership, and more." },
            { title: "Revocable anytime", body: "Boundaries can change at any moment." },
          ].map((f) => (
            <div key={f.title} className="rounded-xl bg-white p-6">
              <h3 className="font-display text-xl text-plum">{f.title}</h3>
              <p className="text-sm text-foreground/75 mt-2 leading-snug">{f.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* 5c. Trust / Safety */}
      <section className="px-5 sm:px-10 py-10 sm:py-16 max-w-5xl mx-auto">
        <div className="rounded-xl bg-white p-8 sm:p-12">
          <h2 className="font-display text-3xl sm:text-4xl leading-[1.05] text-plum text-center max-w-2xl mx-auto">
            Built for privacy and clarity.
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-10 gap-y-8 mt-10">
            {[
              { title: "Private by default", body: "Profiles are only shared intentionally." },
              { title: "No public kink feed", body: "No follower counts. No performative social layer. No algorithm broadcasting your sexuality." },
              { title: "Consent is revocable", body: "Anyone can change boundaries or withdraw consent at any time." },
              { title: "Built to reduce pressure", body: "The goal is communication and compatibility, not convincing people to say yes." },
            ].map((f) => (
              <div key={f.title}>
                <h3 className="font-display text-xl text-plum">{f.title}</h3>
                <p className="text-sm text-foreground/75 mt-2 leading-snug">{f.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 6. Mint CTA */}
      <section className="px-5 sm:px-10 py-10 sm:py-16 max-w-5xl mx-auto relative">
        <img src={stickerCollar} alt="" aria-hidden className="hidden md:block absolute -left-4 -top-6 w-40 rotate-[-12deg] pointer-events-none z-10" />
        <img src={stickerHandcuffs} alt="" aria-hidden className="hidden md:block absolute -right-4 -bottom-8 w-40 rotate-[18deg] pointer-events-none z-10" />
        <div className="relative rounded-xl bg-mint text-white p-10 sm:p-14 text-center overflow-hidden">
          <h2 className="font-display text-3xl sm:text-4xl leading-[1.05] max-w-2xl mx-auto text-white">
            Your sex life deserves better communication
          </h2>
          <div className="text-base text-white/90 mt-4 max-w-md mx-auto leading-snug space-y-3">
            <p>
              Most people wait until they're already naked, pressured, emotionally attached, or halfway through a hookup to communicate clearly.
            </p>
            <p>That's usually when communication gets hardest.</p>
          </div>
          <div className="flex justify-center pt-6">
            <CloudButton to={startTo} className="cloud-btn-white !max-w-[16rem]">Start with clarity</CloudButton>
          </div>
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

