"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Bell,
  Box,
  ChevronDown,
  HandHeart,
  LogIn,
  LogOut,
  MessageCircle,
  PackagePlus,
  RefreshCw,
  ScanSearch,
  Search,
  Settings,
  ShieldCheck,
  Store,
  Tag,
  UserRound,
  type LucideIcon,
} from "lucide-react";
import { useAuthStore } from "@/lib/auth";
import { NameAvatar } from "@/components/ui/name-avatar";
import { BrandLogo } from "@/components/brand/BrandLogo";

interface NavigationAction {
  label: string;
  href: string;
  icon: LucideIcon;
}

const productActions: NavigationAction[] = [
  { label: "Find an item", href: "/find-a-pair", icon: Search },
  { label: "Marketplace", href: "/marketplace", icon: Store },
  { label: "Sell", href: "/sell", icon: Tag },
  { label: "Trade", href: "/trade", icon: RefreshCw },
  { label: "Donate", href: "/donate", icon: HandHeart },
];

const accountActions = [
  { label: "Listings", href: "/user/dashboard", icon: Box },
  { label: "Pair alerts", href: "/user/dashboard?section=pair-alerts", icon: ScanSearch },
  { label: "Messages", href: "/user/dashboard?section=messages", icon: MessageCircle },
  { label: "Match alerts", href: "/user/dashboard?section=alerts", icon: Bell },
  { label: "Upload", href: "/user/dashboard?section=upload", icon: PackagePlus },
  { label: "Profile", href: "/user/dashboard?section=profile", icon: UserRound },
  { label: "Settings", href: "/user/dashboard?section=settings", icon: Settings },
];

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [mobileSearch, setMobileSearch] = useState("");
  const pathname = usePathname();
  const router = useRouter();

  const { user, isAuthenticated, logout } = useAuthStore();
  const displayName = user?.name || "Account";
  const mobileAccountActions = user?.role === "ADMIN"
    ? [{ label: "Admin", href: "/admin", icon: ShieldCheck }, ...accountActions]
    : accountActions;
  const isAuthRoute = ["/login", "/signup", "/forgot-password", "/reset-password", "/auth/callback"].some(
    (route) => pathname.startsWith(route),
  );

  useEffect(() => {
    setMenuOpen(false);
    setProfileOpen(false);
  }, [pathname]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest(".navbar-menu") && !target.closest(".mobile-menu-button")) {
        setMenuOpen(false);
      }
      if (!target.closest(".profile-menu") && !target.closest(".profile-button")) {
        setProfileOpen(false);
      }
    };
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);

  const handleLogout = () => {
    logout();
    setProfileOpen(false);
    router.push("/");
  };

  const handleMobileSearch = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const search = mobileSearch.trim();
    router.push(`/find-a-pair${search ? `?search=${encodeURIComponent(search)}` : ""}`);
  };

  const isActive = (href: string) => {
    if (href.includes("#")) return pathname === "/";
    if (href === "/") return pathname === "/";
    return pathname === href || pathname.startsWith(`${href}/`);
  };

  return (
    <header className={`sticky top-0 z-[var(--layer-sticky)] w-full border-b border-[var(--line-soft)] bg-white px-3 py-1.5 md:px-6 md:py-2 ${isAuthRoute ? "hidden md:block" : ""}`}>
      <div className="relative mx-auto flex min-h-12 max-w-7xl items-center gap-2 bg-white px-0 text-[var(--foreground)] md:min-h-14 md:justify-between md:gap-0 md:px-2">
        <Link href="/" className="flex shrink-0 items-center text-[var(--brand)]" aria-label="Remnant home">
          <BrandLogo size="nav" />
        </Link>

        <nav className="hidden min-w-0 flex-1 items-center justify-center gap-1 px-4 md:flex" aria-label="Primary navigation">
          {productActions.map((item) => {
            const active = isActive(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`relative z-10 min-h-11 px-3 py-3 text-[0.8rem] font-bold transition-colors duration-150 ${
                  active ? "text-[var(--brand)]" : "text-[var(--ink-soft)] hover:text-[var(--brand)]"
                }`}
                aria-current={active ? "page" : undefined}
              >
                {item.label}
                {active && (
                  <span className="absolute inset-x-3 bottom-1 flex h-1 items-center gap-1" aria-hidden="true">
                    <span className="h-0.5 flex-1 bg-[var(--brand)]" />
                    <span className="h-0.5 w-1.5 bg-[var(--brand)]" />
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        <div className="relative z-20 flex min-w-0 flex-1 items-center justify-end gap-2 md:flex-initial md:shrink-0">
          {isAuthenticated ? (
            <div className="profile-menu relative hidden md:block">
              <button
                type="button"
                onClick={() => setProfileOpen(!profileOpen)}
                className="profile-button flex min-h-11 items-center gap-2 rounded-xl px-2 py-1.5 transition-colors hover:bg-[var(--brand-soft)] hover:text-[var(--brand)]"
                aria-label="User menu"
                aria-expanded={profileOpen}
              >
                <NameAvatar name={displayName} className="h-8 w-8 text-sm" />
                <span className="hidden max-w-28 truncate text-sm font-bold text-[var(--foreground)] sm:inline">
                  {displayName.split(" ")[0]}
                </span>
                <ChevronDown
                  size={14}
                  className={`text-[var(--muted-foreground)] transition-transform ${profileOpen ? "rotate-180" : ""}`}
                  aria-hidden="true"
                />
              </button>

              {profileOpen && (
                  <div className="absolute right-0 mt-2 w-64 overflow-hidden rounded-xl border border-[var(--border)]/70 bg-white py-2 soft-shadow">
                    <div className="border-b border-[var(--border)]/45 px-5 py-4">
                      <p className="text-sm font-bold text-foreground">{displayName}</p>
                      <p className="truncate text-xs text-muted-foreground">{user?.email}</p>
                    </div>
                    <Link
                      href="/user/dashboard"
                      onClick={() => setProfileOpen(false)}
                      className="flex items-center gap-3 px-5 py-3 text-sm font-semibold text-foreground transition-colors hover:bg-[var(--brand-soft)]"
                    >
                      <Box size={16} className="text-[var(--brand)]" aria-hidden="true" />
                      My listings
                    </Link>
                    <Link
                      href="/user/dashboard?section=profile"
                      onClick={() => setProfileOpen(false)}
                      className="flex items-center gap-3 px-5 py-3 text-sm font-semibold text-foreground transition-colors hover:bg-[var(--brand-soft)]"
                    >
                      <UserRound size={16} className="text-[var(--brand)]" aria-hidden="true" />
                      Edit profile
                    </Link>
                    <Link
                      href="/user/dashboard?section=settings"
                      onClick={() => setProfileOpen(false)}
                      className="flex items-center gap-3 px-5 py-3 text-sm font-semibold text-foreground transition-colors hover:bg-[var(--brand-soft)]"
                    >
                      <Settings size={16} className="text-[var(--brand)]" aria-hidden="true" />
                      Settings
                    </Link>
                    {user?.role === "ADMIN" && (
                      <Link
                        href="/admin"
                        onClick={() => setProfileOpen(false)}
                        className="flex items-center gap-3 px-5 py-3 text-sm font-semibold text-foreground transition-colors hover:bg-[var(--brand-soft)]"
                      >
                        <ShieldCheck size={16} className="text-[var(--brand)]" aria-hidden="true" />
                        Administration
                      </Link>
                    )}
                    <div className="mt-1 border-t border-[var(--border)]/45 pt-1">
                      <button
                        type="button"
                        onClick={handleLogout}
                        className="flex w-full items-center gap-3 px-5 py-3 text-sm font-semibold text-red-600 transition-colors hover:bg-red-50"
                      >
                        <LogOut size={16} aria-hidden="true" />
                        Log out
                      </button>
                    </div>
                  </div>
                )}
            </div>
          ) : (
            <div className="hidden items-center gap-1 md:flex">
              <Link
                href="/login"
                className="inline-flex min-h-11 items-center gap-2 rounded-xl px-3 text-sm font-bold text-[var(--ink-soft)] transition-colors hover:bg-[var(--brand-soft)] hover:text-[var(--brand)]"
              >
                <LogIn size={16} aria-hidden="true" />
                Log in
              </Link>
              <Link
                href="/signup"
                className="inline-flex min-h-11 items-center rounded-xl bg-[var(--brand)] px-5 py-2 text-sm font-bold text-white transition-[background-color,transform] duration-150 hover:bg-[var(--brand-dark)] active:scale-[0.98]"
              >
                Join free
              </Link>
            </div>
          )}

          <form
            onSubmit={handleMobileSearch}
            className="flex h-9 min-w-0 max-w-[10.5rem] flex-1 items-center rounded-xl border border-[var(--line-soft)] bg-white pl-2 focus-within:border-[var(--aqua)] md:hidden"
            role="search"
          >
            <input
              type="search"
              value={mobileSearch}
              onChange={(event) => setMobileSearch(event.target.value)}
              placeholder="Search listings"
              aria-label="Search listings"
              className="h-full min-w-0 flex-1 border-0 bg-transparent px-1 text-xs font-semibold text-[var(--foreground)] outline-none placeholder:text-[var(--muted-foreground)]"
            />
            <button type="submit" className="flex h-9 w-9 shrink-0 items-center justify-center text-[var(--aqua)]" aria-label="Search">
              <Search className="search-glyph" size={15} strokeWidth={2.1} aria-hidden="true" />
            </button>
          </form>

          <button
            type="button"
            className="mobile-menu-button inline-flex h-12 w-12 shrink-0 items-center justify-center bg-transparent text-[var(--brand)] transition-colors hover:text-[var(--brand-dark)] md:hidden"
            onPointerDown={(event) => event.stopPropagation()}
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            aria-expanded={menuOpen}
          >
            <span className="relative block h-4 w-5" aria-hidden="true">
              <span className={`absolute left-0 top-0.5 h-0.5 w-5 rounded-full bg-current transition-transform duration-200 ${menuOpen ? "translate-y-[6px] rotate-45" : ""}`} />
              <span className={`absolute left-0 top-[7px] h-0.5 w-5 rounded-full bg-current transition-[transform,opacity] duration-150 ${menuOpen ? "scale-x-0 opacity-0" : ""}`} />
              <span className={`absolute left-0 top-[13px] h-0.5 w-5 rounded-full bg-current transition-transform duration-200 ${menuOpen ? "-translate-y-[6px] -rotate-45" : ""}`} />
            </span>
          </button>

              {menuOpen && (
                <div className="fixed inset-x-0 bottom-0 top-[3.75rem] z-[var(--layer-overlay)] md:hidden">
                  <button
                    type="button"
                    className="absolute inset-0 h-full w-full bg-black/20"
                    onClick={() => setMenuOpen(false)}
                    aria-label="Close menu"
                  />
                  <div className="navbar-menu mobile-menu-entry relative h-full w-[min(82vw,20rem)] overflow-y-auto border-r border-[var(--line-soft)] bg-white px-3 py-3 text-left">
                  <nav className="flex flex-col" aria-label="Mobile navigation">
                    {(isAuthenticated ? mobileAccountActions : productActions).map((item) => {
                      const Icon = item.icon;
                      return (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={() => setMenuOpen(false)}
                        className={`flex min-h-12 w-full items-center gap-3 border-b border-[var(--line-soft)] px-2 py-2.5 text-left text-sm font-bold transition-colors ${
                          isActive(item.href) ? "text-[var(--brand)]" : "text-[var(--ink-soft)] hover:text-[var(--brand)]"
                        }`}
                        aria-current={isActive(item.href) ? "page" : undefined}
                      >
                        <span className="flex h-8 w-8 shrink-0 items-center justify-center text-[var(--aqua)]">
                          <Icon size={15} aria-hidden="true" />
                        </span>
                        <span>{item.label}</span>
                      </Link>
                      );
                    })}
                    {isAuthenticated && (
                      <button
                        type="button"
                        onClick={() => {
                          setMenuOpen(false);
                          handleLogout();
                        }}
                        className="flex min-h-12 w-full items-center gap-3 border-b border-[var(--line-soft)] px-2 py-2.5 text-left text-sm font-bold text-red-700 transition-colors"
                      >
                        <LogOut size={16} aria-hidden="true" />
                        <span>Log out</span>
                      </button>
                    )}
                  </nav>
                  </div>
                </div>
              )}
        </div>
      </div>
    </header>
  );
}
