import crypto from 'crypto';

const SESSION_TOKEN_BYTES = 32;

export function generateSessionToken(): string {
	const b64Token = crypto.randomBytes(SESSION_TOKEN_BYTES).toString('base64');

	return base64Url(b64Token);
}

export function base64Url(base64Str: string): string {
	return base64Str.replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '!');
}
