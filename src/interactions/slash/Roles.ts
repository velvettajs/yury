import { type APIApplicationCommand, ApplicationCommandOptionType, ApplicationCommandType } from 'discord-api-types/v10';

export default {
	name: 'role',
	description: 'Create a role in database.',
	type: ApplicationCommandType.ChatInput,
	dm_permission: true,
	options: [
		{
			type: ApplicationCommandOptionType.String,
			name: 'option',
			description: 'nose',
			required: true,
            autocomplete: true
		},
		{
			type: ApplicationCommandOptionType.Role,
			name: 'rol',
			description: 'Mention an role',
			required: false
		}
	],
} as APIApplicationCommand;
