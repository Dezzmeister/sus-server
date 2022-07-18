import { config } from './config';
import http from 'http';
import https from 'https';
import fs from 'fs';
import handlebars from 'express-handlebars';
import express, { Application } from 'express';
import { logger, loggingMiddleware } from './logging';
import { getEntityManager, initDatabase } from './services/database';
import { RequestContext } from '@mikro-orm/core';
import { addRoutes } from './add_routes';
import cookieParser from 'cookie-parser';

export const app: Application = express();

const VIEWS_DIR = `${__dirname}/views`;

function makeHttpsServer(app: Application) {
	const key = fs.readFileSync(`${config.httpsKeyDir}/privkey.pem`, 'utf8');
	const cert = fs.readFileSync(`${config.httpsKeyDir}/cert.pem`, 'utf8');
	const ca = fs.readFileSync(`${config.httpsKeyDir}/chain.pem`, 'utf8');

	const credentials = {
		key,
		cert,
		ca,
	};

	return https.createServer(credentials, app);
}

function makeHttpServer(app: Application) {
	return http.createServer(app);
}

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

	const httpServer = makeHttpServer(app);

	httpServer.listen(config.server.port, () => {
		logger.info(`(HTTP) Sus URL server listening on port ${config.server.port}`);
	});

	if (config.https) {
		const httpsServer = makeHttpsServer(app);
		httpsServer.listen(config.httpsPort, () => {
			logger.info(`(HTTPS) Sus URL server listening on port ${config.httpsPort}`);
		});
	}
}

main();
