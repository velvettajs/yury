import { type APIApplicationCommand, ApplicationCommandOptionType, ApplicationCommandType } from 'discord-api-types/v10';

export default {
    name: 'girl',
    description: 'Perform Girl operations in database.',
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
            description: 'Girl name',
            required: false,
            autocomplete: false
        },
        {
            type: ApplicationCommandOptionType.Attachment,
            name: 'avatar',
            description: 'Avatar attachment',
            required: false
        }
    ]
} as APIApplicationCommand;