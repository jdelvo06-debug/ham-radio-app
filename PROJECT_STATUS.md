# Project Status — Ham Radio Study Buddy

**Last updated:** 2026-07-12
**Release state:** App Store version **1.3.0 (3)** is **Waiting for Review**. Manual release is selected, so approval will not publish automatically.

## Product state

- The app is already published on the App Store.
- The current update completes the five-phase quality remediation recorded in [`ROADMAP.md`](ROADMAP.md).
- App Store Connect / Apple Developer work was completed by Codex after the engineering QA and archive upload.
- The next human action is to decide when to release after Apple approves the update.

## Verified engineering state

| Gate | Current result |
|---|---|
| FCC content | Corrected 2026–2030 pool: 409 IDs and answer keys match the official source |
| Practice exam | Official 35-group NCVEC blueprint |
| Figure questions | 12 official figure references rendered from T-1/T-2/T-3 assets |
| App tests | Vitest baseline covers pool/exam integrity, imports, persistence, entitlement logic, navigation, and accessibility regressions |
| Static build | `npm run build` passes |
| Static browser smoke | `npm run smoke:static` passes |
| GitHub Actions | Web build/smoke and Android Gradle test/lint passed on the release-verification workflow |
| iOS release artifact | Store-signed `1.3.0 (3)` uploaded and submitted to App Store review |

## Architecture that remains intentional

- Static export with `output: 'export'`
- Offline-first study data; no account, backend, tracking, or analytics service
- Capacitor iOS/Android shells
- Local progress, bookmarks, review state, and exports
- Dark-first interface; incomplete light mode was intentionally removed rather than shipped half-working

## Current release configuration

- Bundle ID: `com.studybuddy.hamradio`
- Premium product: `com.studybuddy.hamradio.premium` (non-consumable)
- Marketing version: `1.3.0`
- App Store build under review: `3`
- Release setting: manual

## Follow-up after Apple review

1. Read Apple’s review email and resolve any rejection or metadata request.
2. If approved, decide whether to release version 1.3.0 immediately.
3. Run a post-release smoke on the live App Store build, including launch, Study Mode, official exam composition, figures, Premium restore, and the new app icon.
4. Record the published version/date in this file and reset [`RELEASE_CHECKLIST.md`](RELEASE_CHECKLIST.md) for the next update.

## Maintenance notes

- Use native ARM Node (`/opt/homebrew/bin`) on this Apple Silicon Mac for Vitest, lightningcss, and other native-module tooling.
- `npm run build:mobile` builds the static export and synchronizes Capacitor. Do not run `next export` separately.
- `npm start` serves `out/`; `next start` is incompatible with the static-export contract.
- Local Android Gradle verification needs JDK 21 plus Android SDK configuration. GitHub Actions provides both and is the authoritative Android gate today.
- Do not restore the obsolete full-app GitHub Pages workflow; it is not a release target.
