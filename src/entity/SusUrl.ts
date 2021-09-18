import { Entity, PrimaryKey, Property } from '@mikro-orm/core';

@Entity({
	tableName: 'sus-url',
})
export class SusUrl {
	constructor(id: string, originalUrl: string) {
		this.id = id;
		this.originalUrl = originalUrl;
	}

	@PrimaryKey()
	id: string;

	@Property()
	originalUrl: string;
}
