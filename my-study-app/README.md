# Ham Radio Study Buddy

Next.js + Capacitor app for studying the FCC Amateur Radio Technician exam on web and iOS.

## Current release status

As of 2026-05-30:
- freemium/premium gating is wired into the app
- StoreKit 2 purchase flow is integrated through `@capgo/native-purchases`
- local StoreKit simulator purchase testing succeeded and premium unlocked correctly
- restore purchase was flaky in the simulator and still needs a better validation pass
- an initial iOS archive was created and uploaded to App Store Connect
- a later iOS version was resubmitted to App Store Connect
- App Store screenshot sets are present and validated for iPhone 6.5 and iPad 13
- iOS release metadata is prepared for version `1.1.1` build `5`

## Key app details

- Bundle ID: `com.studybuddy.hamradio`
- App Store name: **Ham Radio Study Buddy**
- App Store ID: `6762643175`
- Premium product ID: `com.studybuddy.hamradio.premium`
- Free tier: 25 questions/day
- Premium unlock: non-consumable one-time purchase
- Current app/release metadata target: `1.1.1` build `5`

## Getting started

Run the local dev server:

```bash
npm run dev
```

Open [http://localhost:4000](http://localhost:4000).

## Mobile / iOS workflow

Build web assets and sync to Capacitor:

```bash
npm run build:mobile
npx cap sync ios
```

Open the iOS project:

```bash
open ios/App/App.xcodeproj
```

StoreKit test config lives at:

```text
ios/App/App/Products.storekit
```

## App Store screenshot workflow

Screenshot assets live at:

```text
../app-store-assets/ios/
```

Current upload sets:
- `iphone-6.5/` — 5 PNG screenshots at `1284x2778`
- `ipad-13/` — 5 PNG screenshots at `2048x2732`

Regenerate screenshots from this directory:

```bash
npm run screenshots:app-store
```

Validate screenshot dimensions and release metadata:

```bash
npm run validate:app-store-screenshots
npm run validate:ios-release
```

On Apple Silicon, if native modules complain about `sharp` or `lightningcss`, run with the Homebrew ARM Node first in `PATH`:

```bash
PATH="/opt/homebrew/opt/node@22/bin:$PATH" npm run validate:app-store-screenshots
PATH="/opt/homebrew/opt/node@22/bin:$PATH" npm run build
```

## Important current files

- `app/hooks/usePremium.ts`
- `app/components/PaywallModal.tsx`
- `app/components/SettingsView.tsx`
- `app/page.tsx`
- `app/types.ts`
- `ios/App/App/Products.storekit`
- `ios/App/App.xcodeproj/project.pbxproj`
- `../app-store-assets/ios/README.md`
- `../ci_scripts/generate_app_store_screenshots.mjs`
- `../ci_scripts/validate_app_store_screenshots.mjs`
- `../ci_scripts/validate_ios_release_metadata.mjs`

## Next steps

1. Confirm the latest resubmitted App Store Connect version/build status
2. Confirm both screenshot sets are attached in App Store Connect Media Manager
3. Attach `com.studybuddy.hamradio.premium` to the app submission if Apple requires it on the version record
4. Re-test restore purchases in a less flaky environment than local simulator StoreKit
5. Commit the screenshot assets, release metadata, scripts, and docs after review
