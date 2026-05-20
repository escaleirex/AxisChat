"use client"

import { useState, useMemo, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { ProviderBadge } from "@/components/provider-badge"
import { ProviderIcon } from "@/components/provider-icon"
import { PROVIDERS } from "@/lib/providers"
import { cn } from "@/lib/utils"
import { ChevronDownIcon, CheckIcon, SearchIcon } from "lucide-react"

type Props = {
  value: string // "provider|modelId"
  onChange: (provider: string, model: string) => void
  configuredProviders: string[]
}

export function ModelSelector({ value, onChange, configuredProviders }: Props) {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState("")
  const inputRef = useRef<HTMLInputElement>(null)

  function handleOpenChange(v: boolean) {
    setOpen(v)
    if (v) setTimeout(() => inputRef.current?.focus(), 50)
  }

  const available = useMemo(
    () => PROVIDERS.filter((p) => configuredProviders.includes(p.id)),
    [configuredProviders]
  )

  const filtered = useMemo(() => {
    const q = query.toLowerCase().trim()
    if (!q) return available
    return available
      .map((p) => ({
        ...p,
        models: p.models.filter(
          (m) =>
            m.name.toLowerCase().includes(q) ||
            m.id.toLowerCase().includes(q) ||
            p.name.toLowerCase().includes(q)
        ),
      }))
      .filter((p) => p.models.length > 0)
  }, [available, query])

  const [selectedProvider, selectedModelId] = value.split("|")
  const providerDef = PROVIDERS.find((p) => p.id === selectedProvider)
  const modelDef = providerDef?.models.find((m) => m.id === selectedModelId)

  const label = modelDef
    ? `${modelDef.name}`
    : available.length === 0
    ? "No keys configured"
    : "Select model"

  function select(providerId: string, modelId: string) {
    onChange(providerId, modelId)
    setOpen(false)
    setQuery("")
  }

  return (
    <Popover open={open} onOpenChange={handleOpenChange}>
      <PopoverTrigger
        render={
          <Button
            variant="ghost"
            size="sm"
            className="h-7 gap-1.5 px-2 text-xs font-medium"
            disabled={available.length === 0}
          />
        }
      >
        {providerDef && (
          <ProviderIcon providerId={providerDef.id} size={14} />
        )}
        <span className="max-w-[160px] truncate">{label}</span>
        <ChevronDownIcon className="h-3 w-3 text-muted-foreground" />
      </PopoverTrigger>

      <PopoverContent
        className="w-72 p-0"
        align="start"
        sideOffset={6}
      >
        {/* Search */}
        <div className="flex items-center gap-2 border-b px-3 py-2">
          <SearchIcon className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
          <Input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search models…"
            className="h-6 border-0 p-0 text-xs shadow-none focus-visible:ring-0"
          />
        </div>

        {/* Provider + model list */}
        <div className="max-h-72 overflow-y-auto py-1">
          {filtered.length === 0 && (
            <p className="px-3 py-4 text-center text-xs text-muted-foreground">
              No models match
            </p>
          )}
          {filtered.map((provider) => (
            <div key={provider.id}>
              {/* Provider header */}
              <div className="flex items-center gap-2 px-3 py-1.5">
                <ProviderIcon providerId={provider.id} size={13} />
                <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wide">
                  {provider.name}
                </span>
                <ProviderBadge isFree={provider.isFree} />
              </div>

              {/* Models */}
              {provider.models.map((model) => {
                const active =
                  selectedProvider === provider.id &&
                  selectedModelId === model.id
                return (
                  <button
                    key={model.id}
                    className={cn(
                      "flex w-full items-center justify-between gap-2 px-3 py-1.5 text-xs hover:bg-accent",
                      active && "bg-accent"
                    )}
                    onClick={() => select(provider.id, model.id)}
                  >
                    <span className="truncate">{model.name}</span>
                    <span className="shrink-0 text-muted-foreground text-[10px]">
                      {model.contextLength
                        ? model.contextLength >= 1_000_000
                          ? `${(model.contextLength / 1_000_000).toFixed(0)}M`
                          : `${Math.round(model.contextLength / 1000)}k`
                        : ""}
                    </span>
                    {active && <CheckIcon className="h-3 w-3 shrink-0 text-primary" />}
                  </button>
                )
              })}
            </div>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  )
}
