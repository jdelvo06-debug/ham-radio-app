# Splash Screen Guide

Splash screens display while the app loads.

## Recommended Sizes

### iOS
| Filename | Size | Device |
|----------|------|--------|
| `splash-2732x2732.png` | 2732x2732 | Universal (centered, cropped) |
| `splash-1290x2796.png` | 1290x2796 | iPhone 14 Pro Max |
| `splash-1179x2556.png` | 1179x2556 | iPhone 14 Pro |
| `splash-1284x2778.png` | 1284x2778 | iPhone 13 Pro Max |
| `splash-1170x2532.png` | 1170x2532 | iPhone 13/14 |
| `splash-2048x2732.png` | 2048x2732 | iPad Pro 12.9" |

### Android
| Filename | Size | Density |
|----------|------|---------|
| `splash-xxxhdpi.png` | 1280x1920 | xxxhdpi |
| `splash-xxhdpi.png` | 960x1440 | xxhdpi |
| `splash-xhdpi.png` | 640x960 | xhdpi |
| `splash-hdpi.png` | 480x720 | hdpi |
| `splash-mdpi.png` | 320x480 | mdpi |

## Design Tips

1. **Keep it simple** - Logo/icon centered on solid background
2. **Safe zone** - Keep important content in center 50% (edges may be cropped)
3. **Match app theme** - Use same colors as your app
4. **No text** - Or minimal text that's readable at all sizes

## Suggested Design for Ham Radio Study Buddy

```
Background: Light blue gradient (#E3F2FD to #BBDEFB)
Center: Radio character from icon (without text)
Bottom: Small "Ham Radio Study Buddy" text (optional)
```

## Capacitor Configuration

After adding splash screens, configure in `capacitor.config.ts`:

```typescript
const config: CapacitorConfig = {
  // ...
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      backgroundColor: "#E3F2FD",
      showSpinner: false,
    }
  }
};
```
