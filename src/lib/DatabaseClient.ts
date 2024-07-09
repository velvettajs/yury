import { neon } from '@neondatabase/serverless';
import { drizzle, type NeonHttpDatabase } from 'drizzle-orm/neon-http';

export default class DatabaseClient {
	private db: NeonHttpDatabase<Record<string, never>>;

	constructor(options: DatabaseOptions) {
		const { dbUri } = options;
		this.db = drizzle(neon(dbUri));
	}

	public getDb(): NeonHttpDatabase<Record<string, never>> {
		return this.db;
	}
}
