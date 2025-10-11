"use client";

import { cn } from "@/lib/utils";

interface BackgroundProps {
  className?: string;
  variant?: "default" | "subtle" | "intense";
  children?: React.ReactNode;
}

export function Background({
  className,
  variant = "default",
  children,
}: BackgroundProps) {
  return (
    <div
      className={cn(
        "relative min-h-screen",
        variant === "default" &&
          "bg-gradient-to-br from-emerald-50/50 via-background to-emerald-50/30 dark:from-gray-950 dark:via-gray-900 dark:to-emerald-950/20",
        variant === "subtle" &&
          "bg-gradient-to-br from-emerald-50/30 via-background to-emerald-50/20 dark:from-gray-950/80 dark:via-gray-900/90 dark:to-emerald-950/10",
        variant === "intense" &&
          "bg-gradient-to-br from-emerald-50/70 via-background to-emerald-50/40 dark:from-gray-950 dark:via-gray-900 dark:to-emerald-950/30",
        className
      )}
    >
      {/* Background Design Elements */}
      <div className="fixed inset-0 -z-10">
        {/* Primary floating orb */}
        <div
          className={cn(
            "absolute top-10 sm:top-20 left-10 sm:left-20 rounded-full blur-2xl sm:blur-3xl animate-pulse",
            variant === "default" &&
              "w-40 h-40 sm:w-72 sm:h-72 bg-emerald-400/8 sm:bg-emerald-400/10",
            variant === "subtle" &&
              "w-32 h-32 sm:w-60 sm:h-60 bg-emerald-400/4 sm:bg-emerald-400/6",
            variant === "intense" &&
              "w-48 h-48 sm:w-80 sm:h-80 bg-emerald-400/10 sm:bg-emerald-400/15"
          )}
        ></div>

        {/* Secondary floating orb */}
        <div
          className={cn(
            "absolute bottom-10 sm:bottom-20 right-10 sm:right-20 rounded-full blur-2xl sm:blur-3xl animate-pulse delay-1000",
            variant === "default" &&
              "w-48 h-48 sm:w-96 sm:h-96 bg-emerald-500/6 sm:bg-emerald-500/8",
            variant === "subtle" &&
              "w-40 h-40 sm:w-80 sm:h-80 bg-emerald-500/3 sm:bg-emerald-500/5",
            variant === "intense" &&
              "w-56 h-56 sm:w-[420px] sm:h-[420px] bg-emerald-500/8 sm:bg-emerald-500/12"
          )}
        ></div>

        {/* Central gradient orb */}
        <div
          className={cn(
            "absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full blur-2xl sm:blur-3xl",
            variant === "default" &&
              "w-[300px] h-[300px] sm:w-[600px] sm:h-[600px] bg-gradient-to-r from-emerald-400/3 sm:from-emerald-400/5 to-emerald-600/3 sm:to-emerald-600/5",
            variant === "subtle" &&
              "w-[250px] h-[250px] sm:w-[500px] sm:h-[500px] bg-gradient-to-r from-emerald-400/2 sm:from-emerald-400/3 to-emerald-600/2 sm:to-emerald-600/3",
            variant === "intense" &&
              "w-[350px] h-[350px] sm:w-[700px] sm:h-[700px] bg-gradient-to-r from-emerald-400/5 sm:from-emerald-400/8 to-emerald-600/5 sm:to-emerald-600/8"
          )}
        ></div>

        {/* Additional subtle elements for depth */}
        <div
          className={cn(
            "absolute top-1/4 right-1/4 rounded-full blur-2xl animate-pulse delay-500",
            variant === "default" && "w-32 h-32 bg-emerald-300/5",
            variant === "subtle" && "w-24 h-24 bg-emerald-300/3",
            variant === "intense" && "w-40 h-40 bg-emerald-300/8"
          )}
        ></div>

        <div
          className={cn(
            "absolute bottom-1/4 left-1/4 rounded-full blur-2xl animate-pulse delay-2000",
            variant === "default" && "w-48 h-48 bg-emerald-600/4",
            variant === "subtle" && "w-36 h-36 bg-emerald-600/2",
            variant === "intense" && "w-56 h-56 bg-emerald-600/6"
          )}
        ></div>
      </div>

      {children}
    </div>
  );
}
