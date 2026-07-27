#!/usr/bin/env node
/**
 * performance.bench.js — measures the non-functional performance targets
 * reported in Chapter 5, §5.7 against a running instance.
 *
 * Every figure is a real measurement. Each endpoint is called once to warm the
 * connection and the query planner, then measured over N samples; the median is
 * reported alongside the mean because a single slow sample (a cold Atlas
 * connection, for example) skews a mean badly at these sample sizes.
 *
 * Prerequisites: backend on :5000, database reachable. The frontend on :5173
 * is needed only for the page-load measurement, which is skipped if absent.
 *
 *   node backend/tests/performance.bench.js
 */

require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const UserModel = require('../models/UserModel');
const { ChatModel } = require('../models/MessageModel');

const BASE = process.env.TEST_BASE_URL || 'http://localhost:5000';
const FRONTEND = process.env.TEST_FRONTEND_URL || 'http://localhost:5173';
const SAMPLES = 15;
const TAG = 'perfbench';
const PW = 'PerfTest!2026';

const rows = [];

const ms = (t0, t1) => Number(t1 - t0) / 1e6;
const median = (a) => {
  const s = [...a].sort((x, y) => x - y);
  const m = Math.floor(s.length / 2);
  return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2;
};
const mean = (a) => a.reduce((x, y) => x + y, 0) / a.length;

function report(id, measure, target, samples, targetMs) {
  const md = median(samples);
  rows.push({
    id, measure, target,
    mean: mean(samples).toFixed(1),
    median: md.toFixed(1),
    min: Math.min(...samples).toFixed(1),
    max: Math.max(...samples).toFixed(1),
    verdict: targetMs == null ? '—' : (md <= targetMs ? 'Pass' : 'Fail'),
  });
}

/** Time an async operation `n` times, discarding a warm-up run. */
async function timeIt(n, fn) {
  await fn();                        // warm-up, not recorded
  const out = [];
  for (let i = 0; i < n; i++) {
    const t0 = process.hrtime.bigint();
    await fn();
    out.push(ms(t0, process.hrtime.bigint()));
  }
  return out;
}

(async () => {
  await mongoose.connect(process.env.MONGODB_URI);

  // ── fixtures ────────────────────────────────────────────────────────────
  const email = `${TAG}.user@example.invalid`;
  const peer = `${TAG}.peer@example.invalid`;
  await UserModel.deleteMany({ email: { $in: [email, peer] } });
  const hash = await bcrypt.hash(PW, 10);
  const u = await UserModel.create({
    name: `${TAG} user`, email, password: hash,
    subjects: ['Calculus', 'Statistics'], status: 'Ready To Learn', isVerified: true,
  });
  const p = await UserModel.create({
    name: `${TAG} peer`, email: peer, password: hash,
    subjects: ['Calculus'], status: 'Ready To Teach', isVerified: true,
  });

  const login = async () =>
    (await fetch(`${BASE}/api/login`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password: PW }),
    })).json();

  const { accessToken } = await login();
  const auth = { Authorization: `Bearer ${accessToken}` };

  // ── NFR-PERF-01  authentication ─────────────────────────────────────────
  report('NFR-PERF-01', 'Authentication response time', '<= 2000 ms',
         await timeIt(SAMPLES, login), 2000);

  // ── NFR-PERF-02  suggestions (the core endpoint) ────────────────────────
  report('NFR-PERF-02', 'Suggestions response time', '<= 3000 ms',
         await timeIt(SAMPLES, () => fetch(`${BASE}/api/suggestions`, { headers: auth })
           .then(r => r.json())), 3000);

  // ── NFR-PERF-05  chat history retrieval ─────────────────────────────────
  const chat = await (await fetch(`${BASE}/api/start-new-chat`, {
    method: 'POST', headers: { ...auth, 'Content-Type': 'application/json' },
    body: JSON.stringify({ userIdToChat: p._id.toString() }),
  })).json();
  const chatId = chat?.chat?._id;
  report('NFR-PERF-05', 'Chat history retrieval', '<= 2000 ms',
         await timeIt(SAMPLES, () => fetch(`${BASE}/api/messages/${chatId}`, { headers: auth })
           .then(r => r.json())), 2000);

  // ── supplementary: conversation list ────────────────────────────────────
  report('—', 'Conversation list retrieval', 'no stated target',
         await timeIt(SAMPLES, () => fetch(`${BASE}/api/chats`, { headers: auth })
           .then(r => r.json())), null);

  // ── NFR-PERF-04  first contentful paint of the application ──────────────
  let pageLoad = null;
  try {
    const puppeteer = require('puppeteer-core');
    const fs = require('fs');
    const chrome = ['/usr/bin/google-chrome', '/usr/bin/chromium'].find(fs.existsSync);
    if (chrome) {
      const browser = await puppeteer.launch({
        executablePath: chrome, headless: 'new', args: ['--no-sandbox'],
      });
      const samples = [];
      for (let i = 0; i < 5; i++) {
        const page = await browser.newPage();
        await page.setCacheEnabled(false);
        const t0 = process.hrtime.bigint();
        await page.goto(`${FRONTEND}/login`, { waitUntil: 'load', timeout: 30000 });
        samples.push(ms(t0, process.hrtime.bigint()));
        await page.close();
      }
      await browser.close();
      pageLoad = samples;
      report('NFR-PERF-04', 'Initial application load', '<= 5000 ms', samples, 5000);
    }
  } catch { /* puppeteer-core not installed — skip */ }

  // ── cleanup ─────────────────────────────────────────────────────────────
  await ChatModel.deleteMany({ participants: { $in: [u._id, p._id] } });
  await UserModel.deleteMany({ email: { $in: [email, peer] } });
  await mongoose.disconnect();

  // ── output ──────────────────────────────────────────────────────────────
  const w = [13, 34, 18, 10, 10, 10, 10, 8];
  const line = (c) => c.map((s, i) => String(s).padEnd(w[i])).join(' ');
  console.log(line(['ID', 'Measure', 'Target', 'Mean', 'Median', 'Min', 'Max', 'Verdict']));
  console.log(w.map(n => '-'.repeat(n)).join(' '));
  for (const r of rows) {
    console.log(line([r.id, r.measure, r.target, r.mean, r.median, r.min, r.max, r.verdict]));
  }
  console.log(`\nAll figures in milliseconds. ${SAMPLES} samples per endpoint` +
              (pageLoad ? ', 5 for page load' : '') + ', after a discarded warm-up run.');
  if (!pageLoad) {
    console.log('NFR-PERF-04 skipped: puppeteer-core not installed or Chrome not found.');
  }
  console.log('NFR-PERF-03 (message delivery latency) is a WebSocket measure and is');
  console.log('not covered here; see the note in Chapter 5.');
})();
