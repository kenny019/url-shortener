/**
 * API canary — exercises the critical user journey against a running server.
 *
 *   1. GET /health             → server is up
 *   2. POST /api/url            → returns a 7-char slug
 *   3. GET /<slug> (no follow)  → 302 with the expected Location header
 *
 * Run locally:   pnpm canary
 * Run against prod:  CANARY_BASE_URL=https://short.ngkenny.dev pnpm canary
 *
 * Exits 0 on pass, 1 on any failure.
 */
const BASE_URL = (
  process.env.CANARY_BASE_URL ?? "http://localhost:3000"
).replace(/\/$/, "");
const TEST_URL = "https://www.youtube.com/";

function pass(msg: string) {
  console.log(`  \x1b[32m✓\x1b[0m ${msg}`);
}

function fail(msg: string): never {
  console.error(`  \x1b[31m✗\x1b[0m ${msg}`);
  process.exit(1);
}

async function main() {
  console.log(`Canary → ${BASE_URL}\n`);

  // 1. Server is alive
  const health = await fetch(`${BASE_URL}/health`);
  if (health.status !== 200)
    fail(`/health returned ${health.status}, expected 200`);
  pass("/health returns 200");

  // 2. Create a short link
  const createRes = await fetch(`${BASE_URL}/api/url`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ longUrl: TEST_URL }),
  });
  if (!createRes.ok) {
    fail(`POST /api/url returned ${createRes.status}, expected 2xx`);
  }
  const body = (await createRes.json()) as { slug?: unknown };
  if (typeof body.slug !== "string" || body.slug.length !== 7) {
    fail(`POST /api/url returned invalid slug: ${JSON.stringify(body)}`);
  }
  const slug = body.slug;
  pass(`POST /api/url returns slug "${slug}"`);

  // 3. The slug redirects to the original URL.
  //    redirect: "manual" so fetch returns the 302 instead of following it.
  const redirectRes = await fetch(`${BASE_URL}/${slug}`, {
    redirect: "manual",
  });
  if (redirectRes.status !== 302) {
    fail(`GET /${slug} returned ${redirectRes.status}, expected 302`);
  }
  const location = redirectRes.headers.get("location");
  if (location !== TEST_URL) {
    fail(
      `GET /${slug} Location header was "${location}", expected "${TEST_URL}"`,
    );
  }
  pass(`GET /${slug} → 302 → ${location}`);

  console.log(`\n\x1b[32mCanary passed.\x1b[0m`);
}

main().catch((err) => {
  console.error(
    `\n\x1b[31mCanary errored:\x1b[0m`,
    err instanceof Error ? err.message : err,
  );
  process.exit(1);
});
