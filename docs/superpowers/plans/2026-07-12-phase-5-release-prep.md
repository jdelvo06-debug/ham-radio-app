# Phase 5 Release Prep Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Prepare the already-published Ham Radio Study Buddy app for its next App Store update without changing study behavior or persisted data.

**Architecture:** Preserve the static-export and Capacitor runtime. Add release-only documentation, browser verification, and CI gates; remove the obsolete GitHub Pages deployment rather than introducing subpath runtime configuration that the App Store build does not need.

**Tech Stack:** Next.js 16 static export, React 19, Playwright Chromium, GitHub Actions, Capacitor Android/Gradle.

## Global Constraints

- Do not change app behavior, study modes, or the data model.
- App Store and Capacitor are the primary release targets; GitHub Pages is not a release target.
- Leave changes uncommitted for Cortana QA, review, and progress tracking.
- Report local, CI-capable, and App Store Connect/TestFlight verification as separate states.

---

### Task 1: Privacy disclosures

**Files:**
- Modify: `my-study-app/app/components/SettingsView.tsx`
- Modify: `docs/privacy/index.html`
- Test: `my-study-app/app/components/SettingsView.test.tsx`

- [x] Extend the Settings test to require easily accessible local-data, no-account, no-tracking/no-third-party-analytics, and privacy-policy copy.
- [x] Run the targeted test and confirm RED because the privacy section is absent.
- [x] Add a compact Privacy section to Settings and update the standalone policy for Apple App Store and Google Play billing.
- [x] Run the targeted test GREEN and inspect the standalone policy wording against official Apple and Google disclosure guidance.

### Task 2: Static browser smoke test

**Files:**
- Create: `my-study-app/scripts/smoke-static.mjs`
- Modify: `my-study-app/package.json`
- Modify: `my-study-app/package-lock.json`

- [x] Add Playwright as a development dependency and a `smoke:static` package script.
- [x] Write a Chromium smoke script that starts `serve` against `out/`, captures failed requests/page errors, verifies CSS and JavaScript responses, confirms React hydration, fetches and parses the manifest, waits for a service-worker registration, enters Study Mode, answers once, and advances from question 1 to question 2.
- [x] Run the smoke before building and confirm RED because no static artifact is available.
- [x] Run `npm run build` followed by `npm run smoke:static` and confirm GREEN.

### Task 3: Release workflows and Android verification

**Files:**
- Delete: `.github/workflows/deploy.yml`
- Create: `.github/workflows/release-verification.yml`
- Create: `my-study-app/scripts/verify-android.sh`
- Modify: `my-study-app/package.json`
- Modify: `my-study-app/README.md`

- [x] Remove the obsolete GitHub Pages deployment workflow.
- [x] Add CI jobs for Node lint/tests/build/browser smoke and JDK 21 Android unit tests plus lint.
- [x] Add a local Android verification script that validates the wrapper/config first, reports the JDK requirement clearly, and runs Gradle `test` plus `lint` when Java is usable.
- [x] Document JDK 21 and Android SDK requirements and run the script on this machine to capture the actual Java boundary.

### Task 4: App Store review checklist

**Files:**
- Create: `RELEASE_CHECKLIST.md`

- [x] Cover version/build bump, archive, screenshots, metadata, support/privacy URLs, age rating, privacy answers, in-app purchase state, TestFlight beta, review notes, and submission gates.
- [x] Include audit-derived Apple review risks: privacy manifest validation, restore purchase, account-free access, offline/local data truth, FCC attribution, purchase metadata, and clean launch/navigation.
- [x] Mark all App Store Connect and TestFlight actions as human gates rather than claiming completion locally.

### Task 5: Roadmap and final verification

**Files:**
- Modify: `ROADMAP.md`

- [x] Update Phase 5 checkboxes to reflect implemented repository work while keeping TestFlight submission explicitly pending.
- [x] Run `npm run build`, `npm test`, `npm run lint`, and `npm run smoke:static` fresh.
- [x] Run `npm run verify:android` and report either Gradle results or the exact local JDK blocker; confirm CI supplies Java.
- [x] Run `git diff --check`, inspect status/diff, and verify that no study behavior or data-model file changed.
