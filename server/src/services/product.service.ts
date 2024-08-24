import { Transaction } from 'kysely';
import { db } from '../db/db';
import { Database, Product } from '../db/dbTypes';
import { ProductData } from '../types';
import { createOrUpdateCategory } from './category.service';
import { setProductCategories } from './productCategory.service';
import { jsonArrayFrom } from 'kysely/helpers/postgres';

export const getAllProducts = async () => {
  return db
    .selectFrom('product')
    .selectAll('product')
    .select((eb) => [
      jsonArrayFrom(
        eb.selectFrom('product_category')
          .innerJoin('category', 'category.id', 'product_category.category_id')
          .select(['category.id', 'category.name', 'category.uuid'])
          .whereRef('product_category.product_id', '=', 'product.id')
      ).as('categories'),
    ])
    .execute();
};

const updateProductFromProductData = async (product: Product, productData: ProductData, trx: Transaction<Database>) => {
  const changed =
    product.uuid !== productData.id ||
    product.description !== productData.description ||
    JSON.stringify(product.variations) !== JSON.stringify(productData.variations);

  if (!changed) {
    return;
  }

  await trx.updateTable('product').set({
    uuid: productData.id,
    description: productData.description,
    variations: JSON.stringify(productData.variations),
    updated_at: new Date()
  }).where('id', '=', product.id).execute();

};

const createProductFromProductData = async (productData: ProductData, trx: Transaction<Database>) => {
  return trx.insertInto('product')
    .values({
      name: productData.name,
      uuid: productData.id,
      variations: JSON.stringify(productData.variations),
      description: productData.description,
    })
    .returningAll()
    .executeTakeFirstOrThrow();
};

export const createOrUpdateProduct = async (productData: ProductData) => {
  await db.transaction().execute(async (trx) => {
    let product = await trx.selectFrom('product').selectAll().where('name', '=', productData.name).executeTakeFirst();
    if (product) {
      await updateProductFromProductData(product, productData, trx);
    }
    else {
      product = await createProductFromProductData(productData, trx);
    }

    const categoryIds = [];
    if (productData.categories?.length) {
      for (const c of productData.categories) {
        const categoryId = await createOrUpdateCategory(c, trx);
        categoryIds.push(categoryId);
      }
    }
    await setProductCategories(product.id, categoryIds, trx);
  });
};
