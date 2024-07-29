import { pgTable, text, uuid } from 'drizzle-orm/pg-core';
import { roles } from './Roles.js';

const userRole = '76c68940-9fd5-450d-bd21-04cab0a5ed55';
export const users = pgTable('users', {
	role: uuid('role')
		.default(userRole)
		.notNull()
		.references(() => roles.id),
	username: text('username').notNull(),
	userId: text('userId').notNull().unique(),
	id: uuid('id').primaryKey().defaultRandom()
});
