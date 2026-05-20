"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useRouter, usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { signOut, useSession } from "@/lib/auth-client"
import { cn } from "@/lib/utils"
import {
  MessageSquarePlusIcon,
  SettingsIcon,
  LogOutIcon,
  Trash2Icon,
  BotIcon,
} from "lucide-react"

type Chat = {
  id: string
  title: string
  provider: string | null
  updatedAt: string
}

export function Sidebar() {
  const { data: session } = useSession()
  const router = useRouter()
  const pathname = usePathname()
  const [chats, setChats] = useState<Chat[]>([])

  async function loadChats() {
    const res = await fetch("/api/chats")
    if (res.ok) setChats(await res.json())
  }

  async function createChat() {
    const res = await fetch("/api/chats", { method: "POST" })
    if (res.ok) {
      const chat = await res.json()
      router.push(`/${chat.id}`)
      loadChats()
    }
  }

  async function deleteChat(id: string, e: React.MouseEvent) {
    e.preventDefault()
    e.stopPropagation()
    await fetch(`/api/chats/${id}`, { method: "DELETE" })
    if (pathname === `/${id}`) router.push("/")
    loadChats()
  }

  useEffect(() => {
    loadChats()
  }, [pathname])

  return (
    <aside className="flex h-full w-64 flex-col border-r bg-sidebar">
      <div className="flex items-center gap-2 p-4">
        <BotIcon className="h-5 w-5 text-primary" />
        <span className="font-semibold text-sm">AI Chat</span>
      </div>
      <div className="px-3">
        <Button
          onClick={createChat}
          className="w-full justify-start gap-2"
          variant="outline"
          size="sm"
        >
          <MessageSquarePlusIcon className="h-4 w-4" />
          New Chat
        </Button>
      </div>
      <Separator className="mt-3" />
      <nav className="flex-1 overflow-y-auto px-2 py-2 space-y-0.5">
        {chats.map((chat) => {
          const active = pathname === `/${chat.id}`
          return (
            <Link
              key={chat.id}
              href={`/${chat.id}`}
              className={cn(
                "group flex items-center justify-between rounded-md px-2 py-1.5 text-xs hover:bg-accent",
                active && "bg-accent font-medium"
              )}
            >
              <span className="truncate flex-1">{chat.title}</span>
              <button
                onClick={(e) => deleteChat(chat.id, e)}
                className="ml-1 hidden rounded p-0.5 text-muted-foreground hover:text-destructive group-hover:flex"
              >
                <Trash2Icon className="h-3 w-3" />
              </button>
            </Link>
          )
        })}
        {chats.length === 0 && (
          <p className="px-2 py-4 text-center text-xs text-muted-foreground">
            No chats yet
          </p>
        )}
      </nav>
      <Separator />
      <div className="p-3 space-y-1">
        <Link
          href="/settings"
          className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-xs hover:bg-accent"
        >
          <SettingsIcon className="h-4 w-4" />
          Settings & API Keys
        </Link>
        <div className="flex items-center gap-2 px-2 py-1">
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium truncate">{session?.user.name ?? session?.user.email}</p>
            <p className="text-[10px] text-muted-foreground truncate">{session?.user.email}</p>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 shrink-0"
            onClick={() => signOut().then(() => router.push("/login"))}
          >
            <LogOutIcon className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>
    </aside>
  )
}
