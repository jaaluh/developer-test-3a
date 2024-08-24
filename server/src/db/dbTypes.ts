import {
  ColumnType,
  Generated,
  Insertable,
  JSONColumnType,
  Selectable,
  Updateable,
} from 'kysely'
import { CurrencyCode, Language } from '../types';

/************ Product ************/
export interface ProductTable {
  id: Generated<number>;
  name: string;
  description: string | null;
  uuid: string | null;
  variations: JSONColumnType<{
    price: number
    size: string | null
    'paper size': string | null
  }[]>
  created_at: ColumnType<Date, string | undefined, never>
  updated_at: ColumnType<Date, string | undefined, Date>
}

export type Product = Selectable<ProductTable>
export type NewProduct = Insertable<ProductTable>
export type ProductUpdate = Updateable<ProductTable>

/************ Category ************/
export interface CategoryTable {
  id: Generated<number>
  name: string
  uuid: string | null;
  created_at: ColumnType<Date, string | undefined, never>
  updated_at: ColumnType<Date, string | undefined, Date>
}

export type Category = Selectable<CategoryTable>
export type NewCategory = Insertable<CategoryTable>
export type CategoryUpdate = Updateable<CategoryTable>

/************ ProductCategory ************/
export interface ProductCategoryTable {
  product_id: number;
  category_id: number;
}

export type ProductCategory = Selectable<ProductCategoryTable>
export type NewProductCategory = Insertable<ProductCategoryTable>
export type ProductCategoryUpdate = Updateable<ProductCategoryTable>

/************ ProductTranslations ************/
export interface ProductTranslationsTable {
  product_id: number;
  name: string;
  description: string | null;
  lang: Language
}

export type ProductTranslations = Selectable<ProductTranslationsTable>
export type NewProductTranslations = Insertable<ProductTranslationsTable>
export type ProductTranslationsUpdate = Updateable<ProductTranslationsTable>

/************ CategoryTranslations ************/
export interface CategoryTranslationsTable {
  category_id: number;
  name: string;
  lang: Language
}

export type CategoryTranslations = Selectable<CategoryTranslationsTable>
export type NewCategoryTranslations = Insertable<CategoryTranslationsTable>
export type CategoryTranslationsUpdate = Updateable<CategoryTranslationsTable>

/************ CurrencyExchangeRate ************/
export interface CurrencyExchangeRatesTable {
  currency_code: CurrencyCode;
  rate: number;
}

export type CurrencyExchangeRate = Selectable<CurrencyExchangeRatesTable>
export type NewCurrencyExchangeRate = Insertable<CurrencyExchangeRatesTable>
export type CurrencyExchangeRateUpdate = Updateable<CurrencyExchangeRatesTable>


/************ Database ************/
export interface Database {
  product: ProductTable
  category: CategoryTable
  product_category: ProductCategoryTable
  product_translations: ProductTranslationsTable
  category_translations: CategoryTranslationsTable
  currency_exchange_rates: CurrencyExchangeRatesTable
}
