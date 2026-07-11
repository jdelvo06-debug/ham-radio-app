export const PREMIUM_PRODUCT_ID = 'com.studybuddy.hamradio.premium';

interface PurchaseEntitlement {
  productIdentifier: string;
  revocationDate?: string | null;
}

export function hasCurrentPremiumEntitlement(
  purchases: PurchaseEntitlement[],
): boolean {
  return purchases.some(
    (purchase) =>
      purchase.productIdentifier === PREMIUM_PRODUCT_ID && !purchase.revocationDate,
  );
}
