import { Hono } from "hono";
import z from "zod";
import { generateSlug } from "../lib/generator.js";
import { insertUrl } from "../lib/db.js";

export const urlRoute = new Hono();

urlRoute.post("/", async (c) => {
  try {
    const body = await c.req.json();

    const rawLongUrl = body.longUrl;
    const parseLongUrl = z
      .url()
      .refine((u) => ["http:", "https:"].includes(new URL(u).protocol))
      .safeParse(rawLongUrl);

    if (!parseLongUrl.success) {
      c.status(400);
      return c.json({
        error: "URL is invalid",
      });
    }

    const longUrl = parseLongUrl.data;

    let insertedSlug;
    let retryCount = 0;
    let MAX_RETRIES = 5;

    while (!insertedSlug && retryCount <= MAX_RETRIES) {
      const generatedSlug = generateSlug();
      const storedSlug = await insertUrl(generatedSlug, longUrl);

      if (storedSlug) insertedSlug = generatedSlug;
      else retryCount++;
    }

    console.log(`successfully generated ${insertedSlug}`);
    return c.json({
      slug: insertedSlug,
    });
  } catch (err) {
    c.status(400);
    return c.json({
      error: "Invalid body",
    });
  }
});
