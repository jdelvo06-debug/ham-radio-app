export const PREMIUM_PRODUCT_ID = 'com.studybuddy.hamradio.premium';

interface PurchaseEntitlement {
  productIdentifier: string;
  revocationDate?: string | null;
  purchaseState?: string;
  isAcknowledged?: boolean;
}

export function hasCurrentPremiumEntitlement(
  purchases: PurchaseEntitlement[],
  platform: string,
): boolean {
  return purchases.some(
    (purchase) => {
      if (
        purchase.productIdentifier !== PREMIUM_PRODUCT_ID ||
        purchase.revocationDate
      ) {
        return false;
      }

      if (platform !== 'android') return true;

      return (
        (purchase.purchaseState === '1' || purchase.purchaseState === 'PURCHASED') &&
        purchase.isAcknowledged === true
      );
    },
  );
}
