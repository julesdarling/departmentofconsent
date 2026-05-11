import { useState } from "react";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";

export function ChipRow({
  options,
  selected,
  onChange,
  multi = true,
  allowCustom = true,
  ghosted,
  highlightOptions,
  addPlaceholder = "Add your own…",
  className,
}: {
  options: string[];
  selected: string[];
  onChange: (next: string[]) => void;
  multi?: boolean;
  allowCustom?: boolean;
  /** Render these chips muted as visual reference (e.g. partner's picks) */
  ghosted?: string[];
  /** Highlight these chips with a subtle ring (e.g. creator's picks) */
  highlightOptions?: string[];
  addPlaceholder?: string;
  className?: string;
}) {
  const [draft, setDraft] = useState("");

  const seen = new Set<string>();
  const all: string[] = [];
  for (const item of [...options, ...selected, ...(ghosted ?? [])]) {
    if (!seen.has(item)) {
      seen.add(item);
      all.push(item);
    }
  }

  const toggle = (item: string) => {
    if (!multi) {
      onChange(selected[0] === item ? [] : [item]);
      return;
    }
    if (selected.includes(item)) onChange(selected.filter((s) => s !== item));
    else onChange([...selected, item]);
  };

  const addCustom = () => {
    const v = draft.trim();
    if (!v) return;
    if (!selected.includes(v)) onChange([...selected, v]);
    setDraft("");
  };

  return (
    <div className={cn("space-y-2", className)}>
      <div className="flex flex-wrap gap-2">
        {all.map((item) => {
          const isSelected = selected.includes(item);
          const isGhost = !isSelected && ghosted?.includes(item);
          const isHighlight = !isSelected && highlightOptions?.includes(item);
          return (
            <button
              key={item}
              type="button"
              onClick={() => toggle(item)}
              className={cn(
                "text-sm px-3.5 py-2 rounded-full border-2 transition font-medium",
                isSelected
                  ? "bg-yes/30 border-yes text-plum"
                  : isHighlight
                    ? "border-coral/60 text-plum bg-blush/40"
                    : isGhost
                      ? "border-border/40 text-muted-foreground/70 italic"
                      : "border-border/60 text-muted-foreground hover:border-primary/50",
              )}
            >
              {isSelected ? "✓ " : ""}
              {item}
            </button>
          );
        })}
      </div>
      {allowCustom && (
        <div className="flex gap-2">
          <Input
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                addCustom();
              }
            }}
            placeholder={addPlaceholder}
          />
          <button
            type="button"
            onClick={addCustom}
            disabled={!draft.trim()}
            className="rounded-full bg-secondary text-secondary-foreground hover:bg-secondary/80 disabled:opacity-50 px-4 py-2 text-sm font-medium shrink-0"
          >
            Add
          </button>
        </div>
      )}
    </div>
  );
}
