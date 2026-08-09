import {
  HandHeart,
  Recycle,
  RefreshCw,
  Wrench,
  type LucideIcon,
} from "lucide-react";
import { NairaIcon } from "@/components/ui/naira-icon";
import { cn } from "@/lib/utils";

export type ListingIntent = "SELL" | "TRADE" | "DONATE" | "FIX" | "RECYCLE";

export const listingIntentMeta: Record<
  ListingIntent,
  { label: string; valueLabel: string; icon: LucideIcon | typeof NairaIcon; className: string }
> = {
  SELL: {
    label: "For sale",
    valueLabel: "Price on request",
    icon: NairaIcon,
    className: "bg-intent-sell-container text-intent-sell",
  },
  TRADE: {
    label: "Trade",
    valueLabel: "Open to trade",
    icon: RefreshCw,
    className: "bg-intent-trade-container text-intent-trade",
  },
  DONATE: {
    label: "Free",
    valueLabel: "Free",
    icon: HandHeart,
    className: "bg-intent-donate-container text-intent-donate",
  },
  FIX: {
    label: "Repair",
    valueLabel: "Needs repair",
    icon: Wrench,
    className: "bg-intent-repair-container text-intent-repair",
  },
  RECYCLE: {
    label: "Recycle",
    valueLabel: "Ready to recycle",
    icon: Recycle,
    className: "bg-intent-recycle-container text-intent-recycle",
  },
};

export function normalizeListingIntent(value: string): ListingIntent {
  return value in listingIntentMeta ? (value as ListingIntent) : "SELL";
}

export function IntentBadge({
  intent,
  compact = false,
  className,
}: {
  intent: string;
  compact?: boolean;
  className?: string;
}) {
  const meta = listingIntentMeta[normalizeListingIntent(intent)];
  const Icon = meta.icon;

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border font-bold leading-none",
        compact
          ? "gap-0.5 border-white/70 bg-white/95 px-1.5 py-1 text-xs text-black sm:gap-1 sm:px-2"
          : "gap-1.5 border-black/10 bg-[#f3f3f3] px-2.5 py-1.5 text-xs text-black",
        className,
      )}
    >
      <Icon size={compact ? 10 : 14} className={compact ? "sm:h-3 sm:w-3" : undefined} aria-hidden="true" />
      {meta.label}
    </span>
  );
}
