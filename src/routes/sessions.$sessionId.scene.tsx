import { createFileRoute, Link } from "@tanstack/react-router";
import { Layout } from "@/components/Layout";
import { Sticker } from "@/components/Sticker";
import { Button } from "@/components/ui/button";
import { useSessions } from "@/lib/storage";
import { Phone } from "lucide-react";

export const Route = createFileRoute("/sessions/$sessionId/scene")({
  head: () => ({ meta: [{ title: "In-scene reference" }] }),
  component: ScenePage,
});

function ScenePage() {
  const { sessionId } = Route.useParams();
  const [sessions] = useSessions();
  const session = sessions.find((s) => s.id === sessionId);

  if (!session) return <Layout><Sticker>Not found.</Sticker></Layout>;

  const o = session.ownerSide;

  return (
    <Layout>
      <div className="space-y-4">
        <div>
          <h1 className="font-display text-3xl font-semibold text-plum">In-scene card</h1>
          <p className="text-sm text-muted-foreground">{session.partnerHandle} · {session.date}</p>
        </div>

        <Sticker variant="coral" className="space-y-1">
          <div className="text-[10px] uppercase tracking-wider text-coral font-bold">Safewords</div>
          <pre className="font-mono text-xs whitespace-pre-wrap leading-relaxed">{o.safewords}</pre>
        </Sticker>

        {o.hardLimits && (
          <Sticker className="border-no" >
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
