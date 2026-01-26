# App Icons Guide

Place your source icon here and use this guide to generate all required sizes.

## Source File Requirements
- **Format:** PNG (no transparency for iOS)
- **Size:** 1024x1024 minimum
- **Shape:** Square, no rounded corners (OS applies rounding)
- **Tip:** For small sizes, consider a simplified version without text

## Required Icon Sizes

### iOS (`/ios` folder)
| Filename | Size | Purpose |
|----------|------|---------|
| `icon-1024.png` | 1024x1024 | App Store |
| `icon-180.png` | 180x180 | iPhone @3x |
| `icon-120.png` | 120x120 | iPhone @2x |
| `icon-167.png` | 167x167 | iPad Pro |
| `icon-152.png` | 152x152 | iPad @2x |
| `icon-76.png` | 76x76 | iPad @1x |
| `icon-60.png` | 60x60 | iPhone @1x |
| `icon-40.png` | 40x40 | Spotlight @2x |
| `icon-29.png` | 29x29 | Settings @1x |
| `icon-20.png` | 20x20 | Notification @1x |

### Android (`/android` folder)
| Filename | Size | Density |
|----------|------|---------|
| `icon-512.png` | 512x512 | Play Store |
| `ic_launcher-xxxhdpi.png` | 192x192 | xxxhdpi |
| `ic_launcher-xxhdpi.png` | 144x144 | xxhdpi |
| `ic_launcher-xhdpi.png` | 96x96 | xhdpi |
| `ic_launcher-hdpi.png` | 72x72 | hdpi |
| `ic_launcher-mdpi.png` | 48x48 | mdpi |

## Quick Resize Commands

If you have ImageMagick installed, you can resize from a 1024x1024 source:

```bash
# iOS
convert source-1024.png -resize 180x180 ios/icon-180.png
convert source-1024.png -resize 120x120 ios/icon-120.png
convert source-1024.png -resize 167x167 ios/icon-167.png
convert source-1024.png -resize 152x152 ios/icon-152.png
convert source-1024.png -resize 76x76 ios/icon-76.png
convert source-1024.png -resize 60x60 ios/icon-60.png
convert source-1024.png -resize 40x40 ios/icon-40.png
convert source-1024.png -resize 29x29 ios/icon-29.png
convert source-1024.png -resize 20x20 ios/icon-20.png
cp source-1024.png ios/icon-1024.png

# Android
convert source-1024.png -resize 512x512 android/icon-512.png
convert source-1024.png -resize 192x192 android/ic_launcher-xxxhdpi.png
convert source-1024.png -resize 144x144 android/ic_launcher-xxhdpi.png
convert source-1024.png -resize 96x96 android/ic_launcher-xhdpi.png
convert source-1024.png -resize 72x72 android/ic_launcher-hdpi.png
convert source-1024.png -resize 48x48 android/ic_launcher-mdpi.png
```

## Online Tools
- [App Icon Generator](https://appicon.co/) - Upload once, download all sizes
- [MakeAppIcon](https://makeappicon.com/) - Similar service
- [Capacitor Assets](https://github.com/ionic-team/capacitor-assets) - CLI tool

## Notes
- iOS does NOT allow transparency - use solid background
- Android adaptive icons need foreground/background layers (optional)
- Test small sizes to ensure readability
