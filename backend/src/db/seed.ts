import { generateSlug } from "../lib/generator.js";
import { db } from "./client.js";
import { urls } from "./schema.js";

const SAMPLE_URLS = [
  "https://google.com/",
  "https://github.com/",
  "https://x.com/",
];

async function seed() {
  console.log(`Seeding ${SAMPLE_URLS.length} URLs...`);

  const rows = SAMPLE_URLS.map((url) => ({
    slug: generateSlug(),
    longUrl: url,
  }));

  // onConflictDoNothing on the unique slug column makes this idempotent —
  // re-running the seed won't error if a generated slug happens to clash
  // with an existing row. Realistically near-zero at this scale.
  const inserted = await db
    .insert(urls)
    .values(rows)
    .onConflictDoNothing({ target: urls.slug })
    .returning({ slug: urls.slug, longUrl: urls.longUrl });

  console.log(`Inserted ${inserted.length} rows:`);
  for (const row of inserted) {
    console.log(`  ${row.slug} -> ${row.longUrl}`);
  }

  process.exit(0);
}

seed().catch((err) => {
  console.error("seed failed:", err);
  process.exit(1);
});
