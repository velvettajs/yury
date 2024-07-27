import type BaseClient from '#lib/BaseClient.js';
import Command from '#lib/structures/Command.js';
import type { ChatInputCommandInteraction } from 'discord.js';
import DatabaseClient from '#lib/DatabaseClient.js';
import { Database as Configuration } from '#lib/Configuration.js';
import { eq } from "drizzle-orm";
import { type NeonHttpDatabase } from 'drizzle-orm/neon-http';
import { tags } from '#lib/models/Tags.js';
export default class extends Command {
	private db: NeonHttpDatabase<Record<string, never>>;

	public constructor(client: BaseClient) {
		super(client, {
			name: 'tag',
			description: 'Create a tag in database.',
		});
		this.db = new DatabaseClient(Configuration).getDb();
	}

	public async execute(interaction: ChatInputCommandInteraction<'cached' | 'raw'>) {

        const tagName = interaction.options.getString('name')
        if(!tagName) return interaction.reply({ content: 'You must provide a tag name.' })

        try {
            const existingTag: { name: string }[] = await this.db.select().from(tags).where(eq(tags.name, tagName))
            if(existingTag) return interaction.reply({ content: 'This tag has already exist.'})
                await this.db.insert(tags).values({
                    name: tagName
                })
        } catch (error) {
            console.error('Database query error:', error);
            return interaction.reply({ content: 'Failed to register the tag in the database.'})
        }
	}
}
