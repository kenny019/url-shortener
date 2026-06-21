import { serveStatic } from "@hono/node-server/serve-static";
import { Hono } from "hono";
import { cors } from "hono/cors";
import z from "zod";
import { urlRoute } from "./routes/url.js";
import { getLongUrlFromShort } from "./lib/db.js";

const corsOrigins = (process.env.CORS_ORIGINS ?? "http://localhost:5173")
  .split(",")
  .map((o) => o.trim());

export const app = new Hono();

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

  const longUrl = await getLongUrlFromShort(parseShortSlug.data);
  if (!longUrl) {
    await next();
    return;
  }

  return c.redirect(longUrl);
});

// Serve the built frontend (Vite output) for everything else: the SPA at "/",
// hashed bundles under "/assets", favicon, etc. Registered last so API routes
// and slug redirects take precedence.
app.use("/*", serveStatic({ root: "./public" }));
