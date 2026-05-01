import React from "react";
import Link from "next/link";
import { FaFacebook, FaInstagram, FaXTwitter, FaLinkedin } from "react-icons/fa6";
import { Button } from "@/components/ui/button";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  const footerLinks = {
    Marketplace: [
      { label: "Browse All", href: "/marketplace" },
      { label: "Find a Pair", href: "/find-a-pair" },
      { label: "Sell an Item", href: "/sell-item" },
    ],
    Company: [
      { label: "About Us", href: "/about" },
      { label: "Blog", href: "/blog" },
      { label: "Seller Guide", href: "/seller-guide" },
    ],
    Support: [
      { label: "Help Center", href: "/help" },
      { label: "Contact Us", href: "/help" },
    ],
  };

  const socialLinks = [
    { icon: FaFacebook, href: "https://facebook.com", label: "Facebook" },
    { icon: FaXTwitter, href: "https://twitter.com", label: "Twitter/X" },
    { icon: FaInstagram, href: "https://instagram.com", label: "Instagram" },
    { icon: FaLinkedin, href: "https://linkedin.com", label: "LinkedIn" },
  ];

  return (
    <footer className="bg-neutral-950 text-white">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
          {/* Brand Column */}
          <div className="lg:col-span-2">
            <Link href="/" className="inline-flex items-center space-x-2 mb-4">
              <div className="bg-[#4a7c6f] text-white rounded-xl h-10 w-10 flex items-center justify-center text-xl font-bold">
                R
              </div>
              <span className="text-xl font-bold">Remnant</span>
            </Link>
            <p className="text-neutral-400 mb-6 max-w-sm text-sm leading-relaxed">
              The marketplace for incomplete, broken, or singular things.
              Stop throwing things away because one piece is missing — someone out there needs exactly what you have.
            </p>

            {/* Newsletter */}
            <div className="mb-6">
              <h3 className="text-sm font-semibold mb-3 text-neutral-300">Stay updated</h3>
              <div className="flex gap-2">
                <input
                  type="email"
                  placeholder="Your email"
                  className="flex-1 px-3 py-2 text-sm rounded-lg bg-neutral-800 border border-neutral-700 focus:outline-none focus:ring-1 focus:ring-[#4a7c6f] text-white placeholder-neutral-500"
                  aria-label="Email for newsletter"
                />
                <Button size="sm" className="bg-[#4a7c6f] hover:bg-[#3d6b5f] text-white text-sm">
                  Subscribe
                </Button>
              </div>
            </div>
          </div>

          {/* Links Columns */}
          {Object.entries(footerLinks).map(([category, links]) => (
            <div key={category}>
              <h3 className="text-sm font-semibold mb-4 text-neutral-300">{category}</h3>
              <ul className="space-y-2.5">
                {links.map((link) => (
                  <li key={link.href + link.label}>
                    <Link
                      href={link.href}
                      className="text-neutral-500 hover:text-white text-sm transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-neutral-800 mt-10 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center space-x-3">
              {socialLinks.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-neutral-500 hover:text-white transition-colors p-2 hover:bg-neutral-800 rounded-lg"
                  aria-label={social.label}
                >
                  <social.icon size={18} />
                </a>
              ))}
            </div>

            <p className="text-neutral-600 text-xs">
              © {currentYear} Remnant Marketplace. All rights reserved.
            </p>
          </div>

          <div className="mt-6 flex flex-wrap items-center justify-center gap-4 text-neutral-600 text-xs">
            <span className="flex items-center space-x-1">
              <span className="w-1.5 h-1.5 bg-[#4a7c6f] rounded-full" />
              <span>SSL Secured</span>
            </span>
            <span>·</span>
            <span>Buyer Protection</span>
            <span>·</span>
            <span>Verified Sellers</span>
            <span>·</span>
            <span>Escrow Available</span>
          </div>
        </div>
      </div>

      {/* Mobile Bottom Navigation */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white dark:bg-neutral-950 border-t border-neutral-200 dark:border-neutral-800 py-2 px-4 z-50">
        <div className="flex justify-around items-center">
          <Link href="/" className="flex flex-col items-center text-neutral-400 hover:text-neutral-900 dark:hover:text-white py-1">
            <span className="text-[10px]">Home</span>
          </Link>
          <Link href="/marketplace" className="flex flex-col items-center text-neutral-400 hover:text-neutral-900 dark:hover:text-white py-1">
            <span className="text-[10px]">Browse</span>
          </Link>
          <Link href="/sell-item" className="flex flex-col items-center py-1">
            <span className="text-[10px] bg-[#4a7c6f] text-white px-3 py-1 rounded-full font-medium">List</span>
          </Link>
          <Link href="/find-a-pair" className="flex flex-col items-center text-neutral-400 hover:text-neutral-900 dark:hover:text-white py-1">
            <span className="text-[10px]">Matches</span>
          </Link>
          <Link href="/profile" className="flex flex-col items-center text-neutral-400 hover:text-neutral-900 dark:hover:text-white py-1">
            <span className="text-[10px]">Profile</span>
          </Link>
        </div>
      </div>
    </footer>
  );
}