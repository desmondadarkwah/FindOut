/**
 * Integration tests — the API and the database together.
 *
 * These run against a real MongoDB. In CI a service container provides one; run
 * them locally with an explicit test database:
 *
 *   MONGODB_URI='mongodb://127.0.0.1:27017/findout_test' npm run test:integration
 *
 * The suite refuses to run against a database whose name does not look like a
 * test database, so it cannot destroy development data by accident.
 *
 * The Express app is built here rather than imported from server.js, because
 * server.js also starts an HTTP listener and a WebSocket server as a side
 * effect of being required.
 */

const request = require('supertest');
const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const UserModel = require('../../models/UserModel');
const GroupModel = require('../../models/GroupModel');
const VerificationModel = require('../../models/VerificationModel');
const { ChatModel, MessageModel } = require('../../models/MessageModel');

const URI = process.env.MONGODB_URI;
const PW = 'IntegrationTest!2026';

/** Assemble the routers without the listener or the socket server. */
function buildApp() {
  const app = express();
  app.use(express.json());
  app.use('/api', require('../../routes/UserRoute'));
  app.use('/api/admin', require('../../routes/adminRoutes'));
  app.use('/api', require('../../routes/searchRoutes'));
  app.use('/api', require('../../routes/verificationRoutes'));
  return app;
}

let app;

async function makeUser({ name, subjects = [], status = 'Later', verified = true }) {
  const email = `it.${name}@example.invalid`;
  await UserModel.deleteOne({ email });
  const user = await UserModel.create({
    name, email, password: await bcrypt.hash(PW, 10),
    subjects, status, isVerified: verified,
  });
  return { user, email };
}

async function login(email) {
  const res = await request(app).post('/api/login').send({ email, password: PW });
  return res.body.accessToken;
}

describe('API integration', () => {
  beforeAll(async () => {
    if (!URI) return;
    // Refuse to touch anything that is not obviously a test database.
    const dbName = URI.split('/').pop().split('?')[0];
    if (!/test/i.test(dbName)) {
      throw new Error(
        `Refusing to run integration tests against database "${dbName}". ` +
        'Point MONGODB_URI at a database whose name contains "test".'
      );
    }
    process.env.JWT_SECRET = process.env.JWT_SECRET || 'integration-secret';
    await mongoose.connect(URI);
    app = buildApp();
  }, 30000);

  afterAll(async () => {
    if (!URI || mongoose.connection.readyState === 0) return;
    await Promise.all([
      UserModel.deleteMany({ email: /^it\./ }),
      GroupModel.deleteMany({ groupName: /^IT / }),
      VerificationModel.deleteMany({}),
      ChatModel.deleteMany({}),
      MessageModel.deleteMany({}),
    ]);
    await mongoose.disconnect();
  }, 30000);

  const maybe = URI ? describe : describe.skip;

  maybe('authentication', () => {
    it('refuses login before the email is verified', async () => {
      const { email } = await makeUser({ name: 'unverified', verified: false });
      const res = await request(app).post('/api/login').send({ email, password: PW });
      expect(res.status).toBe(403);
    });

    it('refuses login with the wrong password', async () => {
      const { email } = await makeUser({ name: 'wrongpw' });
      const res = await request(app).post('/api/login').send({ email, password: 'nope' });
      expect(res.status).toBe(400);
    });

    it('issues an access and a refresh token on success', async () => {
      const { email } = await makeUser({ name: 'goodlogin' });
      const res = await request(app).post('/api/login').send({ email, password: PW });
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('accessToken');
      expect(res.body).toHaveProperty('refreshToken');
    });

    it('never returns the password hash', async () => {
      const { email } = await makeUser({ name: 'nohash' });
      const res = await request(app).post('/api/login').send({ email, password: PW });
      expect(JSON.stringify(res.body)).not.toMatch(/\$2[aby]\$/);
    });

    it('rejects a protected route without a token', async () => {
      const res = await request(app).get('/api/user-details');
      expect(res.status).toBe(401);
    });

    it('rejects a tampered token', async () => {
      const { email } = await makeUser({ name: 'tampered' });
      const token = await login(email);
      const res = await request(app)
        .get('/api/user-details')
        .set('Authorization', `Bearer ${token.slice(0, -3)}xyz`);
      expect(res.status).toBe(401);
    });

    it('exchanges a refresh token for a new access token', async () => {
      const { email } = await makeUser({ name: 'refresh' });
      const first = await request(app).post('/api/login').send({ email, password: PW });
      const res = await request(app)
        .post('/api/refresh-token')
        .send({ refreshToken: first.body.refreshToken });
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('accessToken');
    });
  });

  maybe('matching', () => {
    it('ranks a complementary peer above a same-role peer', async () => {
      const { email } = await makeUser({
        name: 'learner', subjects: ['Calculus'], status: 'Ready To Learn',
      });
      await makeUser({ name: 'teacher', subjects: ['Calculus'], status: 'Ready To Teach' });
      await makeUser({ name: 'peer', subjects: ['Calculus'], status: 'Ready To Learn' });

      const token = await login(email);
      const res = await request(app)
        .get('/api/suggestions').set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      const names = res.body.suggestedUsers.map((u) => u.name);
      expect(names).toContain('teacher');
      expect(names.indexOf('teacher')).toBeLessThan(
        names.indexOf('peer') === -1 ? Infinity : names.indexOf('peer')
      );
    });

    it('prompts a user who has declared no subjects', async () => {
      const { email } = await makeUser({ name: 'nosubjects', status: 'Ready To Learn' });
      const token = await login(email);
      const res = await request(app)
        .get('/api/suggestions').set('Authorization', `Bearer ${token}`);
      expect(res.status).toBe(200);
      expect(res.body.suggestedUsers).toHaveLength(0);
      expect(res.body.message).toBeTruthy();
    });

    it('never returns more than fifteen of each kind', async () => {
      const { email } = await makeUser({
        name: 'limits', subjects: ['Calculus'], status: 'Ready To Learn',
      });
      const token = await login(email);
      const res = await request(app)
        .get('/api/suggestions').set('Authorization', `Bearer ${token}`);
      expect(res.body.suggestedUsers.length).toBeLessThanOrEqual(15);
      expect(res.body.suggestedGroups.length).toBeLessThanOrEqual(15);
    });
  });

  maybe('verification', () => {
    it('refuses a quiz for a subject not on the profile', async () => {
      const { email } = await makeUser({ name: 'quizsubj', subjects: ['Calculus'] });
      const token = await login(email);
      const res = await request(app)
        .post('/api/verification/start-quiz')
        .set('Authorization', `Bearer ${token}`)
        .send({ subject: 'Astrophysics' });
      expect(res.status).toBe(400);
    });

    it('never transmits the correct answers', async () => {
      const { user, email } = await makeUser({ name: 'quizleak', subjects: ['Calculus'] });
      await VerificationModel.deleteMany({ userId: user._id });
      const token = await login(email);
      const res = await request(app)
        .post('/api/verification/start-quiz')
        .set('Authorization', `Bearer ${token}`)
        .send({ subject: 'Calculus' });

      expect(res.status).toBe(200);
      for (const q of res.body.questions) {
        expect(Object.keys(q).sort()).toEqual(['difficulty', 'options', 'question']);
      }
    });

    it('awards the badge at or above the pass mark', async () => {
      const { user, email } = await makeUser({ name: 'quizpass', subjects: ['Calculus'] });
      await VerificationModel.deleteMany({ userId: user._id });
      const token = await login(email);

      const start = await request(app)
        .post('/api/verification/start-quiz')
        .set('Authorization', `Bearer ${token}`)
        .send({ subject: 'Calculus' });

      const key = require('../../services/quizGenerator')
        .generateMockQuestions('Calculus').map((q) => q.correctAnswer);

      const submit = await request(app)
        .post('/api/verification/submit-quiz')
        .set('Authorization', `Bearer ${token}`)
        .send({ quizSessionId: start.body.quizSessionId, answers: key });

      expect(submit.status).toBe(200);
      expect(submit.body.result.passed).toBe(true);
      expect(submit.body.result.percentage).toBe(100);
    });
  });

  maybe('groups and privacy', () => {
    it('admits a member to a public group immediately', async () => {
      const { user: owner } = await makeUser({ name: 'gowner' });
      const { email } = await makeUser({ name: 'gjoiner' });
      const group = await GroupModel.create({
        groupName: 'IT open', subjects: ['Statistics'],
        groupAdmin: owner._id, members: [owner._id], privacy: 'public',
      });
      const token = await login(email);
      const res = await request(app)
        .post('/api/join-group').set('Authorization', `Bearer ${token}`)
        .send({ groupId: group._id });
      expect(res.status).toBe(200);
      expect(res.body.isPending).toBe(false);
    });

    it('holds a request for a private group', async () => {
      const { user: owner } = await makeUser({ name: 'powner' });
      const { email } = await makeUser({ name: 'pjoiner' });
      const group = await GroupModel.create({
        groupName: 'IT approval', subjects: ['Statistics'],
        groupAdmin: owner._id, members: [owner._id], privacy: 'private',
      });
      const token = await login(email);
      const res = await request(app)
        .post('/api/join-group').set('Authorization', `Bearer ${token}`)
        .send({ groupId: group._id });
      expect(res.body.isPending).toBe(true);
    });

    it('refuses a direct join to a secret group', async () => {
      const { user: owner } = await makeUser({ name: 'sowner' });
      const { email } = await makeUser({ name: 'sjoiner' });
      const group = await GroupModel.create({
        groupName: 'IT hidden', subjects: ['Statistics'],
        groupAdmin: owner._id, members: [owner._id], privacy: 'secret',
        inviteCode: 'itsecretinvite01',
      });
      const token = await login(email);
      const res = await request(app)
        .post('/api/join-group').set('Authorization', `Bearer ${token}`)
        .send({ groupId: group._id });
      expect(res.status).toBe(403);
    });
  });

  maybe('authorisation (known defects)', () => {
    /* These assert the current, incorrect behaviour so that fixing D-25 or
       D-26 makes a test fail loudly rather than passing unnoticed. Invert them
       as part of the fix. */

    it('currently lets any authenticated user delete any group (D-25)', async () => {
      const { user: owner } = await makeUser({ name: 'downer' });
      const { email } = await makeUser({ name: 'dstranger' });
      const group = await GroupModel.create({
        groupName: 'IT deletable', subjects: ['Statistics'],
        groupAdmin: owner._id, members: [owner._id], privacy: 'public',
      });
      const token = await login(email);
      const res = await request(app)
        .delete(`/api/deletegroup/${group._id}`)
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);   // should be 403 once D-25 is fixed
    });

    it('currently lets any authenticated user read any conversation (D-26)', async () => {
      const { user: a } = await makeUser({ name: 'chata' });
      const { user: b } = await makeUser({ name: 'chatb' });
      const { email } = await makeUser({ name: 'chatoutsider' });

      const chat = await ChatModel.create({ isGroup: false, participants: [a._id, b._id] });
      await MessageModel.create({
        chatId: chat._id, senderId: a._id, content: 'private', type: 'text',
      });

      const token = await login(email);
      const res = await request(app)
        .get(`/api/messages/${chat._id}`)
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);   // should be 403 once D-26 is fixed
      expect(res.body.length).toBeGreaterThan(0);
    });
  });

  maybe('administration', () => {
    it('rejects a user token on an administrator route', async () => {
      const { email } = await makeUser({ name: 'notadmin' });
      const token = await login(email);
      const res = await request(app)
        .get('/api/admin/dashboard/stats')
        .set('Authorization', `Bearer ${token}`);
      expect([401, 403]).toContain(res.status);
    });
  });
});
