"use client"

import { TrashIcon } from "lucide-react"
import type { HTMLAttributes } from "react"
import { useEffect, useRef } from "react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

// ANSI color map: [fg, bg] (30-37 fg, 40-47 bg, 90-97 bright fg)
const ANSI_FG: Record<number, string> = {
  30: "text-[#1c1c1c] dark:text-[#4c4c4c]",
  31: "text-red-500",
  32: "text-green-500",
  33: "text-yellow-500",
  34: "text-blue-500",
  35: "text-purple-500",
  36: "text-cyan-500",
  37: "text-gray-200",
  90: "text-gray-500",
  91: "text-red-400",
  92: "text-green-400",
  93: "text-yellow-400",
  94: "text-blue-400",
  95: "text-purple-400",
  96: "text-cyan-400",
  97: "text-white",
}

type TextChunk = {
  text: string
  className: string
}

function parseAnsi(raw: string): TextChunk[] {
  const chunks: TextChunk[] = []
  let current = ""
  let bold = false
  let italic = false
  let fg: number | undefined

  const getClass = () => {
    const classes: string[] = []
    if (fg !== undefined && ANSI_FG[fg]) classes.push(ANSI_FG[fg])
    if (bold) classes.push("font-bold")
    if (italic) classes.push("italic")
    return classes.join(" ")
  }

  const push = () => {
    if (current) {
      chunks.push({ text: current, className: getClass() })
      current = ""
    }
  }

  // eslint-disable-next-line no-control-regex
  const parts = raw.split(/(\x1b\[[0-9;]*m)/)
  for (const part of parts) {
    // eslint-disable-next-line no-control-regex
    const match = part.match(/^\x1b\[([0-9;]*)m$/)
    if (match) {
      push()
      const codes = match[1].split(";").map(Number)
      for (const code of codes) {
        if (code === 0) { bold = false; italic = false; fg = undefined }
        else if (code === 1) bold = true
        else if (code === 3) italic = true
        else if ((code >= 30 && code <= 37) || (code >= 90 && code <= 97)) fg = code
      }
    } else {
      current += part
    }
  }
  push()
  return chunks
}

export type TerminalProps = HTMLAttributes<HTMLDivElement> & {
  output: string
  isStreaming?: boolean
  autoScroll?: boolean
  onClear?: () => void
}

export function Terminal({
  output,
  isStreaming = false,
  autoScroll = true,
  onClear,
  className,
  ...props
}: TerminalProps) {
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (autoScroll && bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: "smooth" })
    }
  }, [output, autoScroll])

  const lines = output.split("\n")
  const chunks = parseAnsi(output)

  return (
    <div
      className={cn(
        "rounded-lg border bg-[#0d0d0d] font-mono text-xs text-gray-200",
        className
      )}
      {...props}
    >
      <TerminalHeader isStreaming={isStreaming} onClear={onClear} />
      <div className="max-h-80 overflow-y-auto p-4">
        <pre className="whitespace-pre-wrap break-all leading-relaxed">
          {chunks.map((chunk, i) => (
            <span key={i} className={chunk.className}>
              {chunk.text}
            </span>
          ))}
          {isStreaming && (
            <span className="inline-block w-1.5 animate-[blink_1s_step-end_infinite] bg-current">
              &nbsp;
            </span>
          )}
        </pre>
        <div ref={bottomRef} />
      </div>
    </div>
  )
}

export type TerminalHeaderProps = {
  isStreaming?: boolean
  onClear?: () => void
  className?: string
}

export function TerminalHeader({
  isStreaming,
  onClear,
  className,
}: TerminalHeaderProps) {
  return (
    <div
      className={cn(
        "flex items-center justify-between border-b border-white/10 px-4 py-2",
        className
      )}
    >
      <div className="flex items-center gap-2">
        <div className="flex gap-1.5">
          <span className="size-2.5 rounded-full bg-red-500/80" />
          <span className="size-2.5 rounded-full bg-yellow-500/80" />
          <span className="size-2.5 rounded-full bg-green-500/80" />
        </div>
        <span className="text-xs text-white/40">Terminal</span>
      </div>
      <div className="flex items-center gap-2">
        {isStreaming && (
          <span className="text-xs text-green-400">● Running</span>
        )}
        {onClear && (
          <Button
            variant="ghost"
            size="icon-xs"
            onClick={onClear}
            className="text-white/40 hover:text-white/80"
          >
            <TrashIcon className="size-3" />
            <span className="sr-only">Clear</span>
          </Button>
        )}
      </div>
    </div>
  )
}
