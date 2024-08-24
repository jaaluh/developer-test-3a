import { Kysely } from 'kysely'

export async function up(db: Kysely<any>): Promise<void> {
  await db.schema
    .createTable('product_translations')
    .addColumn('name', 'varchar')
    .addColumn('description', 'text')
    .addColumn('product_id', 'integer', (col) => col.references('product.id').onDelete('cascade').notNull())
    .addColumn('lang', 'varchar(2)', (col) => col.notNull())
    .addPrimaryKeyConstraint('product_translations_pkey', ['product_id', 'lang'])
    .execute()
}

export async function down(db: Kysely<any>): Promise<void> {
  await db.schema.dropTable('product_translations').execute()
}
