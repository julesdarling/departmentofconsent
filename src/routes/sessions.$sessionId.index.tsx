import { WhipLoader } from "@/components/WhipLoader";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Layout } from "@/components/Layout";
import { Sticker } from "@/components/Sticker";
import { Button } from "@/components/ui/button";
import { useKinks, useProfile, generateSceneTitle, DEFAULT_SAFEWORD_ITEMS, type SessionSide } from "@/lib/storage";
import { decodeVibe } from "@/lib/sceneVocab";
import { useCloudSession } from "@/lib/useCloudSession";
import { apiDeleteSession } from "@/lib/sessionsApi";
import { QRCodeSVG } from "qrcode.react";
import { Heart, RefreshCw, Trash2 } from "lucide-react";
import { CloudButton } from "@/components/CloudButton";
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion";
import { useMemo, useState } from "react";
import { useAuth } from "@/lib/useAuth";

export const Route = createFileRoute("/sessions/$sessionId/")({
  head: () => ({ meta: [{ title: "Scene — Department of Consent" }] }),
  component: SessionDetail,
});

function SessionDetail() {
  const { sessionId } = Route.useParams(); // shareToken
  
  const [kinks] = useKinks();
  const [profile] = useProfile();
  const navigate = useNavigate();
  const [copied, setCopied] = useState(false);
  const { session, error, refresh } = useCloudSession(sessionId);
  const { user } = useAuth();
  const isOwner = !!user;

  const kinkMap = useMemo(() => Object.fromEntries(kinks.map((k) => [k.id, k.name])), [kinks]);

  if (session === undefined) {
    return <Layout><div className="flex items-center justify-center min-h-[60vh]"><WhipLoader /></div></Layout>;
  }

  if (!session) {
    return (
      <Layout>
        <Sticker className="text-center space-y-3">
          <p>Scene not found.</p>
          {error && <p className="text-xs text-muted-foreground">{error}</p>}
          <Button asChild><Link to="/sessions">Back</Link></Button>
        </Sticker>
      </Layout>
    );
  }

  const shareUrl =
    typeof window !== "undefined"
      ? `${window.location.origin}/join/${session.shareToken}`
      : "";

  const copy = async () => {
    await navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const remove = async () => {
    if (!confirm("Delete this scene? This permanently removes it for everyone.")) return;
    await apiDeleteSession(session.shareToken);
    navigate({ to: "/sessions" });
  };

  const o = session.ownerSide;
  const partners = session.partnerSides ?? (session.partnerSide ? [session.partnerSide] : []);
  const ownerName = o.name?.trim() || profile?.name?.trim() || "Creator";


  return (
    <Layout>
      <div className="space-y-5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h1 className="font-display text-3xl text-plum">
              {generateSceneTitle(o, kinkMap) || session.partnerHandle || "Untitled scene"}
            </h1>
            <p className="text-sm text-muted-foreground">{session.date}</p>
          </div>
          <span className="text-[10px] uppercase tracking-wider px-2 py-1 rounded-full bg-blush text-plum font-semibold">
            {session.status}
          </span>
        </div>

        {isOwner && (
          <Sticker className="text-center space-y-3">
            <div className="font-display text-2xl text-plum text-center">Share with your play partner</div>
            <div className="flex justify-center bg-card p-3 rounded-xl">
              <QRCodeSVG value={shareUrl} size={180} fgColor="#c2185b" bgColor="transparent" />
            </div>
            <div className="flex justify-center pt-1">
              <CloudButton variant="mint" onClick={copy}>
                {copied ? "Copied!" : "Copy link to share"}
              </CloudButton>
            </div>
            <p className="text-xs text-muted-foreground">
              Anyone with this link can fill out the play partner side. They'll see your side once they submit.
            </p>
            <div className="flex justify-center pt-2">
              <button onClick={refresh} className="text-sm text-link underline underline-offset-4 hover:opacity-80 inline-flex items-center gap-1">
                <RefreshCw className="h-3 w-3" /> Check for play partner's reply
              </button>
            </div>
          </Sticker>
        )}

        <ParticipantsSection
          participants={[
            {
              name: ownerName,
              side: {
                ...o,
                pronouns: o.pronouns?.trim() || profile?.pronouns || "",
                healthcare: o.healthcare?.trim() || profile?.healthcare || "",
                emergencyContact: o.emergencyContact?.trim() || profile?.emergencyContact || "",
              },
            },
            ...partners.map((p, i) => ({
              name: p.name?.trim() || `Play partner ${i + 1}`,
              side: p,
            })),
          ]}
        />

        {/* Visions per participant */}
        <Sticker variant="coral" className="space-y-4">
          <div className="text-center">
            <div className="font-display text-2xl text-plum">Scene vision</div>
          </div>
          <VisionBlock name={`${ownerName}'s vision for the scene`} side={o} kinkMap={kinkMap} />
          {partners.map((ps, i) => (
            <VisionBlock
              key={i}
              name={`${(ps.name?.trim() || `Play partner ${i + 1}`)}'s vision for the scene`}
              side={ps}
              kinkMap={kinkMap}
            />
          ))}
        </Sticker>

        {partners.map((ps, i) => (
          <Compare
            key={i}
            a={o.ratings || {}}
            b={ps.ratings || {}}
            aSelected={o.selectedKinks || []}
            bSelected={ps.selectedKinks || []}
            kinkMap={kinkMap}
            partnerName={ps.name || `Play partner ${i + 1}`}
          />
        ))}

        <PrivacySexConsensus
          owner={{ name: ownerName, side: o }}
          partners={partners.map((p, i) => ({
            name: p.name?.trim() || `Play partner ${i + 1}`,
            side: p,
          }))}
        />

        <SafewordsSection
          owner={{ name: ownerName, side: o }}
          partners={partners.map((p, i) => ({
            name: p.name?.trim() || `Play partner ${i + 1}`,
            side: p,
          }))}
        />

        <SideChat
          participants={[
            { name: ownerName, side: o, isOwner: true },
            ...partners.map((p, i) => ({
              name: p.name?.trim() || `Play partner ${i + 1}`,
              side: p,
              isOwner: false,
            })),
          ]}
          kinkMap={kinkMap}
        />

        <div className="flex flex-col items-center gap-2">
          <CloudButton variant="outline" to={`/sessions/${sessionId}/aftercare`}>
            <Heart className="h-4 w-4 mr-1 inline" /> Start After Care
          </CloudButton>
        </div>

        {isOwner && (
          <>
            <div className="flex justify-center pt-2">
              <button onClick={remove} className="text-sm text-destructive underline underline-offset-4 hover:opacity-80 inline-flex items-center gap-1">
                <Trash2 className="h-4 w-4" /> Delete scene
              </button>
            </div>

            <div className="flex justify-center">
              <Link to="/sessions/$sessionId/edit" params={{ sessionId }} className="text-sm text-link underline underline-offset-4 hover:opacity-80">
                Edit scene
              </Link>
            </div>
          </>
        )}
      </div>
    </Layout>
  );
}

function SideDetail({ title, value }: { title: string; value: string | undefined }) {
  if (!value?.trim()) return null;
  return (
    <div className="border-b border-border/40 pb-2">
      <div className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">{title}</div>
      <div className="text-sm whitespace-pre-wrap">{value}</div>
    </div>
  );
}

function Compare({
  a,
  b,
  aSelected,
  bSelected,
  kinkMap,
  partnerName,
}: {
  a: Record<string, string>;
  b: Record<string, string>;
  aSelected: string[];
  bSelected: string[];
  kinkMap: Record<string, string>;
  partnerName: string;
}) {
  const allIds = Array.from(new Set([...Object.keys(a), ...Object.keys(b), ...aSelected, ...bSelected]));
  const mutualYes: string[] = [];
  const curious: string[] = []; // yes+maybe or maybe+maybe
  const conflicts: string[] = [];
  const negotiate: string[] = [];
  for (const id of allIds) {
    const ra = a[id], rb = b[id];
    const name = kinkMap[id] || id;
    if (ra === "yes" && rb === "yes") mutualYes.push(name);
    else if (ra === "no" || rb === "no") conflicts.push(name);
    else if (
      (ra === "yes" && rb === "maybe") ||
      (ra === "maybe" && rb === "yes") ||
      (ra === "maybe" && rb === "maybe")
    ) curious.push(name);
    else if (ra === "maybe" || rb === "maybe") negotiate.push(name);
  }

  const aSet = new Set(aSelected);
  const bSet = new Set(bSelected);
  // "Both want to play" = either side picked it AND the other side picked it
  // OR rated it yes (or both rated yes).
  const bothIds = new Set<string>();
  for (const id of allIds) {
    const ra = a[id], rb = b[id];
    const aWants = aSet.has(id) || ra === "yes";
    const bWants = bSet.has(id) || rb === "yes";
    const aBlocks = ra === "no";
    const bBlocks = rb === "no";
    if (aWants && bWants && !aBlocks && !bBlocks) bothIds.add(id);
  }
  // also include selected-by-both even if no ratings exist
  for (const id of aSelected) if (bSet.has(id)) bothIds.add(id);
  const bothWantToPlay = Array.from(bothIds).map((id) => kinkMap[id] || id);

  return (
    <div className="space-y-4">
      {curious.length > 0 && (
        <Sticker className="space-y-2">
          <div className="font-display text-2xl text-plum text-center">Curious to explore together</div>
          <p className="text-xs text-muted-foreground">
            At least one of you is a yes, the other a maybe — worth a chat.
          </p>
          <div className="flex flex-wrap gap-1 pt-1">
            {curious.map((n) => (
              <span key={n} className="text-xs bg-maybe/20 px-2 py-0.5 rounded-full">{n}</span>
            ))}
          </div>
        </Sticker>
      )}

      {(negotiate.length > 0 || conflicts.length > 0 || bothWantToPlay.length > 0) && (
        <Sticker className="space-y-3">
          <div className="font-display text-2xl text-plum text-center">Negotiate</div>
          {bothWantToPlay.length > 0 && (
            <div>
              <div className="text-xs font-semibold uppercase text-yes mb-1">Both want to play</div>
              <p className="text-[11px] text-muted-foreground mb-1">
                You and {partnerName} are both into these.
              </p>
              <div className="flex flex-wrap gap-1">
                {bothWantToPlay.map((n) => <span key={n} className="text-xs bg-yes/25 px-2 py-0.5 rounded-full border border-yes/40">{n}</span>)}
              </div>
            </div>
          )}
          {negotiate.length > 0 && (
            <div>
              <div className="text-xs font-semibold uppercase text-maybe mb-1">Discuss</div>
              <div className="flex flex-wrap gap-1">
                {negotiate.map((n) => <span key={n} className="text-xs bg-maybe/20 px-2 py-0.5 rounded-full">{n}</span>)}
              </div>
            </div>
          )}
          {conflicts.length > 0 && (
            <div>
              <div className="text-xs font-semibold uppercase text-plum mb-1">Hard limit from one side</div>
              <div className="flex flex-wrap gap-1">
                {conflicts.map((n) => <span key={n} className="text-xs bg-no/20 px-2 py-0.5 rounded-full">{n}</span>)}
              </div>
            </div>
          )}
        </Sticker>
      )}
    </div>
  );
}

function VisionBlock({
  name,
  side,
  kinkMap,
}: {
  name: string;
  side: SessionSide;
  kinkMap: Record<string, string>;
}) {
  const v = decodeVibe(side.vision);
  const hasVibe = !!side.vision;
  const intensityStyles: Record<number, string> = {
    1: "bg-yes/25 border-yes text-plum",
    2: "bg-maybe/30 border-maybe text-plum",
    3: "bg-blush border-coral/50 text-plum",
    4: "bg-coral/25 border-coral text-plum",
    5: "bg-no/25 border-no text-plum",
  };
  const intensityLabels = ["Cozy", "Warm", "Heated", "Intense", "Edge"];
  if (!hasVibe && (!side.selectedKinks || side.selectedKinks.length === 0)) return null;
  return (
    <div className="space-y-2">
      <div className="text-[11px] uppercase tracking-wider text-plum font-bold">{name}</div>
      {hasVibe && (
        <div className="flex flex-wrap gap-1.5">
          {v.moods.map((m) => (
            <span
              key={m}
              className="text-xs px-2.5 py-1 rounded-full border border-plum/20 bg-white font-semibold text-plum"
            >
              {m}
            </span>
          ))}
          <span
            className={`text-xs px-2.5 py-1 rounded-full border-2 font-semibold ${intensityStyles[v.intensity] ?? intensityStyles[3]}`}
          >
            Intensity {v.intensity}/5 · {intensityLabels[v.intensity - 1] ?? ""}
          </span>
        </div>
      )}
      {hasVibe && v.note.trim() && (
        <p className="text-sm italic text-plum/80 whitespace-pre-wrap">"{v.note.trim()}"</p>
      )}
      {side.selectedKinks?.length > 0 && (
        <div className="flex flex-wrap gap-1.5 pt-1">
          {side.selectedKinks.map((id) => (
            <span key={id} className="text-xs bg-yes/20 px-2 py-0.5 rounded-full">
              {kinkMap[id] || id}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

const PRIVACY_FIELDS: { key: keyof SessionSide; label: string }[] = [
  { key: "privacy", label: "Photos / videos" },
  { key: "talkingAfter", label: "Talking about it after" },
  { key: "penetrativeSex", label: "Penetrative sex" },
  { key: "stdTestDate", label: "Last STD test date" },
  { key: "stdTestResults", label: "STD test results" },
  { key: "prepDoxypep", label: "On PrEP / DoxyPEP" },
  { key: "birthControl", label: "On birth control" },
];

function PrivacySexConsensus({
  owner,
  partners,
}: {
  owner: { name: string; side: SessionSide };
  partners: { name: string; side: SessionSide }[];
}) {
  if (partners.length === 0) return null;
  const all = [owner, ...partners];
  const rows = PRIVACY_FIELDS.map(({ key, label }) => {
    const answers = all.map((p) => ({
      name: p.name,
      value: ((p.side[key] as string | undefined) ?? "").trim().toLowerCase(),
    }));
    if (answers.every((a) => !a.value)) return null;
    const distinct = Array.from(new Set(answers.map((a) => a.value).filter(Boolean)));
    const allAgree = distinct.length === 1 && answers.every((a) => a.value);
    return { label, answers, allAgree, agreedValue: distinct[0] };
  }).filter(Boolean) as {
    label: string;
    answers: { name: string; value: string }[];
    allAgree: boolean;
    agreedValue: string;
  }[];
  if (rows.length === 0) return null;

  const tone = (v: string) =>
    v === "yes" ? "bg-yes/25 border-yes/40"
    : v === "no" ? "bg-no/25 border-no/40"
    : v === "maybe" ? "bg-maybe/25 border-maybe/40"
    : "bg-card border-plum/20";

  return (
    <Sticker className="space-y-3">
      <div className="font-display text-2xl text-plum text-center">Privacy & sex</div>
      <div className="space-y-3">
        {rows.map((r) => (
          <div key={r.label} className="space-y-1">
            <div className="text-[11px] uppercase tracking-wider text-plum/70 font-bold">{r.label}</div>
            {r.allAgree ? (
              <div className="flex items-center gap-2 flex-wrap">
                <span className={`text-xs px-2 py-0.5 rounded-full border capitalize ${tone(r.agreedValue)}`}>
                  {r.agreedValue}
                </span>
                <span className="text-[10px] uppercase tracking-wider text-plum/60 font-semibold">
                  Everyone agrees
                </span>
              </div>
            ) : (
              <div className="flex flex-wrap gap-1.5">
                {r.answers.map((a, i) => (
                  <span
                    key={i}
                    className={`text-xs px-2 py-0.5 rounded-full border capitalize ${tone(a.value)}`}
                  >
                    <span className="font-semibold normal-case">{a.name}:</span> {a.value || "—"}
                  </span>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </Sticker>
  );
}

function SafewordsSection({
  owner,
  partners,
}: {
  owner: { name: string; side: SessionSide };
  partners: { name: string; side: SessionSide }[];
}) {
  const all = [owner, ...partners];
  const defaultSet = new Set(DEFAULT_SAFEWORD_ITEMS);

  const perPerson = all.map((p) => {
    const items = (p.side.safewordItems ?? []).map((s) => s.trim()).filter(Boolean);
    const defaults = items.filter((i) => defaultSet.has(i));
    const customs = items.filter((i) => !defaultSet.has(i));
    return { name: p.name, defaults, customs };
  });

  const hasAny = perPerson.some((p) => p.defaults.length > 0 || p.customs.length > 0);
  if (!hasAny) return null;

  // Determine if everyone's default selection is identical
  const sigs = perPerson.map((p) => [...p.defaults].sort().join("||"));
  const allSameDefaults = sigs.every((s) => s === sigs[0]);

  return (
    <Sticker className="space-y-3">
      <div className="font-display text-2xl text-plum text-center">Safewords</div>

      {allSameDefaults ? (
        perPerson[0].defaults.length > 0 && (
          <div className="space-y-1.5">
            <div className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">
              Everyone agreed
            </div>
            <ul className="space-y-1">
              {perPerson[0].defaults.map((item) => (
                <li key={item} className="text-sm text-plum">• {item}</li>
              ))}
            </ul>
          </div>
        )
      ) : (
        perPerson.map((p, i) =>
          p.defaults.length > 0 ? (
            <div key={`d-${i}`} className="space-y-1.5">
              <div className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">
                {p.name}
              </div>
              <ul className="space-y-1">
                {p.defaults.map((item) => (
                  <li key={item} className="text-sm text-plum">• {item}</li>
                ))}
              </ul>
            </div>
          ) : null
        )
      )}

      {perPerson.map((p, i) =>
        p.customs.length > 0 ? (
          <div key={`c-${i}`} className="space-y-1.5 pt-1">
            <div className="text-[10px] uppercase tracking-wider text-destructive font-semibold">
              {p.name}'s custom safeword{p.customs.length > 1 ? "s" : ""}
            </div>
            <ul className="space-y-1">
              {p.customs.map((item) => (
                <li key={item} className="text-sm text-destructive font-medium">• {item}</li>
              ))}
            </ul>
          </div>
        ) : null
      )}
    </Sticker>
  );
}

function ParticipantsSection({
  participants,
}: {
  participants: { name: string; side: SessionSide }[];
}) {
  const visible = participants.filter(
    (p) =>
      (p.name?.trim() || p.side.pronouns?.trim() || p.side.healthcare?.trim() || p.side.emergencyContact?.trim())
  );
  if (visible.length === 0) return null;

  return (
    <Sticker className="space-y-3">
      <div className="font-display text-2xl text-plum text-center">Participants</div>
      <div className="space-y-3">
        {visible.map((p, i) => {
          const hasContact = !!(p.side.healthcare?.trim() || p.side.emergencyContact?.trim());
          return (
            <div key={i} className="border-b border-border/40 pb-3 last:border-b-0 last:pb-0 space-y-1">
              <div className="text-base font-semibold text-plum">{p.name}</div>
              {p.side.pronouns?.trim() && (
                <div className="text-sm text-muted-foreground">{p.side.pronouns}</div>
              )}
              {hasContact && (
                <Accordion type="single" collapsible className="pt-1">
                  <AccordionItem value="contact" className="border-none">
                    <AccordionTrigger className="py-1.5 text-[10px] uppercase tracking-wider text-plum/70 font-semibold hover:no-underline">
                      Emergency contact
                    </AccordionTrigger>
                    <AccordionContent className="space-y-2 pt-1">
                      {p.side.healthcare?.trim() && (
                        <div>
                          <div className="text-[10px] uppercase tracking-wider text-plum/70 font-semibold">
                            Health insurance
                          </div>
                          <div className="text-sm whitespace-pre-wrap">{p.side.healthcare}</div>
                        </div>
                      )}
                      {p.side.emergencyContact?.trim() && (
                        <div>
                          <div className="text-[10px] uppercase tracking-wider text-plum/70 font-semibold">
                            Emergency contact
                          </div>
                          <div className="text-sm whitespace-pre-wrap">{p.side.emergencyContact}</div>
                        </div>
                      )}
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              )}
            </div>
          );
        })}
      </div>
    </Sticker>
  );
}

type ChatParticipant = { name: string; side: SessionSide; isOwner: boolean };

const CHAT_FIELDS: { key: keyof SessionSide; label: string }[] = [
  { key: "vision", label: "Vision" },
  { key: "timeOfPlay", label: "Date & time of play" },
  { key: "setting", label: "Setting" },
  { key: "timeConstraints", label: "Time constraints" },
  { key: "music", label: "Music" },
  { key: "dress", label: "Dress" },
  { key: "substances", label: "Substances" },
  { key: "medicalConcerns", label: "Medical concerns" },
  { key: "partnerDynamics", label: "Other partners / dynamics" },
  { key: "intentions", label: "Intentions" },
  { key: "goodTime", label: "A good time looks like" },
  { key: "badTime", label: "A bad time looks like" },
  { key: "callMe", label: "Call me" },
  { key: "dontCallMe", label: "Don't call me" },
  { key: "privacy", label: "Photos / videos" },
  { key: "talkingAfter", label: "Talking about it after" },
  { key: "penetrativeSex", label: "Penetrative sex" },
  { key: "stdTestDate", label: "Last STD test date" },
  { key: "stdTestResults", label: "STD test results" },
  { key: "prepDoxypep", label: "On PrEP / DoxyPEP" },
  { key: "birthControl", label: "On birth control" },
  { key: "hardLimits", label: "Hard limits" },
  { key: "softLimits", label: "Soft limits" },
  { key: "yesList", label: "Enthusiastic yes" },
  { key: "aftercare", label: "Aftercare" },
  { key: "brainstorm", label: "Brainstorm" },
];

function SideChat({
  participants,
  kinkMap,
}: {
  participants: ChatParticipant[];
  kinkMap: Record<string, string>;
}) {
  if (participants.length === 0) return null;
  const textSections = CHAT_FIELDS.map(({ key, label }) => ({
    label,
    replies: participants
      .map((p) => ({ p, value: ((p.side[key] as string | undefined) ?? "").trim() }))
      .filter((r) => r.value.length > 0),
  })).filter((s) => s.replies.length > 0);

  const ratingSections = (
    [
      { rating: "yes" as const, label: "Yes", cls: "bg-yes/25 border-yes/40" },
      { rating: "maybe" as const, label: "Maybe", cls: "bg-maybe/25 border-maybe/40" },
      { rating: "no" as const, label: "Hard No", cls: "bg-no/25 border-no/40" },
    ]
  ).map(({ rating, label, cls }) => ({
    label,
    cls,
    replies: participants
      .map((p) => ({
        p,
        items: Object.entries(p.side.ratings || {})
          .filter(([, r]) => r === rating)
          .map(([id]) => kinkMap[id] || id),
      }))
      .filter((r) => r.items.length > 0),
  })).filter((s) => s.replies.length > 0);

  if (textSections.length === 0 && ratingSections.length === 0) return null;

  const allSections = [
    ...textSections.map((s) => ({ kind: "text" as const, ...s })),
    ...ratingSections.map((s) => ({ kind: "rating" as const, ...s })),
  ];
  return (
    <Sticker className="p-4">
      <div className="font-display text-xl text-plum text-center mb-2">Replies</div>
      <div className="rounded-xl overflow-hidden border border-plum/10">
        {allSections.map((s, idx) => (
          <div
            key={`${s.kind}-${s.label}`}
            className={`px-3 py-2 space-y-1 ${idx % 2 === 0 ? "bg-plum/[0.04]" : "bg-transparent"}`}
          >
            <div className="text-[10px] uppercase tracking-wider text-plum/60 font-bold text-center">{s.label}</div>
            <div className="space-y-1">
              {s.kind === "text"
                ? s.replies.map(({ p, value }, i) => (
                    <ChatBubble key={i} name={p.name} isOwner={p.isOwner}>
                      <p className="whitespace-pre-wrap">{value}</p>
                    </ChatBubble>
                  ))
                : s.replies.map(({ p, items }, i) => (
                    <ChatBubble key={i} name={p.name} isOwner={p.isOwner}>
                      <div className="flex flex-wrap gap-1">
                        {items.map((n) => (
                          <span key={n} className={`text-[10px] px-1.5 py-0.5 rounded-full border ${s.cls}`}>{n}</span>
                        ))}
                      </div>
                    </ChatBubble>
                  ))}
            </div>
          </div>
        ))}
      </div>
    </Sticker>
  );
}

function ChatBubble({
  name,
  isOwner,
  children,
}: {
  name: string;
  isOwner: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className={`flex flex-col ${isOwner ? "items-start" : "items-end"}`}>
      <div className="text-[8px] uppercase tracking-wide text-plum/60 font-semibold mb-0.5 px-1">
        {name}
      </div>
      <div
        className={`max-w-[82%] text-[11px] leading-snug px-2.5 py-1 border border-plum/20 ${
          isOwner
            ? "bg-card rounded-2xl rounded-bl-sm"
            : "bg-blush rounded-2xl rounded-br-sm"
        }`}
      >
        {children}
      </div>
    </div>
  );
}

