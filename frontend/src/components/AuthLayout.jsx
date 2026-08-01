import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Eye, EyeOff, AlertCircle, CheckCircle2 } from 'lucide-react';
import { BrandMark } from './BrandMark';

/**
 * Shared shell for the sign-in and sign-up screens.
 *
 * These are the first two things anyone sees, and they were the least
 * considered screens in the app: no labels, placeholder text standing in for
 * them, and a Google button on both that was never wired to anything. The
 * layout is deliberately quiet — one brand moment at the top, then the form —
 * because the job of this page is to be got through, not admired.
 */
const AuthLayout = ({ title, subtitle, children, footer }) => (
  <div className="flex min-h-screen flex-col items-center justify-center bg-surface-base px-5 py-12 font-ui antialiased">
    <div className="w-full max-w-[400px]">
      <Link
        to="/about"
        className="mx-auto mb-8 flex w-fit items-center gap-2.5 rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-400"
      >
        <BrandMark size={30} title="FindOut" />
        <span className="text-lg font-semibold tracking-tight text-content-primary">
          FindOut
        </span>
      </Link>

      <div className="rounded-2xl border border-edge-subtle bg-surface-raised p-7 shadow-elev-3 sm:p-8">
        <h1 className="font-display text-[28px] font-medium leading-tight text-content-primary">
          {title}
        </h1>
        {subtitle && (
          <p className="mt-2 text-[14px] leading-relaxed text-content-secondary">
            {subtitle}
          </p>
        )}
        <div className="mt-7">{children}</div>
      </div>

      {footer && (
        <div className="mt-6 text-center text-[14px] text-content-secondary">
          {footer}
        </div>
      )}

      <nav className="mt-10 flex justify-center gap-6 text-[12px] text-content-muted">
        <Link to="/about" className="transition-colors hover:text-content-secondary">About</Link>
        <Link to="/terms" className="transition-colors hover:text-content-secondary">Terms</Link>
        <Link to="/privacy" className="transition-colors hover:text-content-secondary">Privacy</Link>
      </nav>
    </div>
  </div>
);

/**
 * A labelled input. The label is a real <label>, not a placeholder: placeholder
 * text disappears the moment someone starts typing, which is exactly when they
 * are most likely to need it.
 */
export const Field = ({ id, label, hint, type = 'text', ...props }) => {
  const [revealed, setRevealed] = useState(false);
  const isPassword = type === 'password';

  return (
    <div>
      <label
        htmlFor={id}
        className="mb-1.5 block text-[13px] font-medium text-content-secondary"
      >
        {label}
      </label>
      <div className="relative">
        <input
          id={id}
          type={isPassword && revealed ? 'text' : type}
          className={`w-full rounded-lg border border-edge bg-surface-input px-3.5 py-2.5 text-[14px] text-content-primary
                      placeholder:text-content-muted/70
                      transition-colors focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/30
                      ${isPassword ? 'pr-11' : ''}`}
          {...props}
        />
        {isPassword && (
          <button
            type="button"
            onClick={() => setRevealed(v => !v)}
            aria-label={revealed ? 'Hide password' : 'Show password'}
            className="absolute inset-y-0 right-0 flex w-11 items-center justify-center rounded-r-lg text-content-muted transition-colors hover:text-content-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-400"
          >
            {revealed ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        )}
      </div>
      {hint && <p className="mt-1.5 text-[12px] text-content-muted">{hint}</p>}
    </div>
  );
};

/**
 * Result of the submission. Given role="alert" so it is announced rather than
 * only appearing — on the old screens a failed sign-in changed a line of text
 * a screen reader had no reason to revisit.
 */
export const Notice = ({ tone, children }) => {
  if (!children) return null;
  const ok = tone === 'success';
  const Icon = ok ? CheckCircle2 : AlertCircle;

  return (
    <div
      role="alert"
      className={`mb-5 flex items-start gap-2.5 rounded-lg border px-3.5 py-3 text-[13px] leading-relaxed ${
        ok
          ? 'border-success-400/30 bg-success-400/10 text-success-400'
          : 'border-danger-400/30 bg-danger-400/10 text-danger-400'
      }`}
    >
      <Icon size={16} className="mt-px shrink-0" />
      <span>{children}</span>
    </div>
  );
};

/** The one primary action on the page. */
export const SubmitButton = ({ loading, children, loadingLabel = 'Working…' }) => (
  <button
    type="submit"
    disabled={loading}
    className="w-full rounded-lg bg-primary-500 px-4 py-2.5 text-[14px] font-semibold text-white
               transition-colors hover:bg-primary-600
               focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-300 focus-visible:ring-offset-2 focus-visible:ring-offset-surface-raised
               disabled:cursor-not-allowed disabled:opacity-60"
  >
    {loading ? loadingLabel : children}
  </button>
);

export default AuthLayout;
