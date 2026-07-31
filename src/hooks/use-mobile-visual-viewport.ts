"use client";

import { useEffect, useState, type CSSProperties } from "react";

interface MobileViewportStyle extends CSSProperties {
  height: string;
  transform: string;
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
        const offsetTop = Math.round(viewport?.offsetTop ?? 0);
        setStyle({
          height: `${height}px`,
          transform: `translate3d(0, ${offsetTop}px, 0)`,
        });
      });
    };

    update();
    window.addEventListener("resize", update);
    window.addEventListener("orientationchange", update);
    window.visualViewport?.addEventListener("resize", update);
    window.visualViewport?.addEventListener("scroll", update);

    return () => {
      window.cancelAnimationFrame(frame);
      window.removeEventListener("resize", update);
      window.removeEventListener("orientationchange", update);
      window.visualViewport?.removeEventListener("resize", update);
      window.visualViewport?.removeEventListener("scroll", update);
    };
  }, [active]);

  return style;
}
