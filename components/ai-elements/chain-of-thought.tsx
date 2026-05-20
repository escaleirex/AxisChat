"use client"

import {
  CheckCircle2Icon,
  ChevronDownIcon,
  ChevronRightIcon,
  CircleDashedIcon,
  LoaderCircleIcon,
} from "lucide-react"
import type { HTMLAttributes, ReactNode } from "react"
import { createContext, useContext, useState } from "react"
import { cn } from "@/lib/utils"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import { Shimmer } from "./shimmer"

export type ChainOfThoughtStatus = "complete" | "active" | "pending"

interface ChainOfThoughtContextValue {
  isStreaming: boolean
}

const ChainOfThoughtContext = createContext<ChainOfThoughtContextValue>({
  isStreaming: false,
})

export type ChainOfThoughtProps = HTMLAttributes<HTMLDivElement> & {
  isStreaming?: boolean
  open?: boolean
  defaultOpen?: boolean
  onOpenChange?: (open: boolean) => void
}

export function ChainOfThought({
  isStreaming = false,
  open,
  defaultOpen = true,
  onOpenChange,
  className,
  children,
  ...props
}: ChainOfThoughtProps) {
  return (
    <ChainOfThoughtContext.Provider value={{ isStreaming }}>
      <div
        className={cn("rounded-lg border bg-card text-sm", className)}
        {...props}
      >
        <Collapsible
          open={open}
          defaultOpen={defaultOpen}
          onOpenChange={onOpenChange}
        >
          <ChainOfThoughtTrigger isStreaming={isStreaming} />
          <CollapsibleContent>
            <div className="divide-y border-t">{children}</div>
          </CollapsibleContent>
        </Collapsible>
      </div>
    </ChainOfThoughtContext.Provider>
  )
}

function ChainOfThoughtTrigger({ isStreaming }: { isStreaming: boolean }) {
  return (
    <CollapsibleTrigger className="flex w-full items-center gap-2 px-4 py-3 text-left hover:bg-muted/30 [&[data-panel-open]>svg:first-child]:rotate-0">
      <ChevronRightIcon className="size-4 shrink-0 text-muted-foreground transition-transform [[data-panel-open]>&]:rotate-90" />
      {isStreaming ? (
        <Shimmer className="text-sm font-medium">Thinking...</Shimmer>
      ) : (
        <span className="text-sm font-medium text-muted-foreground">
          Chain of thought
        </span>
      )}
    </CollapsibleTrigger>
  )
}

export type ChainOfThoughtStepProps = HTMLAttributes<HTMLDivElement> & {
  icon?: ReactNode
  label: string
  description?: string
  status?: ChainOfThoughtStatus
}

export function ChainOfThoughtStep({
  icon,
  label,
  description,
  status = "pending",
  className,
  children,
  ...props
}: ChainOfThoughtStepProps) {
  return (
    <div
      className={cn(
        "flex items-start gap-3 px-4 py-3",
        status === "pending" && "opacity-40",
        className
      )}
      {...props}
    >
      <div className="mt-0.5 flex size-5 shrink-0 items-center justify-center">
        {icon ?? <ChainOfThoughtStatusIcon status={status} />}
      </div>
      <div className="flex-1">
        <p
          className={cn(
            "font-medium",
            status === "active" && "text-foreground",
            status === "complete" && "text-foreground/70",
            status === "pending" && "text-muted-foreground"
          )}
        >
          {status === "active" ? (
            <Shimmer>{label}</Shimmer>
          ) : (
            label
          )}
        </p>
        {description && (
          <p className="mt-0.5 text-xs text-muted-foreground">{description}</p>
        )}
        {children}
      </div>
    </div>
  )
}

function ChainOfThoughtStatusIcon({ status }: { status: ChainOfThoughtStatus }) {
  switch (status) {
    case "complete":
      return <CheckCircle2Icon className="size-4 text-green-500" />
    case "active":
      return <LoaderCircleIcon className="size-4 animate-spin text-primary" />
    case "pending":
      return <CircleDashedIcon className="size-4 text-muted-foreground/50" />
  }
}
