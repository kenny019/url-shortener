import { serve } from "@hono/node-server";
import { app } from "./app.js";

const port = process.env.PORT ? Number(process.env.PORT) : 3000;

serve(
  {
    fetch: app.fetch,
    port,
  },
  (info) => {
    console.log(`server is running on port ${info.port}`);
  },
);
