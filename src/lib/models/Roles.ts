import { pgTable, text, uuid } from 'drizzle-orm/pg-core';

export const roles = pgTable('roles', {
	id: uuid('id').primaryKey(),
	name: text('name').notNull()
});
