import type { Pool, PoolClient } from '@neondatabase/serverless';
import type BaseClient from '#lib/BaseClient.js';
import type { PermissionsString } from 'discord.js';
import type { EventEmitter } from 'node:events';

declare global {
	interface ClientOptions {
		token: any;
		version: string;
		owners: string[];
		debug: boolean;
		defaultPermissions: PermissionsString[];
	}
	interface DatabaseOptions {
		dbUri: string;
	}
	interface CommandOptions {
		name: string;
		description?: string;
		memberPermissions?: PermissionsString[];
		clientPermissions?: PermissionsString[];
		disabled?: boolean;
		context?: boolean;
		guildOnly?: boolean;
		ownerOnly?: boolean;
		options?: {
			type: number;
			name: string;
			description: string;
			required?: boolean;
		}[];
	}

	interface DatabaseOptions {
		dbUri: string;
	}

	interface CdnOptions {
		region: string;
		endpoint: string;
		credentials: {
			accessKeyId: string;
			secretAccessKey: string;
		};
	}

	interface EventOptions {
		name: string;
		once?: boolean;
		emitter?: keyof BaseClient | EventEmitter;
	}

	interface WebhookType {
		tag: string;
		webhook_url: string;
		server_id: string;
	}

	interface VideoType {
		id: string;
		x_url: string;
		preview: string;
		tag: string;
	}

	interface GirlType {
		name: string;
		avatar: string;
	}

	interface TagType {
		id: string;
		name: string;
	}

	interface ServerType {
		server_id: string;
	}
}
