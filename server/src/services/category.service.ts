import { Transaction } from 'kysely';
import { Category, Database } from '../db/dbTypes';
import { Language, ProductApiCategory } from '../types';

const addOrUpdateCategoryTranslations = async (categoryId: number, lang: Language, name: string, trx: Transaction<Database>) => {
  const existingTranslation = await trx.selectFrom('category_translations')
    .selectAll()
    .where('category_id', '=', categoryId)
    .where('lang', '=', lang)
    .executeTakeFirst()

  if (existingTranslation) {
    return trx.updateTable('category_translations')
      .set({ name })
      .where('category_id', '=', categoryId)
      .where('lang', '=', lang)
      .execute()
  }
  else {
    return trx.insertInto('category_translations')
    .values({ lang, name, category_id: categoryId })
    .execute()
  }
}


export const updateCategoryFromProductApiCategory = async (category: Category, productApiCategory: ProductApiCategory, trx: Transaction<Database>) => {
  const changed = productApiCategory.id !== category.uuid;
  if (!changed) {
    return;
  }
  await trx.updateTable('category').set({ 
    uuid: productApiCategory.id,
    updated_at: new Date()
  }).where('id', '=', category.id).execute();

  // assume the language in the API data is English.
  const lang = Language.en; 
  await addOrUpdateCategoryTranslations(category.id, lang, category.name, trx);
};

export const createCategoryFromProductApiCategory = async (productApiCategory: ProductApiCategory, trx: Transaction<Database>) => {
  const category = await trx.insertInto('category')
    .values({
      name: productApiCategory.name,
      uuid: productApiCategory.id
    })
    .returningAll()
    .executeTakeFirstOrThrow();

  // assume the language in the API data is English.
  const lang = Language.en; 
  await addOrUpdateCategoryTranslations(category.id, lang, category.name, trx);

  return category;
};

export const createOrUpdateCategory = async (productApiCategory: ProductApiCategory, trx: Transaction<Database>) => {
  const category = await trx.selectFrom('category').selectAll().where('name', '=', productApiCategory.name).executeTakeFirst();
  if (category) {
    await updateCategoryFromProductApiCategory(category, productApiCategory, trx);
    return category.id;
  }
  else {
    const createdCategory = await createCategoryFromProductApiCategory(productApiCategory, trx);
    return createdCategory.id;
  }
};

