import { Migration } from '@mikro-orm/migrations';

export class Migration20210918011835 extends Migration {

  async up(): Promise<void> {
    this.addSql('create table "sus-word" ("id" serial primary key, "word" varchar(255) not null);');
  }

}
