import { cn } from "@/lib/utils";

export type Ynm = "yes" | "maybe" | "no" | "";

export function YnmCard({
  label,
  value,
  onChange,
  theirName,
  theirValue,
  hint,
}: {
  label: string;
  value: Ynm;
  onChange: (v: Ynm) => void;
  theirName?: string;
  theirValue?: string;
  hint?: string;
}) {
  const opts: { v: Ynm; cls: string; label: string }[] = [
    { v: "yes", cls: "bg-yes/25 border-yes", label: "Yes" },
    { v: "maybe", cls: "bg-maybe/25 border-maybe", label: "Maybe" },
    { v: "no", cls: "bg-no/20 border-no", label: "No" },
  ];
  return (
    <div className="rounded-2xl border-2 border-border/40 bg-white p-4 space-y-3">
      <div>
        <div className="font-display text-xl text-plum leading-tight">{label}</div>
        {hint && <p className="text-xs text-muted-foreground mt-1">{hint}</p>}
      </div>
      {theirValue?.trim() && theirName && (
        <div className="space-y-1">
          <div className="text-[10px] uppercase tracking-wider text-plum/60 font-semibold">
            {theirName}
          </div>
          <div className="inline-block bg-blush text-plum text-sm rounded-lg rounded-bl-none px-3 py-1.5 font-medium capitalize">
            {theirValue}
          </div>
        </div>
      )}
      <div className="grid grid-cols-3 gap-2">
        {opts.map((o) => (
          <button
            key={o.v}
            type="button"
            onClick={() => onChange(o.v)}
            className={cn(
              "h-12 rounded-xl text-sm font-semibold border-2 transition",
              value === o.v ? o.cls : "border-border/60 text-muted-foreground hover:text-foreground",
            )}
          >
            {o.label}
          </button>
        ))}
      </div>
    </div>
  );
}
