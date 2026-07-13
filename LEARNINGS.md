# Learnings & Gotchas

## Build/runtime architecture

### Static export is intentional

The app uses Next.js static export (`output: 'export'`) because Capacitor consumes the generated `out/` directory.

```json
{
  "build": "next build --webpack",
  "build:mobile": "npm run build && cap sync",
  "start": "serve out -l 4000"
}
```

Do not add `next export`; it was removed from Next.js. Do not use `next start` for this project.

### Apple Silicon Node must be native ARM

The default Node path can be x64/Rosetta. That breaks native packages after an install because Vitest/rolldown and lightningcss search for x64 bindings.

```bash
PATH="/opt/homebrew/bin:$PATH" node -p 'process.arch'
# expected: arm64
```

When native module errors appear, reinstall under the ARM path:

```bash
PATH="/opt/homebrew/bin:$PATH" npm ci
```

## Official content pipeline

- Pool: corrected official 2026–2030 Technician source, 409 questions.
- Generator: `generate_complete_json.py` is canonical.
- Source: `content/2026-2030-technician-pool-feb-19-2026.docx`.
- Do not bring back deleted parser scripts or stale 2022–2026 artifacts.
- Every exam selects one question from each of the 35 official NCVEC groups.
- Twelve figure-dependent questions use official T-1/T-2/T-3 image assets through `QuestionFigure.tsx`.

Run the content integrity tests from repo root with the project root on Python’s import path. The test module uses `unittest`, not pytest.

## Persistence and imports

- Progress remains local to the device/browser.
- Import payloads are schema-validated before state or storage writes.
- Legacy streak data is migrated by the persistence utility.
- Preserve backward compatibility when adding fields to exported backups.
- The former `darkMode` backup field is accepted but ignored; the UI is intentionally dark-first.

## Premium purchase rules

- Web never calls native billing plugin methods.
- Android entitlement requires a verified `PURCHASED` state plus acknowledgement.
- Keep purchase, restore, hydration, and transaction-update paths on the same entitlement predicate.
- Product ID: `com.studybuddy.hamradio.premium`.

## React state lesson

Analytics weak-area actions must use the atomic `startQuizForSubelement` callback. Do not set selected subelement and immediately start the quiz in separate calls; React state can be stale and launch the wrong pool.

## Accessibility baseline

- Onboarding is a true dialog: focus management, Escape close, keyboard controls.
- Quiz progress must expose `role="progressbar"` and numeric values.
- Answer feedback needs an `aria-live` strategy.
- Keep screen-reader and keyboard tests with relevant UI changes.

## Release verification

```bash
cd my-study-app
PATH="/opt/homebrew/bin:$PATH" npm test
PATH="/opt/homebrew/bin:$PATH" npm run lint
PATH="/opt/homebrew/bin:$PATH" npm run build
PATH="/opt/homebrew/bin:$PATH" npm run smoke:static
PATH="/opt/homebrew/bin:$PATH" npm run build:mobile
```

`smoke:static` checks the actual static artifact: assets, hydration, manifest, service worker, and a question transition.

GitHub Actions provides the Android JDK 21/SDK environment. On CI, run `npm run build` and `npx cap sync android` before `npm run verify:android`, otherwise generated Capacitor Cordova files are missing in a clean checkout.

## App Store operations

- Current candidate: version 1.3.0, build 3, Waiting for Review with manual release.
- Archive export should use an App Store distribution profile (`get-task-allow = false`).
- A Development-signed archive can be exported/re-signed for App Store Connect with the App Store export method; do not manually override automatic signing identity during archive.
- Use `RELEASE_CHECKLIST.md` for each update. Do not claim release completion until App Store Connect status confirms it.
