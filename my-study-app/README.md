# Ham Radio Study Buddy

Next.js + Capacitor app for studying the FCC Amateur Radio Technician exam on web and iOS.

## Current release status

As of 2026-04-20:
- freemium/premium gating is wired into the app
- StoreKit 2 purchase flow is integrated through `@capgo/native-purchases`
- local StoreKit simulator purchase testing succeeded and premium unlocked correctly
- restore purchase was flaky in the simulator and still needs a better validation pass
- an iOS archive was created and uploaded to App Store Connect

## Key app details

- Bundle ID: `com.studybuddy.hamradio`
- App Store name: **Ham Radio Study Buddy**
- Premium product ID: `com.studybuddy.hamradio.premium`
- Free tier: 25 questions/day
- Premium unlock: non-consumable one-time purchase

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

## Important current files

- `app/hooks/usePremium.ts`
- `app/components/PaywallModal.tsx`
- `app/components/SettingsView.tsx`
- `app/page.tsx`
- `ios/App/App/Products.storekit`

## Next steps

1. Wait for the uploaded App Store Connect build to finish processing
2. Complete TestFlight / App Review setup
3. Attach `com.studybuddy.hamradio.premium` to the app submission if Apple requires it on the version record
4. Re-test restore purchases in a less flaky environment than local simulator StoreKit
