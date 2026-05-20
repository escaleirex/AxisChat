"use client"

import type { HTMLAttributes } from "react"
import { cn } from "@/lib/utils"

export type SuggestionProps = Omit<HTMLAttributes<HTMLButtonElement>, "onClick" | "onSelect"> & {
  suggestion: string
  onSelect?: (suggestion: string) => void
}

export function Suggestion({
  suggestion,
  onSelect,
  className,
  ...props
}: SuggestionProps) {
  return (
    <button
      type="button"
      onClick={() => onSelect?.(suggestion)}
      className={cn(
        "shrink-0 rounded-full border bg-background px-3.5 py-1.5 text-sm text-foreground/80 transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
        className
      )}
      {...(props as React.ButtonHTMLAttributes<HTMLButtonElement>)}
    >
      {suggestion}
    </button>
  )
}

export type SuggestionsProps = Omit<HTMLAttributes<HTMLDivElement>, "onSelect"> & {
  suggestions: string[]
  onSelect: (suggestion: string) => void
}

export function Suggestions({
  suggestions,
  onSelect,
  className,
  ...props
}: SuggestionsProps) {
  return (
    <div
      className={cn(
        "flex flex-wrap justify-center gap-2 px-4",
        className
      )}
      {...props}
    >
      {suggestions.map((s) => (
        <Suggestion key={s} suggestion={s} onSelect={onSelect} />
      ))}
    </div>
  )
}
