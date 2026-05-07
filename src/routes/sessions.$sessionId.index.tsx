import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Layout } from "@/components/Layout";
import { Sticker } from "@/components/Sticker";
import { Button } from "@/components/ui/button";
import { useKinks, useSessionIndex, type SessionSide } from "@/lib/storage";
import { useCloudSession } from "@/lib/useCloudSession";
import { apiDeleteSession } from "@/lib/sessionsApi";
import { QRCodeSVG } from "qrcode.react";
import { Copy, Flame, Heart, RefreshCw, Trash2 } from "lucide-react";
import { useMemo, useState } from "react";
import { RequireAuth } from "@/components/RequireAuth";

export const Route = createFileRoute("/sessions/$sessionId/")({
  head: () => ({ meta: [{ title: "Session — Department of Consent" }] }),
  component: () => <RequireAuth><SessionDetail /></RequireAuth>,
});

function SessionDetail() {
  const { sessionId } = Route.useParams(); // shareToken
  const [, setIndex] = useSessionIndex();
  const [kinks] = useKinks();
  const navigate = useNavigate();
  const [copied, setCopied] = useState(false);
  const { session, error, refresh } = useCloudSession(sessionId);

  const kinkMap = useMemo(() => Object.fromEntries(kinks.map((k) => [k.id, k.name])), [kinks]);

  if (session === undefined) {
    return <Layout><Sticker className="text-center">Loading…</Sticker></Layout>;
  }

  if (!session) {
    return (
      <Layout>
        <Sticker className="text-center space-y-3">
          <p>Session not found.</p>
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
    if (!confirm("Delete this session? This wipes it from the server too.")) return;
    await apiDeleteSession(session.shareToken);
    setIndex((p) => p.filter((s) => s.shareToken !== session.shareToken));
    navigate({ to: "/sessions" });
  };

  const o = session.ownerSide;
  const partners = session.partnerSides ?? (session.partnerSide ? [session.partnerSide] : []);
  const ownerName = o.name?.trim() || "Creator";

  const yesItems = Object.entries(o.ratings || {}).filter(([, r]) => r === "yes").map(([id]) => kinkMap[id] || id);
  const maybeItems = Object.entries(o.ratings || {}).filter(([, r]) => r === "maybe").map(([id]) => kinkMap[id] || id);
  const noItems = Object.entries(o.ratings || {}).filter(([, r]) => r === "no").map(([id]) => kinkMap[id] || id);

  return (
    <Layout>
      <div className="space-y-5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h1 className="font-display text-3xl font-semibold text-plum">
              {session.partnerHandle || "Untitled session"}
            </h1>
            <p className="text-sm text-muted-foreground">{session.date}</p>
          </div>
          <span className="text-[10px] uppercase tracking-wider px-2 py-1 rounded-full bg-blush text-plum font-semibold">
            {session.status}
          </span>
        </div>

        <Sticker className="text-center space-y-3">
          <div className="font-display text-lg text-plum">Share with your partner</div>
          <div className="flex justify-center bg-card p-3 rounded-xl">
            <QRCodeSVG value={shareUrl} size={180} fgColor="#c2185b" bgColor="transparent" />
          </div>
          <button onClick={copy} className="text-xs flex items-center gap-1 mx-auto text-muted-foreground hover:text-primary break-all">
            <Copy className="h-3 w-3 shrink-0" />
            {copied ? "Copied!" : shareUrl}
          </button>
          <p className="text-xs text-muted-foreground">
            Anyone with this link can fill out the partner side. They'll see your side once they submit.
          </p>
          <Button variant="ghost" size="sm" className="rounded-full text-xs" onClick={refresh}>
            <RefreshCw className="h-3 w-3 mr-1" /> Check for partner's reply
          </Button>
        </Sticker>

        <div className="grid grid-cols-3 gap-2">
          <Button asChild variant="outline" size="sm">
            <Link to="/sessions/$sessionId/edit" params={{ sessionId }}>
              Edit
            </Link>
          </Button>
          <Button asChild variant="outline" size="sm">
            <Link to="/sessions/$sessionId/scene" params={{ sessionId }}>
              <Flame className="h-4 w-4 mr-1" /> Scene
            </Link>
          </Button>
          <Button asChild variant="outline" size="sm">
            <Link to="/sessions/$sessionId/aftercare" params={{ sessionId }}>
              <Heart className="h-4 w-4 mr-1" /> Aftercare
            </Link>
          </Button>
        </div>

        {/* Visions per participant */}
        <Sticker variant="coral" className="space-y-4">
          <div className="text-center">
            <div className="font-display text-2xl font-semibold text-plum">Tonight's vision</div>
          </div>
          <VisionBlock name={`${ownerName}'s vision for the night`} side={o} kinkMap={kinkMap} />
          {partners.map((ps, i) => (
            <VisionBlock
              key={i}
              name={`${(ps.name?.trim() || `Partner ${i + 1}`)}'s vision for the night`}
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
            kinkMap={kinkMap}
            partnerName={ps.name || `User ${i + 2}`}
          />
        ))}

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

        <button
          onClick={remove}
          className="w-full bg-white text-destructive border-2 border-destructive/40 hover:bg-destructive/5 transition px-4 py-3 font-semibold text-sm flex items-center justify-center gap-2"
        >
          <Trash2 className="h-4 w-4" /> Delete session
        </button>
      </div>
    </Layout>
  );
}

function SideDetail({ title, value }: { title: string; value: string }) {
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
  kinkMap,
  partnerName,
}: {
  a: Record<string, string>;
  b: Record<string, string>;
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

  return (
    <div className="space-y-4">
      {/* HERO: mutual yes — the positive overlap */}
      <Sticker variant="coral" className="space-y-3 text-center">
        <div className="text-5xl">💖</div>
        <div className="font-display text-2xl font-semibold text-plum">
          {mutualYes.length > 0
            ? `${mutualYes.length} mutual yes${mutualYes.length === 1 ? "" : "es"}`
            : "No mutual yeses yet"}
        </div>
        <p className="text-xs text-muted-foreground">
          You and {partnerName} both said yes to these.
        </p>
        {mutualYes.length > 0 && (
          <div className="flex flex-wrap gap-2 justify-center pt-1">
            {mutualYes.map((n) => (
              <span
                key={n}
                className="text-sm font-medium bg-yes/25 text-plum px-3 py-1.5 rounded-full border border-yes/40"
              >
                💚 {n}
              </span>
            ))}
          </div>
        )}
      </Sticker>

      {curious.length > 0 && (
        <Sticker className="space-y-2">
          <div className="font-display text-lg text-plum">✨ Curious to explore together</div>
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

      {(negotiate.length > 0 || conflicts.length > 0) && (
        <Sticker className="space-y-3">
          <div className="font-display text-lg text-plum">Negotiate</div>
          {negotiate.length > 0 && (
            <div>
              <div className="text-xs font-semibold uppercase text-maybe mb-1">💛 Discuss</div>
              <div className="flex flex-wrap gap-1">
                {negotiate.map((n) => <span key={n} className="text-xs bg-maybe/20 px-2 py-0.5 rounded-full">{n}</span>)}
              </div>
            </div>
          )}
          {conflicts.length > 0 && (
            <div>
              <div className="text-xs font-semibold uppercase text-no mb-1">🛑 Hard limit from one side</div>
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
