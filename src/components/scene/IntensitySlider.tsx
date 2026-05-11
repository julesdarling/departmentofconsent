import { cn } from "@/lib/utils";
import { INTENSITY_LABELS } from "@/lib/sceneVocab";

export function IntensitySlider({
  value,
  onChange,
  ghostValue,
}: {
  value: number;
  onChange: (v: number) => void;
  /** Optional reference value shown faded (e.g. partner's pick) */
  ghostValue?: number;
}) {
  return (
    <div className="space-y-2">
      <div className="flex justify-between text-[11px] uppercase tracking-wider text-muted-foreground font-semibold">
        <span>Cozy</span>
        <span>Edge</span>
      </div>
      <div className="flex gap-1.5">
        {[1, 2, 3, 4, 5].map((n) => {
          const active = value === n;
          const ghost = !active && ghostValue === n;
          return (
            <button
              key={n}
              type="button"
              onClick={() => onChange(n)}
              className={cn(
                "flex-1 h-12 rounded-xl border-2 font-display text-xl transition flex items-center justify-center",
                active
                  ? "bg-coral text-white border-coral"
                  : ghost
                    ? "border-coral/40 text-coral/70 bg-blush/40"
                    : "border-border/50 text-muted-foreground hover:border-primary/40",
              )}
              aria-label={`Intensity ${n}: ${INTENSITY_LABELS[n - 1]}`}
            >
              {n}
            </button>
          );
        })}
      </div>
      <div className="text-center text-sm font-semibold text-plum">
        {INTENSITY_LABELS[value - 1]}
      </div>
    </div>
  );
}
