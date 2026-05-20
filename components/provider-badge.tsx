import { cn } from "@/lib/utils"

export function ProviderBadge({ isFree, className }: { isFree: boolean; className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-1.5 py-0.5 text-[10px] font-semibold",
        isFree
          ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400"
          : "bg-muted text-muted-foreground",
        className
      )}
    >
      {isFree ? "FREE" : "PAID"}
    </span>
  )
}
