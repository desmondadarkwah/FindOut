import React from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight, GraduationCap, MessageSquare, Users,
  BadgeCheck, Newspaper,
} from 'lucide-react';
import { BrandMark } from '../components/BrandMark';

/**
 * About FindOut.
 *
 * The page is built around the one thing that makes this platform different
 * from a directory: it looks for people who are *complementary*, not people
 * who are similar. The scoring ledger in the middle is that idea made
 * literal — the real weights the recommender uses, and a worked example that
 * adds up.
 *
 * Those figures mirror WEIGHTS in backend/services/matchingService.js. If the
 * algorithm is retuned, they have to be changed here too; a page that
 * misdescribes the system is worse than one that says nothing.
 */

/* ── The signature: how a match is actually scored ─────────────────────── */

const LEDGER = [
  {
    label: 'Complementary intent',
    detail: 'One of you is Ready To Learn, the other Ready To Teach',
    points: 20,
    emphasis: true,
  },
  { label: 'Calculus', detail: 'Subject named identically by both students', points: 10 },
  { label: 'Statistics', detail: 'Subject named identically by both students', points: 10 },
  { label: 'Breadth', detail: 'Two subjects in common rather than one', points: 4 },
  { label: 'Available now', detail: 'They are online as you are looking', points: 3 },
];

const TOTAL = LEDGER.reduce((sum, row) => sum + row.points, 0);

const Ledger = () => (
  <figure className="overflow-hidden rounded-xl border border-edge bg-surface-raised shadow-elev-3">
    <figcaption className="border-b border-edge-subtle px-5 py-4 sm:px-7">
      <p className="font-ui text-[11px] font-bold uppercase tracking-[0.18em] text-primary-400">
        Worked example
      </p>
      <p className="mt-2 text-[14px] leading-relaxed text-content-secondary">
        <span className="font-semibold text-content-primary">Ama</span> is ready to learn
        Calculus and Statistics.{' '}
        <span className="font-semibold text-content-primary">Kwame</span> is ready to teach
        both, and he is online. This is what FindOut adds up before it puts him
        at the top of her list.
      </p>
    </figcaption>

    <dl className="px-5 py-2 sm:px-7">
      {LEDGER.map(({ label, detail, points, emphasis }) => (
        <div
          key={label}
          className="flex items-baseline gap-4 border-b border-edge-subtle py-3.5 last:border-0"
        >
          <div className="min-w-0 flex-1">
            <dt
              className={`text-[14px] ${
                emphasis
                  ? 'font-semibold text-primary-300'
                  : 'font-medium text-content-primary'
              }`}
            >
              {label}
            </dt>
            <dd className="mt-0.5 text-[13px] leading-snug text-content-muted">{detail}</dd>
          </div>
          <span
            className={`shrink-0 font-ui text-[15px] tabular-nums ${
              emphasis ? 'font-bold text-primary-300' : 'font-semibold text-content-secondary'
            }`}
          >
            +{points}
          </span>
        </div>
      ))}
    </dl>

    <div className="flex items-baseline justify-between gap-4 border-t border-edge bg-surface-overlay px-5 py-4 sm:px-7">
      <span className="font-display text-lg text-content-primary">Match score</span>
      <span className="font-ui text-2xl font-bold tabular-nums text-content-primary">
        {TOTAL}
      </span>
    </div>
  </figure>
);

/* ── Hero: the two halves that make a match ────────────────────────────── */

const IntentCard = ({ heading, line, tone }) => {
  const toned =
    tone === 'learn'
      ? 'border-primary-500/30 bg-primary-500/[0.07]'
      : 'border-success-400/25 bg-success-400/[0.06]';
  const dot = tone === 'learn' ? 'bg-primary-400' : 'bg-success-400';
  const text = tone === 'learn' ? 'text-primary-300' : 'text-success-400';

  return (
    <div className={`flex-1 rounded-xl border px-5 py-5 ${toned}`}>
      <p className={`flex items-center gap-2 font-ui text-[11px] font-bold uppercase tracking-[0.16em] ${text}`}>
        <span className={`h-1.5 w-1.5 rounded-full ${dot}`} />
        {heading}
      </p>
      <p className="mt-3 text-[14px] leading-relaxed text-content-secondary">{line}</p>
    </div>
  );
};

/* ── What the platform actually does ───────────────────────────────────── */

const CAPABILITIES = [
  {
    icon: BadgeCheck,
    title: 'Subject verification',
    body: 'Before you appear as someone ready to teach a subject, you answer a short set of questions on it. The badge shows you sat the quiz — it is not a qualification, and it is not marked by a person.',
  },
  {
    icon: MessageSquare,
    title: 'Messaging',
    body: 'Once two students agree to work together they can talk in the app — text, voice notes and images — rather than trading phone numbers with a stranger.',
  },
  {
    icon: Users,
    title: 'Study groups',
    body: 'Some subjects are better with four people than two. Groups can be open to anyone or ask you to request a place.',
  },
  {
    icon: Newspaper,
    title: 'A shared feed',
    body: 'Post a worked solution, ask the question you are stuck on, or mark someone else\'s answer as helpful. Reputation comes from being useful.',
  },
];

const About = () => (
  <div className="min-h-screen bg-surface-base font-ui antialiased">
    {/* Masthead */}
    <header className="border-b border-edge-subtle bg-surface-sunken">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-5">
        <Link
          to="/"
          className="inline-flex items-center gap-2 rounded text-[13px] font-medium text-content-muted transition-colors hover:text-content-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-400"
        >
          <BrandMark size={22} />
          FindOut
        </Link>
        <Link
          to="/register"
          className="rounded-lg bg-primary-500 px-4 py-2 text-[13px] font-semibold text-white transition-colors hover:bg-primary-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-300 focus-visible:ring-offset-2 focus-visible:ring-offset-surface-sunken"
        >
          Create an account
        </Link>
      </div>
    </header>

    <main className="mx-auto max-w-5xl px-6">
      {/* Hero — the thesis */}
      <section className="border-b border-edge-subtle py-16 sm:py-24">
        <p className="font-ui text-[11px] font-bold uppercase tracking-[0.18em] text-primary-400">
          University of Ghana, Legon
        </p>

        <h1 className="mt-5 max-w-3xl font-display text-4xl font-medium leading-[1.08] text-content-primary sm:text-6xl">
          Someone in your year already knows the thing you are stuck on.
          <span className="block italic text-content-secondary">
            You just have no way to find them.
          </span>
        </h1>

        <p className="mt-7 max-w-2xl text-[17px] leading-relaxed text-content-secondary">
          FindOut is a place for students to find each other by what they need and
          what they can offer. It does not look for people like you. It looks for
          the person whose position is the opposite of yours, in the subject you
          named.
        </p>

        {/* The two halves */}
        <div className="mt-12 flex flex-col items-stretch gap-3 sm:flex-row sm:items-center">
          <IntentCard
            tone="learn"
            heading="Ready to learn"
            line="You have named a subject you want help with, and you are open to being contacted about it."
          />
          <div
            aria-hidden="true"
            className="flex items-center justify-center px-1 text-content-muted"
          >
            <ArrowRight size={18} className="rotate-90 sm:rotate-0" />
          </div>
          <IntentCard
            tone="teach"
            heading="Ready to teach"
            line="You have named a subject you can explain, and answered a few questions on it."
          />
        </div>
      </section>

      {/* The problem */}
      <section className="grid gap-10 border-b border-edge-subtle py-16 md:grid-cols-[240px_1fr]">
        <h2 className="font-display text-2xl font-medium leading-snug text-content-primary">
          Why this is hard without help
        </h2>
        <div className="max-w-2xl space-y-5 text-[15px] leading-relaxed text-content-secondary">
          <p>
            On a campus of tens of thousands, the student who can explain
            integration by parts and the student who cannot are almost certainly
            in the same faculty. They may sit two rows apart. Neither knows the
            other exists, because nothing on campus is organised around that
            question.
          </p>
          <p>
            What exists instead is a noticeboard, a group chat with four hundred
            people in it, and asking around. All three are broadcast: you shout,
            and hope the right person is listening at the right moment. Most of
            the time nobody answers, and the student who would gladly have helped
            never saw the message.
          </p>
          <p>
            The people are there. The matching is what is missing.
          </p>
        </div>
      </section>

      {/* Signature — the ledger */}
      <section className="grid gap-10 border-b border-edge-subtle py-16 md:grid-cols-[240px_1fr]">
        <div>
          <h2 className="font-display text-2xl font-medium leading-snug text-content-primary">
            How a match is scored
          </h2>
          <p className="mt-4 text-[14px] leading-relaxed text-content-muted">
            Every suggestion you see has a number behind it. This is that
            number, with nothing hidden.
          </p>
        </div>

        <div className="max-w-2xl space-y-6">
          <Ledger />

          <div className="space-y-4 text-[15px] leading-relaxed text-content-secondary">
            <p>
              Complementary intent is weighted more heavily than anything else
              on purpose. Two students who both want to learn Calculus have a
              great deal in common and nothing to offer each other; the
              algorithm is built so that agreement never outranks fit.
            </p>
            <p>
              Subjects rarely match on the first try — one student writes
              &ldquo;Maths&rdquo;, another writes &ldquo;Mathematics&rdquo;, a
              third writes &ldquo;maths 101&rdquo;. FindOut compares them four
              ways, from an exact match down to a close spelling, and awards
              fewer points the looser the match. You are shown the fifteen
              strongest results rather than everyone who scored above zero.
            </p>
          </div>
        </div>
      </section>

      {/* What you can do */}
      <section className="grid gap-10 border-b border-edge-subtle py-16 md:grid-cols-[240px_1fr]">
        <h2 className="font-display text-2xl font-medium leading-snug text-content-primary">
          What you can do here
        </h2>
        <div className="grid max-w-2xl gap-px overflow-hidden rounded-xl border border-edge-subtle bg-edge-subtle sm:grid-cols-2">
          {CAPABILITIES.map(({ icon: Icon, title, body }) => (
            <div key={title} className="bg-surface-raised p-5">
              <Icon size={18} className="text-primary-400" />
              <h3 className="mt-3 font-ui text-[14px] font-semibold text-content-primary">
                {title}
              </h3>
              <p className="mt-2 text-[13px] leading-relaxed text-content-secondary">
                {body}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Colophon */}
      <section className="grid gap-10 py-16 md:grid-cols-[240px_1fr]">
        <h2 className="font-display text-2xl font-medium leading-snug text-content-primary">
          Where it comes from
        </h2>
        <div className="max-w-2xl space-y-5 text-[15px] leading-relaxed text-content-secondary">
          <p>
            FindOut was built at the{' '}
            <span className="text-content-primary">
              Department of Computer Science, University of Ghana, Legon
            </span>
            , as a final-year project. The idea it tests comes from research on
            reciprocal recommenders — systems where a suggestion only works if
            it suits both people, which is true of study partners and is not
            true of films or shopping.
          </p>
          <p>
            It is a young platform, run by students, and it is honest about
            that. Verification badges say a quiz was passed, not that a person
            is qualified. Nothing here replaces your department, your lecturer
            or your tutorials.
          </p>
          <div className="flex flex-wrap gap-3 pt-3">
            <Link
              to="/register"
              className="inline-flex items-center gap-2 rounded-lg bg-primary-500 px-5 py-2.5 text-[14px] font-semibold text-white transition-colors hover:bg-primary-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-300 focus-visible:ring-offset-2 focus-visible:ring-offset-surface-base"
            >
              <GraduationCap size={16} />
              Create an account
            </Link>
            <Link
              to="/login"
              className="inline-flex items-center rounded-lg border border-edge px-5 py-2.5 text-[14px] font-semibold text-content-secondary transition-colors hover:border-edge-strong hover:text-content-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-400"
            >
              Log in
            </Link>
          </div>
        </div>
      </section>
    </main>

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

export default About;
