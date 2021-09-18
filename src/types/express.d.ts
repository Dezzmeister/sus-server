import { User } from '../entity/User';

declare namespace Express {
	export interface Request {
		user?: User;
		token?: string;
	}
}
