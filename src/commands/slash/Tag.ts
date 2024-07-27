import type BaseClient from '#lib/BaseClient.js';
import Command from '#lib/structures/Command.js';
import type { ChatInputCommandInteraction, AutocompleteInteraction } from 'discord.js';
import DatabaseClient from '#lib/DatabaseClient.js';
import { Database as Configuration } from '#lib/Configuration.js';
import { eq } from "drizzle-orm";
import { type NeonHttpDatabase } from 'drizzle-orm/neon-http';
import { tags } from '#lib/models/Tags.js';
export default class extends Command {
	private db: NeonHttpDatabase<Record<string, never>>;

	public constructor(client: BaseClient) {
		super(client, {
			name: 'tag',
			description: 'Create a tag in database.',
		});
		this.db = new DatabaseClient(Configuration).getDb();
	} 

	public async execute(interaction: ChatInputCommandInteraction<'cached' | 'raw'>) {

        const option = interaction.options.getString('option')
        let tagName = interaction.options.getString('name')

        try {
            switch(option) {
                case 'list':
                    const listTags = await this.db.select().from(tags)
                    const list = listTags.map(t => t.name).join('\n') || "Nope"
                    return interaction.reply({ content: `${list}`})

                case 'create':
                    if(!tagName) return interaction.reply({ content: 'You must provide a tag name.' })

                    const existingTag = await this.db.select().from(tags).where(eq(tags.name, tagName))
                    if(existingTag.length > 0) return interaction.reply({ content: 'This tag has already exist.'})

                        await this.db.insert(tags).values({
                            name: tagName
                        })
        
                        return interaction.reply({ content: `Tag \`${tagName}\` created successfully.`})

                    case 'delete':
                        if(!tagName) return interaction.reply({ content: 'You must provide a tag name.' })
                            
                        const deletedTag = await this.db.select().from(tags).where(eq(tags.name, tagName))
                        if(deletedTag.length === 0) return interaction.reply({ content: "The mentioned tag doesn't exist." })

                        await this.db.delete(tags).where(eq(tags.name, tagName))
                        return interaction.reply({ content: `Tag \`${tagName}\` deleted successfully.`})

                default:
                    return interaction.reply({ content: 'Invalid option. Use create or list' })
            }

        } catch (error) {
            console.error('Database query error:', error);
            return interaction.reply({ content: 'Failed to register the tag in the database.'})
        }
	}
    public override async autocomplete(interaction: AutocompleteInteraction<'cached' | 'raw'>) {
        const focusedOption = interaction.options.getFocused(true);

        if (focusedOption.name === 'option') {
            const options = ['create', 'list', 'delete'];
            const filteredOptions = options
                .filter(option => option.toLowerCase().startsWith(focusedOption.value.toLowerCase()))
                .slice(0, 25); // Limit results to 25

            await interaction.respond(
                filteredOptions.map(option => ({ name: option, value: option }))
            );
        }
    }
}
