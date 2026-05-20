export type SearchResult = {
  title: string
  url: string
  description: string
  favicon?: string
}

export type SearchResponse = {
  results: SearchResult[]
  query: string
}

export async function braveSearch(
  query: string,
  apiKey: string,
  count = 6
): Promise<SearchResponse> {
  const params = new URLSearchParams({
    q: query,
    count: String(count),
    text_decorations: "false",
    search_lang: "en",
  })

  const res = await fetch(
    `https://api.search.brave.com/res/v1/web/search?${params}`,
    {
      headers: {
        Accept: "application/json",
        "Accept-Encoding": "gzip",
        "X-Subscription-Token": apiKey,
      },
    }
  )

  if (!res.ok) {
    throw new Error(`Brave Search error: ${res.status} ${res.statusText}`)
  }

  const data = await res.json()

  const results: SearchResult[] = (data.web?.results ?? []).map(
    (r: { title: string; url: string; description?: string; meta_url?: { favicon?: string } }) => ({
      title: r.title,
      url: r.url,
      description: r.description ?? "",
      favicon: r.meta_url?.favicon,
    })
  )

  return { results, query }
}
