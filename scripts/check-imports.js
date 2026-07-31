#!/usr/bin/env node
/**
 * check-imports.js — verifies every relative import resolves against the real
 * filenames on disk, including their capitalisation.
 *
 * macOS and Windows filesystems are case-insensitive, so an import of
 * `../socket/socket` resolves happily in development and crashes on a Linux
 * server. That exact fault reached deployment once; this check exists so it
 * cannot again.
 */

const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const SKIP = new Set(['node_modules', '.git', 'dist', 'coverage', 'coverage-integration']);
const EXTS = ['', '.js', '.jsx', '.json', '/index.js', '/index.jsx'];

function walk(dir, out = []) {
  if (!fs.existsSync(dir)) return out;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (SKIP.has(entry.name) || entry.name.startsWith('.')) continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full, out);
    else if (/\.(jsx?|mjs|cjs)$/.test(entry.name)) out.push(full);
  }
  return out;
}

/** The real on-disk name matching `p` case-insensitively, if any. */
function actualName(p) {
  const dir = path.dirname(p);
  const base = path.basename(p);
  let entries;
  try { entries = fs.readdirSync(dir); } catch { return null; }
  return entries.find((e) => e.toLowerCase() === base.toLowerCase()) || null;
}

const files = [
  ...walk(path.join(ROOT, 'backend')),
  ...walk(path.join(ROOT, 'frontend', 'src')),
  ...walk(path.join(ROOT, 'scripts')),
];

const problems = [];

for (const file of files) {
  const source = fs.readFileSync(file, 'utf8');
  const specs = [
    ...source.matchAll(/require\(\s*['"](\.[^'"]+)['"]\s*\)/g),
    ...source.matchAll(/from\s+['"](\.[^'"]+)['"]/g),
    ...source.matchAll(/import\(\s*['"](\.[^'"]+)['"]\s*\)/g),
  ].map((m) => m[1]);

  for (const spec of specs) {
    const base = path.resolve(path.dirname(file), spec);
    const resolved = EXTS.map((e) => base + e).find((c) => {
      try { return fs.statSync(c).isFile(); } catch { return false; }
    });
    if (resolved) continue;

    // Report the correct capitalisation when that is the only difference.
    let suggestion = null;
    for (const ext of EXTS) {
      const name = actualName(base + ext);
      if (name) { suggestion = name; break; }
    }
    problems.push({ file: path.relative(ROOT, file), spec, suggestion });
  }
}

if (problems.length === 0) {
  console.log(`All relative imports resolve (${files.length} files checked).`);
  process.exit(0);
}

console.error(`${problems.length} unresolved import(s):\n`);
for (const p of problems) {
  console.error(`  ${p.file}`);
  console.error(`    imports: ${p.spec}`);
  console.error(p.suggestion
    ? `    on disk: ${p.suggestion}  (capitalisation differs)`
    : '    no file matches, even ignoring case');
  console.error('');
}
process.exit(1);
