"use client"

import { ChevronDownIcon, ChevronRightIcon } from "lucide-react"
import type { HTMLAttributes } from "react"
import { useState } from "react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"

interface StackFrame {
  raw: string
  functionName: string
  filePath: string
  line: number | null
  column: number | null
  isInternal: boolean
}

function parseStackTrace(trace: string): StackFrame[] {
  return trace
    .split("\n")
    .filter((line) => line.trim().startsWith("at "))
    .map((line) => {
      const raw = line.trim()
      const isInternal =
        line.includes("node_modules") ||
        line.includes("node:internal") ||
        line.includes("<anonymous>")

      const fnMatch = raw.match(/^at (.+?) \((.+?):(\d+):(\d+)\)$/)
      if (fnMatch) {
        return {
          raw,
          functionName: fnMatch[1],
          filePath: fnMatch[2],
          line: parseInt(fnMatch[3]),
          column: parseInt(fnMatch[4]),
          isInternal,
        }
      }

      const fileMatch = raw.match(/^at (.+?):(\d+):(\d+)$/)
      if (fileMatch) {
        return {
          raw,
          functionName: "<anonymous>",
          filePath: fileMatch[1],
          line: parseInt(fileMatch[2]),
          column: parseInt(fileMatch[3]),
          isInternal,
        }
      }

      return {
        raw,
        functionName: raw.replace(/^at /, ""),
        filePath: "",
        line: null,
        column: null,
        isInternal,
      }
    })
}

export type StackTraceProps = HTMLAttributes<HTMLDivElement> & {
  trace: string
  defaultOpen?: boolean
  onOpenChange?: (open: boolean) => void
  onFilePathClick?: (filePath: string, line: number | null) => void
}

export function StackTrace({
  trace,
  defaultOpen = false,
  onOpenChange,
  onFilePathClick,
  className,
  ...props
}: StackTraceProps) {
  const [open, setOpen] = useState(defaultOpen)
  const [showInternal, setShowInternal] = useState(false)

  const lines = trace.split("\n")
  const errorLine = lines.find((l) => !l.trim().startsWith("at ")) ?? ""
  const frames = parseStackTrace(trace)
  const visibleFrames = showInternal
    ? frames
    : frames.filter((f) => !f.isInternal)
  const hiddenCount = frames.length - visibleFrames.length

  const handleOpenChange = (v: boolean) => {
    setOpen(v)
    onOpenChange?.(v)
  }

  return (
    <div
      className={cn("rounded-lg border bg-card font-mono text-xs", className)}
      {...props}
    >
      <Collapsible open={open} onOpenChange={handleOpenChange}>
        <CollapsibleTrigger className="flex w-full items-start gap-2 p-3 text-left hover:bg-muted/30">
          {open ? (
            <ChevronDownIcon className="mt-0.5 size-3.5 shrink-0 text-muted-foreground" />
          ) : (
            <ChevronRightIcon className="mt-0.5 size-3.5 shrink-0 text-muted-foreground" />
          )}
          <span className="font-medium text-destructive line-clamp-2">
            {errorLine || "Stack Trace"}
          </span>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <div className="border-t px-3 pb-3 pt-2">
            <StackTraceFrames
              frames={visibleFrames}
              onFilePathClick={onFilePathClick}
            />
            {hiddenCount > 0 && (
              <button
                type="button"
                onClick={() => setShowInternal(true)}
                className="mt-2 text-xs text-muted-foreground hover:text-foreground"
              >
                Show {hiddenCount} internal frame{hiddenCount !== 1 ? "s" : ""}
              </button>
            )}
          </div>
        </CollapsibleContent>
      </Collapsible>
    </div>
  )
}

export type StackTraceFramesProps = {
  frames: StackFrame[]
  showInternalFrames?: boolean
  onFilePathClick?: (filePath: string, line: number | null) => void
}

export function StackTraceFrames({
  frames,
  onFilePathClick,
}: StackTraceFramesProps) {
  return (
    <div className="space-y-0.5">
      {frames.map((frame, i) => (
        <div
          key={i}
          className={cn(
            "flex flex-col gap-0.5 rounded px-2 py-1",
            frame.isInternal ? "opacity-40" : "hover:bg-muted/50"
          )}
        >
          <span className="font-medium text-foreground">
            {frame.functionName}
          </span>
          {frame.filePath && (
            <button
              type="button"
              onClick={() => onFilePathClick?.(frame.filePath, frame.line)}
              className={cn(
                "text-left text-muted-foreground",
                onFilePathClick && "hover:text-foreground hover:underline"
              )}
            >
              {frame.filePath}
              {frame.line !== null && (
                <span className="text-muted-foreground/60">
                  :{frame.line}
                  {frame.column !== null && `:${frame.column}`}
                </span>
              )}
            </button>
          )}
        </div>
      ))}
    </div>
  )
}
