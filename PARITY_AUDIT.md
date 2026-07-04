# Chegg Feature-Parity Audit

Audit only — nothing in this document has been built beyond what's marked
built. Chegg's feature set is as of early 2026 (knowledge-based; worth a
15-minute re-check against chegg.com before acting, since they've been
restructuring). Our differentiators, used for every recommendation:
**verified-by-real-tutors accuracy · 24/7 live human chat · affordability
($7/mo vs. their ~$15.95–19.95) · ADHD-friendly UX**.

Statuses: **BUILT** (working now, verified in browser) · **PARTIAL**
(exists, gap noted) · **PLANNED** (already in BUILD_PLAN/spec as phase 2)
· **NOT COVERED** (nowhere in plan until now).

## Core study features (Chegg Study / Study Pack)

| Chegg feature | What it is | Our status | Where it lives / what's missing | Recommendation |
| --- | --- | --- | --- | --- |
| Expert Q&A (24/7 ask-an-expert) | Submit a question, a subject expert answers asynchronously | **BUILT — and stronger** | Community Q&A + verified-tutor answers with required step-by-step reasoning, subject-broadcast routing, 15-min delay notice, 30-min multi-tutor escalation, "Verified by N tutors" agreement badges, dispute review board. Chegg has none of the cross-checking. | Done. This is the core loop — keep polishing, don't add. |
| Searchable solutions library (~46M answers) | Search past answered questions before asking | **PARTIAL** | `/questions?q=` search + duplicate-lookup on the ask form (built). The gap is corpus size: theirs is 46M, ours starts near zero. | Launch as-is. The corpus gap only closes by operating; consider seeding it by having early tutors answer the ~200 most-Googled questions per subject as content marketing. |
| Textbook solutions (step-by-step manuals for 9k+ textbooks) | Licensed, per-edition worked solutions for every problem in the book | **PARTIAL** (different approach) | We tag questions with textbook/edition/course and search by them (built). We do NOT have licensed solution manuals. | **Deliberately skip the licensed-manual model** — it's capital-intensive, legally fraught, and it's the exact commodity LLMs gutted. Our organic, tutor-verified, textbook-tagged answer bank is the defensible version of the same student need. |
| Photo-to-search (snap a problem, find the solution) | Camera search in the mobile app | **NOT COVERED** (flagged as deferred in BUILD_PLAN) | Nothing built. | **Phase 2, high priority** — it's the single biggest UX gap for mobile students and pairs naturally with our answer bank. Needs a vision-model design pass; do it as its own round. |
| Video explanations | Video walkthroughs on some solutions | **PARTIAL** | `Answer.videoUrl` field exists; no upload/record UI. | Phase 2, after file storage moves to S3/R2 (same dependency as photo persistence). Cheap to add then, and video from a real named tutor beats Chegg's anonymous clips. |
| AI study assistant | LLM chat layered over their content | **PARTIAL (deliberately parked)** | `src/lib/ai.ts` synthesis exists but is disabled; zero AI in the active flow. | Keep parked. "Every answer touched by a human tutor" is the trust position — an AI chat undermines it. Revisit only as clearly-labeled synthesis of already-verified answers (the parked design). |

## Practice & memorization (Chegg Study Pack extras)

| Chegg feature | What it is | Our status | Where it lives / what's missing | Recommendation |
| --- | --- | --- | --- | --- |
| Math Solver | Automated step-by-step math + graphing | **PLANNED** (spec phase 2, detailed spec on file) | Nothing built. | Phase 2 as specced — but note it's inherently machine-generated, so it must live visibly apart from the verified-by-humans lane when it comes. |
| Practice problems / practice tests | Generated problem sets per topic/exam | **PLANNED** (spec phase 2) | Nothing built. | Phase 2 per the spec's own "once core loop is proven" gate. |
| Flashcards | Create/study decks (Chegg Prep — free there) | **PLANNED** (spec phase 2) | Nothing built. | Phase 2. Note Chegg gives this away free; when built, ours should be free too (acquisition, not revenue). |
| Study guides | Curated topic summaries | **PLANNED** (spec phase 2) | Nothing built. | Phase 2; can be seeded from our own verified answers per topic, which Chegg can't claim. |

## Live help

| Chegg feature | What it is | Our status | Where it lives / what's missing | Recommendation |
| --- | --- | --- | --- | --- |
| Live human tutoring | **Chegg discontinued this in 2021** | **BUILT — parity-plus** | 24/7 live chat with subject matching, claim-based routing, pay-per-session or subscription, tipping, ratings. | This is the moat — Chegg students literally cannot buy this there anymore. Lead marketing with it. |

## Adjacent Chegg products

| Chegg feature | What it is | Our status | Where it lives / what's missing | Recommendation |
| --- | --- | --- | --- | --- |
| Writing tools (grammar, plagiarism check, citations, proofreading) | EasyBib/Writing suite | **NOT COVERED — deliberately** | Spec marks writing/plagiarism tools out of scope. | Skip permanently: crowded (Grammarly, free LLMs), and plagiarism tooling drags us into the academic-integrity fight we're positioned to stay out of. A citation generator alone is a commodity widget — not worth the surface area. |
| Textbook rental / buyback marketplace | Physical/e-textbook rental | **NOT COVERED** | Nothing, and nothing planned. | Skip permanently: capital-heavy declining legacy business; zero synergy with live tutoring. |
| Internships / career center | Job boards, career advice | **NOT COVERED — deliberately** | Spec marks career boards out of scope. | Skip for launch and phase 2; revisit only if B2B partners ask. |
| Language learning (Busuu) | Chegg-owned language app | **NOT COVERED** | — | Skip. Different product entirely. |
| Solution quality signals | Thumbs ratings on solutions | **BUILT — stronger** | Star ratings + tips (chat), helpful marks, incomplete/incorrect flags feeding tutor routing suppression, endorsements + consensus badges (Q&A). | Done — ours has consequences (routing), theirs is cosmetic. |
| Mobile app | Native iOS/Android | **PARTIAL** | Responsive web with full feature parity (built, spec'd requirement); no native wrapper. | Phase 2 wrapper per spec — do it right after photo-to-search, since camera flow is what makes native worth it. |

## Bottom line for the next build round

1. **No launch blockers found**: every feature a student pays Chegg for
   *and still values in 2026* is either built (Q&A, search, live chat,
   quality signals) or deliberately skipped with a reason.
2. **Highest-leverage gap**: photo-to-search (phase 2, own design round).
3. **Cheap wins after S3/R2 storage lands**: photo persistence + video
   answers in one round.
4. **Everything else** stays behind the spec's own "once the core loop is
   proven" gate: solver, practice, flashcards, study guides, native
   wrapper.
