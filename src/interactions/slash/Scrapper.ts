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
			name: 'token',
			description: 'Get information about users with rare badges on a server.',
			type: ApplicationCommandOptionType.String|| ApplicationCommandOptionType.String,
			required: false
		},
		{
			name: 'guild_id',
			description: 'Guild I',
			type: ApplicationCommandOptionType.String || ApplicationCommandOptionType.String,
			required: false
		},
		{
			name: 'channel_id',
			description: 'Channel I',
			type: ApplicationCommandOptionType.String || ApplicationCommandOptionType.String,
			required: false
		}
	] as APIApplicationCommandOption[],
	dm_permission: true
} as APIApplicationCommand;
