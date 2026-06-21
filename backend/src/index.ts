import { serve } from "@hono/node-server";
import { app } from "./app.js";

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
