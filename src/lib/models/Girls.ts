import { pgTable, varchar, uuid } from "drizzle-orm/pg-core";

export const girls = pgTable('girls', {
    id: uuid('id').primaryKey().defaultRandom(),
    name: varchar('name').notNull(),
    avatar: varchar('avatar').notNull()
})