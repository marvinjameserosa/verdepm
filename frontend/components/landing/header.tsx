"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Menu, X } from "lucide-react";
import { Logo } from "@/components/ui/logo";
import Link from "next/link";

const menuItems = [
  { name: "Services", href: "#services" },
  { name: "Solutions", href: "#solutions" },
  { name: "About", href: "#about" },
  { name: "Contact", href: "#contact" },
];

export const Header = () => {
  const [menuState, setMenuState] = React.useState(false);
  const [isScrolled, setIsScrolled] = React.useState(false);

  React.useEffect(() => {
    if (typeof window === "undefined") return;
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header>
      <nav
        data-state={menuState && "active"}
        className="fixed z-30 w-full px-2 transition-all duration-300 group"
      >
        <div
          className={cn(
            "mx-auto mt-2 max-w-6xl px-4 transition-all duration-300 lg:px-8",
            isScrolled
              ? "bg-emerald-950/70 backdrop-blur-2xl border border-emerald-800/60 rounded-2xl shadow-lg shadow-emerald-900/40"
              : "bg-transparent"
          )}
        >
          <div className="relative flex flex-wrap items-center justify-between gap-6 py-3 lg:gap-0 lg:py-2">
            <div className="flex w-full justify-between lg:w-auto">
              <Link
                href="/"
                aria-label="home"
                className="flex items-center space-x-2"
              >
                <Logo />
              </Link>

              <button
                onClick={() => setMenuState(!menuState)}
                aria-label={menuState ? "Close Menu" : "Open Menu"}
                className="relative z-20 -m-2.5 -mr-4 block cursor-pointer p-2.5 lg:hidden"
              >
                <Menu className="m-auto size-6 text-emerald-300 transition-all duration-200 group-data-[state=active]:opacity-0 group-data-[state=active]:scale-0" />
                <X className="absolute inset-0 m-auto size-6 text-emerald-300 opacity-0 scale-0 transition-all duration-200 group-data-[state=active]:opacity-100 group-data-[state=active]:scale-100" />
              </button>
            </div>

            <div className="absolute inset-0 m-auto hidden size-fit lg:block">
              <ul className="flex gap-10 text-sm font-medium">
                {menuItems.map((item, index) => (
                  <li key={index}>
                    <Link
                      href={item.href}
                      className="relative text-gray-200 transition-all duration-150 hover:text-emerald-400 after:absolute after:bottom-[-4px] after:left-0 after:h-[2px] after:w-0 after:bg-emerald-400 after:transition-all after:duration-300 hover:after:w-full"
                    >
                      {item.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-emerald-950/95 group-data-[state=active]:block lg:group-data-[state=active]:flex mb-6 hidden w-full flex-wrap items-center justify-end space-y-8 rounded-3xl border border-emerald-800/60 p-6 shadow-xl md:flex-nowrap lg:m-0 lg:flex lg:w-fit lg:gap-6 lg:space-y-0 lg:border-transparent lg:bg-transparent">
              <div className="lg:hidden">
                <ul className="space-y-6 text-base">
                  {menuItems.map((item, index) => (
                    <li key={index}>
                      <Link
                        href={item.href}
                        className="text-gray-200 hover:text-emerald-400 block duration-150"
                      >
                        {item.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="flex w-full flex-col space-y-3 sm:flex-row sm:gap-3 sm:space-y-0 md:w-fit">
                <Button
                  asChild
                  variant="outline"
                  size="sm"
                  className={cn(
                    "border-emerald-500 text-emerald-400 hover:bg-emerald-500/10 hover:text-emerald-300 transition-colors duration-200",
                    isScrolled && "lg:hidden"
                  )}
                >
                  <Link href="/login">Login</Link>
                </Button>

                <Button
                  size="sm"
                  className={cn(
                    "bg-gradient-to-r from-emerald-500 via-green-500 to-lime-400 hover:from-emerald-600 hover:via-green-500 hover:to-lime-500 text-black font-semibold shadow-md transition-all duration-200 hover:shadow-[0_0_20px_rgba(52,211,153,0.4)] hover:scale-[1.03]",
                    isScrolled ? "lg:inline-flex" : "hidden"
                  )}
                >
                  Get Started
                </Button>
              </div>
            </div>
          </div>
        </div>

        <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-emerald-400/40 to-transparent opacity-70" />
      </nav>
    </header>
  );
};
