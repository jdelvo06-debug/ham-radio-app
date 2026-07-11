import { describe, expect, it } from 'vitest';

import { hasCurrentPremiumEntitlement, PREMIUM_PRODUCT_ID } from './entitlements';

describe('premium entitlement states', () => {
  it('accepts a current matching purchase', () => {
    expect(hasCurrentPremiumEntitlement([
      { productIdentifier: PREMIUM_PRODUCT_ID },
    ])).toBe(true);
  });

  it('rejects revoked and unrelated purchases', () => {
    expect(hasCurrentPremiumEntitlement([
      { productIdentifier: PREMIUM_PRODUCT_ID, revocationDate: '2026-07-01' },
      { productIdentifier: 'com.example.other' },
    ])).toBe(false);
  });

  it('rejects an empty entitlement list', () => {
    expect(hasCurrentPremiumEntitlement([])).toBe(false);
  });
});
