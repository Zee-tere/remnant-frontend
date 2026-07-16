"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Plus, Search, ShoppingBag, UserCircle } from "lucide-react";
import { useAuthStore } from "@/lib/auth";

export default function MobileBottomNav() {
  const pathname = usePathname();
  const { isAuthenticated, user } = useAuthStore();
  const hiddenRoutes = ["/login", "/signup", "/forgot-password", "/reset-password", "/auth/callback"];
  if (hiddenRoutes.some((route) => pathname.startsWith(route))) return null;

  const accountHref = isAuthenticated ? "/user/dashboard?section=profile" : "/login";
  const actions = [
    { label: "Home", href: "/", icon: Home },
    { label: "Market", href: "/marketplace", icon: ShoppingBag },
    { label: "Search", href: "/find-a-pair", icon: Search },
    { label: isAuthenticated ? "Profile" : "Account", href: accountHref, icon: UserCircle, profile: true },
  ];

  const isActive = (href: string) => {
    if (href === "/") return pathname === "/";
    if (href === "/login") return pathname === "/login" || pathname === "/signup";
    if (href.startsWith("/user/dashboard")) return pathname.startsWith("/user");
    return pathname === href || pathname.startsWith(`${href}/`);
  };

  return (
    <nav
      aria-label="Mobile primary navigation"
      className="fixed inset-x-0 bottom-0 z-50 flex justify-center px-3 pb-[calc(0.8rem+var(--safe-area-bottom))] md:hidden"
    >
      <div className="flex max-w-[23rem] items-center gap-1.5 rounded-full bg-white/95 p-2 shadow-[0_22px_58px_-28px_rgba(0,108,82,0.55)] ring-1 ring-black/[0.06] backdrop-blur-xl">
        {actions.slice(0, 2).map((item) => {
          const Icon = item.icon;
          const active = isActive(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex h-11 w-11 items-center justify-center rounded-full transition-colors ${
                active
                  ? "bg-[var(--brand-soft)] text-[var(--brand)]"
                  : "text-[var(--muted-foreground)] hover:bg-[var(--sand)] hover:text-[var(--brand)]"
              }`}
              aria-label={item.label}
            >
              <Icon className="h-5 w-5" aria-hidden="true" />
            </Link>
          );
        })}

        <Link
          href="/sell-item"
          className="flex h-11 items-center gap-2 rounded-full bg-[var(--brand)] px-4 text-sm font-bold text-white shadow-[0_18px_42px_-20px_rgba(0,108,82,0.72)]"
          aria-label="List an item"
        >
          <Plus className="h-4 w-4" aria-hidden="true" />
          List
        </Link>

        {actions.slice(2).map((item) => {
          const Icon = item.icon;
          const active = isActive(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex h-11 w-11 items-center justify-center rounded-full transition-colors ${
                active
                  ? "bg-[var(--brand-soft)] text-[var(--brand)]"
                  : "text-[var(--muted-foreground)] hover:bg-[var(--sand)] hover:text-[var(--brand)]"
              }`}
              aria-label={item.label}
            >
              {item.profile && isAuthenticated ? (
                <span className="flex h-7 w-7 items-center justify-center overflow-hidden rounded-full bg-[var(--brand-soft)] text-[0.7rem] font-bold text-[var(--brand)]">
                  {user?.avatarUrl ? (
                    <img src={user.avatarUrl} alt="" className="h-full w-full object-cover" />
                  ) : (
                    (user?.name || "R").charAt(0).toUpperCase()
                  )}
                </span>
              ) : (
                <Icon className="h-5 w-5" aria-hidden="true" />
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
