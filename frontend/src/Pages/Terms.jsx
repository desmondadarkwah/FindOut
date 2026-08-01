import React from 'react';
import { Link } from 'react-router-dom';
import LegalDocument, { Clause, InPlainTerms } from '../components/LegalDocument';

/**
 * Terms of Use.
 *
 * Written against what FindOut actually is: a student-run peer-learning
 * platform at a university. The clauses that matter most here are the ones a
 * generic template would not contain — what a verification badge does and does
 * not mean, that FindOut is not a party to any arrangement between two
 * students, and academic integrity.
 */

const SECTIONS = [
  { id: 'agreement',    title: 'This agreement' },
  { id: 'eligibility',  title: 'Who can use FindOut' },
  { id: 'account',      title: 'Your account' },
  { id: 'verification', title: 'What a verified badge means' },
  { id: 'peer',         title: 'Arrangements between students' },
  { id: 'integrity',    title: 'Academic integrity' },
  { id: 'conduct',      title: 'How to behave here' },
  { id: 'content',      title: 'What you post' },
  { id: 'moderation',   title: 'Reporting and moderation' },
  { id: 'availability', title: 'Availability of the service' },
  { id: 'ending',       title: 'Ending your use' },
  { id: 'liability',    title: 'Our responsibility, and its limits' },
  { id: 'changes',      title: 'Changes to these terms' },
  { id: 'law',          title: 'Governing law' },
  { id: 'contact',      title: 'Contact' },
];

const Terms = () => (
  <LegalDocument
    eyebrow="Terms of Use"
    title="The rules for using FindOut"
    standfirst="FindOut connects students who want to learn with students willing to teach. These terms set out what you can expect from us, and what we expect from you. They are written to be read."
    effective="1 August 2026"
    updated="1 August 2026"
    sections={SECTIONS}
  >
    <Clause number="1" id="agreement" title="This agreement">
      <p>
        These terms are an agreement between you and the FindOut project, a
        student-built peer-learning platform at the Department of Computer
        Science, University of Ghana, Legon. By creating an account or using
        the service, you accept them.
      </p>
      <p>
        Our{' '}
        <Link to="/privacy" className="text-primary-300 underline underline-offset-2 hover:text-primary-200">
          Privacy Notice
        </Link>{' '}
        explains what we do with your information and forms part of this
        agreement. If you do not accept either document, please do not use
        FindOut.
      </p>
    </Clause>

    <Clause number="2" id="eligibility" title="Who can use FindOut">
      <p>
        FindOut is intended for students in tertiary education. You may use it
        if you are at least 18 years old, or if you are 16 or over and enrolled
        at an institution, with the consent of a parent or guardian where your
        law requires it.
      </p>
      <p>
        You must register with your own name and a working email address, and
        keep them accurate. Other students decide whether to meet or work with
        you partly on the basis of what your profile says.
      </p>
    </Clause>

    <Clause number="3" id="account" title="Your account">
      <p>
        Keep your password to yourself. Anything done through your account is
        treated as done by you, so tell us promptly if you think someone else
        has access to it.
      </p>
      <p>
        One person, one account. Do not impersonate another student, a member of
        staff, or the platform itself.
      </p>
    </Clause>

    <Clause number="4" id="verification" title="What a verified badge means">
      <p>
        Before you appear as ready to teach a subject, you answer a set of
        automatically generated multiple-choice questions on it. If you pass,
        that subject shows a verified badge on your profile.
      </p>
      <InPlainTerms>
        The badge means one person passed one short quiz. It is not a
        qualification, it is not marked or reviewed by a human, and it is no
        promise that the teaching will be any good.
      </InPlainTerms>
      <p>
        Do not describe yourself as certified, accredited or qualified on the
        basis of a FindOut badge. Attempting to defeat the quiz — sharing
        answers, using another person, or automating attempts — will cost you
        the badge and may cost you the account.
      </p>
    </Clause>

    <Clause number="5" id="peer" title="Arrangements between students">
      <p>
        FindOut introduces students to each other. Whatever you then agree
        between yourselves — when to meet, where, whether money changes hands —
        is your arrangement, not ours. We are not a party to it, we do not
        supervise it, and we do not employ, engage or endorse anyone who uses
        the platform.
      </p>
      <InPlainTerms>
        We help you find each other. What happens next is between you. Use the
        same judgement you would use meeting anyone new: meet somewhere public
        the first time, and tell a friend where you are going.
      </InPlainTerms>
      <p>
        We do not check identity documents or enrolment records, and we do not
        run background checks on students.
      </p>
    </Clause>

    <Clause number="6" id="integrity" title="Academic integrity">
      <p>
        FindOut is for learning, not for getting around the rules of your
        institution. You must not use it to obtain or supply work that will be
        submitted as someone else&rsquo;s own, to share material from an
        examination in progress, or to arrange any form of contract cheating.
      </p>
      <p>
        Explaining a concept, working through a past question, or reviewing a
        draft is exactly what this platform is for. Producing the assessed
        answer for another student is not.
      </p>
      <p>
        Your institution&rsquo;s own academic regulations apply to you in full
        and are not softened by anything here. Where we are satisfied that an
        account is being used for academic dishonesty, we will remove it.
      </p>
    </Clause>

    <Clause number="7" id="conduct" title="How to behave here">
      <p>You agree not to:</p>
      <ul className="list-disc space-y-2 pl-5 marker:text-content-muted">
        <li>harass, threaten, bully or discriminate against anyone;</li>
        <li>post sexual content, or contact anyone for a sexual purpose;</li>
        <li>share another person&rsquo;s private information without their consent;</li>
        <li>upload material you have no right to share, including copyrighted course material and past papers your institution restricts;</li>
        <li>advertise, spam, or use the platform to sell unrelated goods and services;</li>
        <li>upload malware, or try to break, overload or gain unauthorised access to any part of the service;</li>
        <li>scrape or bulk-collect other students&rsquo; details.</li>
      </ul>
      <p>
        Messages between students are private in ordinary use, but they are not
        a place to do things you would not do in the open.
      </p>
    </Clause>

    <Clause number="8" id="content" title="What you post">
      <p>
        Your posts, comments, notes, images and voice messages remain yours. By
        putting them on FindOut you give us permission to store them and show
        them to the students they were meant for, for as long as you keep them
        on the platform. That permission ends when you delete the content or
        your account, apart from copies kept in routine backups for a limited
        period.
      </p>
      <p>
        You are responsible for what you post, and you confirm you have the
        right to post it. We do not claim ownership of your work and we will not
        sell it.
      </p>
    </Clause>

    <Clause number="9" id="moderation" title="Reporting and moderation">
      <p>
        Every post carries a report control. Reports go to the platform
        administrators, who can remove content and suspend accounts.
      </p>
      <p>
        We review reports as promptly as a student-run service reasonably can,
        and we do not promise a fixed response time. If someone is in immediate
        danger, contact the university authorities or the police first — not us.
      </p>
    </Clause>

    <Clause number="10" id="availability" title="Availability of the service">
      <p>
        FindOut is provided as it is. It is a student project rather than a
        commercial product: it may be offline, it may lose data, features may
        change or disappear, and there is no service level guarantee and no
        support desk.
      </p>
      <InPlainTerms>
        Do not rely on FindOut as the only copy of anything that matters to you.
      </InPlainTerms>
    </Clause>

    <Clause number="11" id="ending" title="Ending your use">
      <p>
        You can stop using FindOut at any time and ask us to delete your
        account; the{' '}
        <Link to="/privacy" className="text-primary-300 underline underline-offset-2 hover:text-primary-200">
          Privacy Notice
        </Link>{' '}
        explains what happens to your information when you do.
      </p>
      <p>
        We may suspend or remove an account that breaks these terms, that puts
        other students at risk, or where we are required to by law or by the
        University. Where it is reasonable to do so, we will tell you why.
      </p>
    </Clause>

    <Clause number="12" id="liability" title="Our responsibility, and its limits">
      <p>
        To the fullest extent the law allows, FindOut and the people who built
        it are not liable for what students say or do to each other, for
        arrangements made through the platform, for academic outcomes, or for
        loss of data, opportunity or profit arising from use of the service.
      </p>
      <p>
        Nothing here limits liability for death or personal injury caused by
        negligence, for fraud, or for anything else that cannot lawfully be
        excluded under the laws of Ghana.
      </p>
    </Clause>

    <Clause number="13" id="changes" title="Changes to these terms">
      <p>
        We may update these terms as the platform changes. The date at the top
        of this page always shows the current version. Where a change materially
        affects your rights we will give notice in the app before it takes
        effect, and continuing to use FindOut afterwards means you accept the
        new version.
      </p>
    </Clause>

    <Clause number="14" id="law" title="Governing law">
      <p>
        These terms are governed by the laws of the Republic of Ghana, and the
        courts of Ghana have jurisdiction over any dispute arising from them.
      </p>
    </Clause>

    <Clause number="15" id="contact" title="Contact">
      <p>
        Questions about these terms, or about something that has happened on the
        platform, can be sent to the FindOut project team at the Department of
        Computer Science, University of Ghana, Legon, Accra.
      </p>
    </Clause>
  </LegalDocument>
);

export default Terms;
