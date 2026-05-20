export type IntegrationDef = {
  id: string
  name: string
  description: string
  docsUrl: string
  keyLabel: string
}

export const INTEGRATIONS: IntegrationDef[] = [
  {
    id: "brave-search",
    name: "Brave Search",
    description: "Web search for all AI models. 2000 free queries/month.",
    docsUrl: "https://api.search.brave.com/",
    keyLabel: "BSA... API key",
  },
]

export const INTEGRATION_MAP: Record<string, IntegrationDef> = Object.fromEntries(
  INTEGRATIONS.map((i) => [i.id, i])
)
