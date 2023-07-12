import { type APIApplicationCommand, ApplicationCommandType } from 'discord-api-types/v10';

export default {
	name: 'help',
	description: 'Shows help information and commands.',
	type: ApplicationCommandType.ChatInput,
	dm_permission: true
} as APIApplicationCommand;
