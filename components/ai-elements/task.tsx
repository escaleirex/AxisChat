"use client"

import {
  CheckCircle2Icon,
  ChevronDownIcon,
  CircleDashedIcon,
  CircleXIcon,
  ClipboardListIcon,
  LoaderCircleIcon,
} from "lucide-react"
import type { HTMLAttributes } from "react"
import { cn } from "@/lib/utils"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import { Shimmer } from "./shimmer"

export type TaskStatus = "pending" | "running" | "complete" | "failed"

export type TaskProps = HTMLAttributes<HTMLDivElement> & {
  defaultOpen?: boolean
}

export function Task({
  defaultOpen = true,
  className,
  children,
  ...props
}: TaskProps) {
  return (
    <div
      className={cn("rounded-lg border bg-card text-sm", className)}
      {...props}
    >
      <Collapsible defaultOpen={defaultOpen}>
        <CollapsibleTrigger className="flex w-full items-center gap-2.5 px-4 py-3 text-left hover:bg-muted/30">
          <ClipboardListIcon className="size-4 shrink-0 text-muted-foreground" />
          <span className="flex-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Tasks
          </span>
          <ChevronDownIcon className="size-4 shrink-0 text-muted-foreground transition-transform [[data-panel-closed]>&]:rotate-[-90deg]" />
        </CollapsibleTrigger>
        <CollapsibleContent>
          <div className="divide-y border-t">{children}</div>
        </CollapsibleContent>
      </Collapsible>
    </div>
  )
}

export type TaskTriggerProps = HTMLAttributes<HTMLDivElement> & {
  title: string
  status?: TaskStatus
}

export function TaskTrigger({
  title,
  status = "pending",
  className,
  children,
  ...props
}: TaskTriggerProps) {
  return (
    <div
      className={cn(
        "flex items-center gap-3 px-4 py-2.5",
        className
      )}
      {...props}
    >
      <TaskStatusIcon status={status} className="size-4 shrink-0" />
      <span
        className={cn(
          "flex-1 font-medium",
          status === "running" && "text-foreground",
          status === "complete" && "text-foreground/60",
          status === "failed" && "text-destructive",
          status === "pending" && "text-muted-foreground"
        )}
      >
        {status === "running" ? <Shimmer>{title}</Shimmer> : title}
      </span>
      {children}
    </div>
  )
}

export type TaskItemProps = HTMLAttributes<HTMLDivElement> & {
  label: string
  status?: TaskStatus
  description?: string
}

export function TaskItem({
  label,
  status = "pending",
  description,
  className,
  ...props
}: TaskItemProps) {
  return (
    <div
      className={cn(
        "flex items-start gap-3 px-4 py-2 text-xs",
        status === "pending" && "opacity-50",
        className
      )}
      {...props}
    >
      <TaskStatusIcon status={status} className="mt-0.5 size-3.5 shrink-0" />
      <div className="flex-1">
        <p
          className={cn(
            status === "complete" && "text-foreground/60",
            status === "failed" && "text-destructive",
            status === "running" && "font-medium"
          )}
        >
          {label}
        </p>
        {description && (
          <p className="mt-0.5 text-muted-foreground">{description}</p>
        )}
      </div>
    </div>
  )
}

function TaskStatusIcon({
  status,
  className,
}: {
  status: TaskStatus
  className?: string
}) {
  switch (status) {
    case "pending":
      return (
        <CircleDashedIcon className={cn("text-muted-foreground/50", className)} />
      )
    case "running":
      return (
        <LoaderCircleIcon className={cn("animate-spin text-primary", className)} />
      )
    case "complete":
      return <CheckCircle2Icon className={cn("text-green-500", className)} />
    case "failed":
      return <CircleXIcon className={cn("text-destructive", className)} />
  }
}
