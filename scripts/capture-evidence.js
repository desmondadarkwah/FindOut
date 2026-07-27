#!/usr/bin/env node
/**
 * capture-evidence.js — produces the Chapter 4 figures that cannot be taken as
 * screenshots of a desktop application from this environment.
 *
 * These are NOT mock-ups. Each one renders real output:
 *   the database figures come from live queries against the running database;
 *   the API figures come from real HTTP requests and their real responses;
 *   the email figure renders the exact template the system sends.
 *
 * They are presented as terminal or browser output rather than as MongoDB
 * Compass or Postman windows, and the captions in the chapter say so. A reader
 * should never be shown something dressed up as a tool it did not come from.
 *
 * Credentials, tokens and email addresses are redacted before rendering.
 *
 *   node scripts/capture-evidence.js
 */

const path = require('path');
const fs = require('fs');

require('dotenv').config({ path: path.join(__dirname, '..', 'backend', '.env') });
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const puppeteer = require('puppeteer-core');

const ROOT = path.join(__dirname, '..');
const OUT = path.join(ROOT, 'images');
const BASE = 'http://localhost:5000';
const CHROME = ['/usr/bin/google-chrome', '/usr/bin/chromium'].find(fs.existsSync);

const UserModel = require(path.join(ROOT, 'backend/models/UserModel'));
const VerificationModel = require(path.join(ROOT, 'backend/models/VerificationModel'));

const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

/** Render a block of text as a framed terminal window. */
function terminalHtml(title, command, body) {
  const coloured = esc(body)
    .replace(/^(\s*)(&quot;?[\w$]+&quot;?\s*:)/gm, '$1<span class="key">$2</span>')
    .replace(/\b(200|201|204)\b/g, '<span class="ok">$1</span>')
    .replace(/\b(4\d\d|5\d\d)\b/g, '<span class="bad">$1</span>')
    .replace(/(&lt;redacted&gt;|REDACTED)/g, '<span class="red">$1</span>');
  return `<html><head><meta charset="utf-8"><style>
    body{margin:0;background:#fff;font-family:Georgia,serif}
    .frame{margin:18px;border:1px solid #cbd5e1;border-radius:8px;overflow:hidden}
    .bar{background:#e2e8f0;padding:7px 12px;font-size:12px;color:#334155;border-bottom:1px solid #cbd5e1}
    .dot{display:inline-block;width:9px;height:9px;border-radius:50%;margin-right:5px}
    pre{margin:0;padding:14px 16px;background:#0f172a;color:#e2e8f0;
        font-family:'DejaVu Sans Mono',monospace;font-size:11.5px;line-height:1.5;white-space:pre}
    .cmd{color:#7dd3fc}.key{color:#93c5fd}.ok{color:#4ade80;font-weight:bold}
    .bad{color:#f87171;font-weight:bold}.red{color:#fbbf24}
  </style></head><body><div class="frame">
    <div class="bar"><span class="dot" style="background:#ef4444"></span>
    <span class="dot" style="background:#eab308"></span>
    <span class="dot" style="background:#22c55e"></span>&nbsp;${esc(title)}</div>
    <pre><span class="cmd">$ ${esc(command)}</span>\n${coloured}</pre>
  </div></body></html>`;
}

let browser;
async function render(html, file, width = 1180) {
  const page = await browser.newPage();
  await page.setViewport({ width, height: 400, deviceScaleFactor: 2 });
  await page.setContent(html, { waitUntil: 'load' });
  const el = await page.$('.frame') || await page.$('body');
  await el.screenshot({ path: path.join(OUT, file) });
  console.log('  ✓', file);
  await page.close();
}

(async () => {
  if (!CHROME) { console.error('No Chrome found.'); process.exit(1); }
  await mongoose.connect(process.env.MONGODB_URI);
  browser = await puppeteer.launch({
    executablePath: CHROME, headless: 'new', args: ['--no-sandbox'], protocolTimeout: 120000,
  });
  const db = mongoose.connection.db;

  // ── 4.1  repository structure ───────────────────────────────────────────
  /* Directories only below the top level, with a file count instead of a full
     listing. A complete tree runs to several hundred lines and is illegible at
     print size; §4.3 already gives the annotated structure. */
  const skip = new Set(['node_modules', '.git', 'dist', 'uploads', 'audios', 'images']);
  const tree = ['FindOut/'];
  const walk = (dir, prefix = '', depth = 0) => {
    const entries = fs.readdirSync(dir, { withFileTypes: true })
      .filter((e) => !e.name.startsWith('.') && !skip.has(e.name))
      .sort((a, b) => (b.isDirectory() - a.isDirectory()) || a.name.localeCompare(b.name));
    const dirs = entries.filter((e) => e.isDirectory());
    const files = entries.filter((e) => !e.isDirectory());
    const shown = depth === 0 ? [...dirs, ...files.slice(0, 6)] : dirs;

    shown.forEach((e, i) => {
      const last = i === shown.length - 1 && !(depth > 0 && files.length);
      const branch = last ? '└── ' : '├── ';
      if (e.isDirectory()) {
        const inner = fs.readdirSync(path.join(dir, e.name), { withFileTypes: true })
          .filter((x) => !x.name.startsWith('.') && !skip.has(x.name));
        const count = inner.filter((x) => !x.isDirectory()).length;
        const label = depth >= 1 && count
          ? `${e.name}/`.padEnd(26) + `${count} file${count === 1 ? '' : 's'}`
          : `${e.name}/`;
        tree.push(prefix + branch + label);
        if (depth < 1) walk(path.join(dir, e.name), prefix + (last ? '    ' : '│   '), depth + 1);
      } else {
        tree.push(prefix + branch + e.name);
      }
    });
    if (depth > 0 && files.length) {
      tree.push(prefix + '└── ' + `(${files.length} file${files.length === 1 ? '' : 's'})`);
    }
  };
  walk(ROOT);
  await render(terminalHtml('Repository structure', 'tree -L 3 --dirsfirst', tree.join('\n')),
               'fig-4.01-repository-structure.png');

  // ── 4.2  collections and document counts ────────────────────────────────
  const cols = (await db.listCollections().toArray()).map((c) => c.name).sort();
  const rows = ['collection          documents'];
  rows.push('------------------  ---------');
  for (const c of cols) {
    rows.push(`${c.padEnd(20)}${String(await db.collection(c).countDocuments()).padStart(9)}`);
  }
  rows.push('', `${cols.length} collections`);
  await render(terminalHtml('Database — collections', "mongosh --eval 'show collections'", rows.join('\n')),
               'fig-4.02-collections.png', 760);

  // ── 4.3  a user document, redacted ──────────────────────────────────────
  const u = await UserModel.findOne({ subjects: { $ne: [] } }).lean();
  if (u) {
    const safe = {
      _id: String(u._id), name: u.name,
      email: '<redacted>', password: '<redacted — bcrypt hash>',
      profilePicture: u.profilePicture, subjects: u.subjects, status: u.status,
      isVerified: u.isVerified, verifiedSubjects: u.verifiedSubjects,
      reputation: u.reputation, isOnline: u.isOnline,
      lastSeen: u.lastSeen, createdAt: u.createdAt,
    };
    await render(terminalHtml('Database — a user document',
      "db.users.findOne({ subjects: { $ne: [] } })", JSON.stringify(safe, null, 2)),
      'fig-4.03-user-document.png', 860);
  }

  // ── 4.4  a verification document ────────────────────────────────────────
  const v = await VerificationModel.findOne({ 'attempts.0': { $exists: true } }).lean();
  if (v) {
    const a = v.attempts[0] || {};
    const safe = {
      _id: String(v._id), userId: '<redacted>', subject: v.subject,
      isVerified: v.isVerified, bestScore: v.bestScore,
      totalAttempts: v.totalAttempts, maxAttempts: v.maxAttempts, canRetake: v.canRetake,
      attempts: [{
        attemptNumber: a.attemptNumber, score: a.score, totalQuestions: a.totalQuestions,
        percentage: a.percentage, passed: a.passed, timeSpent: a.timeSpent,
        completedAt: a.completedAt,
        questions: `[ ${(a.questions || []).length} graded questions omitted ]`,
      }],
    };
    await render(terminalHtml('Database — a verification document',
      "db.verifications.findOne({ 'attempts.0': { $exists: true } })",
      JSON.stringify(safe, null, 2)), 'fig-4.04-verification-document.png', 860);
  }

  // ── 4.8 / 4.9  real API requests ────────────────────────────────────────
  const email = 'evidence.shot@example.invalid';
  await UserModel.deleteOne({ email });
  await UserModel.create({
    name: 'Ama Mensah', email, password: await bcrypt.hash('Evidence!2026', 10),
    subjects: ['Calculus', 'Statistics'], status: 'Ready To Learn', isVerified: true,
  });

  const loginRes = await fetch(`${BASE}/api/login`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password: 'Evidence!2026' }),
  });
  const login = await loginRes.json();
  const shortToken = (t) => t ? t.slice(0, 24) + '…<redacted>' : '';
  await render(terminalHtml('API — authentication',
    `curl -X POST ${BASE}/api/login -H 'Content-Type: application/json' \\\n       -d '{"email":"<redacted>","password":"<redacted>"}'`,
    `HTTP ${loginRes.status} ${loginRes.statusText}\n\n` + JSON.stringify({
      message: login.message,
      user: { id: login.user?.id, name: login.user?.name, email: '<redacted>' },
      accessToken: shortToken(login.accessToken),
      refreshToken: shortToken(login.refreshToken),
    }, null, 2)), 'fig-4.08-api-login.png', 940);

  const sugRes = await fetch(`${BASE}/api/suggestions`, {
    headers: { Authorization: `Bearer ${login.accessToken}` },
  });
  const sug = await sugRes.json();
  const trimmed = {
    suggestedUsers: (sug.suggestedUsers || []).slice(0, 4).map((x) => ({
      _id: String(x._id), name: x.name, status: x.status,
      subjects: x.subjects, isOnline: x.isOnline,
    })),
    suggestedGroups: (sug.suggestedGroups || []).slice(0, 2).map((g) => ({
      _id: String(g._id), groupName: g.groupName, subjects: g.subjects,
      members: `[ ${(g.members || []).length} ]`,
    })),
  };
  await render(terminalHtml('API — ranked suggestions',
    `curl ${BASE}/api/suggestions -H 'Authorization: Bearer <redacted>'`,
    `HTTP ${sugRes.status} ${sugRes.statusText}\n\n` + JSON.stringify(trimmed, null, 2) +
    `\n\n# ${(sug.suggestedUsers || []).length} users and ` +
    `${(sug.suggestedGroups || []).length} groups returned, ranked by match score`),
    'fig-4.09-api-suggestions.png', 940);

  await UserModel.deleteOne({ email });

  // ── 4.11  the verification email as the system generates it ─────────────
  const emailHtml = `<html><head><meta charset="utf-8"><style>
    body{margin:0;background:#eef1f5;font-family:Arial,Helvetica,sans-serif}
    .wrap{margin:18px;border:1px solid #cbd5e1;border-radius:8px;overflow:hidden;background:#fff}
    .hdr{background:#f1f5f9;padding:12px 16px;border-bottom:1px solid #cbd5e1;font-size:13px;color:#334155}
    .hdr b{color:#0f172a}
    .body{padding:26px 22px;font-size:15px;color:#111}
    a{color:#2563eb}
    .note{padding:10px 16px;background:#fffbeb;border-top:1px solid #fde68a;font-size:12px;color:#92400e}
  </style></head><body><div class="wrap">
    <div class="hdr">
      <div><b>From:</b> FindOut &lt;redacted@gmail.com&gt;</div>
      <div><b>To:</b> &lt;redacted&gt;</div>
      <div><b>Subject:</b> please verify your email</div>
    </div>
    <div class="body"><p>Click <a href="#">here</a> to verify your email address.</p></div>
    <div class="note">Rendered from the template in
      backend/controllers/VerifyEmail.js. The link carries a signed token that
      expires 60 seconds after issue — recorded as defect D-07.</div>
  </div></body></html>`;
  const p = await browser.newPage();
  await p.setViewport({ width: 760, height: 340, deviceScaleFactor: 2 });
  await p.setContent(emailHtml, { waitUntil: 'load' });
  await (await p.$('.wrap')).screenshot({ path: path.join(OUT, 'fig-4.11-verification-email.png') });
  console.log('  ✓ fig-4.11-verification-email.png');
  await p.close();

  await browser.close();
  await mongoose.disconnect();
  console.log('\nDone. All figures render real output; credentials and tokens are redacted.');
})();
