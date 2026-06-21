import { Hono } from "hono";
import z from "zod";
import { generateSlug } from "../lib/generator.js";
import { insertUrl } from "../lib/db.js";
import { slugSchema } from "../lib/slug.js";

export const urlRoute = new Hono();

const MAX_RETRIES = 5;

const longUrlSchema = z
  .url()
  .refine((u) => ["http:", "https:"].includes(new URL(u).protocol), {
    message: "only http(s) URLs allowed",
  });

urlRoute.post("/", async (c) => {
  let body: unknown;
  try {
    body = await c.req.json();
  } catch {
    return c.json({ error: "Invalid JSON body" }, 400);
  }

  if (typeof body !== "object" || body === null) {
    return c.json({ error: "Invalid request body" }, 400);
  }

  const { longUrl: rawLongUrl, requestedSlug: rawSlug } = body as {
    longUrl?: unknown;
    requestedSlug?: unknown;
  };

  const parseLongUrl = longUrlSchema.safeParse(rawLongUrl);
  if (!parseLongUrl.success) {
    return c.json({ error: "URL is invalid" }, 400);
  }
  const longUrl = parseLongUrl.data;

  if (rawSlug !== undefined) {
    const parseSlug = slugSchema.safeParse(rawSlug);
    if (!parseSlug.success) {
      return c.json(
        { error: parseSlug.error.issues[0]?.message ?? "Invalid slug" },
        400,
      );
    }

    const stored = await insertUrl(parseSlug.data, longUrl);
    if (!stored) {
      return c.json({ error: "Slug is already taken" }, 409);
    }
    return c.json({ slug: parseSlug.data });
  }

  for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
    const slug = generateSlug();
    const stored = await insertUrl(slug, longUrl);
    if (stored) return c.json({ slug });
  }

  return c.json({ error: "Failed to allocate a slug" }, 500);
});
