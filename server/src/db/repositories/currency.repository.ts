import { db } from '../db';
import { CurrencyCode } from '../../types';

const get = async (currencyCode: CurrencyCode) => {
  const exchangeRate = await db.selectFrom('currency_exchange_rates')
    .where('currency_code', '=', currencyCode)
    .select('rate')
    .executeTakeFirstOrThrow();

  return exchangeRate.rate;
}

export default {
  get
}