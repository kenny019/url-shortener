// src/lib/generator.ts
import { randomBytes } from "node:crypto";

const ALPHABET =
  "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
const SLUG_LENGTH = 7;

export function generateSlug(): string {
  const bytes = randomBytes(SLUG_LENGTH);

  let slug = "";
  for (const byte of bytes) {
    // apparently the math of 256 % 62 is biased towards the first 8 characters (256-248)
    // but its okay for now...
    slug += ALPHABET[byte % 62];
  }

  return slug;
}
