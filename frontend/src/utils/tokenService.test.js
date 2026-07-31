/**
 * Tests for the token store.
 *
 * Small surface, but every authenticated request depends on it, and the
 * failure mode of a bug here is a user who cannot stay logged in.
 */

import { describe, it, expect, beforeEach } from 'vitest';
import {
  getAccessToken,
  getRefreshToken,
  setTokens,
  clearTokens,
} from './tokenService';

describe('tokenService', () => {
  beforeEach(() => localStorage.clear());

  it('returns null when nothing is stored', () => {
    expect(getAccessToken()).toBeNull();
    expect(getRefreshToken()).toBeNull();
  });

  it('stores and reads back both tokens', () => {
    setTokens({ accessToken: 'access-1', refreshToken: 'refresh-1' });
    expect(getAccessToken()).toBe('access-1');
    expect(getRefreshToken()).toBe('refresh-1');
  });

  it('updates only the token supplied', () => {
    setTokens({ accessToken: 'access-1', refreshToken: 'refresh-1' });
    // The refresh endpoint returns a new access token and no refresh token.
    setTokens({ accessToken: 'access-2' });
    expect(getAccessToken()).toBe('access-2');
    expect(getRefreshToken()).toBe('refresh-1');
  });

  it('ignores an empty payload rather than clearing what is stored', () => {
    setTokens({ accessToken: 'access-1', refreshToken: 'refresh-1' });
    setTokens({});
    expect(getAccessToken()).toBe('access-1');
    expect(getRefreshToken()).toBe('refresh-1');
  });

  it('removes both tokens on clear', () => {
    setTokens({ accessToken: 'access-1', refreshToken: 'refresh-1' });
    clearTokens();
    expect(getAccessToken()).toBeNull();
    expect(getRefreshToken()).toBeNull();
  });

  it('is safe to clear when nothing is stored', () => {
    expect(() => clearTokens()).not.toThrow();
  });

  it('leaves unrelated keys alone', () => {
    localStorage.setItem('adminToken', 'admin-1');
    setTokens({ accessToken: 'access-1', refreshToken: 'refresh-1' });
    clearTokens();
    // The administrator session is separate and must survive a user logout.
    expect(localStorage.getItem('adminToken')).toBe('admin-1');
  });
});
