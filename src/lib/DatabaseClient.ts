import { Pool } from '@neondatabase/serverless';
import { neonConfig } from '@neondatabase/serverless';
import ws from 'ws';
import type { PoolClient } from '@neondatabase/serverless';

neonConfig.webSocketConstructor = ws;

export default class DatabaseClient {
	private pool: Pool;
	private client!: PoolClient;
	constructor(private dbUri: string) {
		this.pool = new Pool({ connectionString: this.dbUri });
		this.pool.on('error', (err) => console.error(err));
	}

	public async connect() {
		try {
			this.client = await this.pool.connect();
			console.log('Neon connection established!');
			this.startKeepAlive();
		} catch (error) {
			console.error('Database connection error:', error);
		}
	}

	private startKeepAlive() {
		setInterval(async () => {
			try {
				await this.client.query('SELECT 1');
				console.log('Keep-alive query executed.');
			} catch (error) {
				console.error('Keep-alive query failed:', error);
				await this.connect();
			}
		}, 1 * 60 * 1000);
	}
	public async queryDatabase(query: string, params: any[] = []) {
		try {
			console.log('Executing Query:', query);
			const result = await this.client.query(query, params);
			return result.rows;
		} catch (error) {
			console.error('Database query error:', error);
			throw error;
		}
	}

	public async createTables() {
		try {
			await this.queryDatabase(
				`
                CREATE TABLE IF NOT EXISTS servers (
                    server_id BIGINT PRIMARY KEY
                );
            `
			);
			await this.queryDatabase(
				`
                CREATE TABLE IF NOT EXISTS webhooks (
                    webhook_id SERIAL PRIMARY KEY,
                    server_id BIGINT,
                    webhook_url VARCHAR(255) NOT NULL,
                    channel_tag VARCHAR(100) NOT NULL,
                    FOREIGN KEY (server_id) REFERENCES servers(server_id)
                );
            `
			);
		} catch (error) {
			console.error('Error ensuring table exists:', error);
			throw error;
		}
	}
}
