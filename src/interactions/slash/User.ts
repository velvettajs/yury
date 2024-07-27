import { type APIApplicationCommand, ApplicationCommandOptionType, ApplicationCommandType } from 'discord-api-types/v10';

export default {
	name: 'add',
	description: 'Create a tag in database.',
	type: ApplicationCommandType.ChatInput,
	dm_permission: true,
	options: [
        {
            type: ApplicationCommandOptionType.String,
            name: 'option',
            description: 'Missing arguments',
            required: true
        },
		{
			type: ApplicationCommandOptionType.User,
			name: 'user',
			description: 'Mention an user',
			required: true
		},
        {
            type: ApplicationCommandOptionType.Role,
            name: 'role',
            description: 'mention a role',
            required: true
        }
	],
} as APIApplicationCommand;
