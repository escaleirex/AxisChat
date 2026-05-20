"use client"

import type { HTMLAttributes } from "react"
import { cn } from "@/lib/utils"
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card"

export type LanguageModelUsage = {
  promptTokens: number
  completionTokens: number
  totalTokens?: number
}

export type ContextProps = HTMLAttributes<HTMLDivElement> & {
  usedTokens: number
  maxTokens: number
  usage?: LanguageModelUsage
}

export function Context({
  usedTokens,
  maxTokens,
  usage,
  className,
  ...props
}: ContextProps) {
  const percentage = Math.min(usedTokens / maxTokens, 1)
  const trigger = <ContextRing percentage={percentage} className={className} {...props} />

  if (!usage) return trigger

  return (
    <HoverCard>
      <HoverCardTrigger render={trigger} />
      <HoverCardContent side="top" className="w-52">
        <ContextDetails usedTokens={usedTokens} maxTokens={maxTokens} usage={usage} />
      </HoverCardContent>
    </HoverCard>
  )
}

export type ContextRingProps = HTMLAttributes<HTMLDivElement> & {
  percentage: number
}

export function ContextRing({ percentage, className, ...props }: ContextRingProps) {
  const size = 20
  const stroke = 2.5
  const r = (size - stroke) / 2
  const circumference = 2 * Math.PI * r
  const dash = circumference * percentage

  const color =
    percentage > 0.9
      ? "text-destructive"
      : percentage > 0.75
      ? "text-yellow-500"
      : "text-muted-foreground"

  return (
    <div
      className={cn("flex cursor-default items-center gap-1", className)}
      title={`${Math.round(percentage * 100)}% context used`}
      {...props}
    >
      <svg width={size} height={size} className={cn("shrink-0 -rotate-90", color)}>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          strokeWidth={stroke}
          className="stroke-current opacity-20"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          strokeWidth={stroke}
          strokeDasharray={`${dash} ${circumference - dash}`}
          strokeLinecap="round"
          className="stroke-current transition-all duration-300"
        />
      </svg>
    </div>
  )
}

function ContextDetails({
  usedTokens,
  maxTokens,
  usage,
}: {
  usedTokens: number
  maxTokens: number
  usage: LanguageModelUsage
}) {
  const rows = [
    { label: "Prompt", value: usage.promptTokens },
    { label: "Completion", value: usage.completionTokens },
    { label: "Total used", value: usedTokens, bold: true },
    { label: "Context limit", value: maxTokens },
  ]

  return (
    <div className="space-y-1.5">
      <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        Token Usage
      </p>
      <div className="space-y-1">
        {rows.map((r) => (
          <div key={r.label} className="flex items-center justify-between gap-4 text-xs">
            <span className="text-muted-foreground">{r.label}</span>
            <span className={cn("font-mono", r.bold && "font-semibold text-foreground")}>
              {r.value.toLocaleString()}
            </span>
          </div>
        ))}
      </div>
      <div className="mt-2 h-1.5 rounded-full bg-muted">
        <div
          className={cn(
            "h-full rounded-full transition-all",
            usedTokens / maxTokens > 0.9
              ? "bg-destructive"
              : usedTokens / maxTokens > 0.75
              ? "bg-yellow-500"
              : "bg-primary"
          )}
          style={{ width: `${Math.min((usedTokens / maxTokens) * 100, 100)}%` }}
        />
      </div>
    </div>
  )
}
