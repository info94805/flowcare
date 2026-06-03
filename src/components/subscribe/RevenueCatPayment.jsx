import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Smartphone, Loader2, CheckCircle, RefreshCw, ShoppingCart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { base44 } from '@/api/base44Client';

// Product to purchase. The native layer maps this to the configured
// RevenueCat / Google Play / App Store product.
const PRODUCT_ID = import.meta.env.VITE_REVENUECAT_PRODUCT_ID || 'flowcare_lifetime';

// If the native layer never posts a result back, give up after this long so the
// UI doesn't spin forever (e.g. old app build with no purchase handler).
const PURCHASE_TIMEOUT_MS = 90000;

/**
 * RevenueCat IAP component.
 *
 * The actual purchase happens in the native layer (react-native-purchases),
 * which lives in the React Native shell — the web bundle cannot talk to Google
 * Play / the App Store directly. This component:
 *   1. Asks the native layer to start the purchase via `window.ReactNativeWebView`.
 *   2. Listens for the purchase result posted back from native.
 *   3. Verifies the purchase server-side and unlocks premium.
 *
 * The native shell must:
 *   - On `{ type: 'rc_purchase', appUserId, productId }`: call
 *     `Purchases.logIn(appUserId)` then `Purchases.purchaseProduct(productId)`.
 *   - Post back `{ type: 'rc_purchase_success' | 'rc_purchase_error' | 'rc_purchase_cancelled', message? }`.
 *   `appUserId` MUST match the id we verify with, or the server lookup finds no purchase.
 */
export default function RevenueCatPayment({ platform, onSuccess, onError }) {
  const [verifying, setVerifying] = useState(false);
  const [purchasing, setPurchasing] = useState(false);
  const [verified, setVerified] = useState(false);
  const purchaseTimer = useRef(null);

  const storeName = platform === 'ios' ? 'App Store' : 'Google Play';

  const clearPurchaseTimer = useCallback(() => {
    if (purchaseTimer.current) {
      clearTimeout(purchaseTimer.current);
      purchaseTimer.current = null;
    }
  }, []);

  const checkPurchase = useCallback(async (silent = false) => {
    if (!silent) setVerifying(true);
    try {
      const user = await base44.auth.me();
      const response = await base44.functions.invoke('verifyRevenueCatPurchase', {
        appUserId: user?.id,
        platform,
      });

      if (response.data?.success) {
        setVerified(true);
        onSuccess && onSuccess({ platform, status: 'active' });
        return true;
      }
      if (!silent) {
        onError && onError('No active purchase found yet. If you just paid, wait a moment and tap "Restore purchase".');
      }
      return false;
    } catch (err) {
      if (!silent) {
        onError && onError('Could not verify purchase. Please try again.');
      }
      return false;
    } finally {
      setVerifying(false);
    }
  }, [platform, onSuccess, onError]);

  // Auto-check on mount in case the user already owns it
  useEffect(() => {
    checkPurchase(true);
  }, [checkPurchase]);

  // Listen for purchase results posted back from the native (RN WebView) layer.
  useEffect(() => {
    const handleNativeMessage = async (event) => {
      let msg = event?.data;
      if (typeof msg === 'string') {
        try { msg = JSON.parse(msg); } catch { return; }
      }
      if (!msg || typeof msg !== 'object') return;
      if (!msg.type || !msg.type.startsWith('rc_purchase')) return;

      // A response arrived — stop the no-response timeout.
      clearPurchaseTimer();

      switch (msg.type) {
        case 'rc_purchase_success':
          setPurchasing(false);
          // Confirm with our backend before unlocking.
          await checkPurchase(false);
          break;
        case 'rc_purchase_cancelled':
          setPurchasing(false);
          break;
        case 'rc_purchase_error':
          setPurchasing(false);
          onError && onError(msg.message || `${storeName} purchase failed. Please try again.`);
          break;
        default:
          break;
      }
    };

    // RN WebView delivers native messages on `window` (iOS) and `document` (Android).
    window.addEventListener('message', handleNativeMessage);
    document.addEventListener('message', handleNativeMessage);
    return () => {
      window.removeEventListener('message', handleNativeMessage);
      document.removeEventListener('message', handleNativeMessage);
      clearPurchaseTimer();
    };
  }, [checkPurchase, onError, storeName, clearPurchaseTimer]);

  const startPurchase = async () => {
    const bridge = typeof window !== 'undefined' ? window.ReactNativeWebView : null;
    if (!bridge?.postMessage) {
      onError && onError('In-app purchases are only available inside the FlowCare app.');
      return;
    }
    setPurchasing(true);
    try {
      const user = await base44.auth.me();
      bridge.postMessage(JSON.stringify({
        type: 'rc_purchase',
        platform,
        productId: PRODUCT_ID,
        appUserId: user?.id,
      }));

      // Recover if the native layer never responds.
      clearPurchaseTimer();
      purchaseTimer.current = setTimeout(() => {
        purchaseTimer.current = null;
        setPurchasing(false);
        onError && onError(`${storeName} didn't respond. Please update the app and try again, or tap "Restore purchase" if you were charged.`);
      }, PURCHASE_TIMEOUT_MS);
    } catch (err) {
      setPurchasing(false);
      onError && onError('Could not start the purchase. Please try again.');
    }
  };

  if (verified) {
    return (
      <div className="flex flex-col items-center gap-2 py-4">
        <CheckCircle className="w-10 h-10 text-green-500" />
        <p className="font-heading font-bold text-green-600">Purchase Verified! 🎉</p>
        <p className="text-xs text-muted-foreground">Unlocking your premium access...</p>
      </div>
    );
  }

  const busy = purchasing || verifying;

  return (
    <div className="space-y-3">
      <div className="p-4 rounded-xl bg-primary/5 border border-primary/20 text-center">
        <Smartphone className="w-8 h-8 text-primary mx-auto mb-2" />
        <p className="text-sm font-semibold">
          {storeName} In-App Purchase
        </p>
        <p className="text-xs text-muted-foreground mt-1">
          Payment is handled securely via {platform === 'ios' ? 'Apple' : 'Google'} — one-time lifetime access.
        </p>
      </div>

      {/* Primary: start the purchase in the native layer */}
      <Button
        onClick={startPurchase}
        disabled={busy}
        className="w-full rounded-xl font-heading font-bold py-6 text-base shadow-lg"
      >
        {purchasing ? (
          <span className="flex items-center gap-2">
            <Loader2 className="w-5 h-5 animate-spin" /> Opening {storeName}…
          </span>
        ) : (
          <span className="flex items-center gap-2">
            <ShoppingCart className="w-5 h-5" /> Buy via {storeName}
          </span>
        )}
      </Button>

      {/* Secondary: restore / re-verify an existing purchase */}
      <Button
        onClick={() => checkPurchase(false)}
        disabled={busy}
        className="w-full rounded-xl font-heading font-bold"
        variant="outline"
      >
        {verifying ? (
          <span className="flex items-center gap-2">
            <Loader2 className="w-4 h-4 animate-spin" /> Checking…
          </span>
        ) : (
          <span className="flex items-center gap-2">
            <RefreshCw className="w-4 h-4" /> Restore purchase
          </span>
        )}
      </Button>
    </div>
  );
}
