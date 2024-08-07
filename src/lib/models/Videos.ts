import { pgTable, text, integer, uuid } from 'drizzle-orm/pg-core';
import { tags } from './Tags.js';

export const videos = pgTable('videos', {
	id: uuid('id').primaryKey().defaultRandom(),
	title: text('title').notNull(),
	description: text('description').notNull(),
	url: text('url').notNull().unique(),
	preview: text('preview'),
	image: text('image'),
	duration: text('duration').notNull(),
	views: integer('views').default(0)
});

export const videoTags = pgTable('video_tags', {
	videoId: uuid('video_id')
		.notNull()
		.references(() => videos.id),
	tagId: uuid('tag_id')
		.notNull()
		.references(() => tags.id)
});
