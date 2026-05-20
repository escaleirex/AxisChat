"use client"

import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { toast } from "sonner"
import { useParams } from "next/navigation"
import { Chat, useChat } from "@ai-sdk/react"
import { DefaultChatTransport } from "ai"
import type { UIMessage, FileUIPart } from "ai"
import {
  Conversation,
  ConversationContent,
  ConversationEmptyState,
  ConversationScrollButton,
} from "@/components/ai-elements/conversation"
import {
  Message,
  MessageContent,
  MessageActions,
  MessageAction,
} from "@/components/ai-elements/message"
import { AnimatedMarkdown } from "flowtoken"
import {
  Reasoning,
  ReasoningTrigger,
} from "@/components/ai-elements/reasoning"
import { CollapsibleContent } from "@/components/ui/collapsible"
import {
  Attachment,
  AttachmentPreview,
  AttachmentRemove,
  Attachments,
} from "@/components/ai-elements/attachments"
import {
  ModelSelector,
  ModelSelectorContent,
  ModelSelectorEmpty,
  ModelSelectorGroup,
  ModelSelectorInput,
  ModelSelectorItem,
  ModelSelectorList,
  ModelSelectorLogo,
  ModelSelectorName,
  ModelSelectorTrigger,
} from "@/components/ai-elements/model-selector"
import type { PromptInputMessage } from "@/components/ai-elements/prompt-input"
import {
  PromptInput,
  PromptInputActionAddAttachments,
  PromptInputActionAddScreenshot,
  PromptInputActionMenu,
  PromptInputActionMenuContent,
  PromptInputActionMenuTrigger,
  PromptInputBody,
  PromptInputButton,
  PromptInputFooter,
  PromptInputProvider,
  PromptInputSubmit,
  PromptInputTextarea,
  PromptInputTools,
  usePromptInputAttachments,
  usePromptInputController,
} from "@/components/ai-elements/prompt-input"
import { Suggestions } from "@/components/ai-elements/suggestion"
import { Tool } from "@/components/ai-elements/tool"
import { Sources } from "@/components/ai-elements/sources"
import { SpeechInput } from "@/components/ai-elements/speech-input"
import type { SearchResponse } from "@/lib/search"
import { PROVIDERS } from "@/lib/providers"
import { BotIcon, CheckIcon, CopyIcon, FileIcon } from "lucide-react"

const SUGGESTIONS = [
  "Explain this concept simply",
  "Write a short story",
  "Help me debug my code",
  "Summarize a topic",
]

type ConfiguredKey = { provider: string; updatedAt: string }
type StoredMessage = { id: string; role: string; content: string }
type ModelDef = { id: string; name: string; contextLength?: number; maker?: string }

function textPart(text: string) {
  return { type: "text" as const, text }
}

function storedToUIMessage(m: StoredMessage): UIMessage {
  return {
    id: m.id,
    role: m.role as UIMessage["role"],
    parts: [textPart(m.content)],
    metadata: {},
  }
}

function AttachmentsDisplay() {
  const attachments = usePromptInputAttachments()
  const handleRemove = useCallback(
    (id: string) => attachments.remove(id),
    [attachments]
  )
  if (attachments.files.length === 0) return null
  return (
    <Attachments variant="inline">
      {attachments.files.map((f) => (
        <Attachment key={f.id} data={f} onRemove={() => handleRemove(f.id)}>
          <AttachmentPreview />
          <AttachmentRemove />
        </Attachment>
      ))}
    </Attachments>
  )
}

function SpeechInputMenuItem() {
  const controller = usePromptInputController()
  return (
    <SpeechInput
      onTranscriptionChange={(text) => {
        const current = controller.textInput.value
        controller.textInput.setInput(
          current ? `${current} ${text}` : text
        )
      }}
    />
  )
}

export default function ChatPage() {
  const { chatId } = useParams<{ chatId: string }>()
  const [provider, setProvider] = useState(() => {
    if (typeof window === "undefined") return "groq"
    const saved = localStorage.getItem("last-model")
    return saved?.split("|")[0] ?? "groq"
  })
  const [model, setModel] = useState(() => {
    if (typeof window === "undefined") return "llama-3.3-70b-versatile"
    const saved = localStorage.getItem("last-model")
    return saved?.split("|")[1] ?? "llama-3.3-70b-versatile"
  })
  const [configuredProviders, setConfiguredProviders] = useState<string[]>([])
  const [initialMessages, setInitialMessages] = useState<UIMessage[]>([])
  const [loaded, setLoaded] = useState(false)
  const [dynamicModels, setDynamicModels] = useState<Record<string, ModelDef[]>>({})
  const [modelSelectorOpen, setModelSelectorOpen] = useState(false)

  const contextRef = useRef({ chatId, provider, model })
  contextRef.current = { chatId, provider, model }

  useEffect(() => {
    fetch("/api/keys")
      .then((r) => r.json())
      .then((keys: ConfiguredKey[]) => {
        const configured = keys.map((k) => k.provider)
        setConfiguredProviders(configured)
        if (configured.length > 0 && !configured.includes(provider)) {
          const first = PROVIDERS.find((p) => configured.includes(p.id))
          if (first) {
            setProvider(first.id)
            setModel(first.models[0].id)
          }
        }
      })
      .catch(() => {})
  }, [])

  useEffect(() => {
    setLoaded(false)
    fetch(`/api/chats/${chatId}`)
      .then((r) => r.json())
      .then((chat) => {
        const msgs: UIMessage[] = (chat.messages ?? []).map(storedToUIMessage)
        setInitialMessages(msgs)
        if (chat.provider && chat.model) {
          setProvider(chat.provider)
          setModel(chat.model)
          localStorage.setItem("last-model", `${chat.provider}|${chat.model}`)
        }
        setLoaded(true)
      })
      .catch(() => setLoaded(true))
  }, [chatId])

  useEffect(() => {
    if (configuredProviders.length === 0) return
    for (const p of configuredProviders) {
      fetch(`/api/models?provider=${p}`)
        .then((r) => r.json())
        .then((data: ModelDef[]) => {
          if (Array.isArray(data) && data.length > 0) {
            setDynamicModels((prev) => ({ ...prev, [p]: data }))
          }
        })
        .catch(() => {})
    }
  }, [configuredProviders])

  const chat = useMemo(
    () =>
      new Chat({
        messages: initialMessages,
        transport: new DefaultChatTransport({
          api: "/api/chat",
          body: () => ({
            chatId: contextRef.current.chatId,
            provider: contextRef.current.provider,
            model: contextRef.current.model,
          }),
        }),
      }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [chatId]
  )

  const { messages, sendMessage, status, stop, error } = useChat({ chat })

  useEffect(() => {
    if (!error) return
    const msg =
      (error as { data?: { error?: { message?: string } } })?.data?.error?.message ??
      error.message ??
      "Unknown error"
    toast.error(msg, { duration: 8000 })
  }, [error])

  const isStreaming = status === "streaming" || status === "submitted"

  async function handleSubmit({ text, files }: PromptInputMessage) {
    if ((!text.trim() && files.length === 0) || isStreaming) return

    if (text.trim()) {
      await fetch(`/api/chats/${chatId}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: text }),
      })
    }

    sendMessage({ text, files })
  }

  const handleModelSelect = useCallback(
    (providerId: string, modelId: string) => {
      setProvider(providerId)
      setModel(modelId)
      localStorage.setItem("last-model", `${providerId}|${modelId}`)
      setModelSelectorOpen(false)
    },
    []
  )

  const getMessageText = (msg: UIMessage): string =>
    msg.parts
      .filter((p) => p.type === "text")
      .map((p) => (p as { type: "text"; text: string }).text)
      .join("")

  const getMessageFiles = (msg: UIMessage) =>
    msg.parts.filter((p) => p.type === "file") as FileUIPart[]

  const noKeys = configuredProviders.length === 0

  const availableProviders = PROVIDERS.filter((p) =>
    configuredProviders.includes(p.id)
  )

  const modelsForProvider = (providerId: string): ModelDef[] =>
    dynamicModels[providerId] ??
    PROVIDERS.find((p) => p.id === providerId)?.models ??
    []

  const selectedModel = modelsForProvider(provider).find((m) => m.id === model)
  const selectedModelName = selectedModel?.name ?? model
  const selectedModelMaker = selectedModel?.maker ?? provider

  if (!loaded) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <div className="h-5 w-5 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    )
  }

  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      <Conversation className="flex-1">
        <ConversationContent>
          {messages.length === 0 && (
            <>
              <ConversationEmptyState
                title={noKeys ? "Add API keys to start" : "Start chatting"}
                description={
                  noKeys
                    ? "Go to Settings to add API keys for any provider"
                    : "Select a model below and send your first message"
                }
                icon={<BotIcon className="h-8 w-8" />}
              />
              {!noKeys && (
                <Suggestions
                  suggestions={SUGGESTIONS}
                  onSelect={(s) => handleSubmit({ text: s, files: [] })}
                  className="pb-4"
                />
              )}
            </>
          )}
          {messages.map((msg) => {
            const text = getMessageText(msg)
            const files = getMessageFiles(msg)
            const isLastAssistant =
              msg.role === "assistant" &&
              msg.id === messages[messages.length - 1]?.id
            const reasoningParts = msg.parts.filter(
              (p) => p.type === "reasoning"
            ) as Array<{ type: "reasoning"; text: string; state?: "streaming" | "done" }>
            const reasoningText = reasoningParts.map((p) => p.text).join("")
            const isReasoningStreaming =
              isLastAssistant &&
              isStreaming &&
              reasoningParts.some((p) => p.state === "streaming")
            const toolParts = (msg.parts.filter(
              (p) => p.type === "tool-invocation"
            ) as unknown) as Array<{ type: "tool-invocation"; toolInvocation: { toolName: string; args?: Record<string, unknown>; result?: unknown; state: string } }>
            const searchSources = toolParts
              .filter((p) => p.toolInvocation.toolName === "webSearch" && p.toolInvocation.state === "result")
              .flatMap((p) => (p.toolInvocation.result as SearchResponse | undefined)?.results ?? [])
            const nonSearchTools = toolParts.filter((p) => p.toolInvocation.toolName !== "webSearch")
            return (
              <Message key={msg.id} from={msg.role}>
                <MessageContent>
                  {nonSearchTools.length > 0 && (
                    <div className="mb-2 flex flex-col gap-1.5">
                      {nonSearchTools.map((p, i) => (
                        <Tool
                          key={i}
                          name={p.toolInvocation.toolName}
                          args={p.toolInvocation.args}
                          result={p.toolInvocation.result}
                          status={
                            p.toolInvocation.state === "result"
                              ? "complete"
                              : p.toolInvocation.state === "call"
                              ? "running"
                              : "pending"
                          }
                        />
                      ))}
                    </div>
                  )}
                  {searchSources.length > 0 && (
                    <div className="mb-2">
                      <Sources sources={searchSources} />
                    </div>
                  )}
                  {files.length > 0 && (
                    <div className="mb-2 flex flex-wrap gap-2">
                      {files.map((f, i) =>
                        f.mediaType.startsWith("image/") ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            key={i}
                            src={f.url}
                            alt="attachment"
                            className="max-h-48 max-w-xs rounded-md object-cover"
                          />
                        ) : (
                          <div
                            key={i}
                            className="flex items-center gap-1.5 rounded-md border bg-muted px-2 py-1 text-xs"
                          >
                            <FileIcon className="h-3.5 w-3.5" />
                            <span className="max-w-[160px] truncate">
                              {f.mediaType}
                            </span>
                          </div>
                        )
                      )}
                    </div>
                  )}
                  {msg.role === "assistant" ? (
                    <>
                    {reasoningText && (
                      <Reasoning isStreaming={isReasoningStreaming}>
                        <ReasoningTrigger />
                        <CollapsibleContent className="mt-4 text-sm text-muted-foreground">
                          <AnimatedMarkdown
                            content={reasoningText}
                            sep="diff"
                            animation={isReasoningStreaming ? "fadeIn" : null}
                            animationDuration="0.3s"
                            animationTimingFunction="ease-out"
                          />
                        </CollapsibleContent>
                      </Reasoning>
                    )}
                    <div className="prose prose-sm dark:prose-invert prose-pre:p-0 prose-pre:m-0 prose-pre:bg-transparent max-w-none">
                      <AnimatedMarkdown
                        content={text}
                        sep="diff"
                        animation={
                          isStreaming && isLastAssistant
                            ? "fadeIn"
                            : null
                        }
                        animationDuration="0.3s"
                        animationTimingFunction="ease-out"
                      />
                    </div>
                    </>
                  ) : (
                    <span className="whitespace-pre-wrap">{text}</span>
                  )}
                </MessageContent>
                {msg.role === "assistant" && text && (
                  <MessageActions>
                    <MessageAction
                      tooltip="Copy"
                      onClick={() => navigator.clipboard.writeText(text)}
                    >
                      <CopyIcon className="h-3.5 w-3.5" />
                    </MessageAction>
                  </MessageActions>
                )}
              </Message>
            )
          })}
        </ConversationContent>
        <ConversationScrollButton />
      </Conversation>

      <div className="border-t p-3">
        <PromptInputProvider>
          <PromptInput globalDrop multiple onSubmit={handleSubmit}>
            <AttachmentsDisplay />
            <PromptInputBody>
              <PromptInputTextarea
                placeholder={
                  noKeys
                    ? "Add API keys in Settings to start chatting…"
                    : "Message…"
                }
                disabled={noKeys}
              />
            </PromptInputBody>
            <PromptInputFooter>
              <PromptInputTools>
                <PromptInputActionMenu>
                  <PromptInputActionMenuTrigger />
                  <PromptInputActionMenuContent>
                    <PromptInputActionAddAttachments />
                    <PromptInputActionAddScreenshot />
                    <SpeechInputMenuItem />
                  </PromptInputActionMenuContent>
                </PromptInputActionMenu>

                <ModelSelector
                  open={modelSelectorOpen}
                  onOpenChange={setModelSelectorOpen}
                >
                  <ModelSelectorTrigger
                    render={
                      <PromptInputButton
                        disabled={noKeys}
                        className="gap-1.5 px-2 text-xs"
                      />
                    }
                  >
                    <ModelSelectorLogo
                      provider={selectedModelMaker}
                      className="size-3.5"
                      onError={(e) => {
                        ;(e.target as HTMLImageElement).style.display = "none"
                      }}
                    />
                    <ModelSelectorName className="max-w-[140px] flex-none truncate text-xs">
                      {selectedModelName}
                    </ModelSelectorName>
                  </ModelSelectorTrigger>
                  <ModelSelectorContent>
                    <ModelSelectorInput placeholder="Search models…" />
                    <ModelSelectorList>
                      <ModelSelectorEmpty>No models found.</ModelSelectorEmpty>
                      {availableProviders.map((providerDef) => (
                        <ModelSelectorGroup
                          key={providerDef.id}
                          heading={providerDef.name}
                        >
                          {modelsForProvider(providerDef.id).map((m) => (
                            <ModelSelectorItem
                              key={m.id}
                              value={m.id}
                              onSelect={() =>
                                handleModelSelect(providerDef.id, m.id)
                              }
                            >
                              <ModelSelectorLogo
                                provider={m.maker ?? providerDef.id}
                                onError={(e) => {
                                  ;(e.target as HTMLImageElement).style.display =
                                    "none"
                                }}
                              />
                              <ModelSelectorName>{m.name}</ModelSelectorName>
                              {provider === providerDef.id &&
                                model === m.id && (
                                  <CheckIcon className="ml-auto size-4 shrink-0" />
                                )}
                            </ModelSelectorItem>
                          ))}
                        </ModelSelectorGroup>
                      ))}
                    </ModelSelectorList>
                  </ModelSelectorContent>
                </ModelSelector>
              </PromptInputTools>
              <PromptInputSubmit status={status} onStop={stop} />
            </PromptInputFooter>
          </PromptInput>
        </PromptInputProvider>
      </div>
    </div>
  )
}
