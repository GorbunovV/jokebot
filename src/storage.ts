import { existsSync, mkdirSync, readFileSync, renameSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import type { SentIdsFile } from './types.js';

function readFile(fullPath: string): SentIdsFile {
  const raw = readFileSync(fullPath, 'utf8');
  const parsed: unknown = JSON.parse(raw);
  if (
    !parsed ||
    typeof parsed !== 'object' ||
    !Array.isArray((parsed as { ids?: unknown }).ids) ||
    !(parsed as { ids: unknown[] }).ids.every((x) => typeof x === 'number')
  ) {
    throw new Error(`Invalid storage file format at ${fullPath}: expected { ids: number[] }`);
  }
  return parsed as SentIdsFile;
}

export function loadSentIds(storagePath: string): Set<number> {
  const full = resolve(storagePath);
  if (!existsSync(full)) {
    mkdirSync(dirname(full), { recursive: true });
    writeFileSync(full, JSON.stringify({ ids: [] }, null, 2), 'utf8');
    return new Set();
  }
  return new Set(readFile(full).ids);
}

export function saveSentId(storagePath: string, id: number): void {
  const full = resolve(storagePath);
  const current: SentIdsFile = existsSync(full) ? readFile(full) : { ids: [] };
  if (!current.ids.includes(id)) {
    current.ids.push(id);
  }
  const tmp = `${full}.tmp`;
  writeFileSync(tmp, JSON.stringify(current, null, 2), 'utf8');
  renameSync(tmp, full);
}
