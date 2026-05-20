import { streamText, convertToModelMessages, isLoopFinished, zodSchema } from "ai"
import { z } from "zod"
import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { decrypt } from "@/lib/encryption"
import { getModel } from "@/lib/providers"
import { SYSTEM_PROMPT } from "@/lib/system-prompt"
import { braveSearch } from "@/lib/search"
import { headers } from "next/headers"

export const maxDuration = 60

export async function POST(req: Request) {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session) return new Response("Unauthorized", { status: 401 })

  const { chatId, provider, model, messages } = await req.json()

  if (!chatId || !provider || !model || !messages) {
    return new Response("Missing required fields", { status: 400 })
  }

  const apiKeyRecord = await db.userApiKey.findUnique({
    where: { userId_provider: { userId: session.user.id, provider } },
  })

  if (!apiKeyRecord) {
    return new Response(`No API key set for ${provider}`, { status: 400 })
  }

  const apiKey = decrypt(apiKeyRecord.encKey)
  const languageModel = getModel(provider, model, apiKey)

  const modelMessages = await convertToModelMessages(messages)

  // Load Brave Search key if user has one
  const braveKeyRecord = await db.userApiKey.findUnique({
    where: { userId_provider: { userId: session.user.id, provider: "brave-search" } },
  })
  const braveApiKey = braveKeyRecord ? decrypt(braveKeyRecord.encKey) : null

  const tools = braveApiKey
    ? {
        webSearch: {
          description:
            "Search the web for current information. Use for recent events, current facts, prices, people in roles, latest news, or anything time-sensitive.",
          inputSchema: zodSchema(
            z.object({
              query: z.string().describe("Concise 1-6 word search query"),
            })
          ),
          execute: async ({ query }: { query: string }) => {
            return braveSearch(query, braveApiKey!)
          },
        },
      }
    : undefined

  const result = streamText({
    model: languageModel,
    system: SYSTEM_PROMPT,
    messages: modelMessages,
    tools,
    stopWhen: isLoopFinished(),
    onFinish: async ({ text }) => {
      await db.message.create({
        data: {
          chatId,
          role: "assistant",
          content: text,
          model,
          provider,
        },
      })

      const msgCount = await db.message.count({ where: { chatId } })
      if (msgCount <= 2) {
        const firstUserMsg = modelMessages.find((m) => m.role === "user")
        if (firstUserMsg) {
          const content = firstUserMsg.content
          const title = typeof content === "string"
            ? content.slice(0, 60)
            : Array.isArray(content)
            ? (content.find((p: { type: string; text?: string }) => p.type === "text") as { type: string; text?: string } | undefined)?.text?.slice(0, 60) ?? "New Chat"
            : "New Chat"
          await db.chat.update({
            where: { id: chatId },
            data: { title, model, provider },
          })
        }
      }
    },
  })

  return result.toUIMessageStreamResponse()
}
