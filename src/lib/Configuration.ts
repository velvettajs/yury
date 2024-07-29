import type { PermissionsString } from 'discord.js';
import pkg from '../../package.json' assert { type: 'json' };

export const Client: ClientOptions = {
	token: process.env.DISCORD_TOKEN as string,
	version: (process.env.CLIENT_VERSION ??= pkg.version),
	owners: process.env.CLIENT_OWNERS?.split(',').filter((item) => item.length) as string[],
	debug: process.env.DEBUG_MODE === 'true',
	defaultPermissions: ['SendMessages', 'ViewChannel'] as PermissionsString[]
};
export const Database: DatabaseOptions = {
	dbUri: process.env.DATABASE_URL as string
};

export const Cdn: CdnOptions = {
	region: 'auto',
	endpoint: process.env.R2_ENDPOINT as string,
	credentials: {
		accessKeyId: process.env.R2_ACCESS_KEY as string,
		secretAccessKey: process.env.R2_SECRET_ACCESS_KEY as string
	}
};
