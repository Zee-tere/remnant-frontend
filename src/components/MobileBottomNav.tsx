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
      className="fixed inset-x-0 bottom-0 z-50 border-t border-[var(--border)]/70 bg-white/95 pb-[var(--safe-area-bottom)] backdrop-blur-xl md:hidden"
    >
      <div className="mx-auto grid h-16 max-w-lg grid-cols-5 px-1">
        {actions.map((item) => {
          const Icon = item.icon;
          const active = isActive(item);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`relative flex min-w-0 flex-col items-center justify-center gap-0.5 text-[0.69rem] font-bold transition-colors ${
                item.primary
                  ? "text-[var(--brand)]"
                  : active
                    ? "text-[var(--brand)]"
                    : "text-[var(--muted-foreground)] hover:text-[var(--brand)]"
              }`}
              aria-label={item.label}
              aria-current={active ? "page" : undefined}
            >
              <span className={`flex h-8 w-9 items-center justify-center rounded-lg transition-colors ${item.primary ? "bg-[var(--brand)] text-white" : active ? "bg-[var(--brand-soft)]" : ""}`}>
                {item.profile && isAuthenticated ? (
                  <NameAvatar name={user?.name || "Remnant"} className="h-7 w-7 text-xs" />
                ) : (
                  <Icon className="h-[18px] w-[18px]" strokeWidth={2} aria-hidden="true" />
                )}
              </span>
              <span className="leading-none">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
