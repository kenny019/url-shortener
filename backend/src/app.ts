import { serveStatic } from "@hono/node-server/serve-static";
import { Hono } from "hono";
import { cors } from "hono/cors";
import z from "zod";
import { urlRoute } from "./routes/url.js";
import { getLongUrlFromShort } from "./lib/db.js";
import { Cacher } from "./lib/cache.js";

const corsOrigins = (process.env.CORS_ORIGINS ?? "http://localhost:5173")
  .split(",")
  .map((o) => o.trim());

type MiddlewareEnv = {
  Variables: {
    cache: Cacher;
  };
};

const urlCache = new Cacher();

export const app = new Hono<MiddlewareEnv>();

// injects cache into requests, premounted
app.use("*", async (c, next) => {
  c.set("cache", urlCache);
  await next();
});

app.use("/api/*", cors({ origin: corsOrigins }));

// Registered before "/:shortSlug" so it isn't treated as a 7-char slug lookup.
app.get("/healthz", (c) => c.text("ok"));

app.route("/api/url", urlRoute);

app.get("/:shortSlug", async (c, next) => {
  const rawShortSlug = c.req.param("shortSlug");

  const parseShortSlug = z.string().length(7).safeParse(rawShortSlug);
  if (!parseShortSlug.success) {
    await next();
    return;
  }

  const shortSlug = parseShortSlug.data;
  const cache = c.get("cache");

  const cachedLongUrl = cache.get(shortSlug);

  // if we ever add expiry or deletion. its important to invalidate cache
  if (cachedLongUrl) {
    return c.redirect(cachedLongUrl);
  }

  const longUrl = await getLongUrlFromShort(shortSlug);

  if (!longUrl) {
    await next();
    return;
  }

  cache.set(shortSlug, longUrl);

  return c.redirect(longUrl);
});

app.use("/*", serveStatic({ root: "./public" }));
