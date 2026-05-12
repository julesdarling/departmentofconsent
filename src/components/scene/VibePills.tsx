import { decodeVibe, INTENSITY_LABELS } from "@/lib/sceneVocab";

const intensityStyles: Record<number, string> = {
  1: "bg-yes/25 border-yes text-plum",
  2: "bg-maybe/30 border-maybe text-plum",
  3: "bg-blush border-coral/50 text-plum",
  4: "bg-coral/25 border-coral text-plum",
  5: "bg-no/25 border-no text-plum",
};

export function VibePills({
  raw,
  size = "md",
  showNote = true,
}: {
  raw: string | undefined | null;
  size?: "sm" | "md";
  showNote?: boolean;
}) {
  if (!raw?.trim()) return null;
  const v = decodeVibe(raw);
  const moodCls =
    size === "sm"
      ? "text-[10px] px-1.5 py-0.5"
      : "text-xs px-2.5 py-1";
  const intensityCls =
    size === "sm"
      ? "text-[10px] px-1.5 py-0.5 border"
      : "text-xs px-2.5 py-1 border-2";
  return (
    <div className="space-y-1">
      <div className="flex flex-wrap gap-1.5">
        {v.moods.map((m) => (
          <span
            key={m}
            className={`${moodCls} rounded-full border border-plum/20 bg-white font-semibold text-plum`}
          >
            {m}
          </span>
        ))}
        <span
          className={`${intensityCls} rounded-full font-semibold ${intensityStyles[v.intensity] ?? intensityStyles[3]}`}
        >
          Intensity {v.intensity}/5 · {INTENSITY_LABELS[v.intensity - 1] ?? ""}
        </span>
      </div>
      {showNote && v.note.trim() && (
        <p className="text-sm italic text-plum/80 whitespace-pre-wrap">"{v.note.trim()}"</p>
      )}
    </div>
  );
}
