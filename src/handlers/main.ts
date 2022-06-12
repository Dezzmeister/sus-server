import { Application, Request, Response } from 'express';
import { AuthRequest, jwtCookieKey, jwtMiddleware } from '../auth';
import { hasPermission, PERMISSIONS, User } from '../client';
import { config } from '../config';
import { SusUrl } from '../entity/SusUrl';
import { logger } from '../logging';
import { routes } from '../routes';
import { getEntityManager } from '../services/database';
import { generateUniqueSusId, withDomain } from '../services/sus-url';

async function mainPageGet(req: AuthRequest, res: Response): Promise<void> {
	if (!req.user && !req.query['token']) {
		res.redirect(`${config.loginProvider}?return_to=${config.returnTo}`);
		return;
	}

	if (!hasPermission(req.user as User, PERMISSIONS.susServer.create.url)) {
		res.render('bad_permissions', {
			error: 'u dont have permishin',
			logout: routes.logout,
		});
		return;
	}

	res.render('home', {
		url: '',
		susLevel: 5,
		title: 'sus linkz',
		susLink: '',
		error: '',
		logout: routes.logout,
	});
}

async function mainPagePost(req: AuthRequest, res: Response): Promise<void> {
	if (!req.user) {
		res.redirect(routes.login);
		return;
	}

	const { url, susLevel } = req.body;

	if (!url) {
		res.render('home', {
			url: '',
			susLevel,
			title: 'sus linkz',
			susLink: '',
			error: 'Missing URL',
			logout: routes.logout,
		});
		return;
	}

	if (!susLevel) {
		res.render('home', {
			url,
			title: 'sus linkz',
			susLink: '',
			error: 'Missing sussiness',
			logout: routes.logout,
		});
		return;
	}

	const susId = await generateUniqueSusId(susLevel);

	if (!susId) {
		res.render('home', {
			url,
			susLevel,
			title: 'sus linkz',
			susLink: '',
			error: 'something went wrong :(',
			logout: routes.logout,
		});
		return;
	}

	const susUrl = new SusUrl(susId, url);
	const em = getEntityManager();

	await em
		.persistAndFlush(susUrl)
		.then(() => {
			const susLink = withDomain(susId);
			logger.info(`Created sus URL: ${susLink} pointing to ${url}`);

			res.render('home', {
				url,
				susLevel,
				title: 'sus linkz',
				susLink,
				error: '',
				logout: routes.logout,
			});
		})
		.catch((err) => {
			res.render('home', {
				url,
				susLevel,
				title: 'sus linkz',
				susLink: '',
				error: err,
				logout: routes.logout,
			});
		});
}

async function logoutGet(req: Request, res: Response): Promise<void> {
	res.clearCookie(jwtCookieKey);
	res.redirect(routes.login);
}

export function addRoutes(app: Application): void {
	app.get(routes.home, jwtMiddleware, mainPageGet);
	app.post(routes.home, jwtMiddleware, mainPagePost);
	app.get(routes.logout, logoutGet);
}
