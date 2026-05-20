"use client"

import {
  ChevronDownIcon,
  ChevronRightIcon,
  FileIcon,
  FolderIcon,
  FolderOpenIcon,
} from "lucide-react"
import type { HTMLAttributes, ReactNode } from "react"
import {
  createContext,
  useCallback,
  useContext,
  useId,
  useState,
} from "react"
import { cn } from "@/lib/utils"

interface FileTreeContextValue {
  expanded: Set<string>
  selectedPath: string | undefined
  toggleExpanded: (path: string) => void
  onSelect: ((path: string) => void) | undefined
}

const FileTreeContext = createContext<FileTreeContextValue>({
  expanded: new Set(),
  selectedPath: undefined,
  toggleExpanded: () => {},
  onSelect: undefined,
})

export type FileTreeProps = HTMLAttributes<HTMLDivElement> & {
  expanded?: string[]
  defaultExpanded?: string[]
  selectedPath?: string
  onSelect?: (path: string) => void
  onExpandedChange?: (expanded: string[]) => void
}

export function FileTree({
  expanded: controlledExpanded,
  defaultExpanded = [],
  selectedPath,
  onSelect,
  onExpandedChange,
  className,
  children,
  ...props
}: FileTreeProps) {
  const [internalExpanded, setInternalExpanded] = useState<Set<string>>(
    () => new Set(defaultExpanded)
  )

  const expanded =
    controlledExpanded !== undefined
      ? new Set(controlledExpanded)
      : internalExpanded

  const toggleExpanded = useCallback(
    (path: string) => {
      if (controlledExpanded !== undefined) {
        const next = new Set(controlledExpanded)
        if (next.has(path)) next.delete(path)
        else next.add(path)
        onExpandedChange?.(Array.from(next))
      } else {
        setInternalExpanded((prev) => {
          const next = new Set(prev)
          if (next.has(path)) next.delete(path)
          else next.add(path)
          onExpandedChange?.(Array.from(next))
          return next
        })
      }
    },
    [controlledExpanded, onExpandedChange]
  )

  return (
    <FileTreeContext.Provider
      value={{ expanded, selectedPath, toggleExpanded, onSelect }}
    >
      <div
        role="tree"
        className={cn("select-none font-mono text-sm", className)}
        {...props}
      >
        {children}
      </div>
    </FileTreeContext.Provider>
  )
}

export type FileTreeFolderProps = HTMLAttributes<HTMLDivElement> & {
  path: string
  name: string
  icon?: ReactNode
}

export function FileTreeFolder({
  path,
  name,
  icon,
  className,
  children,
  ...props
}: FileTreeFolderProps) {
  const { expanded, toggleExpanded } = useContext(FileTreeContext)
  const isOpen = expanded.has(path)

  return (
    <div role="treeitem" aria-expanded={isOpen} className={cn(className)} {...props}>
      <button
        type="button"
        onClick={() => toggleExpanded(path)}
        className="flex w-full items-center gap-1.5 rounded px-1 py-0.5 text-left hover:bg-muted/50 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
      >
        {isOpen ? (
          <ChevronDownIcon className="size-3.5 shrink-0 text-muted-foreground" />
        ) : (
          <ChevronRightIcon className="size-3.5 shrink-0 text-muted-foreground" />
        )}
        {icon ?? (
          isOpen ? (
            <FolderOpenIcon className="size-3.5 shrink-0 text-amber-500" />
          ) : (
            <FolderIcon className="size-3.5 shrink-0 text-amber-500" />
          )
        )}
        <span className="truncate">{name}</span>
      </button>
      {isOpen && (
        <div role="group" className="ml-4 border-l border-border/50 pl-2">
          {children}
        </div>
      )}
    </div>
  )
}

export type FileTreeFileProps = HTMLAttributes<HTMLButtonElement> & {
  path: string
  name: string
  icon?: ReactNode
}

export function FileTreeFile({
  path,
  name,
  icon,
  className,
  ...props
}: FileTreeFileProps) {
  const { selectedPath, onSelect } = useContext(FileTreeContext)
  const isSelected = selectedPath === path

  return (
    <button
      type="button"
      role="treeitem"
      aria-selected={isSelected}
      onClick={() => onSelect?.(path)}
      className={cn(
        "flex w-full items-center gap-1.5 rounded px-1 py-0.5 text-left hover:bg-muted/50 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring",
        isSelected && "bg-muted",
        className
      )}
      {...(props as Parameters<typeof FileTreeFile>[0])}
    >
      <span className="size-3.5 shrink-0" />
      {icon ?? <FileIcon className="size-3.5 shrink-0 text-muted-foreground" />}
      <span className="truncate text-foreground/80">{name}</span>
    </button>
  )
}
