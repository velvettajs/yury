// webhooks.ts
import { pgTable, uuid, varchar } from 'drizzle-orm/pg-core';
import { servers } from './Servers.js';
import { tags } from './Tags.js';

export const webhooks = pgTable('webhooks', {
	server_id: varchar('server_id')
		.notNull()
		.references(() => servers.server_id),
	webhook_url: varchar('webhook_url', { length: 255 }).primaryKey(),
	tag: uuid('tag').notNull().references(() => tags.id)
});
