import { type APIApplicationCommand, ApplicationCommandOptionType, ApplicationCommandType } from 'discord-api-types/v10';

export default {
	name: 'user',
	description: 'Perform user operations in database.',
	type: ApplicationCommandType.ChatInput,
	dm_permission: true,
	options: [
        {
            type: ApplicationCommandOptionType.String,
            name: 'option',
            description: 'Missing arguments',
            required: true,
            autocomplete: true
        },
		{
			type: ApplicationCommandOptionType.User,
			name: 'user',
			description: 'Mention an user',
			required: false
		}
	],
} as APIApplicationCommand;
