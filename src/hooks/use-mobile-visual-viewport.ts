"use client";

import { useEffect, useState, type CSSProperties } from "react";

interface MobileViewportStyle extends CSSProperties {
  height: string;
}

export function useMobileVisualViewport(active = true) {
  const [style, setStyle] = useState<MobileViewportStyle | undefined>();

  useEffect(() => {
    if (!active) {
      setStyle(undefined);
      return;
    }

    let frame = 0;
    const update = () => {
      window.cancelAnimationFrame(frame);
      frame = window.requestAnimationFrame(() => {
        if (window.innerWidth >= 768) {
          setStyle(undefined);
          return;
        }

        const viewport = window.visualViewport;
        const height = Math.round(viewport?.height ?? window.innerHeight);
        const nextHeight = `${height}px`;

        // Keep the chat attached to one stable origin. Mobile browsers already
        // pan the visual viewport for the keyboard; mirroring offsetTop here
        // makes the interface chase that movement and visibly judder.
        setStyle((current) => current?.height === nextHeight ? current : { height: nextHeight });
      });
    };

    update();
    window.addEventListener("resize", update);
    window.addEventListener("orientationchange", update);
    window.visualViewport?.addEventListener("resize", update);

    return () => {
      window.cancelAnimationFrame(frame);
      window.removeEventListener("resize", update);
      window.removeEventListener("orientationchange", update);
      window.visualViewport?.removeEventListener("resize", update);
    };
  }, [active]);

  return style;
}
