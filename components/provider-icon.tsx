import {
  siAnthropic,
  siDeepseek,
  siGooglegemini,
  siMistralai,
  siNvidia,
  siOpenrouter,
  siPerplexity,
  siX,
} from "simple-icons"

type SimpleIcon = { path: string; hex: string; title: string }

function SvgIcon({ icon, size = 16 }: { icon: SimpleIcon; size?: number }) {
  return (
    <svg
      role="img"
      viewBox="0 0 24 24"
      width={size}
      height={size}
      fill={`#${icon.hex}`}
      xmlns="http://www.w3.org/2000/svg"
      aria-label={icon.title}
    >
      <path d={icon.path} />
    </svg>
  )
}

function LetterIcon({
  letter,
  bg,
  size = 16,
}: {
  letter: string
  bg: string
  size?: number
}) {
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        width: size,
        height: size,
        borderRadius: 4,
        background: bg,
        color: "#fff",
        fontSize: size * 0.55,
        fontWeight: 700,
        lineHeight: 1,
        fontFamily: "inherit",
        flexShrink: 0,
      }}
    >
      {letter}
    </span>
  )
}

const PROVIDER_ICONS: Record<string, (size?: number) => React.ReactNode> = {
  groq: (s = 16) => <LetterIcon letter="G" bg="#F55036" size={s} />,
  openrouter: (s = 16) => <SvgIcon icon={siOpenrouter} size={s} />,
  nvidia: (s = 16) => <SvgIcon icon={siNvidia} size={s} />,
  google: (s = 16) => <SvgIcon icon={siGooglegemini} size={s} />,
  togetherai: (s = 16) => <LetterIcon letter="T" bg="#0066FF" size={s} />,
  openai: (s = 16) => <LetterIcon letter="⊕" bg="#10A37F" size={s} />,
  anthropic: (s = 16) => <SvgIcon icon={siAnthropic} size={s} />,
  mistral: (s = 16) => <SvgIcon icon={siMistralai} size={s} />,
  cohere: (s = 16) => <LetterIcon letter="C" bg="#39594D" size={s} />,
  xai: (s = 16) => <SvgIcon icon={siX} size={s} />,
  deepseek: (s = 16) => <SvgIcon icon={siDeepseek} size={s} />,
  perplexity: (s = 16) => <SvgIcon icon={siPerplexity} size={s} />,
}

export function ProviderIcon({
  providerId,
  size = 16,
}: {
  providerId: string
  size?: number
}) {
  const fn = PROVIDER_ICONS[providerId]
  if (!fn) return <LetterIcon letter={providerId[0]?.toUpperCase() ?? "?"} bg="#888" size={size} />
  return <>{fn(size)}</>
}
