import { pgTable, varchar, uuid } from "drizzle-orm/pg-core";
import { roles } from "./Roles.js";

export const users = pgTable('users', {
    role: uuid('role').notNull().references(() => roles.id),
    username: varchar('username').notNull(),
    id: uuid('id').primaryKey().defaultRandom(),
})