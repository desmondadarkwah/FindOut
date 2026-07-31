# CHAPTER ONE
# PROBLEM IDENTIFICATION

---

> **Note to author.**
>
> This chapter is written in plain English so that any reader can follow it, including a reader
> from outside computer science. It stays academic in structure, but the sentences are short and
> technical words are explained the first time they appear.
>
> Citation style is **APA 7th edition**, matching Chapter 2. Every source cited here is also in
> the Chapter 2 reference list.
>
> Places marked **`[YOUR DATA]`** need numbers from your own survey. Do not fill them with
> guesses. If you have not run the survey yet, use the instrument in the SRS, Appendix D.

---

## 1.1 Background to the Study

Students help each other learn. This is not new. Long before computers, students formed study
groups, explained topics to friends, and asked classmates for help before an examination.

Research shows this works well. Vygotsky (1978) explained why. He described what he called the
*Zone of Proximal Development*. This is the gap between what a learner can do alone and what the
same learner can do with help. His key point was simple but important: the helper does not have
to be a teacher. Another student can also give this help. In fact, a student who passed the
course last semester may explain it better than a professor. That student still remembers what
was confusing.

The evidence supports this. Zhang et al. (2025) reviewed 27 separate studies of peer tutoring at
university level. Peer tutoring means one student teaching another. They found a clear positive
effect on academic performance. They also found that one-to-one help works better than group
help.

There is a second benefit that is easy to miss. The student who teaches also learns. Roscoe and
Chi (2007) studied this closely. When a student explains something, they must organise their own
thinking. They notice gaps in what they know. They repair those gaps while explaining. So peer
teaching helps both people, not just the one asking for help.

Topping (2005) reviewed twenty-five years of research on peer learning. He noted that
researchers now consider the benefit to the helper to be as important as the benefit to the
person being helped.

So peer learning is valuable. The theory supports it. The evidence supports it. And the resource
needed for it already exists on every university campus.

### 1.1.1 The situation on a university campus

Think about any large university. In any subject, two kinds of students exist at the same time:

- Students who already understand the topic well.
- Students who are struggling with the same topic.

These students are often very close to each other. They may live in the same hall of residence.
They may sit in the same lecture room. They may pass each other every day.

But they do not find each other.

The student who is struggling does not know who can help. The student who could help does not
know anyone needs them. Both continue as before. One stays confused. The other never gets the
chance to teach, and so misses the learning that teaching would have given them.

This is the situation that this project addresses.

### 1.1.2 Why this matters more in Ghana

This problem exists everywhere. But it is more serious in some places than others.

Public universities in Ghana face large class sizes. Research on Ghanaian higher education
reports that large classes make it hard for lecturers to give attention to individual students
(Yelkpieri et al., 2012). The same research reports that large classes delay feedback, reduce
the number of exercises a lecturer can set, and leave little time for extra teaching for weaker
students. Sector reports describe difficult staff-to-student ratios in popular programmes (World
Education Services, 2019).

The conclusion is direct. When a lecturer cannot give individual attention, that attention must
come from somewhere else. On a university campus, the only source large enough is the students
themselves.

So in this context, peer learning is not a nice extra. It is necessary.

> **`[YOUR DATA]`** *Add current figures for the University of Ghana here — enrolment numbers,
> class sizes in your department, or staff-student ratios. Get these from the University of Ghana
> Basic Statistics publication or your department office. Also add findings from your own survey.
> Your own data is stronger evidence than old studies from other universities.*

### 1.1.3 What students use today

Students already use technology to study together. In Ghana and across West Africa, WhatsApp is
the main tool. Students use it for group discussion, sharing notes, and asking questions.

WhatsApp is very good at one thing: communication. Once you know who to talk to, it works well.

But WhatsApp cannot answer one question: *who should I talk to?*

You cannot search WhatsApp for a person who understands recursion. You cannot ask it to show you
students who are willing to teach statistics. Membership in a WhatsApp group comes from being in
the same class, or from someone adding you. So WhatsApp can only connect you to people you
already know, or to people who happen to be in the same class as you.

This is the missing piece. Students have a way to talk. They do not have a way to find.

---

## 1.2 Statement of the Problem

The main problem this project addresses can be stated in one sentence:

> **Students who need help and students who are willing to give help exist in the same
> institution at the same time, but they have no reliable way to find each other.**

It is important to be clear about what kind of problem this is. This is **not** a teaching
problem. Nobody needs to invent a better way to explain calculus. The explanation already exists
in another student's head. The problem is that the two students never meet.

This is a **matching problem** and an **information problem**. The right people exist. The
information about who they are is not visible to anyone.

The problem breaks into five smaller problems. Each one is addressed by this project.

### Problem 1: Willingness to teach is invisible

A student may have finished Data Structures with a good grade. That student may be happy to
explain it to someone else. But there is nowhere to say so.

No university system has a field for "I am available to help with this subject." So this
willingness stays hidden. The help exists but nobody can see it. Because nobody can see it,
nobody asks for it.

### Problem 2: Searching for help costs too much effort

A student who needs help must search manually. They ask friends. They post in a class group.
They approach a classmate they barely know.

Each of these has a social cost. Asking for help in front of a whole class group can feel
embarrassing. Approaching a stranger is uncomfortable. And the chance of success is low.

Worse, every student does this search separately, from the beginning, every time. Nothing is
saved. Nothing is shared. The same effort is repeated across the whole campus.

### Problem 3: Existing groups are organised by class, not by need

Class WhatsApp groups and departmental pages are organised around **who is enrolled**. Everyone
taking CS 202 is in one group.

They are not organised around **who knows what** and **who needs what**.

This causes two failures. First, a question goes to 200 people, and most of them are just as
confused as the person asking. Second, the question disappears within minutes as other messages
arrive. There is no lasting structure that connects a specific need to a specific ability.

### Problem 4: There is no way to check if someone really knows the subject

Suppose a student does find someone who claims to be able to teach a subject. How do they know
it is true?

There is no signal that separates real knowledge from confidence. Economists call this
*information asymmetry*. It means one person knows something the other cannot check.

The result is predictable. Learners do not want to waste time with someone unproven. So they do
not ask. Willing teachers are approached less often. Fewer connections happen than should.

### Problem 5: Even successful connections have no support

Sometimes two students do connect. What happens next?

Usually the relationship becomes an ordinary chat thread. Shared notes get lost in the message
history. There is no space tied to the subject. There is no easy way for the pair to grow into a
small group. And there is no record that the collaboration ever happened.

So even the successes are fragile.

---

## 1.3 Aim of the Study

The aim of this project is stated below.

> To design, build and evaluate a web-based platform that makes students' teaching ability and
> learning needs visible to each other, automatically suggests suitable partners and groups based
> on shared subjects, builds trust through competency checking, and provides the communication
> tools needed to keep those learning relationships going.

---

## 1.4 Objectives of the Study

The aim above is broken into six specific objectives. Each one can be checked. Each one connects
to a part of the system that was built.

**Objective 1.**
To design a user profile where a student clearly states two things: the subjects they care
about, and whether they are ready to teach or ready to learn. This makes ability and need
visible to the system.
*(Addresses Problem 1.)*

**Objective 2.**
To design and build a matching method that suggests partners with the **opposite** role on a
shared subject. A learner should see teachers. A teacher should see learners. The suggestions
should appear automatically, without the student having to search.
*(Addresses Problems 2 and 3.)*

**Objective 3.**
To build a competency check that gives a student a verification badge for a subject after they
pass a test. This gives learners a reason to trust someone they have never met.
*(Addresses Problem 4.)*

**Objective 4.**
To build real-time messaging for both one-to-one chat and group chat, including online status
and read receipts, so that a suggested match can become a real conversation without leaving the
platform.
*(Addresses Problem 5.)*

**Objective 5.**
To build subject-based study groups with privacy controls, and a feed where students can share
learning resources tagged by subject, so that collaboration continues beyond a single
conversation.
*(Addresses Problem 5.)*

**Objective 6.**
To evaluate the platform with real students, measure how usable and useful they find it, and
report the results honestly.
*(Addresses all problems.)*

---

## 1.5 Research Questions

This study answers four questions.

**RQ1.** Do students find the suggested partners relevant when the system matches them by
opposite role and shared subject?

**RQ2.** Does showing a verification badge make students more willing to contact a peer they do
not know?

**RQ3.** Does combining finding and messaging in one platform reduce the effort students report
compared with the methods they use now?

**RQ4.** How does the matching method perform as the number of users grows, and at what point
would it need to be redesigned?

---

## 1.6 Scope and Delimitations of the Study

### 1.6.1 What the study covers

The system built in this project includes:

- User registration with email confirmation, and secure login.
- A profile with subjects, a teach-or-learn status, and free time.
- Automatic suggestions of matching students and matching study groups.
- A competency test that awards a verification badge for each subject.
- One-to-one and group messaging that updates in real time.
- Voice messages.
- Study groups with three privacy levels, invite links, and join requests.
- A feed where students post learning resources tagged by subject and type.
- Search across students and groups.
- An administration dashboard for managing users, posts and viewing statistics.

### 1.6.2 What the study does not cover

Some features were deliberately left out. The reasons are given below, because an examiner will
ask.

| Not included | Reason |
|---|---|
| Video and voice calls | This needs a large amount of extra technical work. It is not needed to test the main idea of the project. Students can move to another app for calls. |
| Mobile apps for Android and iOS | The website works well on phones. Building separate apps would not add new capability within the project time. |
| Payments and paid tutoring | This brings money, regulation and fraud concerns. These are separate from the research question. |
| Login using university accounts | This needs permission and access from the university IT department, which an undergraduate project cannot obtain. |
| Automatic content moderation | Administrators can remove content manually. Automatic moderation would need machine learning work beyond this project. |
| Official academic credit for badges | The badge shows peer-level ability only. It is not an academic qualification, and is not presented as one. |

### 1.6.3 Delimitations

The evaluation was carried out with students from one institution, chosen by convenience rather
than random selection. This means the findings show what these students experienced. They cannot
be assumed to apply to all students everywhere.

Subjects are typed in as free text rather than chosen from an official course list. This makes
the system flexible but means two students may write the same subject differently.

---

## 1.7 Significance of the Study

This study matters for three groups.

**For students.** The project delivers a working platform that students can use immediately. It
reduces the effort of finding help. It also gives students who enjoy teaching a way to be found,
which the research suggests will help their own learning too (Roscoe & Chi, 2007).

**For research.** The project builds and tests a *reciprocal recommender system* for peer
learning. A reciprocal recommender is a system that must satisfy both people for the match to be
a success, unlike a system that recommends a film to one person (Palomares et al., 2021).
Existing work in this area matches students using data the system collects over time, or using
profile details such as age and interests. This project instead uses a role that the student
declares directly. Chapter 2 explains this difference in full and states exactly what is new here
and what is not.

**For institutions.** The administration dashboard shows which subjects generate the most
requests for help. A department could use this to decide where to place extra tutorials or
teaching assistants. This is useful information that universities do not currently collect.

---

## 1.8 Limitations of the Study

Being honest about limitations is part of good research. The following limitations apply.

**The platform needs enough users to work.** Matching only produces results if there are people
to match with. If very few students join, the system will show empty suggestions no matter how
well it is built. This is the biggest risk to the project, and it is outside the developer's
control.

**Students may not be honest.** The system depends on students correctly stating their subjects
and their willingness to teach. The competency test reduces this risk but does not remove it.

**One student, limited time.** The project was built by one developer within one academic year.
This limited how many features could be completed and how thoroughly they could be tested.

**No budget.** Only free and open-source tools were used. This ruled out paid services that could
have improved parts of the system.

**Evaluation is short-term.** The study measures whether students find the system usable and the
suggestions relevant. It does not measure whether matched students actually improved their
grades. That would require a much longer study.

---

## 1.9 Definition of Terms

These terms are used throughout this report.

**Peer learning** — Students learning from and with each other, rather than only from a lecturer.

**Peer tutoring** — One student teaching another student.

**Intent (or status)** — What a student has declared about their availability in the system:
*Ready To Teach*, *Ready To Learn*, or *Later*.

**Complementary matching** — Matching a person to someone with the opposite role, rather than to
someone similar. A learner is matched to a teacher.

**Reciprocal recommender system** — A system that suggests people to people, where the suggestion
only succeeds if **both** people are satisfied with it.

**Match score** — A number the system calculates to show how suitable a suggested person or group
is. A higher number means a better match.

**Fuzzy matching** — Comparing two pieces of text in a way that allows small differences. It lets
the system treat "C++", "cpp" and "c plus plus" as the same subject.

**Verification badge** — A mark shown on a profile after a student passes the competency test for
a subject.

**Cold start** — A common problem in recommendation systems. The system cannot make good
suggestions for a new user because it has no history about them yet.

**Real-time** — Updates that appear immediately, without the user refreshing the page.

**Zone of Proximal Development (ZPD)** — Vygotsky's term for the gap between what a learner can
do alone and what they can do with help from someone more capable.

---

## 1.10 Organisation of the Study

This report has five chapters.

**Chapter One** states the problem, the aim, the objectives, and the research questions. It
explains why the problem matters and what the study does and does not cover.

**Chapter Two** reviews existing research and existing systems. It examines the evidence for peer
learning, the research on matching people to people, and the systems students use today. It ends
by stating exactly what gap this project fills.

**Chapter Three** explains the method. It covers how the system was designed, what technologies
were chosen and why, how the matching method works, and how the system was built. It contains
enough detail for another person to reproduce the work.

**Chapter Four** describes what was actually built. It covers the architecture, the main parts of
the system, and the decisions made during development. It also reports what was completed and
what was not.

**Chapter Five** presents the results. It reports the testing that was carried out, the results
of the user evaluation, and a discussion of what the results mean. It also states the
limitations found and suggests future work.

---

## 1.11 Chapter Summary

This chapter established the problem. Students who need help and students able to give it exist
side by side in every university, but they cannot find each other. The problem is not about
teaching methods. It is about visibility and matching.

Five specific failures were identified: willingness to teach is invisible; searching costs too
much effort; existing groups are organised by class rather than by ability and need; competence
cannot be checked, so trust does not form; and connections that do form have no lasting support.

The chapter then stated the aim of building a platform to solve these failures, broke that aim
into six objectives, and set four research questions. It defined the scope, explained what was
deliberately left out and why, and stated the limitations honestly.

Chapter Two now examines what researchers and existing systems have already done about this
problem.

---

## References

*Full reference details for all sources cited in this chapter appear in the Chapter 2 reference
list (§2.10). They are repeated here for convenience.*

Palomares, I., Porcel, C., Pizzato, L., Guy, I., & Herrera-Viedma, E. (2021). Reciprocal recommender systems: Analysis of state-of-art literature, challenges and opportunities towards social recommendation. *Information Fusion, 69*, 103–127. https://doi.org/10.1016/j.inffus.2020.12.001

Roscoe, R. D., & Chi, M. T. H. (2007). Understanding tutor learning: Knowledge-building and knowledge-telling in peer tutors' explanations and questions. *Review of Educational Research, 77*(4), 534–574. https://doi.org/10.3102/0034654307309920

Topping, K. J. (2005). Trends in peer learning. *Educational Psychology, 25*(6), 631–645. https://doi.org/10.1080/01443410500345172

Vygotsky, L. S. (1978). *Mind in society: The development of higher psychological processes*. Harvard University Press.

World Education Services. (2019). *Education in Ghana*. WENR. https://wenr.wes.org/2019/04/education-in-ghana

Yelkpieri, D., Namale, M., Esia-Donkoh, K., & Ofosu-Dwamena, E. (2012). Effects of large class size on effective teaching and learning at the Winneba campus of the UEW (University of Education, Winneba), Ghana. *US-China Education Review, A*(3), 319–332.

Zhang, C., Sun, N., Jiang, Y., Liu, H., & Huang, Q. (2025). The impact of peer tutoring programs on students' academic performance in higher education: A meta-analysis. *The Asia-Pacific Education Researcher, 34*, 1495–1506. https://doi.org/10.1007/s40299-024-00960-0

---

## Appendix 1A — Author's checklist for this chapter

- [ ] `[YOUR DATA]` in §1.1.2 replaced with real University of Ghana figures
- [ ] Survey findings added to §1.1.2 and §1.2 as evidence of the problem
- [ ] Objectives in §1.4 checked against what the system actually does
- [ ] Scope table in §1.6.2 checked against the final build
- [ ] Chapter numbering and cross-references match your final structure
- [ ] Reference list style confirmed as APA 7th (or converted to your department's style)
