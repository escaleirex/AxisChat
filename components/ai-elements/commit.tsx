"use client"

import {
  CheckIcon,
  CopyIcon,
  FileDiffIcon,
  GitCommitHorizontalIcon,
  MinusIcon,
  PlusIcon,
} from "lucide-react"
import type { HTMLAttributes } from "react"
import { useCallback, useState } from "react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"

export type CommitFileStatus =
  | "added"
  | "modified"
  | "deleted"
  | "renamed"

export type CommitFile = {
  path: string
  status: CommitFileStatus
  additions?: number
  deletions?: number
}

export type CommitProps = HTMLAttributes<HTMLDivElement> & {
  hash: string
  message: string
  author?: string
  date?: Date | string
  files?: CommitFile[]
  defaultOpen?: boolean
}

export function Commit({
  hash,
  message,
  author,
  date,
  files = [],
  defaultOpen = false,
  className,
  ...props
}: CommitProps) {
  return (
    <div
      className={cn("rounded-lg border bg-card text-sm", className)}
      {...props}
    >
      <div className="flex items-start gap-3 p-3">
        <GitCommitHorizontalIcon className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
        <div className="flex min-w-0 flex-1 flex-col gap-1">
          <p className="font-medium leading-snug">{message}</p>
          <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 text-xs text-muted-foreground">
            {author && <span>{author}</span>}
            {date && <CommitTimestamp date={date} />}
          </div>
        </div>
        <CommitHash hash={hash} />
      </div>
      {files.length > 0 && (
        <Collapsible defaultOpen={defaultOpen}>
          <CollapsibleTrigger className="flex w-full items-center gap-2 border-t px-3 py-2 text-left text-xs text-muted-foreground hover:bg-muted/30">
            <FileDiffIcon className="size-3.5" />
            {files.length} file{files.length !== 1 ? "s" : ""} changed
          </CollapsibleTrigger>
          <CollapsibleContent>
            <div className="divide-y border-t">
              {files.map((f) => (
                <CommitFileRow key={f.path} file={f} />
              ))}
            </div>
          </CollapsibleContent>
        </Collapsible>
      )}
    </div>
  )
}

export type CommitHashProps = HTMLAttributes<HTMLSpanElement> & {
  hash: string
}

export function CommitHash({ hash, className, ...props }: CommitHashProps) {
  return (
    <span
      className={cn(
        "shrink-0 rounded bg-muted px-1.5 py-0.5 font-mono text-xs text-muted-foreground",
        className
      )}
      {...props}
    >
      {hash.slice(0, 7)}
    </span>
  )
}

export type CommitTimestampProps = { date: Date | string; className?: string }

export function CommitTimestamp({ date, className }: CommitTimestampProps) {
  const d = typeof date === "string" ? new Date(date) : date
  const now = new Date()
  const diff = now.getTime() - d.getTime()
  const minutes = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)
  const days = Math.floor(diff / 86400000)

  const relative =
    minutes < 1
      ? "just now"
      : minutes < 60
      ? `${minutes}m ago`
      : hours < 24
      ? `${hours}h ago`
      : `${days}d ago`

  return (
    <time
      dateTime={d.toISOString()}
      title={d.toLocaleString()}
      className={cn("text-xs", className)}
    >
      {relative}
    </time>
  )
}

export type CommitCopyButtonProps = {
  hash: string
  timeout?: number
  className?: string
}

export function CommitCopyButton({
  hash,
  timeout = 2000,
  className,
}: CommitCopyButtonProps) {
  const [copied, setCopied] = useState(false)

  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(hash).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), timeout)
    })
  }, [hash, timeout])

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
      <span className="sr-only">Copy hash</span>
    </Button>
  )
}

function CommitFileRow({ file }: { file: CommitFile }) {
  const colors: Record<CommitFileStatus, string> = {
    added: "text-green-500",
    modified: "text-blue-500",
    deleted: "text-destructive",
    renamed: "text-yellow-500",
  }
  const labels: Record<CommitFileStatus, string> = {
    added: "A",
    modified: "M",
    deleted: "D",
    renamed: "R",
  }

  return (
    <div className="flex items-center gap-2 px-3 py-1.5 font-mono text-xs">
      <span className={cn("w-3 shrink-0 font-bold", colors[file.status])}>
        {labels[file.status]}
      </span>
      <span className="flex-1 truncate text-foreground/80">{file.path}</span>
      {(file.additions !== undefined || file.deletions !== undefined) && (
        <div className="flex items-center gap-1 shrink-0">
          {file.additions !== undefined && (
            <span className="flex items-center text-green-500">
              <PlusIcon className="size-2.5" />
              {file.additions}
            </span>
          )}
          {file.deletions !== undefined && (
            <span className="flex items-center text-destructive">
              <MinusIcon className="size-2.5" />
              {file.deletions}
            </span>
          )}
        </div>
      )}
    </div>
  )
}
