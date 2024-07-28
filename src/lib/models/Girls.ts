import { pgTable, text, uuid } from 'drizzle-orm/pg-core';

export const girls = pgTable('girls', {
	id: uuid('id').primaryKey().defaultRandom(),
	name: text('name').notNull(),
	avatar: text('avatar').notNull()
});
