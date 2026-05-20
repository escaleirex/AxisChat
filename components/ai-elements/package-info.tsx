"use client"

import type { HTMLAttributes } from "react"
import { cn } from "@/lib/utils"

export type PackageChangeType =
  | "major"
  | "minor"
  | "patch"
  | "added"
  | "removed"

export type PackageInfoProps = HTMLAttributes<HTMLDivElement> & {
  name: string
  currentVersion?: string
  newVersion?: string
  changeType?: PackageChangeType
}

export function PackageInfo({
  name,
  currentVersion,
  newVersion,
  changeType,
  className,
  ...props
}: PackageInfoProps) {
  return (
    <div
      className={cn(
        "flex items-center gap-3 rounded-lg border bg-card px-3 py-2 text-sm",
        className
      )}
      {...props}
    >
      <span className="flex-1 font-mono font-medium">{name}</span>
      {currentVersion && newVersion ? (
        <div className="flex items-center gap-1.5 font-mono text-xs text-muted-foreground">
          <span>{currentVersion}</span>
          <span>→</span>
          <span className={cn(changeTypeFg(changeType))}>{newVersion}</span>
        </div>
      ) : currentVersion ? (
        <span className="font-mono text-xs text-muted-foreground">
          {currentVersion}
        </span>
      ) : newVersion ? (
        <span className={cn("font-mono text-xs", changeTypeFg(changeType))}>
          {newVersion}
        </span>
      ) : null}
      {changeType && <PackageChangeBadge type={changeType} />}
    </div>
  )
}

export type PackageChangeBadgeProps = { type: PackageChangeType; className?: string }

export function PackageChangeBadge({ type, className }: PackageChangeBadgeProps) {
  const styles: Record<PackageChangeType, string> = {
    major: "bg-red-500/15 text-red-600 dark:text-red-400",
    minor: "bg-yellow-500/15 text-yellow-600 dark:text-yellow-400",
    patch: "bg-green-500/15 text-green-600 dark:text-green-400",
    added: "bg-blue-500/15 text-blue-600 dark:text-blue-400",
    removed: "bg-muted text-muted-foreground line-through",
  }

  return (
    <span
      className={cn(
        "shrink-0 rounded px-1.5 py-0.5 text-xs font-medium capitalize",
        styles[type],
        className
      )}
    >
      {type}
    </span>
  )
}

function changeTypeFg(type: PackageChangeType | undefined): string {
  switch (type) {
    case "major":
      return "text-red-600 dark:text-red-400"
    case "minor":
      return "text-yellow-600 dark:text-yellow-400"
    case "patch":
      return "text-green-600 dark:text-green-400"
    case "added":
      return "text-blue-600 dark:text-blue-400"
    case "removed":
      return "text-muted-foreground"
    default:
      return "text-foreground"
  }
}
