import { db } from '../db/db';
import { CurrencyCode } from '../types';

export const getExchangeRate = async (currencyCode: CurrencyCode) => {
  const exchangeRate = await db.selectFrom('currency_exchange_rates')
    .where('currency_code', '=', currencyCode)
    .select('rate')
    .executeTakeFirstOrThrow();

  return exchangeRate.rate;
}