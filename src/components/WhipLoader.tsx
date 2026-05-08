import sheet from "@/assets/whip-sprite.png";

export function WhipLoader({ size = 96, label = "Loading…" }: { size?: number; label?: string }) {
  return (
    <div className="flex flex-col items-center gap-3" role="status" aria-label={label}>
      <div
        className="whip-loader"
        style={{ width: size, height: size, backgroundImage: `url(${sheet})` }}
      />
      {label && <span className="text-sm text-foreground/70">{label}</span>}
    </div>
  );
}
