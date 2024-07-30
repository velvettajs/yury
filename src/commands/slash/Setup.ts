import type BaseClient from '#lib/BaseClient.js';
import Command from '#lib/structures/Command.js';
import { type ChatInputCommandInteraction, type TextChannel, CategoryChannel, ChannelType } from 'discord.js';
import { servers } from '#lib/models/Servers.js';
import { webhooks } from '#lib/models/Webhooks.js';
import db from '#lib/DatabaseClient.js';
import { eq } from 'drizzle-orm';
import { tags } from '#lib/models/Tags.js';

interface TagType {
	id: string;
	name: string;
}

export default class SetupCommand extends Command {
	public constructor(client: BaseClient) {
		super(client, {
			name: 'setup',
			description: 'Setup this server'
		});
	}
	private async getTags(): Promise<TagType[]> {
		return db.select().from(tags);
	}
	private async registerServer(serverId: string): Promise<void> {
		const existingServer = await db.select().from(servers).where(eq(servers.server_id, serverId));
		if (existingServer.length > 0) {
			throw new Error('This server has already been set up.');
		}
		await db.insert(servers).values({ server_id: serverId });
	}
	private async setupCategory(
		interaction: ChatInputCommandInteraction<'cached' | 'raw'>
	): Promise<CategoryChannel | null> {
		const category = (await interaction.guild?.channels.create({
			name: '— — — 🔥 >',
			type: ChannelType.GuildCategory,
			reason: 'Setup server category'
		})) as CategoryChannel;
		return category;
	}
	private async setupChannelAndWebhook(
		interaction: ChatInputCommandInteraction<'cached' | 'raw'>,
		tag: TagType,
		serverId: string,
		category: CategoryChannel
	): Promise<void> {
		const channel = (await interaction.guild?.channels.create({
			name: `・🍑┇${tag.name}`,
			parent: category.id,
			reason: 'Setup server channels',
			permissionOverwrites: [
				{
					id: interaction.guild.id,
					deny: ['SendMessages', 'AddReactions', 'CreatePublicThreads', 'CreatePrivateThreads']
				}
			]
		})) as TextChannel;
		const webhook = await channel.createWebhook({
			name: `${tag.name} webhook`,
			reason: 'Setup server webhooks'
		});
		await db.insert(webhooks).values({
			server_id: serverId,
			tag: tag.id,
			webhook_url: webhook.url
		});
	}
	public async execute(interaction: ChatInputCommandInteraction<'cached' | 'raw'>) {
		const serverId = interaction.guild?.id as string;
		if (!serverId) {
			return this.error(interaction, 'Failed to get the server ID.');
		}
		try {
			await this.registerServer(serverId);
		} catch (error) {
			return this.error(interaction, 'Failed to register server');
		}
		const category = await this.setupCategory(interaction);
		if (!category) {
			return this.error(interaction, 'Failed to create or find the category.');
		}
		const tags = await this.getTags();
		for (const tag of tags) {
			try {
				await this.setupChannelAndWebhook(interaction, tag, serverId, category);
			} catch (error) {
				console.error(`Error creating channel or webhook for ${tag.name}:`, error);
				return this.error(interaction, `Failed to setup the server. Error with channel ${tag.name}.`);
			}
		}
		return this.success(interaction, 'Server setup completed successfully.');
	}
}
