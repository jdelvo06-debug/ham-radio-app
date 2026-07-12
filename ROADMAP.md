# Ham Radio Study App — Phased Roadmap to App Store Quality

**Created:** 2026-07-11
**Source:** Full project audit by GPT-5.6 (Codex), adjusted per Jeremy's guidance.
**End state:** Accurate exam sim, clean mobile build pipeline, accessible UI, validated content pipeline, App Store update ready.

> **Note:** This app is already published to the App Store. GitHub Pages was the pre-App-Store web deployment only — it is not a release target. Any agent working this roadmap should treat the App Store / Capacitor / iOS path as primary.

---

## Phase 1 — Content Accuracy (Exam Integrity)

*This is the core product. If the exam sim is wrong, nothing else matters.*

- [x] **1.1 Fix exam blueprint.** Exam mode now selects one question from each of the official NCVEC syllabus groups, producing the fixed 35-question distribution.
- [x] **1.2 Apply 4 errata corrections.** T0A10, T1C01, T5A05, T7A09 match the corrected official 2026–2030 pool.
- [x] **1.3 Fix 4 truncated option strings.** T1E11-D, T1F08-D, T2C06-D, T7B11-D match the corrected official pool.
- [x] **1.4 Add question diagrams.** The corrected official pool contains 12 figure-dependent questions (not 13) referencing T-1/T-2/T-3. The data model includes a `figure` field and Study/Exam/Review modes render the official figures.
- [x] **1.5 Consolidate content pipeline.** `generate_complete_json.py` is the single content source, case-sensitive dead branches are removed, and lesson question counts are derived from the pool.

**Verification:** Exam composition matches official blueprint. All 409 IDs + answer keys match official pool. Lesson counts accurate. Diagrams render on all affected questions.

---

## Phase 2 — Build & Mobile Pipeline

*Get the Capacitor → Xcode → App Store chain clean.*

- [ ] **2.1 Fix `build:mobile`.** `next export` was removed from package.json scripts. Reconcile build contract — one build command, static export, Capacitor sync, Xcode compile.
- [ ] **2.2 Remove or replace `npm start`.** Incompatible with `output: 'export'`. Replace with a static server command for local dev convenience or remove from workflow.
- [ ] **2.3 Align version numbers.** UI says 1.3.0, npm says 0.1.0, iOS says 1.0. Pick one versioning scheme and sync across package.json, iOS project, Android project, and in-app display.
- [ ] **2.4 Upgrade Next.js** from 16.0.10 to latest, rerun security audit (7 advisories, mostly tooling-side).
- [ ] **2.5 Add test baseline.** Cover: exam composition, pool integrity (ID + answer key), import schema validation, entitlement states, persistence migrations, primary navigation.

**Verification:** `build:mobile` succeeds end-to-end (build → cap sync → Xcode compile). `npm run lint` clean. Tests pass.

---

## Phase 3 — App Correctness & Security

*Real bugs that can crash the app or leak premium.*

- [ ] **3.1 Fix Android entitlement logic.** `usePremium.ts:44` grants premium without requiring `purchaseState === PURCHASED` and acknowledgement. A pending unacknowledged transaction passes the check. Tighten the predicate.
- [ ] **3.2 Schema-validate imports.** `page.tsx:474` import path only checks truthiness — a crafted `{globalStats:{T1:null}}` crashes the reducer and persists across reloads. Add proper validation before state/storage writes.
- [ ] **3.3 Fix Analytics launch race.** `AnalyticsView.tsx:71` sets subelement and immediately calls `startQuiz()`, which reads stale React state (`page.tsx:591`). Weak-area buttons can launch the wrong question pool. Use `useEffect` or callback ref.
- [ ] **3.4 Guard native purchase calls on web.** `isBillingSupported` logs to browser console. Gate billing calls behind platform detection.

**Verification:** Crafted import rejected gracefully. Weak-area quiz launches correct pool. Entitlement requires verified purchase. No console errors on web.

---

## Phase 4 — UX Polish & Accessibility

*App Store review cares about accessibility. Make it clean.*

- [ ] **4.1 Decide on light mode: finish or remove.** Toggle exists (`SettingsView.tsx:64`) but major views hardcode dark colors and several `darkMode` props are unused. Either complete theming or strip the toggle.
- [ ] **4.2 Accessibility pass.** Theme toggle needs accessible name/state. Onboarding modal needs dialog semantics, focus trapping, Escape handling, named slide controls (`OnboardingModal.tsx:19`). Progress bars need semantic `value` attributes (`QuizView.tsx:80`). Answer feedback needs `aria-live` strategy.
- [ ] **4.3 Fix lint.** `Date.now()` during render error (`page.tsx:275`), 6 unused-prop warnings.
- [ ] **4.4 Replace stale lesson counts** with values derived from the question pool (overlaps Phase 1 content pipeline).

**Verification:** Lint clean. Accessibility audit ( axe or manual) passes. Light mode either fully works or toggle is removed.

---

## Phase 5 — Release Prep

*Final gates before App Store update submission.*

- [x] **5.1 Privacy policy update.** In-app and standalone copy now covers local-only data, no account, no tracking/third-party analytics, Apple App Store purchases, and intended Google Play Billing. The public policy URL still requires release-owner publication/confirmation.
- [x] **5.2 Deployed browser smoke test.** `npm run smoke:static` serves the real static export and verifies CSS/JS, hydration, manifest, service worker readiness, and a question 1-to-2 transition in Chromium.
- [x] **5.3 GitHub Pages fix (optional/low priority).** Removed the obsolete full-app GitHub Pages deployment workflow; GitHub Pages is not an app release target.
- [x] **5.4 Android Gradle verification.** Added a local config/JDK/Gradle gate and CI with JDK 21 running Android unit tests plus lint. Local Gradle execution remains blocked until this Mac has a working Java runtime.
- [x] **5.5 Final App Store review checklist.** `RELEASE_CHECKLIST.md` covers screenshots, metadata, age rating, privacy answers, purchase risks, a TestFlight beta round, version/build bumps, and audit-derived Apple review gates.

**Repository verification:** Privacy source current; static browser smoke green; Android config check green with local Java unavailable. App Store metadata review, public privacy-policy publication, TestFlight beta sign-off, and submission remain release-owner gates in `RELEASE_CHECKLIST.md`.

---

## Leave Alone

- Static-export / offline-first architecture ✓
- Local-only study data model (no backend, no tracking) ✓
- Current responsive mobile layout ✓
- Bundled 409-question dataset ✓

---

## Sequencing

**Phase 1** → content is king, fix the exam sim first.
**Phase 2** → build pipeline, so we can ship updates.
**Phase 3 + Phase 4** → can run in parallel (correctness + UX).
**Phase 5** → final gate before submission.

## Agent Instructions

When picking up a phase or task, read this file plus `AGENTS.md` and `CLAUDE.md` in the repo root for project conventions. Verify current git status and branch before making changes. Report completion of each checkbox with real verification output — not just "done."

Cortana (Hermes) is the orchestrator for this roadmap. Implementation work runs through fresh Codex sessions; Cortana handles QA, review, commits, and progress tracking.
