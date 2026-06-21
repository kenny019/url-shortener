import { useState, type FormEvent } from "react";
import { Check, Copy, Link2, Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { shortenUrl } from "@/lib/api";
import { toast } from "sonner";

interface Result {
  shortUrl: string;
  longUrl: string;
}

// adds https to the url if user just enters example.com
function normalizeUrl(value: string): string {
  const trimmed = value.trim();
  if (!trimmed) return trimmed;
  return /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
}

export function ShortenPage() {
  const [url, setUrl] = useState("");
  const [customSlug, setCustomSlug] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<Result | null>(null);
  const [copied, setCopied] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const longUrl = normalizeUrl(url);
    if (!longUrl) {
      toast.error("Please enter a URL");
      return;
    }

    setLoading(true);
    setResult(null);
    try {
      const res = await shortenUrl(longUrl, customSlug.trim() || undefined);
      setResult({ shortUrl: res.shortUrl, longUrl });
      setCopied(false);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  async function handleCopy() {
    if (!result) return;
    await navigator.clipboard.writeText(result.shortUrl);
    setCopied(true);
    toast.success("Copied to clipboard");
    setTimeout(() => setCopied(false), 2000);
  }

  function handleReset() {
    setResult(null);
    setUrl("");
    setCustomSlug("");
  }

  return (
    <main className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden px-4">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10"
        style={{
          background:
            "radial-gradient(50% 40% at 50% 0%, color-mix(in oklab, var(--foreground) 7%, transparent), transparent)",
        }}
      />

      <div className="w-full max-w-xl">
        <div className="mb-8 flex flex-col items-center text-center">
          <div className="bg-primary text-primary-foreground mb-4 flex size-12 items-center justify-center rounded-2xl shadow-sm">
            <Link2 className="size-6" />
          </div>
          <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
            Shorten your links
          </h1>
          <p className="text-muted-foreground mt-2 text-sm sm:text-base">
            Paste a long URL and get a short, shareable link.
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="bg-card focus-within:border-ring focus-within:ring-ring/50 rounded-2xl border p-2 shadow-sm transition-[color,box-shadow] focus-within:ring-[3px]"
        >
          <div className="flex flex-col gap-2 sm:flex-row">
            <Input
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://example.com/very/long/link"
              aria-label="URL to shorten"
              autoFocus
              className="h-12 border-0 bg-transparent text-base shadow-none focus-visible:ring-0"
            />
            <Button
              type="submit"
              size="lg"
              disabled={loading}
              className="h-12 px-6"
            >
              {loading ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                "Shorten"
              )}
            </Button>
          </div>
          <div className="mt-1 border-t pt-2">
            <Input
              value={customSlug}
              onChange={(e) => setCustomSlug(e.target.value)}
              placeholder="Custom short url (optional)"
              aria-label="Custom short url (optional)"
              maxLength={10}
              className="h-10 border-0 bg-transparent text-sm shadow-none focus-visible:ring-0"
            />
          </div>
        </form>

        {result && (
          <div className="animate-in fade-in slide-in-from-bottom-2 bg-card mt-4 rounded-2xl border p-4 shadow-sm">
            <p className="text-muted-foreground mb-2 text-xs font-medium tracking-wide uppercase">
              Your short link
            </p>
            <div className="flex items-center gap-2">
              <a
                href={result.shortUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary flex-1 truncate font-mono text-sm font-medium hover:underline"
              >
                {result.shortUrl}
              </a>
              <Button
                size="icon"
                variant="outline"
                onClick={handleCopy}
                aria-label="Copy short link"
              >
                {copied ? (
                  <Check className="size-4" />
                ) : (
                  <Copy className="size-4" />
                )}
              </Button>
            </div>
            <p className="text-muted-foreground mt-3 truncate text-xs">
              {result.longUrl}
            </p>
            <button
              type="button"
              onClick={handleReset}
              className="text-muted-foreground hover:text-foreground mt-3 text-xs underline-offset-4 hover:underline"
            >
              Shorten another
            </button>
          </div>
        )}
      </div>

      <footer className="text-muted-foreground absolute bottom-6 text-xs">
        short.ngkenny.dev
      </footer>
    </main>
  );
}
