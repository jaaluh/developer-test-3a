import { Transaction } from 'kysely';
import { Category, Database } from '../db/dbTypes';
import { Language, ProductApiCategory } from '../types';
import categoryRepository from '../db/repositories/category.repository';

const addOrUpdateCategoryTranslations = async (categoryId: number, lang: Language, name: string, trx?: Transaction<Database>) => {
  const existingTranslation = await categoryRepository.getTranslations(categoryId, lang);
  if (existingTranslation) {
    return categoryRepository.updateTranslations(categoryId, lang, name, trx);
  }
  else {
    return categoryRepository.createTranslations(categoryId, lang, name, trx);
  }
};

const updateCategoryFromProductApiCategory = async (category: Category, productApiCategory: ProductApiCategory, trx?: Transaction<Database>) => {
  const changed = productApiCategory.id !== category.uuid;
  if (!changed) {
    return category;
  }
  return categoryRepository.update(category.id, { uuid: productApiCategory.id }, trx);
};

const createCategoryFromProductApiCategory = async (productApiCategory: ProductApiCategory, trx?: Transaction<Database>) => {
  return categoryRepository.create({ name: productApiCategory.name, uuid: productApiCategory.id }, trx);
};

const createOrUpdateCategory = async (productApiCategory: ProductApiCategory, trx?: Transaction<Database>) => {
  const existigCategory = await categoryRepository.get(productApiCategory.name);
  let category: Category;
  if (existigCategory) {
    category = await updateCategoryFromProductApiCategory(existigCategory, productApiCategory, trx);
  }
  else {
    category = await createCategoryFromProductApiCategory(productApiCategory, trx);
  }

  // assume the language in the API data is English.
  const lang = Language.en;
  await addOrUpdateCategoryTranslations(category.id, lang, category.name, trx);

  return category;
};

export default {
  createOrUpdateCategory
}