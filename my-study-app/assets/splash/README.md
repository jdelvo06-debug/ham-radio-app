# Splash Screen Guide

You have your splash screen artwork ready! Now generate the required sizes.

## Your Design
- Character-only version (no text) - perfect for scaling
- Blue background matches the app theme

## Required Sizes

### Simple Approach (Recommended)
Generate one large square image and Capacitor will handle cropping:

| Filename | Size | Purpose |
|----------|------|---------|
| `splash.png` | 2732x2732 | Universal source |

### iOS Specific (Optional)
| Filename | Size | Device |
|----------|------|--------|
| `splash-2732x2732.png` | 2732x2732 | iPad Pro 12.9" |
| `splash-1290x2796.png` | 1290x2796 | iPhone 14 Pro Max |
| `splash-1170x2532.png` | 1170x2532 | iPhone 13/14 |

### Android Specific (Optional)
| Filename | Size | Density |
|----------|------|---------|
| `splash-xxxhdpi.png` | 1280x1920 | xxxhdpi |
| `splash-xxhdpi.png` | 960x1440 | xxhdpi |
| `splash-xhdpi.png` | 640x960 | xhdpi |
| `splash-hdpi.png` | 480x720 | hdpi |
| `splash-mdpi.png` | 320x480 | mdpi |

## Quick Setup

1. Save your character image as `splash.png` (at least 2732x2732)
2. Make sure the character is centered with padding around edges
3. Background color: #2196F3 (or match your blue exactly)

## Capacitor Configuration

When we set up Capacitor, add this to `capacitor.config.ts`:

```typescript
plugins: {
  SplashScreen: {
    launchShowDuration: 2000,
    launchAutoHide: true,
    backgroundColor: "#2196F3",
    showSpinner: false,
    splashFullScreen: true,
    splashImmersive: true,
  }
}
```

## Tips
- Keep character in center 60% of image (edges may be cropped on some devices)
- The blue background (#2196F3) should extend to all edges
- No need for rounded corners - devices handle that
