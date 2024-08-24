import { Kysely } from 'kysely'

export async function up(db: Kysely<any>): Promise<void> {
  await db.schema
    .createTable('product_category')
    .addColumn('product_id', 'integer', (col) => col.references('product.id').notNull())
    .addColumn('category_id', 'integer', (col) => col.references('category.id').notNull())
    .addPrimaryKeyConstraint('primary_key', ['product_id', 'category_id'])
    .execute()
}

export async function down(db: Kysely<any>): Promise<void> {
  await db.schema.dropTable('product_category').execute()
}
