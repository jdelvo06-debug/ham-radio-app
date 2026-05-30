# Ham Radio Study Buddy App Store Screenshots

This folder contains the polished screenshot set for App Store Connect.

## Upload Sets

- `iphone-6.5/` - 5 PNG screenshots at `1284x2778`
- `ipad-13/` - 5 PNG screenshots at `2048x2732`

Upload the files in numeric order:

1. `01-main-menu.png`
2. `02-learn-topics.png`
3. `03-study-explanation.png`
4. `04-analytics.png`
5. `05-review-premium.png`

## Regenerate

From the repository root:

```bash
node ci_scripts/generate_app_store_screenshots.mjs
node ci_scripts/validate_app_store_screenshots.mjs
```

Or from `my-study-app/`:

```bash
npm run screenshots:app-store
npm run validate:app-store-screenshots
npm run validate:ios-release
```

On Apple Silicon Macs, use the Homebrew ARM Node if native modules complain about `sharp` or `lightningcss`:

```bash
PATH="/opt/homebrew/opt/node@22/bin:$PATH" npm run validate:app-store-screenshots
```

## App Store Connect Notes

The public Apple lookup API currently returns empty `screenshotUrls` and `ipadScreenshotUrls` for app id `6762643175`, so App Store Connect needs these uploaded through the iOS version's App Previews and Screenshots / Media Manager section.

If the live `1.1` version cannot be edited, create iOS version `1.1.1`, attach build `5` if Apple requires a binary, upload both screenshot sets, and submit the metadata update for review.
