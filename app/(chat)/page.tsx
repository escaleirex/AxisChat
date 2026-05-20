"use client"

import { BotIcon, KeyRoundIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { buttonVariants } from "@/components/ui/button"
import Link from "next/link"
import { cn } from "@/lib/utils"

export default function HomePage() {
  return (
    <div className="flex flex-1 items-center justify-center">
      <div className="flex flex-col items-center gap-4 text-center">
        <BotIcon className="h-12 w-12 text-muted-foreground" />
        <div>
          <h1 className="text-xl font-semibold">AI Chat</h1>
          <p className="text-sm text-muted-foreground mt-1">
            12 providers · 50+ models · your keys
          </p>
        </div>
        <div className="flex gap-2 mt-2">
          <Button
            onClick={async () => {
              const res = await fetch("/api/chats", { method: "POST" })
              if (res.ok) {
                const chat = await res.json()
                window.location.href = `/${chat.id}`
              }
            }}
          >
            New Chat
          </Button>
          <Link
            href="/settings"
            className={cn(buttonVariants({ variant: "outline" }), "gap-1.5")}
          >
            <KeyRoundIcon className="h-4 w-4" />
            Add API Keys
          </Link>
        </div>
      </div>
    </div>
  )
}
