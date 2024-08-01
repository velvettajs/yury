import { pgTable, text, integer, uuid } from 'drizzle-orm/pg-core';
import { tags } from './Tags.js';

export const videos = pgTable('videos', {
	id: uuid('id').primaryKey().defaultRandom(),
	title: text('title').notNull(),
	description: text('description').notNull(),
	url: text('url').notNull().unique(),
	preview: text('preview').notNull(),
	image: text('image').notNull(),
	duration: text('duration').notNull(),
	hls: text('hls').notNull(),
	low: text('low').notNull(),
	high: text('high').notNull(),
	views: integer('views').notNull(),
	tag: uuid('tag')
		.notNull()
		.references(() => tags.id)
});
