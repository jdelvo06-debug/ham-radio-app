# Ham Radio Study Buddy

Next.js + Capacitor study app for the official FCC Amateur Radio Technician exam. The app is static-exported, works offline after install, and ships to iOS through the App Store.

## Current release

- **App Store:** version **1.3.0 (3)** is live (released 2026-07-13 EDT).
- **Pool:** corrected official 2026–2030 Technician pool, **409 questions**.
- **Practice exams:** one question from each official NCVEC syllabus group (35 total).
- **Data:** local-only study data; no account, tracking, ads, or analytics service.

## Run locally

```bash
npm ci
npm run dev
```

Open <http://localhost:4000>.

On this Apple Silicon host, run native-module tooling with ARM Node:

```bash
PATH="/opt/homebrew/bin:$PATH" npm test
```

## Verify

```bash
npm run lint
npm test
npm run build
npm run smoke:static
npm run build:mobile
```

`smoke:static` verifies the actual static export: assets, hydration, manifest, service worker, and a Study Mode question transition.

## Mobile workflow

```bash
npm run build:mobile
open ios/App/App.xcodeproj
```

`build:mobile` runs the static build and Capacitor sync. Do not run `next export` separately. The app uses `output: 'export'`, so `npm start` serves `out/` and `next start` is not valid.

## Release gates

- GitHub Actions runs web lint/tests/build/smoke plus Android Gradle test/lint.
- Full App Store release procedure: [`../RELEASE_CHECKLIST.md`](../RELEASE_CHECKLIST.md)
- Project state and constraints: [`../PROJECT_STATUS.md`](../PROJECT_STATUS.md) and [`../AGENTS.md`](../AGENTS.md)

## Key files

- `app/page.tsx` — main state coordinator
- `app/ham_radio_questions.json` — bundled official question data
- `app/utils/examBlueprint.ts` — official practice-exam selection
- `app/components/QuestionFigure.tsx` — T-1/T-2/T-3 figure rendering
- `app/hooks/usePremium.ts` — native purchase integration
- `scripts/smoke-static.mjs` — browser release smoke
- `scripts/verify-android.sh` — Android config/Gradle gate
