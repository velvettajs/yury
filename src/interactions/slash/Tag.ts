import { type APIApplicationCommand, ApplicationCommandOptionType, ApplicationCommandType } from 'discord-api-types/v10';

export default {
	name: 'tag',
	description: 'Perfom Tag operations in database.',
	type: ApplicationCommandType.ChatInput,
	dm_permission: true,
	options: [
		{
			type: ApplicationCommandOptionType.String,
			name: 'option',
			description: 'Choose a type of operation',
			required: true,
			autocomplete: true
		},
		{
			type: ApplicationCommandOptionType.String,
			name: 'name',
			description: 'Tag name',
			required: false,
			autocomplete: true
		}
	],
} as APIApplicationCommand;
