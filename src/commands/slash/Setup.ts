import type BaseClient from '#lib/BaseClient.js';
import Command from '#lib/structures/Command.js';
import type { ChatInputCommandInteraction, TextChannel, NewsChannel } from 'discord.js';
import { servers } from '#lib/models/Servers.js';
import { webhooks } from '#lib/models/Webhooks.js';
import DatabaseClient from '#lib/DatabaseClient.js';
import { Database as Configuration } from '#lib/Configuration.js';
import { eq } from "drizzle-orm";
import { type NeonHttpDatabase } from 'drizzle-orm/neon-http';
export default class extends Command {
	private db: NeonHttpDatabase<Record<string, never>>;

	public constructor(client: BaseClient) {
		super(client, {
			name: 'setup',
			description: 'Setup this server'
		});
		this.db = new DatabaseClient(Configuration).getDb();
	}

	public async execute(interaction: ChatInputCommandInteraction<'cached' | 'raw'>) {
		const channelNames = [
			'goth',
			'threesome',
			'orgies',
			'twerk',
			'hardcore',
			'lesbians',
			'milf',
			'hentai',
			'asian',
			'latina',
			'feet'
		];
		const server_id = interaction.guild?.id as string;
		try {
			const existingServer = await this.db.select().from(servers).where(eq(servers.server_id, server_id));
			if (existingServer.length > 0) return interaction.reply({ content: 'This server has already been set up.' });
			await this.db.insert(servers).values({ server_id });
		} catch (error) {
			console.error('Database query error:', error);
			return interaction.reply({ content: 'Failed to register the server in the database.' });
		}

		for (const channelName of channelNames) {
			try {
				const channel = (await interaction.guild?.channels.create({
					name: `・🍑┇${channelName}`,
					reason: 'Setup server channels'
				})) as TextChannel | NewsChannel;
				const webhook = await channel.createWebhook({
					name: `${channelName} webhook`,
					reason: 'Setup server webhooks'
				});

				await this.db.insert(webhooks).values({
					server_id,
					channel_tag: channelName,
					webhook_url: webhook.url
				});
			} catch (error) {
				console.error(`Error creating channel or webhook for ${channelName}:`, error);
				return interaction.reply({ content: `Failed to setup the server. Error with channel ${channelName}.` });
			}
		}

		return interaction.reply({ content: `Server setup completed successfully.` });
	}
}
