import { pgTable, varchar } from 'drizzle-orm/pg-core';

export const servers = pgTable('servers', {
	server_id: varchar('server_id', { length: 255 }).primaryKey() 
});
