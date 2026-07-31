#!/usr/bin/env node
/**
 * capture-remaining.js — captures the Chapter 4 figures that need interaction
 * rather than a plain page load: the quiz flow, a pending join request, a
 * comment thread, and the administrator screens.
 *
 * It seeds the fixtures it needs directly in the database, drives a real
 * browser through the running application, then removes everything it created.
 *
 *   node scripts/capture-remaining.js
 *
 * Requires the backend on :5000, the frontend on :5173, and puppeteer-core.
 */

const path = require('path');
const fs = require('fs');

require('dotenv').config({ path: path.join(__dirname, '..', 'backend', '.env') });
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const B = (m) => require(path.join(__dirname, '..', 'backend', m));
const UserModel = B('models/UserModel');
const AdminModel = B('models/AdminModel');
const GroupModel = B('models/GroupModel');
const PostModel = B('models/PostModel');

const puppeteer = require('puppeteer-core');

const OUT = path.join(__dirname, '..', 'docs', 'images');
const FRONTEND = 'http://localhost:5173';
const TAG = 'shotfix';
const PW = 'ShotFix!2026';
const CHROME = ['/usr/bin/google-chrome', '/usr/bin/chromium'].find(fs.existsSync);

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const DESKTOP = { width: 1440, height: 950, deviceScaleFactor: 2 };

let captured = 0, failed = 0;

async function shot(page, file, note = '') {
  await page.screenshot({ path: path.join(OUT, file) });
  captured++;
  console.log(`  ✓ ${file}${note ? '  — ' + note : ''}`);
}

async function login(page, email, password, route = '/login') {
  await page.goto(`${FRONTEND}${route}`, { waitUntil: 'networkidle2' });
  await sleep(1500);
  const inputs = await page.$$('input');
  await inputs[0].type(email, { delay: 15 });
  await inputs[1].type(password, { delay: 15 });
  await page.evaluate(() => {
    const b = [...document.querySelectorAll('button')]
      .find((x) => /log ?in|sign ?in/i.test(x.textContent) && !/google/i.test(x.textContent));
    if (b) b.click();
  });
  await sleep(4500);
}

/** Click the first element whose visible text matches. */
async function clickText(page, pattern, tags = ['button', 'a', 'span', 'div']) {
  return page.evaluate((pat, tagList) => {
    const re = new RegExp(pat, 'i');
    for (const tag of tagList) {
      const el = [...document.querySelectorAll(tag)]
        .find((e) => re.test(e.textContent.trim()) && e.offsetParent !== null);
      if (el) { el.click(); return true; }
    }
    return false;
  }, pattern, tags);
}

(async () => {
  if (!CHROME) { console.error('No Chrome found.'); process.exit(1); }
  await mongoose.connect(process.env.MONGODB_URI);

  // ── seed ────────────────────────────────────────────────────────────────
  console.log('Seeding fixtures...');
  const cleanup = async () => {
    const us = await UserModel.find({ email: new RegExp(`^${TAG}\\.`) }).select('_id');
    const ids = us.map((u) => u._id);
    await Promise.all([
      UserModel.deleteMany({ email: new RegExp(`^${TAG}\\.`) }),
      AdminModel.deleteMany({ email: new RegExp(`^${TAG}\\.`) }),
      GroupModel.deleteMany({ groupName: new RegExp(`^${TAG} `) }),
      PostModel.deleteMany({ author: { $in: ids } }),
    ]);
  };
  await cleanup();

  const hash = await bcrypt.hash(PW, 10);
  const owner = await UserModel.create({
    name: 'Ama Mensah', email: `${TAG}.owner@example.invalid`, password: hash,
    subjects: ['Calculus', 'Statistics'], status: 'Ready To Learn', isVerified: true,
  });
  const requester = await UserModel.create({
    name: 'Kwame Boateng', email: `${TAG}.req@example.invalid`, password: hash,
    subjects: ['Calculus'], status: 'Ready To Teach', isVerified: true,
  });
  const admin = await AdminModel.create({
    name: 'Capture Admin', email: `${TAG}.admin@example.invalid`,
    password: hash, isSuperAdmin: true,
  });

  // a private group owned by `owner`, with a request waiting from `requester`
  await GroupModel.create({
    groupName: `${TAG} Calculus Study Circle`, subjects: ['Calculus'],
    description: 'Weekly problem sessions',
    groupAdmin: owner._id, members: [owner._id], privacy: 'private',
    pendingRequests: [{ userId: requester._id, requestedAt: new Date() }],
  });

  // a post with a comment and a reply, reusing an image already on disk
  const existing = fs.existsSync(path.join(__dirname, '..', 'backend', 'uploads', 'posts'))
    ? fs.readdirSync(path.join(__dirname, '..', 'backend', 'uploads', 'posts'))[0] : null;
  await PostModel.create({
    author: owner._id,
    image: existing ? `/uploads/posts/${existing}` : '/uploads/posts/placeholder.jpg',
    caption: 'Worked solutions for the integration by parts exercises from week 6.',
    postType: 'resource', subject: 'Calculus',
    helpfulCount: 2,
    commentCount: 2,
    comments: [{
      user: requester._id,
      text: 'This is exactly what I needed for question 4 — thank you.',
      likeCount: 1, replyCount: 1,
      replies: [{ user: owner._id, text: 'Glad it helped. Ask if question 7 is unclear.', likeCount: 0 }],
    }],
  });
  console.log('  fixtures created\n');

  const browser = await puppeteer.launch({
    executablePath: CHROME, headless: 'new', args: ['--no-sandbox', '--disable-dev-shm-usage'],
  });

  // ── student screens ─────────────────────────────────────────────────────
  console.log('Student screens');
  const page = await browser.newPage();
  await page.setViewport(DESKTOP);
  await login(page, owner.email, PW);

  // 4.17 quiz in progress
  try {
    await page.goto(`${FRONTEND}/verification`, { waitUntil: 'networkidle2' });
    await sleep(3500);
    const started = await clickText(page, '^(start|take|begin).*(quiz|test)|start$');
    await sleep(4000);
    if (!started) await page.goto(`${FRONTEND}/take-quiz/Calculus`, { waitUntil: 'networkidle2' });
    await sleep(4000);
    await shot(page, 'fig-4.17-quiz-in-progress.png', 'quiz question and options');
  } catch (e) { failed++; console.log('  ✗ fig-4.17 —', e.message.split('\n')[0]); }

  // 4.18 quiz result — answer every question, then submit
  try {
    for (let q = 0; q < 12; q++) {
      const picked = await page.evaluate(() => {
        const opts = [...document.querySelectorAll('button, label, div[role="button"]')]
          .filter((e) => e.offsetParent !== null && /^[A-D][\).]?\s|^(Only|Combining|Ensuring|Building|Using|Never|Practice)/i.test(e.textContent.trim()));
        if (opts.length) { opts[0].click(); return true; }
        return false;
      });
      await sleep(500);
      const advanced = await clickText(page, '^(next|continue)$');
      if (!advanced) break;
      await sleep(800);
      if (!picked) break;
    }
    await clickText(page, '^(submit|finish)');
    await sleep(4500);
    await shot(page, 'fig-4.18-quiz-result.png', 'score and feedback');
  } catch (e) { failed++; console.log('  ✗ fig-4.18 —', e.message.split('\n')[0]); }

  // 4.22 pending join request, seen by the group owner
  try {
    await page.goto(`${FRONTEND}/dashboard`, { waitUntil: 'networkidle2' });
    await sleep(4000);
    await clickText(page, 'Calculus Study Circle');
    await sleep(2500);
    const found = await clickText(page, 'pending|request');
    await sleep(2500);
    await shot(page, 'fig-4.22-pending-join-request.png',
               found ? 'request awaiting approval' : 'dashboard (locate the request manually)');
  } catch (e) { failed++; console.log('  ✗ fig-4.22 —', e.message.split('\n')[0]); }

  // 4.24 post with its comment thread open
  try {
    await page.goto(`${FRONTEND}/feed`, { waitUntil: 'networkidle2' });
    await sleep(5000);
    await page.evaluate(() => {
      const el = [...document.querySelectorAll('button, div, span')]
        .find((e) => e.offsetParent !== null &&
          (/comment/i.test(e.getAttribute('aria-label') || '') ||
           /^\d+\s*$/.test(e.textContent.trim()) === false && /comment/i.test(e.textContent)));
      if (el) el.click();
    });
    await sleep(3500);
    await shot(page, 'fig-4.24-post-comments.png', 'threaded discussion');
  } catch (e) { failed++; console.log('  ✗ fig-4.24 —', e.message.split('\n')[0]); }
  await page.close();

  // ── administrator screens ───────────────────────────────────────────────
  console.log('\nAdministrator screens');
  const ap = await browser.newPage();
  await ap.setViewport(DESKTOP);
  try {
    await login(ap, admin.email, PW, '/admin-login');
    await ap.goto(`${FRONTEND}/admin-dashboard`, { waitUntil: 'networkidle2' });
    await sleep(4500);
    await shot(ap, 'fig-4.26-admin-dashboard.png', 'platform statistics');
    await ap.goto(`${FRONTEND}/admin-users`, { waitUntil: 'networkidle2' });
    await sleep(4000);
    await shot(ap, 'fig-4.27-admin-users.png', 'user management');
  } catch (e) { failed++; console.log('  ✗ admin —', e.message.split('\n')[0]); }
  await ap.close();

  await browser.close();

  // ── remove fixtures ─────────────────────────────────────────────────────
  await cleanup();
  await mongoose.disconnect();
  console.log(`\n${captured} captured, ${failed} failed. Fixtures removed.`);
})();
