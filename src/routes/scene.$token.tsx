import { WhipLoader } from "@/components/WhipLoader";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Layout } from "@/components/Layout";
import { Sticker } from "@/components/Sticker";
import { Button } from "@/components/ui/button";
import { useCloudSession } from "@/lib/useCloudSession";
import { useKinks, type SessionSide } from "@/lib/storage";
import { VibePills } from "@/components/scene/VibePills";
import { useMemo, useState } from "react";
import { Copy } from "lucide-react";

export const Route = createFileRoute("/scene/$token")({
  head: () => ({ meta: [{ title: "Scene recap" }] }),
  component: SceneRecap,
});

function SceneRecap() {
  const { token } = Route.useParams();
  const { session } = useCloudSession(token);
  const [kinks] = useKinks();
  const [copied, setCopied] = useState(false);
  const kinkMap = useMemo(
    () => Object.fromEntries(kinks.map((k) => [k.id, k.name])),
    [kinks]
  );

  if (session === undefined) return <Layout><div className="flex items-center justify-center min-h-[60vh]"><WhipLoader /></div></Layout>;
  if (!session) return <Layout><Sticker className="text-center">Scene not found.</Sticker></Layout>;

  const o = session.ownerSide;
  const partners = session.partnerSides ?? (session.partnerSide ? [session.partnerSide] : []);
  const ownerName = o.name?.trim() || "Creator";

  const url = typeof window !== "undefined"
    ? `${window.location.origin}/scene/${token}`
    : "";

  const copy = async () => {
    await navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <Layout>
      <div className="space-y-5">
        <div className="text-center">
          <h1 className="font-display text-3xl text-plum">Scene recap</h1>
          <p className="text-sm text-muted-foreground">{session.partnerHandle} · {session.date}</p>
        </div>

        <Sticker variant="coral" className="text-center space-y-2">
          <div className="font-display text-base text-plum">Permalink</div>
          <button
            onClick={copy}
            className="text-xs flex items-center gap-1 mx-auto text-muted-foreground hover:text-primary break-all"
          >
            <Copy className="h-3 w-3 shrink-0" />
            {copied ? "Copied!" : url}
          </button>
          <p className="text-[11px] text-muted-foreground">Share this with anyone in the scene.</p>
        </Sticker>

        <SideRecap title={`${ownerName}'s side`} side={o} kinkMap={kinkMap} />
        {partners.map((ps, i) => (
          <SideRecap
            key={i}
            title={`${(ps.name?.trim() || `Play partner ${i + 1}`)}'s side`}
            side={ps}
            kinkMap={kinkMap}
          />
        ))}

        <div className="flex justify-center">
          <Button asChild variant="outline">
            <Link to="/">Home</Link>
          </Button>
        </div>
      </div>
    </Layout>
  );
}

function SideRecap({
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
    <Sticker className="space-y-3">
      <div className="font-display text-lg text-plum">{title}</div>
      {side.vision && (
        <div>
          <div className="text-[10px] uppercase tracking-wider text-plum font-bold">Vibe</div>
          <VibePills raw={side.vision} />
        </div>
      )}
      <Detail title="Setting" value={side.setting} />
      <Detail title="Music" value={side.music} />
      <Detail title="Dress" value={side.dress} />
      <Detail title="Call me" value={side.callMe} />
      <Detail title="Don't call me" value={side.dontCallMe} />
      <Detail title="Genitals referred to as" value={side.genitalsRefer ?? ""} />
      <Detail title="Intentions" value={side.intentions} />
      <Detail title="Privacy" value={side.privacy} />
      <Detail title="Penetrative sex" value={side.penetrativeSex} />
      <Detail title="Last STD test date" value={side.stdTestDate || ""} />
      <Detail title="STD test results" value={side.stdTestResults || ""} />
      <Detail title="On PrEP / DoxyPEP" value={side.prepDoxypep || ""} />
      <Detail title="On birth control" value={side.birthControl || ""} />
      <Detail title="Hard limits" value={side.hardLimits} />
      <Detail title="Soft limits" value={side.softLimits} />
      <Detail title="Enthusiastic Yes" value={side.yesList} />
      <Detail title="Aftercare" value={side.aftercare} />
      {yesItems.length > 0 && <Pills label="Yes" items={yesItems} cls="bg-yes/20" />}
      {maybeItems.length > 0 && <Pills label="Maybe" items={maybeItems} cls="bg-maybe/20" />}
      {noItems.length > 0 && <Pills label="Hard No" items={noItems} cls="bg-no/20" />}
    </Sticker>
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

function Pills({ label, items, cls }: { label: string; items: string[]; cls: string }) {
  return (
    <div>
      <div className="text-xs font-semibold uppercase mt-3 mb-1">{label}</div>
      <div className="flex flex-wrap gap-1">
        {items.map((n) => <span key={n} className={`text-xs ${cls} px-2 py-0.5 rounded-full`}>{n}</span>)}
      </div>
    </div>
  );
}
