"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Button, buttonVariants } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import { ProviderBadge } from "@/components/provider-badge"
import { PROVIDERS } from "@/lib/providers"
import { INTEGRATIONS } from "@/lib/integrations"
import { ArrowLeftIcon, CheckIcon, ExternalLinkIcon, KeyRoundIcon, SearchIcon, Trash2Icon } from "lucide-react"
import { TooltipProvider } from "@/components/ui/tooltip"
import { cn } from "@/lib/utils"

type SavedKey = { provider: string; updatedAt: string }

export default function SettingsPage() {
  const [savedKeys, setSavedKeys] = useState<SavedKey[]>([])
  const [inputValues, setInputValues] = useState<Record<string, string>>({})
  const [saving, setSaving] = useState<Record<string, boolean>>({})
  const [deleting, setDeleting] = useState<Record<string, boolean>>({})

  async function loadKeys() {
    const res = await fetch("/api/keys")
    if (res.ok) setSavedKeys(await res.json())
  }

  useEffect(() => {
    loadKeys()
  }, [])

  async function saveKey(providerId: string) {
    const key = inputValues[providerId]?.trim()
    if (!key) return
    setSaving((s) => ({ ...s, [providerId]: true }))
    const res = await fetch("/api/keys", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ provider: providerId, apiKey: key }),
    })
    if (res.ok) {
      setInputValues((v) => ({ ...v, [providerId]: "" }))
      await loadKeys()
    }
    setSaving((s) => ({ ...s, [providerId]: false }))
  }

  async function deleteKey(providerId: string) {
    setDeleting((d) => ({ ...d, [providerId]: true }))
    await fetch("/api/keys", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ provider: providerId }),
    })
    await loadKeys()
    setDeleting((d) => ({ ...d, [providerId]: false }))
  }

  const savedProviders = new Set(savedKeys.map((k) => k.provider))

  const freeProviders = PROVIDERS.filter((p) => p.isFree)
  const paidProviders = PROVIDERS.filter((p) => !p.isFree)

  return (
    <TooltipProvider>
      <div className="min-h-screen bg-background">
        <div className="mx-auto max-w-2xl px-4 py-8">
          <div className="flex items-center gap-3 mb-6">
            <Link
              href="/"
              className={cn(buttonVariants({ variant: "ghost", size: "icon" }), "h-8 w-8")}
            >
              <ArrowLeftIcon className="h-4 w-4" />
            </Link>
            <div>
              <h1 className="text-lg font-semibold">API Keys</h1>
              <p className="text-xs text-muted-foreground">Keys stored encrypted. Never sent to third parties.</p>
            </div>
          </div>

          <section className="mb-8">
            <div className="flex items-center gap-2 mb-3">
              <h2 className="text-sm font-medium">Free Providers</h2>
              <ProviderBadge isFree={true} />
            </div>
            <div className="space-y-3">
              {freeProviders.map((p) => (
                <ProviderKeyCard
                  key={p.id}
                  provider={p}
                  isSaved={savedProviders.has(p.id)}
                  inputValue={inputValues[p.id] ?? ""}
                  onInputChange={(v) => setInputValues((vals) => ({ ...vals, [p.id]: v }))}
                  onSave={() => saveKey(p.id)}
                  onDelete={() => deleteKey(p.id)}
                  saving={saving[p.id] ?? false}
                  deleting={deleting[p.id] ?? false}
                />
              ))}
            </div>
          </section>

          <Separator className="mb-8" />

          <section>
            <div className="flex items-center gap-2 mb-3">
              <h2 className="text-sm font-medium">Paid Providers</h2>
              <ProviderBadge isFree={false} />
            </div>
            <div className="space-y-3">
              {paidProviders.map((p) => (
                <ProviderKeyCard
                  key={p.id}
                  provider={p}
                  isSaved={savedProviders.has(p.id)}
                  inputValue={inputValues[p.id] ?? ""}
                  onInputChange={(v) => setInputValues((vals) => ({ ...vals, [p.id]: v }))}
                  onSave={() => saveKey(p.id)}
                  onDelete={() => deleteKey(p.id)}
                  saving={saving[p.id] ?? false}
                  deleting={deleting[p.id] ?? false}
                />
              ))}
            </div>
          </section>

          <Separator className="my-8" />

          <section>
            <div className="flex items-center gap-2 mb-3">
              <SearchIcon className="h-4 w-4 text-muted-foreground" />
              <h2 className="text-sm font-medium">Integrations</h2>
              <span className="rounded-full bg-blue-500/10 px-2 py-0.5 text-xs font-medium text-blue-600 dark:text-blue-400">
                Tools
              </span>
            </div>
            <div className="space-y-3">
              {INTEGRATIONS.map((integration) => (
                <IntegrationKeyCard
                  key={integration.id}
                  integration={integration}
                  isSaved={savedProviders.has(integration.id)}
                  inputValue={inputValues[integration.id] ?? ""}
                  onInputChange={(v) => setInputValues((vals) => ({ ...vals, [integration.id]: v }))}
                  onSave={() => saveKey(integration.id)}
                  onDelete={() => deleteKey(integration.id)}
                  saving={saving[integration.id] ?? false}
                  deleting={deleting[integration.id] ?? false}
                />
              ))}
            </div>
          </section>
        </div>
      </div>
    </TooltipProvider>
  )
}

type IntegrationKeyCardProps = {
  integration: (typeof INTEGRATIONS)[number]
  isSaved: boolean
  inputValue: string
  onInputChange: (v: string) => void
  onSave: () => void
  onDelete: () => void
  saving: boolean
  deleting: boolean
}

function IntegrationKeyCard({
  integration,
  isSaved,
  inputValue,
  onInputChange,
  onSave,
  onDelete,
  saving,
  deleting,
}: IntegrationKeyCardProps) {
  return (
    <div className="rounded-lg border bg-card p-4 space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <SearchIcon className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm font-medium">{integration.name}</span>
          {isSaved && (
            <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 text-xs">
              <CheckIcon className="h-3 w-3" />
              Saved
            </span>
          )}
        </div>
        <a
          href={integration.docsUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
        >
          Get key
          <ExternalLinkIcon className="h-3 w-3" />
        </a>
      </div>

      <p className="text-xs text-muted-foreground">{integration.description}</p>

      <div className="flex gap-2">
        <Input
          type="password"
          placeholder={isSaved ? "••••••••• (replace key)" : `Paste ${integration.keyLabel}`}
          value={inputValue}
          onChange={(e) => onInputChange(e.target.value)}
          className="h-8 text-xs font-mono"
          onKeyDown={(e) => e.key === "Enter" && onSave()}
        />
        <Button
          size="sm"
          className="h-8 px-3"
          onClick={onSave}
          disabled={!inputValue.trim() || saving}
        >
          {saving ? "Saving…" : isSaved ? "Update" : "Save"}
        </Button>
        {isSaved && (
          <Button
            size="sm"
            variant="ghost"
            className="h-8 w-8 p-0 text-destructive hover:text-destructive"
            onClick={onDelete}
            disabled={deleting}
          >
            <Trash2Icon className="h-3.5 w-3.5" />
          </Button>
        )}
      </div>
    </div>
  )
}

type ProviderKeyCardProps = {
  provider: (typeof PROVIDERS)[number]
  isSaved: boolean
  inputValue: string
  onInputChange: (v: string) => void
  onSave: () => void
  onDelete: () => void
  saving: boolean
  deleting: boolean
}

function ProviderKeyCard({
  provider,
  isSaved,
  inputValue,
  onInputChange,
  onSave,
  onDelete,
  saving,
  deleting,
}: ProviderKeyCardProps) {
  return (
    <div className="rounded-lg border bg-card p-4 space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <KeyRoundIcon className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm font-medium">{provider.name}</span>
          <ProviderBadge isFree={provider.isFree} />
          {isSaved && (
            <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 text-xs">
              <CheckIcon className="h-3 w-3" />
              Saved
            </span>
          )}
        </div>
        <a
          href={provider.docsUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
        >
          Get key
          <ExternalLinkIcon className="h-3 w-3" />
        </a>
      </div>

      <p className="text-xs text-muted-foreground">
        {provider.models.length} models available ·{" "}
        {provider.models.slice(0, 3).map((m) => m.name).join(", ")}
        {provider.models.length > 3 && " + more"}
      </p>

      <div className="flex gap-2">
        <Input
          type="password"
          placeholder={isSaved ? "••••••••• (replace key)" : `Paste ${provider.keyLabel}`}
          value={inputValue}
          onChange={(e) => onInputChange(e.target.value)}
          className="h-8 text-xs font-mono"
          onKeyDown={(e) => e.key === "Enter" && onSave()}
        />
        <Button
          size="sm"
          className="h-8 px-3"
          onClick={onSave}
          disabled={!inputValue.trim() || saving}
        >
          {saving ? "Saving…" : isSaved ? "Update" : "Save"}
        </Button>
        {isSaved && (
          <Button
            size="sm"
            variant="ghost"
            className="h-8 w-8 p-0 text-destructive hover:text-destructive"
            onClick={onDelete}
            disabled={deleting}
          >
            <Trash2Icon className="h-3.5 w-3.5" />
          </Button>
        )}
      </div>
    </div>
  )
}
