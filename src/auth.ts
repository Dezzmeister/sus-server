import { Request, Response, NextFunction } from 'express';
import { logger } from './logging';
import * as jwt from 'jsonwebtoken';
import { config } from './config';
import { User } from './client';

export const jwtCookieKey = 'accessToken';

export async function jwtMiddleware(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
	const token = req.cookies[jwtCookieKey];

	jwt.verify(token, config.jwt.secret, (err: any, user: any) => {
		if (err) {
			const errorString = `User tried to access ${req.path} with no JWT: ${JSON.stringify(err)}`;
			logger.error(errorString);
			req.user = undefined;
		} else {
			req.user = user;
		}

		next();
	});
}

export interface AuthRequest extends Request {
	/** A user will always exist if AuthRequest is used properly, jwt middleware will fail if token is missing or bad */
	user?: User;
	token?: string;
}
