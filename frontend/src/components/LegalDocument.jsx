import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Link2 } from 'lucide-react';
import { BrandMark } from './BrandMark';

/**
 * Shared shell for the Terms and the Privacy Notice.
 *
 * Legal text is read in two ways: start to finish once, and then jumped into
 * repeatedly to check a single clause. The persistent index and the numbered,
 * linkable clauses serve the second reading — the numbers are here because a
 * clause needs a stable reference ("as set out in 7.2"), not for decoration.
 */

/** A numbered clause. `id` becomes the anchor, so it must stay stable. */
export const Clause = ({ number, id, title, children }) => (
  <section id={id} className="scroll-mt-28 pt-10 first:pt-0">
    <h2 className="group flex items-baseline gap-3 font-display text-2xl font-medium text-content-primary">
      <span className="shrink-0 font-ui text-sm font-semibold tabular-nums text-primary-400">
        {number}
      </span>
      <span>{title}</span>
      <a
        href={`#${id}`}
        aria-label={`Link to section ${number}`}
        className="opacity-0 transition-opacity focus-visible:opacity-100 group-hover:opacity-100"
      >
        <Link2 size={15} className="text-content-muted hover:text-primary-400" />
      </a>
    </h2>
    <div className="mt-4 space-y-4 pl-0 text-[15px] leading-relaxed text-content-secondary sm:pl-10">
      {children}
    </div>
  </section>
);

/**
 * A plain-language restatement beside the formal text. Used where a clause
 * carries a consequence a reader would want to be certain they understood.
 */
export const InPlainTerms = ({ children }) => (
  <p className="border-l-2 border-primary-500/40 bg-primary-500/[0.06] py-3 pl-4 pr-4 text-[14px] text-content-secondary">
    <span className="mr-2 font-ui text-[11px] font-bold uppercase tracking-widest text-primary-300">
      In plain terms
    </span>
    {children}
  </p>
);

/** Definition-style list, for "what we collect" style content. */
export const Rows = ({ items }) => (
  <dl className="divide-y divide-edge-subtle border-y border-edge-subtle">
    {items.map(({ term, detail }) => (
      <div key={term} className="grid gap-1 py-3 sm:grid-cols-[220px_1fr] sm:gap-6">
        <dt className="font-ui text-[13px] font-semibold text-content-primary">{term}</dt>
        <dd className="text-[14px] text-content-secondary">{detail}</dd>
      </div>
    ))}
  </dl>
);

const LegalDocument = ({ eyebrow, title, standfirst, updated, effective, sections, children }) => {
  const [active, setActive] = useState(sections[0]?.id);

  // Highlight the clause currently in view. rootMargin pins the trigger near
  // the top of the viewport so the index tracks reading position, not the
  // section that merely happens to be visible at the bottom.
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter(e => e.isIntersecting);
        if (visible.length) setActive(visible[0].target.id);
      },
      { rootMargin: '-96px 0px -70% 0px', threshold: 0 }
    );
    sections.forEach(s => {
      const el = document.getElementById(s.id);
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, [sections]);

  return (
    <div className="min-h-screen bg-surface-base font-ui antialiased">
      {/* Masthead */}
      <header className="border-b border-edge-subtle bg-surface-sunken">
        <div className="mx-auto max-w-5xl px-6 py-5">
          <Link
            to="/"
            className="inline-flex items-center gap-2 rounded text-[13px] font-medium text-content-muted transition-colors hover:text-content-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-400"
          >
            <BrandMark size={22} />
            FindOut
          </Link>
        </div>
      </header>

      <div className="mx-auto max-w-5xl px-6">
        {/* Document header */}
        <div className="border-b border-edge-subtle py-14">
          <p className="font-ui text-[11px] font-bold uppercase tracking-[0.18em] text-primary-400">
            {eyebrow}
          </p>
          <h1 className="mt-4 max-w-3xl font-display text-4xl font-medium leading-[1.1] text-content-primary sm:text-5xl">
            {title}
          </h1>
          <p className="mt-5 max-w-2xl text-[16px] leading-relaxed text-content-secondary">
            {standfirst}
          </p>
          <dl className="mt-8 flex flex-wrap gap-x-10 gap-y-3 text-[13px]">
            <div>
              <dt className="text-content-muted">Version in force from</dt>
              <dd className="mt-0.5 font-medium tabular-nums text-content-primary">{effective}</dd>
            </div>
            <div>
              <dt className="text-content-muted">Last updated</dt>
              <dd className="mt-0.5 font-medium tabular-nums text-content-primary">{updated}</dd>
            </div>
          </dl>
        </div>

        <div className="gap-14 py-12 lg:grid lg:grid-cols-[220px_1fr]">
          {/* Index */}
          <nav aria-label="Sections" className="mb-12 lg:mb-0">
            <div className="lg:sticky lg:top-10">
              <p className="mb-4 font-ui text-[11px] font-bold uppercase tracking-[0.18em] text-content-muted">
                Contents
              </p>
              <ol className="space-y-1">
                {sections.map((s, i) => (
                  <li key={s.id}>
                    <a
                      href={`#${s.id}`}
                      aria-current={active === s.id ? 'true' : undefined}
                      className={`flex gap-3 rounded py-1.5 text-[13px] leading-snug transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-400 ${
                        active === s.id
                          ? 'text-primary-300'
                          : 'text-content-muted hover:text-content-secondary'
                      }`}
                    >
                      <span className="shrink-0 tabular-nums opacity-60">{i + 1}</span>
                      <span>{s.title}</span>
                    </a>
                  </li>
                ))}
              </ol>
            </div>
          </nav>

          {/* Body */}
          <main className="max-w-2xl divide-y divide-edge-subtle [&>section]:pb-10">
            {children}
          </main>
        </div>
      </div>

      <footer className="border-t border-edge-subtle bg-surface-sunken">
        <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-4 px-6 py-8 text-[13px] text-content-muted">
          <p className="inline-flex items-center gap-2.5">
            <BrandMark size={18} />
            FindOut · University of Ghana, Legon
          </p>
          <nav className="flex gap-6">
            <Link to="/about" className="transition-colors hover:text-content-primary">About</Link>
            <Link to="/terms" className="transition-colors hover:text-content-primary">Terms</Link>
            <Link to="/privacy" className="transition-colors hover:text-content-primary">Privacy</Link>
          </nav>
        </div>
      </footer>
    </div>
  );
};

export default LegalDocument;
