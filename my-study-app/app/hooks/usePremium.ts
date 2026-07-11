'use client';

import { useCallback, useEffect, useState } from 'react';
import { Capacitor, type PluginListenerHandle } from '@capacitor/core';
import { NativePurchases, PURCHASE_TYPE } from '@capgo/native-purchases';
import { hasCurrentPremiumEntitlement, PREMIUM_PRODUCT_ID } from '../utils/entitlements';

const PREMIUM_STORAGE_KEY = 'hamradio_premium';

export interface PremiumProductDetails {
  description: string;
  price: number;
  priceString: string;
  title: string;
}

const readPremiumStatus = (): boolean => {
  if (typeof window === 'undefined') return false;

  try {
    return window.localStorage.getItem(PREMIUM_STORAGE_KEY) === 'true';
  } catch {
    return false;
  }
};

const persistPremiumStatus = (value: boolean) => {
  if (typeof window === 'undefined') return;

  try {
    if (value) {
      window.localStorage.setItem(PREMIUM_STORAGE_KEY, 'true');
    } else {
      window.localStorage.removeItem(PREMIUM_STORAGE_KEY);
    }
  } catch {}
};

const checkNativePremiumStatus = async (): Promise<boolean | null> => {
  if (!Capacitor.isNativePlatform()) return null;

  try {
    const { isBillingSupported } = await NativePurchases.isBillingSupported();
    if (!isBillingSupported) return null;

    const { purchases } = await NativePurchases.getPurchases({
      productType: PURCHASE_TYPE.INAPP,
      onlyCurrentEntitlements: true,
    });

    return hasCurrentPremiumEntitlement(purchases, Capacitor.getPlatform());
  } catch {
    return null;
  }
};

export function usePremium() {
  const [isPremium, setIsPremium] = useState(false);
  const [isPurchasing, setIsPurchasing] = useState(false);
  const [isRestoring, setIsRestoring] = useState(false);
  const [purchaseError, setPurchaseError] = useState<string | null>(null);
  const [productDetails, setProductDetails] =
    useState<PremiumProductDetails | null>(null);

  useEffect(() => {
    const cached = readPremiumStatus();
    setIsPremium(cached);

    const hydrateStoreState = async () => {
      if (!Capacitor.isNativePlatform()) return;

      try {
        const { isBillingSupported } = await NativePurchases.isBillingSupported();
        if (!isBillingSupported) return;

        const [{ product }, hasPremium] = await Promise.all([
          NativePurchases.getProduct({
            productIdentifier: PREMIUM_PRODUCT_ID,
            productType: PURCHASE_TYPE.INAPP,
          }),
          checkNativePremiumStatus(),
        ]);

        setProductDetails({
          description: product.description,
          price: product.price,
          priceString: product.priceString,
          title: product.title,
        });

        if (hasPremium === null) return;

        setIsPremium(hasPremium);
        persistPremiumStatus(hasPremium);
      } catch {
        // Web and unsupported environments are fine.
      }
    };

    void hydrateStoreState();
  }, []);

  useEffect(() => {
    let listenerHandle: PluginListenerHandle | null = null;

    const setupListener = async () => {
      if (!Capacitor.isNativePlatform()) return;

      try {
        listenerHandle = await NativePurchases.addListener(
          'transactionUpdated',
          (transaction) => {
            if (hasCurrentPremiumEntitlement(
              [transaction],
              Capacitor.getPlatform(),
            )) {
              setPurchaseError(null);
              setIsPremium(true);
              persistPremiumStatus(true);
            }
          }
        );
      } catch {
        // Web and unsupported environments are fine.
      }
    };

    setupListener();

    return () => {
      void listenerHandle?.remove();
    };
  }, []);

  const purchase = useCallback(async (): Promise<boolean> => {
    if (!Capacitor.isNativePlatform()) {
      setPurchaseError('Purchases are only available in the mobile app.');
      return false;
    }

    setPurchaseError(null);
    setIsPurchasing(true);

    try {
      const transaction = await NativePurchases.purchaseProduct({
        productIdentifier: PREMIUM_PRODUCT_ID,
        productType: PURCHASE_TYPE.INAPP,
      });

      if (!hasCurrentPremiumEntitlement([transaction], Capacitor.getPlatform())) {
        setPurchaseError('Purchase is pending verification.');
        return false;
      }

      setIsPremium(true);
      persistPremiumStatus(true);
      return true;
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : 'Purchase failed';

      if (!message.toLowerCase().includes('cancel')) {
        setPurchaseError(message);
      }

      return false;
    } finally {
      setIsPurchasing(false);
    }
  }, []);

  const restore = useCallback(async (): Promise<boolean> => {
    if (!Capacitor.isNativePlatform()) {
      setPurchaseError('Purchases are only available in the mobile app.');
      return false;
    }

    setPurchaseError(null);
    setIsRestoring(true);

    try {
      await NativePurchases.restorePurchases();

      const hasPremium = await checkNativePremiumStatus();
      if (hasPremium) {
        setIsPremium(true);
        persistPremiumStatus(true);
        return true;
      }

      setPurchaseError('No previous purchase found to restore.');
      return false;
    } catch (error: unknown) {
      setPurchaseError(
        error instanceof Error ? error.message : 'Restore failed'
      );
      return false;
    } finally {
      setIsRestoring(false);
    }
  }, []);

  const setPremium = useCallback((value: boolean) => {
    setIsPremium(value);
    persistPremiumStatus(value);
  }, []);

  const clearPremium = useCallback(() => {
    setIsPremium(false);
    persistPremiumStatus(false);
  }, []);

  const clearPurchaseError = useCallback(() => {
    setPurchaseError(null);
  }, []);

  return {
    isPremium,
    isPurchasing,
    isRestoring,
    productDetails,
    purchaseError,
    purchase,
    restore,
    setPremium,
    clearPremium,
    clearPurchaseError,
  };
}
