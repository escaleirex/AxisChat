"use client"

import { ExternalLinkIcon } from "lucide-react"
import type { HTMLAttributes } from "react"
import { cn } from "@/lib/utils"
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card"

export type CitationSource = {
  title?: string
  url: string
  description?: string
}

export type InlineCitationProps = HTMLAttributes<HTMLSpanElement> & {
  sources: CitationSource[]
  index?: number
}

export function InlineCitation({
  sources,
  index,
  className,
  ...props
}: InlineCitationProps) {
  if (sources.length === 0) return null

  const badge = (
    <span
      className={cn(
        "mx-0.5 inline-flex cursor-pointer items-center rounded bg-primary/10 px-1 py-0.5 font-mono text-xs font-medium text-primary hover:bg-primary/20",
        className
      )}
      {...props}
    >
      {index !== undefined ? index : sources.length}
    </span>
  )

  if (sources.length === 1) {
    return (
      <HoverCard>
        <HoverCardTrigger render={badge} />
        <HoverCardContent className="w-72">
          <InlineCitationSource source={sources[0]} />
        </HoverCardContent>
      </HoverCard>
    )
  }

  return (
    <HoverCard>
      <HoverCardTrigger render={badge} />
      <HoverCardContent className="w-72">
        <div className="space-y-2">
          {sources.map((s, i) => (
            <InlineCitationSource key={i} source={s} />
          ))}
        </div>
      </HoverCardContent>
    </HoverCard>
  )
}

export type InlineCitationSourceProps = { source: CitationSource; className?: string }

export function InlineCitationSource({
  source,
  className,
}: InlineCitationSourceProps) {
  const domain = (() => {
    try {
      return new URL(source.url).hostname.replace(/^www\./, "")
    } catch {
      return source.url
    }
  })()

  return (
    <div className={cn("text-xs", className)}>
      <a
        href={source.url}
        target="_blank"
        rel="noopener noreferrer"
        className="group flex items-start gap-1.5"
      >
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
    </div>
  )
}
