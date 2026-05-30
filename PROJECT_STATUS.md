# Project Status

## Overview
- **Project Name**: Ham Radio Study App
- **Status**: Active, iOS/App Store release prep in progress
- **Last Updated**: 2026-05-30
- **Port**: 4000
- **Deployment**: PM2 (local) + PWA + Capacitor iOS build

## Description
A study app to help prepare for the FCC Amateur Radio Technician Class license exam with lessons, quizzes, analytics, progress tracking, freemium access, and a premium unlock for unlimited access.

## Current Focus
Finish the iOS/App Store release workflow for **Ham Radio Study Buddy** and keep the screenshot / metadata prep reproducible.

## Current State
- App Store Connect app exists for bundle ID `com.studybuddy.hamradio`
- App Store ID is `6762643175`
- First non-consumable IAP exists: `com.studybuddy.hamradio.premium`
- Freemium gating is wired in app code
- Real StoreKit 2 purchase flow is wired with `@capgo/native-purchases`
- Local StoreKit simulator purchase test succeeded and premium unlocked
- Restore flow was flaky in simulator and still needs better validation
- A later App Store version was resubmitted after the original archive/upload work
- iOS project metadata is prepared for `1.1.1` build `5`
- App Store screenshot assets are present under `app-store-assets/ios/`
- Screenshot and iOS release metadata validators are present under `ci_scripts/`

## App Store Screenshot Assets
Upload sets:
- `app-store-assets/ios/iphone-6.5/` — 5 PNG screenshots at `1284x2778`
- `app-store-assets/ios/ipad-13/` — 5 PNG screenshots at `2048x2732`

Upload order:
1. `01-main-menu.png`
2. `02-learn-topics.png`
3. `03-study-explanation.png`
4. `04-analytics.png`
5. `05-review-premium.png`

Regenerate / validate from `my-study-app/`:

```bash
npm run screenshots:app-store
npm run validate:app-store-screenshots
npm run validate:ios-release
```

On Apple Silicon, if native modules complain about `sharp` or `lightningcss`, use the Homebrew ARM Node path:

```bash
PATH="/opt/homebrew/opt/node@22/bin:$PATH" npm run validate:app-store-screenshots
PATH="/opt/homebrew/opt/node@22/bin:$PATH" npm run build
```

## To-Do List
- [x] Set up PM2 for persistent server
- [x] Add PWA support (manifest, service worker, icons)
- [x] Install as app on phone via Chrome
- [x] Create App Store Connect app
- [x] Create first IAP product
- [x] Wire StoreKit purchase flow and test simulator purchase
- [x] Archive and upload initial iOS build to App Store Connect
- [x] Prepare App Store screenshot sets for iPhone 6.5 and iPad 13
- [x] Add validators for screenshot assets and iOS release metadata
- [x] Resubmit later App Store version
- [ ] Confirm latest App Store Connect processing / review result
- [ ] Attach `com.studybuddy.hamradio.premium` to the app submission if Apple requires it on the version record
- [ ] Validate restore-purchase behavior outside flaky local simulator conditions
- [ ] Finish App Store / TestFlight submission flow

## Recommended Next Steps
1. Open App Store Connect and confirm the latest resubmitted version/build status
2. Confirm screenshots are attached in App Store Connect for both iPhone 6.5 and iPad 13 media sets
3. Confirm the premium IAP is attached if Apple requires it for the submission
4. Re-test restore purchases in a less flaky environment than local simulator StoreKit
5. Commit the screenshot assets, release metadata, scripts, and documentation once reviewed

## Recent Accomplishments
- App supports a premium unlock path for unlimited questions/quizzes/lessons/bookmarks
- StoreKit config file added for local iOS purchase testing
- Simulator purchase flow succeeded end-to-end
- Apple Developer membership/device/profile issues were untangled enough to archive successfully
- Initial archive uploaded to App Store Connect
- Polished App Store screenshot assets generated and validated
- Release metadata validation added for iOS `1.1.1` build `5`
- Later App Store version was resubmitted

## Notes
- Main app lives in `my-study-app/`
- iOS project lives in `my-study-app/ios/App/`
- Progress is saved locally for many app features; premium status uses native purchase flow with local cache
- Question pool valid 2026-2030 in current app content
- Root-level `build/` artifacts are ignored and should stay uncommitted
