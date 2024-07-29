import { type APIApplicationCommand, ApplicationCommandOptionType, ApplicationCommandType } from 'discord-api-types/v10';

export default {
	name: 'tag',
	description: 'Create a tag in database.',
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
			type: ApplicationCommandOptionType.String,
			name: 'name',
			description: 'Name of tag.',
			required: false,
			autocomplete: true
		}
	],
} as APIApplicationCommand;
