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
        "inline-flex items-center rounded-pill font-bold leading-none",
        meta.className,
        compact ? "gap-1 px-2 py-1 text-xs" : "gap-1.5 px-2.5 py-1.5 text-xs",
        className,
      )}
    >
      <Icon size={compact ? 12 : 14} aria-hidden="true" />
      {meta.label}
    </span>
  );
}
