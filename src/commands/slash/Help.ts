import type BaseClient from '#lib/BaseClient.js';
import Command from '#lib/structures/Command.js';
import type { ChatInputCommandInteraction } from 'discord.js';

export default class extends Command {
	public constructor(client: BaseClient) {
		super(client, {
			name: 'help',
			description: 'Shows help information and commands.'
		});
	}

	public execute(interaction: ChatInputCommandInteraction<'cached' | 'raw'>) {
		return interaction.reply({ content: 'https://www.velvetta.us' });
	}
}
