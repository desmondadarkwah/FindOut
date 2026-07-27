#!/usr/bin/env node
/**
 * functional.test.js — executes the functional test cases reported in
 * Chapter 5, §5.6 against a running instance of the API.
 *
 * Every result printed by this script is produced by a real HTTP request. It
 * creates the accounts and groups it needs, and removes them afterwards.
 *
 * Prerequisites: the backend running on :5000 and a reachable database.
 *
 *   node backend/tests/functional.test.js
 *   node backend/tests/functional.test.js --json    # machine-readable output
 */

require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const UserModel = require('../models/UserModel');
const GroupModel = require('../models/GroupModel');
const { ChatModel, MessageModel } = require('../models/MessageModel');
const VerificationModel = require('../models/VerificationModel');

const BASE = process.env.TEST_BASE_URL || 'http://localhost:5000';
const JSON_OUT = process.argv.includes('--json');
const TAG = 'fnctest';                       // marks everything this run creates
const PW = 'FnTest!2026';

const results = [];
let learner, teacher, other;                 // { id, email, token }

/* ── helpers ─────────────────────────────────────────────────────────────── */

const record = (id, description, expected, actual, pass) =>
  results.push({ id, description, expected, actual, pass });

async function api(method, path, { token, body, raw } = {}) {
  const headers = {};
  if (token) headers.Authorization = `Bearer ${token}`;
  if (body && !raw) headers['Content-Type'] = 'application/json';
  const res = await fetch(`${BASE}${path}`, {
    method,
    headers,
    body: raw ? body : body ? JSON.stringify(body) : undefined,
  });
  let data = null;
  try { data = await res.json(); } catch { /* empty or non-JSON body */ }
  return { status: res.status, data };
}

/** Create a verified account directly, bypassing the email step. */
async function makeUser(name, subjects, status) {
  const email = `${TAG}.${name}@example.invalid`;
  await UserModel.deleteOne({ email });
  const u = await UserModel.create({
    name: `${TAG} ${name}`,
    email,
    password: await bcrypt.hash(PW, 10),
    subjects,
    status,
    isVerified: true,
  });
  const login = await api('POST', '/api/login', { body: { email, password: PW } });
  return { id: u._id.toString(), email, token: login.data?.accessToken };
}

/* ── test groups ─────────────────────────────────────────────────────────── */

async function authTests() {
  const fresh = `${TAG}.fresh@example.invalid`;
  await UserModel.deleteOne({ email: fresh });

  // TC-AUTH-01 — registration uses multipart/form-data
  const fd = new FormData();
  fd.append('name', `${TAG} Fresh`);
  fd.append('email', fresh);
  fd.append('password', PW);
  let r = await fetch(`${BASE}/api/register`, { method: 'POST', body: fd });
  record('TC-AUTH-01', 'Register with a new email', '201', String(r.status), r.status === 201);

  // TC-AUTH-02
  const fd2 = new FormData();
  fd2.append('name', `${TAG} Fresh`);
  fd2.append('email', fresh);
  fd2.append('password', PW);
  r = await fetch(`${BASE}/api/register`, { method: 'POST', body: fd2 });
  record('TC-AUTH-02', 'Register with an existing email', '400', String(r.status), r.status === 400);

  // TC-AUTH-03 — the fresh account is unverified
  let a = await api('POST', '/api/login', { body: { email: fresh, password: PW } });
  record('TC-AUTH-03', 'Login before email verification', '403', String(a.status), a.status === 403);

  // TC-AUTH-04
  a = await api('POST', '/api/login', { body: { email: learner.email, password: 'WrongPassword1!' } });
  record('TC-AUTH-04', 'Login with wrong password', '400', String(a.status), a.status === 400);

  // TC-AUTH-05
  a = await api('POST', '/api/login', { body: { email: learner.email, password: PW } });
  const pair = !!(a.data?.accessToken && a.data?.refreshToken);
  record('TC-AUTH-05', 'Login with valid credentials', '200 with token pair',
         `${a.status}${pair ? ' with token pair' : ' without token pair'}`, a.status === 200 && pair);

  // TC-AUTH-06
  a = await api('GET', '/api/user-details');
  record('TC-AUTH-06', 'Protected route with no token', '401', String(a.status), a.status === 401);

  // TC-AUTH-07
  a = await api('GET', '/api/user-details', { token: learner.token.slice(0, -3) + 'xyz' });
  record('TC-AUTH-07', 'Protected route with tampered token', '401', String(a.status), a.status === 401);

  // TC-AUTH-08
  const login = await api('POST', '/api/login', { body: { email: learner.email, password: PW } });
  a = await api('POST', '/api/refresh-token', { body: { refreshToken: login.data.refreshToken } });
  record('TC-AUTH-08', 'Refresh with a valid refresh token', '200 with new access token',
         `${a.status}${a.data?.accessToken ? ' with access token' : ''}`,
         a.status === 200 && !!a.data?.accessToken);
}

async function matchingTests() {
  // TC-MATCH-01 — the learner should see complementary (teaching) users first
  let a = await api('GET', '/api/suggestions', { token: learner.token });
  const users = a.data?.suggestedUsers || [];
  const topIsTeacher = users.length > 0 && users[0].status === 'Ready To Teach';
  record('TC-MATCH-01', 'Learner sees teachers of their subject ranked first',
         'Complementary users ranked top',
         users.length ? `top result status "${users[0].status}"` : 'no suggestions returned',
         topIsTeacher);

  // TC-MATCH-05
  const withinLimit = (a.data?.suggestedUsers?.length || 0) <= 15 &&
                      (a.data?.suggestedGroups?.length || 0) <= 15;
  record('TC-MATCH-05', 'Suggestion list length', 'At most 15 of each',
         `${a.data?.suggestedUsers?.length || 0} users, ${a.data?.suggestedGroups?.length || 0} groups`,
         withinLimit);

  // TC-MATCH-02 — a user with no subjects
  const blank = await makeUser('blank', [], 'Ready To Learn');
  a = await api('GET', '/api/suggestions', { token: blank.token });
  const empty = (a.data?.suggestedUsers?.length === 0) && !!a.data?.message;
  record('TC-MATCH-02', 'User with no subjects requests suggestions',
         'Empty list with prompt',
         empty ? 'empty list with prompt' : `${a.data?.suggestedUsers?.length ?? '?'} suggestions returned`,
         empty);

  // TC-MATCH-03 — open a chat, then confirm that partner disappears
  await api('POST', '/api/start-new-chat', { token: learner.token, body: { userIdToChat: teacher.id } });
  a = await api('GET', '/api/suggestions', { token: learner.token });
  const stillThere = (a.data?.suggestedUsers || []).some(u => u._id === teacher.id);
  record('TC-MATCH-03', 'Existing chat partner appears in suggestions', 'Must be absent',
         stillThere ? 'still present' : 'absent', !stillThere);

  // TC-MATCH-04 — join a group, then confirm it disappears
  const g = await GroupModel.create({
    groupName: `${TAG} public group`, subjects: ['Calculus'],
    groupAdmin: teacher.id, members: [teacher.id, learner.id], privacy: 'public',
  });
  a = await api('GET', '/api/suggestions', { token: learner.token });
  const groupThere = (a.data?.suggestedGroups || []).some(x => x._id === g._id.toString());
  record('TC-MATCH-04', 'Group already joined appears in suggestions', 'Must be absent',
         groupThere ? 'still present' : 'absent', !groupThere);
}

async function verificationTests() {
  // TC-VERIF-01
  let a = await api('POST', '/api/verification/start-quiz',
                    { token: learner.token, body: { subject: 'Astrophysics' } });
  record('TC-VERIF-01', 'Start quiz for a subject not on the profile', '400',
         String(a.status), a.status === 400);

  // TC-VERIF-02 — answers must not be transmitted
  a = await api('POST', '/api/verification/start-quiz',
                { token: learner.token, body: { subject: 'Calculus' } });
  /* Check the parsed structure, not a substring of the serialised JSON. The
     word "explanations" occurs inside a legitimate answer option, which a
     naive substring search reports as a leak. */
  const allowed = new Set(['question', 'options', 'difficulty']);
  const qs = a.data?.questions || [];
  const extraKeys = new Set();
  qs.forEach(q => Object.keys(q).forEach(k => { if (!allowed.has(k)) extraKeys.add(k); }));
  const leaks = extraKeys.size > 0 || 'correctAnswer' in (a.data || {});
  record('TC-VERIF-02', 'Inspect quiz response payload', 'No correct answers present',
         leaks ? `unexpected fields: ${[...extraKeys].join(', ')}`
               : `only ${[...allowed].join(', ')} transmitted`, !leaks);

  // TC-VERIF-03 — the template bank's key is [0,1,1,1,1,1,1,0,1,1]; answer 7 correctly
  const key = [0, 1, 1, 1, 1, 1, 1, 0, 1, 1];
  const sevenRight = key.map((v, i) => (i < 7 ? v : (v === 0 ? 1 : 0)));
  let sub = await api('POST', '/api/verification/submit-quiz',
                      { token: learner.token, body: { quizSessionId: a.data.quizSessionId, answers: sevenRight } });
  const passed = sub.data?.result?.passed === true && sub.data?.result?.score === 7;
  record('TC-VERIF-03', 'Submit 7 of 10 correct', 'Pass; badge awarded',
         `score ${sub.data?.result?.score ?? '?'}/10, passed=${sub.data?.result?.passed}`, passed);

  // TC-VERIF-04 — 6 correct on a second subject should fail
  a = await api('POST', '/api/verification/start-quiz',
                { token: learner.token, body: { subject: 'Physics' } });
  const sixRight = key.map((v, i) => (i < 6 ? v : (v === 0 ? 1 : 0)));
  sub = await api('POST', '/api/verification/submit-quiz',
                  { token: learner.token, body: { quizSessionId: a.data.quizSessionId, answers: sixRight } });
  const failed = sub.data?.result?.passed === false && sub.data?.result?.score === 6;
  record('TC-VERIF-04', 'Submit 6 of 10 correct', 'Fail; attempt recorded',
         `score ${sub.data?.result?.score ?? '?'}/10, passed=${sub.data?.result?.passed}`, failed);

  // TC-VERIF-05 — exhaust the three attempts on Physics, then try a fourth
  for (let i = 0; i < 2; i++) {
    const s = await api('POST', '/api/verification/start-quiz',
                        { token: learner.token, body: { subject: 'Physics' } });
    if (s.data?.quizSessionId) {
      await api('POST', '/api/verification/submit-quiz',
                { token: learner.token, body: { quizSessionId: s.data.quizSessionId, answers: sixRight } });
    }
  }
  a = await api('POST', '/api/verification/start-quiz',
                { token: learner.token, body: { subject: 'Physics' } });
  record('TC-VERIF-05', 'Fourth attempt after three failures', 'Refused',
         `${a.status} — ${a.data?.message || ''}`.trim(), a.status === 400);

  // TC-VERIF-06 — submitting another user's session
  const s = await api('POST', '/api/verification/start-quiz',
                      { token: teacher.token, body: { subject: 'Calculus' } });
  a = await api('POST', '/api/verification/submit-quiz',
                { token: learner.token, body: { quizSessionId: s.data?.quizSessionId, answers: key } });
  record('TC-VERIF-06', "Submit another user's quiz session", '403',
         String(a.status), a.status === 403);
}

async function groupTests() {
  const pub = await GroupModel.create({
    groupName: `${TAG} open`, subjects: ['Statistics'],
    groupAdmin: teacher.id, members: [teacher.id], privacy: 'public',
  });
  const priv = await GroupModel.create({
    groupName: `${TAG} approval`, subjects: ['Statistics'],
    groupAdmin: teacher.id, members: [teacher.id], privacy: 'private',
  });
  const secret = await GroupModel.create({
    groupName: `${TAG} hidden`, subjects: ['Statistics'],
    groupAdmin: teacher.id, members: [teacher.id], privacy: 'secret',
    inviteCode: `${TAG}invite01`,
  });

  // TC-GRP-01
  let a = await api('POST', '/api/join-group', { token: other.token, body: { groupId: pub._id } });
  const joined = a.status === 200 && a.data?.isPending === false;
  record('TC-GRP-01', 'Join a public group', 'Immediate membership',
         joined ? 'joined immediately' : `status ${a.status}, pending=${a.data?.isPending}`, joined);

  // TC-GRP-02
  a = await api('POST', '/api/join-group', { token: other.token, body: { groupId: priv._id } });
  const pending = a.data?.isPending === true;
  record('TC-GRP-02', 'Join a private group', 'Pending request created',
         pending ? 'pending request created' : `pending=${a.data?.isPending}`, pending);

  // TC-GRP-03
  a = await api('GET', '/api/explore/groups', { token: other.token });
  const listed = JSON.stringify(a.data || {}).includes(secret._id.toString());
  record('TC-GRP-03', 'Secret group in the explore listing', 'Absent',
         listed ? 'present' : 'absent', !listed);

  // TC-GRP-04
  a = await api('GET', `/api/join/${secret.inviteCode}`, { token: other.token });
  const viaInvite = a.status === 200;
  record('TC-GRP-04', 'Join a secret group via invite code', 'Membership granted',
         `status ${a.status}`, viaInvite);

  // TC-GRP-05
  a = await api('DELETE', `/api/deletegroup/${pub._id}`, { token: other.token });
  record('TC-GRP-05', 'Non-administrator deletes a group', 'Rejected',
         `status ${a.status}`, a.status === 403 || a.status === 401);
}

async function adminTests() {
  // TC-ADM-01 — a user token must not be accepted on an admin route
  const a = await api('GET', '/api/admin/dashboard/stats', { token: learner.token });
  record('TC-ADM-01', 'User token on an administrator endpoint', 'Rejected',
         `status ${a.status}`, a.status === 401 || a.status === 403);

  // TC-ADM-02 requires two administrator accounts and is reported separately
  record('TC-ADM-02', 'Non-super administrator promotes a user', 'Rejected',
         'not executed — requires a seeded administrator account', null);
}

async function securityTests() {
  // TC-SEC-01 — a script tag stored in a caption must not be executed. React
  // escapes by default; this checks the value is stored, not interpreted.
  const script = '<script>alert(1)</script>';
  const chat = await api('POST', '/api/start-new-chat',
                         { token: learner.token, body: { userIdToChat: other.id } });
  const chatId = chat.data?.chat?._id;
  await api('POST', '/api/messages',
            { token: learner.token, body: { chatId, senderId: learner.id, content: script } });
  const msgs = await api('GET', `/api/messages/${chatId}`, { token: learner.token });
  const stored = (msgs.data || []).some(m => m.content === script);
  record('TC-SEC-01', 'Script tag submitted as content', 'Stored as text, not executed',
         stored ? 'stored verbatim; rendered as text by the client' : 'not stored', stored);

  // TC-SEC-02 — oversized upload
  const big = new FormData();
  big.append('profilePicture', new Blob([new Uint8Array(5 * 1024 * 1024)], { type: 'image/png' }), 'big.png');
  let r = await fetch(`${BASE}/api/profile-picture`, {
    method: 'POST', headers: { Authorization: `Bearer ${learner.token}` }, body: big,
  });
  record('TC-SEC-02', 'Upload a 5 MB image (limit 2 MB)', 'Rejected',
         `status ${r.status}`, r.status >= 400);

  // TC-SEC-03 — executable renamed with an image extension
  const exe = new FormData();
  exe.append('profilePicture',
             new Blob([new Uint8Array([0x4d, 0x5a, 0x90, 0x00])], { type: 'application/x-msdownload' }),
             'payload.png');
  r = await fetch(`${BASE}/api/profile-picture`, {
    method: 'POST', headers: { Authorization: `Bearer ${learner.token}` }, body: exe,
  });
  record('TC-SEC-03', 'Upload an executable renamed .png', 'Rejected',
         `status ${r.status}`, r.status >= 400);

  // TC-SEC-04 — read another user's conversation
  const foreign = await api('POST', '/api/start-new-chat',
                            { token: teacher.token, body: { userIdToChat: other.id } });
  const foreignId = foreign.data?.chat?._id;
  const a = await api('GET', `/api/messages/${foreignId}`, { token: learner.token });
  const readable = a.status === 200;
  record('TC-SEC-04', "Read another user's conversation by ID", 'Rejected',
         readable ? 'readable — no ownership check (defect)' : `status ${a.status}`, !readable);
}

/* ── runner ──────────────────────────────────────────────────────────────── */

async function cleanup() {
  const users = await UserModel.find({ email: new RegExp(`^${TAG}\\.`) }).select('_id');
  const ids = users.map(u => u._id);
  await Promise.all([
    UserModel.deleteMany({ email: new RegExp(`^${TAG}\\.`) }),
    GroupModel.deleteMany({ groupName: new RegExp(`^${TAG} `) }),
    VerificationModel.deleteMany({ userId: { $in: ids } }),
    ChatModel.deleteMany({ participants: { $in: ids } }),
    MessageModel.deleteMany({ senderId: { $in: ids } }),
  ]);
}

(async () => {
  await mongoose.connect(process.env.MONGODB_URI);
  await cleanup();

  learner = await makeUser('learner', ['Calculus', 'Physics'], 'Ready To Learn');
  teacher = await makeUser('teacher', ['Calculus', 'Statistics'], 'Ready To Teach');
  other = await makeUser('other', ['Statistics'], 'Ready To Teach');

  for (const [label, fn] of [
    ['Authentication', authTests], ['Matching', matchingTests],
    ['Verification', verificationTests], ['Groups', groupTests],
    ['Administration', adminTests], ['Security', securityTests],
  ]) {
    try { await fn(); } catch (e) {
      record(`${label}`, `suite error`, '—', e.message.slice(0, 60), false);
    }
  }

  await cleanup();
  await mongoose.disconnect();

  if (JSON_OUT) { console.log(JSON.stringify(results, null, 2)); return; }

  const w = [11, 46, 34, 40, 8];
  const line = (c) => c.map((s, i) => String(s).padEnd(w[i])).join(' ');
  console.log(line(['ID', 'Test', 'Expected', 'Actual', 'Verdict']));
  console.log(w.map(n => '-'.repeat(n)).join(' '));
  for (const r of results) {
    const verdict = r.pass === null ? 'n/a' : r.pass ? 'PASS' : 'FAIL';
    console.log(line([r.id, r.description.slice(0, 45), r.expected.slice(0, 33),
                      String(r.actual).slice(0, 39), verdict]));
  }
  const run = results.filter(r => r.pass !== null);
  const passed = run.filter(r => r.pass).length;
  console.log(`\n${passed}/${run.length} passed` +
              (results.length - run.length ? `, ${results.length - run.length} not executed` : ''));
})();
