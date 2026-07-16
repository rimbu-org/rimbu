import { readdirSync, readFileSync, existsSync, statSync, writeFileSync } from 'node:fs';
import { join, resolve } from 'node:path';

const ROOT = resolve(import.meta.dirname, '..');
const PACKAGES_DIR = join(ROOT, 'packages');

// Dependency order: foundations first, leaf packages later.
const ORDER = [
  'base',
  'common',
  'collection-types',
  'stream',
  'hashed',
  'sorted',
  'ordered',
  'list',
  'multimap',
  'multiset',
  'bimap',
  'bimultimap',
  'graph',
  'table',
  'proximity',
  'deep',
  'channel',
  'task',
  'actor',
  'reactor',
  'spy',
  'typical',
  'core',
];

function collectDts(dir: string, files: string[] = []): string[] {
  if (!existsSync(dir)) return files;
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) {
      // skip internal/advanced tiers — public API only
      if (entry === 'internal' || entry === 'advanced') continue;
      collectDts(full, files);
    } else if (entry.endsWith('.d.ts')) {
      files.push(full);
    }
  }
  return files;
}

function packageDtsFiles(pkg: string): string[] {
  const dist = join(PACKAGES_DIR, pkg, 'dist');
  if (!existsSync(dist)) return [];
  const files: string[] = [];
  // root entry .d.ts (e.g. hashed.d.ts, or esm/index.d.ts for non-canonical layouts)
  for (const entry of readdirSync(dist)) {
    if (entry.endsWith('.d.ts') && !entry.includes('.d.ts.map')) {
      const full = join(dist, entry);
      if (statSync(full).isFile()) files.push(full);
    }
  }
  // some packages (e.g. reactor) emit to dist/esm with root entry index.d.ts
  const esm = join(dist, 'esm');
  if (existsSync(esm)) {
    for (const entry of readdirSync(esm)) {
      if (entry.endsWith('.d.ts') && !entry.includes('.map') && statSync(join(esm, entry)).isFile()) {
        files.push(join(esm, entry));
      }
      // recurse into esm subdirs excluding internal/advanced
      const sub = join(esm, entry);
      if (statSync(sub).isDirectory() && entry !== 'internal' && entry !== 'advanced') {
        collectDts(sub, files);
      }
    }
  }
  // public/ tier recursively
  collectDts(join(dist, 'public'), files);
  return files;
}

const out: string[] = [];
out.push('# Rimbu Public API Surface');
out.push('');
out.push('This file is generated from the emitted `dist/*.d.ts` declarations of');
out.push('the `public/` tier (and root entry) of every package, in dependency order.');
out.push('The `advanced/` and `internal/` tiers are excluded. Generated for LLM');
out.push('consistency review.');
out.push('');

let totalLines = 0;
let covered = 0;

for (const pkg of ORDER) {
  const files = packageDtsFiles(pkg);
  if (files.length === 0) continue;
  covered++;
  out.push(`## @rimbu/${pkg}`);
  out.push('');
  out.push(`\`\`\`ts`);
  for (const f of files.sort()) {
    const rel = f.replace(join(PACKAGES_DIR, pkg, 'dist') + '/', '');
    out.push(`// ---- ${rel} ----`);
    const content = readFileSync(f, 'utf-8');
    out.push(content.replace(/\r\n/g, '\n').trimEnd());
    out.push('');
  }
  out.push(`\`\`\``);
  out.push('');
}

const text = out.join('\n');
writeFileSync(join(ROOT, 'API_SURFACE.md'), text);

totalLines = text.split('\n').length;
console.log(`Packages covered: ${covered}/${ORDER.length}`);
console.log(`Total lines: ${totalLines}`);
console.log(`Output: ${join(ROOT, 'API_SURFACE.md')}`);
