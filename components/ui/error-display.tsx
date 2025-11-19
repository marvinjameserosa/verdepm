import type { ErrorDisplayProps } from "@/types/error";

export function ErrorDisplay({ title, message }: ErrorDisplayProps) {
  return (
    <div className="rounded-md border border-destructive bg-destructive/10 p-4 text-destructive-foreground">
      <h3 className="font-semibold">{title}</h3>
      {message && <p>{message}</p>}
    </div>
  );
}
