/**
 * Methods and data structures from the obama69 codebase.
 * TODO: There's a lot of duplication here; this could be put into a separate module.
 */
import { config } from './config';
import { NextFunction, Request, Response } from 'express';
import crypto from 'crypto';

export type User = {
	id: number;
	username: string;
	permissions: string[];
};

export type ClientRequest = Request & {
	key?: string;
	secret?: string;
};

export const PERMISSIONS = {
	all: '*',
	susServer: {
		all: 'sus.*',
		create: {
			all: 'sus.create.*',
			url: 'sus.create.url',
		},
	},
};

const permissionsFlatMap: string[] = buildPermissionsFlatMap(PERMISSIONS);

function buildPermissionsFlatMap(obj: Object): string[] {
	let perms: string[] = [];

	for (const val of Object.values(obj)) {
		if (typeof val === 'string') {
			perms.push(val);
		} else {
			perms = perms.concat(buildPermissionsFlatMap(val));
		}
	}

	return perms;
}

function getStringSubPermission(obj: Object): string | undefined {
	for (const val of Object.values(obj)) {
		if (typeof val === 'string') {
			return val;
		}

		const subPerm = getStringSubPermission(val);
		if (subPerm) {
			return subPerm;
		}
	}
}

export function hasAnyPermission(user: User, obj: Object): boolean {
	if (user.permissions.includes(PERMISSIONS.all)) {
		return true;
	}

	const firstPerm = getStringSubPermission(obj);
	if (!firstPerm) {
		return false;
	}

	const rootNode = firstPerm.substring(0, firstPerm.lastIndexOf('.'));
	return user.permissions.filter((s) => s.startsWith(rootNode)).length !== 0;
}

export function hasPermission(user: User, permission: string): boolean {
	if (user.permissions.includes(PERMISSIONS.all)) {
		return true;
	}

	if (user.permissions.includes(permission)) {
		return true;
	}

	if (permission.endsWith('*')) {
		return hasAllSubPermissions(user, permission);
	}

	const rootNode = permission.substring(0, permission.lastIndexOf('.'));
	const permNode = permission.substring(permission.lastIndexOf('.') + 1);

	const userPerms = user.permissions.filter((p) => p.startsWith(rootNode));

	for (const userPerm of userPerms) {
		if (userPerm.endsWith('*') || userPerm.endsWith(permNode)) {
			return true;
		}
	}

	return false;
}

function hasAllSubPermissions(user: User, permission: string): boolean {
	const rootNode = permission.substring(0, permission.lastIndexOf('.'));
	const requiredPerms = permissionsFlatMap.filter((s) => s.startsWith(rootNode) && s !== permission);

	for (const val of Object.values(PERMISSIONS)) {
		if (typeof val === 'string' && val.startsWith(rootNode) && val !== permission) {
			requiredPerms.push();
		}
	}

	for (const perm of requiredPerms) {
		if (!hasPermission(user, perm as string)) {
			return false;
		}
	}

	return true;
}

export function clientMiddleware(req: Request, res: Response, next: NextFunction): void {
	const { key, secret } = req.body;

	if (!key || !secret) {
		res.status(400).send({ error: 'missing key or secret' });
		return;
	}

	if (key.length !== config.client.key.length || secret.length !== config.client.secret.length) {
		res.status(401).send({ error: 'bad credentials' });
		return;
	}

	if (
		!crypto.timingSafeEqual(Buffer.from(key), Buffer.from(config.client.key)) ||
		!crypto.timingSafeEqual(Buffer.from(secret), Buffer.from(config.client.secret))
	) {
		res.status(401).send({ error: 'bad credentials' });
		return;
	}

	next();
}
