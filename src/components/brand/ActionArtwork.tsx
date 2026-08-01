import { cn } from "@/lib/utils";

export type ActionArtworkName =
  | "marketplace"
  | "find"
  | "sell"
  | "trade"
  | "donate"
  | "repair"
  | "recycle"
  | "alert";

const surfaces: Record<ActionArtworkName, string> = {
  marketplace: "bg-[var(--lavender-soft)]",
  find: "bg-[var(--sky-soft)]",
  sell: "bg-[var(--mint-soft)]",
  trade: "bg-[var(--aqua-soft)]",
  donate: "bg-[var(--amber-soft)]",
  repair: "bg-[var(--lavender-soft)]",
  recycle: "bg-[var(--mint-soft)]",
  alert: "bg-[var(--amber-soft)]",
};

export function ActionArtwork({
  name,
  className,
  imageClassName,
  priority = false,
  surface = true,
}: {
  name: ActionArtworkName;
  className?: string;
  imageClassName?: string;
  priority?: boolean;
  surface?: boolean;
}) {
  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center justify-center overflow-hidden rounded-[1.4rem]",
        surface && surfaces[name],
        className,
      )}
      aria-hidden="true"
    >
      <img
        src={`/images/actions/${name}.webp`}
        alt=""
        width={512}
        height={512}
        loading={priority ? "eager" : "lazy"}
        fetchPriority={priority ? "high" : "auto"}
        decoding="async"
        draggable={false}
        className={cn("h-full w-full object-contain", imageClassName)}
      />
    </span>
  );
}
