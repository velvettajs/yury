import type BaseClient from '#lib/BaseClient.js';
import Command from '#lib/structures/Command.js';
import type { ChatInputCommandInteraction } from 'discord.js';
import DatabaseClient from '#lib/DatabaseClient.js';
import { Database as Configuration } from '#lib/Configuration.js';
import { eq } from "drizzle-orm";
import { type NeonHttpDatabase } from 'drizzle-orm/neon-http';
import { users } from '#lib/models/Users.js';
export default class extends Command {
	private db: NeonHttpDatabase<Record<string, never>>;

	public constructor(client: BaseClient) {
		super(client, {
			name: 'add',
			description: 'Create a tag in database.',
		});
		this.db = new DatabaseClient(Configuration).getDb();
	} 

	public async execute(interaction: ChatInputCommandInteraction<'cached' | 'raw'>) {

        // const option = interaction.options.getString('option')
        const user = interaction.options.getUser('user')
        // const role = interaction.options.getRole('role')

        if(!user) throw new Error("No user detected.")

        // const usExists: { id: string }[] = await this.db.select({ id: user?.id }).from(users)
        const usExists = await this.db.select().from(users).where(eq(users.id, user.id))
        if(usExists) return interaction.reply({ content: 'That user is already exist.'})
        
        // try {
        //     await this.db.insert(users).values({
        //         role: role?.id,
        //         username: user.username,
        //         id: user?.id,
        //     })
        // } catch (error) {
            
        // }
	}
}
