import type BaseClient from '#lib/BaseClient.js';
import Command from '#lib/structures/Command.js';
import type { ChatInputCommandInteraction, AutocompleteInteraction } from 'discord.js';
import DatabaseClient from '#lib/DatabaseClient.js';
import { Database as Configuration } from '#lib/Configuration.js';
import { eq } from 'drizzle-orm';
import { type NeonHttpDatabase } from 'drizzle-orm/neon-http';
import { tags } from '#lib/models/Tags.js';
export default class extends Command {
	private db: NeonHttpDatabase<Record<string, never>>;
	public constructor(client: BaseClient) {
		super(client, {
			name: 'tag',
			description: 'Create, list, or delete tags in the database.'
		});
		this.db = new DatabaseClient(Configuration).getDb();
	}
	public async execute(interaction: ChatInputCommandInteraction<'cached' | 'raw'>) {
		const option = interaction.options.getString('option');
		const tagName = interaction.options.getString('name');
		try {
			switch (option) {
				case 'list':
					return this.listTags(interaction);
				case 'create':
					return this.createTag(interaction, tagName);
				case 'delete':
					return this.deleteTag(interaction, tagName);
				default:
					return this.error(interaction, 'Invalid option. Use create, list, or delete.');
			}
		} catch (error) {
			console.error('Database query error:', error);
			return this.error(interaction, 'Failed to perform the operation on the database.');
		}
	}
	private async listTags(interaction: ChatInputCommandInteraction<'cached' | 'raw'>) {
		const listTags = await this.db.select().from(tags);
		const list = listTags.map((t, i) => `\`${i + 1}\`. **${t.name}**`).join('\n') || 'No tags available.';
		return this.success(interaction, list)
	}
	private async createTag(interaction: ChatInputCommandInteraction<'cached' | 'raw'>, tagName: string | null) {
		if (!tagName) return this.error(interaction, 'You must provide a tag name.');
		const existingTag = await this.db.select().from(tags).where(eq(tags.name, tagName));
		if (existingTag.length > 0) return this.error(interaction, 'This tag already exists.');
		await this.db.insert(tags).values({ name: tagName });
		return this.success(interaction, `Tag \`${tagName}\` created successfully.`);
	}
	private async deleteTag(interaction: ChatInputCommandInteraction<'cached' | 'raw'>, tagName: string | null) {
		if (!tagName) return this.error(interaction, 'You must provide a tag name.');
		const existingTag = await this.db.select().from(tags).where(eq(tags.name, tagName));
		if (existingTag.length === 0) return this.error(interaction, "The mentioned tag doesn't exist.");
		await this.db.delete(tags).where(eq(tags.name, tagName));
		return this.success(interaction, `Tag \`${tagName}\` deleted successfully.`);
	}
	public override async autocomplete(interaction: AutocompleteInteraction<'cached' | 'raw'>) {
        const focusedOption = interaction.options.getFocused(true);
        const option = interaction.options.getString('option');

        if (option === 'delete' && focusedOption.name === 'name') {
            const allTags = await this.db.select().from(tags);
            const filteredTags = allTags
                .filter(tag => tag.name.toLowerCase().startsWith(focusedOption.value.toLowerCase()))
                .slice(0, 25);
            await interaction.respond(filteredTags.map(tag => ({ name: tag.name, value: tag.name })));
        } else if (focusedOption.name === 'option') {
            const options = ['create', 'delete', 'list'];
            const filteredOptions = options
                .filter(option => option.toLowerCase().startsWith(focusedOption.value.toLowerCase()))
                .slice(0, 25);
            await interaction.respond(filteredOptions.map(option => ({ name: option, value: option })));
        }
    }
}
