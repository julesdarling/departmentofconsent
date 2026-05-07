import { Sticker } from "@/components/Sticker";
import { Check } from "lucide-react";

export function PricingCard() {
  return (
    <Sticker variant="coral" className="space-y-3">
      <div className="text-center">
        <div className="text-xs uppercase tracking-wider text-coral font-bold">Membership</div>
        <div className="font-display text-4xl text-plum mt-1">$9<span className="text-base text-muted-foreground">/month</span></div>
        <p className="text-xs text-muted-foreground mt-1">Cancel anytime.</p>
      </div>
      <ul className="space-y-1.5 text-sm">
        {[
          "Unlimited saved scenes",
          "Play partner share links + QR",
          "In-scene safeword card",
          "Aftercare checklist + reflections",
          "Encrypted cloud sync across devices",
        ].map((f) => (
          <li key={f} className="flex items-start gap-2">
            <Check className="h-4 w-4 text-yes mt-0.5 shrink-0" />
            <span>{f}</span>
          </li>
        ))}
      </ul>
      <p className="text-[11px] text-center text-muted-foreground pt-1">
        Trans owned. Funds keep this app online & ad-free.
      </p>
    </Sticker>
  );
}
