/**
 * Storage wrapper: uses Capacitor Preferences on native iOS/Android,
 * falls back to localStorage for web/dev environments.
 */

let capacitorPreferences: typeof import('@capacitor/preferences').Preferences | null = null;

async function getPreferences() {
  if (capacitorPreferences) return capacitorPreferences;
  try {
    // Only load Capacitor Preferences in a native environment
    if (typeof window !== 'undefined' && (window as any).Capacitor?.isNativePlatform?.()) {
      const mod = await import('@capacitor/preferences');
      capacitorPreferences = mod.Preferences;
      return capacitorPreferences;
    }
  } catch {
    // Fall through to localStorage
  }
  return null;
}

export async function getItem(key: string): Promise<string | null> {
  const prefs = await getPreferences();
  if (prefs) {
    const { value } = await prefs.get({ key });
    return value;
  }
  // Web fallback
  if (typeof window !== 'undefined') {
    return window.localStorage.getItem(key);
  }
  return null;
}

export async function setItem(key: string, value: string): Promise<void> {
  const prefs = await getPreferences();
  if (prefs) {
    await prefs.set({ key, value });
    return;
  }
  // Web fallback
  if (typeof window !== 'undefined') {
    window.localStorage.setItem(key, value);
  }
}

export async function removeItem(key: string): Promise<void> {
  const prefs = await getPreferences();
  if (prefs) {
    await prefs.remove({ key });
    return;
  }
  // Web fallback
  if (typeof window !== 'undefined') {
    window.localStorage.removeItem(key);
  }
}
