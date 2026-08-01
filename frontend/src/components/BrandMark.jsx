import React, { useId } from 'react';

/**
 * The FindOut mark.
 *
 * The O in FindOut, drawn as two students meeting: an indigo arc for the one
 * ready to learn, an emerald arc for the one ready to teach, facing each other
 * across two gaps, with the match as a dot between them. The same geometry is
 * in public/favicon.svg — change one and change the other.
 *
 * Rendered without the tile background, since in the app it always sits on a
 * dark surface. `tile` adds it back for the rare light context.
 *
 * Gradient ids are generated per instance: two marks on one page with the same
 * hard-coded id would make the second one reference the first one's defs, and
 * in some browsers render as nothing at all.
 */
export const BrandMark = ({ size = 28, tile = false, className = '', title }) => {
  const id = useId().replace(/:/g, '');

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      className={className}
      role={title ? 'img' : 'presentation'}
      aria-label={title}
      aria-hidden={title ? undefined : 'true'}
      focusable="false"
    >
      {title && <title>{title}</title>}
      <defs>
        <linearGradient id={`${id}-learn`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#A5A8FD" />
          <stop offset="1" stopColor="#6366F1" />
        </linearGradient>
        <linearGradient id={`${id}-teach`} x1="1" y1="1" x2="0" y2="0">
          <stop offset="0" stopColor="#34D399" />
          <stop offset="1" stopColor="#10B981" />
        </linearGradient>
      </defs>

      {tile && <rect width="32" height="32" rx="7.5" fill="#16161F" />}

      <g transform="rotate(-45 16 16)" fill="none" strokeWidth="5" strokeLinecap="round">
        <path d="M6.6031 12.5798 A10 10 0 0 1 25.3969 12.5798" stroke={`url(#${id}-learn)`} />
        <path d="M25.3969 19.4202 A10 10 0 0 1 6.6031 19.4202" stroke={`url(#${id}-teach)`} />
      </g>

      <circle cx="16" cy="16" r="2.5" fill="#F4F4FA" />
    </svg>
  );
};

/**
 * Mark plus wordmark. `to` makes it a link; without it the lockup is inert,
 * which is what you want when it already sits inside a link or a heading.
 */
export const BrandLockup = ({ size = 28, className = '', textClassName = '' }) => (
  <span className={`inline-flex items-center gap-2.5 ${className}`}>
    <BrandMark size={size} />
    <span className={`font-semibold tracking-tight ${textClassName}`}>FindOut</span>
  </span>
);

export default BrandMark;
