import express, { Express, Request, Response } from 'express';
import * as productApiService from './services/productApi.service';
import * as productService from './services/product.service';

export const app: Express = express();

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
  const products = await productService.getAllProducts();
  return res.json({ products })
});

