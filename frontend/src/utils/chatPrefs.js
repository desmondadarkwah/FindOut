/**
 * Per-conversation preferences that live on this device.
 *
 * Muting was a menu item that closed the menu and did nothing. There is no
 * field on the chat or the user for it on the server, so this keeps it in
 * localStorage: a real, working preference that takes effect immediately,
 * scoped to the browser it was set in rather than following the account
 * around. That limit is stated in the interface rather than glossed over.
 *
 * Moving it to the server later means replacing these four functions and
 * leaving every caller alone.
 */

const KEY = 'findout.mutedChats';

const read = () => {
  try {
    const raw = localStorage.getItem(KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    // Corrupt or unavailable storage must not take the chat down with it.
    return [];
  }
};

const write = (ids) => {
  try {
    localStorage.setItem(KEY, JSON.stringify([...new Set(ids)]));
  } catch {
    // Private browsing, or the quota is full. Muting is a preference, not a
    // guarantee — losing it is better than throwing inside a click handler.
  }
};

export const isMuted = (chatId) => Boolean(chatId) && read().includes(String(chatId));

export const muteChat = (chatId) => {
  if (!chatId) return;
  write([...read(), String(chatId)]);
};

export const unmuteChat = (chatId) => {
  if (!chatId) return;
  write(read().filter((id) => id !== String(chatId)));
};

/** @returns {boolean} the state after toggling. */
export const toggleMute = (chatId) => {
  if (isMuted(chatId)) {
    unmuteChat(chatId);
    return false;
  }
  muteChat(chatId);
  return true;
};

export const mutedChatIds = () => read();
