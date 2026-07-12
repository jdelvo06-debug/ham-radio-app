# Ham Radio Study Buddy App Store Update Checklist

Use this checklist for the next App Store update. Repository verification does
not prove that App Store Connect metadata is current, a TestFlight build was
tested, or a version was submitted.

## 1. Version, build, and archive

- [ ] Choose the release version and increment the iOS build number.
- [ ] Confirm the version is synchronized in `my-study-app/package.json`,
      `my-study-app/app/types.ts`, the iOS Xcode project, and Android Gradle.
- [ ] Run `npm ci`, `npm run lint`, `npm test`, `npm run build`, and
      `npm run smoke:static` from `my-study-app/`.
- [ ] Run `npm run build:mobile` and confirm Capacitor sync completes.
- [ ] Archive the Release scheme with the intended signing team/profile.
- [ ] Validate the archive and resolve every Xcode/App Store Connect warning,
      including required-reason API and third-party SDK privacy-manifest warnings.
- [ ] Confirm the archive contains the expected app icon, launch assets, bundle
      identifier `com.studybuddy.hamradio`, version, and build number.

## 2. Screenshots and metadata

- [ ] Capture fresh screenshots from the release candidate, not an older build.
- [ ] Cover every App Store Connect device size currently required for iPhone
      and iPad platforms enabled by the app.
- [ ] Ensure screenshots show current dark-only UI and do not promise features
      outside the selected free/premium tier.
- [ ] Review app name, subtitle, promotional text, description, keywords,
      category, copyright, and release notes.
- [ ] Confirm the support URL loads and describes the current app/version.
- [ ] Publish `docs/privacy/index.html` to the Privacy Policy URL and confirm the
      public page shows the July 12, 2026 update before submission. The former
      full-app GitHub Pages deployment workflow has been removed.
- [ ] Confirm all metadata URLs use HTTPS and load without authentication.

## 3. Age rating and content rights

- [ ] Re-answer the current age-rating questionnaire in App Store Connect.
- [ ] Confirm there is no user-generated content, chat, advertising, gambling,
      unrestricted web access, or social networking in this version.
- [ ] Confirm educational-content answers match the app's actual FCC exam-prep
      content and external links.
- [ ] Confirm the bundled 2026-2030 Technician question pool and figures are
      permitted for distribution and the FCC/ARRL non-affiliation copy is visible.

## 4. Privacy answers

- [ ] Verify the release candidate still has no account requirement, backend,
      tracking, advertising SDK, or third-party analytics SDK.
- [ ] Confirm study progress, bookmarks, lessons, streaks, review schedules,
      and preferences remain local to the device unless the user exports a file.
- [ ] Set App Store Connect App Privacy to **Data Not Collected** only after
      checking the final archive and every bundled third-party SDK.
- [ ] Set tracking to **No**; the app does not perform cross-app or cross-site tracking.
- [ ] Confirm the in-app Settings privacy copy and public privacy policy match
      the App Store Connect answers.
- [ ] Confirm purchase wording is accurate: Apple processes iOS payments and
      Google Play Billing processes intended Android payments; the developer
      does not receive payment-card or bank-account details.
- [ ] Recheck privacy answers if any SDK, logging, analytics, crash reporting,
      account, or backend capability is added after this checklist is approved.

## 5. Premium purchase review risks

- [ ] Confirm `com.studybuddy.hamradio.premium` is the correct non-consumable
      product, cleared for sale, and attached to the submitted app version when required.
- [ ] Test purchase, cancellation, pending purchase handling, relaunch entitlement,
      reinstall, and Restore Purchase using Apple sandbox/TestFlight accounts.
- [ ] Resolve the previously observed flaky Restore Purchase behavior or document
      reproducible evidence that the release candidate restores reliably.
- [ ] Confirm a free user can launch and use basic Study Mode without an account,
      purchase, reviewer code, or external setup.
- [ ] Put concise purchase and restore instructions in App Review notes.

## 6. TestFlight beta round

- [ ] Upload the validated archive and wait for App Store Connect processing.
- [ ] Complete export-compliance questions and any missing compliance documents.
- [ ] Run at least one internal TestFlight round on a clean install and an upgrade
      from the current App Store version.
- [ ] Test launch, onboarding, Study Mode question transition, Practice Exam
      composition, lessons, bookmarks, review mode, analytics, Settings, export,
      import, reset, offline relaunch, and device rotation/resizing where supported.
- [ ] Test VoiceOver labels/focus and Dynamic Type at representative sizes.
- [ ] Test purchase and restore on a physical device through TestFlight.
- [ ] Record tester names/devices, build number, defects, and retest results.
- [ ] Obtain explicit beta sign-off before selecting the build for review.

## 7. Submission and review notes

- [ ] Select the signed-off build and verify all App Store Connect sections are complete.
- [ ] Explain in Review Notes that no account is required, basic Study Mode is
      available free, and Premium is a non-consumable in-app purchase.
- [ ] Give the reviewer exact steps to reach purchase and Restore Purchase controls.
- [ ] Mention that study data is stored locally and the app works offline after install.
- [ ] Confirm no placeholder URLs, stale version references, debug menus, test
      products, or simulator-only configuration remain in the submitted archive.
- [ ] Submit manually only after privacy, metadata, purchase, TestFlight, and
      archive gates above are signed off.

## 8. Android follow-up (not an iOS submission gate)

- [ ] Run `npm run verify:android` on a host with JDK 21 and an Android SDK.
- [ ] Confirm Gradle unit tests and Android lint pass in GitHub Actions.
- [ ] Before any Google Play submission, recheck the Play Console Data safety
      answers and verify Google Play Billing purchase/restore behavior on device.
