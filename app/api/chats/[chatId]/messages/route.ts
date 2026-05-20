import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { headers } from "next/headers"
import { NextResponse } from "next/server"

export async function POST(
  req: Request,
  { params }: { params: Promise<{ chatId: string }> }
) {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session) return new Response("Unauthorized", { status: 401 })

  const { chatId } = await params
  const { content } = await req.json()

  const chat = await db.chat.findFirst({
    where: { id: chatId, userId: session.user.id },
  })
  if (!chat) return new Response("Not found", { status: 404 })

  const message = await db.message.create({
    data: { chatId, role: "user", content },
  })

  return NextResponse.json(message)
}
