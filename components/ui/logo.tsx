import { cn } from "@/lib/utils";
import Image from "next/image";

export const Logo = ({
  className,
  showText = true,
}: {
  className?: string;
  showText?: boolean;
}) => {
  return (
    <div className={cn("flex items-center w-full", className)}>
      <div
        className={cn(
          "rounded-full overflow-hidden flex-shrink-0 transition-all duration-300",
          showText ? "w-10 h-10 ml-3" : "w-8 h-8"
        )}
      >
        <Image
          src="/logo.svg"
          alt="VerdePM Logo"
          width={60}
          height={60}
          className="w-full h-full object-contain"
        />
      </div>
      <span
        className={cn(
          "text-xl font-bold text-foreground transition-all duration-300 ease-in-out whitespace-nowrap",
          showText
            ? "opacity-100 max-w-[200px] ml-3"
            : "opacity-0 max-w-0 overflow-hidden ml-0"
        )}
        aria-hidden={!showText}
      >
        VerdePM
      </span>
    </div>
  );
};
