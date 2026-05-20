"use client"

import {
  ChevronDownIcon,
  ExternalLinkIcon,
  GlobeIcon,
} from "lucide-react"
import type { HTMLAttributes } from "react"
import { cn } from "@/lib/utils"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"

export type Source = {
  title?: string
  url: string
  description?: string
  favicon?: string
}

export type SourcesProps = HTMLAttributes<HTMLDivElement> & {
  sources: Source[]
  defaultOpen?: boolean
}

export function Sources({
  sources,
  defaultOpen = false,
  className,
  ...props
}: SourcesProps) {
  if (sources.length === 0) return null

  return (
    <div
      className={cn("rounded-lg border bg-card text-sm", className)}
      {...props}
    >
      <Collapsible defaultOpen={defaultOpen}>
        <CollapsibleTrigger className="flex w-full items-center gap-2 px-4 py-2.5 text-left hover:bg-muted/30">
          <GlobeIcon className="size-4 shrink-0 text-muted-foreground" />
          <SourcesTrigger count={sources.length} />
          <ChevronDownIcon className="ml-auto size-4 shrink-0 text-muted-foreground transition-transform [[data-panel-closed]>&]:rotate-[-90deg]" />
        </CollapsibleTrigger>
        <CollapsibleContent>
          <div className="grid gap-2 border-t p-4 sm:grid-cols-2">
            {sources.map((s, i) => (
              <SourceCard key={i} source={s} />
            ))}
          </div>
        </CollapsibleContent>
      </Collapsible>
    </div>
  )
}

export type SourcesTriggerProps = { count: number; className?: string }

export function SourcesTrigger({ count, className }: SourcesTriggerProps) {
  return (
    <span className={cn("text-sm font-medium", className)}>
      {count} source{count !== 1 ? "s" : ""}
    </span>
  )
}

function SourceCard({ source }: { source: Source }) {
  const domain = (() => {
    try {
      return new URL(source.url).hostname.replace(/^www\./, "")
    } catch {
      return source.url
    }
  })()

  return (
    <a
      href={source.url}
      target="_blank"
      rel="noopener noreferrer"
      className="group flex items-start gap-2.5 rounded-md border bg-muted/30 p-2.5 text-xs transition-colors hover:bg-muted"
    >
      {source.favicon ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={source.favicon}
          alt=""
          className="mt-0.5 size-4 shrink-0 rounded"
        />
      ) : (
        <GlobeIcon className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
      )}
      <div className="flex-1 overflow-hidden">
        <p className="truncate font-medium text-foreground group-hover:underline">
          {source.title || domain}
        </p>
        <p className="truncate text-muted-foreground">{domain}</p>
        {source.description && (
          <p className="mt-0.5 line-clamp-2 text-muted-foreground/80">
            {source.description}
          </p>
        )}
      </div>
      <ExternalLinkIcon className="mt-0.5 size-3 shrink-0 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
    </a>
  )
}
