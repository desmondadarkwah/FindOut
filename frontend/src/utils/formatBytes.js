/**
 * Human-readable file size.
 *
 * Shown next to every attachment: on a phone using mobile data, the size is
 * the thing that decides whether to tap a 14 MB slide deck now or later.
 */
export const formatBytes = (bytes) => {
  if (bytes === null || bytes === undefined || Number.isNaN(Number(bytes))) return '';
  const n = Number(bytes);
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(0)} KB`;
  return `${(n / (1024 * 1024)).toFixed(1)} MB`;
};

export default formatBytes;
