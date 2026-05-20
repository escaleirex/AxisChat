"use client"

import { XIcon } from "lucide-react"
import type { HTMLAttributes, ReactNode } from "react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

export type ArtifactProps = HTMLAttributes<HTMLDivElement>

export function Artifact({ className, ...props }: ArtifactProps) {
  return (
    <div
      className={cn(
        "rounded-xl border bg-card text-card-foreground shadow-sm",
        className
      )}
      {...props}
    />
  )
}

export type ArtifactHeaderProps = HTMLAttributes<HTMLDivElement> & {
  onClose?: () => void
}

export function ArtifactHeader({
  className,
  children,
  onClose,
  ...props
}: ArtifactHeaderProps) {
  return (
    <div
      className={cn(
        "flex items-center gap-2 border-b px-4 py-2.5",
        className
      )}
      {...props}
    >
      <div className="flex flex-1 items-center gap-2 overflow-hidden">
        {children}
      </div>
      {onClose && (
        <Button
          variant="ghost"
          size="icon-xs"
          onClick={onClose}
          className="shrink-0"
        >
          <XIcon className="size-3.5" />
          <span className="sr-only">Close</span>
        </Button>
      )}
    </div>
  )
}

export type ArtifactTitleProps = HTMLAttributes<HTMLSpanElement>

export function ArtifactTitle({ className, ...props }: ArtifactTitleProps) {
  return (
    <span
      className={cn("truncate text-sm font-medium", className)}
      {...props}
    />
  )
}

export type ArtifactDescriptionProps = HTMLAttributes<HTMLSpanElement>

export function ArtifactDescription({
  className,
  ...props
}: ArtifactDescriptionProps) {
  return (
    <span
      className={cn("truncate text-xs text-muted-foreground", className)}
      {...props}
    />
  )
}

export type ArtifactActionsProps = HTMLAttributes<HTMLDivElement>

export function ArtifactActions({
  className,
  ...props
}: ArtifactActionsProps) {
  return (
    <div
      className={cn("flex items-center gap-1", className)}
      {...props}
    />
  )
}

export type ArtifactActionProps = HTMLAttributes<HTMLButtonElement> & {
  icon: ReactNode
  tooltip?: string
  label?: string
}

export function ArtifactAction({
  icon,
  tooltip,
  label,
  className,
  ...props
}: ArtifactActionProps) {
  const button = (
    <Button
      variant="ghost"
      size={label ? "sm" : "icon-sm"}
      className={cn("gap-1.5", className)}
      {...(props as Parameters<typeof Button>[0])}
    >
      {icon}
      {label && <span>{label}</span>}
      {!label && <span className="sr-only">{tooltip}</span>}
    </Button>
  )

  if (!tooltip) return button

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger render={button} />
        <TooltipContent>{tooltip}</TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}

export type ArtifactBodyProps = HTMLAttributes<HTMLDivElement>

export function ArtifactBody({ className, ...props }: ArtifactBodyProps) {
  return <div className={cn("p-4", className)} {...props} />
}
