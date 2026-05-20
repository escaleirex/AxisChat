"use client"

import { CheckCircle2Icon, CircleDashedIcon, CircleIcon } from "lucide-react"
import type { HTMLAttributes } from "react"
import { cn } from "@/lib/utils"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"

export type QueueProps = HTMLAttributes<HTMLDivElement>

export function Queue({ className, children, ...props }: QueueProps) {
  return (
    <div
      className={cn("rounded-lg border bg-card text-sm", className)}
      {...props}
    >
      {children}
    </div>
  )
}

export type QueueSectionProps = HTMLAttributes<HTMLDivElement> & {
  title: string
  defaultOpen?: boolean
  badge?: string | number
}

export function QueueSection({
  title,
  defaultOpen = true,
  badge,
  className,
  children,
  ...props
}: QueueSectionProps) {
  return (
    <div className={cn("border-b last:border-b-0", className)} {...props}>
      <Collapsible defaultOpen={defaultOpen}>
        <CollapsibleTrigger className="flex w-full items-center justify-between px-4 py-2.5 text-left hover:bg-muted/30">
          <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            {title}
          </span>
          {badge !== undefined && (
            <span className="rounded-full bg-muted px-2 py-0.5 text-xs font-medium">
              {badge}
            </span>
          )}
        </CollapsibleTrigger>
        <CollapsibleContent>
          <div className="divide-y">{children}</div>
        </CollapsibleContent>
      </Collapsible>
    </div>
  )
}

export type QueueItemProps = HTMLAttributes<HTMLDivElement> & {
  completed?: boolean
  label?: string
}

export function QueueItem({
  completed,
  label,
  className,
  children,
  ...props
}: QueueItemProps) {
  return (
    <div
      className={cn(
        "flex items-center gap-3 px-4 py-2 text-sm",
        completed && "opacity-60",
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}

export type QueueItemIndicatorProps = {
  completed?: boolean
  active?: boolean
  className?: string
}

export function QueueItemIndicator({
  completed,
  active,
  className,
}: QueueItemIndicatorProps) {
  if (completed) {
    return (
      <CheckCircle2Icon
        className={cn("size-4 shrink-0 text-green-500", className)}
      />
    )
  }
  if (active) {
    return (
      <CircleIcon
        className={cn("size-4 shrink-0 animate-pulse text-primary", className)}
      />
    )
  }
  return (
    <CircleDashedIcon
      className={cn("size-4 shrink-0 text-muted-foreground/50", className)}
    />
  )
}

export type QueueItemLabelProps = HTMLAttributes<HTMLSpanElement>

export function QueueItemLabel({ className, ...props }: QueueItemLabelProps) {
  return (
    <span
      className={cn("flex-1 truncate text-foreground/80", className)}
      {...props}
    />
  )
}

export type QueueItemMetaProps = HTMLAttributes<HTMLSpanElement>

export function QueueItemMeta({ className, ...props }: QueueItemMetaProps) {
  return (
    <span
      className={cn("shrink-0 text-xs text-muted-foreground", className)}
      {...props}
    />
  )
}
