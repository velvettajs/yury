import { pgTable, varchar, uuid } from "drizzle-orm/pg-core";

export const tags = pgTable('tags', {
    id: uuid('id').primaryKey().defaultRandom(),
    name: varchar('name').notNull()
})