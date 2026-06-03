import * as React from "react";
import { cn } from "@/lib/utils";

export function Button({ className, ...props }: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      className={cn(
        "inline-flex h-10 items-center justify-center rounded-md bg-zinc-50 px-4 py-2 text-sm font-medium text-zinc-950 transition hover:bg-zinc-200 disabled:opacity-50",
        className
      )}
      {...props}
    />
  );
}
