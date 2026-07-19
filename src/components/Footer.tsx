"use client";

import React from "react";
import Link from "next/link";
import { Instagram, Mail, Twitter } from "lucide-react";
import { BrandLogo } from "@/components/brand/BrandLogo";

const footerLinks = [
  { label: "Marketplace", href: "/marketplace" },
  { label: "Sell", href: "/sell" },
  { label: "Trade", href: "/trade" },
  { label: "Donate", href: "/donate" },
  { label: "Repair", href: "/repair" },
  { label: "Recycle", href: "/recycle" },
  { label: "Sustainability", href: "/sustainability" },
  { label: "Help Center", href: "/help" },
  { label: "Privacy", href: "/privacy" },
  { label: "Terms", href: "/terms" },
];

const socialLinks = [
  { label: "X", href: "https://x.com/remnant_africa", icon: Twitter },
  { label: "Instagram", href: "https://www.instagram.com/remnantmarket.co/", icon: Instagram },
];

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-[var(--border)]/35 bg-white">
      <div className="mx-auto flex max-w-7xl flex-col gap-4 px-5 py-6 text-center md:px-8">
        <div className="flex flex-col items-center justify-between gap-3 md:flex-row">
          <Link href="/" className="text-[var(--brand)]" aria-label="Remnant home">
            <BrandLogo size="footer" animated={false} />
          </Link>

          <nav className="flex max-w-3xl flex-wrap justify-center gap-x-5 gap-y-1.5 text-sm font-semibold text-[var(--ink-soft)]">
            {footerLinks.map((link) => (
              <Link key={link.href} href={link.href} className="transition-colors hover:text-[var(--brand)]">
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center justify-center gap-2">
            {socialLinks.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                target="_blank"
                rel="noreferrer"
                className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-[var(--border)]/60 text-[var(--secondary-blue)] transition-colors hover:border-[var(--brand)] hover:bg-[var(--brand-soft)] hover:text-[var(--brand)]"
                aria-label={link.label}
              >
                <link.icon size={16} aria-hidden="true" />
              </Link>
            ))}
          </div>
        </div>

        <div className="flex flex-col items-center justify-between gap-2 border-t border-[var(--border)]/30 pt-3 text-sm font-semibold text-[var(--secondary-blue)] md:flex-row">
          <p>&copy; {currentYear} Remnant. Every piece has a story.</p>
          <Link
            href="mailto:support@remnantmarket.co"
            className="inline-flex items-center gap-2 transition-colors hover:text-[var(--brand)]"
          >
            <Mail size={15} aria-hidden="true" />
            support@remnantmarket.co
          </Link>
        </div>
      </div>
    </footer>
  );
}
