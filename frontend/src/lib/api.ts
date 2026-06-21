const API_URL = (import.meta.env.VITE_API_URL ?? "http://localhost:3000").replace(
  /\/$/,
  "",
);

export interface ShortenResult {
  slug: string;
  shortUrl: string;
}

export async function shortenUrl(longUrl: string): Promise<ShortenResult> {
  const res = await fetch(`${API_URL}/api/url`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ longUrl }),
  });

  if (!res.ok) {
    const data = (await res.json().catch(() => null)) as { error?: string } | null;
    throw new Error(data?.error ?? `Request failed (${res.status})`);
  }

  const data = (await res.json()) as { slug: string; shortUrl?: string };
  // Backend returns the slug; the redirect lives on the API origin, so the
  // short link is API_URL/<slug> unless the backend supplies a full shortUrl.
  return {
    slug: data.slug,
    shortUrl: data.shortUrl ?? `${API_URL}/${data.slug}`,
  };
}
