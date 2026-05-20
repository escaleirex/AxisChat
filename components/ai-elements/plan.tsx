"use client"

import {
  CheckCircle2Icon,
  ChevronDownIcon,
  ChevronRightIcon,
  CircleDashedIcon,
  ListTodoIcon,
  LoaderCircleIcon,
} from "lucide-react"
import type { HTMLAttributes, ReactNode } from "react"
import { cn } from "@/lib/utils"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import { Shimmer } from "./shimmer"

export type PlanStepStatus = "complete" | "active" | "pending"

export type PlanProps = HTMLAttributes<HTMLDivElement> & {
  isStreaming?: boolean
  open?: boolean
  defaultOpen?: boolean
  onOpenChange?: (open: boolean) => void
  title?: string
}

export function Plan({
  isStreaming = false,
  open,
  defaultOpen = true,
  onOpenChange,
  title = "Plan",
  className,
  children,
  ...props
}: PlanProps) {
  return (
    <div
      className={cn("rounded-lg border bg-card text-sm", className)}
      {...props}
    >
      <Collapsible open={open} defaultOpen={defaultOpen} onOpenChange={onOpenChange}>
        <CollapsibleTrigger className="flex w-full items-center gap-2.5 px-4 py-3 text-left hover:bg-muted/30">
          <ListTodoIcon className="size-4 shrink-0 text-muted-foreground" />
          <span className="flex-1 font-medium">
            {isStreaming ? <Shimmer>{title}</Shimmer> : title}
          </span>
          <ChevronDownIcon className="size-4 shrink-0 text-muted-foreground transition-transform [[data-panel-closed]>&]:rotate-[-90deg]" />
        </CollapsibleTrigger>
        <CollapsibleContent>
          <div className="border-t px-4 py-3">
            <ul className="space-y-2">{children}</ul>
          </div>
        </CollapsibleContent>
      </Collapsible>
    </div>
  )
}

export type PlanStepProps = HTMLAttributes<HTMLLIElement> & {
  status?: PlanStepStatus
  icon?: ReactNode
}

export function PlanStep({
  status = "pending",
  icon,
  className,
  children,
  ...props
}: PlanStepProps) {
  return (
    <li
      className={cn(
        "flex items-start gap-2.5 text-sm",
        status === "pending" && "opacity-50",
        className
      )}
      {...props}
    >
      <span className="mt-0.5 shrink-0">
        {icon ?? <PlanStepStatusIcon status={status} />}
      </span>
      <span
        className={cn(
          status === "complete" && "text-foreground/60 line-through",
          status === "active" && "font-medium"
        )}
      >
        {children}
      </span>
    </li>
  )
}

function PlanStepStatusIcon({ status }: { status: PlanStepStatus }) {
  switch (status) {
    case "complete":
      return <CheckCircle2Icon className="size-4 text-green-500" />
    case "active":
      return <LoaderCircleIcon className="size-4 animate-spin text-primary" />
    case "pending":
      return <CircleDashedIcon className="size-4 text-muted-foreground/40" />
  }
}

export type PlanHeaderProps = HTMLAttributes<HTMLDivElement> & {
  isStreaming?: boolean
}

export function PlanHeader({
  isStreaming = false,
  className,
  children,
  ...props
}: PlanHeaderProps) {
  return (
    <div
      className={cn(
        "mb-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground",
        className
      )}
      {...props}
    >
      {isStreaming ? <Shimmer>{String(children)}</Shimmer> : children}
    </div>
  )
}
