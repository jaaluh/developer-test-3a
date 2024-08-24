import { Database } from './dbTypes' 
import { Pool } from 'pg'
import { Kysely, PostgresDialect } from 'kysely'

const dialect = new PostgresDialect({
  pool: new Pool({
    database: process.env.DB_NAME,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    host: process.env.DB_HOST,
    port: 5432,
    max: 10,
  })
})

export const db = new Kysely<Database>({
  //log: ['query', 'error'],
  dialect,
})