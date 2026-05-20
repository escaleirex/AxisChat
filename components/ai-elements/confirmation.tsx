"use client"

import { CheckIcon, XIcon } from "lucide-react"
import type { HTMLAttributes } from "react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

export type ConfirmationState = "pending" | "accepted" | "rejected"

export type ConfirmationProps = HTMLAttributes<HTMLDivElement> & {
  title: string
  description?: string
  state?: ConfirmationState
  onAccept?: () => void
  onReject?: () => void
}

export function Confirmation({
  title,
  description,
  state = "pending",
  onAccept,
  onReject,
  className,
  ...props
}: ConfirmationProps) {
  return (
    <div
      className={cn(
        "rounded-lg border p-4 text-sm",
        state === "accepted" && "border-green-500/30 bg-green-500/5",
        state === "rejected" && "border-destructive/30 bg-destructive/5",
        state === "pending" && "border-border bg-card",
        className
      )}
      {...props}
    >
      <div className="flex items-start gap-3">
        <div
          className={cn(
            "flex size-7 shrink-0 items-center justify-center rounded-full",
            state === "accepted" && "bg-green-500/20",
            state === "rejected" && "bg-destructive/20",
            state === "pending" && "bg-muted"
          )}
        >
          {state === "accepted" ? (
            <CheckIcon className="size-3.5 text-green-600 dark:text-green-400" />
          ) : state === "rejected" ? (
            <XIcon className="size-3.5 text-destructive" />
          ) : (
            <span className="size-2 rounded-full bg-muted-foreground/60" />
          )}
        </div>
        <div className="flex-1">
          <p className="font-medium">{title}</p>
          {description && (
            <p className="mt-0.5 text-xs text-muted-foreground">{description}</p>
          )}
          {state === "pending" && (onAccept || onReject) && (
            <div className="mt-3 flex gap-2">
              {onAccept && (
                <Button size="sm" onClick={onAccept} className="gap-1.5">
                  <CheckIcon className="size-3.5" />
                  Approve
                </Button>
              )}
              {onReject && (
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={onReject}
                  className="gap-1.5"
                >
                  <XIcon className="size-3.5" />
                  Reject
                </Button>
              )}
            </div>
          )}
          {state === "accepted" && (
            <p className="mt-1 text-xs font-medium text-green-600 dark:text-green-400">
              Approved
            </p>
          )}
          {state === "rejected" && (
            <p className="mt-1 text-xs font-medium text-destructive">
              Rejected
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
