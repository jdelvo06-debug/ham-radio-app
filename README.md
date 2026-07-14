# Ham Radio Study Buddy

An offline-first study app for the **FCC Amateur Radio Technician** exam. It runs as a Next.js static export, ships through Capacitor for iOS/Android, and keeps study data on the device.

## Current release

- **App Store status:** version **1.3.0 (build 3)** is live on the App Store (released 2026-07-13 EDT).
- **Primary release path:** Capacitor → Xcode → App Store Connect. GitHub Pages is not an app release target.
- **Question pool:** corrected official **2026–2030** Technician pool, **409 questions**.
- **Exam realism:** each 35-question practice exam selects one question from every official NCVEC syllabus group.

## What the app does

- Guided lessons across all ten Technician subelements (T0–T9)
- Study, official-format Practice Exam, Bookmarks, and spaced-repetition Review modes
- Local analytics with direct weak-area study actions
- Local progress export/import, reset, streaks, and achievements
- Official T-1/T-2/T-3 figures for all 12 figure-dependent pool questions
- Non-consumable Premium purchase with purchase/restore flows
- Dark-first UI with accessibility support for onboarding, quiz progress, and answer feedback

## Architecture

| Area | Choice |
|---|---|
| Web | Next.js 16.2.10, React 19, TypeScript, Tailwind CSS 4 |
| Mobile | Capacitor 8, iOS project in `my-study-app/ios/`, Android project in `my-study-app/android/` |
| Data | Bundled static JSON; no backend, account, tracking, or analytics service |
| Persistence | Browser/device local storage; users control exported backups |
| Purchases | `@capgo/native-purchases`; Apple App Store on iOS and Google Play Billing for future Android distribution |
| Content source | `generate_complete_json.py` plus `content/2026-2030-technician-pool-feb-19-2026.docx` |

## Local development

```bash
cd my-study-app
npm ci
npm run dev
```

Open <http://localhost:4000>.

> **Apple Silicon note:** use native ARM Node when running native-module tooling:
> `PATH="/opt/homebrew/bin:$PATH" npm test`
> The default `/usr/local/bin/node` may run under Rosetta and fail to load Vitest/rolldown or lightningcss bindings.

## Verification

```bash
cd my-study-app
npm run lint
npm test
npm run build
npm run smoke:static
npm run build:mobile
```

`smoke:static` serves the real `out/` static export and verifies CSS/JS assets, hydration, manifest, service worker, and a Study Mode question transition.

GitHub Actions runs the same web gate plus Android Gradle unit tests and lint on pull requests and updates to `main`. See `.github/workflows/release-verification.yml`.

## Mobile release

```bash
cd my-study-app
npm run build:mobile
open ios/App/App.xcodeproj
```

- Marketing version: `1.3.0`
- Current App Store candidate: iOS build `3`
- Android version code remains independently tracked (`2` at the last release-prep update)
- Full operational checklist: [`RELEASE_CHECKLIST.md`](RELEASE_CHECKLIST.md)

## Project map

```text
ham-radio-app/
├── my-study-app/                 # Next.js + Capacitor app
│   ├── app/                      # UI, state, question data, utilities, tests
│   ├── public/figures/           # Official T-1/T-2/T-3 figure assets
│   ├── ios/ and android/         # Native shells
│   └── scripts/                  # Static smoke + Android verification
├── content/                      # Corrected official NCVEC source document
├── generate_complete_json.py     # Canonical question-pool generator
├── tests/                        # Content-pipeline integrity checks
├── ROADMAP.md                    # Completed audit-remediation record
├── RELEASE_CHECKLIST.md          # Reusable App Store update checklist
└── PROJECT_STATUS.md             # Current operational state
```

## Content and licensing

The bundled Technician pool and figures are used for exam preparation. Ham Radio Study Buddy is independent and not endorsed by the FCC or ARRL.

## Contributing

Read [`AGENTS.md`](AGENTS.md), [`CLAUDE.md`](CLAUDE.md), and [`PROJECT_STATUS.md`](PROJECT_STATUS.md) before changing code or release configuration. Keep the static-export/offline-first architecture unless a scoped decision explicitly changes it.