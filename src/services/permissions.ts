/**
 * User permissions framework. Permissions are organized in a hierarchy;
 * so that a user with a permission higher up in the hierarchy (such as 'user.*')
 * has every permission starting with 'user.'.
 */
import { User } from '../entity/User';

export const permissions = {
	all: '*',
	admin: {
		all: '*',
	},
	user: {
		all: 'user.*',
		upload: 'user.upload',
		comment: 'user.comment',
	},
};

const permissionsFlatMap: string[] = buildPermissionsFlatMap(permissions);

type RootHierarchy = { [key: string]: unknown };
type Hierarchy = { [key: string]: Hierarchy } | unknown;

function buildPermissionsFlatMap(obj: Hierarchy): string[] {
	let perms: string[] = [];

	for (const val of Object.values(obj as RootHierarchy)) {
		if (typeof val === 'string') {
			perms.push(val);
		} else {
			perms = perms.concat(buildPermissionsFlatMap(val));
		}
	}

	return perms;
}

function getStringSubPermission(obj: Hierarchy): string | undefined {
	for (const val of Object.values(obj as RootHierarchy)) {
		if (typeof val === 'string') {
			return val;
		}

		const subPerm = getStringSubPermission(val);
		if (subPerm) {
			return subPerm;
		}
	}

	return undefined;
}

export function hasAnyPermission(user: User, obj: Hierarchy): boolean {
	if (user.permissions.includes(permissions.all)) {
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
	if (user.permissions.includes(permissions.all)) {
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

	for (const val of Object.values(permissions)) {
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
