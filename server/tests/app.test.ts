import request from 'supertest';
import { app } from '../src/app';
import { migrateToLatest } from '../src/db/migrate';
import { insertSeedData } from '../src/db/seedData';
import { db } from '../src/db/db';
import productRepository from '../src/db/repositories/product.repository';
import { Language, ProductApiResponse, ProductWithCategories } from '../src/types';
import originalProductApiData from './productApiTestData/originalData.json';
import { v4 as uuidv4 } from 'uuid';
import { Product } from '../src/db/dbTypes';

beforeAll(async () => {
  await migrateToLatest();
  await insertSeedData();
  await db.deleteFrom('product').execute();
  await db.deleteFrom('category').execute();
});

afterAll(async () => {
  await db.destroy();
});

describe('POST /api/products/import', () => {
  test('Should work with original data', async () => {
    const res = await request(app)
      .post('/api/products/import')
      .send({ testProductData: originalProductApiData });

    expect(res.body).toEqual({ success: true });

    const productsInDb = await productRepository.getAll(Language.en);
    expect(productsInDb.length).toBe(3);
    const shirt = productsInDb.find(p => p.name === 'Black DOOM® T-shirt');
    const mug = productsInDb.find(p => p.name === 'Minecraft coffee mug');
    const poster = productsInDb.find(p => p.name === 'World of Warcraft Outland map wall poster');

    expect(shirt).toEqual(expect.objectContaining({
      'name': 'Black DOOM® T-shirt',
      'description': 'Cool T-shirt with DOOM logo.',
      'uuid': '3568e30a-3cc0-44cc-9bc9-a6b27edad126',
      'variations': expect.arrayContaining([
        {
          'size': 'S',
          'price': 25
        },
        {
          'size': 'M',
          'price': 25
        },
        {
          'size': 'L',
          'price': 25
        }
      ]),
      'categories': expect.arrayContaining([
        expect.objectContaining({
          'uuid': 'ced9a008-6dda-412b-8b79-4cd2274a0566',
          'name': 'Gaming apparel'
        })
      ])
    }));

    expect(mug).toEqual(expect.objectContaining({
      'name': 'Minecraft coffee mug',
      'description': 'Green coffee mug with Minecraft logo.',
      'uuid': 'a2d6471b-ceeb-4c3f-a1ec-70a603fdcc70',
      'variations': expect.arrayContaining([
        {
          'price': 14.9
        }
      ]),
      'categories': expect.arrayContaining([
        expect.objectContaining({
          'uuid': '3cdff117-c0af-435e-866b-5ddcd9aa4427',
          'name': 'Coffee mugs'
        }),
        expect.objectContaining({
          'uuid': 'e57eb5de-a24f-440c-b771-22cbb388cc18',
          'name': 'Minecraft'
        })
      ])
    }));

    expect(poster).toEqual(expect.objectContaining({
      'name': 'World of Warcraft Outland map wall poster',
      'description': 'A high quality map of the Outlands from World of Warcraft The Burning Crusade expansion. An excellent gift for someone who is a fan of World of Warcraft and The Burning Crusade expansion specifically.',
      'uuid': '8a3a38c0-f3c1-472d-bb06-b5e09f25f45d',
      'variations': expect.arrayContaining([
        {
          'paper size': 'A1',
          'price': 19.9
        },
        {
          'paper size': 'A2',
          'price': 16.9
        }
      ]),
      'categories': expect.arrayContaining([
        expect.objectContaining({
          'uuid': 'b7cc56ff-97fe-4d08-8076-e54ae2d1b3c2',
          'name': 'Posters'
        })
      ])
    }));
  });

  test('should update product, categories and translations', async () => {
    const productUuid = uuidv4();
    const categoryUuid = uuidv4();
    const testData: ProductApiResponse = {
      products: [
        {
          'name': 'Black DOOM® T-shirt',
          'description': 'updated desc',
          'id': productUuid,
          'variations': [
            {
              'size': 'XL',
              'price': 40
            },
            {
              'size': 'XXL',
              'price': 45
            },
            {
              'size': 'XXXL',
              'price': 50
            }
          ],
          'categories': [
            {
              'id': categoryUuid,
              'name': 'Gaming apparel'
            }
          ]
        }
      ],
      results: 1
    };
    const res = await request(app)
      .post('/api/products/import')
      .send({ testProductData: testData });

    expect(res.body).toEqual({ success: true });
    const productsInDb = await productRepository.getAll(Language.en);
    const shirt = productsInDb.find(p => p.name === 'Black DOOM® T-shirt');
    expect(shirt).toEqual(expect.objectContaining({
      'name': 'Black DOOM® T-shirt',
      'description': 'updated desc',
      'uuid': productUuid,
      'variations': expect.arrayContaining([
        {
          'size': 'XL',
          'price': 40
        },
        {
          'size': 'XXL',
          'price': 45
        },
        {
          'size': 'XXXL',
          'price': 50
        }
      ]),
      'categories': expect.arrayContaining([
        expect.objectContaining({
          'uuid': categoryUuid,
          'name': 'Gaming apparel'
        })
      ])
    }));

    const shirtTranslation = await db.selectFrom('product_translations')
      .selectAll()
      .where('product_id', '=', shirt!.id)
      .where('lang', '=', Language.en)
      .executeTakeFirstOrThrow();

    expect(shirtTranslation).toEqual(expect.objectContaining({
      name: 'Black DOOM® T-shirt',
      description: 'updated desc',
      lang: 'en'
    }));

    const gamingApparelTranslation = await db.selectFrom('category_translations')
      .selectAll()
      .where('category_id', '=', shirt!.categories[0].id)
      .where('lang', '=', Language.en)
      .executeTakeFirstOrThrow();

    expect(gamingApparelTranslation).toEqual(expect.objectContaining({
      name: 'Gaming apparel',
      lang: 'en'
    }));
  });
});

describe('GET /api/products', () => {
  test('should return products in EUR currency', async () => {
    const res = await request(app)
      .get(`/api/products?currencyCode=EUR`)
      .expect(200)
      .expect('Content-Type', /json/);

    const poster = (res.body as ProductApiResponse).products.find(p => p.name.includes('poster'));
    const A1 = poster?.variations.find(v => v['paper size'] === 'A1');
    const A2 = poster?.variations.find(v => v['paper size'] === 'A2');
    expect(A1?.price).toBe(19.9);
    expect(A2?.price).toBe(16.9);
  });

  test('should return products in USD currency', async () => {
    const res = await request(app)
      .get(`/api/products?currencyCode=USD`)
      .expect(200)
      .expect('Content-Type', /json/);

    const poster = (res.body as ProductApiResponse).products.find(p => p.name.includes('poster'));
    const A1 = poster?.variations.find(v => v['paper size'] === 'A1');
    const A2 = poster?.variations.find(v => v['paper size'] === 'A2');
    expect(A1?.price).toBe(22.29);
    expect(A2?.price).toBe(18.93);
  });

  test('should return products in fi language', async () => {
    const productsInDb = await productRepository.getAll(Language.en);
    const poster = productsInDb.find(p => p.name.includes('poster'))!;
    await db.insertInto('product_translations')
      .values({ lang: Language.fi, name: 'Wowi juliste', description: 'Hieno wowi juliste', product_id: poster.id })
      .execute();

    const res = await request(app)
      .get(`/api/products?lang=fi`)
      .expect(200)
      .expect('Content-Type', /json/);

    const posterFi = (res.body.products as Product[]).find(p => p.name.includes('Wowi'))!;
    expect(posterFi.name).toBe('Wowi juliste');
    expect(posterFi.description).toBe('Hieno wowi juliste');
  });

  test('should return products in en language', async () => {
    const res = await request(app)
      .get(`/api/products?lang=en`)
      .expect(200)
      .expect('Content-Type', /json/);

    const poster = (res.body.products as Product[]).find(p => p.name.includes('poster'));
    expect(poster?.name).toBe('World of Warcraft Outland map wall poster');
  });

  test('should return product category in fi language', async () => {
    const productsInDb = await productRepository.getAll(Language.en);
    const poster = productsInDb.find(p => p.name.includes('poster'))!;
    await db.insertInto('category_translations')
      .values({ lang: Language.fi, name: 'Julisteet', category_id: poster.categories[0].id })
      .execute();

    const res = await request(app)
      .get(`/api/products?lang=fi`)
      .expect(200)
      .expect('Content-Type', /json/);

    const posterFi = (res.body.products as ProductWithCategories[]).find(p => p.name.includes('Wowi'))!;
    expect(posterFi.categories[0].name).toBe('Julisteet');
  });

  test('should return product category in en language', async () => {
    const res = await request(app)
      .get(`/api/products?lang=en`)
      .expect(200)
      .expect('Content-Type', /json/);

      const poster = (res.body.products as ProductWithCategories[]).find(p => p.name.includes('poster'))!;
      expect(poster.categories[0].name).toBe('Posters');
  });
});