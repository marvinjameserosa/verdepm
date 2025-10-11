"use client";

import Link from "next/link";
import { Logo } from "@/components/ui/logo";

export const Footer = () => {
  return (
    <footer
      style={{ backgroundColor: "var(--background)" }}
      className="relative text-muted-foreground pt-20 pb-10 overflow-hidden"
    >
      {/* Subtle background grid */}
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-[linear-gradient(to_right,hsl(var(--border))_1px,transparent_1px),linear-gradient(to_bottom,hsl(var(--border))_1px,transparent_1px)] bg-[size:32px_32px] opacity-10"
      />

      {/* Soft gradient glow on top */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-400 via-green-500 to-lime-400" />

      <div className="relative container mx-auto px-6 lg:px-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-16">
          {/* Company Info */}
          <div className="space-y-5 sm:col-span-2 lg:col-span-1">
            <Logo />
            <p className="text-sm text-muted-foreground max-w-xs leading-relaxed">
              VerdePM empowers construction management with intelligent ESG
              tracking — integrating sustainability, transparency, and
              performance in one platform.
            </p>

            <div className="flex space-x-4 mt-4">
              {[
                {
                  href: "#",
                  path: "M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z",
                },
                {
                  href: "#",
                  path: "M15 11a3 3 0 11-6 0 3 3 0 016 0z",
                },
                {
                  href: "#",
                  path: "M17.657 16.657L13.414 20.9a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z",
                },
              ].map((icon, i) => (
                <Link
                  key={i}
                  href={icon.href}
                  className="text-muted-foreground hover:text-emerald-500 transition-colors"
                >
                  <svg
                    className="h-5 w-5"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <path d={icon.path} />
                  </svg>
                </Link>
              ))}
            </div>
          </div>

          {/* Platform */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-foreground tracking-wide">
              Platform
            </h3>
            <ul className="space-y-2 text-sm">
              {[
                "Overview",
                "ESG Tracking",
                "Key Features",
                "Collaboration",
                "Dashboard",
              ].map((item, i) => (
                <li key={i}>
                  <Link
                    href="#"
                    className="text-muted-foreground hover:text-emerald-500 transition-colors"
                  >
                    {item}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-foreground tracking-wide">
              Company
            </h3>
            <ul className="space-y-2 text-sm">
              {[
                "About VerdePM",
                "Our Team",
                "Careers",
                "Insights & Updates",
                "Contact Us",
              ].map((item, i) => (
                <li key={i}>
                  <Link
                    href="#"
                    className="text-muted-foreground hover:text-emerald-500 transition-colors"
                  >
                    {item}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-foreground tracking-wide">
              Contact
            </h3>
            <ul className="space-y-3 text-sm text-muted-foreground">
              <li className="flex items-center space-x-2">
                <svg
                  className="h-4 w-4 flex-shrink-0 text-emerald-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                  />
                </svg>
                <span>hello@verdepm.com</span>
              </li>
              <li className="flex items-center space-x-2">
                <svg
                  className="h-4 w-4 flex-shrink-0 text-emerald-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                  />
                </svg>
                <span>+1 (555) 987-6543</span>
              </li>
              <li className="flex items-start space-x-2">
                <svg
                  className="h-4 w-4 mt-0.5 flex-shrink-0 text-emerald-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                </svg>
                <span>
                  45 Verde Avenue
                  <br />
                  San Francisco, CA 94105
                </span>
              </li>
            </ul>
          </div>
        </div>

        {/* Divider */}
        <div className="mt-16 border-t border-border pt-8" />

        {/* Bottom Section */}
        <div className="flex flex-col sm:flex-row justify-between items-center text-sm text-muted-foreground gap-4">
          <p>© {new Date().getFullYear()} VerdePM. All rights reserved.</p>
          <div className="flex flex-wrap justify-center gap-x-6 gap-y-2">
            {[
              "Privacy Policy",
              "Terms of Service",
              "Sustainability Policy",
            ].map((item, i) => (
              <Link
                key={i}
                href="#"
                className="hover:text-emerald-500 transition-colors"
              >
                {item}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
};
