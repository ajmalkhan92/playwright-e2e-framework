import dotenv from 'dotenv';
import { jsonExists, readJson } from './jsonReader';

dotenv.config({ quiet: true });

export interface AppConfig {
  baseURL: string;
  users: {
    standard: { username: string; password: string };
    locked: { username: string; password: string };
  };
}

type DeepPartial<T> = { [K in keyof T]?: T[K] extends object ? DeepPartial<T[K]> : T[K] };

function merge<T extends object>(base: T, over: DeepPartial<T>): T {
  const out = { ...base } as Record<string, unknown>;
  for (const [k, v] of Object.entries(over)) {
    if (v === undefined) continue;
    const b = out[k];
    out[k] = v && typeof v === 'object' && b && typeof b === 'object' ? merge(b as object, v as object) : v;
  }
  return out as T;
}

/**
 * Precedence (low -> high): config/default.json, config/<ENV>.json, environment variables.
 * Select an environment with ENV=staging (defaults to "default" only).
 */
export function loadConfig(): AppConfig {
  let cfg = readJson<AppConfig>('config/default.json');

  const envName = process.env.ENV;
  if (envName) {
    const file = `config/${envName}.json`;
    if (!jsonExists(file)) throw new Error(`ENV="${envName}" but ${file} does not exist`);
    cfg = merge(cfg, readJson<DeepPartial<AppConfig>>(file));
  }

  const e = process.env;
  return merge(cfg, {
    baseURL: e.BASE_URL,
    users: {
      standard: { username: e.STANDARD_USER, password: e.USER_PASSWORD },
      locked: { username: e.LOCKED_USER, password: e.USER_PASSWORD },
    },
  });
}
