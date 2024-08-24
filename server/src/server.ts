import express, { Express, Request, Response } from 'express';
import { CurrencyCode, Language } from './types';
import { isEnum } from './utility';
import productService from './services/product.service';
import productApiService from './services/productApi.service';
import { db } from './db/db';
export const app: Express = express();

app.delete('/api/products/reset', async (req: Request, res: Response) => {
  await db.deleteFrom('product').execute();
  await db.deleteFrom('category').execute();
  res.json({success: true});
})

app.post('/api/products/import', async (req: Request, res: Response) => {
  const productData = await productApiService.getProducts();
  if (!productData) {
    return res.status(500).json({ error: 'could not fetch product data' });
  }

  for (const p of productData.products) {
    try {
      await productService.createOrUpdateProduct(p);
    }
    catch (err) {
      console.log(`Error inserting product data to db:`, err);
      // Handle failed imports in some way
    }
  }
  res.json({success: true});
})

app.get('/api/products', async (req: Request, res: Response) => {
  const lang = isEnum(req.query.lang, Language) ? req.query.lang : Language.en;
  const currencyCode = isEnum(req.query.currencyCode, CurrencyCode) ? req.query.currencyCode : CurrencyCode.EUR;

  const products = await productService.getAllProducts(lang, currencyCode);
  return res.json({ products })
});

