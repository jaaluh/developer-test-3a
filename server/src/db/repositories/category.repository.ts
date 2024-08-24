import { db } from '../db';
import { Transaction } from 'kysely';
import { CategoryUpdate, Database, NewCategory } from '../dbTypes';
import { Language } from '../../types';

const get = async (name: string) => {
  return db.selectFrom('category')
    .selectAll()
    .where('name', '=', name)
    .executeTakeFirst();
}

const update = async (categoryId: number, categoryUpdate: CategoryUpdate, trx?: Transaction<Database>) => {
  return (trx ?? db).updateTable('category')
    .set({
      ...categoryUpdate,
      updated_at: new Date()
    })
    .where('id', '=', categoryId)
    .returningAll()
    .executeTakeFirstOrThrow();
};

const create = async (newCategory: NewCategory, trx?: Transaction<Database>) => {
  return (trx ?? db).insertInto('category')
  .values(newCategory)
  .returningAll()
  .executeTakeFirstOrThrow();
};

const getTranslations = async (categoryId: number, lang: Language) => {
  return db.selectFrom('category_translations')
    .selectAll()
    .where('category_id', '=', categoryId)
    .where('lang', '=', lang)
    .executeTakeFirst();
};

const updateTranslations = async (categoryId: number, lang: Language, name: string, trx?: Transaction<Database>) => {
  return (trx ?? db).updateTable('category_translations')
    .set({ name })
    .where('category_id', '=', categoryId)
    .where('lang', '=', lang)
    .executeTakeFirstOrThrow();
};

const createTranslations = async (categoryId: number, lang: Language, name: string, trx?: Transaction<Database>) => {
  return (trx ?? db).insertInto('category_translations')
  .values({ lang, name, category_id: categoryId })
  .executeTakeFirstOrThrow();
}

export default {
  create,
  update,
  get,
  updateTranslations,
  createTranslations,
  getTranslations
};