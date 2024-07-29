import type BaseClient from '#lib/BaseClient.js';
import Command from '#lib/structures/Command.js';
import type { AutocompleteInteraction, ChatInputCommandInteraction } from 'discord.js';
import DatabaseClient from '#lib/DatabaseClient.js';
import { Database as Configuration } from '#lib/Configuration.js';
import { eq } from 'drizzle-orm';
import { type NeonHttpDatabase } from 'drizzle-orm/neon-http';
import { users } from '#lib/models/Users.js';
import { roles } from '#lib/models/Roles.js';
export default class extends Command {
	private db: NeonHttpDatabase<Record<string, never>>;

	public constructor(client: BaseClient) {
		super(client, {
			name: 'user',
			description: 'Create a tag in database.'
		});
		this.db = new DatabaseClient(Configuration).getDb();
	}

	public async execute(interaction: ChatInputCommandInteraction<'cached' | 'raw'>) {
		const option = interaction.options.getString('option');
		const user = interaction.options.getUser('user');

		try {
			switch (option) {
				case 'list':
					return this.listUsers(interaction);
				case 'add':
					if (!user) return this.error(interaction, 'No user detected');
					return this.addUser(interaction, user.id, user.username);
				case 'remove':
					if (!user) return this.error(interaction, 'No user detected');
					return this.removeUser(interaction, user.id, user.username);
			}
		} catch (error) {
			console.error('Database query error:', error);
			return this.error(interaction, 'Failed to perform the operation on the database.');
		}
	}

	private async listUsers(interaction: ChatInputCommandInteraction<'cached' | 'raw'>) {
		const listUsers = await this.db.select({ id: users.id, username: users.username, roles: roles.name }).from(users).innerJoin(roles, eq(users.role, roles.id))
		const usuarios =
			listUsers.map((u, i) => `\`${i + 1}\`. **${u.username}** (${u.roles})`).join('\n') || 'No users available.';
		return this.success(interaction, `${usuarios}`);
	}

	private async addUser(interaction: ChatInputCommandInteraction<'cached' | 'raw'>, userId: string, username: string) {
		const usExists = await this.db.select().from(users).where(eq(users.userId, userId));
		if (usExists.length > 0) return this.error(interaction, 'The specified user already exists.');
		await this.db.insert(users).values({
			userId,
			username
		});
		return this.success(interaction, `User \`${username}\` successfully added.`);
	}

	private async removeUser(
		interaction: ChatInputCommandInteraction<'cached' | 'raw'>,
		userId: string,
		userName: string
	) {
		const usExists = await this.db.select().from(users).where(eq(users.userId, userId));
		if (usExists.length === 0) return this.error(interaction, "The mentioned user doesn't exist.");
		await this.db.delete(users).where(eq(users.userId, userId));
		return this.success(interaction, `User \`${userName}\` successfully removed.`);
	}
	public override async autocomplete(interaction: AutocompleteInteraction<'cached' | 'raw'>) {
        const focusedOption = interaction.options.getFocused(true);
        const option = interaction.options.getString('option');

        if (option === 'remove' && focusedOption.name === 'user') {
            const allUsers = await this.db.select().from(users);
            const filteredUsers = allUsers
                .filter(user => user.username.toLowerCase().startsWith(focusedOption.value.toLowerCase()))
                .slice(0, 25);
            await interaction.respond(filteredUsers.map(user => ({ name: user.username, value: user.username })));
        } else if (focusedOption.name === 'option') {
            const options = ['add', 'remove', 'list'];
            const filteredOptions = options
                .filter(option => option.toLowerCase().startsWith(focusedOption.value.toLowerCase()))
                .slice(0, 25);
            await interaction.respond(filteredOptions.map(option => ({ name: option, value: option })));
        }
    }
}
