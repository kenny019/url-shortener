import { serve } from "@hono/node-server";
import { serveStatic } from "@hono/node-server/serve-static";
import { Hono } from "hono";
import { cors } from "hono/cors";
import { urlRoute } from "./routes/url.js";
import z from "zod";
import { getLongUrlFromShort } from "./lib/db.js";

const corsOrigins = (process.env.CORS_ORIGINS ?? "http://localhost:5173")
  .split(",")
  .map((o) => o.trim());

const app = new Hono();

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
  const longUrl = await getLongUrlFromShort(shortSlug);

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

// Railway (and most PaaS) inject PORT; fall back to 3000 for local dev.
const port = process.env.PORT ? Number(process.env.PORT) : 3000;

serve(
  {
    fetch: app.fetch,
    port,
  },
  (info) => {
    console.log(`Server is running on port ${info.port}`);
  },
);
