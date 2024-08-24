import { Kysely } from 'kysely'

export async function up(db: Kysely<any>): Promise<void> {
  await db.schema
    .createTable('category_translations')
    .addColumn('name', 'varchar')
    .addColumn('category_id', 'integer', (col) => col.references('category.id').onDelete('cascade').notNull())
    .addColumn('lang', 'varchar(2)', (col) => col.notNull())
    .addPrimaryKeyConstraint('category_translations_pkey', ['category_id', 'lang'])
    .execute()
}

export async function down(db: Kysely<any>): Promise<void> {
  await db.schema.dropTable('category_translations').execute()
}
