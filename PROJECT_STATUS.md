# Project Status

## Overview
- **Project Name**: Ham Radio Study App (Study Buddy)
- **Status**: App Store Prep In Progress
- **Last Updated**: 2026-03-31
- **Port**: 4000 (dev/web)
- **Deployment**: PWA (web) + Capacitor (iOS/Android)

## Description
A study app to help prepare for the FCC Amateur Radio Technician Class license exam. Features 409 questions (2026-2030 pool), spaced repetition, progress tracking, lessons, and dark mode.

---

## App Store Preparation Status

### ✅ Completed (2026-03-31)

#### Build System
- [x] Fixed `build:mobile` script — removed deprecated `next export`, replaced with `NEXT_OUTPUT=export next build && npx cap sync ios`
- [x] Updated `next.config.ts` to conditionally enable `output: 'export'` via `NEXT_OUTPUT=export` env var
- [x] Web/PWA build (`next build`) unaffected — static export only activated for mobile builds

#### Storage Migration
- [x] Installed `@capacitor/preferences` package
- [x] Created `app/lib/storage.ts` — unified async storage wrapper
  - Uses Capacitor Preferences on native iOS/Android (detected via `Capacitor.isNativePlatform()`)
  - Falls back to `localStorage` on web/dev (no breakage to PWA)
- [x] Migrated all `window.localStorage` calls in `app/page.tsx` to the wrapper
  - `getItem` / `setItem` / `removeItem` — all async-safe (fire-and-forget writes, async reads in useEffect)

#### Question Pool Update
- [x] Downloaded 2026-2030 Technician Class Question Pool (NCVEC, Feb 19 2026 errata included)
- [x] Extracted text from PDF to `raw_questions_2026.txt`
- [x] Parsed 409 questions into `my-study-app/app/ham_radio_questions_2026.json`
- [x] Subelement breakdown: T0(36) T1(68) T2(37) T3(35) T4(23) T5(50) T6(46) T7(44) T8(47) T9(23)
- ⚠️ **ACTION REQUIRED**: Swap `ham_radio_questions.json` → `ham_radio_questions_2026.json` in `app/page.tsx` **on or before July 1, 2026** (when 2022-2026 pool expires)
- ⚠️ The new JSON has blank `explanation` fields — add explanations before swapping (or swap and add later)

---

### 🔧 Remaining Before App Store Submission

#### Xcode / iOS Setup
- [ ] Open `ios/App/App.xcworkspace` in Xcode
- [ ] Set Bundle ID (e.g. `com.yourdomain.hamradio`) in Signing & Capabilities
- [ ] Set App Version and Build Number in Xcode
- [ ] Select your Apple Developer Team (requires paid Apple Developer account $99/yr)
- [ ] Add app icons (1024×1024 PNG required for App Store Connect)
  - Icons folder exists at `my-study-app/icons/` — verify sizes meet Apple spec
- [ ] Add a Launch Screen / Splash Screen in Xcode
- [ ] Set minimum iOS deployment target (iOS 14+ recommended)

#### App Store Connect
- [ ] Create App record in App Store Connect (appstoreconnect.apple.com)
- [ ] Fill out app metadata: name, subtitle, description, keywords, category (Education)
- [ ] Upload screenshots for all required device sizes (iPhone 6.7", 6.5", 5.5")
- [ ] Set age rating (4+, no objectionable content)
- [ ] Set pricing (Free)
- [ ] Add Privacy Policy URL (required — even for apps with no login/data collection)
- [ ] Submit for App Review

#### Build & Archive
- [ ] Run `npm run build:mobile` in `my-study-app/`
- [ ] In Xcode: Product → Archive → Distribute App → App Store Connect
- [ ] Upload via Xcode Organizer or `xcrun altool`

#### Optional / Nice-to-Have
- [ ] Add explanations to the 2026-2030 question pool JSON (currently empty)
- [ ] Add Capacitor Status Bar plugin for proper iOS status bar styling
- [ ] Add Capacitor Haptics for answer feedback
- [ ] Add App Tracking Transparency (ATT) prompt if analytics are added
- [ ] Test on physical iOS device before submission

---

## Question Pool Notes
| Pool | Valid Dates | File | Status |
|------|------------|------|--------|
| 2022-2026 | Until June 30, 2026 | `ham_radio_questions.json` | **Active in app** |
| 2026-2030 | July 1, 2026+ | `ham_radio_questions_2026.json` | **Parsed, ready to swap** |

The import in `app/page.tsx` line 3 needs to change from:
```ts
import questionsData from './ham_radio_questions.json';
```
to:
```ts
import questionsData from './ham_radio_questions_2026.json';
```

---

## Recent Accomplishments
- All 411 Technician questions loaded (2022-2026 pool)
- 10 topic-based lessons complete
- Spaced repetition system working
- Study streaks and achievements implemented
- Dark mode available
- PM2 deployment configured (port 4000)
- PWA installable via Chrome on phone
- Docker removed in favor of PM2
- Capacitor configured for iOS and Android
- **2026-03-31**: Build system fixed for Next.js 13+ static export
- **2026-03-31**: localStorage migrated to Capacitor Preferences
- **2026-03-31**: 2026-2030 question pool parsed and staged
