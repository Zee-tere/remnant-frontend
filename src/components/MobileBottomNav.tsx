"use client";

import { useEffect } from "react";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { Box, CirclePlus, House, MessageCircle, ScanSearch, Store, UserRound, type LucideIcon } from "lucide-react";
import { useAuthStore } from "@/lib/auth";
import { NameAvatar } from "@/components/ui/name-avatar";

interface NavAction {
  label: string;
  href: string;
  icon: LucideIcon;
  profile?: boolean;
  primary?: boolean;
}

export default function MobileBottomNav() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { isAuthenticated, user } = useAuthStore();
  const hiddenRoutes = ["/login", "/signup", "/forgot-password", "/reset-password", "/auth/callback"];
  const isMessageView =
    (isAuthenticated &&
      pathname === "/user/dashboard" &&
      searchParams.get("section") === "messages") ||
    pathname.startsWith("/guest/messages/");
  const isHiddenRoute = hiddenRoutes.some((route) => pathname.startsWith(route));
  const suppressMobileDock = isHiddenRoute || isMessageView || pathname.startsWith("/admin");

  useEffect(() => {
    document.body.classList.toggle("mobile-chat-active", isMessageView);
    document.body.classList.toggle("mobile-dock-hidden", suppressMobileDock);
    return () => {
      document.body.classList.remove("mobile-chat-active");
      document.body.classList.remove("mobile-dock-hidden");
    };
  }, [isMessageView, suppressMobileDock]);

  if (suppressMobileDock) return null;

  const actions: NavAction[] = isAuthenticated
    ? [
        { label: "Listings", href: "/user/dashboard", icon: Box },
        { label: "Messages", href: "/user/dashboard?section=messages", icon: MessageCircle },
        { label: "List", href: "/sell-item", icon: CirclePlus, primary: true },
        { label: "Pairs", href: "/user/dashboard?section=pair-alerts", icon: ScanSearch },
        { label: "Profile", href: "/user/dashboard?section=profile", icon: UserRound, profile: true },
      ]
    : [
        { label: "Home", href: "/", icon: House },
        { label: "Market", href: "/marketplace", icon: Store },
        { label: "List", href: "/sell-item", icon: CirclePlus, primary: true },
        { label: "Pair", href: "/find-a-pair", icon: ScanSearch },
        { label: "Account", href: "/login", icon: UserRound, profile: true },
      ];

  const isActive = (item: NavAction) => {
    const dashboardSection = searchParams.get("section") || "listings";
    if (item.href === "/") return pathname === "/";
    if (item.href === "/login") return pathname === "/login" || pathname === "/signup";
    if (item.href === "/user/dashboard") return pathname === "/user/dashboard" && dashboardSection === "listings";
    if (item.href.startsWith("/user/dashboard?section=")) {
      return pathname === "/user/dashboard" && dashboardSection === item.href.split("=")[1];
    }
    return pathname === item.href || pathname.startsWith(`${item.href}/`);
  };

  return (
    <nav
      aria-label="Mobile primary navigation"
      data-mobile-bottom-dock
      className="mobile-bottom-dock md:hidden"
    >
      <div className="mobile-bottom-dock__bar soft-shadow mx-auto grid h-[4.35rem] max-w-lg grid-cols-5 rounded-[1.15rem] border border-[var(--border)]/75 bg-white px-1.5">
        {actions.map((item) => {
          const Icon = item.icon;
          const active = isActive(item);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`relative flex min-w-0 touch-manipulation flex-col items-center justify-center gap-1 text-xs font-bold tracking-[0.01em] transition-[color,transform] duration-150 active:scale-[0.97] ${
                item.primary
                  ? "text-[var(--brand)]"
                  : active
                    ? "text-[var(--brand)]"
                    : "text-[var(--muted-foreground)] hover:text-[var(--brand)]"
              }`}
              aria-label={item.label}
              aria-current={active ? "page" : undefined}
            >
              <span
                data-preserve-icon-frame
                className={`relative flex items-center justify-center transition-colors duration-150 ${item.primary ? "-mt-3 h-11 w-11 rounded-xl bg-[var(--brand)] text-white" : active ? "h-8 w-10 rounded-lg bg-[var(--brand-soft)] text-[var(--brand)]" : "h-8 w-10"}`}
              >
                {item.profile && isAuthenticated ? (
                  <NameAvatar name={user?.name || "Remnant"} className="h-7 w-7 text-xs" />
                ) : (
                  <Icon className={item.primary ? "h-5 w-5" : "h-[18px] w-[18px]"} aria-hidden="true" />
                )}
              </span>
              <span className={`${item.primary ? "-mt-1 text-[var(--brand)]" : ""} leading-none`}>{item.label}</span>
              {active && !item.primary && (
                <span className="absolute bottom-1 flex items-center gap-0.5" aria-hidden="true">
                  <span className="h-0.5 w-3 bg-[var(--brand)]" />
                  <span className="h-0.5 w-1 bg-[var(--brand)]" />
                </span>
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
