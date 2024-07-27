import { type APIApplicationCommand, ApplicationCommandType } from 'discord-api-types/v10';

export default {
	name: 'tag',
	description: 'Create a tag in database.',
	type: ApplicationCommandType.ChatInput,
	dm_permission: true,
} as APIApplicationCommand;
