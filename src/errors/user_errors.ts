export enum UserErrorType {
	USER_EXISTS = 'user_exists',
	USER_DOES_NOT_EXIST = 'user_does_not_exist',
	BAD_PASSWORD = 'bad_password',
}

export class UserError extends Error {
	public readonly errorType: UserErrorType;

	constructor(errorType: UserErrorType) {
		super();
		this.errorType = errorType;
	}
}

export class UserExistsError extends UserError {
	constructor(message: string) {
		super(UserErrorType.USER_EXISTS);
		this.name = 'User exists'; // TODO: i18n
		this.message = message;
	}
}

export class UserDoesNotExistError extends UserError {
	constructor(message: string) {
		super(UserErrorType.USER_DOES_NOT_EXIST);
		this.name = 'User does not exist'; // TODO: i18n
		this.message = message;
	}
}

export class BadPasswordError extends UserError {
	constructor(message: string) {
		super(UserErrorType.BAD_PASSWORD);
		this.name = 'Bad password'; // TODO: i18n
		this.message = message;
	}
}
