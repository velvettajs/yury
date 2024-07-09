import type BaseClient from '#lib/BaseClient.js';
import Command from '#lib/structures/Command.js';
import type { ChatInputCommandInteraction, TextChannel, NewsChannel } from 'discord.js';

export default class extends Command {
	public constructor(client: BaseClient) {
		super(client, {
			name: 'setup',
			description: 'Setup this server'
		});
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
		const webhooks: { channel_tag: string; webhook_url: string }[] = [];

		try {
			// Check if the server is already registered
			const existingServer = await this.client.queryDatabase(`SELECT * FROM servers WHERE server_id = $1`, [
				interaction.guild?.id
			]);
			if (Array.isArray(existingServer) && existingServer.length > 0) {
				return interaction.reply({ content: 'This server has already been set up.' });
			}

			// Insert the server ID into the servers table
			await this.client.queryDatabase(`INSERT INTO servers (server_id) VALUES ($1)`, [interaction.guild?.id]);
		} catch (error) {
			console.error('Database query error:', error);
			return interaction.reply({ content: 'Failed to register the server in the database.' });
		}

		for (const channelName of channelNames) {
			try {
				const channel = (await interaction.guild?.channels.create({
					name: channelName,
					reason: 'Setup server channels'
				})) as TextChannel | NewsChannel;
				const webhook = await channel.createWebhook({
					name: `${channelName} webhook`,
					reason: 'Setup server webhooks'
				});

				webhooks.push({ channel_tag: channelName, webhook_url: webhook.url });

				// Insert the webhook into the webhooks table
				await this.client.queryDatabase(
					`INSERT INTO webhooks (server_id, webhook_url, channel_tag) VALUES ($1, $2, $3)`,
					[interaction.guild?.id, webhook.url, channelName]
				);
			} catch (error) {
				console.error(`Error creating channel or webhook for ${channelName}:`, error);
				return interaction.reply({ content: `Failed to setup the server. Error with channel ${channelName}.` });
			}
		}

		return interaction.reply({ content: `Server setup completed successfully.` });
	}
}
