#!/usr/bin/env node
/**
 * check-bundle-size.js — enforces the gzipped bundle budget from the
 * non-functional requirements (NFR-PERF-08).
 *
 * Bundle growth is gradual and invisible locally on a fast connection. This
 * turns it into a build failure instead of something a user discovers.
 */

const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

const DIST = path.join(__dirname, '..', 'frontend', 'dist', 'assets');

// Budgets in kilobytes, gzipped. Set above current usage with headroom, so a
// normal change passes and a sudden jump does not.
const BUDGET = { js: 300, css: 40 };

if (!fs.existsSync(DIST)) {
  console.error(`No build output at ${DIST}. Run the frontend build first.`);
  process.exit(1);
}

const gzippedKb = (file) =>
  zlib.gzipSync(fs.readFileSync(file), { level: 9 }).length / 1024;

const totals = { js: 0, css: 0 };
for (const name of fs.readdirSync(DIST)) {
  const ext = path.extname(name).slice(1);
  if (ext in totals) totals[ext] += gzippedKb(path.join(DIST, name));
}

let failed = false;
console.log('Bundle size (gzipped)\n');
for (const [ext, budget] of Object.entries(BUDGET)) {
  const used = totals[ext];
  const pct = ((used / budget) * 100).toFixed(0);
  const ok = used <= budget;
  if (!ok) failed = true;
  console.log(
    `  ${ext.toUpperCase().padEnd(4)} ${used.toFixed(2).padStart(8)} kB` +
    ` / ${String(budget).padStart(4)} kB budget  (${pct}%)  ${ok ? 'ok' : 'OVER BUDGET'}`
  );
}

if (process.env.GITHUB_STEP_SUMMARY) {
  const rows = Object.entries(BUDGET).map(([ext, budget]) =>
    `| ${ext.toUpperCase()} | ${totals[ext].toFixed(2)} kB | ${budget} kB | ` +
    `${totals[ext] <= budget ? 'ok' : 'over'} |`).join('\n');
  fs.appendFileSync(process.env.GITHUB_STEP_SUMMARY,
    `### Bundle size (gzipped)\n\n| Asset | Size | Budget | Status |\n|---|---|---|---|\n${rows}\n`);
}

if (failed) {
  console.error('\nBundle budget exceeded. Either reduce the bundle or raise the');
  console.error('budget deliberately in scripts/check-bundle-size.js.');
  process.exit(1);
}
console.log('\nWithin budget.');
