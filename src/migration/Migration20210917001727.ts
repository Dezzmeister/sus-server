import { Migration } from '@mikro-orm/migrations';

export class Migration20210917001727 extends Migration {

  async up(): Promise<void> {
    this.addSql('create table "user" ("id" serial primary key, "email" varchar(255) not null, "username" varchar(255) not null, "password_hash" varchar(255) not null, "permissions" text[] not null);');
    this.addSql('alter table "user" add constraint "user_email_unique" unique ("email");');

    this.addSql('create table "sus-url" ("id" varchar(255) not null, "original_url" varchar(255) not null);');
    this.addSql('alter table "sus-url" add constraint "sus-url_pkey" primary key ("id");');
  }

}
