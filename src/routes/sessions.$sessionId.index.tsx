import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Layout } from "@/components/Layout";
import { Sticker } from "@/components/Sticker";
import { Button } from "@/components/ui/button";
import { useSessions, useKinks } from "@/lib/storage";
import { QRCodeSVG } from "qrcode.react";
import { Copy, Flame, Heart, Trash2 } from "lucide-react";
import { useMemo, useState } from "react";

export const Route = createFileRoute("/sessions/$sessionId/")({
  head: () => ({ meta: [{ title: "Session — Department of Consent" }] }),
  component: SessionDetail,
});

function SessionDetail() {
  const { sessionId } = Route.useParams();
  const [sessions, setSessions] = useSessions();
  const [kinks] = useKinks();
  const navigate = useNavigate();
  const [copied, setCopied] = useState(false);

  const session = sessions.find((s) => s.id === sessionId);
  const kinkMap = useMemo(() => Object.fromEntries(kinks.map((k) => [k.id, k.name])), [kinks]);

  if (!session) {
    return (
      <Layout>
        <Sticker className="text-center space-y-3">
          <p>Session not found.</p>
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

  const remove = () => {
    if (!confirm("Delete this session?")) return;
    setSessions((p) => p.filter((s) => s.id !== sessionId));
    navigate({ to: "/sessions" });
  };

  const o = session.ownerSide;
  const p = session.partnerSide;

  const yesItems = Object.entries(o.ratings).filter(([, r]) => r === "yes").map(([id]) => kinkMap[id] || id);
  const maybeItems = Object.entries(o.ratings).filter(([, r]) => r === "maybe").map(([id]) => kinkMap[id] || id);
  const noItems = Object.entries(o.ratings).filter(([, r]) => r === "no").map(([id]) => kinkMap[id] || id);

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
          <button onClick={copy} className="text-xs flex items-center gap-1 mx-auto text-muted-foreground hover:text-primary">
            <Copy className="h-3 w-3" />
            {copied ? "Copied!" : shareUrl}
          </button>
          <p className="text-xs text-muted-foreground">
            They'll fill their own side. Then you'll see both side-by-side.
          </p>
        </Sticker>

        <div className="grid grid-cols-2 gap-3">
          <Button asChild variant="outline" className="rounded-full">
            <Link to="/sessions/$sessionId/scene" params={{ sessionId }}>
              <Flame className="h-4 w-4 mr-1" /> Scene card
            </Link>
          </Button>
          <Button asChild variant="outline" className="rounded-full">
            <Link to="/sessions/$sessionId/aftercare" params={{ sessionId }}>
              <Heart className="h-4 w-4 mr-1" /> Aftercare
            </Link>
          </Button>
        </div>

        {p && (
          <Sticker variant="coral" className="space-y-2">
            <div className="font-display text-lg text-plum">Compare sides</div>
            <p className="text-xs text-muted-foreground">
              {p.name || "Your partner"} has filled their side.
            </p>
            <Compare a={o.ratings} b={p.ratings} kinkMap={kinkMap} />
          </Sticker>
        )}

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

        <Button variant="outline" onClick={remove} className="w-full rounded-full text-destructive border-destructive/40">
          <Trash2 className="h-4 w-4 mr-1" /> Delete session
        </Button>
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
}: {
  a: Record<string, string>;
  b: Record<string, string>;
  kinkMap: Record<string, string>;
}) {
  const allIds = Array.from(new Set([...Object.keys(a), ...Object.keys(b)]));
  const mutualYes: string[] = [];
  const conflicts: string[] = [];
  const negotiate: string[] = [];
  for (const id of allIds) {
    const ra = a[id], rb = b[id];
    if (ra === "yes" && rb === "yes") mutualYes.push(kinkMap[id] || id);
    else if (ra === "no" || rb === "no") conflicts.push(kinkMap[id] || id);
    else if (ra === "maybe" || rb === "maybe") negotiate.push(kinkMap[id] || id);
  }
  return (
    <div className="space-y-2 text-sm">
      {mutualYes.length > 0 && (
        <div>
          <div className="text-xs font-semibold uppercase text-yes mb-1">💚 Mutual Yes</div>
          <div className="flex flex-wrap gap-1">
            {mutualYes.map((n) => <span key={n} className="text-xs bg-yes/20 px-2 py-0.5 rounded-full">{n}</span>)}
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
      {negotiate.length > 0 && (
        <div>
          <div className="text-xs font-semibold uppercase text-maybe mb-1">💛 Discuss</div>
          <div className="flex flex-wrap gap-1">
            {negotiate.map((n) => <span key={n} className="text-xs bg-maybe/20 px-2 py-0.5 rounded-full">{n}</span>)}
          </div>
        </div>
      )}
    </div>
  );
}
