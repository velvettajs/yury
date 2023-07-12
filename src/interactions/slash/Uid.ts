import {
	type APIApplicationCommand,
	type APIApplicationCommandOption,
	ApplicationCommandOptionType,
	ApplicationCommandType
} from 'discord-api-types/v10';

export default {
	name: 'uid',
	description: 'Get information from a Discord profile.',
	type: ApplicationCommandType.ChatInput,
	options: [
		{
			name: 'user',
			description: 'User to get information for.',
			type: ApplicationCommandOptionType.User || ApplicationCommandOptionType.String,
			required: false
		}
	] as APIApplicationCommandOption[],
	dm_permission: false
} as APIApplicationCommand;
