import { pgTable, text } from 'drizzle-orm/pg-core';

export const servers = pgTable('servers', {
	server_id: text('server_id').primaryKey()
});
