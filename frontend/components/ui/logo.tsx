"use client";

import { cn } from "@/lib/utils";
import { Leaf } from "lucide-react";

export const Logo = ({ className }: { className?: string }) => {
  return (
    <div className={cn("flex items-center space-x-2", className)}>
      <div className="bg-green-600 rounded-lg p-2">
        <Leaf className="h-6 w-6 text-white" />
      </div>
      <span className="text-xl font-bold text-foreground">VerdePM</span>
    </div>
  );
};
