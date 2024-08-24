import { Transaction } from 'kysely';
import { Database } from '../db/dbTypes';

export const deleteProductCategories = async (productId: number, categoryIds: number[], trx: Transaction<Database>) => {
  if (categoryIds.length === 0) {
    return;
  }

  return trx.deleteFrom('product_category')
    .where('product_id', '=', productId)
    .where('category_id', 'in', categoryIds)
    .execute();
};

export const addProductCategories = async (productId: number, categoryIds: number[], trx: Transaction<Database>) => {
  if (categoryIds.length === 0) {
    return;
  }
  
  for (const id of categoryIds) {
    await trx.insertInto('product_category').values({ category_id: id, product_id: productId }).executeTakeFirstOrThrow();
  }
};

export const setProductCategories = async (productId: number, categoryIds: number[], trx: Transaction<Database>) => {
  if (categoryIds.length === 0) {
    return trx.deleteFrom('product_category').where('product_id', '=', productId).execute();
  }

  const currentCategories = await trx.selectFrom('product_category')
    .select('category_id')
    .where('product_id', '=', productId)
    .execute();
  const currentCategoryIds = currentCategories.map(c => c.category_id);
  
  const categoryIdsToDelete = currentCategoryIds.filter(id => !categoryIds.includes(id));
  await deleteProductCategories(productId, categoryIdsToDelete, trx);
  
  const categoryIdsToAdd = categoryIds.filter(id => !currentCategoryIds.includes(id));
  await addProductCategories(productId, categoryIdsToAdd, trx);
}