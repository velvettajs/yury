import type BaseClient from '#lib/BaseClient.js';
import Command from '#lib/structures/Command.js';
import type { ChatInputCommandInteraction, TextChannel } from 'discord.js';
import { servers } from '#lib/models/Servers.js';
import { webhooks } from '#lib/models/Webhooks.js';
import DatabaseClient from '#lib/DatabaseClient.js';
import { Database as Configuration } from '#lib/Configuration.js';
import { eq } from 'drizzle-orm';
import { type NeonHttpDatabase } from 'drizzle-orm/neon-http';
import { tags } from '#lib/models/Tags.js';

interface TagType {
	id: string;
	name: string;
}

export default class SetupCommand extends Command {
	private db: NeonHttpDatabase<Record<string, never>>;

	public constructor(client: BaseClient) {
		super(client, {
			name: 'setup',
			description: 'Setup this server'
		});
		this.db = new DatabaseClient(Configuration).getDb();
	}

	private async getTags(): Promise<TagType[]> {
		return this.db.select().from(tags);
	}

	private async registerServer(serverId: string): Promise<void> {
		const existingServer = await this.db.select().from(servers).where(eq(servers.server_id, serverId));
		if (existingServer.length > 0) {
			throw new Error('This server has already been set up.');
		}
		await this.db.insert(servers).values({ server_id: serverId });
	}

	private async setupChannelAndWebhook(
		interaction: ChatInputCommandInteraction<'cached' | 'raw'>,
		tag: TagType,
		serverId: string
	): Promise<void> {
		const channel = (await interaction.guild?.channels.create({
			name: `・🍑┇${tag.name}`,
			reason: 'Setup server channels'
		})) as TextChannel;

		const webhook = await channel.createWebhook({
			name: `${tag.name} webhook`,
			reason: 'Setup server webhooks'
		});

		await this.db.insert(webhooks).values({
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

		const tags = await this.getTags();
		for (const tag of tags) {
			try {
				await this.setupChannelAndWebhook(interaction, tag, serverId);
			} catch (error) {
				console.error(`Error creating channel or webhook for ${tag.name}:`, error);
				return this.error(interaction, `Failed to setup the server. Error with channel ${tag.name}.`);
			}
		}

		return this.success(interaction, 'Server setup completed successfully.');
	}
}
