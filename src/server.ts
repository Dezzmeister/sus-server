import { config } from './config';

import express, { Application } from 'express';
import { logger, loggingMiddleware } from './logging';
import { getEntityManager, initDatabase } from './services/database';
import { RequestContext } from '@mikro-orm/core';
import { addRoutes } from './add_routes';
import cookieParser from 'cookie-parser';
import { initRedis } from './services/redis';

export const app: Application = express();

async function main(): Promise<void> {
	app.use(cookieParser());
	app.use(express.json());
	app.use(express.urlencoded());
	app.use(loggingMiddleware);

	await initDatabase();
	app.use(async (req, res, next) => {
		RequestContext.create(getEntityManager(), next);
	});

	initRedis();

	addRoutes(app);

	app.listen(config.server.port, () => {
		logger.info(`Sus URL server listening on port ${config.server.port}`);
	});
}

main();
