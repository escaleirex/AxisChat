import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { encrypt } from "@/lib/encryption"
import { PROVIDER_MAP } from "@/lib/providers"
import { INTEGRATION_MAP } from "@/lib/integrations"
import { headers } from "next/headers"
import { NextResponse } from "next/server"

export async function GET() {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session) return new Response("Unauthorized", { status: 401 })

  const keys = await db.userApiKey.findMany({
    where: { userId: session.user.id },
    select: { provider: true, updatedAt: true },
  })

  return NextResponse.json(keys)
}

export async function POST(req: Request) {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session) return new Response("Unauthorized", { status: 401 })

  const { provider, apiKey } = await req.json()

  if (!provider || !apiKey) {
    return new Response("Missing provider or apiKey", { status: 400 })
  }

  if (!PROVIDER_MAP[provider] && !INTEGRATION_MAP[provider]) {
    return new Response("Unknown provider", { status: 400 })
  }

  const encKey = encrypt(apiKey)

  await db.userApiKey.upsert({
    where: { userId_provider: { userId: session.user.id, provider } },
    create: { userId: session.user.id, provider, encKey },
    update: { encKey },
  })

  return NextResponse.json({ success: true })
}

export async function DELETE(req: Request) {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session) return new Response("Unauthorized", { status: 401 })

  const { provider } = await req.json()

  if (!provider) return new Response("Missing provider", { status: 400 })

  await db.userApiKey.deleteMany({
    where: { userId: session.user.id, provider },
  })

  return new Response(null, { status: 204 })
}
