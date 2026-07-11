import { describe, expect, it } from 'vitest';

import { hasCurrentPremiumEntitlement, PREMIUM_PRODUCT_ID } from './entitlements';

describe('premium entitlement states', () => {
  it('accepts a current matching iOS purchase', () => {
    expect(hasCurrentPremiumEntitlement([
      { productIdentifier: PREMIUM_PRODUCT_ID },
    ], 'ios')).toBe(true);
  });

  it('accepts only purchased and acknowledged Android purchases', () => {
    expect(hasCurrentPremiumEntitlement([
      {
        productIdentifier: PREMIUM_PRODUCT_ID,
        purchaseState: '1',
        isAcknowledged: true,
      },
    ], 'android')).toBe(true);

    expect(hasCurrentPremiumEntitlement([
      {
        productIdentifier: PREMIUM_PRODUCT_ID,
        purchaseState: 'PURCHASED',
        isAcknowledged: true,
      },
    ], 'android')).toBe(true);
  });

  it('rejects pending or unacknowledged Android purchases', () => {
    expect(hasCurrentPremiumEntitlement([
      {
        productIdentifier: PREMIUM_PRODUCT_ID,
        purchaseState: '0',
        isAcknowledged: false,
      },
    ], 'android')).toBe(false);

    expect(hasCurrentPremiumEntitlement([
      {
        productIdentifier: PREMIUM_PRODUCT_ID,
        purchaseState: '1',
        isAcknowledged: false,
      },
    ], 'android')).toBe(false);
  });

  it('rejects revoked and unrelated purchases', () => {
    expect(hasCurrentPremiumEntitlement([
      { productIdentifier: PREMIUM_PRODUCT_ID, revocationDate: '2026-07-01' },
      { productIdentifier: 'com.example.other' },
    ], 'ios')).toBe(false);
  });

  it('rejects an empty entitlement list', () => {
    expect(hasCurrentPremiumEntitlement([], 'android')).toBe(false);
  });
});
