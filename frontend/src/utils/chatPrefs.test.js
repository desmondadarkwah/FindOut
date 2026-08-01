/**
 * Tests for per-conversation preferences.
 *
 * Muting was a menu item that closed the menu. The value of this store is that
 * the setting survives a reload, so that is what is asserted — along with the
 * behaviour that matters when storage is unavailable, because a preference
 * failing to save must never throw inside a click handler.
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { isMuted, muteChat, unmuteChat, toggleMute, mutedChatIds } from './chatPrefs';

describe('chatPrefs', () => {
  beforeEach(() => localStorage.clear());

  it('reports nothing muted to begin with', () => {
    expect(isMuted('chat-1')).toBe(false);
    expect(mutedChatIds()).toEqual([]);
  });

  it('mutes and unmutes a conversation', () => {
    muteChat('chat-1');
    expect(isMuted('chat-1')).toBe(true);

    unmuteChat('chat-1');
    expect(isMuted('chat-1')).toBe(false);
  });

  it('keeps conversations independent', () => {
    muteChat('chat-1');
    expect(isMuted('chat-2')).toBe(false);
  });

  it('survives a reload', () => {
    muteChat('chat-1');
    // A fresh read is what the next page load performs.
    expect(JSON.parse(localStorage.getItem('findout.mutedChats'))).toContain('chat-1');
    expect(isMuted('chat-1')).toBe(true);
  });

  it('returns the state it toggled to', () => {
    expect(toggleMute('chat-1')).toBe(true);
    expect(isMuted('chat-1')).toBe(true);
    expect(toggleMute('chat-1')).toBe(false);
    expect(isMuted('chat-1')).toBe(false);
  });

  it('does not record the same conversation twice', () => {
    muteChat('chat-1');
    muteChat('chat-1');
    expect(mutedChatIds()).toEqual(['chat-1']);
  });

  it('compares ids as strings, so an ObjectId still matches', () => {
    muteChat({ toString: () => 'chat-1' });
    expect(isMuted('chat-1')).toBe(true);
  });

  it('ignores a missing chat id rather than muting undefined', () => {
    muteChat(undefined);
    expect(mutedChatIds()).toEqual([]);
    expect(isMuted(undefined)).toBe(false);
  });

  it('recovers from corrupt storage instead of throwing', () => {
    localStorage.setItem('findout.mutedChats', 'not json');
    expect(isMuted('chat-1')).toBe(false);
    expect(() => muteChat('chat-1')).not.toThrow();
  });

  it('does not throw when storage refuses to write', () => {
    // Private browsing raises here; muting is a preference, not a guarantee.
    const setItem = vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new DOMException('QuotaExceededError');
    });
    expect(() => muteChat('chat-1')).not.toThrow();
    setItem.mockRestore();
  });
});
