import { cn } from "@/lib/utils";

export type Reaction = "agree" | "tweak" | "different" | "";

export function ReactionRow({
  value,
  onChange,
  agreeLabel = "I'm in",
  tweakLabel = "Tweak",
  differentLabel = "Different",
}: {
  value: Reaction;
  onChange: (v: Reaction) => void;
  agreeLabel?: string;
  tweakLabel?: string;
  differentLabel?: string;
}) {
  const opts: { v: Reaction; cls: string; label: string }[] = [
    { v: "agree", cls: "bg-yes/25 border-yes", label: agreeLabel },
    { v: "tweak", cls: "bg-maybe/25 border-maybe", label: tweakLabel },
    { v: "different", cls: "bg-no/15 border-no", label: differentLabel },
  ];
  return (
    <div className="grid grid-cols-3 gap-2">
      {opts.map((o) => (
        <button
          key={o.v}
          type="button"
          onClick={() => onChange(o.v)}
          className={cn(
            "h-11 rounded-xl text-sm font-semibold border-2 transition",
            value === o.v ? o.cls : "border-border/60 text-muted-foreground hover:text-foreground",
          )}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}
