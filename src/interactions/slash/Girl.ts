import { type APIApplicationCommand, ApplicationCommandOptionType, ApplicationCommandType } from 'discord-api-types/v10';

export default {
    name: 'girl',
    description: 'Shows help information and commands.',
    type: ApplicationCommandType.ChatInput,
    dm_permission: true,
    options: [
        {
            type: ApplicationCommandOptionType.String,
            name: 'option',
            description: 'osimp ponele algo a estas mierdas',
            required: true,
            autocomplete: true
        },
        {
            type: ApplicationCommandOptionType.String,
            name: 'name',
            description: 'lo de arriba x2',
            required: false,
            autocomplete: true
        },
        {
            type: ApplicationCommandOptionType.String,
            name: 'avatar',
            description: 'nose',
            required: false
        }
    ]
} as APIApplicationCommand;