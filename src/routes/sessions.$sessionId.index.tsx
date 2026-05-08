import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Layout } from "@/components/Layout";
import { Sticker } from "@/components/Sticker";
import { Button } from "@/components/ui/button";
import { useKinks, useProfile, generateSceneTitle, type SessionSide } from "@/lib/storage";
import { useCloudSession } from "@/lib/useCloudSession";
import { apiDeleteSession } from "@/lib/sessionsApi";
import { QRCodeSVG } from "qrcode.react";
import { Flame, Heart, RefreshCw, Trash2 } from "lucide-react";
import { CloudButton } from "@/components/CloudButton";
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
    return <Layout><Sticker className="text-center">Loading…</Sticker></Layout>;
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

  const yesItems = Object.entries(o.ratings || {}).filter(([, r]) => r === "yes").map(([id]) => kinkMap[id] || id);
  const maybeItems = Object.entries(o.ratings || {}).filter(([, r]) => r === "maybe").map(([id]) => kinkMap[id] || id);
  const noItems = Object.entries(o.ratings || {}).filter(([, r]) => r === "no").map(([id]) => kinkMap[id] || id);

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
            <div className="font-display text-lg text-plum">Share with your play partner</div>
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

        <div className="flex flex-col items-center gap-2">
          <CloudButton variant="outline" to={`/sessions/${sessionId}/scene`}>
            <Flame className="h-4 w-4 mr-1 inline" /> Open Scene Card
          </CloudButton>
          <CloudButton variant="outline" to={`/sessions/${sessionId}/aftercare`}>
            <Heart className="h-4 w-4 mr-1 inline" /> Start After Care
          </CloudButton>
        </div>

        {/* Visions per participant */}
        <Sticker variant="coral" className="space-y-4">
          <div className="text-center">
            <div className="font-display text-2xl text-plum">Scene vision</div>
          </div>
          <VisionBlock name={`${ownerName}'s vision for the night`} side={o} kinkMap={kinkMap} />
          {partners.map((ps, i) => (
            <VisionBlock
              key={i}
              name={`${(ps.name?.trim() || `Play partner ${i + 1}`)}'s vision for the night`}
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

        {partners.map((ps, i) => (
          <FullSideBlock
            key={i}
            title={`${ps.name?.trim() || `Play partner ${i + 1}`}'s side`}
            side={ps}
            kinkMap={kinkMap}
          />
        ))}

        <div className="flex justify-center">
          <Link to="/scene/$token" params={{ token: session.shareToken }} className="text-sm text-link underline underline-offset-4 hover:opacity-80">
            View shareable scene recap
          </Link>
        </div>

        <Sticker className="space-y-3">
          <div className="font-display text-lg text-plum">Your side</div>
          <SideDetail title="Setting" value={o.setting} />
          <SideDetail title="Music" value={o.music} />
          <SideDetail title="Dress" value={o.dress} />
          <SideDetail title="Call me" value={o.callMe} />
          <SideDetail title="Don't call me" value={o.dontCallMe} />
          <SideDetail title="Intentions" value={o.intentions} />
          <SideDetail title="Privacy" value={o.privacy} />
          <SideDetail title="Penetrative sex" value={o.penetrativeSex} />

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

          <SideDetail title="Hard limits (text)" value={o.hardLimits} />
          <SideDetail title="Soft limits (text)" value={o.softLimits} />
          <SideDetail title="Yes (text)" value={o.yesList} />
          <SideDetail title="Aftercare" value={o.aftercare} />
          <SideDetail title="Brainstorm" value={o.brainstorm} />
        </Sticker>

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
  const allIds = Array.from(new Set([...Object.keys(a), ...Object.keys(b)]));
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

  const bSet = new Set(bSelected);
  const agreedSelected = aSelected
    .filter((id) => bSet.has(id))
    .map((id) => kinkMap[id] || id);

  return (
    <div className="space-y-4">
      {mutualYes.length > 0 && (
        <Sticker variant="coral" className="space-y-3 text-center">
          <div className="font-display text-2xl text-plum">
            {mutualYes.length} mutual yes{mutualYes.length === 1 ? "" : "es"}
          </div>
          <p className="text-xs text-muted-foreground">
            You and {partnerName} both said yes to these.
          </p>
          <div className="flex flex-wrap gap-2 justify-center pt-1">
            {mutualYes.map((n) => (
              <span
                key={n}
                className="text-sm font-medium bg-yes/25 text-plum px-3 py-1.5 rounded-full border border-yes/40"
              >
                {n}
              </span>
            ))}
          </div>
        </Sticker>
      )}

      {curious.length > 0 && (
        <Sticker className="space-y-2">
          <div className="font-display text-lg text-plum">Curious to explore together</div>
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

      {(negotiate.length > 0 || conflicts.length > 0 || agreedSelected.length > 0) && (
        <Sticker className="space-y-3">
          <div className="font-display text-lg text-plum">Negotiate</div>
          {agreedSelected.length > 0 && (
            <div>
              <div className="text-xs font-semibold uppercase text-yes mb-1">Both want to play</div>
              <p className="text-[11px] text-muted-foreground mb-1">
                Cravings you both picked for this scene.
              </p>
              <div className="flex flex-wrap gap-1">
                {agreedSelected.map((n) => <span key={n} className="text-xs bg-yes/25 px-2 py-0.5 rounded-full border border-yes/40">{n}</span>)}
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
              <div className="text-xs font-semibold uppercase text-no mb-1">Hard limit from one side</div>
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
  if (!side.vision && (!side.selectedKinks || side.selectedKinks.length === 0)) return null;
  return (
    <div className="bg-card/60 rounded-xl p-3 space-y-2">
      <div className="text-[11px] uppercase tracking-wider text-coral font-bold">{name}</div>
      {side.vision && <p className="text-sm whitespace-pre-wrap">{side.vision}</p>}
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

function FullSideBlock({
  title,
  side,
  kinkMap,
}: {
  title: string;
  side: SessionSide;
  kinkMap: Record<string, string>;
}) {
  const yesItems = Object.entries(side.ratings || {}).filter(([, r]) => r === "yes").map(([id]) => kinkMap[id] || id);
  const maybeItems = Object.entries(side.ratings || {}).filter(([, r]) => r === "maybe").map(([id]) => kinkMap[id] || id);
  const noItems = Object.entries(side.ratings || {}).filter(([, r]) => r === "no").map(([id]) => kinkMap[id] || id);

  return (
    <Sticker variant="coral" className="space-y-3">
      <div className="font-display text-lg text-plum">{title}</div>
      <SideDetail title="Vision" value={side.vision} />
      <SideDetail title="Date & time of play" value={side.timeOfPlay} />
      <SideDetail title="Setting" value={side.setting} />
      <SideDetail title="Time constraints" value={side.timeConstraints} />
      <SideDetail title="Music" value={side.music} />
      <SideDetail title="Dress" value={side.dress} />
      <SideDetail title="Substances" value={side.substances} />
      <SideDetail title="Medical concerns" value={side.medicalConcerns} />
      <SideDetail title="Other partners / dynamics" value={side.partnerDynamics} />
      <SideDetail title="Intentions" value={side.intentions} />
      <SideDetail title="A good time looks like" value={side.goodTime} />
      <SideDetail title="A bad time looks like" value={side.badTime} />
      <SideDetail title="Call me" value={side.callMe} />
      <SideDetail title="Don't call me" value={side.dontCallMe} />
      <SideDetail title="Photos / videos" value={side.privacy} />
      <SideDetail title="Talking about it after" value={side.talkingAfter} />
      <SideDetail title="Penetrative sex" value={side.penetrativeSex} />

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

      <SideDetail title="Hard limits (text)" value={side.hardLimits} />
      <SideDetail title="Soft limits (text)" value={side.softLimits} />
      <SideDetail title="Yes (text)" value={side.yesList} />
      <SideDetail title="Aftercare" value={side.aftercare} />
      <SideDetail title="Brainstorm" value={side.brainstorm} />
    </Sticker>
  );
}
