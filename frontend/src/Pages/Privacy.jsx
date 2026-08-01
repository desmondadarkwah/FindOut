import React from 'react';
import { Link } from 'react-router-dom';
import LegalDocument, { Clause, InPlainTerms, Rows } from '../components/LegalDocument';

/**
 * Privacy Notice.
 *
 * Every item in section 2 corresponds to a field that genuinely exists in the
 * Mongoose schemas — UserModel, MessageModel, PostModel, GroupModel,
 * VerificationModel — or to a file the server actually writes. A privacy
 * notice that lists categories the system does not hold, or omits ones it
 * does, is worse than none: it is a false statement to the reader and to a
 * regulator.
 *
 * Section 7 deliberately does not promise more security than the platform
 * currently delivers.
 */

const SECTIONS = [
  { id: 'who',        title: 'Who this notice is from' },
  { id: 'collect',    title: 'What we hold about you' },
  { id: 'why',        title: 'Why we hold it' },
  { id: 'visible',    title: 'Who can see what' },
  { id: 'processors', title: 'Who else is involved' },
  { id: 'retention',  title: 'How long we keep it' },
  { id: 'security',   title: 'How it is protected' },
  { id: 'rights',     title: 'What you can ask us to do' },
  { id: 'device',     title: 'Stored on your device' },
  { id: 'children',   title: 'Younger users' },
  { id: 'changes',    title: 'Changes to this notice' },
  { id: 'contact',    title: 'Contact' },
];

const COLLECTED = [
  {
    term: 'Account details',
    detail: 'Your name, email address and a scrambled form of your password. We never store the password itself and cannot read it.',
  },
  {
    term: 'Profile picture',
    detail: 'If you upload one, the image file is stored on the FindOut server.',
  },
  {
    term: 'Learning profile',
    detail: 'The subjects you list, whether you are ready to learn, ready to teach or unavailable, the free time you enter, and your reputation score.',
  },
  {
    term: 'Verification results',
    detail: 'Which subjects you have taken the quiz for, whether you passed, when, and the score for each attempt.',
  },
  {
    term: 'Messages',
    detail: 'The text, voice notes and images you send, who they were sent to, and when they were sent, delivered and read.',
  },
  {
    term: 'Groups',
    detail: 'The groups you belong to, run or have asked to join, and what you post inside them.',
  },
  {
    term: 'Posts and reactions',
    detail: 'Your posts and their images, your comments and replies, the posts you mark as helpful, and view counts.',
  },
  {
    term: 'Presence',
    detail: 'Whether you are currently online and when you were last seen, so other students know if it is worth messaging you now.',
  },
  {
    term: 'Reports',
    detail: 'If you report a post, the report is recorded along with your account.',
  },
];

const Privacy = () => (
  <LegalDocument
    eyebrow="Privacy Notice"
    title="What FindOut knows about you"
    standfirst="This notice lists exactly what the platform stores, why, who can see it, and what you can tell us to do with it. It describes the system as it is actually built."
    effective="1 August 2026"
    updated="1 August 2026"
    sections={SECTIONS}
  >
    <Clause number="1" id="who" title="Who this notice is from">
      <p>
        FindOut is a peer-learning platform built at the Department of Computer
        Science, University of Ghana, Legon. For the purposes of the Data
        Protection Act, 2012 (Act 843), the FindOut project team is the data
        controller for the information described here.
      </p>
      <p>
        This notice covers the FindOut web application. It does not cover
        anything that happens after two students leave the platform to meet or
        message each other elsewhere.
      </p>
    </Clause>

    <Clause number="2" id="collect" title="What we hold about you">
      <p>Everything below is information you give us or generate by using the platform.</p>
      <Rows items={COLLECTED} />
      <p>
        We do not ask for your student identification number, your programme,
        your date of birth, your phone number or your address, and there is
        nowhere in the application to enter them. We do not track you across
        other websites, and we run no advertising.
      </p>
    </Clause>

    <Clause number="3" id="why" title="Why we hold it">
      <ul className="list-disc space-y-2 pl-5 marker:text-content-muted">
        <li><span className="text-content-primary">To match you.</span> Your subjects and your status are the inputs to the suggestions you see, and to the suggestions other students see about you.</li>
        <li><span className="text-content-primary">To let you talk.</span> Messages have to be stored to be delivered and re-read.</li>
        <li><span className="text-content-primary">To show who has been verified.</span> Quiz results decide whether a subject on your profile carries a badge.</li>
        <li><span className="text-content-primary">To keep the place usable.</span> Reports and administrator review depend on knowing who posted what.</li>
        <li><span className="text-content-primary">To confirm your email is real.</span> We send a verification link when you register.</li>
      </ul>
      <p>
        We rely on your consent, given when you create an account and when you
        choose what to put on your profile, and on our legitimate interest in
        running a safe platform. You can withdraw consent by deleting your
        account.
      </p>
    </Clause>

    <Clause number="4" id="visible" title="Who can see what">
      <Rows
        items={[
          { term: 'Other students', detail: 'Your name, profile picture, subjects, status, verified badges, reputation, whether you are online, and anything you post publicly.' },
          { term: 'Students you message', detail: 'The contents of your conversation with them.' },
          { term: 'Members of your groups', detail: 'What you post in those groups.' },
          { term: 'Administrators', detail: 'Account records, posts and reports, for moderation. Administrators do not have a feature for reading private conversations.' },
          { term: 'Nobody else', detail: 'We do not sell your information, and we do not share it for marketing.' },
        ]}
      />
      <InPlainTerms>
        Your email address and your password are never shown to other students.
        Almost everything else on your profile is meant to be seen — that is how
        another student decides whether to contact you.
      </InPlainTerms>
    </Clause>

    <Clause number="5" id="processors" title="Who else is involved">
      <p>Running the platform means a small number of other services handle data on our behalf:</p>
      <Rows
        items={[
          { term: 'MongoDB Atlas', detail: 'Hosts the database in which all of the above is stored.' },
          { term: 'Our email provider', detail: 'Sends verification and account emails, and therefore handles your email address.' },
          { term: 'Google Fonts', detail: 'Serves the typefaces used on this page. Your browser requests them directly from Google, which means Google receives your IP address.' },
        ]}
      />
      <p>
        We may also disclose information where the law requires it, or where it
        is necessary to protect someone&rsquo;s safety.
      </p>
    </Clause>

    <Clause number="6" id="retention" title="How long we keep it">
      <p>
        Your account and its contents are kept for as long as your account
        exists. Delete a post, and it goes; delete your account, and we remove
        your profile, your posts and your uploaded files.
      </p>
      <p>
        Two things survive that deletion. Messages you sent to another student
        remain in that student&rsquo;s conversation, because the conversation is
        theirs as much as yours. And copies may persist in routine backups for a
        limited period before being overwritten.
      </p>
    </Clause>

    <Clause number="7" id="security" title="How it is protected">
      <p>
        Passwords are stored only as a bcrypt hash, so they cannot be read back
        even by us. Sessions use short-lived access tokens with separate refresh
        tokens. Access to the administrative interface is restricted to
        administrator accounts. In production the site is served over HTTPS.
      </p>
      <InPlainTerms>
        FindOut is a student-built platform, not a bank. We have taken the
        measures described above, and we are not going to tell you it is
        impossible for anything to go wrong. Please do not put anything on this
        platform that would seriously harm you if it became public.
      </InPlainTerms>
      <p>
        If we discover a breach that puts your information at risk, we will tell
        affected users and the Data Protection Commission as the Act requires.
      </p>
    </Clause>

    <Clause number="8" id="rights" title="What you can ask us to do">
      <p>Under the Data Protection Act, 2012 (Act 843) you may ask us to:</p>
      <ul className="list-disc space-y-2 pl-5 marker:text-content-muted">
        <li>tell you what we hold about you, and give you a copy;</li>
        <li>correct anything that is wrong — most of it you can edit yourself from your profile;</li>
        <li>delete your account and the information attached to it;</li>
        <li>stop using your information in a particular way, or object to it.</li>
      </ul>
      <p>
        Write to us using the contact details in section 12 and we will respond
        as soon as we reasonably can. If you are not satisfied with how we have
        handled your request, you can complain to the Data Protection Commission
        of Ghana.
      </p>
    </Clause>

    <Clause number="9" id="device" title="Stored on your device">
      <p>
        FindOut does not use tracking cookies and carries no third-party
        analytics or advertising trackers.
      </p>
      <p>
        It does store your sign-in tokens in your browser&rsquo;s local storage,
        which is what keeps you logged in between visits. Logging out removes
        them. On a shared or public computer, log out when you finish.
      </p>
    </Clause>

    <Clause number="10" id="children" title="Younger users">
      <p>
        FindOut is for students in tertiary education and is not intended for
        children under 16. If we learn that we hold information about a child
        under 16, we will delete it.
      </p>
    </Clause>

    <Clause number="11" id="changes" title="Changes to this notice">
      <p>
        As the platform changes, so will this notice — particularly section 2,
        which has to keep matching what the system actually stores. The date at
        the top of the page shows the current version, and we will give notice
        in the app before a material change takes effect.
      </p>
    </Clause>

    <Clause number="12" id="contact" title="Contact">
      <p>
        For anything about your information, including the requests described in
        section 8, contact the FindOut project team at the Department of
        Computer Science, University of Ghana, Legon, Accra.
      </p>
      <p>
        The{' '}
        <Link to="/terms" className="text-primary-300 underline underline-offset-2 hover:text-primary-200">
          Terms of Use
        </Link>{' '}
        cover the rest of your relationship with the platform.
      </p>
    </Clause>
  </LegalDocument>
);

export default Privacy;
