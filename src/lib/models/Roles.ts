import { pgTable, varchar, uuid } from "drizzle-orm/pg-core";

export const roles = pgTable('roles', {
    id: uuid('id').primaryKey(),
    name: varchar('name').notNull()
})