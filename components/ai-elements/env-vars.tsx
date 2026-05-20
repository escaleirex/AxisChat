"use client"

import { CheckIcon, CopyIcon, EyeIcon, EyeOffIcon } from "lucide-react"
import type { HTMLAttributes } from "react"
import { useCallback, useState } from "react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

export type EnvVarEntry = {
  name: string
  value: string
}

export type EnvironmentVariablesProps = HTMLAttributes<HTMLDivElement> & {
  variables: EnvVarEntry[]
  showValues?: boolean
  defaultShowValues?: boolean
  onShowValuesChange?: (show: boolean) => void
}

export function EnvironmentVariables({
  variables,
  showValues: controlledShow,
  defaultShowValues = false,
  onShowValuesChange,
  className,
  ...props
}: EnvironmentVariablesProps) {
  const [internalShow, setInternalShow] = useState(defaultShowValues)
  const show = controlledShow !== undefined ? controlledShow : internalShow

  const toggleShow = useCallback(() => {
    if (controlledShow !== undefined) {
      onShowValuesChange?.(!controlledShow)
    } else {
      setInternalShow((v) => {
        onShowValuesChange?.(!v)
        return !v
      })
    }
  }, [controlledShow, onShowValuesChange])

  return (
    <div
      className={cn("rounded-lg border bg-card text-sm", className)}
      {...props}
    >
      <div className="flex items-center justify-between border-b px-3 py-2">
        <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
          Environment Variables
        </span>
        <Button
          variant="ghost"
          size="icon-xs"
          onClick={toggleShow}
          title={show ? "Hide values" : "Show values"}
        >
          {show ? <EyeOffIcon className="size-3.5" /> : <EyeIcon className="size-3.5" />}
          <span className="sr-only">{show ? "Hide" : "Show"} values</span>
        </Button>
      </div>
      <div className="divide-y font-mono text-xs">
        {variables.map((v) => (
          <EnvironmentVariable key={v.name} entry={v} showValue={show} />
        ))}
      </div>
    </div>
  )
}

function EnvironmentVariable({
  entry,
  showValue,
}: {
  entry: EnvVarEntry
  showValue: boolean
}) {
  const [copied, setCopied] = useState(false)

  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(entry.value).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }, [entry.value])

  return (
    <div className="group flex items-center gap-2 px-3 py-1.5">
      <span className="shrink-0 font-medium text-foreground">{entry.name}</span>
      <span className="text-muted-foreground">=</span>
      <span className="flex-1 truncate text-muted-foreground">
        {showValue ? entry.value : "•".repeat(Math.min(entry.value.length, 20))}
      </span>
      <Button
        variant="ghost"
        size="icon-xs"
        onClick={handleCopy}
        className="opacity-0 group-hover:opacity-100 transition-opacity"
      >
        {copied ? (
          <CheckIcon className="size-3 text-green-500" />
        ) : (
          <CopyIcon className="size-3" />
        )}
        <span className="sr-only">Copy value</span>
      </Button>
    </div>
  )
}
