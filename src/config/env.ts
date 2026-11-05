import dotenv from 'dotenv';

dotenv.config({ quiet: true });

const get = (key: string, fallback: string): string => process.env[key] ?? fallback;

/** Single typed source of truth for environment-specific values. */
export const env = {
  baseURL: get('BASE_URL', 'https://www.saucedemo.com'),
  standardUser: get('STANDARD_USER', 'standard_user'),
  lockedUser: get('LOCKED_USER', 'locked_out_user'),
  password: get('USER_PASSWORD', 'secret_sauce'),
  isCI: !!process.env.CI,
};
