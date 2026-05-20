import type { Metadata } from "next"
import localFont from "next/font/local"
import { TooltipProvider } from "@/components/ui/tooltip"
import { Toaster } from "sonner"
import "./globals.css"

const archivo = localFont({
  src: [
    {
      path: "../public/fonts/Archivo-Variable.ttf",
      style: "normal",
    },
    {
      path: "../public/fonts/Archivo-VariableItalic.ttf",
      style: "italic",
    },
  ],
  variable: "--font-archivo",
  display: "swap",
})

export const metadata: Metadata = {
  title: "AI Chat — 12 Providers",
  description: "Chat with Groq, OpenRouter, NVIDIA NIM, OpenAI, Anthropic and more",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={`${archivo.variable} h-full antialiased`}>
      <body className="h-full bg-background text-foreground">
        <TooltipProvider>{children}</TooltipProvider>
        <Toaster richColors position="bottom-right" />
      </body>
    </html>
  )
}
