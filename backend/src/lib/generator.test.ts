import { describe, it, expect } from "vitest";
import { generateSlug } from "./generator.js";

describe("generateSlug", () => {
  it("returns a 7-character slug", () => {
    expect(generateSlug()).toHaveLength(7);
  });

  it("only uses base62 characters", () => {
    const base62 = /^[A-Za-z0-9]+$/;
    for (let i = 0; i < 1000; i++) {
      expect(generateSlug()).toMatch(base62);
    }
  });

  it("produces distinct slugs across many calls (collision sanity)", () => {
    const n = 10_000;
    const seen = new Set<string>();
    for (let i = 0; i < n; i++) seen.add(generateSlug());
    // 62^7 keyspace (~3.5e12) makes a collision in 10k draws vanishingly rare.
    expect(seen.size).toBe(n);
  });
});
