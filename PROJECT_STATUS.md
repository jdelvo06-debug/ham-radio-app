# Project Status

## Overview
- **Project Name**: Ham Radio Study App
- **Status**: Active, iOS/App Store push in progress
- **Last Updated**: 2026-04-20
- **Port**: 4000
- **Deployment**: PM2 (local) + PWA + Capacitor iOS build

## Description
A study app to help prepare for the FCC Amateur Radio Technician Class license exam with lessons, quizzes, analytics, progress tracking, and an in-progress premium unlock for unlimited access.

## Current Focus
Finish the first iOS/App Store release for **Ham Radio Study Buddy**.

## Current State
- App Store Connect app exists for bundle ID `com.studybuddy.hamradio`
- First non-consumable IAP exists: `com.studybuddy.hamradio.premium`
- Freemium gating is wired in app code
- Real StoreKit 2 purchase flow is wired with `@capgo/native-purchases`
- Local StoreKit simulator purchase test succeeded and premium unlocked
- Restore flow was flaky in simulator and still needs better validation
- Xcode signing/archive issues were resolved enough to create and upload an archive
- Archive upload to App Store Connect completed on 2026-04-20

## To-Do List
- [x] Set up PM2 for persistent server
- [x] Add PWA support (manifest, service worker, icons)
- [x] Install as app on phone via Chrome
- [x] Create App Store Connect app
- [x] Create first IAP product
- [x] Wire StoreKit purchase flow and test simulator purchase
- [x] Archive and upload first iOS build to App Store Connect
- [ ] Wait for build processing in App Store Connect / TestFlight
- [ ] Attach the IAP to the app version/submission as required
- [ ] Validate restore-purchase behavior outside flaky local simulator conditions
- [ ] Finish App Store / TestFlight submission flow

## Recommended Next Steps
1. Open App Store Connect and confirm the uploaded build finishes processing
2. Complete TestFlight/App Review metadata for the first iOS build
3. Attach `com.studybuddy.hamradio.premium` to the app submission
4. Sanity-check restore purchases in a less flaky environment before final release

## Recent Accomplishments
- App now supports a premium unlock path for unlimited questions/quizzes/lessons/bookmarks
- StoreKit config file added for local iOS purchase testing
- Simulator purchase flow succeeded end-to-end
- Apple Developer membership/device/profile issues were untangled enough to archive successfully
- First archive uploaded to App Store Connect

## Notes
- Main app lives in `my-study-app/`
- iOS project lives in `my-study-app/ios/App/`
- Progress is still saved locally for many app features; premium status uses native purchase flow with local cache
- Question pool valid 2026-2030 in current app content
