import type BaseClient from '#lib/BaseClient.js';
import Command from '#lib/structures/Command.js';
import type { ChatInputCommandInteraction, AutocompleteInteraction } from 'discord.js';
import db from '#lib/DatabaseClient.js';
import { eq } from 'drizzle-orm';
import { girls } from '#lib/models/Girls.js';
export default class extends Command {
	public constructor(client: BaseClient) {
		super(client, {
			name: 'girl',
			description: 'Create, list, or delete girls in the database.'
		});
	}
	public async execute(interaction: ChatInputCommandInteraction<'cached' | 'raw'>) {
		const option = interaction.options.getString('option');
		const girlName = interaction.options.getString('name');
		const girlAvatar = interaction.options.getString('avatar');
		try {
			switch (option) {
				case 'list':
					return this.listGirls(interaction);
				case 'create':
					return this.createGirls(interaction, girlName, girlAvatar);
				case 'delete':
					return this.deleteGirls(interaction, girlName);
				default:
					return this.error(interaction, 'Invalid option. Use create, list, or delete.');
			}
		} catch (error) {
			console.error('Database query error:', error);
			return this.error(interaction, 'Failed to perform the operation on the database.');
		}
	}
	private async listGirls(interaction: ChatInputCommandInteraction<'cached' | 'raw'>) {
		const listGirls = await db.select().from(girls);
		const list = listGirls.map((g, i) => `\`${i + 1}\`. **${g.name}**`).join('\n') || 'No girls available.';
		return this.success(interaction, list);
	}
	private async createGirls(
		interaction: ChatInputCommandInteraction<'cached' | 'raw'>,
		girlName: string | null,
		girlAvatar: string | null
	) {
		if (!girlName) return this.error(interaction, 'You must provide a girl name.');
		if (!girlAvatar) return this.error(interaction, 'You must provide a girl avatar.');
		const existingGirl = await db.select().from(girls).where(eq(girls.name, girlName));
		if (existingGirl.length > 0) return this.error(interaction, 'This girl already exists.');
		await db.insert(girls).values({ name: girlName, avatar: 'ponle algo amigo' });
		return this.success(interaction, `Girl \`${girlName}\` created successfully.`);
	}
	private async deleteGirls(interaction: ChatInputCommandInteraction<'cached' | 'raw'>, girlName: string | null) {
		if (!girlName) return this.error(interaction, 'You must provide a girl name.');
		const existingGirl = await db.select().from(girls).where(eq(girls.name, girlName));
		if (existingGirl.length === 0) return this.error(interaction, "The mentioned girl doesn't exist.");
		await db.delete(girls).where(eq(girls.name, girlName));
		return this.success(interaction, `Girl \`${girlName}\` deleted successfully.`);
	}
	public override async autocomplete(interaction: AutocompleteInteraction<'cached' | 'raw'>) {
		const focusedOption = interaction.options.getFocused(true);
		const option = interaction.options.getString('option');

		if (option === 'delete' && focusedOption.name === 'name') {
			const allgirls = await db.select().from(girls);
			const filteredgirls = allgirls
				.filter((girl) => girl.name.toLowerCase().startsWith(focusedOption.value.toLowerCase()))
				.slice(0, 25);
			await interaction.respond(filteredgirls.map((girl) => ({ name: girl.name, value: girl.name })));
		} else if (focusedOption.name === 'option') {
			const options = ['create', 'delete', 'list'];
			const filteredOptions = options
				.filter((option) => option.toLowerCase().startsWith(focusedOption.value.toLowerCase()))
				.slice(0, 25);
			await interaction.respond(filteredOptions.map((option) => ({ name: option, value: option })));
		}
	}
}
