// @vitest-environment jsdom

import { act, renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const billingMocks = vi.hoisted(() => ({
  addListener: vi.fn(),
  getProduct: vi.fn(),
  getPurchases: vi.fn(),
  isBillingSupported: vi.fn(),
  purchaseProduct: vi.fn(),
  restorePurchases: vi.fn(),
}));

vi.mock('@capacitor/core', () => ({
  Capacitor: {
    getPlatform: () => 'web',
    isNativePlatform: () => false,
  },
}));

vi.mock('@capgo/native-purchases', () => ({
  NativePurchases: billingMocks,
  PURCHASE_TYPE: { INAPP: 'inapp' },
}));

import { usePremium } from './usePremium';

describe('usePremium on web', () => {
  beforeEach(() => {
    window.localStorage.clear?.();
    vi.clearAllMocks();
  });

  it('never calls the native billing plugin', async () => {
    const { result } = renderHook(() => usePremium());

    await act(async () => {
      expect(await result.current.purchase()).toBe(false);
      expect(await result.current.restore()).toBe(false);
    });

    expect(billingMocks.isBillingSupported).not.toHaveBeenCalled();
    expect(billingMocks.getProduct).not.toHaveBeenCalled();
    expect(billingMocks.getPurchases).not.toHaveBeenCalled();
    expect(billingMocks.addListener).not.toHaveBeenCalled();
    expect(billingMocks.purchaseProduct).not.toHaveBeenCalled();
    expect(billingMocks.restorePurchases).not.toHaveBeenCalled();
  });
});
