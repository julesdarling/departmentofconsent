import { createFileRoute, Link } from "@tanstack/react-router";
import { Layout } from "@/components/Layout";
import { Sticker } from "@/components/Sticker";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { useSessions } from "@/lib/storage";

export const Route = createFileRoute("/sessions/$sessionId/aftercare")({
  head: () => ({ meta: [{ title: "Aftercare" }] }),
  component: AftercarePage,
});

function AftercarePage() {
  const { sessionId } = Route.useParams();
  const [sessions, setSessions] = useSessions();
  const session = sessions.find((s) => s.id === sessionId);

  if (!session) return <Layout><Sticker>Not found.</Sticker></Layout>;

  const items = session.ownerSide.aftercare
    .split(/[\n,]/)
    .map((s) => s.trim())
    .filter(Boolean);
  const completed = session.aftercareCompleted ?? [];

  const toggle = (item: string) => {
    setSessions((p) =>
      p.map((s) =>
        s.id === sessionId
          ? {
              ...s,
              aftercareCompleted: completed.includes(item)
                ? completed.filter((c) => c !== item)
                : [...completed, item],
            }
          : s
      )
    );
  };

  const updateReflection = (text: string) => {
    setSessions((p) => p.map((s) => (s.id === sessionId ? { ...s, reflection: text } : s)));
  };

  const markCompleted = () => {
    setSessions((p) => p.map((s) => (s.id === sessionId ? { ...s, status: "completed" } : s)));
  };

  return (
    <Layout>
      <div className="space-y-4">
        <div>
          <h1 className="font-display text-3xl font-semibold text-plum">Aftercare ♡</h1>
          <p className="text-sm text-muted-foreground">Take what you need.</p>
        </div>

        <Sticker className="space-y-3">
          <div className="font-display text-lg text-plum">Your aftercare list</div>
          {items.length === 0 && (
            <p className="text-sm text-muted-foreground">You didn't note anything specific. Drink water, breathe, be soft with yourself.</p>
          )}
          {items.map((item) => (
            <label key={item} className="flex items-start gap-3 cursor-pointer">
              <Checkbox checked={completed.includes(item)} onCheckedChange={() => toggle(item)} className="mt-0.5" />
              <span className={completed.includes(item) ? "line-through text-muted-foreground" : ""}>{item}</span>
            </label>
          ))}
        </Sticker>

        <Sticker variant="coral" className="space-y-2">
          <Label className="font-display text-base text-plum">Private reflection</Label>
          <p className="text-xs text-muted-foreground">Just for you. How was it? What to remember next time?</p>
          <Textarea value={session.reflection ?? ""} onChange={(e) => updateReflection(e.target.value)} rows={6} />
        </Sticker>

        <Button onClick={markCompleted} className="w-full rounded-full">Mark session completed</Button>
        <Button asChild variant="outline" className="w-full rounded-full">
          <Link to="/sessions/$sessionId" params={{ sessionId }}>← Back</Link>
        </Button>
      </div>
    </Layout>
  );
}
