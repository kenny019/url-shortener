import { db } from "../db/client.js";
import { urls } from "../db/schema.js";
import { eq } from "drizzle-orm";

export async function insertUrl(slug: string, longUrl: string) {
  try {
    await db.insert(urls).values({
      slug,
      longUrl,
    });

    return slug;
  } catch (err) {
    console.error(err);
    return "";
  }
}

export async function getLongUrlFromShort(
  shortUrl: string,
): Promise<string | null> {
  // "row not found" returns null;
  const dbSelectResult = await db
    .select()
    .from(urls)
    .where(eq(urls.slug, shortUrl))
    .limit(1);

  const record = dbSelectResult[0];
  return record?.longUrl ?? null;
}
