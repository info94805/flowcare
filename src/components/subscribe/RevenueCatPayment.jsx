import React from 'react';
import { Smartphone } from 'lucide-react';

/**
 * RevenueCat IAP is handled natively inside the iOS/Android app shell.
 * This component is shown when a native platform is detected on web,
 * directing users to open the native app to complete the purchase.
 */
export default function RevenueCatPayment({ platform }) {
  return (
    <div className="space-y-3">
      <div className="p-4 rounded-xl bg-primary/5 border border-primary/20 text-center">
        <Smartphone className="w-8 h-8 text-primary mx-auto mb-2" />
        <p className="text-sm font-semibold">Open in the FlowCare App</p>
        <p className="text-xs text-muted-foreground mt-1">
          To complete your {platform === 'ios' ? 'App Store' : 'Google Play'} purchase,
          please open this in the FlowCare mobile app.
        </p>
      </div>
      <p className="text-xs text-center text-muted-foreground">
        Payment is securely processed by {platform === 'ios' ? 'Apple' : 'Google'} — one-time lifetime access.
      </p>
    </div>
  );
}