import { createFileRoute, Link } from "@tanstack/react-router";
import { Layout } from "@/components/Layout";
import { Sticker } from "@/components/Sticker";
import { Button } from "@/components/ui/button";
import { CloudButton } from "@/components/CloudButton";
import { useMySessions, useKinks, generateSceneTitle } from "@/lib/storage";
import { Calendar } from "lucide-react";
import { RequireAuth } from "@/components/RequireAuth";
import { WhipLoader } from "@/components/WhipLoader";
import { useMemo } from "react";
import emptySessionsImg from "@/assets/empty-sessions.png";

export const Route = createFileRoute("/sessions/")({
  head: () => ({ meta: [{ title: "Scenes — Department of Consent" }] }),
  component: () => <RequireAuth><SessionsList /></RequireAuth>,
});

function SessionsList() {
  const { data: sessions, isLoading } = useMySessions();
  const [kinks] = useKinks();
  const kinkMap = useMemo(() => Object.fromEntries(kinks.map((k) => [k.id, k.name])), [kinks]);
  const sorted = (sessions ?? []).slice().sort((a, b) => b.createdAt.localeCompare(a.createdAt));

  return (
    <Layout>
      <div className="space-y-5">
        <div>
          <h1 className="font-display text-3xl font-semibold text-plum">Scenes</h1>
          <p className="text-sm text-muted-foreground">Active and past play, synced to your account.</p>
        </div>


        {isLoading && (
          <div className="flex items-center justify-center min-h-[60vh]"><WhipLoader /></div>
        )}

        {!isLoading && sorted.length === 0 && (
          <Sticker className="text-center space-y-3 py-10">
            <img src={emptySessionsImg} alt="" className="h-32 w-32 mx-auto object-contain" />
            <p className="font-display text-lg text-plum">No scenes yet</p>
            <p className="text-sm text-muted-foreground">Your first negotiation is just a tap away.</p>
            <Button asChild className="rounded-full">
              <Link to="/sessions/new">Create one</Link>
            </Button>
          </Sticker>
        )}

        <div className="space-y-5">
          {sorted.map((s) => (
            <Link key={s.shareToken} to="/sessions/$sessionId" params={{ sessionId: s.shareToken }}>
              <Sticker className="hover:scale-[1.01] transition-transform">
                <div className="flex justify-between items-start gap-3">
                  <div className="min-w-0">
                    <div className="font-display text-lg font-semibold text-plum truncate">
                      {generateSceneTitle(s.ownerSide, kinkMap) || s.partnerHandle || "Untitled scene"}
                    </div>
                    <div className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                      <Calendar className="h-3 w-3" />
                      {s.date}
                    </div>
                  </div>
                  <span className="text-[10px] uppercase tracking-wider px-2 py-1 rounded-full font-semibold bg-blush text-plum">
                    {s.role === "partner" ? "Joined" : "Creator"}
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
