"use client"

import {
  ChevronDownIcon,
  ChevronRightIcon,
  WrenchIcon,
} from "lucide-react"
import type { HTMLAttributes } from "react"
import { useState } from "react"
import { cn } from "@/lib/utils"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"

export type ToolCallStatus = "pending" | "running" | "complete" | "error"

export type ToolProps = HTMLAttributes<HTMLDivElement> & {
  name: string
  args?: Record<string, unknown>
  result?: unknown
  status?: ToolCallStatus
  defaultOpen?: boolean
}

export function Tool({
  name,
  args,
  result,
  status = "complete",
  defaultOpen = false,
  className,
  ...props
}: ToolProps) {
  const hasDetails = args !== undefined || result !== undefined

  return (
    <div
      className={cn(
        "rounded-lg border bg-card text-sm",
        className
      )}
      {...props}
    >
      <Collapsible defaultOpen={defaultOpen}>
        <CollapsibleTrigger
          className={cn(
            "flex w-full items-center gap-2 px-3 py-2 text-left hover:bg-muted/30",
            !hasDetails && "cursor-default hover:bg-transparent"
          )}
          disabled={!hasDetails}
        >
          <ToolStatusIndicator status={status} />
          <WrenchIcon className="size-3.5 shrink-0 text-muted-foreground" />
          <span className="flex-1 font-mono text-xs font-medium">{name}</span>
          {hasDetails && (
            <ChevronRightIcon className="size-3.5 shrink-0 text-muted-foreground transition-transform [[data-panel-open]>&]:rotate-90" />
          )}
        </CollapsibleTrigger>
        {hasDetails && (
          <CollapsibleContent>
            <div className="divide-y border-t">
              {args !== undefined && (
                <ToolSection label="Arguments">
                  <pre className="overflow-x-auto text-xs text-foreground/80">
                    {JSON.stringify(args, null, 2)}
                  </pre>
                </ToolSection>
              )}
              {result !== undefined && (
                <ToolSection label="Result">
                  <pre className="overflow-x-auto text-xs text-foreground/80">
                    {typeof result === "string"
                      ? result
                      : JSON.stringify(result, null, 2)}
                  </pre>
                </ToolSection>
              )}
            </div>
          </CollapsibleContent>
        )}
      </Collapsible>
    </div>
  )
}

function ToolSection({
  label,
  children,
}: {
  label: string
  children: React.ReactNode
}) {
  return (
    <div className="px-3 py-2">
      <h5 className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        {label}
      </h5>
      <div className="rounded-md bg-muted/50 p-2">{children}</div>
    </div>
  )
}

function ToolStatusIndicator({ status }: { status: ToolCallStatus }) {
  const colors: Record<ToolCallStatus, string> = {
    pending: "bg-muted-foreground/30",
    running: "animate-pulse bg-primary",
    complete: "bg-green-500",
    error: "bg-destructive",
  }
  return (
    <span
      className={cn("size-1.5 shrink-0 rounded-full", colors[status])}
      title={status}
    />
  )
}
