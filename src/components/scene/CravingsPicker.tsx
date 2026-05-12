import { cn } from "@/lib/utils";
import type { Direction } from "@/lib/storage";

export interface CravingItem {
  id: string;
  name: string;
}

export function CravingsPicker({
  items,
  selectedIds,
  directions,
  onToggle,
  onSetDirection,
  className,
}: {
  items: CravingItem[];
  selectedIds: string[];
  directions: Record<string, Direction | undefined>;
  onToggle: (id: string) => void;
  onSetDirection: (id: string, dir: Direction) => void;
  hellYesIds?: string[];
  onToggleHellYes?: (id: string) => void;
  className?: string;
}) {
  return (
    <div className={cn("flex flex-wrap gap-2", className)}>
      {items.map((k) => {
        const selected = selectedIds.includes(k.id);
        const dir = (directions[k.id] ?? "both") as Direction;
        return (
          <div
            key={k.id}
            className={cn(
              "inline-flex items-center rounded-full border-2 transition",
              selected
                ? "bg-yes/20 border-yes/70 pl-3 pr-1.5 py-1 gap-2"
                : "border-border/60 text-muted-foreground hover:border-primary/50 px-3 py-1.5",
            )}
          >
            <button
              type="button"
              onClick={() => onToggle(k.id)}
              className={cn(
                "font-medium text-xs sm:text-sm",
                selected ? "text-plum" : "text-muted-foreground",
              )}
            >
              {selected ? "✓ " : "+ "}
              {k.name}
            </button>
            {selected && (
              <div className="flex items-center gap-0.5 text-[10px] sm:text-[11px]">
                {(["give", "receive", "both"] as Direction[]).map((d) => (
                  <button
                    key={d}
                    type="button"
                    onClick={() => onSetDirection(k.id, d)}
                    className={cn(
                      "px-2 py-0.5 rounded-full font-semibold capitalize transition",
                      dir === d
                        ? "bg-yes text-plum"
                        : "text-plum/60 hover:text-plum",
                    )}
                  >
                    {d}
                  </button>
                ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

