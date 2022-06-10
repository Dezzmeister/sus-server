import { Application } from 'express';
import * as sus from './handlers/sus';
import * as main from './handlers/main';

export function addRoutes(app: Application): void {
	sus.addRoutes(app);
	main.addRoutes(app);
}
