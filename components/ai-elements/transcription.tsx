"use client"

import type { HTMLAttributes } from "react"
import { useCallback } from "react"
import { cn } from "@/lib/utils"

export type TranscriptionSegment = {
  id?: string
  text: string
  startSecond: number
  endSecond: number
}

export type TranscriptionProps = HTMLAttributes<HTMLDivElement> & {
  segments: TranscriptionSegment[]
  currentTime?: number
  onSeek?: (time: number) => void
}

export function Transcription({
  segments,
  currentTime = 0,
  onSeek,
  className,
  ...props
}: TranscriptionProps) {
  const filtered = segments.filter((s) => s.text.trim())

  if (filtered.length === 0) return null

  return (
    <div
      className={cn(
        "max-h-48 overflow-y-auto rounded-lg border bg-card p-3 text-sm",
        className
      )}
      {...props}
    >
      <div className="space-y-1">
        {filtered.map((segment, i) => (
          <TranscriptionSegmentItem
            key={segment.id ?? i}
            segment={segment}
            isActive={
              currentTime >= segment.startSecond &&
              currentTime < segment.endSecond
            }
            onSeek={onSeek}
          />
        ))}
      </div>
    </div>
  )
}

type TranscriptionSegmentItemProps = {
  segment: TranscriptionSegment
  isActive: boolean
  onSeek?: (time: number) => void
}

function TranscriptionSegmentItem({
  segment,
  isActive,
  onSeek,
}: TranscriptionSegmentItemProps) {
  const handleClick = useCallback(() => {
    onSeek?.(segment.startSecond)
  }, [onSeek, segment.startSecond])

  return (
    <span
      data-active={isActive || undefined}
      data-start={segment.startSecond}
      data-end={segment.endSecond}
      onClick={onSeek ? handleClick : undefined}
      className={cn(
        "inline cursor-pointer rounded px-0.5 py-px transition-colors",
        isActive
          ? "bg-primary/20 text-foreground"
          : "text-foreground/70 hover:bg-muted hover:text-foreground",
        onSeek && "cursor-pointer"
      )}
    >
      {segment.text}{" "}
    </span>
  )
}
