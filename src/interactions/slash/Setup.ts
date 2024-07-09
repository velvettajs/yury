import { type APIApplicationCommand, ApplicationCommandType } from 'discord-api-types/v10';

export default {
	name: 'setup',
	description: 'Setup this guild',
	type: ApplicationCommandType.ChatInput,
	dm_permission: true
} as APIApplicationCommand;
