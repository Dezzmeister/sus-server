import { ArrayType, Entity, PrimaryKey, Property } from '@mikro-orm/core';

@Entity({
	tableName: 'user',
})
export class User {
	constructor(email: string, username: string, passwordHash: string, permissions: string[] = []) {
		this.email = email;
		this.username = username;
		this.passwordHash = passwordHash;
		this.permissions = permissions;
	}

	@PrimaryKey()
	id!: number;

	@Property({ unique: true, hidden: true })
	email: string;

	@Property({ unique: false })
	username: string;

	@Property({
		name: 'password_hash',
		hidden: true,
	})
	passwordHash: string;

	@Property({
		name: 'permissions',
		hidden: true,
		customType: new ArrayType<string>(),
	})
	permissions: string[];
}
