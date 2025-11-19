import type { ErrorDisplayProps } from "@/types/error";
import { cn } from "@/lib/utils";

export function ErrorDisplay({ title, message, className }: ErrorDisplayProps) {
  return (
    <div
      className={cn(
        "rounded-md border border-destructive bg-destructive/10 p-4 text-destructive-foreground",
        className
      )}
    >
      <h3 className="font-semibold">{title}</h3>
      {message && <p>{message}</p>}
    </div>
  );
}
