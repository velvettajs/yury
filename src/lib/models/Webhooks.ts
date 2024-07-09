// webhooks.ts
import { pgTable, varchar } from 'drizzle-orm/pg-core';
import { servers } from './Servers.js';

export const webhooks = pgTable('webhooks', {
	server_id: varchar('server_id') // Debe coincidir con el nombre en la tabla 'servers'
		.notNull()
		.references(() => servers.server_id),
	webhook_url: varchar('webhook_url', { length: 255 }).notNull(),
	channel_tag: varchar('channel_tag', { length: 100 }).notNull()
});
