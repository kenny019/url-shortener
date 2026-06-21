import { describe, it, expect, beforeEach, vi } from "vitest";

// Mock the DB boundary so routes are testable without Postgres. This also
// avoids loading db/client.ts, which throws if DATABASE_URL is unset.
vi.mock("./lib/db.js", () => ({
  insertUrl: vi.fn(),
  getLongUrlFromShort: vi.fn(),
}));

import { app } from "./app.js";
import { insertUrl, getLongUrlFromShort } from "./lib/db.js";

const insertUrlMock = vi.mocked(insertUrl);
const getLongUrlMock = vi.mocked(getLongUrlFromShort);

function postUrl(body: unknown) {
  return app.request("/api/url", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: typeof body === "string" ? body : JSON.stringify(body),
  });
}

beforeEach(() => {
  vi.clearAllMocks();
});

describe("GET /healthz", () => {
  it("returns 200 ok", async () => {
    const res = await app.request("/healthz");
    expect(res.status).toBe(200);
    expect(await res.text()).toBe("ok");
  });
});

describe("POST /api/url", () => {
  it("creates a short link for a valid http(s) URL", async () => {
    insertUrlMock.mockImplementation(async (slug) => slug);
    const res = await postUrl({ longUrl: "https://open.gov.sg/" });
    expect(res.status).toBe(200);
    const body = (await res.json()) as { slug: string };
    expect(body.slug).toHaveLength(7);
    expect(insertUrlMock).toHaveBeenCalledOnce();
  });

  it("retries on slug collision, then succeeds", async () => {
    insertUrlMock
      .mockResolvedValueOnce("") // current code: "" signals a collision
      .mockImplementation(async (slug) => slug);
    const res = await postUrl({ longUrl: "https://example.com/" });
    expect(res.status).toBe(200);
    expect(insertUrlMock).toHaveBeenCalledTimes(2);
  });

  it("rejects a non-http(s) scheme (javascript:)", async () => {
    const res = await postUrl({ longUrl: "javascript:alert(1)" });
    expect(res.status).toBe(400);
    expect(insertUrlMock).not.toHaveBeenCalled();
  });

  it("rejects a malformed URL", async () => {
    const res = await postUrl({ longUrl: "not a url" });
    expect(res.status).toBe(400);
  });

  it("rejects a broken JSON body", async () => {
    const res = await postUrl("{ broken");
    expect(res.status).toBe(400);
  });
});

describe("GET /:slug", () => {
  it("redirects with 302 to the stored URL for a known slug", async () => {
    getLongUrlMock.mockResolvedValueOnce("https://open.gov.sg/");
    const res = await app.request("/abc1234");
    expect(res.status).toBe(302);
    expect(res.headers.get("location")).toBe("https://open.gov.sg/");
    expect(getLongUrlMock).toHaveBeenCalledWith("abc1234");
  });

  it("returns 404 for an unknown slug", async () => {
    getLongUrlMock.mockResolvedValueOnce(null);
    const res = await app.request("/zzzzzzz");
    expect(res.status).toBe(404);
  });
});
