import { Application } from 'express';
import * as sus from './handlers/sus';
import * as login from './handlers/login';

export function addRoutes(app: Application) {
	sus.addRoutes(app);
	login.addRoutes(app);
}
