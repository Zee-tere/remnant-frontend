"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { beginActivity, endActivity, subscribeToActivity } from "@/lib/activity";

export function GlobalActivity() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [activeCount, setActiveCount] = useState(0);
  const [visible, setVisible] = useState(false);
  const navigationActivity = useRef<number | undefined>(undefined);
  const routeKey = `${pathname}?${searchParams.toString()}`;

  useEffect(() => subscribeToActivity(setActiveCount), []);

  useEffect(() => {
    if (activeCount === 0) {
      setVisible(false);
      return;
    }
    const timer = window.setTimeout(() => setVisible(true), 120);
    return () => window.clearTimeout(timer);
  }, [activeCount]);

  useEffect(() => {
    endActivity(navigationActivity.current);
    navigationActivity.current = undefined;
  }, [routeKey]);

  useEffect(() => {
    const handleNavigationClick = (event: MouseEvent) => {
      if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      const target = event.target as HTMLElement | null;
      const anchor = target?.closest<HTMLAnchorElement>("a[href]");
      if (!anchor || anchor.target === "_blank" || anchor.hasAttribute("download")) return;

      const destination = new URL(anchor.href, window.location.href);
      if (destination.origin !== window.location.origin || destination.href === window.location.href) return;

      endActivity(navigationActivity.current);
      navigationActivity.current = beginActivity();
      window.setTimeout(() => {
        endActivity(navigationActivity.current);
        navigationActivity.current = undefined;
      }, 8_000);
    };

    document.addEventListener("click", handleNavigationClick, true);
    return () => document.removeEventListener("click", handleNavigationClick, true);
  }, []);

  return (
    <div className={`site-activity ${visible ? "site-activity--visible" : ""}`} role="status" aria-live="polite" aria-label={visible ? "Loading" : undefined}>
      <span className="site-activity__track" aria-hidden="true">
        <span />
        <span />
        <span />
      </span>
    </div>
  );
}
