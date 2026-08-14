"use client";

import { useEffect } from "react";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { Box, CirclePlus, House, MessageCircle, ScanSearch, Store, UserRound, type LucideIcon } from "lucide-react";
import { useAuthStore } from "@/lib/auth";

interface NavAction {
  label: string;
  href: string;
  icon: LucideIcon;
  primary?: boolean;
}

export default function MobileBottomNav() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { isAuthenticated } = useAuthStore();
  const hiddenRoutes = ["/login", "/signup", "/forgot-password", "/reset-password", "/auth/callback"];
  const isMessageView =
    (isAuthenticated &&
      pathname === "/user/dashboard" &&
      searchParams.get("section") === "messages");
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
        { label: "Profile", href: "/user/dashboard?section=profile", icon: UserRound },
      ]
    : [
        { label: "Home", href: "/", icon: House },
        { label: "Market", href: "/marketplace", icon: Store },
        { label: "List", href: "/sell-item", icon: CirclePlus, primary: true },
        { label: "Find", href: "/find-a-pair", icon: ScanSearch },
        { label: "Account", href: "/login", icon: UserRound },
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
    <>
      <div className="mobile-bottom-dock-spacer md:hidden" aria-hidden="true" />
      <nav
        aria-label="Mobile primary navigation"
        data-mobile-bottom-dock
        className="mobile-bottom-dock md:hidden"
      >
        <div className="mobile-bottom-dock__bar mx-auto grid h-[4.6rem] max-w-lg grid-cols-5 border-t border-black/10 bg-white px-1.5">
          {actions.map((item) => {
            const Icon = item.icon;
            const active = isActive(item);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`relative flex min-w-0 touch-manipulation flex-col items-center justify-center gap-1 text-xs font-bold tracking-[0.01em] transition-colors duration-150 ${
                  item.primary
                    ? "text-black"
                    : active
                      ? "text-black"
                      : "text-black/45 hover:text-black"
                }`}
                aria-label={item.label}
                aria-current={active ? "page" : undefined}
              >
                <span
                  data-preserve-icon-frame
                  className={`relative flex items-center justify-center transition-colors duration-150 ${item.primary ? "-mt-3 h-10 w-10 rounded-full bg-black text-white" : `h-7 w-8 ${active ? "text-black" : "opacity-80"}`}`}
                >
                  <Icon className={item.primary ? "h-[18px] w-[18px]" : "h-[17px] w-[17px]"} aria-hidden="true" />
                </span>
                <span className={`${item.primary ? "-mt-1 text-black" : ""} leading-none`}>{item.label}</span>
                {active && !item.primary && (
                  <span className="absolute bottom-1 flex items-center gap-0.5" aria-hidden="true">
                    <span className="h-0.5 w-3 bg-black" />
                    <span className="h-0.5 w-1 bg-black" />
                  </span>
                )}
              </Link>
            );
          })}
        </div>
      </nav>
    </>
  );
}
