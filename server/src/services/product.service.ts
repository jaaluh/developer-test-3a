import { Transaction } from 'kysely';
import { db } from '../db/db';
import { Database, NewProduct, Product, ProductUpdate } from '../db/dbTypes';
import { CurrencyCode, Language, ProductData } from '../types';
import productRepository from '../db/repositories/product.repository';
import currencyRepository from '../db/repositories/currency.repository';
import categoryService from './category.service';

const setVariationCurrencyFromExchangeRate = async (variations: Product['variations'], currencyCode: CurrencyCode) => {
  const variationsWithPrice = variations.filter(v => v.price);
  if (variationsWithPrice.length === 0) {
    return;
  }
  const exchangeRate = await currencyRepository.get(currencyCode);
  for (const v of variationsWithPrice) {
    v.price = Number((v.price * exchangeRate).toFixed(2));
  }
};

const getAllProducts = async (lang: Language, currencyCode: CurrencyCode) => {
  const products = await productRepository.getAll(lang);
  for (const p of products) {
    await setVariationCurrencyFromExchangeRate(p.variations, currencyCode);
  }

  return products;
};

const addOrUpdateProductTranslations = async (productId: number, lang: Language, name: string, description?: string|null, trx?: Transaction<Database>) => {
  const existingTranslation = await productRepository.getTranslations(productId, lang);
  if (existingTranslation) {
    return productRepository.updateTranslations(productId, lang, name, description, trx);
  }
  else {
    return productRepository.createTranslations(productId, lang, name, description, trx);
  }
};

const updateProductFromProductData = async (product: Product, productData: ProductData, trx?: Transaction<Database>) => {
  const changed =
    product.uuid !== productData.id ||
    product.description !== productData.description ||
    JSON.stringify(product.variations) !== JSON.stringify(productData.variations);

  if (!changed) {
    return;
  }

  const productUpdate: ProductUpdate = {
    variations: JSON.stringify(productData.variations),
    uuid: productData.id,
    description: productData.description,
  }
  return productRepository.update(product.id, productUpdate, trx);
};

const createProductFromProductData = async (productData: ProductData, trx?: Transaction<Database>) => {
  const newProduct: NewProduct = {
    name: productData.name,
    variations: JSON.stringify(productData.variations),
    description: productData.description,
    uuid: productData.id
  }

  return productRepository.create(newProduct, trx);
};

const setProductCategories = async (productId: number, categoryIds: number[], trx?: Transaction<Database>) => {
  const currentCategories = await productRepository.getCategories(productId);
  const currentCategoryIds = currentCategories.map(c => c.category_id);

  const categoryIdsToDelete = currentCategoryIds.filter(id => !categoryIds.includes(id));
  await productRepository.deleteCategories(productId, categoryIdsToDelete, trx);

  const categoryIdsToAdd = categoryIds.filter(id => !currentCategoryIds.includes(id));
  await productRepository.addCategories(productId, categoryIdsToAdd, trx);
};

const createOrUpdateProduct = async (productData: ProductData) => {
  await db.transaction().execute(async (trx) => {
    let product = await productRepository.get(productData.name);
    if (product) {
      await updateProductFromProductData(product, productData, trx);
    }
    else {
      product = await createProductFromProductData(productData, trx);
    }

    // Assume the language in the API data is English.
    // Not strictly necessary to add translation for the original language, but won't hurt either
    const lang = Language.en;
    await addOrUpdateProductTranslations(product.id, lang, productData.name, productData.description, trx);

    const categoryIds = [];
    if (productData.categories?.length) {
      for (const c of productData.categories) {
        const category = await categoryService.createOrUpdateCategory(c, trx);
        categoryIds.push(category.id);
      }
    }
    await setProductCategories(product.id, categoryIds, trx);
  });
};

export default {
  createOrUpdateProduct,
  getAllProducts
}
