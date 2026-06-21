import { serve } from "@hono/node-server";
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

app.get("/", (c) => {
  return c.text("Hello Hono!");
});

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
  console.log(longUrl);

  if (!longUrl) {
    await next();
    return;
  }

  return c.redirect(longUrl);
});

serve(
  {
    fetch: app.fetch,
    port: 3000,
  },
  (info) => {
    console.log(`Server is running on http://localhost:${info.port}`);
  },
);
