import { Transaction } from 'kysely';
import { db } from '../db/db';
import { Database, Product } from '../db/dbTypes';
import { Language, ProductData } from '../types';
import { createOrUpdateCategory } from './category.service';
import { setProductCategories } from './productCategory.service';
import { jsonArrayFrom } from 'kysely/helpers/postgres';

export const getAllProducts = async (lang: Language) => {
  return db
    .selectFrom('product')
    .innerJoin(
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
          .select(['category.id', 'category.name', 'category.uuid'])
          .whereRef('product_category.product_id', '=', 'product.id')
      ).as('categories'),
    ])
    .execute();
};

const addOrUpdateProductTranslations = async (productId: number, lang: Language, name: string, description: string | null, trx: Transaction<Database>) => {
  const existingTranslation = await trx.selectFrom('product_translations')
    .selectAll()
    .where('product_id', '=', productId)
    .where('lang', '=', lang)
    .executeTakeFirst()

  if (existingTranslation) {
    return trx.updateTable('product_translations')
      .set({ name, description })
      .where('product_id', '=', productId)
      .where('lang', '=', lang)
      .execute()
  }
  else {
    return trx.insertInto('product_translations')
    .values({ lang, name, description, product_id: productId })
    .execute()
  }
}

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

  // assume the language in the API data is English.
  const lang = Language.en; 
  await addOrUpdateProductTranslations(product.id, lang, product.name, product.description, trx);
};

const createProductFromProductData = async (productData: ProductData, trx: Transaction<Database>) => {
  const product = await trx.insertInto('product')
    .values({
      name: productData.name,
      uuid: productData.id,
      variations: JSON.stringify(productData.variations),
      description: productData.description,
    })
    .returningAll()
    .executeTakeFirstOrThrow();

  // assume the language in the API data is English.
  const lang = Language.en;  
  await addOrUpdateProductTranslations(product.id, lang, product.name, product.description, trx);

  return product;
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
