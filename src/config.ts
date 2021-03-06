import dotenv from 'dotenv';
dotenv.config();

export const defaultConfig = {
	env: 'dev',
	loginProvider: 'http://localhost:3000/login',
	returnTo: 'http://localhost:4010',
	https: false,
	httpsPort: 0,
	httpsKeyDir: '',
	jwt: {
		secret: '',
		expiryTime: 0,
	},
	server: {
		hostname: 'localhost',
		port: 4000,
	},
	client: {
		key: '',
		secret: '',
	},
};

type Config = typeof defaultConfig;

function asNumber(param: string | undefined): number | undefined {
	return param as unknown as number | undefined;
}

export const config: Config = {
	env: process.env.ENV ?? defaultConfig.env,
	loginProvider: process.env.LOGIN_PROVIDER ?? defaultConfig.loginProvider,
	returnTo: process.env.RETURN_TO ?? defaultConfig.returnTo,
	https: (process.env.HTTPS === 'true' ? true : false) ?? defaultConfig.https,
	httpsPort: asNumber(process.env.HTTPS_PORT) ?? defaultConfig.httpsPort,
	httpsKeyDir: process.env.HTTPS_KEY_DIR ?? defaultConfig.httpsKeyDir,
	jwt: {
		secret: process.env.JWT_SECRET ?? defaultConfig.jwt.secret,
		expiryTime: asNumber(process.env.JWT_EXPIRY_TIME) ?? defaultConfig.jwt.expiryTime,
	},
	server: {
		hostname: process.env.HOSTNAME ?? defaultConfig.server.hostname,
		port: asNumber(process.env.PORT) ?? defaultConfig.server.port,
	},
	client: {
		key: process.env.CLIENT_KEY ?? defaultConfig.client.key,
		secret: process.env.CLIENT_SECRET ?? defaultConfig.client.secret,
	},
};
