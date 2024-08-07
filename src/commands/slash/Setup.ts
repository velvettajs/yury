import type BaseClient from '#lib/BaseClient.js';
import Command from '#lib/structures/Command.js';
import { type ChatInputCommandInteraction, type TextChannel, CategoryChannel, ChannelType } from 'discord.js';
import { servers } from '#lib/models/Servers.js';
import { webhooks } from '#lib/models/Webhooks.js';
import db from '#lib/DatabaseClient.js';
import { eq, sql } from 'drizzle-orm';
import { tags } from '#lib/models/Tags.js';
import * as emoji from 'node-emoji';
export default class SetupCommand extends Command {
	public constructor(client: BaseClient) {
		super(client, {
			name: 'setup',
			description: 'Setup this server'
		});
	}
	private async getTags(): Promise<TagType[]> {
		const tagsList = await db
			.select()
			.from(tags)
			.orderBy(sql`RANDOM()`)
			.limit(30);
		return tagsList;
	}
	private async registerServer(serverId: string): Promise<void> {
		try {
			const existingServer = await db.select().from(servers).where(eq(servers.server_id, serverId));
			if (existingServer.length > 0) throw new Error('This server has already been set up.');
			await db.insert(servers).values({ server_id: serverId });
		} catch (error) {
			console.log('Failed to register server', error);
			throw new Error('Failed to register server');
		}
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
	private async getChannelName(name: string): Promise<string> {
		const nameSplitted: string[] = name.split('-');
		let channelEmoji: string = '🍑';
		for (const word of nameSplitted) {
			const foundEmoji = emoji.find(word);
			if (foundEmoji) return (channelEmoji = foundEmoji.emoji);
		}
		return channelEmoji;
	}
	private async setupChannelAndWebhook(
		interaction: ChatInputCommandInteraction<'cached' | 'raw'>,
		tag: TagType,
		serverId: string,
		category: CategoryChannel
	): Promise<void> {
		try {
			const channelEmoji = await this.getChannelName(tag.name);
			const channel = (await interaction.guild?.channels.create({
				name: `・${channelEmoji}┇${tag.name}`,
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
		} catch (e) {
			console.log('Failed creating channels and webhooks', e);
			throw new Error('Failed creating channels and webhooks');
		}
	}
	public async execute(interaction: ChatInputCommandInteraction<'cached' | 'raw'>) {
		try {
			const serverId = interaction.guild?.id as string;
			if (!serverId) return this.error(interaction, 'Failed to get the server ID.');
			await this.registerServer(serverId);
			const category = await this.setupCategory(interaction);
			if (!category) return this.error(interaction, 'Failed to create or find the category.');
			const tags = await this.getTags();
			for (const tag of tags) {
				await this.setupChannelAndWebhook(interaction, tag, serverId, category);
			}
			return this.success(interaction, 'Server setup completed successfully.');
		} catch (e) {
			if (e instanceof Error) return this.error(interaction, e.message);
			return this.error(interaction, 'Unexpected error occurred');
		}
	}
}
