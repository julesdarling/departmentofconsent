import { createFileRoute } from "@tanstack/react-router";
import { Layout } from "@/components/Layout";
import { Sticker } from "@/components/Sticker";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  useProfile,
  emptySide,
  useRatings,
  type SessionSide,
  type Rating,
  type Direction,
} from "@/lib/storage";
import { DirectionRow } from "./sessions.new";
import { useEffect, useMemo, useState } from "react";
import { useKinks } from "@/lib/storage";
import { useCloudSession } from "@/lib/useCloudSession";
import { cn } from "@/lib/utils";
import { Link } from "@tanstack/react-router";

export const Route = createFileRoute("/join/$token")({
  head: () => ({ meta: [{ title: "Join a scene" }] }),
  component: JoinPage,
});

function JoinPage() {
  const { token } = Route.useParams();
  const [profile] = useProfile();
  const [kinks] = useKinks();
  const [savedRatings] = useRatings();
  
  // no navigate needed – guests see a thank-you instead
  const { session, error, addPartner } = useCloudSession(token);

  const [side, setSide] = useState<SessionSide | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [started, setStarted] = useState(false);

  useEffect(() => {
    if (session && !side) {
      // Pre-fill with the user's saved profile + ratings if they have any
      const initial = session.partnerSide ?? emptySide(profile, savedRatings);
      setSide(initial);
    }
  }, [session, side, profile, savedRatings]);

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
          <h1 className="font-display text-3xl text-plum">Scene not found</h1>
          <p className="text-sm text-muted-foreground">
            This invite link doesn't match anything. Ask your play partner to share it again.
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

  const setDirection = (id: string, d: Direction) =>
    setSide((p) => (p ? { ...p, directions: { ...(p.directions || {}), [id]: d } } : p));

  const submit = async () => {
    if (!side) return;
    setSubmitting(true);
    try {
      await addPartner({ ...side, filledAt: new Date().toISOString() });
      setSubmitted(true);
      if (typeof window !== "undefined") window.scrollTo({ top: 0, behavior: "smooth" });
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    const o = session.ownerSide;
    const ownerName = o.name?.trim() || "the creator";
    const kinkMap = Object.fromEntries(kinks.map((k) => [k.id, k.name]));
    const yesItems = Object.entries(o.ratings || {}).filter(([, r]) => r === "yes").map(([id]) => kinkMap[id] || id);
    const maybeItems = Object.entries(o.ratings || {}).filter(([, r]) => r === "maybe").map(([id]) => kinkMap[id] || id);
    const noItems = Object.entries(o.ratings || {}).filter(([, r]) => r === "no").map(([id]) => kinkMap[id] || id);

    return (
      <Layout>
        <div className="space-y-5">
          <Sticker className="text-center space-y-3">
            <h1 className="font-display text-3xl text-plum">Thank you</h1>
            <p className="text-sm text-muted-foreground">
              Your side has been shared with {ownerName}. Below is the full plan for the scene.
            </p>
            <div className="pt-1">
              <Link to="/scene/$token" params={{ token }} className="text-sm text-link underline underline-offset-4">
                View & share scene recap
              </Link>
            </div>
            <p className="text-[11px] text-muted-foreground">
              The recap has its own permalink anyone in the scene can open.
            </p>
          </Sticker>

          {(o.vision || (o.selectedKinks && o.selectedKinks.length > 0)) && (
            <Sticker variant="coral" className="space-y-3">
              <div className="text-center font-display text-2xl text-plum">Scene vision</div>
              <div className="bg-card/60 rounded-xl p-3 space-y-2">
                <div className="text-[11px] uppercase tracking-wider text-coral font-bold">{ownerName}'s vision for the night</div>
                {o.vision && <p className="text-sm whitespace-pre-wrap">{o.vision}</p>}
                {o.selectedKinks?.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {o.selectedKinks.map((id) => (
                      <span key={id} className="text-xs bg-yes/20 px-2 py-0.5 rounded-full">{kinkMap[id] || id}</span>
                    ))}
                  </div>
                )}
              </div>
            </Sticker>
          )}

          <Sticker className="space-y-3">
            <div className="font-display text-lg text-plum">{ownerName}'s side</div>
            <Detail title="Setting" value={o.setting} />
            <Detail title="Music" value={o.music} />
            <Detail title="Dress" value={o.dress} />
            <Detail title="Call me" value={o.callMe} />
            <Detail title="Don't call me" value={o.dontCallMe} />
            <Detail title="Intentions" value={o.intentions} />
            <Detail title="Privacy" value={o.privacy} />
            <Detail title="Penetrative sex" value={o.penetrativeSex} />
            {yesItems.length > 0 && (
              <div>
                <div className="text-xs font-semibold uppercase text-yes mt-3 mb-1">Yes</div>
                <div className="flex flex-wrap gap-1">
                  {yesItems.map((n) => <span key={n} className="text-xs bg-yes/20 px-2 py-0.5 rounded-full">{n}</span>)}
                </div>
              </div>
            )}
            {maybeItems.length > 0 && (
              <div>
                <div className="text-xs font-semibold uppercase text-maybe mt-3 mb-1">Maybe</div>
                <div className="flex flex-wrap gap-1">
                  {maybeItems.map((n) => <span key={n} className="text-xs bg-maybe/20 px-2 py-0.5 rounded-full">{n}</span>)}
                </div>
              </div>
            )}
            {noItems.length > 0 && (
              <div>
                <div className="text-xs font-semibold uppercase text-no mt-3 mb-1">Hard No</div>
                <div className="flex flex-wrap gap-1">
                  {noItems.map((n) => <span key={n} className="text-xs bg-no/20 px-2 py-0.5 rounded-full">{n}</span>)}
                </div>
              </div>
            )}
            <Detail title="Hard limits" value={o.hardLimits} />
            <Detail title="Soft limits" value={o.softLimits} />
            <Detail title="Enthusiastic Yes" value={o.yesList} />
            <Detail title="Aftercare" value={o.aftercare} />
          </Sticker>
        </div>
      </Layout>
    );
  }

  const creatorName = session.ownerSide.name?.trim() || "Your play partner";
  const ownerKinkMap = Object.fromEntries(kinks.map((k) => [k.id, k.name]));
  const ownerSide = session.ownerSide;
  const visionKinkIds = (ownerSide.selectedKinks || []).filter((id) => ownerKinkMap[id]);
  const sideKinkIds = Object.entries(ownerSide.ratings || {})
    .filter(([, r]) => r === "yes" || r === "maybe")
    .map(([id]) => id)
    .filter((id) => ownerKinkMap[id] && !visionKinkIds.includes(id));

  if (!started) {
    return (
      <Layout>
        <div className="space-y-5">
          <Sticker className="text-center space-y-3">
            <h1 className="font-display text-3xl text-plum">
              {creatorName} has invited you to play together.
            </h1>
            <p className="text-sm text-muted-foreground">
              Tap yes / maybe / no on each item below so they can see what matches.
            </p>
          </Sticker>

          {(ownerSide.vision?.trim() || visionKinkIds.length > 0) && (
            <Sticker variant="coral" className="space-y-3">
              <div className="text-center font-display text-2xl text-plum">Scene vision</div>
              {ownerSide.vision?.trim() && (
                <div className="bg-card/60 rounded-xl p-3">
                  <div className="text-[11px] uppercase tracking-wider text-coral font-bold mb-1">
                    {creatorName}'s vision
                  </div>
                  <p className="text-sm whitespace-pre-wrap">{ownerSide.vision}</p>
                </div>
              )}
              {visionKinkIds.length > 0 && (
                <div className="space-y-3">
                  <div className="text-xs text-muted-foreground pb-1">
                    {creatorName} picked these for the scene — how do you feel?
                  </div>
                  {visionKinkIds.map((id) => (
                    <KinkBlock
                      key={id}
                      name={ownerKinkMap[id]}
                      creatorDirection={ownerSide.directions?.[id]}
                      rating={side.ratings[id]}
                      direction={side.directions?.[id]}
                      onRating={(r) => setRating(id, r)}
                      onDirection={(d) => setDirection(id, d)}
                    />
                  ))}
                </div>
              )}
            </Sticker>
          )}

          {sideKinkIds.length > 0 && (
            <Sticker className="space-y-2">
              <div className="text-center font-display text-2xl text-plum">{creatorName}'s kinks</div>
              <p className="text-xs text-muted-foreground text-center">
                Other things on their side. Rate each one.
              </p>
              <div className="space-y-3 pt-1">
                {sideKinkIds.map((id) => (
                  <KinkBlock
                    key={id}
                    name={ownerKinkMap[id]}
                    creatorDirection={ownerSide.directions?.[id]}
                    rating={side.ratings[id]}
                    direction={side.directions?.[id]}
                    onRating={(r) => setRating(id, r)}
                    onDirection={(d) => setDirection(id, d)}
                  />
                ))}
              </div>
            </Sticker>
          )}

          <div className="flex justify-center pt-2">
            <Button onClick={() => { setStarted(true); if (typeof window !== "undefined") window.scrollTo({ top: 0, behavior: "smooth" }); }}>
              Next
            </Button>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-5">
        <Sticker className="text-center space-y-2">
          <h1 className="font-display text-3xl text-plum">
            Your side
          </h1>
          <p className="text-sm text-muted-foreground">
            Fill out your scene vision, kinks, limits, and safewords. {creatorName} will see what matches.
          </p>
        </Sticker>

        {(session.ownerSide.hardLimits?.trim() || session.ownerSide.softLimits?.trim()) && (
          <Sticker className="space-y-3">
            <h2 className="font-display text-lg text-plum">
              {session.ownerSide.name?.trim() || "Their"} limits
            </h2>
            <p className="text-xs text-muted-foreground">
              These are the limits they shared. Please respect them as you fill out your side.
            </p>
            {session.ownerSide.hardLimits?.trim() && (
              <div>
                <div className="text-[10px] uppercase tracking-wider text-no font-semibold mb-1">Hard limits</div>
                <div className="text-sm whitespace-pre-wrap">{session.ownerSide.hardLimits}</div>
              </div>
            )}
            {session.ownerSide.softLimits?.trim() && (
              <div>
                <div className="text-[10px] uppercase tracking-wider text-maybe font-semibold mb-1">Soft limits</div>
                <div className="text-sm whitespace-pre-wrap">{session.ownerSide.softLimits}</div>
              </div>
            )}
          </Sticker>
        )}

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
          <h2 className="font-display text-lg text-plum">Scene vision</h2>
          <Field label="What are you imagining for this scene?">
            <Textarea
              value={side.vision}
              onChange={(e) => updateField("vision", e.target.value)}
              rows={5}
              placeholder="Set the mood in your own words…"
            />
          </Field>
          <div className="space-y-2">
            <Label className="doc-label">Pick what you're craving for this scene</Label>
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
                      {selected ? "Selected " : "+ "}{k.name}
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
          <h2 className="font-display text-lg text-plum">Lightning round</h2>
          {grouped.map(([cat, items]) => (
            <div key={cat}>
              <div className="font-display text-sm text-coral mt-2 mb-1">{cat}</div>
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

        <div className="flex justify-center pt-2">
          <Button disabled={submitting} onClick={submit}>
            {submitting ? "Submitting..." : "Submit my side"}
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

function Detail({ title, value }: { title: string; value: string }) {
  if (!value?.trim()) return null;
  return (
    <div className="border-b border-border/40 pb-2">
      <div className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">{title}</div>
      <div className="text-sm whitespace-pre-wrap">{value}</div>
    </div>
  );
}

function RateRow({ name, value, onChange }: { name: string; value: Rating | undefined; onChange: (r: Rating) => void }) {
  return (
    <div className="flex items-center justify-between gap-2 py-1.5 border-b border-border/40 last:border-0">
      <div className="text-sm flex-1 min-w-0 truncate">{name}</div>
      <div className="flex gap-1">
        {(["yes", "maybe", "no"] as Rating[]).map((r) => (
          <button
            key={r}
            type="button"
            onClick={() => onChange(r)}
            className={cn(
              "h-7 px-2.5 rounded-full text-xs font-semibold border-2 transition capitalize",
              value === r
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
  );
}

const DIRECTION_LABELS: Record<Direction, string> = { give: "Give", receive: "Receive", both: "Both" };

function KinkBlock({
  name,
  creatorDirection,
  rating,
  direction,
  onRating,
  onDirection,
}: {
  name: string;
  creatorDirection?: Direction;
  rating: Rating | undefined;
  direction: Direction | undefined;
  onRating: (r: Rating) => void;
  onDirection: (d: Direction) => void;
}) {
  return (
    <div className="rounded-2xl border border-border/40 p-3 space-y-2 bg-card/40">
      <div className="flex items-center justify-between gap-2">
        <div className="text-sm font-medium flex items-center gap-2 min-w-0">
          <span className="truncate">{name}</span>
          {creatorDirection && (
            <span className="text-[10px] uppercase tracking-wider px-1.5 py-0.5 rounded-full bg-blush text-plum font-semibold shrink-0">
              They: {DIRECTION_LABELS[creatorDirection]}
            </span>
          )}
        </div>
      </div>
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <div className="flex gap-1">
          {(["yes", "maybe", "no"] as Rating[]).map((r) => (
            <button
              key={r}
              type="button"
              onClick={() => onRating(r)}
              className={cn(
                "h-7 px-2.5 rounded-full text-xs font-semibold border-2 transition capitalize",
                rating === r
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
        <div className="inline-flex rounded-full border border-border/60 overflow-hidden">
          {(["give", "receive", "both"] as Direction[]).map((d) => (
            <button
              key={d}
              type="button"
              onClick={() => onDirection(d)}
              className={cn(
                "h-7 px-2.5 text-[11px] font-semibold transition border-r border-border/60 last:border-r-0 capitalize",
                direction === d ? "bg-yes/20 text-foreground" : "text-muted-foreground hover:text-foreground"
              )}
            >
              {DIRECTION_LABELS[d]}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
