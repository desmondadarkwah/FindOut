#!/usr/bin/env node
/**
 * check-release-blockers.js — fails the production gate while a defect marked
 * Critical is still outstanding.
 *
 * The defect register lives in Chapter 4, §4.10, and is the document a reader
 * is pointed at. Reading the gate from the same table means the register
 * cannot say one thing while the pipeline believes another: closing a defect
 * in the document is what releases the gate, and forgetting to close it keeps
 * the gate shut.
 *
 * Defects are listed as markdown table rows:
 *   | **D-02** | **Critical** | description | effect | remedy |
 *
 * A defect is treated as resolved when its severity cell reads "Fixed" or
 * "Resolved".
 */

const fs = require('fs');
const path = require('path');

const REGISTER = path.join(__dirname, '..', 'chapter4-implementation.md');
const BLOCKING = /^\*{0,2}critical\*{0,2}$/i;
const RESOLVED = /^\*{0,2}(fixed|resolved|closed)\*{0,2}$/i;

if (!fs.existsSync(REGISTER)) {
  console.error(`Defect register not found at ${REGISTER}.`);
  process.exit(1);
}

const rows = fs
  .readFileSync(REGISTER, 'utf8')
  .split('\n')
  .filter((line) => /^\|\s*\*{0,2}D-\d+\*{0,2}\s*\|/.test(line));

if (rows.length === 0) {
  console.error('No defect rows found in the register. Has its format changed?');
  process.exit(1);
}

const defects = rows.map((line) => {
  const cells = line.split('|').map((c) => c.trim());
  return {
    id: cells[1].replace(/\*/g, ''),
    severity: cells[2] || '',
    description: (cells[3] || '').slice(0, 70),
  };
});

const blockers = defects.filter(
  (d) => BLOCKING.test(d.severity) && !RESOLVED.test(d.severity)
);

const summary = [
  `Defect register: ${defects.length} entries.`,
  `Release blockers outstanding: ${blockers.length}.`,
].join('\n');
console.log(summary);

if (process.env.GITHUB_STEP_SUMMARY) {
  const body = blockers.length
    ? `### Release blocked\n\n${blockers
        .map((b) => `- **${b.id}** — ${b.description}…`)
        .join('\n')}\n`
    : `### No release blockers\n\n${defects.length} defects tracked, none Critical.\n`;
  fs.appendFileSync(process.env.GITHUB_STEP_SUMMARY, body);
}

if (blockers.length > 0) {
  console.error('');
  console.error('The following defects are marked Critical and must be resolved');
  console.error('before this commit reaches production:');
  console.error('');
  for (const b of blockers) {
    console.error(`  ${b.id}  ${b.description}…`);
  }
  console.error('');
  console.error('Fix them, then change the severity cell in chapter4-implementation.md');
  console.error('to "Fixed" so the register and the pipeline agree.');
  process.exit(1);
}

console.log('No Critical defects outstanding.');
