import { createFileRoute, Link } from "@tanstack/react-router";
import { Layout } from "@/components/Layout";
import { Sticker } from "@/components/Sticker";
import { Button } from "@/components/ui/button";
import { useSessionIndex } from "@/lib/storage";
import { Plus, Calendar, Sparkles } from "lucide-react";

export const Route = createFileRoute("/sessions/")({
  head: () => ({ meta: [{ title: "Sessions — Department of Consent" }] }),
  component: SessionsList,
});

function SessionsList() {
  const [sessions] = useSessionIndex();
  const sorted = [...sessions].sort((a, b) => b.createdAt.localeCompare(a.createdAt));

  return (
    <Layout>
      <div className="space-y-5">
        <div className="flex items-end justify-between">
          <div>
            <h1 className="font-display text-3xl font-semibold text-plum">Sessions</h1>
            <p className="text-sm text-muted-foreground">Active and past play.</p>
          </div>
          <Button asChild size="sm" className="rounded-full">
            <Link to="/sessions/new"><Plus className="h-4 w-4 mr-1" /> New</Link>
          </Button>
        </div>

        {sorted.length === 0 && (
          <Sticker className="text-center space-y-3 py-10">
            <Sparkles className="h-8 w-8 mx-auto text-coral" />
            <p className="font-display text-lg text-plum">No sessions yet</p>
            <p className="text-sm text-muted-foreground">Your first negotiation is just a tap away.</p>
            <Button asChild className="rounded-full">
              <Link to="/sessions/new">Create one</Link>
            </Button>
          </Sticker>
        )}

        <div className="space-y-3">
          {sorted.map((s) => (
            <Link key={s.shareToken} to="/sessions/$sessionId" params={{ sessionId: s.shareToken }}>
              <Sticker className="hover:scale-[1.01] transition-transform">
                <div className="flex justify-between items-start gap-3">
                  <div className="min-w-0">
                    <div className="font-display text-lg font-semibold text-plum truncate">
                      {s.partnerHandle || "Untitled session"}
                    </div>
                    <div className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                      <Calendar className="h-3 w-3" />
                      {s.date}
                    </div>
                  </div>
                  <span className="text-[10px] uppercase tracking-wider px-2 py-1 rounded-full font-semibold bg-blush text-plum">
                    {s.role === "partner" ? "Joined" : "Owner"}
                  </span>
                </div>
              </Sticker>
            </Link>
          ))}
        </div>
      </div>
    </Layout>
  );
}
