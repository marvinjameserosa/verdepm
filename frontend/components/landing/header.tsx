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

    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header>
      <nav
        data-state={menuState && "active"}
        className="fixed z-20 w-full px-2 group"
      >
        <div
          className={cn(
            "mx-auto mt-1 max-w-4xl px-4 transition-all duration-300 lg:px-8",
            isScrolled &&
              "bg-background/50 max-w-3xl rounded-2xl border backdrop-blur-lg lg:px-4"
          )}
        >
          <div className="relative flex flex-wrap items-center justify-between gap-6 py-3 lg:gap-0 lg:py-0">
            {/* Logo */}
            <div className="flex w-full justify-between lg:w-auto">
              <Link
                href="/"
                aria-label="home"
                className="flex items-center space-x-2"
              >
                <Logo />
              </Link>

              {/* Mobile Menu Button */}
              <button
                onClick={() => setMenuState(!menuState)}
                aria-label={menuState ? "Close Menu" : "Open Menu"}
                className="relative z-20 -m-2.5 -mr-4 block cursor-pointer p-2.5 lg:hidden"
              >
                <Menu className="in-data-[state=active]:rotate-180 group-data-[state=active]:scale-0 group-data-[state=active]:opacity-0 m-auto size-6 duration-200" />
                <X className="group-data-[state=active]:rotate-0 group-data-[state=active]:scale-100 group-data-[state=active]:opacity-100 absolute inset-0 m-auto size-6 -rotate-180 scale-0 opacity-0 duration-200" />
              </button>
            </div>

            {/* Desktop Menu */}
            <div className="absolute inset-0 m-auto hidden size-fit lg:block">
              <ul className="flex gap-8 text-sm">
                {menuItems.map((item, index) => (
                  <li key={index}>
                    <Link
                      href={item.href}
                      className="text-muted-foreground hover:text-green-700 transition-colors duration-150"
                    >
                      <span>{item.name}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Right Section (Buttons + Mobile Menu Items) */}
            <div className="bg-background group-data-[state=active]:block lg:group-data-[state=active]:flex mb-6 hidden w-full flex-wrap items-center justify-end space-y-8 rounded-3xl border p-6 shadow-2xl shadow-zinc-300/20 md:flex-nowrap lg:m-0 lg:flex lg:w-fit lg:gap-6 lg:space-y-0 lg:border-transparent lg:bg-transparent dark:shadow-none dark:lg:bg-transparent">
              {/* Mobile Menu Links */}
              <div className="lg:hidden">
                <ul className="space-y-6 text-base">
                  {menuItems.map((item, index) => (
                    <li key={index}>
                      <Link
                        href={item.href}
                        className="text-muted-foreground hover:text-green-700 block duration-150"
                      >
                        <span>{item.name}</span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Auth Buttons */}
              <div className="flex w-full flex-col space-y-3 sm:flex-row sm:gap-3 sm:space-y-0 md:w-fit">
                {/* Login */}
                <Button
                  variant="outline"
                  size="sm"
                  className={cn(
                    "border-green-600 text-green-700 hover:bg-green-50 hover:text-green-800 transition-colors duration-200",
                    isScrolled && "lg:hidden"
                  )}
                >
                  <span>Login</span>
                </Button>

                {/* Get Started */}
                <Button
                  size="sm"
                  className={cn(
                    "bg-green-600 hover:bg-green-700 text-white shadow-md transition-all duration-200 hover:shadow-lg hover:scale-[1.02]",
                    isScrolled ? "lg:inline-flex" : "hidden"
                  )}
                >
                  <span>Get Started</span>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </nav>
    </header>
  );
};
