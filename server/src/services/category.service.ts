import { Transaction } from 'kysely';
import { Category, Database } from '../db/dbTypes';
import { ProductApiCategory } from '../types';

export const updateCategoryFromProductApiCategory = async (category: Category, productApiCategory: ProductApiCategory, trx: Transaction<Database>) => {
  const changed = productApiCategory.id !== category.uuid;
  if (!changed) {
    return;
  }
  await trx.updateTable('category').set({ 
    uuid: productApiCategory.id,
    updated_at: new Date()
  }).where('id', '=', category.id).execute();
};

export const createCategoryFromProductApiCategory = async (productApiCategory: ProductApiCategory, trx: Transaction<Database>) => {
  return trx.insertInto('category')
    .values({
      name: productApiCategory.name,
      uuid: productApiCategory.id
    })
    .returningAll()
    .executeTakeFirstOrThrow();
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

