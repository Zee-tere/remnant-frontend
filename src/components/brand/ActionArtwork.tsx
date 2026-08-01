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

export function ActionArtwork({
  name,
  className,
  imageClassName,
  priority = false,
}: {
  name: ActionArtworkName;
  className?: string;
  imageClassName?: string;
  priority?: boolean;
}) {
  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center justify-center",
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
