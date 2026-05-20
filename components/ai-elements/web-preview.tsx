"use client"

import {
  ExternalLinkIcon,
  MaximizeIcon,
  MonitorIcon,
  RefreshCwIcon,
  SmartphoneIcon,
  TabletIcon,
} from "lucide-react"
import type { HTMLAttributes, IframeHTMLAttributes } from "react"
import { useCallback, useRef, useState } from "react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

export type DeviceMode = "desktop" | "tablet" | "mobile"

export type WebPreviewProps = HTMLAttributes<HTMLDivElement> & {
  defaultUrl?: string
  onUrlChange?: (url: string) => void
}

export function WebPreview({
  defaultUrl = "",
  onUrlChange,
  className,
  children,
  ...props
}: WebPreviewProps) {
  const [url, setUrl] = useState(defaultUrl)
  const [device, setDevice] = useState<DeviceMode>("desktop")
  const iframeRef = useRef<HTMLIFrameElement>(null)

  const handleUrlChange = useCallback(
    (newUrl: string) => {
      setUrl(newUrl)
      onUrlChange?.(newUrl)
    },
    [onUrlChange]
  )

  const handleRefresh = useCallback(() => {
    if (iframeRef.current) {
      iframeRef.current.src = iframeRef.current.src
    }
  }, [])

  const deviceWidths: Record<DeviceMode, string> = {
    desktop: "w-full",
    tablet: "mx-auto w-[768px] max-w-full",
    mobile: "mx-auto w-[375px] max-w-full",
  }

  return (
    <div
      className={cn("flex flex-col rounded-lg border bg-card overflow-hidden", className)}
      {...props}
    >
      <div className="flex items-center gap-2 border-b bg-muted/30 px-3 py-2">
        <Button variant="ghost" size="icon-xs" onClick={handleRefresh}>
          <RefreshCwIcon className="size-3.5" />
          <span className="sr-only">Refresh</span>
        </Button>
        <div className="flex flex-1 items-center gap-1.5 rounded-md border bg-background px-2 py-1 text-xs text-muted-foreground font-mono overflow-hidden">
          <span className="truncate">{url || "about:blank"}</span>
        </div>
        {url && (
          <Button
            variant="ghost"
            size="icon-xs"
            onClick={() => window.open(url, "_blank")}
          >
            <ExternalLinkIcon className="size-3.5" />
            <span className="sr-only">Open in new tab</span>
          </Button>
        )}
        <div className="flex items-center gap-0.5 rounded-md border p-0.5">
          <DeviceButton
            mode="desktop"
            current={device}
            onChange={setDevice}
            icon={<MonitorIcon className="size-3.5" />}
          />
          <DeviceButton
            mode="tablet"
            current={device}
            onChange={setDevice}
            icon={<TabletIcon className="size-3.5" />}
          />
          <DeviceButton
            mode="mobile"
            current={device}
            onChange={setDevice}
            icon={<SmartphoneIcon className="size-3.5" />}
          />
        </div>
      </div>
      <div className="min-h-[200px] overflow-auto bg-white">
        <div className={cn("h-full transition-all", deviceWidths[device])}>
          {children ?? (
            <WebPreviewBody ref={iframeRef} src={url} title="Web Preview" />
          )}
        </div>
      </div>
    </div>
  )
}

function DeviceButton({
  mode,
  current,
  onChange,
  icon,
}: {
  mode: DeviceMode
  current: DeviceMode
  onChange: (m: DeviceMode) => void
  icon: React.ReactNode
}) {
  return (
    <button
      type="button"
      onClick={() => onChange(mode)}
      className={cn(
        "rounded p-1 transition-colors",
        current === mode
          ? "bg-background text-foreground shadow-sm"
          : "text-muted-foreground hover:text-foreground"
      )}
    >
      {icon}
      <span className="sr-only">{mode}</span>
    </button>
  )
}

export type WebPreviewBodyProps = IframeHTMLAttributes<HTMLIFrameElement>

export const WebPreviewBody = ({
  className,
  ...props
}: WebPreviewBodyProps & { ref?: React.Ref<HTMLIFrameElement> }) => (
  <iframe
    className={cn("h-full w-full min-h-[300px]", className)}
    sandbox="allow-scripts allow-same-origin allow-forms"
    {...props}
  />
)
