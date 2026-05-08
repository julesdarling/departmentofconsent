import { createFileRoute, Link } from "@tanstack/react-router";
import { Layout } from "@/components/Layout";
import { Sticker } from "@/components/Sticker";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useKinks, useRatings, useDirections, type Rating, type Direction, type KinkItem } from "@/lib/storage";
import { useMemo, useState } from "react";
import { Plus, X } from "lucide-react";
import { nanoid } from "nanoid";
import { cn } from "@/lib/utils";

import { RequireAuth } from "@/components/RequireAuth";

export const Route = createFileRoute("/kinks")({
  head: () => ({ meta: [{ title: "Your kinks & limits — Department of Consent" }] }),
  component: () => <RequireAuth><KinksPage /></RequireAuth>,
});

const RATINGS: { value: Rating; label: string; cls: string }[] = [
  { value: "yes", label: "Yes", cls: "bg-yes/20 text-foreground border-yes" },
  { value: "maybe", label: "Maybe", cls: "bg-maybe/20 text-foreground border-maybe" },
  { value: "no", label: "No", cls: "bg-no/20 text-foreground border-no" },
];

const DIRECTIONS: { value: Direction; label: string }[] = [
  { value: "give", label: "Give" },
  { value: "receive", label: "Receive" },
  { value: "both", label: "Both" },
];

function KinkRow({
  item,
  rating,
  direction,
  onSetRating,
  onSetDirection,
  onRemove,
}: {
  item: KinkItem;
  rating?: Rating;
  direction?: Direction;
  onSetRating: (r: Rating) => void;
  onSetDirection: (d: Direction | undefined) => void;
  onRemove?: () => void;
}) {
  return (
    <div className="py-2 border-b border-border/50 last:border-0 space-y-2">
      <div className="flex items-start justify-between gap-2">
        <div className="text-sm text-foreground flex-1 min-w-0">{item.name}</div>
        {onRemove && (
          <button onClick={onRemove} className="h-7 w-7 grid place-items-center text-muted-foreground hover:text-destructive shrink-0">
            <X className="h-3.5 w-3.5" />
          </button>
        )}
      </div>
      <div className="flex items-center justify-between gap-2">
        <div className="inline-flex rounded-full border border-border/60 overflow-hidden">
          {RATINGS.map((r) => (
            <button
              key={r.value}
              onClick={() => onSetRating(r.value)}
              className={cn(
                "h-6 px-2 text-[11px] font-semibold transition border-r border-border/60 last:border-r-0",
                rating === r.value ? r.cls : "text-muted-foreground hover:text-foreground"
              )}
            >
              {r.label}
            </button>
          ))}
        </div>
        <div className="inline-flex rounded-full border border-border/60 overflow-hidden">
          {DIRECTIONS.map((d) => (
            <button
              key={d.value}
              onClick={() => onSetDirection(d.value)}
              className={cn(
                "h-6 px-2 text-[11px] font-semibold transition border-r border-border/60 last:border-r-0",
                direction === d.value
                  ? "bg-yes/20 text-foreground"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              {d.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

function KinksPage() {
  const [kinks, setKinks] = useKinks();
  const [ratings, setRatings] = useRatings();
  const [directions, setDirections] = useDirections();
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

  const setDirection = (id: string, d: Direction | undefined) =>
    setDirections((p) => {
      if (d === undefined) {
        const { [id]: _, ...rest } = p;
        return rest;
      }
      return { ...p, [id]: d };
    });

  const addCustom = () => {
    if (!newName.trim()) return;
    setKinks((p) => [...p, { id: "c_" + nanoid(8), name: newName.trim(), category: newCat.trim() || "Custom", custom: true }]);
    setNewName("");
  };

  const removeCustom = (id: string) =>
    setKinks((p) => p.filter((k) => k.id !== id));

  return (
    <Layout>
      <div className="space-y-6">
        <div className="text-center pt-2">
          <h1 className="font-display text-5xl text-foreground tracking-tight">Your kinks & limits</h1>
          <p className="text-sm text-muted-foreground mt-2">
            Tap to rate. This becomes the starting point for every new session.
          </p>
        </div>

        {grouped.map(([cat, items]) => (
          <Sticker key={cat} className="space-y-1">
            <div className="doc-label text-coral mb-2">{cat}</div>
            {items.map((item) => (
              <KinkRow
                key={item.id}
                item={item}
                rating={ratings[item.id]}
                direction={directions[item.id]}
                onSetRating={(r) => setRating(item.id, r)}
                onSetDirection={(d) => setDirection(item.id, d)}
                onRemove={item.custom ? () => removeCustom(item.id) : undefined}
              />
            ))}
          </Sticker>
        ))}

        <Sticker className="space-y-3">
          <div className="doc-label">Add your own</div>
          <Input value={newName} onChange={(e) => setNewName(e.target.value)} placeholder="e.g. wax play, sensory deprivation hood" />
          <Input value={newCat} onChange={(e) => setNewCat(e.target.value)} placeholder="Category" />
          <div className="flex justify-center">
            <Button onClick={addCustom} className="rounded-none">
              <Plus className="h-4 w-4 mr-1" /> Add
            </Button>
          </div>
        </Sticker>

        <div className="flex justify-center pt-2">
          <Link to="/sessions/new" className="cloud-btn cloud-btn-fluid">
            <span>Start a new session</span>
          </Link>
        </div>
      </div>
    </Layout>
  );
}
