"use client"

import type { HTMLAttributes } from "react"
import { cn } from "@/lib/utils"

export type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE" | "HEAD" | "OPTIONS"

export type SchemaProperty = {
  name: string
  type: string
  description?: string
  required?: boolean
  example?: string
}

export type SchemaDisplayProps = HTMLAttributes<HTMLDivElement> & {
  method: HttpMethod
  path: string
  description?: string
  parameters?: SchemaProperty[]
  requestBody?: SchemaProperty[]
  responseBody?: SchemaProperty[]
}

export function SchemaDisplay({
  method,
  path,
  description,
  parameters = [],
  requestBody = [],
  responseBody = [],
  className,
  ...props
}: SchemaDisplayProps) {
  return (
    <div
      className={cn("rounded-lg border bg-card text-sm", className)}
      {...props}
    >
      <div className="flex items-center gap-2 border-b px-4 py-3">
        <HttpMethodBadge method={method} />
        <code className="font-mono text-sm font-medium">{path}</code>
      </div>
      {description && (
        <p className="border-b px-4 py-2.5 text-xs text-muted-foreground">
          {description}
        </p>
      )}
      <div className="divide-y">
        {parameters.length > 0 && (
          <SchemaSection title="Parameters" properties={parameters} />
        )}
        {requestBody.length > 0 && (
          <SchemaSection title="Request Body" properties={requestBody} />
        )}
        {responseBody.length > 0 && (
          <SchemaSection title="Response" properties={responseBody} />
        )}
      </div>
    </div>
  )
}

function SchemaSection({
  title,
  properties,
}: {
  title: string
  properties: SchemaProperty[]
}) {
  return (
    <div className="px-4 py-3">
      <h4 className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        {title}
      </h4>
      <div className="space-y-1.5">
        {properties.map((p) => (
          <div key={p.name} className="flex items-start gap-3 font-mono text-xs">
            <div className="flex items-center gap-1 shrink-0">
              <span className="font-medium text-foreground">{p.name}</span>
              {p.required && (
                <span className="text-destructive" title="required">*</span>
              )}
            </div>
            <span className="text-blue-500 dark:text-blue-400 shrink-0">{p.type}</span>
            {p.description && (
              <span className="text-muted-foreground font-sans">{p.description}</span>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

export type HttpMethodBadgeProps = {
  method: HttpMethod
  className?: string
}

export function HttpMethodBadge({ method, className }: HttpMethodBadgeProps) {
  const colors: Record<HttpMethod, string> = {
    GET: "bg-green-500/15 text-green-600 dark:text-green-400",
    POST: "bg-blue-500/15 text-blue-600 dark:text-blue-400",
    PUT: "bg-yellow-500/15 text-yellow-600 dark:text-yellow-400",
    PATCH: "bg-orange-500/15 text-orange-600 dark:text-orange-400",
    DELETE: "bg-red-500/15 text-red-600 dark:text-red-400",
    HEAD: "bg-muted text-muted-foreground",
    OPTIONS: "bg-muted text-muted-foreground",
  }

  return (
    <span
      className={cn(
        "rounded px-1.5 py-0.5 font-mono text-xs font-bold tracking-wide",
        colors[method],
        className
      )}
    >
      {method}
    </span>
  )
}
