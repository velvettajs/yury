import type BaseClient from '#lib/BaseClient.js';
import Command from '#lib/structures/Command.js';
import type { ChatInputCommandInteraction, AutocompleteInteraction, Attachment } from 'discord.js';
import db from '#lib/DatabaseClient.js';
import { eq } from 'drizzle-orm';
import { girls } from '#lib/models/Girls.js';
import cdn from '#lib/CdnClient.js';
import axios from 'axios';
import { fileTypeFromBuffer } from 'file-type';

export default class extends Command {
	public constructor(client: BaseClient) {
		super(client, {
			name: 'girl',
			description: 'Create, list, or delete girls in the database.'
		});
	}
	public async execute(interaction: ChatInputCommandInteraction<'cached' | 'raw'>) {
		const option: string | null = interaction.options.getString('option');
		const name: string | null = interaction.options.getString('name');
		const avatar: Attachment | null = interaction.options.getAttachment('avatar');
		try {
			switch (option) {
				case 'list':
					return this.listGirls(interaction);
				case 'create':
					return this.createGirl(interaction, name, avatar);
				case 'delete':
					return this.deleteGirl(interaction, name);
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
	private async createGirl(
		interaction: ChatInputCommandInteraction<'cached' | 'raw'>,
		name: string | null,
		avatar: Attachment | null
	) {
		if (!name) return this.error(interaction, 'You must provide a girl name.');
		if (!avatar) return this.error(interaction, 'You must provide a girl avatar.');
		const existingGirl = await db.select().from(girls).where(eq(girls.name, name));
		if (existingGirl.length > 0) return this.error(interaction, 'This girl already exists.');
		try {
			const response = await axios.get(avatar.url, { responseType: 'arraybuffer' });
			const avatarBuffer = Buffer.from(response.data);
			const format = await fileTypeFromBuffer(avatarBuffer);
			if (!format) throw new Error('Could not get avatar type');
			const avatarPath = await cdn.uploadToCdn(
				'girls',
				`${name}.${format?.ext}`,
				avatarBuffer,
				avatar.contentType || 'image/png'
			);
			await db.insert(girls).values({ name: name, avatar: `${cdn.url}/${avatarPath}` });
			return this.success(interaction, `Girl \`${name}\` created successfully.`);
		} catch (e) {
			console.log(e);
			return this.error(interaction, 'Error creating girl');
		}
	}
	private async deleteGirl(interaction: ChatInputCommandInteraction<'cached' | 'raw'>, girlName: string | null) {
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
