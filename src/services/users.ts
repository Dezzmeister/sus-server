import { User } from '../entity/User';
import bcrypt from 'bcryptjs';
import { getEntityManager } from './database';
import { BadPasswordError, UserDoesNotExistError, UserExistsError } from '../errors/user_errors';
import { Ok } from 'ioredis';
import { getRedis } from './redis';

const SALT_ROUNDS = 12;

/** 60 sec * 60 min * 24 hr * 4 days */
const USER_SESSION_EXPIRY_SECONDS = 60 * 60 * 24 * 4;

type UserMaybe = User | null;

export interface UserData {
	username: string;
	email: string;
	password: string;
}

export async function createUser(data: UserData): Promise<User> {
	const { username, email, password } = data;

	const salt = bcrypt.genSaltSync(SALT_ROUNDS);
	const hash = bcrypt.hashSync(password, salt);

	const user = new User(email, username, hash, []);

	const em = getEntityManager();

	// TODO: Implement email blacklist to prevent certain domains from registering
	const existingUser = await em.getRepository(User).findOne({ email });
	if (existingUser) {
		throw new UserExistsError(`An account already exists with email ${email}`);
	}

	await em.getRepository(User).persistAndFlush(user);

	const userOut = (await getUserByEmail(email)) as User;
	return userOut;
}

export async function getUserById(id: number): Promise<UserMaybe> {
	const em = getEntityManager();

	return em.findOne(User, { id });
}

export async function getUserByEmail(email: string): Promise<UserMaybe> {
	const em = getEntityManager();
	const user = await em.createQueryBuilder(User).select('*').where({ email }).getSingleResult();

	return user;
}

export async function verifyLogin(email: string, password: string): Promise<User> {
	const existingUser = await getUserByEmail(email);

	if (!existingUser) {
		// TODO: i18n
		throw new UserDoesNotExistError(`User does not exist`);
	}

	if (!bcrypt.compareSync(password, existingUser.passwordHash)) {
		// TODO: i18n
		throw new BadPasswordError(`Bad password`);
	}

	return existingUser;
}

export async function saveNewUserSession(token: string, user: User): Promise<Ok | null> {
	const redis = getRedis();
	const setResult = await redis.set(token, user.id);

	if (!setResult) {
		return null;
	}

	const expireResult = await redis.expire(token, USER_SESSION_EXPIRY_SECONDS);
	return expireResult ? 'OK' : null;
}

export async function getUserBySession(token: string): Promise<UserMaybe> {
	const redis = getRedis();
	const id = await redis.get(token);

	if (id === null) {
		return null;
	}

	return getUserById(Number.parseInt(id));
}

export async function destroyUserSession(token: string): Promise<void> {
	const redis = getRedis();

	redis.del(token);
}
