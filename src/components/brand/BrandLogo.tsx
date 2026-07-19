import type { HTMLAttributes } from "react";

type BrandLogoSize = "nav" | "default" | "auth" | "footer";

interface BrandLogoProps extends HTMLAttributes<HTMLSpanElement> {
  size?: BrandLogoSize;
  animated?: boolean;
}

const LETTERS = Array.from("Remnant");
const MARK_PATH =
  "M19 4.5 55 26 45.5 43.2c-1.2 2.2-4.4 2-5.3-.4-2.3-6.1-10.6-7.5-14.8-2.5-4.7 5.5-.2 13.9 7 13.1 2.7-.3 4.5 2.7 2.9 4.9L33.9 60 4.5 43.8 19 4.5Z";

export function BrandLogo({
  size = "default",
  animated = true,
  className = "",
  ...props
}: BrandLogoProps) {
  return (
    <span
      className={`brand-lockup brand-lockup--${size} ${animated ? "brand-lockup--animated" : ""} ${className}`}
      aria-label="Remnant"
      {...props}
    >
      <svg
        viewBox="0 0 60 60"
        fill="none"
        className="brand-lockup__mark"
        aria-hidden="true"
        focusable="false"
      >
        <path className="brand-lockup__sketch" d={MARK_PATH} />
        <path className="brand-lockup__line" d={MARK_PATH} />
      </svg>
      <span className="brand-lockup__word" aria-hidden="true">
        {LETTERS.map((letter, index) => (
          <span key={`${letter}-${index}`}>{letter}</span>
        ))}
      </span>
    </span>
  );
}
