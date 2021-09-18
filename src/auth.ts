import { Request, Response, NextFunction } from 'express';
import { User } from './entity/User';
import { logger } from './logging';
import { getUserBySession } from './services/users';

export async function authMiddleware(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
	let token = req.body?.token;

	const authHeader = req.headers.authorization as string | undefined;

	if (authHeader && authHeader.startsWith('Bearer ') && authHeader.length > 'Bearer '.length) {
		token = authHeader.split(' ')[1];
	}

	if (!token) {
		// TODO: i18n
		logger.error(`Unauthorized access of ${req.path}`);
		res.status(401).send({ status: 'error', error: 'Not authorized' });
		return;
	}

	const user = await getUserBySession(token);
	if (!user) {
		res.status(401).send({ status: 'error', error: 'Token expired, log in again' });
		return;
	}

	req.user = user;
	req.token = token;
	logger.info(`User with email ${user.email} logged in`);

	next();
}

export interface AuthRequest extends Request {
	/** A user will always exist if AuthRequest is used properly, jwt middleware will fail if token is missing or bad */
	user?: User;
	token?: string;
}
