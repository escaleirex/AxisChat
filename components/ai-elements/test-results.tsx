"use client"

import {
  CheckCircle2Icon,
  CircleDashedIcon,
  CircleXIcon,
  ClockIcon,
  LoaderCircleIcon,
} from "lucide-react"
import type { HTMLAttributes } from "react"
import { cn } from "@/lib/utils"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"

export type TestStatus = "passed" | "failed" | "skipped" | "running"

export type TestResultsSummary = {
  passed: number
  failed: number
  skipped: number
  total: number
  duration?: number
}

export type TestResultsProps = HTMLAttributes<HTMLDivElement> & {
  summary: TestResultsSummary
}

export function TestResults({ summary, className, children, ...props }: TestResultsProps) {
  const { passed, failed, skipped, total, duration } = summary
  const allPassed = failed === 0 && total > 0

  return (
    <div
      className={cn("rounded-lg border bg-card text-sm", className)}
      {...props}
    >
      <div className="flex items-center justify-between border-b px-4 py-2.5">
        <div className="flex items-center gap-3">
          {allPassed ? (
            <CheckCircle2Icon className="size-4 text-green-500" />
          ) : (
            <CircleXIcon className="size-4 text-destructive" />
          )}
          <span className="font-medium">
            {allPassed ? "All tests passed" : `${failed} test${failed !== 1 ? "s" : ""} failed`}
          </span>
        </div>
        <div className="flex items-center gap-3 text-xs text-muted-foreground">
          {duration !== undefined && (
            <span className="flex items-center gap-1">
              <ClockIcon className="size-3" />
              {duration < 1000
                ? `${duration}ms`
                : `${(duration / 1000).toFixed(2)}s`}
            </span>
          )}
          <span className="text-green-500">{passed} passed</span>
          {failed > 0 && (
            <span className="text-destructive">{failed} failed</span>
          )}
          {skipped > 0 && (
            <span className="text-yellow-500">{skipped} skipped</span>
          )}
          <span>{total} total</span>
        </div>
      </div>
      <div className="divide-y">{children}</div>
    </div>
  )
}

export type TestSuiteProps = HTMLAttributes<HTMLDivElement> & {
  name: string
  status: TestStatus
  defaultOpen?: boolean
}

export function TestSuite({
  name,
  status,
  defaultOpen = status === "failed",
  className,
  children,
  ...props
}: TestSuiteProps) {
  return (
    <div className={cn(className)} {...props}>
      <Collapsible defaultOpen={defaultOpen}>
        <CollapsibleTrigger className="flex w-full items-center gap-2 px-4 py-2 text-left text-sm hover:bg-muted/30">
          <TestStatusIcon status={status} className="size-3.5 shrink-0" />
          <span className="flex-1 font-medium">{name}</span>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <div className="divide-y border-t bg-muted/20">{children}</div>
        </CollapsibleContent>
      </Collapsible>
    </div>
  )
}

export type TestItemProps = HTMLAttributes<HTMLDivElement> & {
  name: string
  status: TestStatus
  duration?: number
  error?: string
}

export function TestItem({
  name,
  status,
  duration,
  error,
  className,
  ...props
}: TestItemProps) {
  return (
    <div
      className={cn("px-4 py-1.5 text-xs", className)}
      {...props}
    >
      <div className="flex items-center gap-2">
        <TestStatusIcon status={status} className="size-3 shrink-0" />
        <span
          className={cn(
            "flex-1 truncate",
            status === "failed" ? "text-destructive" : "text-foreground/80"
          )}
        >
          {name}
        </span>
        {duration !== undefined && (
          <span className="shrink-0 text-muted-foreground">
            {duration < 1000 ? `${duration}ms` : `${(duration / 1000).toFixed(2)}s`}
          </span>
        )}
      </div>
      {error && (
        <pre className="mt-1.5 rounded bg-destructive/10 p-2 text-xs text-destructive overflow-x-auto whitespace-pre-wrap">
          {error}
        </pre>
      )}
    </div>
  )
}

function TestStatusIcon({
  status,
  className,
}: {
  status: TestStatus
  className?: string
}) {
  switch (status) {
    case "passed":
      return <CheckCircle2Icon className={cn("text-green-500", className)} />
    case "failed":
      return <CircleXIcon className={cn("text-destructive", className)} />
    case "skipped":
      return <CircleDashedIcon className={cn("text-yellow-500", className)} />
    case "running":
      return (
        <LoaderCircleIcon className={cn("animate-spin text-blue-500", className)} />
      )
  }
}
