import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { decrypt } from "@/lib/encryption"
import { PROVIDER_MAP } from "@/lib/providers"
import { headers } from "next/headers"
import { NextRequest, NextResponse } from "next/server"

type ModelDef = { id: string; name: string; contextLength?: number; maker?: string }

// Maps model ID prefixes (owner/slug) to models.dev logo slugs
const MAKER_LOGO: Record<string, string> = {
  "anthropic": "anthropic",
  "openai": "openai",
  "google": "google",
  "meta-llama": "llama",
  "mistralai": "mistral",
  "deepseek": "deepseek",
  "deepseek-ai": "deepseek",
  "nvidia": "nvidia",
  "x-ai": "xai",
  "qwen": "alibaba",
  "alibaba": "alibaba",
  "moonshotai": "moonshotai",
  "bytedance-seed": "bytedance",
  "bytedance": "bytedance",
  "z-ai": "zai",
  "zhipuai": "zhipuai",
  "amazon": "amazon-bedrock",
  "microsoft": "azure",
  "morph": "morph",
  "inception": "inception",
  "perplexity": "perplexity",
  "upstage": "upstage",
  "openrouter": "openrouter",
  "cohere": "cohere",
  "minimax": "minimax",
  "baidu": "baidu",
  "ibm-granite": "ibm",
  "tencent": "tencent",
  "nousresearch": "nous",
  "arcee-ai": "arcee",
  "liquid": "liquid",
  "ai21": "ai21",
  "allenai": "allenai",
  "xiaomi": "xiaomi",
  "aion-labs": "aion",
  "rekaai": "reka",
  "kwaipilot": "kwaipilot",
  "poolside": "poolside",
  "stepfun": "stepfun",
  "prime-intellect": "prime-intellect",
  "inclusionai": "inclusionai",
  "switchpoint": "switchpoint",
  "relace": "relace",
  "nex-agi": "nex-agi",
  "deepcogito": "deepcogito",
  "essentialai": "essentialai",
  "inflection": "inflection",
  "mancer": "mancer",
  "writer": "writer",
  "thedrummer": "thedrummer",
  "anthracite-org": "anthracite",
  "sao10k": "sao10k",
  "perceptron": "perceptron",
  "undi95": "undi95",
  "gryphe": "gryphe",
  "alfredpros": "alfredpros",
  "cognitivecomputations": "cognitivecomputations",
  "nex-agi/deepseek": "deepseek",
}

function makerLogo(modelId: string): string | undefined {
  const prefix = modelId.split("/")[0]
  if (!prefix) return undefined
  return MAKER_LOGO[prefix] ?? prefix
}

function formatId(id: string): string {
  const base = id.split("/").pop() ?? id
  return base
    .split(/[-_]/)
    .map((part) => {
      if (/^\d/.test(part)) return part
      if (part.toLowerCase() === "it") return "IT"
      return part.charAt(0).toUpperCase() + part.slice(1)
    })
    .join(" ")
}

async function fetchGroq(apiKey: string): Promise<ModelDef[]> {
  const res = await fetch("https://api.groq.com/openai/v1/models", {
    headers: { Authorization: `Bearer ${apiKey}` },
    next: { revalidate: 3600 },
  })
  if (!res.ok) return []
  const json = await res.json()
  return (json.data ?? [])
    .filter(
      (m: { id: string; object: string }) =>
        m.object === "model" &&
        !m.id.startsWith("whisper") &&
        !m.id.includes("guard") &&
        !m.id.includes("tool-use") &&
        !m.id.includes("speech")
    )
    .map((m: { id: string; context_window?: number }) => ({
      id: m.id,
      name: formatId(m.id),
      contextLength: m.context_window,
      maker: makerLogo(m.id),
    }))
    .sort((a: ModelDef, b: ModelDef) => a.name.localeCompare(b.name))
}

async function fetchOpenRouter(apiKey: string): Promise<ModelDef[]> {
  const res = await fetch("https://openrouter.ai/api/v1/models", {
    headers: { Authorization: `Bearer ${apiKey}` },
    next: { revalidate: 3600 },
  })
  if (!res.ok) return []
  const json = await res.json()
  const seen = new Set<string>()
  return (json.data ?? [])
    .map((m: { id: string; name?: string; context_length?: number }) => ({
      id: m.id,
      name: m.name || m.id,
      contextLength: m.context_length,
      maker: makerLogo(m.id),
    }))
    .filter((m: ModelDef) => {
      if (seen.has(m.id)) return false
      seen.add(m.id)
      return true
    })
}

async function fetchNvidia(apiKey: string): Promise<ModelDef[]> {
  const res = await fetch("https://integrate.api.nvidia.com/v1/models", {
    headers: { Authorization: `Bearer ${apiKey}` },
    next: { revalidate: 3600 },
  })
  if (!res.ok) return []
  const json = await res.json()
  return (json.data ?? [])
    .filter((m: { id: string; object: string }) =>
      m.object === "model" || !m.object
    )
    .map((m: { id: string; context_window?: number }) => ({
      id: m.id,
      name: formatId(m.id),
      contextLength: m.context_window,
      maker: makerLogo(m.id),
    }))
    .sort((a: ModelDef, b: ModelDef) => a.name.localeCompare(b.name))
}

async function fetchGoogle(apiKey: string): Promise<ModelDef[]> {
  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}&pageSize=100`,
    { next: { revalidate: 3600 } }
  )
  if (!res.ok) return []
  const json = await res.json()
  return (json.models ?? [])
    .filter((m: { supportedGenerationMethods?: string[] }) =>
      m.supportedGenerationMethods?.includes("generateContent")
    )
    .map(
      (m: {
        name: string
        displayName?: string
        inputTokenLimit?: number
      }) => ({
        id: m.name.replace("models/", ""),
        name: m.displayName ?? formatId(m.name.replace("models/", "")),
        contextLength: m.inputTokenLimit,
        maker: "google",
      })
    )
    .filter(
      (m: ModelDef) =>
        m.id.startsWith("gemini") && !m.id.includes("embedding")
    )
    .sort((a: ModelDef, b: ModelDef) => b.id.localeCompare(a.id))
}

async function fetchTogetherAI(apiKey: string): Promise<ModelDef[]> {
  const res = await fetch("https://api.together.xyz/v1/models", {
    headers: { Authorization: `Bearer ${apiKey}` },
    next: { revalidate: 3600 },
  })
  if (!res.ok) return []
  const json = await res.json()
  return (Array.isArray(json) ? json : [])
    .filter((m: { type?: string }) => m.type === "chat")
    .map((m: { id: string; display_name?: string; context_length?: number }) => ({
      id: m.id,
      name: m.display_name ?? formatId(m.id),
      contextLength: m.context_length,
      maker: makerLogo(m.id),
    }))
    .sort((a: ModelDef, b: ModelDef) => a.name.localeCompare(b.name))
}

async function fetchOpenAI(apiKey: string): Promise<ModelDef[]> {
  const res = await fetch("https://api.openai.com/v1/models", {
    headers: { Authorization: `Bearer ${apiKey}` },
    next: { revalidate: 3600 },
  })
  if (!res.ok) return []
  const json = await res.json()
  return (json.data ?? [])
    .filter((m: { id: string }) =>
      /^(gpt-|o\d)/.test(m.id) &&
      !m.id.includes("instruct") &&
      !m.id.includes("realtime") &&
      !m.id.includes("audio") &&
      !m.id.includes("tts") &&
      !m.id.includes("whisper") &&
      !m.id.includes("dall")
    )
    .map((m: { id: string }) => ({
      id: m.id,
      name: formatId(m.id),
      maker: "openai",
    }))
    .sort((a: ModelDef, b: ModelDef) => b.id.localeCompare(a.id))
}

async function fetchMistral(apiKey: string): Promise<ModelDef[]> {
  const res = await fetch("https://api.mistral.ai/v1/models", {
    headers: { Authorization: `Bearer ${apiKey}` },
    next: { revalidate: 3600 },
  })
  if (!res.ok) return []
  const json = await res.json()
  return (json.data ?? [])
    .filter(
      (m: { id: string; capabilities?: { completion_chat?: boolean } }) =>
        m.capabilities?.completion_chat !== false
    )
    .map((m: { id: string; name?: string }) => ({
      id: m.id,
      name: m.name ?? formatId(m.id),
      maker: "mistral",
    }))
    .sort((a: ModelDef, b: ModelDef) => a.name.localeCompare(b.name))
}

async function fetchXai(apiKey: string): Promise<ModelDef[]> {
  const res = await fetch("https://api.x.ai/v1/models", {
    headers: { Authorization: `Bearer ${apiKey}` },
    next: { revalidate: 3600 },
  })
  if (!res.ok) return []
  const json = await res.json()
  return (json.data ?? [])
    .map((m: { id: string; context_length?: number }) => ({
      id: m.id,
      name: formatId(m.id),
      contextLength: m.context_length,
      maker: "xai",
    }))
    .sort((a: ModelDef, b: ModelDef) => b.id.localeCompare(a.id))
}

const FETCHERS: Record<
  string,
  ((apiKey: string) => Promise<ModelDef[]>) | undefined
> = {
  groq: fetchGroq,
  openrouter: fetchOpenRouter,
  nvidia: fetchNvidia,
  google: fetchGoogle,
  togetherai: fetchTogetherAI,
  openai: fetchOpenAI,
  mistral: fetchMistral,
  xai: fetchXai,
}

export async function GET(req: NextRequest) {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const provider = req.nextUrl.searchParams.get("provider")
  if (!provider) return NextResponse.json({ error: "Missing provider" }, { status: 400 })

  const providerDef = PROVIDER_MAP[provider]
  if (!providerDef) return NextResponse.json({ error: "Unknown provider" }, { status: 400 })

  const keyRecord = await db.userApiKey.findUnique({
    where: { userId_provider: { userId: session.user.id, provider } },
  })
  if (!keyRecord) return NextResponse.json(providerDef.models)

  const apiKey = decrypt(keyRecord.encKey)
  const fetcher = FETCHERS[provider]

  if (!fetcher) return NextResponse.json(providerDef.models)

  try {
    const models = await fetcher(apiKey)
    if (models.length === 0) return NextResponse.json(providerDef.models)
    return NextResponse.json(models)
  } catch {
    return NextResponse.json(providerDef.models)
  }
}
