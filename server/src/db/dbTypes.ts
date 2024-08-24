import {
  ColumnType,
  Generated,
  Insertable,
  JSONColumnType,
  Selectable,
  Updateable,
} from 'kysely'

/************ Product ************/
export interface ProductTable {
  id: Generated<number>;
  name: string;
  description: string | null;
  uuid: string | null;
  variations: JSONColumnType<{
    price: number
    size: string | null
    paper_size: string | null
  }>
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

/************ Database ************/
export interface Database {
  product: ProductTable
  category: CategoryTable
  product_category: ProductCategoryTable
}
