import { Kysely, sql } from 'kysely'

export async function up(db: Kysely<any>): Promise<void> {
  await db.schema
    .createTable('currency_exchange_rates')
    .addColumn('currency_code', 'varchar(3)', (col) => col.primaryKey())
    .addColumn('rate', 'numeric(18, 8)', (col) => col.notNull())
    .execute()
}

export async function down(db: Kysely<any>): Promise<void> {
  await db.schema.dropTable('currency_exchange_rates').execute()
}

