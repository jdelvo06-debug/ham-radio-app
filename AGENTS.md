# Ham Radio Study Buddy — Agent Guide

## Start here

Before changing the project:

1. Read `PROJECT_STATUS.md`, `ROADMAP.md`, and `RELEASE_CHECKLIST.md`.
2. Verify repo, remote, branch, and working-tree status.
3. Treat the App Store / Capacitor path as primary. GitHub Pages is not an app release target.
4. Leave implementation changes uncommitted for Cortana/Jeremy review unless explicitly told otherwise.

## Non-negotiable product constraints

- Preserve `output: 'export'`, the offline-first data model, and responsive mobile layout.
- Do not add accounts, a backend, tracking, ads, or analytics without an explicit product decision.
- The bundled pool is the corrected official 2026–2030 Technician pool: **409 questions**.
- Official-format exams must select one question from each of the 35 NCVEC syllabus groups; do not revert to unrestricted random selection.
- Keep all 12 official figure-dependent questions mapped to T-1/T-2/T-3 assets.
- Do not change Premium pricing, IAP products, or release settings without explicit approval.

## Core paths

| Path | Purpose |
|---|---|
| `my-study-app/app/page.tsx` | Main state coordinator; make surgical edits |
| `my-study-app/app/ham_radio_questions.json` | Bundled 2026–2030 pool |
| `generate_complete_json.py` | Canonical pool generator |
| `content/2026-2030-technician-pool-feb-19-2026.docx` | Official source artifact |
| `my-study-app/app/utils/examBlueprint.ts` | Official 35-group exam selection |
| `my-study-app/app/components/QuestionFigure.tsx` | Official figure rendering |
| `my-study-app/app/utils/` | Validation, persistence, entitlement, integrity utilities and tests |
| `.github/workflows/release-verification.yml` | Web and Android release gates |

## Commands

Run from `my-study-app/`:

```bash
PATH="/opt/homebrew/bin:$PATH" npm test
PATH="/opt/homebrew/bin:$PATH" npm run lint
PATH="/opt/homebrew/bin:$PATH" npm run build
PATH="/opt/homebrew/bin:$PATH" npm run smoke:static
PATH="/opt/homebrew/bin:$PATH" npm run build:mobile
```

Use the ARM Node path on this Mac. The default Node may run under Rosetta and fail native dependency loading.

## Release boundary

- Build and verify locally; use `RELEASE_CHECKLIST.md` before an App Store update.
- Do not submit to App Review, publish a manual release, modify App Store metadata, or alter IAP configuration without Jeremy’s explicit approval.
- For App Store Connect work, report exact status, changes made, blockers, and remaining release gates.

## Documentation

Keep these current when behavior, release process, content, or validation changes:

- `README.md`
- `PROJECT_STATUS.md`
- `LEARNINGS.md`
- `CLAUDE.md`
- `ROADMAP.md` / `RELEASE_CHECKLIST.md` when phase or release state changes
