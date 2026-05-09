import { useState } from "react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

export function Checklist({
  defaultItems,
  selected,
  onChange,
  extraItems = [],
  addPlaceholder = "Add another item…",
}: {
  defaultItems: string[];
  selected: string[];
  onChange: (next: string[]) => void;
  /** Additional items to show as options (e.g. custom items the creator added). */
  extraItems?: string[];
  addPlaceholder?: string;
}) {
  const [draft, setDraft] = useState("");

  const seen = new Set<string>();
  const options: string[] = [];
  for (const item of [...defaultItems, ...extraItems, ...selected]) {
    if (!seen.has(item)) {
      seen.add(item);
      options.push(item);
    }
  }

  const toggle = (item: string) => {
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
    <div className="space-y-2">
      <div className="space-y-1.5">
        {options.map((item) => {
          const checked = selected.includes(item);
          return (
            <button
              key={item}
              type="button"
              onClick={() => toggle(item)}
              className={cn(
                "w-full text-left flex items-start gap-2 rounded-xl border-2 px-3 py-2 transition",
                checked
                  ? "bg-yes/15 border-yes"
                  : "border-border/50 hover:border-border"
              )}
            >
              <span
                className={cn(
                  "mt-0.5 h-4 w-4 shrink-0 rounded border-2 flex items-center justify-center text-[10px] font-bold",
                  checked ? "bg-yes border-yes text-white" : "border-border/60"
                )}
              >
                {checked ? "✓" : ""}
              </span>
              <span className="text-sm whitespace-pre-wrap">{item}</span>
            </button>
          );
        })}
      </div>
      <div className="flex gap-2 pt-1">
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
          className="rounded-full bg-secondary text-secondary-foreground hover:bg-secondary/80 px-4 py-2 text-sm font-medium shrink-0"
        >
          Add
        </button>
      </div>
    </div>
  );
}
