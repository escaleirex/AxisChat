"use client"

import { CheckIcon, MicIcon } from "lucide-react"
import type { HTMLAttributes } from "react"
import { useCallback, useEffect, useState } from "react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

type MediaDevice = { deviceId: string; label: string }

async function getAudioInputs(): Promise<MediaDevice[]> {
  try {
    await navigator.mediaDevices.getUserMedia({ audio: true })
    const devices = await navigator.mediaDevices.enumerateDevices()
    return devices
      .filter((d) => d.kind === "audioinput")
      .map((d) => ({
        deviceId: d.deviceId,
        label: d.label || `Microphone ${d.deviceId.slice(0, 5)}`,
      }))
  } catch {
    return []
  }
}

export type MicSelectorProps = HTMLAttributes<HTMLDivElement> & {
  value?: string
  defaultValue?: string
  onValueChange?: (deviceId: string) => void
  open?: boolean
  defaultOpen?: boolean
  onOpenChange?: (open: boolean) => void
}

export function MicSelector({
  value,
  defaultValue,
  onValueChange,
  open,
  defaultOpen,
  onOpenChange,
  className,
  ...props
}: MicSelectorProps) {
  const [devices, setDevices] = useState<MediaDevice[]>([])
  const [selected, setSelected] = useState(defaultValue ?? "")

  const activeId = value !== undefined ? value : selected
  const activeLabel = devices.find((d) => d.deviceId === activeId)?.label ?? "Default microphone"

  const loadDevices = useCallback(async () => {
    const found = await getAudioInputs()
    setDevices(found)
    if (!activeId && found.length > 0) {
      const id = found[0].deviceId
      setSelected(id)
      onValueChange?.(id)
    }
  }, [activeId, onValueChange])

  useEffect(() => {
    loadDevices()
    navigator.mediaDevices.addEventListener("devicechange", loadDevices)
    return () => navigator.mediaDevices.removeEventListener("devicechange", loadDevices)
  }, [loadDevices])

  const handleSelect = (deviceId: string) => {
    if (value === undefined) setSelected(deviceId)
    onValueChange?.(deviceId)
  }

  return (
    <div className={cn(className)} {...props}>
      <Popover open={open} defaultOpen={defaultOpen} onOpenChange={onOpenChange}>
        <PopoverTrigger
          render={<Button variant="outline" size="sm" className="gap-1.5" />}
        >
          <MicIcon className="size-3.5" />
          <span className="max-w-[140px] truncate text-xs">{activeLabel}</span>
        </PopoverTrigger>
        <PopoverContent className="w-72 p-1" align="start">
          {devices.length === 0 ? (
            <p className="px-3 py-2 text-xs text-muted-foreground">
              No microphones found
            </p>
          ) : (
            devices.map((d) => (
              <button
                key={d.deviceId}
                type="button"
                onClick={() => handleSelect(d.deviceId)}
                className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-xs hover:bg-muted"
              >
                <MicIcon className="size-3.5 shrink-0 text-muted-foreground" />
                <span className="flex-1 truncate">{d.label}</span>
                {d.deviceId === activeId && (
                  <CheckIcon className="size-3.5 shrink-0 text-primary" />
                )}
              </button>
            ))
          )}
        </PopoverContent>
      </Popover>
    </div>
  )
}
