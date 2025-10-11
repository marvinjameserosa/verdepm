import { cn } from "@/lib/utils";
import Image from "next/image";

export const Logo = ({ className }: { className?: string }) => {
  return (
    <div className={cn("flex items-center space-x-2", className)}>
      {/* Change this div to be fully rounded */}
      <div className="rounded-2xl overflow-hidden">
        <Image
          src="/logo.svg"
          alt="VerdePM Logo"
          width={60}
          height={60}
          className="w-10 h-10 object-contain"
        />
      </div>
      <span className="text-xl font-bold text-foreground">VerdePM</span>
    </div>
  );
};
