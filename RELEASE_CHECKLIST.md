# Ham Radio Study Buddy App Store Update Checklist

Use this reusable checklist for the **next** App Store update.

## Current release snapshot

| Item | Status |
|---|---|
| Version/build | 1.3.0 (3) |
| App Store Connect | Released |
| Release control | Manual release completed |
| Engineering CI | Web smoke and Android Gradle/lint passed |
| App Store artifact | Distribution-signed IPA uploaded successfully |

For the current submission, the update is live. Start the next release cycle from the sections below.

---

## 1. Version, build, and archive

- [ ] Choose marketing version and increment the appropriate native build counter.
- [ ] Confirm package, UI, iOS, and Android versioning is intentional; native build counters may differ by platform.
- [ ] Run `npm ci`, `npm run lint`, `npm test`, `npm run build`, and `npm run smoke:static` from `my-study-app/`.
- [ ] Run `npm run build:mobile` and confirm Capacitor sync completes.
- [ ] Archive the Release scheme with the intended signing team/profile.
- [ ] Confirm the export uses an App Store distribution profile (`get-task-allow = false`).
- [ ] Confirm expected icon, launch assets, bundle ID `com.studybuddy.hamradio`, marketing version, and build number.

## 2. Screenshots and metadata

- [ ] Capture fresh screenshots from the release candidate.
- [ ] Cover App Store Connect device sizes enabled by the app.
- [ ] Ensure screenshots show the current dark-first UI and truthful free/Premium features.
- [ ] Review name, subtitle, promotional text, description, keywords, category, copyright, and release notes.
- [ ] Confirm support and privacy URLs are HTTPS, public, and current.

## 3. Privacy and content

- [ ] Recheck App Store privacy: no account, backend, tracking, ad SDK, or analytics SDK.
- [ ] Confirm progress, bookmarks, lessons, streaks, review schedules, and preferences remain local unless the user exports a file.
- [ ] Confirm Apple purchase language is accurate and Google Play Billing language is only included if Android distribution remains planned.
- [ ] Re-answer age rating and confirm no UGC, chat, ads, gambling, unrestricted web access, or social networking.
- [ ] Confirm the 2026–2030 Technician pool and official figures remain permitted for distribution and FCC/ARRL non-affiliation copy is visible.

## 4. Premium and TestFlight

- [ ] Confirm `com.studybuddy.hamradio.premium` is cleared for sale and attached to the version if required.
- [ ] Test purchase, cancellation, pending purchase, relaunch entitlement, reinstall, and Restore Purchase on a physical TestFlight device.
- [ ] Test clean install and upgrade from the current App Store version.
- [ ] Smoke launch, onboarding, Study Mode, Practice Exam composition, figures, lessons, bookmarks, Review, analytics, Settings, export/import/reset, offline relaunch, rotation, VoiceOver, and Dynamic Type.
- [ ] Record tester/build/device/retest evidence and obtain explicit beta sign-off.

## 5. Submit and release

- [ ] Complete export-compliance and any App Store Connect warnings.
- [ ] Add review notes: no account required, local/offline study data, basic free Study Mode, and Premium/Restore steps.
- [ ] Select the signed-off build and confirm every App Store Connect section is complete.
- [ ] Submit only with explicit approval.
- [ ] If manual release is selected, publish only after explicit approval following Apple acceptance.

## 6. Android follow-up

- [ ] Verify `npm run verify:android` with JDK 21 and Android SDK, or rely on the passing GitHub Actions gate.
- [ ] Before Google Play submission, recheck Play Console Data Safety and device purchase/restore behavior.
