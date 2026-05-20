"use client"

import { BookmarkIcon, BookmarkPlusIcon, HistoryIcon } from "lucide-react"
import type { HTMLAttributes } from "react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

export type CheckpointData = {
  id: string
  label?: string
  createdAt: Date
  messageIndex: number
}

export type CheckpointTriggerProps = HTMLAttributes<HTMLButtonElement> & {
  tooltip?: string
  onSave?: () => void
}

export function CheckpointTrigger({
  tooltip = "Save checkpoint",
  onSave,
  className,
  ...props
}: CheckpointTriggerProps) {
  const btn = (
    <Button
      variant="ghost"
      size="icon-xs"
      onClick={onSave}
      className={cn(className)}
      {...(props as Parameters<typeof Button>[0])}
    >
      <BookmarkPlusIcon className="size-3.5" />
      <span className="sr-only">{tooltip}</span>
    </Button>
  )

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger render={btn} />
        <TooltipContent>{tooltip}</TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}

export type CheckpointIconProps = {
  active?: boolean
  className?: string
}

export function CheckpointIcon({ active, className }: CheckpointIconProps) {
  return active ? (
    <BookmarkIcon className={cn("size-4 fill-current text-primary", className)} />
  ) : (
    <BookmarkIcon className={cn("size-4 text-muted-foreground", className)} />
  )
}

export type CheckpointListProps = HTMLAttributes<HTMLDivElement> & {
  checkpoints: CheckpointData[]
  onRestore?: (checkpoint: CheckpointData) => void
}

export function CheckpointList({
  checkpoints,
  onRestore,
  className,
  ...props
}: CheckpointListProps) {
  if (checkpoints.length === 0) return null

  return (
    <div
      className={cn("rounded-lg border bg-card text-sm", className)}
      {...props}
    >
      <div className="flex items-center gap-2 border-b px-3 py-2">
        <HistoryIcon className="size-3.5 text-muted-foreground" />
        <span className="text-xs font-medium text-muted-foreground">
          Checkpoints
        </span>
      </div>
      <div className="divide-y">
        {checkpoints.map((cp) => (
          <button
            key={cp.id}
            type="button"
            onClick={() => onRestore?.(cp)}
            className="flex w-full items-center gap-2 px-3 py-2 text-left text-xs hover:bg-muted/50 transition-colors"
          >
            <BookmarkIcon className="size-3.5 shrink-0 text-primary" />
            <span className="flex-1 truncate">
              {cp.label ?? `Message ${cp.messageIndex + 1}`}
            </span>
            <time
              dateTime={cp.createdAt.toISOString()}
              className="shrink-0 text-muted-foreground"
            >
              {cp.createdAt.toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </time>
          </button>
        ))}
      </div>
    </div>
  )
}
