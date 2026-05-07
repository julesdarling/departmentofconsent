import { createFileRoute, Link } from "@tanstack/react-router";
import { Layout } from "@/components/Layout";
import { Sticker } from "@/components/Sticker";
import { Button } from "@/components/ui/button";
import { useCloudSession } from "@/lib/useCloudSession";
import { Phone } from "lucide-react";

import { RequireAuth } from "@/components/RequireAuth";

export const Route = createFileRoute("/sessions/$sessionId/scene")({
  head: () => ({ meta: [{ title: "In-scene reference" }] }),
  component: () => <RequireAuth><ScenePage /></RequireAuth>,
});

function ScenePage() {
  const { sessionId } = Route.useParams();
  const { session } = useCloudSession(sessionId);

  if (session === undefined) return <Layout><Sticker>Loading…</Sticker></Layout>;
  if (!session) return <Layout><Sticker>Not found.</Sticker></Layout>;

  const o = session.ownerSide;
  const partners = session.partnerSides ?? (session.partnerSide ? [session.partnerSide] : []);
  const ownerName = o.name?.trim() || "Creator";

  return (
    <Layout>
      <div className="space-y-4">
        <div>
          <h1 className="font-display text-3xl font-semibold text-plum">In-scene card</h1>
          <p className="text-sm text-muted-foreground">{session.partnerHandle} · {session.date}</p>
        </div>

        {(o.vision || partners.some((p) => p.vision)) && (
          <Sticker className="space-y-3">
            {o.vision && (
              <div>
                <div className="text-[11px] uppercase tracking-wider text-coral font-bold mb-1">
                  {ownerName}'s vision for the night
                </div>
                <p className="text-sm whitespace-pre-wrap">{o.vision}</p>
              </div>
            )}
            {partners.map((ps, i) => ps.vision && (
              <div key={i}>
                <div className="text-[11px] uppercase tracking-wider text-coral font-bold mb-1">
                  {(ps.name?.trim() || `Partner ${i + 1}`)}'s vision for the night
                </div>
                <p className="text-sm whitespace-pre-wrap">{ps.vision}</p>
              </div>
            ))}
          </Sticker>
        )}

        <Sticker variant="coral" className="space-y-1">
          <div className="text-[10px] uppercase tracking-wider text-coral font-bold">Safewords</div>
          <pre className="font-mono text-xs whitespace-pre-wrap leading-relaxed">{o.safewords}</pre>
        </Sticker>

        {o.hardLimits && (
          <Sticker className="border-no">
            <div className="text-[10px] uppercase tracking-wider text-no font-bold mb-1">Hard limits</div>
            <div className="text-base whitespace-pre-wrap font-semibold">{o.hardLimits}</div>
          </Sticker>
        )}

        {o.dontCallMe && (
          <Sticker>
            <div className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold mb-1">Don't call me</div>
            <div className="text-base font-semibold">{o.dontCallMe}</div>
          </Sticker>
        )}

        {o.emergencyContact && (
          <Sticker variant="coral">
            <div className="text-[10px] uppercase tracking-wider text-coral font-bold mb-1 flex items-center gap-1">
              <Phone className="h-3 w-3" /> Emergency contact
            </div>
            <div className="text-base whitespace-pre-wrap">{o.emergencyContact}</div>
          </Sticker>
        )}

        <Button asChild variant="outline" className="w-full rounded-full">
          <Link to="/sessions/$sessionId" params={{ sessionId }}>← Back to session</Link>
        </Button>
      </div>
    </Layout>
  );
}
