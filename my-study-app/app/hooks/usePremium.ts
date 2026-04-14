'use client';

import { useCallback, useEffect, useState } from 'react';

const PREMIUM_STORAGE_KEY = 'hamradio_premium';

const readPremiumStatus = (): boolean => {
  if (typeof window === 'undefined') return false;

  try {
    return window.localStorage.getItem(PREMIUM_STORAGE_KEY) === 'true';
  } catch {
    return false;
  }
};

export function usePremium() {
  const [isPremium, setIsPremium] = useState(false);

  useEffect(() => {
    setIsPremium(readPremiumStatus());
  }, []);

  const setPremium = useCallback((value: boolean) => {
    setIsPremium(value);

    if (typeof window === 'undefined') return;

    try {
      window.localStorage.setItem(PREMIUM_STORAGE_KEY, String(value));
    } catch {}
  }, []);

  const clearPremium = useCallback(() => {
    setIsPremium(false);

    if (typeof window === 'undefined') return;

    try {
      window.localStorage.removeItem(PREMIUM_STORAGE_KEY);
    } catch {}
  }, []);

  return { isPremium, setPremium, clearPremium };
}
