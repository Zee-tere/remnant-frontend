'use client';

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, UserCircle, Search, Home, Package, Upload, ShoppingBag, LogOut, Settings, LayoutDashboard } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/lib/auth";

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  const { user, isAuthenticated, logout } = useAuthStore();
  const displayName = user?.name || "Account";

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest('.navbar-menu') && !target.closest('.mobile-menu-button')) {
        setMenuOpen(false);
      }
      if (!target.closest('.profile-menu') && !target.closest('.profile-button')) {
        setProfileOpen(false);
      }
    };
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  const handleLogout = () => {
    logout();
    setProfileOpen(false);
    router.push('/');
  };

  const navItems = [
    { label: "Home", href: "/", icon: Home },
    { label: "Marketplace", href: "/marketplace", icon: ShoppingBag },
    { label: "Find a Pair", href: "/find-a-pair", icon: Package },
    { label: "Sell Item", href: "/sell-item", icon: Upload },
  ];

  return (
    <header
      className={`sticky top-0 z-50 w-full transition-all duration-300 ${
        scrolled
          ? 'bg-white/95 dark:bg-neutral-900/95 backdrop-blur-md shadow-sm'
          : 'bg-white dark:bg-neutral-900'
      }`}
    >
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2 navbar-logo">
            <motion.div
              className="bg-[#4a7c6f] text-white rounded-xl h-9 w-9 flex items-center justify-center text-base font-bold"
              whileHover={{ rotate: 6 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              R
            </motion.div>
            <span className="text-xl font-bold text-neutral-900 dark:text-white">Remnant</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-1">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center space-x-1.5 px-3 py-2 rounded-lg text-sm transition-colors ${
                  pathname === item.href
                    ? 'bg-[#4a7c6f]/10 text-[#4a7c6f] font-medium'
                    : 'text-neutral-500 hover:bg-neutral-50 hover:text-neutral-900 dark:hover:bg-neutral-800'
                }`}
              >
                <item.icon size={16} />
                <span>{item.label}</span>
              </Link>
            ))}
          </nav>

          {/* Desktop Search */}
          <div className="hidden lg:block flex-1 max-w-xs mx-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-300" size={18} />
              <input
                type="text"
                placeholder="Search items..."
                className="w-full pl-9 pr-4 py-2 text-sm border border-neutral-200 dark:border-neutral-700 rounded-xl bg-neutral-50 dark:bg-neutral-800 focus:outline-none focus:ring-2 focus:ring-[#4a7c6f]/30 focus:border-[#4a7c6f]"
                aria-label="Search marketplace"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    const value = (e.target as HTMLInputElement).value;
                    if (value.trim()) router.push(`/marketplace?search=${encodeURIComponent(value)}`);
                  }
                }}
              />
            </div>
          </div>

          {/* Right side actions */}
          <div className="flex items-center space-x-2">
            {/* Mobile Menu Button */}
            <button
              className="md:hidden p-2 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 mobile-menu-button"
              onClick={() => setMenuOpen(!menuOpen)}
              aria-label="Toggle menu"
              aria-expanded={menuOpen}
            >
              {menuOpen ? <X size={22} /> : <Menu size={22} />}
            </button>

            {/* Auth Section */}
            {isAuthenticated ? (
              <div className="relative profile-menu">
                <button
                  onClick={() => setProfileOpen(!profileOpen)}
                  className="flex items-center space-x-2 px-3 py-2 rounded-xl bg-neutral-50 dark:bg-neutral-800 hover:bg-neutral-100 dark:hover:bg-neutral-700 transition-colors profile-button"
                  aria-label="User menu"
                  aria-expanded={profileOpen}
                >
                  <div className="w-7 h-7 rounded-full bg-[#4a7c6f]/10 flex items-center justify-center">
                    <UserCircle size={18} className="text-[#4a7c6f]" />
                  </div>
                  <span className="hidden sm:inline text-sm font-medium text-neutral-700 dark:text-neutral-200">
                    {displayName.split(" ")[0]}
                  </span>
                </button>

                <AnimatePresence>
                  {profileOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 8, scale: 0.96 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 8, scale: 0.96 }}
                      transition={{ duration: 0.15 }}
                      className="absolute right-0 mt-2 w-56 bg-white dark:bg-neutral-900 rounded-xl shadow-lg border border-neutral-100 dark:border-neutral-700 py-1.5 overflow-hidden"
                    >
                      <div className="px-4 py-3 border-b border-neutral-100 dark:border-neutral-800">
                        <p className="font-medium text-sm text-neutral-900 dark:text-white">{displayName}</p>
                        <p className="text-xs text-neutral-400">{user?.email}</p>
                      </div>
                      <Link
                        href="/user/dashboard"
                        onClick={() => setProfileOpen(false)}
                        className="flex items-center space-x-2.5 px-4 py-2.5 text-sm hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors text-neutral-600 dark:text-neutral-300"
                      >
                        <LayoutDashboard size={16} />
                        <span>Dashboard</span>
                      </Link>
                      <Link
                        href="/profile"
                        onClick={() => setProfileOpen(false)}
                        className="flex items-center space-x-2.5 px-4 py-2.5 text-sm hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors text-neutral-600 dark:text-neutral-300"
                      >
                        <UserCircle size={16} />
                        <span>My Profile</span>
                      </Link>
                      <Link
                        href="/settings"
                        onClick={() => setProfileOpen(false)}
                        className="flex items-center space-x-2.5 px-4 py-2.5 text-sm hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors text-neutral-600 dark:text-neutral-300"
                      >
                        <Settings size={16} />
                        <span>Settings</span>
                      </Link>
                      <div className="border-t border-neutral-100 dark:border-neutral-800 mt-1 pt-1">
                        <button
                          onClick={handleLogout}
                          className="w-full flex items-center space-x-2.5 px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                        >
                          <LogOut size={16} />
                          <span>Log out</span>
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Link href="/login">
                  <Button variant="ghost" size="sm" className="text-neutral-600 hover:text-neutral-900 text-sm">
                    Log in
                  </Button>
                </Link>
                <Link href="/signup">
                  <Button size="sm" className="bg-[#4a7c6f] hover:bg-[#3d6b5f] text-white text-sm rounded-lg">
                    Sign up
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {menuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden overflow-hidden navbar-menu"
            >
              <div className="py-3 border-t border-neutral-100 dark:border-neutral-800">
                {/* Mobile Search */}
                <div className="mb-3 px-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-400" size={18} />
                    <input
                      type="text"
                      placeholder="Search items..."
                      className="w-full pl-9 pr-4 py-2.5 text-sm border border-neutral-200 dark:border-neutral-700 rounded-xl bg-neutral-50 dark:bg-neutral-800"
                    />
                  </div>
                </div>

                <div className="space-y-0.5">
                  {navItems.map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setMenuOpen(false)}
                      className={`flex items-center space-x-3 px-3 py-3 rounded-lg text-sm ${
                        pathname === item.href
                          ? 'bg-[#4a7c6f]/10 text-[#4a7c6f] font-medium'
                          : 'text-neutral-600 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-800'
                      }`}
                    >
                      <item.icon size={18} />
                      <span>{item.label}</span>
                    </Link>
                  ))}

                  <div className="border-t border-neutral-100 dark:border-neutral-800 pt-2 mt-2">
                    <Link href="/help" onClick={() => setMenuOpen(false)}
                      className="flex items-center space-x-3 px-3 py-3 rounded-lg text-sm text-neutral-600 dark:text-neutral-300 hover:bg-neutral-50">
                      <span>Help Center</span>
                    </Link>
                    <Link href="/about" onClick={() => setMenuOpen(false)}
                      className="flex items-center space-x-3 px-3 py-3 rounded-lg text-sm text-neutral-600 dark:text-neutral-300 hover:bg-neutral-50">
                      <span>About Remnant</span>
                    </Link>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </header>
  );
}