import { createFileRoute, Link } from "@tanstack/react-router";
import { Layout } from "@/components/Layout";
import { Sticker } from "@/components/Sticker";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useKinks, useRatings, type Rating, type KinkItem } from "@/lib/storage";
import { useMemo, useState } from "react";
import { Plus, X } from "lucide-react";
import { nanoid } from "nanoid";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/kinks")({
  head: () => ({ meta: [{ title: "Your kinks & limits — Department of Consent" }] }),
  component: KinksPage,
});

const RATINGS: { value: Rating; label: string; cls: string }[] = [
  { value: "yes", label: "Yes", cls: "bg-yes/20 text-foreground border-yes" },
  { value: "maybe", label: "Maybe", cls: "bg-maybe/20 text-foreground border-maybe" },
  { value: "no", label: "No", cls: "bg-no/20 text-foreground border-no" },
  { value: "unsure", label: "?", cls: "bg-muted text-muted-foreground border-border" },
];

function KinkRow({
  item,
  rating,
  onSet,
  onRemove,
}: {
  item: KinkItem;
  rating?: Rating;
  onSet: (r: Rating) => void;
  onRemove?: () => void;
}) {
  return (
    <div className="flex items-center justify-between gap-2 py-2 border-b border-border/50 last:border-0">
      <div className="text-sm text-foreground flex-1 min-w-0 truncate">{item.name}</div>
      <div className="flex gap-1">
        {RATINGS.map((r) => (
          <button
            key={r.value}
            onClick={() => onSet(r.value)}
            className={cn(
              "h-7 min-w-7 px-2 rounded-full text-xs font-semibold border-2 transition",
              rating === r.value ? r.cls : "border-border/60 text-muted-foreground hover:border-primary/50"
            )}
          >
            {r.label}
          </button>
        ))}
        {onRemove && (
          <button onClick={onRemove} className="h-7 w-7 grid place-items-center text-muted-foreground hover:text-destructive">
            <X className="h-3.5 w-3.5" />
          </button>
        )}
      </div>
    </div>
  );
}

function KinksPage() {
  const [kinks, setKinks] = useKinks();
  const [ratings, setRatings] = useRatings();
  const [newName, setNewName] = useState("");
  const [newCat, setNewCat] = useState("Custom");

  const grouped = useMemo(() => {
    const m = new Map<string, KinkItem[]>();
    for (const k of kinks) {
      if (!m.has(k.category)) m.set(k.category, []);
      m.get(k.category)!.push(k);
    }
    return Array.from(m.entries());
  }, [kinks]);

  const setRating = (id: string, r: Rating) =>
    setRatings((p) => ({ ...p, [id]: r }));

  const addCustom = () => {
    if (!newName.trim()) return;
    setKinks((p) => [...p, { id: "c_" + nanoid(8), name: newName.trim(), category: newCat.trim() || "Custom", custom: true }]);
    setNewName("");
  };

  const removeCustom = (id: string) =>
    setKinks((p) => p.filter((k) => k.id !== id));

  return (
    <Layout>
      <div className="space-y-5">
        <div>
          <h1 className="font-display text-3xl font-semibold text-plum">Your kinks & limits</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Tap to rate. This becomes the starting point for every new session.
          </p>
        </div>

        {grouped.map(([cat, items]) => (
          <Sticker key={cat} className="space-y-1">
            <div className="font-display text-lg font-semibold text-coral mb-1">{cat}</div>
            {items.map((item) => (
              <KinkRow
                key={item.id}
                item={item}
                rating={ratings[item.id]}
                onSet={(r) => setRating(item.id, r)}
                onRemove={item.custom ? () => removeCustom(item.id) : undefined}
              />
            ))}
          </Sticker>
        ))}

        <Sticker variant="coral" className="space-y-3">
          <div className="font-display text-lg font-semibold text-plum">Add your own ✿</div>
          <Input value={newName} onChange={(e) => setNewName(e.target.value)} placeholder="e.g. wax play, sensory deprivation hood" />
          <Input value={newCat} onChange={(e) => setNewCat(e.target.value)} placeholder="Category" />
          <Button onClick={addCustom} className="w-full rounded-full">
            <Plus className="h-4 w-4 mr-1" /> Add
          </Button>
        </Sticker>

        <Button asChild size="lg" className="w-full rounded-full font-semibold">
          <Link to="/sessions/new">Start a new session →</Link>
        </Button>
      </div>
    </Layout>
  );
}
