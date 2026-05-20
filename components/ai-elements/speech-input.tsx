"use client"

import { MicIcon, MicOffIcon, SquareIcon } from "lucide-react"
import type { HTMLAttributes } from "react"
import { useCallback, useEffect, useRef, useState } from "react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

type SpeechState = "idle" | "listening" | "error"

type SpeechRecognitionEvent = {
  results: {
    [index: number]: {
      [index: number]: { transcript: string }
      isFinal: boolean
    }
    length: number
  }
}

declare global {
  interface Window {
    SpeechRecognition: new () => SpeechRecognitionInstance
    webkitSpeechRecognition: new () => SpeechRecognitionInstance
  }
}

interface SpeechRecognitionInstance extends EventTarget {
  continuous: boolean
  interimResults: boolean
  lang: string
  start(): void
  stop(): void
  onresult: ((event: SpeechRecognitionEvent) => void) | null
  onend: (() => void) | null
  onerror: ((event: { error: string }) => void) | null
}

function getSpeechRecognition(): (new () => SpeechRecognitionInstance) | null {
  if (typeof window === "undefined") return null
  return window.SpeechRecognition ?? window.webkitSpeechRecognition ?? null
}

export type SpeechInputProps = Omit<HTMLAttributes<HTMLButtonElement>, "onChange"> & {
  onTranscriptionChange?: (text: string) => void
  onAudioRecorded?: (blob: Blob) => void
  lang?: string
}

export function SpeechInput({
  onTranscriptionChange,
  onAudioRecorded,
  lang = "en-US",
  className,
  ...props
}: SpeechInputProps) {
  const [state, setState] = useState<SpeechState>("idle")
  const recognitionRef = useRef<SpeechRecognitionInstance | null>(null)
  const supported = typeof window !== "undefined" && !!getSpeechRecognition()

  const start = useCallback(() => {
    const SR = getSpeechRecognition()
    if (!SR) return

    const recognition = new SR()
    recognition.continuous = false
    recognition.interimResults = false
    recognition.lang = lang

    recognition.onresult = (e) => {
      const transcript = e.results[0][0].transcript
      onTranscriptionChange?.(transcript)
    }
    recognition.onend = () => setState("idle")
    recognition.onerror = () => setState("error")

    recognitionRef.current = recognition
    recognition.start()
    setState("listening")
  }, [lang, onTranscriptionChange])

  const stop = useCallback(() => {
    recognitionRef.current?.stop()
    recognitionRef.current = null
    setState("idle")
  }, [])

  useEffect(() => () => recognitionRef.current?.stop(), [])

  if (!supported) return null

  const isListening = state === "listening"

  const btn = (
    <Button
      variant="ghost"
      size="icon-xs"
      onClick={isListening ? stop : start}
      className={cn(
        isListening && "text-red-500 hover:text-red-600",
        state === "error" && "text-destructive",
        className
      )}
      {...(props as Parameters<typeof Button>[0])}
    >
      {isListening ? (
        <SquareIcon className="size-3.5 fill-current" />
      ) : (
        <MicIcon className="size-3.5" />
      )}
      <span className="sr-only">
        {isListening ? "Stop recording" : "Start voice input"}
      </span>
    </Button>
  )

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger render={btn} />
        <TooltipContent>
          {isListening ? "Stop recording" : "Voice input"}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}

export type SpeechInputButtonProps = SpeechInputProps

export { SpeechInput as SpeechInputButton }
