# Ham Radio Study App — Completed Quality Remediation Roadmap

**Created:** 2026-07-11
**Updated:** 2026-07-12
**Result:** All five engineering/release-preparation phases are complete. App Store version **1.3.0 (3)** is **Waiting for Review** with manual release selected.

> The App Store / Capacitor route is primary. The old GitHub Pages deployment was removed and is not a release target.

---

## Phase 1 — Content Accuracy ✅

- [x] Official 35-group NCVEC practice-exam blueprint
- [x] Corrected 2026–2030 pool: 409 official IDs and answer keys
- [x] Four errata and four truncated options corrected
- [x] Twelve official figure-dependent questions mapped to T-1/T-2/T-3 assets
- [x] One canonical content generator with derived lesson counts

**Verified:** content integrity suite; exam-blueprint tests; static build; visual figure smoke.

## Phase 2 — Build & Mobile Pipeline ✅

- [x] Static-export-compatible `build:mobile` and `npm start`
- [x] Marketing version aligned at 1.3.0; native build counters tracked per platform
- [x] Next.js upgraded to 16.2.10
- [x] Vitest baseline added for app correctness/regression coverage
- [x] Capacitor sync and iOS compilation verified

**Verified:** tests, lint, TypeScript, static build, Capacitor sync, iOS compile.

## Phase 3 — App Correctness & Security ✅

- [x] Android Premium entitlement requires purchased and acknowledged state
- [x] Import schema validation and legacy persistence migration
- [x] Analytics weak-area race removed with atomic subelement quiz start
- [x] Native billing calls gated off on web

**Verified:** targeted regression tests, full app tests, lint, and static build.

## Phase 4 — UX and Accessibility ✅

- [x] Incomplete light mode removed; dark-first UI is deliberate
- [x] Onboarding dialog semantics, focus behavior, Escape handling, and named controls
- [x] Semantic quiz progress and live answer feedback
- [x] Lint debt eliminated; lesson counts verified as pool-derived

**Verified:** 22 accessibility/UI regression tests, static build, lint, browser keyboard smoke.

## Phase 5 — Release Preparation ✅

- [x] Privacy/support disclosures updated for local-only data and Apple/Google purchase handling
- [x] Chromium static-export smoke test added
- [x] Obsolete GitHub Pages deploy workflow removed
- [x] Release CI added: web checks plus Android Gradle test/lint with JDK 21
- [x] Reusable `RELEASE_CHECKLIST.md` created

**Verified:** release CI passed web smoke and Android Gradle test/lint; store-signed IPA uploaded.

## App Store state

| Item | State |
|---|---|
| Candidate | 1.3.0 (3) |
| App Store Connect | Waiting for Review |
| Release control | Manual |
| Next decision | Release after Apple approval, or resolve any review feedback |

## Preserve

- Static-export/offline-first architecture
- Local-only study data model
- Responsive mobile layout
- Corrected official 409-question dataset and 35-group exam blueprint
