"use client"

import {
  BotIcon,
  ChevronDownIcon,
  ChevronRightIcon,
  WrenchIcon,
} from "lucide-react"
import type { HTMLAttributes } from "react"
import { useState } from "react"
import { cn } from "@/lib/utils"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"

export type AgentTool = {
  name: string
  description?: string
  parameters?: Record<string, unknown>
}

export type AgentDisplayProps = HTMLAttributes<HTMLDivElement> & {
  name: string
  model?: string
  instructions?: string
  tools?: AgentTool[]
  outputSchema?: string
}

export function AgentDisplay({
  name,
  model,
  instructions,
  tools = [],
  outputSchema,
  className,
  ...props
}: AgentDisplayProps) {
  return (
    <div
      className={cn("rounded-lg border bg-card text-sm", className)}
      {...props}
    >
      <AgentHeader name={name} model={model} />
      {instructions && (
        <AgentSection label="Instructions">
          <p className="whitespace-pre-wrap text-xs text-muted-foreground">
            {instructions}
          </p>
        </AgentSection>
      )}
      {tools.length > 0 && (
        <AgentSection label={`Tools (${tools.length})`}>
          <div className="space-y-1">
            {tools.map((tool) => (
              <AgentToolItem key={tool.name} tool={tool} />
            ))}
          </div>
        </AgentSection>
      )}
      {outputSchema && (
        <AgentSection label="Output Schema">
          <AgentOutput schema={outputSchema} />
        </AgentSection>
      )}
    </div>
  )
}

export type AgentHeaderProps = HTMLAttributes<HTMLDivElement> & {
  name: string
  model?: string
}

export function AgentHeader({ name, model, className, ...props }: AgentHeaderProps) {
  return (
    <div
      className={cn("flex items-center gap-3 border-b px-4 py-3", className)}
      {...props}
    >
      <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary/10">
        <BotIcon className="size-4 text-primary" />
      </div>
      <div className="flex flex-col">
        <span className="font-medium">{name}</span>
        {model && (
          <span className="text-xs text-muted-foreground font-mono">{model}</span>
        )}
      </div>
    </div>
  )
}

function AgentSection({
  label,
  children,
}: {
  label: string
  children: React.ReactNode
}) {
  return (
    <div className="border-b px-4 py-3 last:border-b-0">
      <h4 className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        {label}
      </h4>
      {children}
    </div>
  )
}

export type AgentToolItemProps = {
  tool: AgentTool
  value?: unknown
}

export function AgentToolItem({ tool, value }: AgentToolItemProps) {
  const [open, setOpen] = useState(false)
  const hasDetails = tool.description || tool.parameters

  if (!hasDetails) {
    return (
      <div className="flex items-center gap-2 rounded px-2 py-1 text-xs">
        <WrenchIcon className="size-3 shrink-0 text-muted-foreground" />
        <span className="font-mono font-medium">{tool.name}</span>
      </div>
    )
  }

  return (
    <Collapsible open={open} onOpenChange={setOpen}>
      <CollapsibleTrigger className="flex w-full items-center gap-2 rounded px-2 py-1 text-xs text-left hover:bg-muted/50">
        {open ? (
          <ChevronDownIcon className="size-3 shrink-0 text-muted-foreground" />
        ) : (
          <ChevronRightIcon className="size-3 shrink-0 text-muted-foreground" />
        )}
        <WrenchIcon className="size-3 shrink-0 text-muted-foreground" />
        <span className="font-mono font-medium">{tool.name}</span>
      </CollapsibleTrigger>
      <CollapsibleContent>
        <div className="ml-7 mt-1 rounded-md bg-muted/50 px-3 py-2 text-xs space-y-1">
          {tool.description && (
            <p className="text-muted-foreground">{tool.description}</p>
          )}
          {tool.parameters && (
            <pre className="text-foreground/80 overflow-x-auto">
              {JSON.stringify(tool.parameters, null, 2)}
            </pre>
          )}
        </div>
      </CollapsibleContent>
    </Collapsible>
  )
}

export type AgentOutputProps = { schema: string; className?: string }

export function AgentOutput({ schema, className }: AgentOutputProps) {
  return (
    <pre
      className={cn(
        "rounded-md bg-muted/50 p-3 font-mono text-xs text-foreground/80 overflow-x-auto",
        className
      )}
    >
      {schema}
    </pre>
  )
}
