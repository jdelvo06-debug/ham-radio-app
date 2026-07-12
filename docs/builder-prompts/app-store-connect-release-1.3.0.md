# Codex Task — Apple Developer / TestFlight Release Operations

You own the Apple Developer and App Store Connect portion of the Ham Radio Study Buddy update. Cortana has already completed engineering QA and uploaded the signed build.

## Verified state

- App: **Ham Radio Study Buddy**
- Bundle ID: `com.studybuddy.hamradio`
- Uploaded build: **1.3.0 (2)**
- Xcode upload result: **Upload succeeded; package is processing**
- GitHub release verification: web build/smoke and Android Gradle test/lint are green.
- Repo: `~/projects/ham-radio-app`
- Release checklist: `RELEASE_CHECKLIST.md`

## Your job

Use App Store Connect / Apple Developer tools to take this update from processing to TestFlight-ready.

1. Verify build `1.3.0 (2)` appears and finishes processing in App Store Connect.
2. Inspect and resolve any Apple processing warnings, missing compliance items, export-compliance questions, SDK privacy manifests, or required metadata blocks.
3. Review the TestFlight configuration: release notes, internal tester access, and any beta review requirement. Use accurate release notes based on the shipped work; do not invent features.
4. Review the existing App Store version metadata against `RELEASE_CHECKLIST.md`: privacy, age rating, support/privacy URLs, screenshots, description, and in-app purchase disclosures.
5. Make non-destructive configuration fixes that are clearly required for this update.

## Approval gate — do not cross

Do **not** submit the app for App Review, enable external TestFlight distribution, change pricing/IAP products, or alter public-facing store copy/screenshots without reporting the proposed change and getting Jeremy's approval.

## Deliverable

Return a concise SITREP:
- build processing status and TestFlight readiness;
- exact changes made in App Store Connect;
- blockers requiring Jeremy action;
- remaining checklist items before App Review;
- direct App Store Connect URLs/screens/pages where possible.

Do not edit application source code, git history, native signing settings, or deployment workflows.