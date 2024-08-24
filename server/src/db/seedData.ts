import { CurrencyCode } from '../types';
import { db } from './db';

const currencyRates: {[key: string]: number} = {
  EUR: 1,
  USD: 0.89
}

export const insertSeedData = async () => {
  for (const cc in currencyRates) {
    const currencyCode = cc as CurrencyCode;
    const rate = currencyRates[cc];
    const existing = await db.selectFrom('currency_exchange_rates')
      .where('currency_code', '=', currencyCode)
      .selectAll()
      .executeTakeFirst();

    if (existing && existing.rate !== rate) {
      await db.updateTable('currency_exchange_rates')
        .set({ rate })
        .where('currency_code', '=', currencyCode)
        .execute();
    }
    else if (!existing) {
      await db.insertInto('currency_exchange_rates')
        .values({ currency_code: currencyCode, rate})
        .executeTakeFirstOrThrow();
    }
  }
}