"use client"

import { CheckIcon, CopyIcon, TerminalIcon } from "lucide-react"
import type { HTMLAttributes } from "react"
import { useCallback, useState } from "react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

export type SnippetProps = HTMLAttributes<HTMLDivElement> & {
  code: string
  language?: string
}

export function Snippet({ code, language, className, ...props }: SnippetProps) {
  const [copied, setCopied] = useState(false)

  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(code).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }, [code])

  return (
    <div
      className={cn(
        "flex items-center gap-2 rounded-lg border bg-muted/50 px-3 py-2 font-mono text-sm",
        className
      )}
      {...props}
    >
      <TerminalIcon className="size-3.5 shrink-0 text-muted-foreground" />
      <span className="flex-1 truncate text-foreground">{code}</span>
      {language && (
        <span className="shrink-0 text-xs text-muted-foreground">{language}</span>
      )}
      <Button
        variant="ghost"
        size="icon-xs"
        onClick={handleCopy}
        className="shrink-0"
      >
        {copied ? (
          <CheckIcon className="size-3 text-green-500" />
        ) : (
          <CopyIcon className="size-3" />
        )}
        <span className="sr-only">Copy</span>
      </Button>
    </div>
  )
}

export type SnippetCopyButtonProps = {
  code: string
  timeout?: number
  onCopy?: () => void
  onError?: (err: Error) => void
  className?: string
}

export function SnippetCopyButton({
  code,
  timeout = 2000,
  onCopy,
  onError,
  className,
}: SnippetCopyButtonProps) {
  const [copied, setCopied] = useState(false)

  const handleCopy = useCallback(() => {
    navigator.clipboard
      .writeText(code)
      .then(() => {
        setCopied(true)
        onCopy?.()
        setTimeout(() => setCopied(false), timeout)
      })
      .catch((err) => onError?.(err))
  }, [code, timeout, onCopy, onError])

  return (
    <Button
      variant="ghost"
      size="icon-xs"
      onClick={handleCopy}
      className={cn(className)}
    >
      {copied ? (
        <CheckIcon className="size-3 text-green-500" />
      ) : (
        <CopyIcon className="size-3" />
      )}
      <span className="sr-only">Copy</span>
    </Button>
  )
}
