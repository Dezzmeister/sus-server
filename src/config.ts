import dotenv from 'dotenv';
dotenv.config();

export interface Config {
	env: string;
	server: {
		hostname: string;
		port: number;
	};
	redis: {
		hostname?: string;
		port?: number;
	};
}

export const defaultConfig: Config = {
	env: 'dev',
	server: {
		hostname: 'localhost',
		port: 4000,
	},
	redis: {
		hostname: undefined,
		port: undefined,
	},
};

function asNumber(param: string | undefined): number | undefined {
	return param as unknown as number | undefined;
}

export const config: Config = {
	env: process.env.ENV ?? defaultConfig.env,
	server: {
		hostname: process.env.HOSTNAME ?? defaultConfig.server.hostname,
		port: asNumber(process.env.PORT) ?? defaultConfig.server.port,
	},
	redis: {
		hostname: process.env.REDIS_HOSTNAME ?? defaultConfig.redis.hostname,
		port: asNumber(process.env.REDIS_PORT) ?? defaultConfig.redis.port,
	},
};
