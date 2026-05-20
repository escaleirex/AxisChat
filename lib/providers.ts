import { createOpenAI } from "@ai-sdk/openai"
import { createAnthropic } from "@ai-sdk/anthropic"
import { createGoogleGenerativeAI } from "@ai-sdk/google"
import { createGroq } from "@ai-sdk/groq"
import { createMistral } from "@ai-sdk/mistral"
import { createCohere } from "@ai-sdk/cohere"
import { createXai } from "@ai-sdk/xai"
import { createDeepSeek } from "@ai-sdk/deepseek"
import { createPerplexity } from "@ai-sdk/perplexity"
import { createTogetherAI } from "@ai-sdk/togetherai"
import { createOpenRouter } from "@openrouter/ai-sdk-provider"
import { wrapLanguageModel, extractReasoningMiddleware } from "ai"
import type { LanguageModel } from "ai"

function withReasoning(model: LanguageModel): LanguageModel {
  return wrapLanguageModel({
    model,
    middleware: extractReasoningMiddleware({ tagName: "think" }),
  })
}

// NVIDIA NIM returns reasoning via delta.reasoning_content (not <think> tags).
// This fetch wrapper converts it to <think> tags so extractReasoningMiddleware picks it up.
function nvidiaFetch(input: RequestInfo | URL, init?: RequestInit): Promise<Response> {
  return globalThis.fetch(input, init).then((response) => {
    if (!response.body) return response
    const ct = response.headers.get("content-type") ?? ""
    if (!ct.includes("text/event-stream")) return response

    const decoder = new TextDecoder()
    const encoder = new TextEncoder()
    let buf = ""
    let inReasoning = false

    const transformed = response.body.pipeThrough(
      new TransformStream<Uint8Array, Uint8Array>({
        transform(chunk, controller) {
          buf += decoder.decode(chunk, { stream: true })
          const lines = buf.split("\n")
          buf = lines.pop() ?? ""
          const out: string[] = []
          for (const line of lines) {
            if (!line.startsWith("data: ")) { out.push(line); continue }
            const raw = line.slice(6)
            if (raw === "[DONE]") { out.push(line); continue }
            try {
              const obj = JSON.parse(raw)
              const delta = obj.choices?.[0]?.delta
              if (delta && "reasoning_content" in delta) {
                const rc: string = delta.reasoning_content ?? ""
                const c: string = delta.content ?? ""
                let newContent = ""
                if (rc && !inReasoning) { newContent += "<think>"; inReasoning = true }
                if (rc) newContent += rc
                if (!rc && c && inReasoning) { newContent += "</think>"; inReasoning = false }
                newContent += c
                delta.content = newContent
                delete delta.reasoning_content
              }
              out.push("data: " + JSON.stringify(obj))
            } catch { out.push(line) }
          }
          if (out.length) controller.enqueue(encoder.encode(out.join("\n") + "\n"))
        },
        flush(controller) {
          if (buf) controller.enqueue(encoder.encode(buf))
        },
      })
    )

    return new Response(transformed, {
      headers: response.headers,
      status: response.status,
      statusText: response.statusText,
    })
  })
}

export type ModelDef = {
  id: string
  name: string
  contextLength?: number
  description?: string
  maker?: string // models.dev logo slug for the model's creator
}

export type ProviderDef = {
  id: string
  name: string
  isFree: boolean
  docsUrl: string
  keyLabel: string
  models: ModelDef[]
  createModel: (apiKey: string, modelId: string) => LanguageModel
}

export const PROVIDERS: ProviderDef[] = [
  {
    id: "groq",
    name: "Groq",
    isFree: true,
    docsUrl: "https://console.groq.com/keys",
    keyLabel: "GROQ_API_KEY",
    models: [
      { id: "llama-3.3-70b-versatile", name: "Llama 3.3 70B", contextLength: 128000 },
      { id: "llama-3.1-8b-instant", name: "Llama 3.1 8B (Fast)", contextLength: 128000 },
      { id: "mixtral-8x7b-32768", name: "Mixtral 8x7B", contextLength: 32768 },
      { id: "gemma2-9b-it", name: "Gemma 2 9B", contextLength: 8192 },
      { id: "deepseek-r1-distill-llama-70b", name: "DeepSeek R1 Distill 70B", contextLength: 128000 },
    ],
    createModel: (apiKey, modelId) => withReasoning(createGroq({ apiKey })(modelId)),
  },
  {
    id: "openrouter",
    name: "OpenRouter",
    isFree: true,
    docsUrl: "https://openrouter.ai/keys",
    keyLabel: "OPENROUTER_API_KEY",
    models: [
      { id: "deepseek/deepseek-chat-v3-0324:free", name: "DeepSeek V3 (Free)", contextLength: 163840 },
      { id: "deepseek/deepseek-r1:free", name: "DeepSeek R1 (Free)", contextLength: 163840 },
      { id: "google/gemma-3-27b-it:free", name: "Gemma 3 27B (Free)", contextLength: 8192 },
      { id: "meta-llama/llama-4-scout:free", name: "Llama 4 Scout (Free)", contextLength: 512000 },
      { id: "meta-llama/llama-4-maverick:free", name: "Llama 4 Maverick (Free)", contextLength: 1048576 },
      { id: "qwen/qwen3-235b-a22b:free", name: "Qwen 3 235B (Free)", contextLength: 40960 },
      { id: "mistralai/mistral-small-3.2-24b-instruct:free", name: "Mistral Small 3.2 (Free)", contextLength: 131072 },
      { id: "openai/gpt-4o", name: "GPT-4o (Paid)", contextLength: 128000 },
      { id: "anthropic/claude-sonnet-4-5", name: "Claude Sonnet 4.5 (Paid)", contextLength: 200000 },
    ],
    createModel: (apiKey, modelId) => withReasoning(createOpenRouter({ apiKey })(modelId)),
  },
  {
    id: "nvidia",
    name: "NVIDIA NIM",
    isFree: true,
    docsUrl: "https://build.nvidia.com/explore/discover",
    keyLabel: "NVIDIA_API_KEY",
    models: [
      { id: "meta/llama-4-maverick-17b-128e-instruct", name: "Llama 4 Maverick 17B", contextLength: 1000000 },
      { id: "meta/llama-3.3-70b-instruct", name: "Llama 3.3 70B", contextLength: 128000 },
      { id: "meta/llama-3.1-8b-instruct", name: "Llama 3.1 8B", contextLength: 128000 },
      { id: "deepseek-ai/deepseek-r1", name: "DeepSeek R1", contextLength: 163840 },
      { id: "mistralai/mistral-small-3.1-24b-instruct", name: "Mistral Small 3.1 24B", contextLength: 128000 },
      { id: "qwen/qwen2.5-72b-instruct", name: "Qwen 2.5 72B", contextLength: 131072 },
      { id: "nvidia/llama-3.1-nemotron-ultra-253b-v1", name: "Nemotron Ultra 253B", contextLength: 131072 },
    ],
    createModel: (apiKey, modelId) =>
      withReasoning(
        createOpenAI({
          baseURL: "https://integrate.api.nvidia.com/v1",
          apiKey,
          compatibility: "compatible",
          fetch: nvidiaFetch,
        }).chat(modelId)
      ),
  },
  {
    id: "google",
    name: "Google Gemini",
    isFree: true,
    docsUrl: "https://aistudio.google.com/app/apikey",
    keyLabel: "GOOGLE_GENERATIVE_AI_API_KEY",
    models: [
      { id: "gemini-2.5-flash-preview-05-20", name: "Gemini 2.5 Flash", contextLength: 1048576 },
      { id: "gemini-2.5-pro-preview-05-06", name: "Gemini 2.5 Pro", contextLength: 1048576 },
      { id: "gemini-2.0-flash", name: "Gemini 2.0 Flash", contextLength: 1048576 },
      { id: "gemini-1.5-flash", name: "Gemini 1.5 Flash", contextLength: 1048576 },
    ],
    createModel: (apiKey, modelId) => withReasoning(createGoogleGenerativeAI({ apiKey })(modelId)),
  },
  {
    id: "togetherai",
    name: "Together AI",
    isFree: true,
    docsUrl: "https://api.together.ai/settings/api-keys",
    keyLabel: "TOGETHER_API_KEY",
    models: [
      { id: "meta-llama/Llama-3.3-70B-Instruct-Turbo", name: "Llama 3.3 70B Turbo", contextLength: 131072 },
      { id: "meta-llama/Llama-3.2-90B-Vision-Instruct-Turbo", name: "Llama 3.2 90B Vision", contextLength: 131072 },
      { id: "deepseek-ai/DeepSeek-R1", name: "DeepSeek R1", contextLength: 163840 },
      { id: "Qwen/Qwen2.5-72B-Instruct-Turbo", name: "Qwen 2.5 72B Turbo", contextLength: 131072 },
      { id: "mistralai/Mixtral-8x22B-Instruct-v0.1", name: "Mixtral 8x22B", contextLength: 65536 },
    ],
    createModel: (apiKey, modelId) => withReasoning(createTogetherAI({ apiKey })(modelId)),
  },
  {
    id: "openai",
    name: "OpenAI",
    isFree: false,
    docsUrl: "https://platform.openai.com/api-keys",
    keyLabel: "OPENAI_API_KEY",
    models: [
      { id: "gpt-4o", name: "GPT-4o", contextLength: 128000 },
      { id: "gpt-4o-mini", name: "GPT-4o Mini", contextLength: 128000 },
      { id: "o3-mini", name: "o3 Mini (Reasoning)", contextLength: 200000 },
      { id: "o4-mini", name: "o4 Mini (Reasoning)", contextLength: 200000 },
    ],
    createModel: (apiKey, modelId) => withReasoning(createOpenAI({ apiKey })(modelId)),
  },
  {
    id: "anthropic",
    name: "Anthropic",
    isFree: false,
    docsUrl: "https://console.anthropic.com/settings/keys",
    keyLabel: "ANTHROPIC_API_KEY",
    models: [
      { id: "claude-sonnet-4-6", name: "Claude Sonnet 4.6", contextLength: 200000 },
      { id: "claude-opus-4-7", name: "Claude Opus 4.7", contextLength: 200000 },
      { id: "claude-haiku-4-5-20251001", name: "Claude Haiku 4.5", contextLength: 200000 },
    ],
    createModel: (apiKey, modelId) => withReasoning(createAnthropic({ apiKey })(modelId)),
  },
  {
    id: "mistral",
    name: "Mistral",
    isFree: false,
    docsUrl: "https://console.mistral.ai/api-keys",
    keyLabel: "MISTRAL_API_KEY",
    models: [
      { id: "mistral-large-latest", name: "Mistral Large", contextLength: 131072 },
      { id: "mistral-small-latest", name: "Mistral Small", contextLength: 32768 },
      { id: "codestral-latest", name: "Codestral", contextLength: 262144 },
    ],
    createModel: (apiKey, modelId) => withReasoning(createMistral({ apiKey })(modelId)),
  },
  {
    id: "cohere",
    name: "Cohere",
    isFree: false,
    docsUrl: "https://dashboard.cohere.com/api-keys",
    keyLabel: "COHERE_API_KEY",
    models: [
      { id: "command-r-plus-08-2024", name: "Command R+", contextLength: 128000 },
      { id: "command-r-08-2024", name: "Command R", contextLength: 128000 },
      { id: "command-a-03-2025", name: "Command A", contextLength: 256000 },
    ],
    createModel: (apiKey, modelId) => withReasoning(createCohere({ apiKey })(modelId)),
  },
  {
    id: "xai",
    name: "xAI Grok",
    isFree: false,
    docsUrl: "https://console.x.ai/",
    keyLabel: "XAI_API_KEY",
    models: [
      { id: "grok-3", name: "Grok 3", contextLength: 131072 },
      { id: "grok-3-mini", name: "Grok 3 Mini", contextLength: 131072 },
      { id: "grok-2-1212", name: "Grok 2", contextLength: 131072 },
    ],
    createModel: (apiKey, modelId) => withReasoning(createXai({ apiKey })(modelId)),
  },
  {
    id: "deepseek",
    name: "DeepSeek",
    isFree: false,
    docsUrl: "https://platform.deepseek.com/api_keys",
    keyLabel: "DEEPSEEK_API_KEY",
    models: [
      { id: "deepseek-chat", name: "DeepSeek V3", contextLength: 163840 },
      { id: "deepseek-reasoner", name: "DeepSeek R1 (Reasoning)", contextLength: 163840 },
    ],
    createModel: (apiKey, modelId) => withReasoning(createDeepSeek({ apiKey })(modelId)),
  },
  {
    id: "perplexity",
    name: "Perplexity",
    isFree: false,
    docsUrl: "https://www.perplexity.ai/settings/api",
    keyLabel: "PERPLEXITY_API_KEY",
    models: [
      { id: "sonar-pro", name: "Sonar Pro (Web Search)", contextLength: 200000 },
      { id: "sonar", name: "Sonar (Web Search)", contextLength: 127072 },
      { id: "sonar-reasoning-pro", name: "Sonar Reasoning Pro", contextLength: 128000 },
    ],
    createModel: (apiKey, modelId) => withReasoning(createPerplexity({ apiKey })(modelId)),
  },
]

export const PROVIDER_MAP = Object.fromEntries(PROVIDERS.map((p) => [p.id, p]))

export function getModel(
  providerId: string,
  modelId: string,
  apiKey: string
): LanguageModel {
  const provider = PROVIDER_MAP[providerId]
  if (!provider) throw new Error(`Unknown provider: ${providerId}`)
  return provider.createModel(apiKey, modelId)
}
