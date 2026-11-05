import { loadConfig } from '@utils/configReader';

/** Resolved, typed configuration (JSON files + ENV selection + env-var overrides). */
export const config = loadConfig();

export const isCI = !!process.env.CI;
