/**
 * Unit tests for the authentication middleware.
 *
 * This is the single point through which all protected access passes, so it is
 * worth covering in isolation with fabricated request and response objects
 * rather than only through the API.
 */

const jwt = require('jsonwebtoken');
const authMiddleware = require('../../middleware/authMiddleware');

const SECRET = 'test-secret-for-unit-tests';

/** Minimal Express request/response doubles. */
const makeReq = (authHeader) => ({
  header: (name) => (name === 'Authorization' ? authHeader : undefined),
});

const makeRes = () => {
  const res = { statusCode: null, body: null };
  res.status = (code) => { res.statusCode = code; return res; };
  res.json = (payload) => { res.body = payload; return res; };
  return res;
};

describe('authMiddleware', () => {
  const original = process.env.JWT_SECRET;
  beforeAll(() => { process.env.JWT_SECRET = SECRET; });
  afterAll(() => { process.env.JWT_SECRET = original; });

  it('rejects a request with no Authorization header', () => {
    const res = makeRes();
    const next = jest.fn();
    authMiddleware(makeReq(undefined), res, next);
    expect(res.statusCode).toBe(401);
    expect(next).not.toHaveBeenCalled();
  });

  it('rejects a malformed token', () => {
    const res = makeRes();
    const next = jest.fn();
    authMiddleware(makeReq('Bearer not-a-real-token'), res, next);
    expect(res.statusCode).toBe(401);
    expect(next).not.toHaveBeenCalled();
  });

  it('rejects a token signed with a different secret', () => {
    const forged = jwt.sign({ id: 'abc123' }, 'a-different-secret');
    const res = makeRes();
    const next = jest.fn();
    authMiddleware(makeReq(`Bearer ${forged}`), res, next);
    expect(res.statusCode).toBe(401);
    expect(next).not.toHaveBeenCalled();
  });

  it('rejects an expired token', () => {
    const expired = jwt.sign({ id: 'abc123' }, SECRET, { expiresIn: -10 });
    const res = makeRes();
    const next = jest.fn();
    authMiddleware(makeReq(`Bearer ${expired}`), res, next);
    expect(res.statusCode).toBe(401);
    expect(next).not.toHaveBeenCalled();
  });

  it('accepts a valid token and attaches the decoded identity', () => {
    const token = jwt.sign({ id: 'user-42' }, SECRET, { expiresIn: '15m' });
    const req = makeReq(`Bearer ${token}`);
    const res = makeRes();
    const next = jest.fn();

    authMiddleware(req, res, next);

    expect(next).toHaveBeenCalledTimes(1);
    expect(req.authenticatedUser).toMatchObject({ id: 'user-42' });
    expect(res.statusCode).toBeNull();
  });

  it('accepts a bare token without the Bearer prefix', () => {
    // `.replace('Bearer ', '')` leaves an unprefixed token untouched, so this
    // is the current behaviour. Recorded so a future tightening is visible.
    const token = jwt.sign({ id: 'user-7' }, SECRET, { expiresIn: '15m' });
    const req = makeReq(token);
    const next = jest.fn();
    authMiddleware(req, makeRes(), next);
    expect(next).toHaveBeenCalled();
  });

  it('does not leak the token in its error response', () => {
    const res = makeRes();
    authMiddleware(makeReq('Bearer sensitive-token-value'), res, jest.fn());
    expect(JSON.stringify(res.body)).not.toContain('sensitive-token-value');
  });
});
