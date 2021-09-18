import { Application, Request, Response } from 'express';
import { authMiddleware, AuthRequest } from '../auth';
import { logger } from '../logging';
import { routes } from '../routes';
import { generateSessionToken } from '../services/session';
import { destroyUserSession, saveNewUserSession, verifyLogin } from '../services/users';

async function loginPost(req: Request, res: Response): Promise<void> {
	const { email, password } = req.body;

	if (!email) {
		res.status(400).send({ status: 'error', error: 'Provide an email' });
		return;
	}

	if (!password) {
		res.status(400).send({ status: 'error', error: 'Provide a password' });
		return;
	}

	try {
		const user = await verifyLogin(email, password);

		if (!user) {
			res.status(404).send({ status: 'error', error: 'User does not exist' });
			return;
		}

		const token = generateSessionToken();

		const userSaveResult = await saveNewUserSession(token, user);

		if (!userSaveResult) {
			logger.error(`Unknown error trying to save user '${email}' to redis store`);
			res.status(500).send({ status: 'error', error: 'Unknown error' });
			return;
		}

		logger.info(`User with email ${email} logged in`);

		res.status(200).send({ status: 'ok', token });
	} catch (err) {
		logger.error(`Error at login for '${email}': ${JSON.stringify(err)}`);
		res.status(500).send({ status: 'error', error: 'Unknown error' });
	}
}

async function logoutPost(req: AuthRequest, res: Response): Promise<void> {
	if (!req.token) {
		res.status(200).send({ status: 'ok' });
		return;
	}

	try {
		await destroyUserSession(req.token);
		res.status(200).send({ status: 'ok' });
	} catch (err) {
		logger.error(`Error occurred when logging user out: ${JSON.stringify(err)}`);
		res.status(500).send({ status: 'error', error: 'Unknown error' });
	}
}

export function addRoutes(app: Application): void {
	app.post(routes.api.account.login, loginPost);
	app.post(routes.api.account.logout, authMiddleware, logoutPost);
}
