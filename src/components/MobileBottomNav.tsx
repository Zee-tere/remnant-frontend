"use client";

import { useEffect } from "react";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { Home, Mail, Package, Plus, Search, ShoppingBag, UserCircle } from "lucide-react";
import { useAuthStore } from "@/lib/auth";
import { NameAvatar } from "@/components/ui/name-avatar";

interface NavAction {
  label: string;
  href: string;
  icon: typeof Home;
  profile?: boolean;
  primary?: boolean;
}

export default function MobileBottomNav() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { isAuthenticated, user } = useAuthStore();
  const hiddenRoutes = ["/login", "/signup", "/forgot-password", "/reset-password", "/auth/callback"];
  const isMessageView =
    isAuthenticated &&
    pathname === "/user/dashboard" &&
    searchParams.get("section") === "messages";
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
        { label: "Listings", href: "/user/dashboard", icon: Package },
        { label: "Messages", href: "/user/dashboard?section=messages", icon: Mail },
        { label: "List", href: "/sell-item", icon: Plus, primary: true },
        { label: "Pairs", href: "/user/dashboard?section=pair-alerts", icon: Search },
        { label: "Profile", href: "/user/dashboard?section=profile", icon: UserCircle, profile: true },
      ]
    : [
        { label: "Home", href: "/", icon: Home },
        { label: "Market", href: "/marketplace", icon: ShoppingBag },
        { label: "List", href: "/sell-item", icon: Plus, primary: true },
        { label: "Pair", href: "/find-a-pair", icon: Search },
        { label: "Account", href: "/login", icon: UserCircle, profile: true },
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
      className="fixed inset-x-3 bottom-[calc(0.6rem+var(--safe-area-bottom))] z-50 md:hidden"
    >
      <div className="mx-auto grid h-[4.25rem] max-w-lg grid-cols-5 rounded-[1.45rem] border border-white/70 bg-white/90 px-1.5 shadow-[0_22px_55px_-24px_rgba(0,40,31,0.6)] backdrop-blur-2xl">
        {actions.map((item) => {
          const Icon = item.icon;
          const active = isActive(item);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`relative flex min-w-0 flex-col items-center justify-center gap-1 text-[0.7rem] font-semibold tracking-[0.01em] transition-colors ${
                item.primary
                  ? "text-[var(--brand)]"
                  : active
                    ? "text-[var(--brand)]"
                    : "text-[var(--muted-foreground)] hover:text-[var(--brand)]"
              }`}
              aria-label={item.label}
              aria-current={active ? "page" : undefined}
            >
              <span className={`relative flex items-center justify-center transition-all duration-200 ${item.primary ? "-mt-7 h-[3.4rem] w-[3.4rem] rounded-full border-[5px] border-[var(--background)] bg-[var(--brand)] text-white shadow-[0_15px_30px_-16px_rgba(0,108,82,0.9)]" : active ? "h-8 w-10 rounded-[0.85rem] bg-[var(--brand-soft)]" : "h-8 w-10 rounded-[0.85rem]"}`}>
                {item.profile && isAuthenticated ? (
                  <NameAvatar name={user?.name || "Remnant"} className="h-7 w-7 text-xs" />
                ) : (
                  <Icon className="h-[18px] w-[18px]" strokeWidth={2} aria-hidden="true" />
                )}
              </span>
              <span className={`${item.primary ? "-mt-1 text-[var(--brand)]" : ""} leading-none`}>{item.label}</span>
              {active && !item.primary && <span className="absolute bottom-1.5 h-0.5 w-0.5 rounded-full bg-[var(--brand)]" aria-hidden="true" />}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
