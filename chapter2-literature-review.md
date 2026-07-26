# CHAPTER TWO
# LITERATURE REVIEW

---

> **Note to author — read before editing.**
>
> Citation style is **APA 7th edition** throughout. Every source in §2.10 is marked with a
> verification status: **[V]** means I retrieved and confirmed the bibliographic record during
> research (authors, year, venue, volume, pages); **[C]** means it is a canonical work cited from
> established scholarly knowledge whose record you should still confirm in your library
> catalogue. **You must read, at minimum, every source you cite substantively** — an examiner may
> ask you to summarise any of them.
>
> §2.8 contains an **important correction** to the novelty claim made in the SRS. Read it first.
> The gap this project occupies is real but narrower than originally stated, and the corrected
> version is the one you must defend.

---

## 2.1 Introduction

This chapter reviews the body of knowledge relevant to the design of FindOut, a platform that
matches students who wish to learn a subject with students willing to teach it. The review has
four purposes: to establish that peer learning is a defensible intervention, to locate the
matching problem within an existing computational literature, to examine how trust between
unacquainted peers can be established, and to identify precisely what remains unaddressed by
existing work.

The chapter is organised as follows. Section 2.2 examines the theoretical and empirical
foundations of peer learning, establishing *why* connecting students to one another is
worthwhile. Section 2.3 reframes the peer-matching problem as a computational one and reviews
the recommender-systems literature that addresses it, with particular attention to *reciprocal*
recommendation. Section 2.4 reviews mechanisms for establishing trust and verifying competence
between strangers. Section 2.5 reviews systems currently available to students. Section 2.6
situates the problem in the Ghanaian higher education context. Section 2.7 presents a comparative
analysis, and Section 2.8 states the research gap. Section 2.9 summarises the chapter.

### 2.1.1 Method of the review

Literature was identified through structured searches of Google Scholar, the ACM Digital Library,
Springer Nature Link, ScienceDirect, ERIC, and arXiv. Search terms combined three clusters:
learning terms (*peer learning*, *peer tutoring*, *collaborative learning*, *study partner*),
computational terms (*recommender system*, *reciprocal recommendation*, *social matching*, *group
formation*), and context terms (*higher education*, *Ghana*, *MOOC*). Sources were included where
they were peer-reviewed, published in English, and addressed either the pedagogical basis of
peer learning or the computational problem of matching people to people. Reviews and
meta-analyses were preferred over individual empirical studies where both were available.
Seminal works were included regardless of date; empirical work on systems was weighted toward
the period 2015–2026 to reflect current practice.

---

## 2.2 Theoretical and Empirical Foundations of Peer Learning

### 2.2.1 The Zone of Proximal Development

The theoretical foundation for peer-assisted learning originates with Vygotsky's (1978) concept
of the *Zone of Proximal Development* (ZPD), defined as the distance between a learner's
independent problem-solving ability and the level attainable under guidance or in collaboration
with more capable peers. Vygotsky's formulation is significant for the present work in a specific
respect: he explicitly identified *peers*, not only adults or experts, as capable of providing
the scaffolding that moves a learner through the zone.

This carries a direct design implication. If effective assistance requires only a *more capable
other* rather than an expert, then the pool of potential helpers within any institution is
vastly larger than its teaching staff. A student who completed a course in the previous semester
occupies an appropriate position relative to a student currently taking it. Indeed, the smaller
cognitive distance may be advantageous: the recently-successful peer retains awareness of the
specific difficulties involved, an awareness that expertise tends to erode. The theory thus
justifies the fundamental premise of FindOut — that the capacity to resolve a student's
difficulty already exists within the student body and requires only identification.

### 2.2.2 Empirical evidence for peer tutoring

The theoretical case is supported by a substantial empirical literature. Bloom (1984) reported
that students receiving one-to-one tutoring combined with mastery learning performed
approximately two standard deviations above students in conventional classroom instruction — the
result that became known as the "2 sigma problem," so named because Bloom framed the challenge as
finding group methods capable of approaching tutoring's effectiveness. While the two-sigma figure
derives from a small number of doctoral studies and has attracted methodological criticism, the
broad direction of the finding — that individualised attention substantially outperforms
undifferentiated group instruction — has proved durable.

More directly relevant to higher education, Zhang et al. (2025) conducted a meta-analysis of 27
independent experimental and quasi-experimental studies of peer tutoring programmes in tertiary
settings, reporting a moderate positive overall effect size of *g* = 0.480 on academic
performance. They further found significantly larger effects for *individualised* tutoring than
for group-based arrangements. This is directly pertinent to FindOut's design: the platform's
primary matching output is a one-to-one pairing, with groups offered as a secondary structure,
and the meta-analytic evidence supports that ordering.

Topping (2005), reviewing developments in peer learning from 1981 to 2006, catalogued the
principal forms — peer tutoring, cooperative learning, and peer assessment — and examined
questions of implementation integrity and effectiveness. Topping's review is notable for
observing that the benefits accruing to the *helper* had by then come to be emphasised at least
as strongly as those accruing to the helped, a shift with significant consequences for how a
peer-learning platform should be designed.

### 2.2.3 The tutor effect and its implications for platform incentives

That observation is developed most rigorously by Roscoe and Chi (2007), who reviewed the
mechanisms by which peer tutors themselves learn. They distinguish *knowledge-telling*, in which
the tutor recites information, from *knowledge-building*, in which the tutor generates
inferences, integrates ideas, and repairs their own understanding in the act of explaining. Their
review finds that tutor learning gains are real but frequently modest, and that the magnitude
depends heavily on which of these two behaviours predominates — reflective explanation and
genuine question-answering produce learning, whereas summarising does not.

Chi's (2009) ICAP framework provides a complementary account, ranking learning activities as
*Interactive* > *Constructive* > *Active* > *Passive*, with interactive dialogue — precisely the
mode of peer tutoring — occupying the highest tier.

Two design implications follow, and both shaped FindOut:

1. **Teaching must be framed as reciprocally beneficial, not altruistic.** A platform depending
   on students volunteering to help others faces an obvious supply problem if teaching is
   presented as a favour. The tutor-learning literature supplies the counter-framing: the student
   who explains is also studying. In FindOut this is reflected in `Ready To Teach` being a
   first-class, badge-bearing identity rather than a request for volunteers.
2. **The supply side is the scarce resource.** Because learners are more numerous than willing
   teachers, mechanisms that recruit and retain the teaching side — verification badges,
   reputation, visible status — warrant disproportionate design attention.

### 2.2.4 Situated learning and communities of practice

Beyond dyadic tutoring, Lave and Wenger (1991) and Wenger (1998) frame learning as participation
in a community of practice rather than individual acquisition. Their concept of *legitimate
peripheral participation* describes how newcomers begin at the community's edge — observing,
performing minor tasks — and move inward as competence and confidence develop.

This informs two elements of FindOut's design. Subject-scoped study groups provide the community
structure, while the public resource feed provides a peripheral participation route: a new or
diffident user can observe discussion and contribute a small comment before committing to the
higher-exposure act of requesting help from a stranger. The graduated group privacy model
(public, private, secret) similarly permits a community to control its boundary as it matures.

### 2.2.5 Computer-supported collaborative learning

The field of Computer-Supported Collaborative Learning (CSCL) studies how technology mediates
collaborative learning. Dillenbourg (1999) offers the field's foundational analysis of what
"collaborative learning" denotes, distinguishing the situation, the interactions, the mechanisms,
and the effects. Stahl et al. (2006) provide a historical account of the field's development.

A finding recurring throughout the CSCL literature is that **group composition is a primary
determinant of collaborative outcome**. Poorly composed groups do not become effective through
better tooling. This constitutes the strongest theoretical justification for the emphasis of the
present project: engineering effort is directed at *who is connected to whom* rather than at
elaborating the collaboration environment itself. FindOut treats group and pair formation as the
intervention point, and this is a defensible allocation of effort on CSCL grounds.

### 2.2.6 Summary of Section 2.2

The literature establishes that peer learning is effective (*g* ≈ 0.48 in higher education), that
it benefits helper and helped, that individualised arrangements outperform group arrangements,
and that composition determines outcome. What the literature does **not** address is the
logistical question this project confronts: *by what mechanism do a suitable helper and a
suitable learner locate one another?* Peer tutoring studies almost universally assume an
administratively assigned or instructor-arranged pairing. The matching itself is treated as a
solved precondition. Section 2.3 turns to the literature that does address it.

---

## 2.3 The Peer-Matching Problem as a Computational Problem

### 2.3.1 From social matching to recommendation

Terveen and McDonald (2005) established the intellectual foundation for *social matching systems*
— systems that recommend people to people rather than items to people. They characterise social
matching as a four-stage process: modelling the set of users who may be matched, matching users
in response to an explicit request or an implicit opportunity, introducing matched users, and
enabling their subsequent interaction, whether in a space the system provides or through means
the users choose themselves.

This four-stage model maps directly onto FindOut's architecture and provides a useful framework
for describing it: the profile (subjects, intent) is the *user model*; the suggestions endpoint
performs *matching*; the suggestion card constitutes the *introduction*; and the integrated
messaging subsystem provides the *interaction* space. That FindOut supplies all four stages
internally — rather than handing users off to an external channel after introduction — is a point
returned to in Section 2.8.

Terveen and McDonald also observe that social matching systems raise concerns absent from item
recommendation: privacy, the social cost of rejection, and the fact that a recommendation
constitutes a request for another person's time and attention.

### 2.3.2 Reciprocal recommender systems

The general recommender-systems literature classifies approaches as content-based, collaborative
filtering, or hybrid (Adomavicius & Tuzhilin, 2005; Ricci et al., 2011). However, a distinct
subfield addresses the specific structure of the present problem.

*Reciprocal recommender systems* (RRS) are those in which a recommendation must satisfy **both**
parties to be considered successful. Pizzato et al. (2010) introduced RECON, a reciprocal
recommender for online dating, and formalised the *reciprocal score* — a measure combining how
well candidate B satisfies A's preferences with how well A satisfies B's. Pizzato et al. (2013)
extended this into a general account of reciprocal recommenders. Palomares et al. (2021) provide
the field's most comprehensive review, analysing the algorithms, fusion strategies and
characteristics of RRS, and distinguishing those properties inherited from conventional
user-to-item recommendation from those inherent to the reciprocal case.

The distinction from conventional recommendation is not cosmetic. When a system recommends a film,
only the user's satisfaction is at stake. When it recommends a person, a recommendation that
delights one party and burdens the other is a failure. Palomares et al. (2021) identify typical
RRS domains as online dating, employment matching, and mentor–mentee pairing.

**FindOut is a reciprocal recommender system applied to peer learning.** This is the correct
technical characterisation of the artefact, and it should be stated as such in the methodology
chapter. A recommendation is successful only when both the learner and the teacher find the
match worthwhile — a `Ready To Learn` user matched to a `Ready To Teach` user on a shared subject
is, in RRS terms, a reciprocally satisfying match by construction, because the two roles are
complementary rather than competing.

It is important to note that most social matching and people-recommendation systems in wide
deployment optimise for **similarity** — the "people you may know" pattern common to social
networks recommends users resembling the requester. Peer tutoring requires the opposite
structure: the ideal counterpart holds the *inverse* role while sharing the subject. This
complementarity is what the RRS literature formalises.

### 2.3.3 Reciprocal recommendation in educational settings

Reciprocal recommendation has been applied to education, and this literature must be engaged with
directly because it is the closest prior work to the present project.

**Prabhakar et al. (2017)** developed a reciprocal recommender for learners in Massive Open Online
Courses, motivated by the observation that MOOC learners are often reluctant to approach one
another — through shyness or through simply not knowing whom to approach. Their system matches
learners who are mutually likely to communicate, using profile attributes including age,
location, gender, qualification and interests, and was evaluated against the MITx–HarvardX
dataset. They report that both attribute importance and reciprocity significantly affect
recommendation rankings. Notably, their matching signal is **demographic and interest-based
profile similarity**, not a declared instructional role.

**Potts et al. (2018)** introduced reciprocal peer recommendation within RiPPLE, an open-source
course-level platform developed at the University of Queensland. Their work is motivated by
reduced student contact time with teaching staff, and it recommends peers for study partnership
and mentoring within a course. RiPPLE itself (Khosravi et al., 2019) is an adaptive, crowdsourced
platform that maintains a repository of student-authored tagged multiple-choice questions,
approximates each student's knowledge state from their responses, and recommends personalised
learning activities via collaborative filtering. It was evaluated in an introductory course with
453 students, with results suggesting measurable learning gains and positive student perception.
Critically, RiPPLE derives a student's competence — and therefore their suitability as a
mentor — from **system-inferred knowledge state based on platform activity history**, and
operates **embedded within a single course** via LTI integration with an institutional LMS.

The existence of this work materially affects the novelty claim available to the present project,
and Section 2.8 restates that claim accordingly.

### 2.3.4 Group formation in collaborative learning

A parallel literature addresses the formation of *groups* rather than pairs. Maqtary et al. (2019)
conducted a systematic literature review of group formation techniques in CSCL, analysing 30
studies, and concluded that group formation is influenced by member characteristics, grouping
context, and the technique applied. Approaches in this literature include genetic algorithms,
entropy-minimisation methods for maximising heterogeneity, and personality-based grouping using
the Five Factor model.

Two observations from this literature bear on FindOut. First, the dominant objective in automated
group formation is **heterogeneity** — deliberately mixing knowledge levels so that stronger
students can assist weaker ones within each group. This is the group-level analogue of
complementary matching and provides independent support for FindOut's approach. Second, these
techniques generally presuppose a **closed, known cohort** — a class roster with known attributes
to be partitioned. FindOut operates on an open, continuously changing population in which users
join and depart independently and no roster exists, which renders partition-based algorithms
inapplicable and favours the ranking-based approach adopted.

### 2.3.5 The cold-start problem and the case for content-based matching

Collaborative filtering, the dominant recommendation paradigm, infers preference from historical
interaction patterns and consequently suffers the well-documented *cold-start* problem: it cannot
generate useful recommendations for users or items lacking interaction history (Adomavicius &
Tuzhilin, 2005; Ricci et al., 2011).

This constraint is decisive in the present context, and the reasoning should be reproduced in the
methodology chapter as justification for the approach taken. A student peer-matching platform
experiences **continuous cold start**: each academic year introduces an entire cohort with no
history, and — more fundamentally — every student's subject needs change each semester, so even
established users present a substantially new profile at regular intervals. History-dependent
methods are structurally disadvantaged in this setting.

A content-based approach operating on explicitly declared attributes (subjects and intent) is
effective from a user's first session, requires no interaction history, and possesses a second
advantage that the recommender literature increasingly emphasises: **explainability**. The system
can state that a match was made because both users listed a given subject. This matters
disproportionately for people-recommendation, where the recommendation asks the user to expend
social effort on a stranger, and where an unexplained suggestion is more easily dismissed.

The trade-off is equally clear and must be acknowledged: content-based matching on self-declared
attributes is only as accurate as the declarations, and it cannot learn from outcomes. Section
2.8 and the Future Work chapter address this.

### 2.3.6 Approximate string matching

Where subjects are entered as free text rather than selected from a controlled vocabulary, the
matching function must tolerate variation in case, punctuation, spacing and spelling —
recognising `Data Structures`, `data-structures` and `DataStructures` as equivalent. The standard
measure of string similarity is the edit distance introduced by Levenshtein (1966), defined as
the minimum number of single-character insertions, deletions or substitutions required to
transform one string into another, and computed by dynamic programming.

The design decision facing any such system is where to set the similarity threshold, and this is
fundamentally a question of the relative cost of the two error types. In peer matching the costs
are asymmetric: a false negative denies a student an opportunity they never learn existed, while
a false positive costs only a dismissed suggestion. This asymmetry justifies favouring recall
over precision, a position adopted in the present design and revisited critically in Chapter 5.

---

## 2.4 Trust, Verification and Credentialing

### 2.4.1 Information asymmetry between unacquainted peers

Even where a suitable peer is identified, the interaction requires trust. The learner cannot
readily distinguish genuine competence from confident self-assessment — a classic information
asymmetry. The consequence is a thin market: learners hesitate to invest time with an unproven
tutor, willing tutors are approached less often, and participation on both sides declines.

Kollock (1999) analyses cooperation in online settings and the free-rider problem that arises
where contribution is voluntary and unrewarded. The concern applies directly to a platform
depending on students volunteering their time.

### 2.4.2 Reputation systems

The standard remedy is a reputation system. Resnick and Zeckhauser (2002) analysed eBay's
feedback mechanism, demonstrating that reputation information supports transactions between
parties with no prior relationship. Jøsang et al. (2007) survey trust and reputation systems for
online service provision, classifying the computational models available.

Reputation systems, however, possess a cold-start problem of their own that is frequently
overlooked: they require accumulated interaction volume before their signal becomes informative.
A newly launched platform has no ratings, and the first users therefore receive no benefit from
the mechanism at precisely the moment when trust is most needed. This is the reasoning behind
FindOut's decision to implement *competency verification* — an assessment-gated badge that can be
earned immediately, independent of interaction history — as the primary trust mechanism, with
reputation retained as a secondary, longer-horizon signal.

### 2.4.3 Digital badges and micro-credentials

Digital badges and micro-credentials constitute a substantial contemporary literature. The
consensus positions badges as modular, competency-based recognition operating outside traditional
credential structures. Research indicates that badges can function as extrinsic motivators
capable of transitioning into intrinsic engagement, and that a badge's value derives
significantly from the specificity with which it describes the competence attained — transparency
enhances credibility. Reviews also note concerns: that proliferating micro-credentials may
dilute the value of formal qualifications, and that the evidence base remains largely
cross-sectional and descriptive, with limited longitudinal or causal evidence for long-term
effects.

For the present project the relevant implications are that a badge must (a) name a specific
competence rather than a general status, and (b) be perceived as non-trivially earned. FindOut's
per-subject verification badge, gated at a 70% assessment threshold with a limited number of
attempts, is designed against both criteria. The badge is explicitly **not** presented as an
academic credential, which distinguishes it from the micro-credential literature's primary
concern and avoids the dilution objection.

*Note to author: the badge literature was reviewed here at the level of consensus findings. Before
submission, select two or three specific studies from this area, read them, and cite them
directly in place of the general characterisation above. Search terms are given in §2.10.1.*

### 2.4.4 Automated question generation

FindOut's verification mechanism requires assessment items for arbitrary, user-supplied subjects —
a requirement that cannot be met by a manually authored question bank at any realistic scale.
Automated question generation using large language models is an active research area. Recent work
evaluates the capacity of LLMs to generate questions at differing cognitive levels of Bloom's
taxonomy, employing both expert and model-based evaluation of linguistic and pedagogical quality
(Scaria et al., 2024). Evaluation frameworks in this area assess dimensions including knowledge-
point alignment, item quality, and the quality of solution explanations.

The reported findings are relevant to the design decision taken in this project: LLMs can
generate relevant, pedagogically appropriate questions when supplied with adequate context, but
performance varies substantially between models, and quality assurance remains an open problem.
Because generated assessment items in the present system would gate a trust signal, the
reliability question is not incidental. Chapter 4 reports the implementation status of this
component accurately, including the fact that the deployed build uses a deterministic template
bank rather than model-generated items, and Chapter 5 discusses the consequence for the strength
of the verification signal.

---

## 2.5 Review of Existing Systems

This section reviews the systems currently available to a student seeking a study partner,
organised by category and assessed against the requirements established above.

### 2.5.1 Learning management systems

Moodle, Google Classroom and Blackboard organise course content, assessment and enrolment. Peer
interaction, where supported, occurs in instructor-created forums structured by *class
membership*. No LMS in common use provides a mechanism by which a student declares availability
to teach a specific topic, nor any means of querying the student body by capability. LMS
structure reflects the administrative organisation of the institution, not the distribution of
knowledge and need within it.

### 2.5.2 Question-and-answer platforms

Brainly, Chegg Study, Stack Overflow and Quora optimise a different unit of value: a *question*
receiving *an answer*. The transaction, not the relationship, is the object. There is no
persistent partner, no continuity across sessions, and typically no locality — the answering
party is anonymous and geographically arbitrary. Stack Overflow's reputation system is
instructive and partially informs the present design, but the platform is oriented toward
building a public knowledge artefact rather than a learning relationship. Chegg additionally
places access behind a subscription, which is a material barrier in the target context.

### 2.5.3 Messaging platforms — the de facto baseline

General messaging platforms (WhatsApp, Telegram, Discord, Slack) constitute the honest baseline
against which FindOut must be compared, because they are what students actually use. Research on
West African higher education indicates WhatsApp is heavily used for study-related group
discussion and content sharing, and is regarded as a primary teaching and learning tool by both
students and lecturers in the region.

These platforms provide excellent communication and **no discovery whatsoever**. A WhatsApp group
cannot be queried for members competent in a given topic. Membership derives from enrolment or
personal invitation, so the platform is structurally incapable of connecting students who do not
already know each other. A request for help is broadcast to the entire group — most of whom share
the asker's difficulty — and is displaced by unrelated traffic within minutes.

Discord's topic-organised servers approach the required structure more closely, but organise by
*topic channel* rather than by *per-user declared capability*, so the identification problem
persists.

### 2.5.4 Research platforms for peer learning

As reviewed in Section 2.3.3, RiPPLE (Khosravi et al., 2019; Potts et al., 2018) and the MOOC
reciprocal recommender of Prabhakar et al. (2017) represent the closest prior work. Both perform
peer recommendation in an educational context. Their characteristics relevant to comparison are:

| Property | RiPPLE (Potts et al., 2018) | MOOC RRS (Prabhakar et al., 2017) |
|---|---|---|
| Matching signal | System-inferred knowledge state from platform question-answering history | Demographic and interest profile attributes (age, location, gender, qualification, interests) |
| Role declaration | Derived by the system | Not role-based |
| Deployment model | Embedded in a course via LTI/LMS integration | Within a MOOC platform |
| Scope | Single course | Single MOOC cohort |
| Cold start | Requires accumulated response history | Requires populated profile attributes |
| Integrated messaging | Not the platform's focus | Not the platform's focus |
| Competency verification | Inferred, not assessed as a trust signal | None |
| Availability | Open-source research platform, institution-deployed | Research prototype |

### 2.5.5 Co-working and accountability platforms

StudyStream and Focusmate match students for synchronised co-working sessions. The match is
deliberately *not* subject-based: the mechanism targets accountability and focus through mutual
presence, not knowledge transfer. They are included here to delimit the problem — they
demonstrate demand for peer connection among students while addressing an orthogonal need.

### 2.5.6 Professional and mentorship networks

LinkedIn and dedicated mentorship platforms implement genuine complementary matching
(mentor ↔ mentee) and thereby validate the general pattern. They target career mentorship over
long horizons with formal professional profiles, rather than same-campus, same-semester,
course-level academic assistance. The temporal granularity and the profile model both differ
fundamentally from the present requirement.

---

## 2.6 The Ghanaian Higher Education Context

The problem this project addresses is general, but its severity is context-dependent, and the
Ghanaian tertiary context intensifies it in three specific ways.

**Staff-to-student ratios constrain individual attention.** Large class size is documented as a
significant challenge confronting public universities in Ghana. Research on Ghanaian higher
education reports that large classes hinder individual attention to weaker students, make
assessment difficult, delay feedback, reduce the number of exercises lecturers can set, and leave
insufficient time for remedial teaching (Yelkpieri et al., 2012). Sector reporting indicates
teacher-to-student ratios in popular disciplines reaching substantially adverse levels (World
Education Services, 2019).

The connection to the present work is direct. Where an instructor cannot provide individual
attention, the ZPD-appropriate assistance identified in Section 2.2.1 must come from elsewhere,
and the student body is the only remaining source of sufficient scale. Peer learning in this
context is not an enrichment activity but a structural necessity.

**Existing digital practice is communication-rich and discovery-poor.** As noted in Section 2.5.3,
WhatsApp is deeply embedded in Ghanaian student study practice. This is significant for two
reasons: it establishes that the target population is already comfortable with the interaction
model FindOut employs, reducing adoption friction; and it identifies precisely the missing
capability — discovery — that the existing tool cannot supply.

**Cost sensitivity excludes subscription alternatives.** Paid platforms such as Chegg are not a
realistic option for the majority of the target population, which reinforces the requirement that
the solution be free at point of use.

> **Note to author — this section requires your attention before submission.**
> The sources cited here are real but are older than ideal (2012, 2019) and are not specific to
> the University of Ghana. Your supervisor will expect current, local evidence. Two actions:
> (1) obtain recent enrolment and staffing figures from the University of Ghana Basic Statistics
> publication or your department's own records, and cite them directly; (2) use your own survey
> data (the instrument in the SRS, Appendix D) as primary evidence of the problem in your
> specific context. Primary data you collected is stronger evidence than a decade-old study of a
> different university, and it is defensible in a viva in a way that borrowed statistics are not.
> **Do not present any figure you have not personally sourced.**

---

## 2.7 Comparative Analysis

Table 2.1 compares reviewed systems against the capabilities required to address the problem
identified in Chapter 1.

**Table 2.1**

*Comparison of Existing Systems Against Required Capabilities*

| System / category | Declared teach–learn intent | Subject-level matching | Competency verification | Integrated real-time messaging | Persistent subject groups | Cross-course scope | Free at point of use |
|---|---|---|---|---|---|---|---|
| LMS (Moodle, Classroom) | ✗ | ✗ (enrolment-based) | ✗ | Partial (forums) | ✓ (by class) | ✗ | ✓ |
| Brainly / Chegg | ✗ | ✓ (per question) | Partial (Chegg experts) | ✗ | ✗ | ✓ | ✗ / Partial |
| Stack Overflow | ✗ | ✓ (tags) | Partial (reputation) | ✗ | ✗ | ✓ | ✓ |
| WhatsApp / Discord | ✗ | ✗ | ✗ | ✓ | ✓ (not subject-derived) | ✓ | ✓ |
| StudyStream / Focusmate | ✗ | ✗ (by design) | ✗ | ✓ | ✗ | ✓ | Partial |
| RiPPLE (Potts et al., 2018) | ✗ (inferred) | ✓ (within course) | Inferred, not assessed | ✗ | Partial | ✗ (single course) | ✓ (institution-deployed) |
| MOOC RRS (Prabhakar et al., 2017) | ✗ | Partial (interests) | ✗ | ✗ | ✗ | ✗ (single MOOC) | Research prototype |
| Mentorship networks | ✓ (career) | ✗ (not academic subjects) | Partial (endorsements) | ✓ | ✗ | ✓ | Partial |
| **FindOut (this project)** | **✓ (self-declared)** | **✓ (fuzzy, free-text)** | **✓ (assessment-gated badge)** | **✓** | **✓ (subject-scoped)** | **✓** | **✓** |

*Note.* ✓ = capability present; ✗ = absent; Partial = present in limited form.

---

## 2.8 Research Gap

### 2.8.1 Correction to the initially stated gap

An earlier formulation of this project's contribution held that no existing system performs
complementary teach–learn matching for peer learning. **The literature reviewed in Section 2.3.3
does not support that claim, and it is withdrawn.** Reciprocal recommendation for learning is an
established research area: Potts et al. (2018) implemented reciprocal peer recommendation in
RiPPLE, and Prabhakar et al. (2017) built a reciprocal recommender for MOOC learners. Any claim
of novelty must be stated relative to that work.

This correction strengthens rather than weakens the project. It situates FindOut within a
recognised research tradition — reciprocal recommender systems (Palomares et al., 2021) — which
provides established terminology, evaluation practice and comparators, and it demonstrates
engagement with the current literature. A narrower, accurate claim is defensible in examination;
an overstated one is not.

### 2.8.2 The gap as accurately stated

Synthesising Sections 2.2 through 2.7, four specific deficiencies remain unaddressed:

**Gap 1 — Matching signals depend on data the system must first accumulate.** Existing
educational reciprocal recommenders infer suitability from platform interaction history (RiPPLE)
or from demographic and interest attributes (MOOC RRS). Neither uses an **explicitly self-declared,
user-controlled instructional role** as the primary matching signal. The distinction has practical
consequences: a declared-intent model produces useful matches from a user's first session,
requires no institutional data, and lets the user control their own availability directly. Its
costs — dependence on honest declaration, and inability to learn from outcomes — are real and are
addressed in this project through competency verification and identified as future work
respectively.

**Gap 2 — Existing systems are bounded by a course or cohort.** RiPPLE operates within a course
via LMS integration; the MOOC recommender within a single MOOC. Neither addresses a student who
needs help in one subject while able to teach another *in a different course*, nor a student
seeking help outside any enrolled course. A standalone, institution-agnostic platform spanning
all of a student's subjects simultaneously occupies a different design point.

**Gap 3 — Matching is separated from the interaction it is supposed to enable.** In Terveen and
McDonald's (2005) four-stage model, existing educational recommenders address modelling, matching
and introduction, then hand users off to some external channel for interaction. Where that
channel is a general messaging platform, the platform providing discovery loses all visibility of
outcome, and the user bears the friction of a context switch at exactly the moment when initiating
contact is most socially costly. Integrating all four stages — as FindOut does — is a design
position that the literature discusses but that deployed educational systems have not generally
taken.

**Gap 4 — Trust mechanisms require accumulated history.** Reputation systems (Jøsang et al., 2007;
Resnick & Zeckhauser, 2002) and inferred-competence models (Khosravi et al., 2019) both require
interaction volume before yielding an informative signal, leaving early users unserved. An
assessment-gated, per-subject competency badge earnable immediately and independently of history
addresses the trust problem at platform launch, when it is most acute.

Additionally, no reviewed system addresses these requirements for the **sub-Saharan African
tertiary context** characterised in Section 2.6, where LMS penetration is limited, staff-student
ratios are adverse, general messaging platforms dominate student practice, and subscription
services are not affordable.

### 2.8.3 Statement of contribution

> This project contributes the design, implementation and evaluation of a **standalone,
> institution-agnostic reciprocal recommender system for peer learning** that uses
> **explicitly self-declared instructional intent** combined with **fuzzy free-text subject
> matching** as its primary matching signal, integrates all four stages of the social matching
> process (Terveen & McDonald, 2005) within a single artefact, and employs **assessment-gated
> per-subject competency verification** as a history-independent trust mechanism.

Each element of this claim is verifiable against the implemented system, and each is positioned
relative to identified prior work rather than asserted as unprecedented.

---

## 2.9 Chapter Summary

This chapter established the pedagogical and computational foundations for the present project.

Section 2.2 demonstrated that peer learning rests on sound theory (Vygotsky's ZPD) and substantial
empirical evidence, with a meta-analytic effect size of *g* = 0.480 in higher education (Zhang et
al., 2025), that benefits accrue to helper as well as helped (Roscoe & Chi, 2007; Topping, 2005),
and that group composition determines collaborative outcome — justifying this project's focus on
matching rather than on collaboration tooling. Critically, that literature assumes pairings are
administratively arranged and does not address how partners locate one another.

Section 2.3 located that unaddressed question within the reciprocal recommender systems
literature (Palomares et al., 2021; Pizzato et al., 2010; Terveen & McDonald, 2005), establishing
that FindOut is properly characterised as an RRS applied to peer learning, and reviewed the two
closest prior applications in education (Potts et al., 2018; Prabhakar et al., 2017). It further
justified content-based over collaborative-filtering matching by reference to the continuous
cold-start conditions of a student population.

Section 2.4 examined trust formation between unacquainted peers, establishing that conventional
reputation systems possess their own cold-start limitation and motivating assessment-gated
verification as the alternative.

Sections 2.5 to 2.7 reviewed available systems, showing that communication-capable platforms lack
discovery while discovery-capable research platforms are course-bounded and communication-poor.

Section 2.8 corrected an overstated novelty claim and restated the contribution accurately as
four specific gaps relative to identified prior work.

Chapter 3 presents the methodology by which these requirements were translated into a working
system.

---

## 2.10 References

*APA 7th edition. Verification key:* **[V]** *= bibliographic record retrieved and confirmed
during this review;* **[C]** *= canonical work cited from established scholarship — confirm the
record in your library catalogue before submission.*

Adomavicius, G., & Tuzhilin, A. (2005). Toward the next generation of recommender systems: A survey of the state-of-the-art and possible extensions. *IEEE Transactions on Knowledge and Data Engineering, 17*(6), 734–749. **[C]**

Bloom, B. S. (1984). The 2 sigma problem: The search for methods of group instruction as effective as one-to-one tutoring. *Educational Researcher, 13*(6), 4–16. https://doi.org/10.3102/0013189X013006004 **[V]**

Boud, D., Cohen, R., & Sampson, J. (Eds.). (2001). *Peer learning in higher education: Learning from and with each other*. Kogan Page. **[C]**

Chi, M. T. H. (2009). Active–constructive–interactive: A conceptual framework for differentiating learning activities. *Topics in Cognitive Science, 1*(1), 73–105. **[C]**

Dillenbourg, P. (1999). What do you mean by collaborative learning? In P. Dillenbourg (Ed.), *Collaborative learning: Cognitive and computational approaches* (pp. 1–19). Elsevier. **[C]**

Jøsang, A., Ismail, R., & Boyd, C. (2007). A survey of trust and reputation systems for online service provision. *Decision Support Systems, 43*(2), 618–644. **[C]**

Khosravi, H., Kitto, K., & Williams, J. J. (2019). RiPPLE: A crowdsourced adaptive platform for recommendation of learning activities. *Journal of Learning Analytics, 6*(3), 91–105. **[V]**

Kollock, P. (1999). The economies of online cooperation: Gifts and public goods in cyberspace. In M. A. Smith & P. Kollock (Eds.), *Communities in cyberspace* (pp. 220–239). Routledge. **[C]**

Lave, J., & Wenger, E. (1991). *Situated learning: Legitimate peripheral participation*. Cambridge University Press. **[C]**

Levenshtein, V. I. (1966). Binary codes capable of correcting deletions, insertions, and reversals. *Soviet Physics Doklady, 10*(8), 707–710. **[C]**

Maqtary, N., Mohsen, A., & Bechkoum, K. (2019). Group formation techniques in computer-supported collaborative learning: A systematic literature review. *Technology, Knowledge and Learning, 24*(2), 169–190. https://doi.org/10.1007/s10758-017-9332-1 **[V]**

Palomares, I., Porcel, C., Pizzato, L., Guy, I., & Herrera-Viedma, E. (2021). Reciprocal recommender systems: Analysis of state-of-art literature, challenges and opportunities towards social recommendation. *Information Fusion, 69*, 103–127. https://doi.org/10.1016/j.inffus.2020.12.001 **[V]**

Pizzato, L., Rej, T., Chung, T., Koprinska, I., & Kay, J. (2010). RECON: A reciprocal recommender for online dating. In *Proceedings of the Fourth ACM Conference on Recommender Systems (RecSys '10)* (pp. 207–214). ACM. https://doi.org/10.1145/1864708.1864747 **[V]**

Pizzato, L., Rej, T., Akehurst, J., Koprinska, I., Yacef, K., & Kay, J. (2013). Recommending people to people: The nature of reciprocal recommenders with a case study in online dating. *User Modeling and User-Adapted Interaction, 23*(5), 447–488. https://doi.org/10.1007/s11257-012-9125-0 **[V]**

Potts, B. A., Khosravi, H., Reidsema, C., Bakharia, A., Belonogoff, M., & Fleming, M. (2018). Reciprocal peer recommendation for learning purposes. In *Proceedings of the 8th International Conference on Learning Analytics and Knowledge (LAK '18)* (pp. 226–235). ACM. https://doi.org/10.1145/3170358.3170400 **[V]**

Prabhakar, S., Spanakis, G., & Zaiane, O. (2017). Reciprocal recommender system for learners in massive open online courses (MOOCs). In *Advances in Web-Based Learning – ICWL 2017* (pp. 157–167). Springer. https://doi.org/10.1007/978-3-319-66733-1_17 **[V]**

Resnick, P., & Zeckhauser, R. (2002). Trust among strangers in internet transactions: Empirical analysis of eBay's reputation system. In M. R. Baye (Ed.), *The economics of the internet and e-commerce* (pp. 127–157). Emerald. **[C]**

Ricci, F., Rokach, L., & Shapira, B. (Eds.). (2011). *Recommender systems handbook*. Springer. **[C]**

Roscoe, R. D., & Chi, M. T. H. (2007). Understanding tutor learning: Knowledge-building and knowledge-telling in peer tutors' explanations and questions. *Review of Educational Research, 77*(4), 534–574. https://doi.org/10.3102/0034654307309920 **[V]**

Scaria, N., Chenna, S. D., & Subramani, D. (2024). Automated educational question generation at different Bloom's skill levels using large language models: Strategies and evaluation. In *Artificial Intelligence in Education (AIED 2024)*. Springer. https://doi.org/10.1007/978-3-031-64299-9_12 **[V]**

Stahl, G., Koschmann, T., & Suthers, D. (2006). Computer-supported collaborative learning: An historical perspective. In R. K. Sawyer (Ed.), *The Cambridge handbook of the learning sciences* (pp. 409–426). Cambridge University Press. **[C]**

Terveen, L., & McDonald, D. W. (2005). Social matching: A framework and research agenda. *ACM Transactions on Computer-Human Interaction, 12*(3), 401–434. https://doi.org/10.1145/1096737.1096740 **[V]**

Topping, K. J. (2005). Trends in peer learning. *Educational Psychology, 25*(6), 631–645. https://doi.org/10.1080/01443410500345172 **[V]**

Vygotsky, L. S. (1978). *Mind in society: The development of higher psychological processes*. Harvard University Press. **[C]**

Wenger, E. (1998). *Communities of practice: Learning, meaning, and identity*. Cambridge University Press. **[C]**

World Education Services. (2019). *Education in Ghana*. WENR. https://wenr.wes.org/2019/04/education-in-ghana **[V]**

Yelkpieri, D., Namale, M., Esia-Donkoh, K., & Ofosu-Dwamena, E. (2012). Effects of large class size on effective teaching and learning at the Winneba campus of the UEW (University of Education, Winneba), Ghana. *US-China Education Review, A*(3), 319–332. **[V — confirm volume/issue formatting]**

Zhang, C., Sun, N., Jiang, Y., Liu, H., & Huang, Q. (2025). The impact of peer tutoring programs on students' academic performance in higher education: A meta-analysis. *The Asia-Pacific Education Researcher, 34*, 1495–1506. https://doi.org/10.1007/s40299-024-00960-0 **[V]**

### 2.10.1 Sources to add before submission

The following areas are cited above at the level of consensus findings rather than to specific
studies. Locate two or three specific papers in each, read them, and cite them directly.

| Area | Suggested search terms | Where used |
|---|---|---|
| Digital badges and micro-credentials | "digital badges higher education motivation systematic review"; "micro-credentials signalling value" | §2.4.3 |
| University of Ghana enrolment and staffing | *University of Ghana Basic Statistics*; institutional annual report | §2.6 |
| WhatsApp in Ghanaian student study practice | "WhatsApp study habits university students Ghana" | §2.5.3, §2.6 |
| Self-determination theory (if you retain the motivation argument) | Deci & Ryan (1985, 2000) | §2.2.3 |

---

## Appendix 2A — Author's checklist for this chapter

- [ ] Every **[C]** reference confirmed against the library catalogue
- [ ] Every source cited substantively has been read
- [ ] Sources added for the four areas in §2.10.1
- [ ] §2.6 supplemented with current University of Ghana figures and your own survey data
- [ ] Reference list reformatted to your department's required style if not APA 7th
- [ ] Chapter cross-references updated to match final chapter numbering
- [ ] Table 2.1 checked against the final feature set of the implemented system
- [ ] Departmental policy on AI assistance checked and declaration made if required
