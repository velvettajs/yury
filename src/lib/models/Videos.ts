import { pgTable, text, uuid } from 'drizzle-orm/pg-core';
import { tags } from './Tags.js';

export const videos = pgTable('videos', {
	id: uuid('id').primaryKey().defaultRandom(),
	x_url: text('x_url'),
	url: text('url'),
	preview: text('preview').notNull(),
	tag: uuid('tag')
		.notNull()
		.references(() => tags.id)
});
