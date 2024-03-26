import {
	type APIApplicationCommand,
	type APIApplicationCommandOption,
	ApplicationCommandOptionType,
	ApplicationCommandType
} from 'discord-api-types/v10';

export default {
	name: 'scrapper',
	description: 'Get information about users with rare badges on a server.',
	type: ApplicationCommandType.ChatInput,
	options: [
		{
			name: 'user',
			description: 'Get information about users with rare badges on a server.',
			type: ApplicationCommandOptionType.User || ApplicationCommandOptionType.String,
			required: false
		}
	] as APIApplicationCommandOption[],
	dm_permission: true
} as APIApplicationCommand;
