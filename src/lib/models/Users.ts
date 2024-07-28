import { pgTable, text, uuid } from "drizzle-orm/pg-core";
import { roles } from "./Roles.js";

export const users = pgTable('users', {
    role: uuid('role').notNull().references(() => roles.id),
    username: text('username').notNull(),
    id: uuid('id').primaryKey(),
})