"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  ChevronDown,
  HandHeart,
  LayoutDashboard,
  LogOut,
  Menu,
  Recycle,
  RefreshCw,
  Search,
  Settings,
  ShoppingBag,
  Store,
  UserCircle,
  Wrench,
  X,
} from "lucide-react";
import { useAuthStore } from "@/lib/auth";

const productActions = [
  { label: "Buy", href: "/marketplace", icon: ShoppingBag },
  { label: "Sell", href: "/sell-item?intent=SELL", icon: Store },
  { label: "Trade", href: "/sell-item?intent=TRADE", icon: RefreshCw },
  { label: "Donate", href: "/sell-item?intent=DONATE", icon: HandHeart },
  { label: "Repair", href: "/sell-item?intent=FIX", icon: Wrench },
  { label: "Recycle", href: "/sell-item?intent=RECYCLE", icon: Recycle },
];

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [mobileSearch, setMobileSearch] = useState("");
  const pathname = usePathname();
  const router = useRouter();

  const { user, isAuthenticated, logout } = useAuthStore();
  const displayName = user?.name || "Account";

  useEffect(() => {
    if (typeof window === "undefined") return;
    const handleScroll = () => setScrolled(window.scrollY > 10);
    handleScroll();
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

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

  const handleMobileSearch = (event: React.FormEvent) => {
    event.preventDefault();
    const search = mobileSearch.trim();
    router.push(`/find-a-pair${search ? `?search=${encodeURIComponent(search)}` : ""}`);
    setMenuOpen(false);
  };

  const isActive = (href: string) => {
    if (href.includes("#")) return pathname === "/";
    if (href === "/") return pathname === "/";
    return pathname === href || pathname.startsWith(`${href}/`);
  };

  return (
    <header className="sticky top-0 z-50 w-full px-3 py-2 md:px-6 md:py-3">
      <div
        className={`relative mx-auto flex max-w-7xl items-center gap-2 bg-white/95 py-1 backdrop-blur-md transition-all duration-300 md:justify-between md:gap-0 md:rounded-[2rem] md:border md:px-6 md:py-3 ${
          scrolled ? "md:border-[var(--border)]/60 md:soft-shadow" : "md:border-[var(--border)]/35 md:shadow-sm md:shadow-[var(--brand)]/5"
        }`}
      >
        <Link href="/" className="flex shrink-0 items-center gap-3 text-[var(--brand)]">
          <span className="text-lg font-bold tracking-normal md:text-2xl">Remnant</span>
        </Link>

        <nav className="hidden min-w-0 flex-1 items-center justify-center gap-2 px-4 md:flex" aria-label="Primary navigation">
          {productActions.map((item, index) => (
            <React.Fragment key={item.href}>
              <Link
                href={item.href}
                className={`relative z-10 px-1 py-2 text-xs font-black uppercase tracking-[0.16em] transition-all duration-200 ${
                  item.href === "/marketplace" && isActive(item.href)
                    ? "text-[var(--brand)]"
                    : "text-[var(--foreground)] hover:text-[var(--brand)]"
                }`}
              >
                {item.label}
              </Link>
              {index < productActions.length - 1 && (
                <span className="text-sm font-black text-[var(--brand)]" aria-hidden="true">
                  .
                </span>
              )}
            </React.Fragment>
          ))}
        </nav>

        <div className="relative z-20 flex min-w-0 flex-1 items-center justify-end gap-2 md:flex-initial md:shrink-0">
          {isAuthenticated ? (
            <div className="relative profile-menu">
              <button
                type="button"
                onClick={() => setProfileOpen(!profileOpen)}
                className="profile-button flex items-center gap-2 rounded-full border border-[var(--border)]/55 bg-white px-2.5 py-2 transition-colors hover:border-[var(--brand)]/40 hover:bg-[var(--brand-soft)]"
                aria-label="User menu"
                aria-expanded={profileOpen}
              >
                <span className="flex h-8 w-8 items-center justify-center overflow-hidden rounded-full bg-[var(--brand-soft)]">
                  {user?.avatarUrl ? (
                    <img src={user.avatarUrl} alt="" className="h-full w-full object-cover" />
                  ) : (
                    <span className="text-sm font-bold text-[var(--brand)]">
                      {displayName.charAt(0).toUpperCase()}
                    </span>
                  )}
                </span>
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
                  <div className="absolute right-0 mt-3 w-60 overflow-hidden rounded-[1.5rem] border border-[var(--border)]/60 bg-white py-2 soft-shadow">
                    <div className="border-b border-[var(--border)]/45 px-5 py-4">
                      <p className="text-sm font-bold text-foreground">{displayName}</p>
                      <p className="truncate text-xs text-muted-foreground">{user?.email}</p>
                    </div>
                    <Link
                      href="/user/dashboard"
                      onClick={() => setProfileOpen(false)}
                      className="flex items-center gap-3 px-5 py-3 text-sm font-semibold text-foreground transition-colors hover:bg-[var(--brand-soft)]"
                    >
                      <LayoutDashboard size={16} className="text-[var(--brand)]" aria-hidden="true" />
                      Dashboard
                    </Link>
                    <Link
                      href="/user/dashboard?section=profile"
                      onClick={() => setProfileOpen(false)}
                      className="flex items-center gap-3 px-5 py-3 text-sm font-semibold text-foreground transition-colors hover:bg-[var(--brand-soft)]"
                    >
                      <UserCircle size={16} className="text-[var(--brand)]" aria-hidden="true" />
                      My Profile
                    </Link>
                    <Link
                      href="/user/dashboard?section=settings"
                      onClick={() => setProfileOpen(false)}
                      className="flex items-center gap-3 px-5 py-3 text-sm font-semibold text-foreground transition-colors hover:bg-[var(--brand-soft)]"
                    >
                      <Settings size={16} className="text-[var(--brand)]" aria-hidden="true" />
                      Settings
                    </Link>
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
            <div className="hidden items-center gap-2 md:flex">
              <Link
                href="/signup"
                className="rounded-full bg-[var(--brand)] px-5 py-3 text-sm font-bold text-white soft-shadow transition-colors hover:bg-[var(--brand-dark)]"
              >
                Join Now
              </Link>
            </div>
          )}

          <form
            onSubmit={handleMobileSearch}
            className="flex h-11 min-w-0 flex-1 items-center gap-1 rounded-full bg-[var(--sand)] p-1 md:hidden"
          >
            <input
              value={mobileSearch}
              onChange={(event) => setMobileSearch(event.target.value)}
              placeholder="Search"
              className="h-9 min-w-0 flex-1 rounded-full bg-transparent px-3 text-sm font-semibold text-[var(--foreground)] outline-none placeholder:text-[var(--muted-foreground)]"
              aria-label="Search items"
            />
            <button
              type="submit"
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white text-[var(--brand)] shadow-sm transition-colors hover:bg-[var(--brand-soft)]"
              aria-label="Submit search"
            >
              <Search size={16} aria-hidden="true" />
            </button>
          </form>

          <button
            type="button"
            className="mobile-menu-button inline-flex h-11 w-11 items-center justify-center rounded-full bg-white text-[var(--brand)] transition-colors hover:bg-[var(--brand-soft)] md:hidden"
            onPointerDown={(event) => event.stopPropagation()}
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            aria-expanded={menuOpen}
          >
            {menuOpen ? <X size={20} aria-hidden="true" /> : <Menu size={21} aria-hidden="true" />}
          </button>

              {menuOpen && (
                <div className="navbar-menu absolute right-0 top-full z-50 mt-2 w-[min(92vw,22rem)] overflow-hidden rounded-[1.35rem] bg-white/88 p-2 shadow-[0_18px_45px_-30px_rgba(0,108,82,0.5)] ring-1 ring-black/[0.05] backdrop-blur-md md:hidden">
                  <nav className="grid grid-cols-3 gap-1.5" aria-label="Mobile navigation">
                    {productActions.map((item) => {
                      const Icon = item.icon;
                      return (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={() => setMenuOpen(false)}
                        className={`flex min-h-[64px] flex-col items-start justify-between rounded-[0.95rem] p-2.5 text-xs font-bold transition-colors ${
                          item.href === "/marketplace" && isActive(item.href)
                            ? "bg-[var(--brand-soft)] text-[var(--brand)]"
                            : "text-[var(--ink-soft)] hover:bg-[var(--sand)] hover:text-[var(--brand)]"
                        }`}
                      >
                        <Icon size={19} aria-hidden="true" />
                        <span>{item.label}</span>
                      </Link>
                      );
                    })}
                  </nav>
                </div>
              )}
        </div>
      </div>
    </header>
  );
}
