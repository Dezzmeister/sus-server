import { Migration } from '@mikro-orm/migrations';

export class Migration20210917001727 extends Migration {
	async up(): Promise<void> {
		this.addSql('create table "sus-url" ("id" varchar(255) not null, "original_url" varchar(255) not null);');
		this.addSql('alter table "sus-url" add constraint "sus-url_pkey" primary key ("id");');

		this.addSql('create table "sus-word" ("id" serial primary key, "word" varchar(255) not null);');
	}

	async down(): Promise<void> {
		this.addSql('drop table "sus-word";');
		this.addSql('drop table "sus-url";');
	}
}
