import { neon } from '@neondatabase/serverless';
import { drizzle, type NeonHttpDatabase } from 'drizzle-orm/neon-http';
import { Database as Configuration } from './Configuration.js';
class DatabaseClient {
	private db: NeonHttpDatabase<Record<string, never>>;

	constructor(options: DatabaseOptions) {
		const { dbUri } = options;
		this.db = drizzle(neon(dbUri));
	}

	public getDb(): NeonHttpDatabase<Record<string, never>> {
		return this.db;
	}
}

export default new DatabaseClient(Configuration).getDb();
