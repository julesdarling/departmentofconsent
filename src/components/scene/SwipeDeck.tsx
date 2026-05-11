import { useState, useRef, useCallback } from "react";
import { cn } from "@/lib/utils";
import type { Direction } from "@/lib/storage";

export type SwipeChoice = "no" | "yes" | "hellyes";

export interface DeckCard {
  id: string;
  name: string;
  /** Optional pre-existing direction (give/receive/both) when re-swiping */
  direction?: Direction;
}

export function SwipeDeck({
  cards,
  onChoice,
  onComplete,
  showDirections = true,
  noLabel = "Not tonight",
  yesLabel = "Yes please",
  hellYesLabel = "Hell yes",
  hideHellYes = false,
}: {
  cards: DeckCard[];
  onChoice: (cardId: string, choice: SwipeChoice, direction?: Direction) => void;
  onComplete?: () => void;
  showDirections?: boolean;
  noLabel?: string;
  yesLabel?: string;
  hellYesLabel?: string;
  hideHellYes?: boolean;
}) {
  const [index, setIndex] = useState(0);
  const [drag, setDrag] = useState({ x: 0, y: 0 });
  const [direction, setDirection] = useState<Direction | undefined>(cards[0]?.direction);
  const startRef = useRef<{ x: number; y: number } | null>(null);

  const current = cards[index];
  const next = cards[index + 1];

  const advance = useCallback(
    (choice: SwipeChoice) => {
      if (!current) return;
      onChoice(current.id, choice, choice === "no" ? undefined : direction);
      setDrag({ x: 0, y: 0 });
      setIndex((i) => {
        const ni = i + 1;
        if (ni >= cards.length) onComplete?.();
        setDirection(cards[ni]?.direction);
        return ni;
      });
    },
    [current, direction, onChoice, cards, onComplete],
  );

  const onPointerDown = (e: React.PointerEvent) => {
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
    startRef.current = { x: e.clientX, y: e.clientY };
  };
  const onPointerMove = (e: React.PointerEvent) => {
    if (!startRef.current) return;
    setDrag({ x: e.clientX - startRef.current.x, y: e.clientY - startRef.current.y });
  };
  const onPointerUp = () => {
    if (!startRef.current) return;
    const { x, y } = drag;
    startRef.current = null;
    if (!hideHellYes && y < -100 && Math.abs(y) > Math.abs(x)) advance("hellyes");
    else if (x > 110) advance("yes");
    else if (x < -110) advance("no");
    else setDrag({ x: 0, y: 0 });
  };

  if (!current) {
    return (
      <div className="rounded-2xl border-2 border-dashed border-border/40 bg-white p-10 text-center space-y-2">
        <div className="font-display text-2xl text-plum">All sorted ✨</div>
        <p className="text-sm text-muted-foreground">
          You can keep going if you want to add more from your library.
        </p>
      </div>
    );
  }

  const rotate = drag.x / 20;
  const opacityYes = Math.min(1, Math.max(0, drag.x / 100));
  const opacityNo = Math.min(1, Math.max(0, -drag.x / 100));
  const opacityUp = Math.min(1, Math.max(0, -drag.y / 100));

  return (
    <div className="space-y-4 select-none">
      <div className="text-xs text-center text-muted-foreground">
        {index + 1} of {cards.length} · swipe or tap below
      </div>

      <div className="relative h-64">
        {next && (
          <div className="absolute inset-0 rounded-2xl bg-blush/60 border-2 border-coral/30 scale-95 translate-y-2" />
        )}
        <div
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerCancel={onPointerUp}
          style={{
            transform: `translate(${drag.x}px, ${drag.y}px) rotate(${rotate}deg)`,
            transition: drag.x === 0 && drag.y === 0 ? "transform 0.2s ease" : "none",
          }}
          className="absolute inset-0 rounded-2xl bg-white border-2 border-border/60 shadow-lg p-6 flex flex-col items-center justify-center text-center cursor-grab active:cursor-grabbing touch-none"
        >
          <div className="font-display text-3xl text-plum leading-tight">
            {current.name}
          </div>
          {showDirections && (
            <div className="mt-4 flex gap-2">
              {(["give", "receive", "both"] as Direction[]).map((d) => (
                <button
                  key={d}
                  type="button"
                  onPointerDown={(e) => e.stopPropagation()}
                  onClick={() => setDirection(d)}
                  className={cn(
                    "text-xs font-semibold px-3 py-1.5 rounded-full border-2 capitalize transition",
                    direction === d
                      ? "bg-yes/30 border-yes text-plum"
                      : "border-border/60 text-muted-foreground",
                  )}
                >
                  {d}
                </button>
              ))}
            </div>
          )}

          {/* drag overlays */}
          <div
            style={{ opacity: opacityYes }}
            className="absolute top-4 left-4 rounded-lg border-4 border-yes text-yes font-display text-2xl px-3 py-1 -rotate-12 pointer-events-none"
          >
            YES
          </div>
          <div
            style={{ opacity: opacityNo }}
            className="absolute top-4 right-4 rounded-lg border-4 border-no text-no font-display text-2xl px-3 py-1 rotate-12 pointer-events-none"
          >
            NOPE
          </div>
          {!hideHellYes && (
            <div
              style={{ opacity: opacityUp }}
              className="absolute bottom-4 left-1/2 -translate-x-1/2 rounded-lg border-4 border-coral text-coral font-display text-2xl px-3 py-1 pointer-events-none"
            >
              🔥 HELL YES
            </div>
          )}
        </div>
      </div>

      <div className={cn("grid gap-2", hideHellYes ? "grid-cols-2" : "grid-cols-3")}>
        <button
          type="button"
          onClick={() => advance("no")}
          className="h-14 rounded-2xl border-2 border-no bg-no/10 text-plum font-semibold hover:bg-no/20 transition"
        >
          {noLabel}
        </button>
        <button
          type="button"
          onClick={() => advance("yes")}
          className="h-14 rounded-2xl border-2 border-yes bg-yes/15 text-plum font-semibold hover:bg-yes/25 transition"
        >
          {yesLabel}
        </button>
        {!hideHellYes && (
          <button
            type="button"
            onClick={() => advance("hellyes")}
            className="h-14 rounded-2xl border-2 border-coral bg-coral/15 text-plum font-semibold hover:bg-coral/25 transition"
          >
            {hellYesLabel}
          </button>
        )}
      </div>
    </div>
  );
}
