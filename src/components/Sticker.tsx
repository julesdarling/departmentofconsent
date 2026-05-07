import { cn } from "@/lib/utils";

export function Sticker({
  children,
  className,
  variant = "pink",
}: {
  children: React.ReactNode;
  className?: string;
  variant?: "pink" | "coral";
}) {
  return (
    <div
      className={cn(
        variant === "coral" ? "sticker-coral" : "sticker",
        "p-6",
        className
      )}
    >
      {children}
    </div>
  );
}
