import { Request, Response, NextFunction } from 'express';
import winston from 'winston';

const { combine, colorize, timestamp, simple } = winston.format;

export const logger = winston.createLogger({
	level: 'info',
	format: winston.format.simple(),
	transports: [
		new winston.transports.File({
			filename: 'logs/error.log',
			level: 'error',
			maxsize: 5242880,
		}),
		new winston.transports.File({ filename: 'combined.log' }),
		new winston.transports.Console({
			format: combine(timestamp(), colorize({ all: true, colors: { debug: 'cyan' } }), simple()),
		}),
	],
});

export function loggingMiddleware(req: Request, res: Response, next: NextFunction): void {
	logger.info(`${req.method} ${req.path}`);
	next();
}