"use client"

import { CheckIcon, PlayIcon, SearchIcon, VolumeIcon } from "lucide-react"
import type { HTMLAttributes, ReactNode } from "react"
import { useState } from "react"
import { cn } from "@/lib/utils"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

export type VoiceGender = "male" | "female" | "neutral"
export type VoiceAge = "young" | "middle" | "old"

export type VoiceEntry = {
  id: string
  name: string
  gender?: VoiceGender
  accent?: string
  age?: VoiceAge
  previewUrl?: string
}

export type VoiceSelectorProps = HTMLAttributes<HTMLDivElement> & {
  voices: VoiceEntry[]
  value?: string
  defaultValue?: string
  onValueChange?: (voiceId: string) => void
  open?: boolean
  defaultOpen?: boolean
  onOpenChange?: (open: boolean) => void
  children?: ReactNode
}

export function VoiceSelector({
  voices,
  value,
  defaultValue,
  onValueChange,
  open,
  defaultOpen,
  onOpenChange,
  className,
  children,
  ...props
}: VoiceSelectorProps) {
  const [query, setQuery] = useState("")
  const [selected, setSelected] = useState(defaultValue ?? "")
  const activeId = value !== undefined ? value : selected

  const filtered = voices.filter(
    (v) =>
      v.name.toLowerCase().includes(query.toLowerCase()) ||
      v.accent?.toLowerCase().includes(query.toLowerCase())
  )

  const handleSelect = (id: string) => {
    if (value === undefined) setSelected(id)
    onValueChange?.(id)
    onOpenChange?.(false)
  }

  return (
    <div className={cn(className)} {...props}>
      <Dialog open={open} defaultOpen={defaultOpen} onOpenChange={onOpenChange}>
        {children && <DialogTrigger>{children}</DialogTrigger>}
        <DialogContent className="max-w-sm p-0">
          <DialogHeader className="px-4 pt-4">
            <DialogTitle>Select Voice</DialogTitle>
          </DialogHeader>
          <VoiceSelectorInput
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <VoiceSelectorList className="max-h-72 overflow-y-auto">
            {filtered.length === 0 ? (
              <p className="px-4 py-6 text-center text-sm text-muted-foreground">
                No voices found
              </p>
            ) : (
              filtered.map((v) => (
                <VoiceSelectorItem
                  key={v.id}
                  voice={v}
                  isSelected={v.id === activeId}
                  onSelect={() => handleSelect(v.id)}
                />
              ))
            )}
          </VoiceSelectorList>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export type VoiceSelectorInputProps = React.InputHTMLAttributes<HTMLInputElement>

export function VoiceSelectorInput({ className, ...props }: VoiceSelectorInputProps) {
  return (
    <div className="flex items-center border-b px-4 py-2">
      <SearchIcon className="mr-2 size-4 shrink-0 text-muted-foreground" />
      <input
        type="search"
        placeholder="Search voices..."
        className={cn(
          "flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground",
          className
        )}
        {...props}
      />
    </div>
  )
}

export type VoiceSelectorListProps = HTMLAttributes<HTMLDivElement>

export function VoiceSelectorList({ className, ...props }: VoiceSelectorListProps) {
  return <div className={cn("divide-y", className)} {...props} />
}

type VoiceSelectorItemProps = {
  voice: VoiceEntry
  isSelected: boolean
  onSelect: () => void
}

function VoiceSelectorItem({ voice, isSelected, onSelect }: VoiceSelectorItemProps) {
  const [previewing, setPreviewing] = useState(false)

  const handlePreview = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (!voice.previewUrl) return
    setPreviewing(true)
    const audio = new Audio(voice.previewUrl)
    audio.onended = () => setPreviewing(false)
    audio.play().catch(() => setPreviewing(false))
  }

  return (
    <button
      type="button"
      onClick={onSelect}
      className="flex w-full items-center gap-3 px-4 py-2.5 text-left text-sm hover:bg-muted"
    >
      <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-muted">
        <VolumeIcon className="size-3.5 text-muted-foreground" />
      </div>
      <div className="flex-1 overflow-hidden">
        <p className="truncate font-medium">{voice.name}</p>
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          {voice.gender && <VoiceSelectorGender gender={voice.gender} />}
          {voice.accent && <VoiceSelectorAccent accent={voice.accent} />}
          {voice.age && <VoiceSelectorAge age={voice.age} />}
        </div>
      </div>
      {voice.previewUrl && (
        <button
          type="button"
          onClick={handlePreview}
          className={cn(
            "rounded-full p-1 text-muted-foreground hover:text-foreground",
            previewing && "text-primary"
          )}
        >
          <PlayIcon className="size-3.5" />
          <span className="sr-only">Preview</span>
        </button>
      )}
      {isSelected && <CheckIcon className="size-4 shrink-0 text-primary" />}
    </button>
  )
}

export function VoiceSelectorGender({ gender }: { gender: VoiceGender }) {
  return <span className="capitalize">{gender}</span>
}

export function VoiceSelectorAccent({ accent }: { accent: string }) {
  return <span>{accent}</span>
}

export function VoiceSelectorAge({ age }: { age: VoiceAge }) {
  return <span className="capitalize">{age}</span>
}

export function VoiceSelectorPreview({
  url,
  className,
}: {
  url: string
  className?: string
}) {
  const [playing, setPlaying] = useState(false)

  const play = () => {
    setPlaying(true)
    const audio = new Audio(url)
    audio.onended = () => setPlaying(false)
    audio.play().catch(() => setPlaying(false))
  }

  return (
    <button
      type="button"
      onClick={play}
      className={cn(
        "flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground",
        playing && "text-primary",
        className
      )}
    >
      <PlayIcon className="size-3" />
      {playing ? "Playing..." : "Preview"}
    </button>
  )
}
