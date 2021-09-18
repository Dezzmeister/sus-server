import { config } from '../config';
import IORedis, { Redis } from 'ioredis';

// eslint-disable-next-line @typescript-eslint/no-var-requires
const IOMockRedis: any = require('ioredis-mock');

let redisInstance: Redis;

function getRealRedis(): Redis {
	return new IORedis({
		host: config.redis.hostname,
		port: config.redis.port,
	});
}

/** Dangerous typecast: some methods on Redis may not be implemented by ioredis-mock */
function getMockRedis(): Redis {
	return new IOMockRedis() as Redis;
}

export function initRedis(): Redis {
	if (config.redis.hostname && config.redis.port) {
		redisInstance = getRealRedis();
	} else {
		redisInstance = getMockRedis();
	}

	return redisInstance;
}

export function getRedis(): Redis {
	return redisInstance;
}
