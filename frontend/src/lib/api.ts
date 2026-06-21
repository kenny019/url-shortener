// Production is single-origin (the backend serves this app), so call the API
// with a relative path. In dev the Vite server and API are separate origins.
const API_URL = (
  import.meta.env.PROD ? "" : (import.meta.env.VITE_API_URL ?? "http://localhost:3000")
).replace(/\/$/, "");

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
  // The redirect lives on the API origin. When API_URL is relative (prod),
  // fall back to the current origin to build an absolute, shareable link.
  const base = API_URL || window.location.origin;
  return {
    slug: data.slug,
    shortUrl: data.shortUrl ?? `${base}/${data.slug}`,
  };
}
