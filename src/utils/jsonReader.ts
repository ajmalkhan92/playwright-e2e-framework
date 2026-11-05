import fs from 'node:fs';
import path from 'node:path';

const ROOT = path.resolve(__dirname, '../..');
const cache = new Map<string, unknown>();

/** Reads and parses a JSON file relative to the project root. Results are cached; callers get a fresh clone. */
export function readJson<T>(relativePath: string): T {
  const abs = path.resolve(ROOT, relativePath);
  if (!cache.has(abs)) {
    let raw: string;
    try {
      raw = fs.readFileSync(abs, 'utf8');
    } catch (e) {
      throw new Error(`JSON file not found or unreadable: ${abs}`, { cause: e });
    }
    try {
      cache.set(abs, JSON.parse(raw));
    } catch (e) {
      throw new Error(`Invalid JSON in ${abs}`, { cause: e });
    }
  }
  return structuredClone(cache.get(abs)) as T;
}

export function jsonExists(relativePath: string): boolean {
  return fs.existsSync(path.resolve(ROOT, relativePath));
}
