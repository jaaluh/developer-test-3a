import { jsonArrayFrom } from 'kysely/helpers/postgres';
import { Language, ProductApiVariation } from '../../types';
import { db } from '../db';
import { Transaction } from 'kysely';
import { Database, NewProduct, ProductUpdate } from '../dbTypes';

const getAll = async (lang: Language,) => {
  return db
    .selectFrom('product')
    .leftJoin(
      'product_translations',
      (join) => join
        .onRef('product_translations.product_id', '=', 'product.id')
        .on('product_translations.lang', '=', lang)
    )
    .selectAll('product')
    // Select translated value if it exists
    .select(eb => [
      eb.fn.coalesce('product_translations.name', 'product.name').as('name'),
      eb.fn.coalesce('product_translations.description', 'product.description').as('description')
    ])
    // Include categories
    .select((eb) => [
      jsonArrayFrom(
        eb.selectFrom('product_category')
          .innerJoin('category', 'category.id', 'product_category.category_id')
          .leftJoin(
            'category_translations',
            (join) => join
              .onRef('category_translations.category_id', '=', 'category.id')
              .on('category_translations.lang', '=', lang)
          )
          .select(eb => [
            'category.id',
            'category.uuid',
            eb.fn.coalesce('category_translations.name', 'category.name').as('name'),
          ])
          .whereRef('product_category.product_id', '=', 'product.id')
      ).as('categories'),
    ]).execute();
};

const create = async (newProduct: NewProduct, trx?: Transaction<Database>) => {
  return (trx ?? db).insertInto('product')
    .values(newProduct)
    .returningAll()
    .executeTakeFirstOrThrow();
};

const update = async (productId: number, productUpdate: ProductUpdate, trx?: Transaction<Database>) => {
  return (trx ?? db).updateTable('product').set({
    ...productUpdate,
    updated_at: new Date()
  }).where('id', '=', productId).returningAll().executeTakeFirstOrThrow();
};

const getTranslations = async (productId: number, lang: Language) => {
  return db.selectFrom('product_translations')
    .selectAll()
    .where('product_id', '=', productId)
    .where('lang', '=', lang)
    .executeTakeFirst();
};

const updateTranslations = async (productId: number, lang: Language, name: string, description?: string | null, trx?: Transaction<Database>) => {
  return (trx ?? db).updateTable('product_translations')
    .set({ name, description })
    .where('product_id', '=', productId)
    .where('lang', '=', lang)
    .execute();
};

const createTranslations = async (productId: number, lang: Language, name: string, description?: string | null, trx?: Transaction<Database>) => {
  return (trx ?? db).insertInto('product_translations')
    .values({ lang, name, description, product_id: productId })
    .execute();
};

const deleteCategories = async (productId: number, categoryIds: number[], trx?: Transaction<Database>) => {
  if (categoryIds.length === 0) {
    return;
  }

  return (trx ?? db).deleteFrom('product_category')
    .where('product_id', '=', productId)
    .where('category_id', 'in', categoryIds)
    .execute();
};

const addCategories = async (productId: number, categoryIds: number[], trx?: Transaction<Database>) => {
  const categoriesToAdd = categoryIds.map(id => (
    { category_id: id, product_id: productId }
  ));
  if (categoriesToAdd.length) {
    await (trx ?? db).insertInto('product_category').values(categoriesToAdd).executeTakeFirstOrThrow();
  }
};

const getCategories = async (productId: number) => {
  return db.selectFrom('product_category')
    .selectAll()
    .where('product_id', '=', productId)
    .execute();
};

export default {
  getAll,
  create,
  update,
  getTranslations,
  createTranslations,
  updateTranslations,
  addCategories,
  deleteCategories,
  getCategories
};