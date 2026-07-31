#!/usr/bin/env python3
"""
build-thesis.py — assemble the five chapters into a submission-ready DOCX.

What it does:
  1. Strips the working notes: "Note to author" blocks, author checklists and
     any other guidance that belongs to the drafting process, not the thesis.
  2. Replaces Mermaid code blocks in Chapter 3 with the rendered PNG figures.
  3. Turns remaining screenshot placeholders into a visible, clearly-marked
     insertion point rather than leaving instructional prose in the document.
  4. Prepends the front matter: title page, declaration, abstract,
     acknowledgements, then generated table of contents.
  5. Converts to DOCX with Pandoc using a reference document that carries the
     thesis styling.

Usage:
    python3 scripts/build-thesis.py
    python3 scripts/build-thesis.py --output FindOut-Thesis.docx

Requires: pandoc. Diagram PNGs are expected in docs/images/ (see the mermaid
rendering step in the project README).
"""

import argparse
import re
import subprocess
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
DOCS = ROOT / "docs"          # chapters, figures and generated documents

CHAPTERS = [
    "chapter1-problem-identification.md",
    "chapter2-literature-review.md",
    "chapter3-methodology.md",
    "chapter4-implementation.md",
    "chapter5-results-testing-discussion.md",
]


# ── DOCX primitives ────────────────────────────────────────────────────────
# Pandoc's markdown has no page break, and the LaTeX \newpage is ignored by the
# docx writer, so raw OpenXML is used.
PAGEBREAK = "\n```{=openxml}\n<w:p><w:r><w:br w:type=\"page\"/></w:r></w:p>\n```\n"


def word_field(instr: str, placeholder: str) -> str:
    """A live Word field. Word fills it in on Update Field (Ctrl+A, then F9),
    so the contents stay correct if the author edits the document."""
    return (
        "\n```{=openxml}\n"
        "<w:p><w:r><w:fldChar w:fldCharType=\"begin\" w:dirty=\"true\"/></w:r>"
        f"<w:r><w:instrText xml:space=\"preserve\"> {instr} </w:instrText></w:r>"
        "<w:r><w:fldChar w:fldCharType=\"separate\"/></w:r>"
        f"<w:r><w:t>{placeholder}</w:t></w:r>"
        "<w:r><w:fldChar w:fldCharType=\"end\"/></w:r></w:p>\n"
        "```\n"
    )


# ── Metadata. Edit these before submitting. ─────────────────────────────────
META = {
    "title": "FindOut: A Reciprocal Recommender System for Peer Learning",
    "subtitle": "Matching Students Who Want to Learn with Students Willing to Teach",
    "author": "[YOUR FULL NAME]",
    "student_id": "[YOUR STUDENT ID]",
    "supervisor": "[SUPERVISOR'S NAME]",
    "department": "Department of Computer Science",
    "university": "University of Ghana, Legon",
    "degree": "Bachelor of Science in Computer Science",
    "month_year": "July 2026",
}


# ───────────────────────────────────────────────────────────────────────────
# Cleaning
# ───────────────────────────────────────────────────────────────────────────

def strip_author_notes(text: str) -> str:
    """Remove the '> **Note to author.**' block-quotes."""
    out, lines, i = [], text.split("\n"), 0
    while i < len(lines):
        if lines[i].startswith("> **Note to author"):
            while i < len(lines) and (lines[i].startswith(">") or lines[i].strip() == ">"):
                i += 1
            # swallow a trailing rule and blank lines the block left behind
            while i < len(lines) and lines[i].strip() in ("", "---"):
                i += 1
            continue
        out.append(lines[i])
        i += 1
    return "\n".join(out)


def strip_checklists(text: str) -> str:
    """Remove 'Appendix nA — Author's checklist' sections through to the end
    or the next top-level heading."""
    pattern = re.compile(
        r"\n---\n+## Appendix \d+[A-Z] — Author'?s checklist.*?(?=\n## (?!Appendix \d+[A-Z] — Author)|\Z)",
        re.S,
    )
    return pattern.sub("\n", text)


# Headings that are production guidance rather than thesis content. Each is
# removed along with everything up to the next heading of the same level.
GUIDANCE_SECTIONS = [
    (r"## 4\.11 Screenshot Capture Checklist", r"\n## "),
    (r"### 2\.10\.1 Sources to add before submission", r"\n## "),
    (r"## 3\.17 Note on Diagram Formats", r"\n## "),
    (r"## 5\.12 Screenshots Required", r"\n## "),
]


def strip_guidance_sections(text: str) -> str:
    """Remove sections that instruct the author rather than inform the reader."""
    for heading, stop in GUIDANCE_SECTIONS:
        text = re.sub(
            r"\n-*\n*" + heading + r".*?(?=" + stop + r"|\Z)",
            "\n",
            text,
            flags=re.S,
        )
    return text


def strip_italic_notes(text: str) -> str:
    """Remove standalone '*Note to author: ...*' paragraphs and '> **Note to
    author:** ...' asides that are not full block-quotes."""
    # italic paragraph form
    text = re.sub(r"\n\*Note to author[:,].*?\*\n", "\n", text, flags=re.S)
    # single block-quote line form
    out, lines, i = [], text.split("\n"), 0
    while i < len(lines):
        if re.match(r"> \*\*Note to author", lines[i]):
            while i < len(lines) and lines[i].lstrip().startswith(">"):
                i += 1
            while i < len(lines) and lines[i].strip() == "":
                i += 1
            continue
        out.append(lines[i])
        i += 1
    return "\n".join(out)


def strip_inline_guidance(text: str) -> str:
    """Remove the '> **Note to author — ...**' inline asides and the
    '> **[YOUR DATA]**' instructional italics, leaving a clean marker."""
    # inline "Note to author" asides
    out, lines, i = [], text.split("\n"), 0
    while i < len(lines):
        stripped = lines[i].lstrip()
        if stripped.startswith("> **Note to author") or stripped.startswith("> **Note for the report"):
            while i < len(lines) and lines[i].lstrip().startswith(">"):
                i += 1
            while i < len(lines) and lines[i].strip() == "":
                i += 1
            continue
        out.append(lines[i])
        i += 1
    text = "\n".join(out)

    # "[YOUR DATA]" placeholders become a neutral marker
    text = re.sub(
        r"> \*\*`\[YOUR DATA\]`\*\*.*?(?=\n\n)",
        "> *[Results to be inserted from the author's own data collection.]*",
        text,
        flags=re.S,
    )
    text = text.replace("**`[YOUR DATA]`**", "*[To be completed]*")
    text = text.replace("`[YOUR DATA]`", "*[To be completed]*")
    return text



def strip_status_markers(text: str) -> str:
    """Remove the drafting status annotations from headings and prose.

    The chapters mark which sections carry measured results and which await the
    author's own data. That is useful while writing and out of place in a
    submitted document."""
    # heading annotations
    text = re.sub(r"\s*(✅ MEASURED|⬜ YOUR DATA|✅ ANSWERED|⬜ REQUIRES PARTICIPANT DATA)\b", "", text)
    text = re.sub(r"^(#{1,4} .*?)\s+—\s*$", r"\1", text, flags=re.M)
    text = text.replace("**✅ MEASURED**", "").replace("**⬜ YOUR DATA**", "")

    # "your data" prompts become neutral statements of status
    text = re.sub(r"⬜ \*\*Your data\.\*\*\s*", "", text)
    text = text.replace("⬜ Your data", "To be completed")
    text = text.replace("⬜ YOUR DATA", "To be completed")

    # tick marks in status columns read as draft annotations in a submitted
    # document; the words alone carry the same meaning
    for glyph in ("✅ ", "⏳ ", "⬜ "):
        text = text.replace(glyph, "")
    text = text.replace("✅", "Yes").replace("⬜", "").replace("☐", "")
    text = text.replace("| Yes |", "| Yes |")
    return text


def renumber_sections(text: str, chapter_no: int) -> str:
    """Close the gaps left by removed sections and fix cross-references.

    Stripping a guidance section leaves a hole in the numbering (5.11 then
    5.13), which reads as an error in a finished document."""
    headings = re.findall(rf"^## {chapter_no}\.(\d+) ", text, flags=re.M)
    if not headings:
        return text

    mapping, next_no = {}, 1
    for old in headings:
        mapping[old] = str(next_no)
        next_no += 1
    if all(o == n for o, n in mapping.items()):
        return text  # nothing moved

    # headings first
    def head_repl(m):
        return f"## {chapter_no}.{mapping[m.group(1)]} "
    text = re.sub(rf"^## {chapter_no}\.(\d+) ", head_repl, text, flags=re.M)

    # then sub-headings that hang off them
    def sub_repl(m):
        return f"### {chapter_no}.{mapping.get(m.group(1), m.group(1))}.{m.group(2)} "
    text = re.sub(rf"^### {chapter_no}\.(\d+)\.(\d+) ", sub_repl, text, flags=re.M)

    # and finally the in-text cross-references
    def ref_repl(m):
        old = m.group(1)
        return f"§{chapter_no}.{mapping.get(old, old)}" + (m.group(2) or "")
    text = re.sub(rf"§{chapter_no}\.(\d+)(\.\d+)?", ref_repl, text)
    return text


def replace_mermaid_with_images(text: str, chapter_no: int) -> str:
    """Swap Mermaid source blocks for the rendered PNGs, in document order."""
    counter = {"n": 0}

    def repl(_m):
        counter["n"] += 1
        img = DOCS / "images" / f"fig-{chapter_no}.0{counter['n']}-diagram.png"
        if not img.exists():
            return _m.group(0)  # leave the source if the render is missing
        return f"![](images/{img.name})"

    return re.sub(r"```mermaid\n.*?```", repl, text, flags=re.S)


def convert_screenshot_placeholders(text: str) -> str:
    """Turn the remaining '[SCREENSHOT n]' block-quotes into a single visible
    insertion marker plus the caption, so the document reads cleanly."""
    out, lines, i = [], text.split("\n"), 0
    while i < len(lines):
        if lines[i].startswith("> **[SCREENSHOT "):
            block = []
            while i < len(lines) and (lines[i].startswith(">") or lines[i].strip() == ">"):
                block.append(lines[i])
                i += 1
            joined = "\n".join(block)
            num = re.search(r"\[SCREENSHOT (\d+\.\d+)\]", joined)
            cap = re.search(r"\*Caption: \*\*Figure [\d.]+\.\*\*(.*?)\*\s*$", joined, re.S)
            caption = " ".join(cap.group(1).split()).strip() if cap else ""
            n = num.group(1) if num else "?"
            out.append(f"> **[ FIGURE {n} — SCREENSHOT TO BE INSERTED ]**")
            out.append("")
            out.append(f"**Figure {n}.** *{caption}*")
            continue
        out.append(lines[i])
        i += 1
    return "\n".join(out)


def demote_headings(text: str) -> str:
    """Chapters use '# CHAPTER X' + '# TITLE' on two lines. Collapse to a
    single level-1 heading so the table of contents is clean."""
    text = re.sub(
        r"^# (CHAPTER [A-Z]+)\n# ([A-Z][A-Z \-&,]+)\n",
        lambda m: f"# {m.group(1).title()}: {m.group(2).title()}\n",
        text,
    )
    return text


def strip_leading_rule(text: str) -> str:
    return re.sub(r"\A\s*---\s*\n", "", text)


# ───────────────────────────────────────────────────────────────────────────
# Front matter
# ───────────────────────────────────────────────────────────────────────────

def front_matter() -> str:
    m = META
    pb = PAGEBREAK
    toc = word_field('TOC \\o "1-3" \\h \\z \\u',
                     "Right-click and choose Update Field to build the table of contents.")
    lof = word_field('TOC \\h \\z \\c "Figure"',
                     "Right-click and choose Update Field to build the list of figures.")
    lot = word_field('TOC \\h \\z \\c "Table"',
                     "Right-click and choose Update Field to build the list of tables.")
    return f"""
::: {{custom-style="TitlePage"}}
# {m['title']}
:::

**{m['subtitle']}**

\\

**{m['author']}**

{m['student_id']}

\\

A dissertation submitted to the {m['department']},
{m['university']}, in partial fulfilment of the requirements
for the award of the degree of

**{m['degree']}**

\\

Supervised by

**{m['supervisor']}**

\\

{m['month_year']}

{pb}

# Declaration

I hereby declare that this dissertation is the result of my own original
research and that no part of it has been presented for another degree in this
university or elsewhere. All sources of information have been duly
acknowledged.

\\

\\

Signature: .................................................
Date: ..............................

**{m['author']}** ({m['student_id']})

\\

\\

I hereby certify that this dissertation was supervised in accordance with
procedures laid down by the university.

\\

\\

Signature: .................................................
Date: ..............................

**{m['supervisor']}** (Supervisor)

{pb}

# Abstract

Students who need help with a subject and students able to provide that help
exist within the same institution at the same time, yet have no reliable
mechanism for finding one another. This is not a pedagogical problem — the
capacity to resolve a given difficulty already exists within the student
body — but a problem of visibility and matching. The peer learning literature
establishes that peer tutoring is effective in higher education, with a
reported meta-analytic effect size of *g* = 0.480 across twenty-seven studies,
and that benefits accrue to the tutor as well as the tutee. That literature,
however, consistently assumes pairings are arranged administratively and does
not address how partners locate each other.

This dissertation presents the design, implementation and evaluation of
**FindOut**, a web-based platform that addresses the matching problem
directly. The system is characterised as a *reciprocal recommender system*
applied to peer learning: a recommendation succeeds only when it satisfies both
parties. Its distinguishing feature relative to prior educational reciprocal
recommenders is that it matches on **explicitly self-declared instructional
intent** rather than on competence inferred from platform activity or on
demographic profile attributes. This produces useful matches from a user's
first session, addressing the continuous cold-start conditions of a student
population, at the acknowledged cost of being unable to learn from outcomes.

The platform was built following Design Science Research. It combines a
complementary-intent matching algorithm using four-tier fuzzy subject
matching, assessment-gated per-subject competency verification as a
history-independent trust mechanism, real-time messaging, and subject-scoped
study groups with a three-level privacy model, within a single artefact — so
that discovery, introduction and interaction are not separated across
applications.

Evaluation combined unit testing, empirical scalability measurement and a
user study. Unit testing of the matching component passed thirteen of fifteen
cases and exposed a normalisation defect in which symbol-bearing subject names
collapse to a single character. Scalability measurement confirmed the
predicted linear complexity empirically at approximately 37 ms per 1,000
users, establishing that the current design is adequate to roughly 10,000
users and requires redesign beyond approximately 25,000.

**Keywords:** peer learning, reciprocal recommender systems, educational
technology, student matching, competency verification, real-time
collaboration

{pb}

# Acknowledgements

*[Acknowledge your supervisor, department, participants in the evaluation, and
anyone else who assisted. Replace this paragraph before submission.]*

{pb}

# Table of Contents

{toc}

{pb}

# List of Figures

{lof}

{pb}

# List of Tables

{lot}

{pb}
"""


CHAPTER_TITLES = {
    1: "Problem Identification",
    2: "Literature Review",
    3: "Methodology",
    4: "Implementation",
    5: "Results, Testing and Discussion",
}

WORDS = {1: "One", 2: "Two", 3: "Three", 4: "Four", 5: "Five"}


def chapter_cover(numbers) -> str:
    """A short cover for a single-chapter submission, rather than the full
    thesis front matter."""
    m = META
    if len(numbers) == 1:
        n = numbers[0]
        heading = f"Chapter {WORDS[n]}: {CHAPTER_TITLES[n]}"
    else:
        heading = "Chapters " + ", ".join(str(n) for n in numbers)
    # bold, not a heading — the chapter supplies its own H1, and two would
    # duplicate the entry in the contents list

    toc = word_field('TOC \\o "1-3" \\h \\z \\u',
                     "Right-click and choose Update Field to build the contents.")
    return f"""
**{m['title']}**

*{m['subtitle']}*

\\

**{heading}**

\\

**{m['author']}**  ·  {m['student_id']}

{m['department']}, {m['university']}

Supervisor: {m['supervisor']}

{m['month_year']}

{PAGEBREAK}

# Contents

{toc}

{PAGEBREAK}
"""


# ───────────────────────────────────────────────────────────────────────────
# Build
# ───────────────────────────────────────────────────────────────────────────

def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("--output", default=None,
                    help="output filename (defaults to the full thesis, or "
                         "FindOut-ChapterN.docx when --chapters is given)")
    ap.add_argument("--chapters", default=None,
                    help="build a subset, e.g. --chapters 5 or --chapters 3,4,5. "
                         "Omit for the whole thesis.")
    ap.add_argument("--keep-markdown", action="store_true",
                    help="also write the combined markdown next to the DOCX")
    args = ap.parse_args()

    if args.chapters:
        try:
            selected = [int(x) for x in args.chapters.replace(" ", "").split(",")]
        except ValueError:
            print("--chapters expects numbers, e.g. 5 or 3,4,5", file=sys.stderr)
            return 1
        bad = [n for n in selected if n not in range(1, len(CHAPTERS) + 1)]
        if bad:
            print(f"no such chapter: {bad}", file=sys.stderr)
            return 1
        parts = [chapter_cover(selected)]
        default_name = ("FindOut-Chapter%s.docx" %
                        "-".join(str(n) for n in selected))
    else:
        selected = list(range(1, len(CHAPTERS) + 1))
        parts = [front_matter()]
        default_name = "FindOut-Thesis.docx"

    output_name = args.output or default_name

    for idx, name in enumerate(CHAPTERS, start=1):
        if idx not in selected:
            continue
        path = DOCS / name
        if not path.exists():
            print(f"missing: {name}", file=sys.stderr)
            return 1
        text = path.read_text()

        text = strip_author_notes(text)
        text = strip_inline_guidance(text)
        text = strip_italic_notes(text)
        text = strip_checklists(text)
        text = strip_guidance_sections(text)
        text = strip_status_markers(text)
        text = renumber_sections(text, idx)
        if idx == 3:
            text = replace_mermaid_with_images(text, 3)
        text = convert_screenshot_placeholders(text)
        text = demote_headings(text)
        text = strip_leading_rule(text)

        parts.append(text.strip())
        parts.append(PAGEBREAK)

    combined = "\n\n".join(parts)

    tmp_md = DOCS / ".thesis-combined.md"
    tmp_md.write_text(combined)

    out = DOCS / output_name
    ref = ROOT / "scripts" / "thesis-reference.docx"

    cmd = [
        "pandoc", str(tmp_md),
        "-f", "markdown+pipe_tables+raw_tex",
        "-t", "docx",
        "-o", str(out),
        "--resource-path", str(DOCS),
    ]
    if ref.exists():
        cmd += ["--reference-doc", str(ref)]

    print("Running pandoc...")
    r = subprocess.run(cmd, capture_output=True, text=True)
    if r.returncode != 0:
        print(r.stderr, file=sys.stderr)
        return 1
    if r.stderr.strip():
        print(r.stderr.strip()[:800])

    if args.keep_markdown:
        (DOCS / output_name.replace(".docx", ".md")).write_text(combined)
    else:
        tmp_md.unlink(missing_ok=True)

    size = out.stat().st_size / 1024
    print(f"\nWrote {out.relative_to(ROOT)}  ({size:.0f} KB)")
    print("\nBefore submitting, edit META at the top of this script with your")
    print("name, student ID and supervisor, then re-run.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
