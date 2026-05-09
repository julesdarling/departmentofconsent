import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Layout } from "@/components/Layout";
import { Sticker } from "@/components/Sticker";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { CloudButton } from "@/components/CloudButton";
import { useCloudSession } from "@/lib/useCloudSession";
import type { SessionSide } from "@/lib/storage";
import bunnyIcon from "@/assets/icon-bunny-cuddle.png";

import { RequireAuth } from "@/components/RequireAuth";

export const Route = createFileRoute("/sessions/$sessionId/aftercare")({
  head: () => ({ meta: [{ title: "Aftercare" }] }),
  component: () => <RequireAuth><AftercarePage /></RequireAuth>,
});

function sideItems(side: SessionSide): string[] {
  if (side.aftercareItems && side.aftercareItems.length > 0) return side.aftercareItems;
  return (side.aftercare ?? "")
    .split(/[\n,]/)
    .map((s) => s.trim())
    .filter(Boolean);
}

function AftercarePage() {
  const { sessionId } = Route.useParams();
  const { session, update } = useCloudSession(sessionId);
  const navigate = useNavigate();

  if (session === undefined) return <Layout><Sticker>Loading…</Sticker></Layout>;
  if (!session) return <Layout><Sticker>Not found.</Sticker></Layout>;

  const completed = session.aftercareCompleted ?? [];

  const toggle = (key: string) => {
    const next = completed.includes(key)
      ? completed.filter((c) => c !== key)
      : [...completed, key];
    update({ aftercare_completed: next });
  };

  const sides: { side: SessionSide; fallbackName: string }[] = [
    { side: session.ownerSide, fallbackName: "Scene creator" },
    ...((session.partnerSides ?? (session.partnerSide ? [session.partnerSide] : []))
      .map((s, i) => ({ side: s, fallbackName: `Partner ${i + 1}` }))),
  ];

  return (
    <Layout>
      <div className="space-y-4">
        <div className="text-center space-y-2">
          <img src={bunnyIcon} alt="" className="h-20 w-20 mx-auto object-contain" />
          <h1 className="font-display text-3xl text-plum">Aftercare</h1>
          <p className="text-sm text-muted-foreground">Take what you need — check things off as you go.</p>
        </div>

        {sides.map(({ side, fallbackName }, idx) => {
          const items = sideItems(side);
          const name = side.name?.trim() || fallbackName;
          const personKey = side.participantId || `p_${idx}`;
          return (
            <Sticker key={personKey} className="space-y-3">
              <div className="text-center font-display text-2xl text-plum">{name}'s aftercare</div>
              {items.length === 0 && (
                <p className="text-sm text-muted-foreground">
                  Nothing specific noted. Drink water, breathe, be soft with each other.
                </p>
              )}
              {items.map((item) => {
                const key = `${personKey}::${item}`;
                const isDone = completed.includes(key);
                return (
                  <label key={key} className="flex items-start gap-3 cursor-pointer">
                    <Checkbox checked={isDone} onCheckedChange={() => toggle(key)} className="mt-0.5" />
                    <span className={isDone ? "line-through text-muted-foreground" : ""}>{item}</span>
                  </label>
                );
              })}
            </Sticker>
          );
        })}

        <Sticker variant="coral" className="space-y-2">
          <Label className="block text-center font-display text-2xl text-plum">Private reflection</Label>
          <p className="text-xs text-muted-foreground">How was it? What to remember next time?</p>
          <Textarea
            value={session.reflection ?? ""}
            onChange={(e) => update({ reflection: e.target.value })}
            rows={6}
          />
        </Sticker>

        <div className="flex flex-col items-center gap-3 pt-2">
          <CloudButton
            onClick={async () => {
              await update({ status: "completed" });
              navigate({ to: "/sessions" });
            }}
          >
            Mark scene completed
          </CloudButton>
          <CloudButton variant="outline" to={`/sessions/${sessionId}`}>
            ← Back
          </CloudButton>
        </div>
      </div>
    </Layout>
  );
}
