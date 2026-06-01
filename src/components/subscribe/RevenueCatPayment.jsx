import React, { useState, useEffect } from 'react';
import { Smartphone, Loader2, CheckCircle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { base44 } from '@/api/base44Client';

/**
 * RevenueCat IAP verification component.
 * On native Android/iOS, the purchase happens via the store.
 * This component verifies the purchase with RevenueCat and updates the user's status.
 */
export default function RevenueCatPayment({ platform, onSuccess, onError }) {
  const [verifying, setVerifying] = useState(false);
  const [verified, setVerified] = useState(false);

  // Auto-check on mount in case user already purchased
  useEffect(() => {
    checkPurchase(true);
  }, []);

  const checkPurchase = async (silent = false) => {
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
      } else if (!silent) {
        onError && onError('No active purchase found. Please complete the purchase in the Play Store first, then tap "Verify Purchase".');
      }
    } catch (err) {
      if (!silent) {
        onError && onError('Could not verify purchase. Please try again.');
      }
    } finally {
      setVerifying(false);
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

  return (
    <div className="space-y-3">
      <div className="p-4 rounded-xl bg-primary/5 border border-primary/20 text-center">
        <Smartphone className="w-8 h-8 text-primary mx-auto mb-2" />
        <p className="text-sm font-semibold">
          {platform === 'ios' ? 'Apple App Store' : 'Google Play'} In-App Purchase
        </p>
        <p className="text-xs text-muted-foreground mt-1">
          Purchase is handled securely via {platform === 'ios' ? 'Apple' : 'Google'}.
          After completing your purchase, tap below to verify and unlock premium.
        </p>
      </div>

      <Button
        onClick={() => checkPurchase(false)}
        disabled={verifying}
        className="w-full rounded-xl font-heading font-bold"
        variant="outline"
      >
        {verifying ? (
          <span className="flex items-center gap-2">
            <Loader2 className="w-4 h-4 animate-spin" /> Verifying...
          </span>
        ) : (
          <span className="flex items-center gap-2">
            <RefreshCw className="w-4 h-4" /> Verify Purchase & Unlock
          </span>
        )}
      </Button>

      <p className="text-xs text-center text-muted-foreground">
        Payment is securely processed by {platform === 'ios' ? 'Apple' : 'Google'} — one-time lifetime access.
      </p>
    </div>
  );
}