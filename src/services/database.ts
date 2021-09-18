import { MikroORM, Configuration, Options } from '@mikro-orm/core';
import { EntityManager, PostgreSqlDriver } from '@mikro-orm/postgresql';
import { ormConfig } from '../mikro-orm.config';

let orm: MikroORM<PostgreSqlDriver>;

export async function initDatabase(): Promise<void> {
	orm = await MikroORM.init(ormConfig as Options<PostgreSqlDriver> | Configuration<PostgreSqlDriver>);
}

export function getEntityManager(): EntityManager {
	return orm.em;
}
