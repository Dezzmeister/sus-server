import { TsMorphMetadataProvider } from '@mikro-orm/reflection';

export const ormConfig = {
	metadataProvider: TsMorphMetadataProvider,
	entities: ['dist/entity/**/*.js'],
	entitiesTs: ['src/entity/**/*.ts'],
	migrations: {
		tableName: 'mikro_orm_migrations',
		path: 'src/migration',
		transational: true,
		dropTables: false,
		safe: false,
		emit: 'ts',
	},
	dbName: 'sus',
	type: 'postgresql',
	host: 'localhost',
	port: 5432,
	user: 'dev',
	password: 'dev',
};

export default ormConfig;
