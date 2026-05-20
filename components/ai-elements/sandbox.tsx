"use client"

import type { HTMLAttributes } from "react"
import { useState } from "react"
import { cn } from "@/lib/utils"
import { CodeBlock } from "./code-block"
import type { BundledLanguage } from "shiki"

export type SandboxState = "idle" | "running" | "complete" | "error"

export type SandboxProps = HTMLAttributes<HTMLDivElement> & {
  code: string
  language?: BundledLanguage
  output?: string
  state?: SandboxState
  title?: string
}

export function Sandbox({
  code,
  language = "typescript",
  output,
  state = "idle",
  title,
  className,
  ...props
}: SandboxProps) {
  const [activeTab, setActiveTab] = useState<"code" | "output">("code")

  const tabs: Array<"code" | "output"> = output !== undefined ? ["code", "output"] : ["code"]

  return (
    <div
      className={cn("rounded-lg border bg-card text-sm overflow-hidden", className)}
      {...props}
    >
      <SandboxHeader title={title ?? "Sandbox"} state={state} />
      {tabs.length > 1 && (
        <div className="flex border-b bg-muted/30">
          {tabs.map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => setActiveTab(tab)}
              className={cn(
                "px-4 py-1.5 text-xs font-medium capitalize transition-colors",
                activeTab === tab
                  ? "border-b-2 border-primary text-foreground"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              {tab}
            </button>
          ))}
        </div>
      )}
      {activeTab === "code" && (
        <CodeBlock code={code} language={language} />
      )}
      {activeTab === "output" && output !== undefined && (
        <pre className="overflow-x-auto p-4 font-mono text-xs text-foreground/80 whitespace-pre-wrap">
          {output}
        </pre>
      )}
    </div>
  )
}

export type SandboxHeaderProps = HTMLAttributes<HTMLDivElement> & {
  title: string
  state: SandboxState
}

export function SandboxHeader({
  title,
  state,
  className,
  ...props
}: SandboxHeaderProps) {
  const stateLabels: Record<SandboxState, string> = {
    idle: "Ready",
    running: "Running",
    complete: "Complete",
    error: "Error",
  }
  const stateColors: Record<SandboxState, string> = {
    idle: "text-muted-foreground",
    running: "text-blue-500",
    complete: "text-green-500",
    error: "text-destructive",
  }

  return (
    <div
      className={cn(
        "flex items-center justify-between border-b bg-muted/30 px-4 py-2",
        className
      )}
      {...props}
    >
      <span className="text-xs font-medium">{title}</span>
      <span className={cn("text-xs font-medium", stateColors[state])}>
        {stateLabels[state]}
      </span>
    </div>
  )
}
