/**
 * Sharing helpers for posts.
 *
 * `navigator.clipboard` only exists in a secure context. That covers https and
 * localhost, but not the LAN address the app is opened on when testing from a
 * phone (http://192.168.x.x:5173), where the property is simply undefined.
 * Calling `.writeText()` on it there throws a TypeError inside the click
 * handler and the user sees nothing happen at all, which is the failure this
 * module exists to prevent.
 */

/** Absolute, shareable URL for a post. */
export const postUrl = (postId) => `${window.location.origin}/post/${postId}`;

/**
 * Copies text, falling back to a hidden textarea and execCommand where the
 * async Clipboard API is unavailable. execCommand is deprecated but still
 * implemented everywhere, and it is the only option left in an insecure
 * context.
 *
 * @returns {Promise<boolean>} whether the text reached the clipboard.
 */
export async function copyToClipboard(text) {
  if (navigator.clipboard?.writeText) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch {
      // Permission denied, or the document was not focused. Fall through.
    }
  }

  try {
    const area = document.createElement('textarea');
    area.value = text;
    // Keep it off-screen rather than display:none — a hidden element cannot be
    // selected, and an unselected one cannot be copied.
    area.setAttribute('readonly', '');
    area.style.position = 'fixed';
    area.style.top = '-1000px';
    area.style.opacity = '0';
    document.body.appendChild(area);
    area.select();
    const ok = document.execCommand('copy');
    document.body.removeChild(area);
    return ok;
  } catch {
    return false;
  }
}

/**
 * Offers the native share sheet where the browser has one (phones, and Safari
 * on desktop), and copies the link everywhere else.
 *
 * @returns {Promise<'shared'|'copied'|'cancelled'|'failed'>} what happened, so
 *          the caller can tell the user something accurate.
 */
export async function sharePost({ postId, title, text }) {
  const url = postUrl(postId);

  if (navigator.share) {
    try {
      await navigator.share({ title, text, url });
      return 'shared';
    } catch (err) {
      // AbortError means the user dismissed the sheet. That is not a failure,
      // and silently copying the link behind their back would be surprising.
      if (err?.name === 'AbortError') return 'cancelled';
      // Anything else (no permission, unsupported payload) falls back to copy.
    }
  }

  return (await copyToClipboard(url)) ? 'copied' : 'failed';
}
