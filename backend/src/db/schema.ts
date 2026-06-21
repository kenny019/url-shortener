import { bigint, pgTable, text, timestamp, varchar } from "drizzle-orm/pg-core";

export const urls = pgTable("urls", {
  id: bigint("id", { mode: "number" }).primaryKey().generatedAlwaysAsIdentity(),
  slug: varchar("slug", { length: 10 }).notNull().unique(),
  longUrl: text("long_url").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export type Url = typeof urls.$inferSelect;
export type NewUrl = typeof urls.$inferInsert;
