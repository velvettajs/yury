import type BaseClient from '#lib/BaseClient.js';
import Command from '#lib/structures/Command.js';
import type { AutocompleteInteraction, ChatInputCommandInteraction, Role } from 'discord.js';
import DatabaseClient from '#lib/DatabaseClient.js';
import { Database as Configuration } from '#lib/Configuration.js';
import { eq } from "drizzle-orm";
import { type NeonHttpDatabase } from 'drizzle-orm/neon-http';
import { roles } from '#lib/models/Roles.js';
export default class extends Command {
	private db: NeonHttpDatabase<Record<string, never>>;

	public constructor(client: BaseClient) {
		super(client, {
			name: 'role',
			description: 'Create a tag in database.',
		});
		this.db = new DatabaseClient(Configuration).getDb();
	} 

	public async execute(interaction: ChatInputCommandInteraction<'cached' | 'raw'>) {

        const option = interaction.options.getString('option')
        const role = interaction.options.getRole('rol') as Role | null;

        switch(option) {
            case 'list':
                const listRoles = await this.db.select().from(roles)
                const list = listRoles.map(r => r.name).join('\n') || "Roles not found"

                return interaction.reply({ content: list })

            case 'create':
                if(!role) return interaction.reply({ content: 'Role not found.' })
                const rolExists = await this.db.select().from(roles).where(eq(roles.id, role.id))
                if(rolExists.length > 0) return interaction.reply({ content: 'That role already exists.' })

                await this.db.insert(roles).values({
                    id: role.id as string,
                    name: role.name
                })

                return interaction.reply({ content: `Role \`${role.name}\` created successfully.`})
            case 'delete':
                if(!role) return interaction.reply({ content: 'Role not found.' })
                const rolToDelete = await this.db.select().from(roles).where(eq(roles.id, role.id))
                if(rolToDelete.length === 0) return interaction.reply({ content: "The mentioned role doesn't exist."})

                await this.db.delete(roles).where(eq(roles.id, role.id))

                return interaction.reply({ content: `Role \`${role.name}\` deleted successfully.`})

            default:
                return interaction.reply({ content: 'Invalid option. Use create, delete or list '})
        }
	}

    public override async autocomplete(interaction: AutocompleteInteraction<'cached' | 'raw'>) {
        const focusedOption = interaction.options.getFocused(true);

        if (focusedOption.name === 'option') {
            const options = ['list', 'create', 'delete'];
            const filteredOptions = options
                .filter(option => option.toLowerCase().startsWith(focusedOption.value.toLowerCase()))
                .slice(0, 25); // Limit results to 25

            await interaction.respond(
                filteredOptions.map(option => ({ name: option, value: option }))
            );
        }
    }
}
