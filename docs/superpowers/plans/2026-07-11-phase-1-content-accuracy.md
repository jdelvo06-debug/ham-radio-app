# Phase 1 Content Accuracy Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make the App Store app's 2026-2030 Technician content and practice-exam composition match the corrected official NCVEC pool.

**Architecture:** Keep the existing static-export and offline runtime unchanged. Generate the bundled JSON from the checked-in official NCVEC DOCX through one Python pipeline, select one exam question per official group through a pure TypeScript helper, and add optional figure metadata rendered by the existing question surfaces.

**Tech Stack:** Python 3 standard library, Next.js 16, React 19, TypeScript, Node test runner.

## Global Constraints

- Do not change static-export architecture, offline-first storage, responsive layout, entitlements, or release configuration.
- Preserve existing explanations while refreshing official question fields.
- Leave changes uncommitted for Cortana QA and review.

---

### Task 1: Official exam blueprint

**Files:**
- Create: `my-study-app/app/utils/examBlueprint.ts`
- Create: `my-study-app/app/utils/examBlueprint.test.ts`
- Modify: `my-study-app/app/page.tsx`

- [ ] Write a Node test asserting exactly one question from each of the 35 `T0A`-style groups.
- [ ] Run the test and confirm RED because the selector does not exist.
- [ ] Implement `selectOfficialExamQuestions(questions, random)` with Fisher-Yates shuffling within groups.
- [ ] Wire exam mode to the helper and rerun the test GREEN.

### Task 2: Canonical official content pipeline

**Files:**
- Modify: `generate_complete_json.py`
- Create: `tests/test_content_pipeline.py`
- Create: `content/2026-2030-technician-pool-feb-19-2026.docx`
- Delete: the six alternative/incomplete root parser scripts and obsolete `raw_questions.txt`

- [ ] Add failing integrity tests for 409 official IDs/keys, errata wording, full options, figure mapping, derived lesson totals, and parser consolidation.
- [ ] Run the integrity suite and confirm the expected RED failures.
- [ ] Parse the official DOCX using only the Python standard library, preserve authored explanations by ID, derive figure paths and lesson totals, and write the bundled JSON deterministically.
- [ ] Regenerate content and rerun the integrity suite GREEN.

### Task 3: Figure assets and rendering

**Files:**
- Create: `my-study-app/public/figures/technician-t1.jpg`
- Create: `my-study-app/public/figures/technician-t2.jpg`
- Create: `my-study-app/public/figures/technician-t3.jpg`
- Create: `my-study-app/app/components/QuestionFigure.tsx`
- Modify: `my-study-app/app/types.ts`
- Modify: `my-study-app/app/components/QuizView.tsx`
- Modify: `my-study-app/app/components/ResultsView.tsx`

- [ ] Add optional `figure` metadata to `Question`.
- [ ] Download the three NCVEC public-domain diagram JPGs.
- [ ] Render figures through a shared component in Study, Exam, Review, and missed-question review surfaces.
- [ ] Verify references and image files through the integrity suite and Next build.

### Task 4: Derived lesson counts

**Files:**
- Modify: `my-study-app/app/page.tsx`
- Modify: `my-study-app/app/lessons.json`

- [ ] Derive every lesson's displayed `questionCount` from the bundled pool by subelement.
- [ ] Regenerate stored counts to the same authoritative totals and verify all ten counts.

### Task 5: Final verification

**Files:**
- Modify: `ROADMAP.md`

- [ ] Run Node blueprint tests and Python content-integrity tests.
- [ ] Run targeted ESLint on changed TypeScript/TSX files.
- [ ] Run the production static-export build.
- [ ] Run full lint and report any pre-existing/out-of-scope failures exactly.
- [ ] Inspect `git diff --check`, changed files, and roadmap checkbox coverage.
