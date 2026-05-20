"use client"

import {
  PauseIcon,
  PlayIcon,
  SkipBackIcon,
  SkipForwardIcon,
  Volume2Icon,
  VolumeXIcon,
} from "lucide-react"
import type { HTMLAttributes } from "react"
import { useCallback, useEffect, useRef, useState } from "react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

export type AudioPlayerProps = HTMLAttributes<HTMLDivElement> & {
  src?: string
  data?: string
}

export function AudioPlayer({ src, data, className, ...props }: AudioPlayerProps) {
  const audioRef = useRef<HTMLAudioElement>(null)
  const [playing, setPlaying] = useState(false)
  const [muted, setMuted] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)

  const audioSrc = data
    ? `data:audio/mpeg;base64,${data}`
    : src

  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return

    const onPlay = () => setPlaying(true)
    const onPause = () => setPlaying(false)
    const onTimeUpdate = () => setCurrentTime(audio.currentTime)
    const onLoadedMetadata = () => setDuration(audio.duration)
    const onEnded = () => setPlaying(false)

    audio.addEventListener("play", onPlay)
    audio.addEventListener("pause", onPause)
    audio.addEventListener("timeupdate", onTimeUpdate)
    audio.addEventListener("loadedmetadata", onLoadedMetadata)
    audio.addEventListener("ended", onEnded)

    return () => {
      audio.removeEventListener("play", onPlay)
      audio.removeEventListener("pause", onPause)
      audio.removeEventListener("timeupdate", onTimeUpdate)
      audio.removeEventListener("loadedmetadata", onLoadedMetadata)
      audio.removeEventListener("ended", onEnded)
    }
  }, [])

  const togglePlay = useCallback(() => {
    const audio = audioRef.current
    if (!audio) return
    if (playing) audio.pause()
    else audio.play()
  }, [playing])

  const toggleMute = useCallback(() => {
    const audio = audioRef.current
    if (!audio) return
    audio.muted = !muted
    setMuted(!muted)
  }, [muted])

  const seek = useCallback((seconds: number) => {
    const audio = audioRef.current
    if (!audio) return
    audio.currentTime = Math.max(0, Math.min(audio.currentTime + seconds, duration))
  }, [duration])

  const handleSeek = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const audio = audioRef.current
    if (!audio) return
    audio.currentTime = Number(e.target.value)
    setCurrentTime(Number(e.target.value))
  }, [])

  const formatTime = (secs: number) => {
    if (!isFinite(secs)) return "0:00"
    const m = Math.floor(secs / 60)
    const s = Math.floor(secs % 60)
    return `${m}:${s.toString().padStart(2, "0")}`
  }

  return (
    <div
      className={cn(
        "flex flex-col gap-2 rounded-lg border bg-card p-3",
        className
      )}
      {...props}
    >
      {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
      <audio ref={audioRef} src={audioSrc} preload="metadata" className="hidden" />
      <div className="flex items-center gap-1">
        <AudioPlayerElement src={audioSrc} />
        <Button variant="ghost" size="icon-xs" onClick={() => seek(-10)}>
          <SkipBackIcon className="size-3.5" />
          <span className="sr-only">-10s</span>
        </Button>
        <Button variant="ghost" size="icon" onClick={togglePlay}>
          {playing ? (
            <PauseIcon className="size-4" />
          ) : (
            <PlayIcon className="size-4" />
          )}
          <span className="sr-only">{playing ? "Pause" : "Play"}</span>
        </Button>
        <Button variant="ghost" size="icon-xs" onClick={() => seek(10)}>
          <SkipForwardIcon className="size-3.5" />
          <span className="sr-only">+10s</span>
        </Button>
        <span className="ml-1 text-xs tabular-nums text-muted-foreground">
          {formatTime(currentTime)} / {formatTime(duration)}
        </span>
        <div className="flex-1" />
        <Button variant="ghost" size="icon-xs" onClick={toggleMute}>
          {muted ? (
            <VolumeXIcon className="size-3.5" />
          ) : (
            <Volume2Icon className="size-3.5" />
          )}
          <span className="sr-only">{muted ? "Unmute" : "Mute"}</span>
        </Button>
      </div>
      <input
        type="range"
        min={0}
        max={duration || 0}
        step={0.1}
        value={currentTime}
        onChange={handleSeek}
        className="h-1 w-full cursor-pointer appearance-none rounded-full bg-muted accent-primary"
      />
    </div>
  )
}

export type AudioPlayerElementProps = { src?: string; className?: string }

export function AudioPlayerElement({ src, className }: AudioPlayerElementProps) {
  return null
}
