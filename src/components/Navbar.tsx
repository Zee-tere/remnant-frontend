"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Bell,
  Box,
  ChevronDown,
  LogOut,
  MessageCircle,
  PackagePlus,
  ScanSearch,
  Search,
  Settings,
  ShieldCheck,
  Store,
  UserRound,
  type LucideIcon,
} from "lucide-react";
import { useAuthStore } from "@/lib/auth";
import { listingCategories } from "@/lib/categories";
import { NameAvatar } from "@/components/ui/name-avatar";
import { BrandLogo } from "@/components/brand/BrandLogo";

interface NavigationAction {
  label: string;
  href: string;
  icon: LucideIcon;
}

const exploreActions: NavigationAction[] = [
  { label: "Marketplace", href: "/marketplace", icon: Store },
  { label: "Find a missing piece", href: "/find-a-pair", icon: ScanSearch },
  { label: "List an item", href: "/sell-item", icon: PackagePlus },
];

const accountActions: NavigationAction[] = [
  { label: "My listings", href: "/user/dashboard", icon: Box },
  { label: "Pair alerts", href: "/user/dashboard?section=pair-alerts", icon: ScanSearch },
  { label: "Messages", href: "/user/dashboard?section=messages", icon: MessageCircle },
  { label: "Match alerts", href: "/user/dashboard?section=alerts", icon: Bell },
  { label: "Profile", href: "/user/dashboard?section=profile", icon: UserRound },
  { label: "Settings", href: "/user/dashboard?section=settings", icon: Settings },
];

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const pathname = usePathname();
  const router = useRouter();
  const { user, isAuthenticated, logout } = useAuthStore();
  const displayName = user?.name || "Account";

  const isAuthRoute = ["/login", "/signup", "/forgot-password", "/reset-password", "/auth/callback"].some(
    (route) => pathname.startsWith(route),
  );
  const pageOwnsMobileSearch = pathname === "/" || pathname.startsWith("/marketplace");

  useEffect(() => {
    setMenuOpen(false);
    setProfileOpen(false);
  }, [pathname]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest(".navbar-menu") && !target.closest(".mobile-menu-button")) setMenuOpen(false);
      if (!target.closest(".profile-menu") && !target.closest(".profile-button")) setProfileOpen(false);
    };
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);

  const handleLogout = () => {
    logout();
    setMenuOpen(false);
    setProfileOpen(false);
    router.push("/");
  };

  const handleSearch = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const search = searchQuery.trim();
    router.push(`/marketplace${search ? `?search=${encodeURIComponent(search)}` : ""}`);
  };

  const isActive = (href: string) => {
    const cleanHref = href.split("?")[0];
    if (cleanHref === "/") return pathname === "/";
    return pathname === cleanHref || pathname.startsWith(`${cleanHref}/`);
  };

  if (isAuthRoute) return null;

  return (
    <header className="sticky top-0 z-[var(--layer-sticky)] w-full border-b border-black/10 bg-white">
      <div className="mx-auto flex min-h-[4rem] max-w-7xl items-center gap-3 px-4 sm:px-6 md:grid md:min-h-[4.5rem] md:grid-cols-[auto_minmax(17rem,1fr)_auto] md:gap-4 lg:px-8 xl:grid-cols-[1fr_minmax(22rem,30rem)_1fr]">
        <Link href="/" className="flex shrink-0 items-center text-[var(--brand)]" aria-label="Remnant home">
          <BrandLogo size="nav" />
        </Link>

        <form onSubmit={handleSearch} className="hidden w-full min-w-0 justify-self-center md:flex" role="search">
          <div className="flex h-10 w-full items-center rounded-full border border-black bg-white p-1 transition-shadow focus-within:shadow-[0_0_0_3px_rgba(0,0,0,0.07)]">
            <Search className="search-glyph ml-2.5 shrink-0 text-black/45" size={17} strokeWidth={2.1} aria-hidden="true" />
            <input
              type="search"
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              placeholder="Search the marketplace"
              aria-label="Search marketplace listings"
              className="h-full min-w-0 flex-1 border-0 bg-transparent px-2.5 text-sm font-medium text-black outline-none placeholder:text-black/40"
            />
            <button type="submit" className="flex h-8 shrink-0 items-center rounded-full bg-black px-3.5 text-xs font-bold text-white transition-[background-color,transform] hover:bg-black/80 active:scale-[0.97]">
              Search
            </button>
          </div>
        </form>

        <nav className="hidden shrink-0 items-center justify-self-end gap-1 md:flex" aria-label="Primary navigation">
          <Link href="/marketplace" className={`min-h-11 px-2 py-3 text-sm font-bold transition-colors ${isActive("/marketplace") ? "text-black" : "text-black/55 hover:text-black"}`}>
            Marketplace
          </Link>
          <Link href="/sell-item" className={`min-h-11 px-2 py-3 text-sm font-bold transition-colors ${isActive("/sell-item") ? "text-black" : "text-black/55 hover:text-black"}`}>
            List
          </Link>

          {isAuthenticated ? (
            <div className="profile-menu relative ml-1">
              <button
                type="button"
                onClick={() => setProfileOpen((current) => !current)}
                className="profile-button flex min-h-11 items-center gap-2 rounded-full px-2 py-1.5 transition-colors hover:bg-black/5"
                aria-label="User menu"
                aria-expanded={profileOpen}
              >
                <NameAvatar name={displayName} className="h-8 w-8 text-sm" />
                <span className="hidden max-w-24 truncate text-sm font-bold text-black xl:inline">{displayName.split(" ")[0]}</span>
                <ChevronDown size={14} className={`text-black/45 transition-transform ${profileOpen ? "rotate-180" : ""}`} aria-hidden="true" />
              </button>

              {profileOpen && (
                <div className="absolute right-0 mt-2 w-64 overflow-hidden rounded-card border border-black/10 bg-white py-2 shadow-[0_16px_45px_rgba(0,0,0,0.12)]">
                  <div className="border-b border-black/10 px-5 py-4">
                    <p className="text-sm font-bold text-black">{displayName}</p>
                    <p className="mt-0.5 truncate text-xs text-black/45">{user?.email}</p>
                  </div>
                  {accountActions.slice(0, 3).map((item) => {
                    const Icon = item.icon;
                    return (
                      <Link key={item.href} href={item.href} onClick={() => setProfileOpen(false)} className="flex min-h-11 items-center gap-3 px-5 py-2.5 text-sm font-semibold text-black transition-colors hover:bg-black/5">
                        <Icon size={16} className="text-black/55" aria-hidden="true" />
                        {item.label}
                      </Link>
                    );
                  })}
                  {user?.role === "ADMIN" && (
                    <Link href="/admin" onClick={() => setProfileOpen(false)} className="flex min-h-11 items-center gap-3 px-5 py-2.5 text-sm font-semibold text-black hover:bg-black/5">
                      <ShieldCheck size={16} className="text-black/55" aria-hidden="true" /> Administration
                    </Link>
                  )}
                  <div className="mt-1 border-t border-black/10 pt-1">
                    <button type="button" onClick={handleLogout} className="flex min-h-11 w-full items-center gap-3 px-5 py-2.5 text-sm font-semibold text-black hover:bg-black/5">
                      <LogOut size={16} className="text-black/55" aria-hidden="true" /> Log out
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="ml-1 flex items-center gap-1">
              <Link href="/login" className="inline-flex min-h-11 items-center px-1.5 text-sm font-bold text-black/55 hover:text-black">Log in</Link>
              <Link href="/signup" className="inline-flex min-h-9 items-center rounded-full border border-black px-3 text-sm font-bold text-black hover:bg-black hover:text-white">Join</Link>
            </div>
          )}
        </nav>

        <div className="ml-auto flex min-w-0 flex-1 items-center justify-end gap-1 md:hidden">
          {!pageOwnsMobileSearch && (
            <form onSubmit={handleSearch} className="flex h-10 min-w-0 max-w-[11rem] flex-1 items-center rounded-full border border-black/15 bg-white pl-3 focus-within:border-black" role="search">
              <input
                type="search"
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                placeholder="Search items"
                aria-label="Search marketplace listings"
                className="h-full min-w-0 flex-1 border-0 bg-transparent text-xs font-semibold text-black outline-none placeholder:text-black/40"
              />
              <button type="submit" className="flex h-10 w-10 shrink-0 items-center justify-center text-black" aria-label="Search"><Search className="search-glyph" size={17} strokeWidth={2.1} aria-hidden="true" /></button>
            </form>
          )}

          <button
            type="button"
            className="mobile-menu-button inline-flex h-12 w-12 shrink-0 items-center justify-center text-black"
            onPointerDown={(event) => event.stopPropagation()}
            onClick={() => setMenuOpen((current) => !current)}
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            aria-expanded={menuOpen}
          >
            <span className="relative block h-4 w-5" aria-hidden="true">
              <span className={`absolute left-0 top-0.5 h-0.5 w-5 rounded-full bg-current transition-transform duration-200 ${menuOpen ? "translate-y-[6px] rotate-45" : ""}`} />
              <span className={`absolute left-0 top-[7px] h-0.5 w-5 rounded-full bg-current transition-[transform,opacity] duration-150 ${menuOpen ? "scale-x-0 opacity-0" : ""}`} />
              <span className={`absolute left-0 top-[13px] h-0.5 w-5 rounded-full bg-current transition-transform duration-200 ${menuOpen ? "-translate-y-[6px] -rotate-45" : ""}`} />
            </span>
          </button>
        </div>
      </div>

      {menuOpen && (
        <div className="fixed inset-x-0 bottom-0 top-[4rem] z-[var(--layer-overlay)] md:hidden">
          <button type="button" className="absolute inset-0 h-full w-full bg-black/25" onClick={() => setMenuOpen(false)} aria-label="Close menu" />
          <aside className="navbar-menu mobile-menu-entry absolute right-0 h-full w-[min(74vw,18rem)] overflow-y-auto border-l border-black/10 bg-white px-4 pb-28 pt-5 text-left" aria-label="Mobile navigation">
            <p className="text-xs font-bold uppercase tracking-[0.14em] text-black/40">Explore</p>
            <nav className="mt-3" aria-label="Explore Remnant">
              <Link href="/" onClick={() => setMenuOpen(false)} className={`flex min-h-12 items-center border-b border-black/10 text-sm font-bold ${isActive("/") ? "text-black" : "text-black/60"}`}>Home</Link>
              {exploreActions.map((item) => (
                <Link key={item.href} href={item.href} onClick={() => setMenuOpen(false)} className={`flex min-h-12 items-center border-b border-black/10 text-sm font-bold ${isActive(item.href) ? "text-black" : "text-black/60"}`}>
                  {item.label}
                </Link>
              ))}
            </nav>

            <p className="mt-7 text-xs font-bold uppercase tracking-[0.14em] text-black/40">Browse categories</p>
            <nav className="mt-3" aria-label="Browse categories">
              {listingCategories.map((category) => (
                <Link
                  key={category.label}
                  href={`/marketplace?category=${encodeURIComponent(category.label)}`}
                  onClick={() => setMenuOpen(false)}
                  className="flex min-h-10 items-center justify-between gap-2 border-b border-black/10 text-xs font-semibold text-black/60 hover:text-black"
                >
                  {category.label}<span className="text-black/25" aria-hidden="true">›</span>
                </Link>
              ))}
            </nav>

            {isAuthenticated && (
              <>
              <p className="mt-7 text-xs font-bold uppercase tracking-[0.14em] text-black/40">Account</p>
              <nav className="mt-3" aria-label="Account">
                <Link href="/user/dashboard?section=settings" onClick={() => setMenuOpen(false)} className="flex min-h-11 items-center gap-3 border-b border-black/10 text-sm font-bold text-black/60">
                  <Settings size={16} aria-hidden="true" />Settings
                </Link>
                <button type="button" onClick={handleLogout} className="flex min-h-12 w-full items-center gap-3 border-b border-black/10 text-left text-sm font-bold text-black/60"><LogOut size={16} aria-hidden="true" />Log out</button>
              </nav>
              </>
            )}
          </aside>
        </div>
      )}
    </header>
  );
}
