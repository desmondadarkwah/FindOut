/**
 * Tests for the sharing helpers.
 *
 * These exist because the original implementation called
 * `navigator.clipboard.writeText(...).then(...)` unguarded. Wherever
 * `navigator.clipboard` is absent — any non-secure context, such as opening
 * the app on a phone over the LAN — that throws inside the click handler and
 * the user sees nothing happen at all. The insecure-context case below is the
 * one that was broken in production.
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { postUrl, copyToClipboard, sharePost } from './share';

const originalClipboard = navigator.clipboard;
const originalShare = navigator.share;

/** Replace navigator.clipboard, which is a read-only accessor in jsdom. */
const setClipboard = (value) =>
  Object.defineProperty(navigator, 'clipboard', {
    value, configurable: true, writable: true,
  });

const setShare = (value) =>
  Object.defineProperty(navigator, 'share', {
    value, configurable: true, writable: true,
  });

describe('postUrl', () => {
  it('builds an absolute URL from the current origin', () => {
    expect(postUrl('abc123')).toBe(`${window.location.origin}/post/abc123`);
  });

  it('points at a path the router serves, not a bare id', () => {
    // Regression guard: the link used to be generated for /post/:id while no
    // such route existed, so every shared link opened the 404 page.
    expect(postUrl('abc123')).toContain('/post/');
  });
});

describe('copyToClipboard', () => {
  beforeEach(() => {
    document.execCommand = vi.fn(() => true);
  });

  afterEach(() => {
    setClipboard(originalClipboard);
    setShare(originalShare);
  });

  it('uses the Clipboard API when it is available', async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    setClipboard({ writeText });

    await expect(copyToClipboard('hello')).resolves.toBe(true);
    expect(writeText).toHaveBeenCalledWith('hello');
    expect(document.execCommand).not.toHaveBeenCalled();
  });

  it('falls back to execCommand in an insecure context', async () => {
    // navigator.clipboard is undefined over plain http on a LAN address.
    setClipboard(undefined);

    await expect(copyToClipboard('hello')).resolves.toBe(true);
    expect(document.execCommand).toHaveBeenCalledWith('copy');
  });

  it('falls back when the Clipboard API rejects', async () => {
    // Thrown when the document is not focused, among other reasons.
    setClipboard({ writeText: vi.fn().mockRejectedValue(new Error('denied')) });

    await expect(copyToClipboard('hello')).resolves.toBe(true);
    expect(document.execCommand).toHaveBeenCalledWith('copy');
  });

  it('reports failure rather than throwing when nothing works', async () => {
    setClipboard(undefined);
    document.execCommand = vi.fn(() => false);

    await expect(copyToClipboard('hello')).resolves.toBe(false);
  });

  it('removes the fallback textarea it created', async () => {
    setClipboard(undefined);
    await copyToClipboard('hello');
    expect(document.querySelector('textarea')).toBeNull();
  });
});

describe('sharePost', () => {
  afterEach(() => {
    setClipboard(originalClipboard);
    setShare(originalShare);
  });

  it('uses the native share sheet when the browser has one', async () => {
    const share = vi.fn().mockResolvedValue(undefined);
    setShare(share);

    await expect(sharePost({ postId: 'p1', title: 'T', text: 'X' }))
      .resolves.toBe('shared');
    expect(share).toHaveBeenCalledWith({
      title: 'T', text: 'X', url: postUrl('p1'),
    });
  });

  it('treats a dismissed share sheet as cancelled, not as a failure', async () => {
    const abort = Object.assign(new Error('dismissed'), { name: 'AbortError' });
    setShare(vi.fn().mockRejectedValue(abort));
    const writeText = vi.fn().mockResolvedValue(undefined);
    setClipboard({ writeText });

    await expect(sharePost({ postId: 'p1' })).resolves.toBe('cancelled');
    // Copying behind the user's back after they dismissed the sheet would be
    // surprising, so the fallback must not run here.
    expect(writeText).not.toHaveBeenCalled();
  });

  it('copies the link when there is no share sheet', async () => {
    setShare(undefined);
    const writeText = vi.fn().mockResolvedValue(undefined);
    setClipboard({ writeText });

    await expect(sharePost({ postId: 'p1' })).resolves.toBe('copied');
    expect(writeText).toHaveBeenCalledWith(postUrl('p1'));
  });

  it('falls back to copying when the share sheet errors for another reason', async () => {
    setShare(vi.fn().mockRejectedValue(new Error('not allowed')));
    const writeText = vi.fn().mockResolvedValue(undefined);
    setClipboard({ writeText });

    await expect(sharePost({ postId: 'p1' })).resolves.toBe('copied');
    expect(writeText).toHaveBeenCalledWith(postUrl('p1'));
  });

  it('reports failure when neither path works', async () => {
    setShare(undefined);
    setClipboard(undefined);
    document.execCommand = vi.fn(() => false);

    await expect(sharePost({ postId: 'p1' })).resolves.toBe('failed');
  });
});
