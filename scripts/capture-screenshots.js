#!/usr/bin/env node
/**
 * capture-screenshots.js
 *
 * Drives a real Chrome instance through the running application and saves the
 * figures referenced by docs/chapter4-implementation.md into docs/images/.
 *
 * Requires the backend on :5000 and the frontend on :5173, plus a test account
 * whose email is already verified.
 *
 *   node scripts/capture-screenshots.js --email you@example.com --password 'pw'
 *
 * Optional:
 *   --admin-email / --admin-password   also capture the admin figures
 *   --frontend http://localhost:5173
 *   --backend  http://localhost:5000
 *   --headed                           watch it run in a visible window
 */

const path = require('path');
const fs = require('fs');

let puppeteer;
try {
  puppeteer = require('puppeteer-core');
} catch {
  console.error('puppeteer-core is not installed. Run:\n  npm install --no-save puppeteer-core');
  process.exit(1);
}

/* ── arguments ─────────────────────────────────────────────────────────── */
const arg = (name, fallback = null) => {
  const i = process.argv.indexOf(`--${name}`);
  return i !== -1 && process.argv[i + 1] ? process.argv[i + 1] : fallback;
};
const flag = (name) => process.argv.includes(`--${name}`);

const EMAIL = arg('email');
const PASSWORD = arg('password');
const ADMIN_EMAIL = arg('admin-email');
const ADMIN_PASSWORD = arg('admin-password');
const FRONTEND = arg('frontend', 'http://localhost:5173').replace(/\/$/, '');
const BACKEND = arg('backend', 'http://localhost:5000').replace(/\/$/, '');
const OUT = path.join(__dirname, '..', 'docs', 'images');

if (!EMAIL || !PASSWORD) {
  console.error('Usage: node scripts/capture-screenshots.js --email <email> --password <password>');
  process.exit(1);
}

/* Locate Chrome. Adjust if yours lives elsewhere. */
const CHROME_CANDIDATES = [
  '/usr/bin/google-chrome',
  '/usr/bin/chromium',
  '/usr/bin/chromium-browser',
  '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
];
const CHROME = CHROME_CANDIDATES.find((p) => fs.existsSync(p));
if (!CHROME) {
  console.error('No Chrome or Chromium found. Add its path to CHROME_CANDIDATES.');
  process.exit(1);
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const DESKTOP = { width: 1440, height: 900, deviceScaleFactor: 2 };
const MOBILE = { width: 414, height: 896, deviceScaleFactor: 2, isMobile: true, hasTouch: true };

let captured = 0;
let failed = 0;

async function shot(page, file, note) {
  fs.mkdirSync(OUT, { recursive: true });
  await page.screenshot({ path: path.join(OUT, file) });
  captured++;
  console.log(`  ✓ ${file}${note ? '  — ' + note : ''}`);
}

/**
 * Logs in through the real form so the session is genuine, then seeds
 * localStorage-independent state by letting the app redirect.
 */
async function login(page) {
  await page.goto(`${FRONTEND}/login`, { waitUntil: 'networkidle2' });
  await sleep(1200);

  // The form has no stable ids, so target by input order and type.
  const inputs = await page.$$('input');
  if (inputs.length < 2) throw new Error('Login form inputs not found');
  await inputs[0].click({ clickCount: 3 });
  await inputs[0].type(EMAIL, { delay: 20 });
  await inputs[1].click({ clickCount: 3 });
  await inputs[1].type(PASSWORD, { delay: 20 });

  const clicked = await page.evaluate(() => {
    const btn = [...document.querySelectorAll('button')]
      .find((b) => /log ?in|sign ?in/i.test(b.textContent) && !/google/i.test(b.textContent));
    if (!btn) return false;
    btn.click();
    return true;
  });
  if (!clicked) throw new Error('Login button not found');

  await sleep(4000);
  const token = await page.evaluate(() => localStorage.getItem('accessToken'));
  if (!token) throw new Error('Login failed — no access token stored. Check the credentials, and that the account email is verified.');
  console.log('  · authenticated');
}

/** Navigate, wait, screenshot. Failures are reported but do not stop the run. */
async function capture(page, file, url, { wait = 3000, before = null, note = '' } = {}) {
  try {
    if (url) await page.goto(`${FRONTEND}${url}`, { waitUntil: 'networkidle2', timeout: 30000 });
    await sleep(wait);
    if (before) await before(page);
    await shot(page, file, note);
  } catch (e) {
    failed++;
    console.log(`  ✗ ${file} — ${e.message.split('\n')[0]}`);
  }
}

(async () => {
  console.log(`Chrome:   ${CHROME}`);
  console.log(`Frontend: ${FRONTEND}`);
  console.log(`Output:   ${OUT}\n`);

  const browser = await puppeteer.launch({
    executablePath: CHROME,
    headless: flag('headed') ? false : 'new',
    args: ['--no-sandbox', '--disable-dev-shm-usage'],
  });

  /* ── Public pages ──────────────────────────────────────────────────── */
  console.log('Public pages');
  let page = await browser.newPage();
  await page.setViewport(DESKTOP);
  await capture(page, 'fig-4.10-registration.png', '/register');
  await capture(page, 'fig-4.12-login.png', '/login');

  /* ── Swagger ───────────────────────────────────────────────────────── */
  console.log('\nAPI documentation');
  try {
    await page.goto(`${BACKEND}/api-docs/`, { waitUntil: 'networkidle2' });
    await page.waitForSelector('.swagger-ui', { timeout: 15000 });
    await sleep(2000);
    await shot(page, 'fig-4.05-swagger-index.png');

    await page.setViewport({ ...DESKTOP, height: 1400 });
    await page.click('#operations-tag-Matching');
    await sleep(1200);
    await page.click('#operations-Matching-get_api_suggestions .opblock-summary-control');
    await sleep(2000);
    await shot(page, 'fig-4.06-swagger-matching-endpoint.png');

    await page.setViewport(DESKTOP);
    await page.goto(`${BACKEND}/api-docs/`, { waitUntil: 'networkidle2' });
    await page.waitForSelector('.swagger-ui', { timeout: 15000 });
    await sleep(1500);
    await page.click('button.btn.authorize');
    await sleep(1500);
    await shot(page, 'fig-4.07-swagger-authorize.png');
  } catch (e) {
    failed++;
    console.log(`  ✗ swagger — ${e.message.split('\n')[0]}`);
  }

  /* ── Authenticated desktop screens ─────────────────────────────────── */
  console.log('\nAuthenticated screens');
  await page.setViewport(DESKTOP);
  try {
    await login(page);
  } catch (e) {
    console.error(`\nCould not log in: ${e.message}`);
    await browser.close();
    process.exit(1);
  }

  await capture(page, 'fig-4.14-dashboard-suggestions.png', '/dashboard', {
    wait: 4500,
    note: 'the key figure',
  });

  await capture(page, 'fig-4.13-manage-profile.png', '/dashboard', {
    wait: 3500,
    before: async (p) => {
      await p.evaluate(() => {
        const btn = [...document.querySelectorAll('button')]
          .find((b) => /my profile|change/i.test(b.textContent));
        if (btn) btn.click();
      });
      await sleep(1800);
    },
  });

  await capture(page, 'fig-4.15-verified-suggestion.png', '/dashboard', { wait: 4000 });
  await capture(page, 'fig-4.16-verification-dashboard.png', '/verification', { wait: 3500 });
  await capture(page, 'fig-4.21-explore-groups.png', '/explore-groups', { wait: 4000 });
  await capture(page, 'fig-4.23-feed.png', '/feed', { wait: 4500 });
  await capture(page, 'fig-4.25-create-post.png', '/add-post', { wait: 3000 });
  await capture(page, 'fig-4.20-create-group.png', '/creategroup', { wait: 3000 });
  await capture(page, 'fig-4.19-messaging-two-accounts.png', '/inbox', {
    wait: 4000,
    note: 'single account; capture the two-window version by hand',
  });

  /* ── Mobile viewport ───────────────────────────────────────────────── */
  console.log('\nMobile viewport');
  await page.setViewport(MOBILE);
  await capture(page, 'fig-4.28-dashboard-mobile.png', '/dashboard', { wait: 4000 });
  await capture(page, 'fig-4.29-chat-mobile.png', '/inbox', { wait: 3500 });

  /* ── Admin (optional) ──────────────────────────────────────────────── */
  if (ADMIN_EMAIL && ADMIN_PASSWORD) {
    console.log('\nAdministrator screens');
    const admin = await browser.newPage();
    await admin.setViewport(DESKTOP);
    try {
      await admin.goto(`${FRONTEND}/admin-login`, { waitUntil: 'networkidle2' });
      await sleep(1500);
      const inputs = await admin.$$('input');
      await inputs[0].type(ADMIN_EMAIL, { delay: 20 });
      await inputs[1].type(ADMIN_PASSWORD, { delay: 20 });
      await admin.evaluate(() => {
        const b = [...document.querySelectorAll('button')].find((x) => /log ?in|sign ?in/i.test(x.textContent));
        if (b) b.click();
      });
      await sleep(4000);
      await capture(admin, 'fig-4.26-admin-dashboard.png', '/admin-dashboard', { wait: 4000 });
      await capture(admin, 'fig-4.27-admin-users.png', '/admin-users', { wait: 3500 });
    } catch (e) {
      failed++;
      console.log(`  ✗ admin — ${e.message.split('\n')[0]}`);
    }
    await admin.close();
  } else {
    console.log('\nAdministrator screens skipped (pass --admin-email and --admin-password)');
  }

  await browser.close();

  console.log(`\n${captured} captured, ${failed} failed.`);
  console.log('\nStill to capture by hand (desktop applications and email):');
  console.log('  4.1  VS Code project     4.2-4.4  MongoDB Compass');
  console.log('  4.8-4.9  Postman         4.11     Verification email');
  console.log('  4.17, 4.18, 4.22, 4.24 need interaction — take them manually.');
})();
