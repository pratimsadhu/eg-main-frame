export const PLAID_CLIENT_ID = process.env.PLAID_CLIENT_ID || '';
export const PLAID_SECRET = process.env.PLAID_SECRET || '';
export const PLAID_ENV = process.env.PLAID_ENV || '';
export const PLAID_PRODUCTS = (process.env.PLAID_PRODUCTS || 'transactions').split(',');
export const PLAID_COUNTRY_CODES = (process.env.PLAID_COUNTRY_CODES || 'US').split(',');