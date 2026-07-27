#!/usr/bin/env node
/**
 * project-metrics.js — counts the figures reported in Chapter 4, §4.8.
 *
 * Written as a script rather than counted by hand so the table can be
 * regenerated after any change, and so a reader can verify it.
 *
 *   node scripts/project-metrics.js
 *   node scripts/project-metrics.js --json
 */

const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const JSON_OUT = process.argv.includes('--json');

const IGNORE = new Set(['node_modules', '.git', 'dist', 'uploads', 'audios', 'images']);

function walk(dir, exts, out = []) {
  if (!fs.existsSync(dir)) return out;
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    if (IGNORE.has(e.name) || e.name.startsWith('.')) continue;
    const p = path.join(dir, e.name);
    if (e.isDirectory()) walk(p, exts, out);
    else if (exts.some((x) => e.name.endsWith(x))) out.push(p);
  }
  return out;
}

const countFiles = (dir, ext = '.js') =>
  fs.existsSync(dir) ? fs.readdirSync(dir).filter((f) => f.endsWith(ext)).length : 0;

const lines = (files) =>
  files.reduce((n, f) => n + fs.readFileSync(f, 'utf8').split('\n').length, 0);

/** Count matches of a pattern across a set of files. */
function countMatches(files, re) {
  let n = 0;
  for (const f of files) {
    const m = fs.readFileSync(f, 'utf8').match(re);
    if (m) n += m.length;
  }
  return n;
}

// ── code volume ────────────────────────────────────────────────────────────
const backendFiles = walk(path.join(ROOT, 'backend'), ['.js']);
const frontendFiles = walk(path.join(ROOT, 'frontend', 'src'), ['.js', '.jsx', '.css']);

// ── backend structure ──────────────────────────────────────────────────────
const routeFiles = walk(path.join(ROOT, 'backend', 'routes'), ['.js']);
const endpoints = countMatches(
  routeFiles,
  /router\.(get|post|put|patch|delete)\s*\(/g
);

const socketFile = path.join(ROOT, 'backend', 'socket', 'Socket.js');
const socketSrc = fs.existsSync(socketFile) ? fs.readFileSync(socketFile, 'utf8') : '';
const inbound = new Set([...socketSrc.matchAll(/socket\.on\(\s*['"]([^'"]+)['"]/g)].map(m => m[1]));
inbound.delete('disconnect');
const outbound = new Set([
  ...socketSrc.matchAll(/\.emit\(\s*['"]([^'"]+)['"]/g),
].map(m => m[1]));

// ── OpenAPI ────────────────────────────────────────────────────────────────
let documented = 0, schemas = 0, tags = 0;
try {
  const spec = require(path.join(ROOT, 'backend', 'docs', 'openapi.js'));
  for (const p of Object.values(spec.paths)) {
    documented += Object.keys(p).filter((k) =>
      ['get', 'post', 'put', 'patch', 'delete'].includes(k)).length;
  }
  schemas = Object.keys(spec.components.schemas).length;
  tags = spec.tags.length;
} catch { /* spec not loadable */ }

// ── frontend structure ─────────────────────────────────────────────────────
const src = path.join(ROOT, 'frontend', 'src');
const pages = countFiles(path.join(src, 'Pages'), '.jsx');
const components = countFiles(path.join(src, 'components'), '.jsx');
const contexts = countFiles(path.join(src, 'Context'), '.jsx');
const feed = countFiles(path.join(src, 'Feed'), '.jsx');

// ── build output, if a production build is present ──────────────────────────
let bundle = null;
const dist = path.join(ROOT, 'frontend', 'dist', 'assets');
if (fs.existsSync(dist)) {
  const js = fs.readdirSync(dist).filter((f) => f.endsWith('.js'));
  const css = fs.readdirSync(dist).filter((f) => f.endsWith('.css'));
  const size = (f) => fs.statSync(path.join(dist, f)).size;
  bundle = {
    jsRaw: js.reduce((n, f) => n + size(f), 0),
    cssRaw: css.reduce((n, f) => n + size(f), 0),
  };
}

const metrics = {
  'Backend code (lines)': lines(backendFiles),
  'Frontend code (lines)': lines(frontendFiles),
  'Total application code (lines)': lines(backendFiles) + lines(frontendFiles),
  'Backend source files': backendFiles.length,
  'Frontend source files': frontendFiles.length,
  '— — —': '',
  'Controllers': countFiles(path.join(ROOT, 'backend', 'controllers')),
  'Models': countFiles(path.join(ROOT, 'backend', 'models')),
  'Express routers': routeFiles.length,
  'Middleware modules': countFiles(path.join(ROOT, 'backend', 'middleware')),
  'Services': countFiles(path.join(ROOT, 'backend', 'services')),
  'Migration scripts': countFiles(path.join(ROOT, 'backend', 'migration')),
  'Test and benchmark scripts': countFiles(path.join(ROOT, 'backend', 'tests')),
  '— —  —': '',
  'REST endpoints': endpoints,
  'Documented API operations': documented,
  'API documentation coverage': endpoints ? `${Math.round((documented / endpoints) * 100)}%` : '—',
  'OpenAPI schema definitions': schemas,
  'OpenAPI tags': tags,
  'Socket events (client to server)': inbound.size,
  'Socket events (server to client)': outbound.size,
  '—  — —': '',
  'React pages': pages,
  'React components': components + feed,
  'Context providers': contexts,
};

if (bundle) {
  metrics['—   — —'] = '';
  metrics['JS bundle (raw)'] = `${(bundle.jsRaw / 1024).toFixed(2)} kB`;
  metrics['CSS bundle (raw)'] = `${(bundle.cssRaw / 1024).toFixed(2)} kB`;
}

if (JSON_OUT) {
  console.log(JSON.stringify(metrics, null, 2));
} else {
  const w = 36;
  console.log('FindOut — project metrics\n');
  for (const [k, v] of Object.entries(metrics)) {
    if (v === '') { console.log(''); continue; }
    console.log(`  ${k.padEnd(w)} ${v}`);
  }
  if (!bundle) {
    console.log('\n  (bundle sizes omitted: run `npm run build --prefix frontend` first)');
  }
}
