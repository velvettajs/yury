import { pgTable, varchar, uuid } from "drizzle-orm/pg-core";
import { tags } from "./Tags.js";

export const videos = pgTable("videos", {
  id: uuid('id').primaryKey().defaultRandom(),
  x_url: varchar("x_url", { length: 255 }),
  title: varchar("name", { length: 36 }).notNull(),
  url: varchar("url", { length: 255 }).notNull(),
  preview: varchar("preview", { length: 255 }).notNull(),
  tag: uuid("tag").notNull().references(() => tags.id)
});