import { config } from './config';
import handlebars from 'express-handlebars';
import express, { Application } from 'express';
import { logger, loggingMiddleware } from './logging';
import { getEntityManager, initDatabase } from './services/database';
import { RequestContext } from '@mikro-orm/core';
import { addRoutes } from './add_routes';
import cookieParser from 'cookie-parser';

export const app: Application = express();

const VIEWS_DIR = `${__dirname}/views`;

async function main(): Promise<void> {
	app.set('view engine', 'handlebars');
	app.set('views', VIEWS_DIR);
	app.engine('handlebars', handlebars({ defaultLayout: 'main' }));

	app.use(cookieParser());
	app.use(express.json());
	app.use(express.urlencoded());
	app.use(loggingMiddleware);

	app.use(express.static(VIEWS_DIR));

	await initDatabase();
	app.use(async (req, res, next) => {
		RequestContext.create(getEntityManager(), next);
	});

	addRoutes(app);

	app.listen(config.server.port, () => {
		logger.info(`Sus URL server listening on port ${config.server.port}`);
	});
}

main();
