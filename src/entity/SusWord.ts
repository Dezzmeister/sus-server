import { Entity, PrimaryKey, Property } from '@mikro-orm/core';

@Entity({
	tableName: 'sus-word',
})
export class SusWord {
	constructor(word: string) {
		this.word = word;
	}

	@PrimaryKey()
	id!: number;

	@Property()
	word: string;
}
