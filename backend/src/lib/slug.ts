import z from "zod";

export const SLUG_MIN_LENGTH = 4;
export const SLUG_MAX_LENGTH = 10;
export const SLUG_PATTERN = /^[A-Za-z0-9]+$/;

export const RESERVED_SLUGS = new Set([
  "api",
  "apis",
  "health",
  "healthz",
  "assets",
  "favicon",
  "icons",
  "index",
]);

export const slugSchema = z
  .string()
  .min(SLUG_MIN_LENGTH, `slug must be at least ${SLUG_MIN_LENGTH} characters`)
  .max(SLUG_MAX_LENGTH, `slug must be at most ${SLUG_MAX_LENGTH} characters`)
  .regex(SLUG_PATTERN, "slug may only contain letters and digits")
  .refine((s) => !RESERVED_SLUGS.has(s.toLowerCase()), "slug is reserved");
