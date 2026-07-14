# Ham Radio Study Buddy — Project Notes

## Purpose and release posture

Ham Radio Study Buddy is an offline-first FCC Amateur Radio Technician study app. Version **1.3.0 (build 3)** is live on the App Store as of 2026-07-13 EDT.

The primary delivery path is **static export → Capacitor → Xcode → App Store Connect**. The old full-app GitHub Pages deployment was intentionally removed.

## Stack

- Next.js **16.2.10** (App Router, static export)
- React **19.2.1**, TypeScript, Tailwind CSS 4
- Capacitor 8 for iOS/Android
- `@ducanh2912/next-pwa` with webpack builds
- `@capgo/native-purchases` for Premium
- Vitest for app tests; Python `unittest` content-pipeline checks

## Content contract

- Corrected official **2026–2030 Technician pool**: **409 questions**.
- Practice Exam selects exactly one question from each official NCVEC syllabus group (35 questions).
- T0A10, T1C01, T5A05, and T7A09 reflect official errata.
- T1E11-D, T1F08-D, T2C06-D, and T7B11-D are complete.
- Twelve official figure-dependent questions use bundled T-1/T-2/T-3 assets.
- `generate_complete_json.py` is the canonical generator. Do not resurrect deleted alternative parsers or `raw_questions.txt`.

## Core paths

```text
my-study-app/
├── app/page.tsx                    # Main state coordinator; edit surgically
├── app/ham_radio_questions.json    # Bundled official pool
├── app/utils/examBlueprint.ts       # Official 35-group selection
├── app/utils/                       # Validation/persistence/entitlement utilities + tests
├── app/components/QuestionFigure.tsx
├── public/figures/                  # Official T-1/T-2/T-3 assets
├── scripts/smoke-static.mjs
├── scripts/verify-android.sh
├── ios/App/
└── android/
```

## Development and verification

Run from `my-study-app/`:

```bash
PATH="/opt/homebrew/bin:$PATH" npm ci
PATH="/opt/homebrew/bin:$PATH" npm run dev
PATH="/opt/homebrew/bin:$PATH" npm test
PATH="/opt/homebrew/bin:$PATH" npm run lint
PATH="/opt/homebrew/bin:$PATH" npm run build
PATH="/opt/homebrew/bin:$PATH" npm run smoke:static
PATH="/opt/homebrew/bin:$PATH" npm run build:mobile
```

### Apple Silicon Node pitfall

This host can default to `/usr/local/bin/node` under Rosetta. Native packages such as Vitest/rolldown and lightningcss then look for `darwin-x64` binaries and fail. Prefer `/opt/homebrew/bin` in `PATH` and verify `process.arch === 'arm64'`.

### Static-export contract

- `next.config.ts` uses `output: 'export'`.
- `npm run build:mobile` runs `npm run build && cap sync`.
- Do not run `next export` separately.
- `next start` is incompatible with this architecture; `npm start` serves `out/`.

## Testing

The app has a Vitest baseline covering:

- official exam composition and 409-question integrity
- import validation and persistence migration
- Android entitlement conditions
- primary navigation and analytics weak-area routing
- onboarding/quiz/settings accessibility regression behavior

The root `tests/test_content_pipeline.py` verifies official source parity, errata, figures, derived lesson counts, and generator consolidation.

## Accessibility and UX

- Dark-first UI only; incomplete light mode was intentionally removed.
- Onboarding has dialog semantics, focus control, Escape behavior, and named controls.
- Quiz progress has semantic values; answer feedback uses live announcements.
- Keep all future UI work keyboard and screen-reader conscious.

## Premium and privacy

- Product ID: `com.studybuddy.hamradio.premium`.
- Android grants entitlement only for verified `PURCHASED` and acknowledged transactions.
- Native billing calls must not execute on web.
- The app collects no study data, uses no account/backend/tracking/analytics service, and keeps progress locally.
- Privacy/support source pages live in `docs/privacy/index.html` and `docs/support/index.html`.

## Release rules

- `RELEASE_CHECKLIST.md` is the release authority.
- GitHub Actions workflow `release-verification.yml` runs web lint/tests/build/smoke plus Android Gradle test/lint with JDK 21.
- Local Android Gradle execution needs JDK 21 and an Android SDK; CI is the current authoritative Android gate.
- Do not modify App Store metadata, IAP products/pricing, external TestFlight, App Review submission, or manual release without Jeremy’s explicit direction.

## Do not regress

- Static-export / offline-first architecture
- Local-only study data model
- Responsive mobile layout
- Official pool and exam blueprint integrity
- Truthful Premium behavior and restore path
