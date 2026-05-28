import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { base44 } from '@/api/base44Client';
import { Shield, Loader2 } from 'lucide-react';

const loadRazorpayScript = () =>
  new Promise((resolve) => {
    if (document.getElementById('razorpay-sdk')) return resolve(true);
    const script = document.createElement('script');
    script.id = 'razorpay-sdk';
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });

export default function RazorpayPayment({ user, onSuccess, onError }) {
  const [loading, setLoading] = useState(false);

  const handlePay = async () => {
    setLoading(true);
    try {
      const loaded = await loadRazorpayScript();
      if (!loaded) throw new Error('Failed to load payment SDK. Check your internet connection.');

      // Create Razorpay order via backend
      const res = await base44.functions.invoke('razorpayOrder', { action: 'create' });
      const { orderId, amount, currency, key } = res.data;

      const options = {
        key,
        amount,
        currency,
        name: 'FlowCare',
        description: 'Premium Lifetime Access',
        order_id: orderId,
        prefill: {
          name: user?.full_name || '',
          email: user?.email || '',
        },
        theme: { color: '#FF6B9D' },
        handler: async (response) => {
          try {
            const verifyRes = await base44.functions.invoke('razorpayOrder', {
              action: 'verify',
              orderId: response.razorpay_order_id,
              paymentId: response.razorpay_payment_id,
              signature: response.razorpay_signature,
            });
            if (verifyRes.data.success) {
              onSuccess();
            } else {
              onError(verifyRes.data.error || 'Payment verification failed');
            }
          } catch (err) {
            onError(err.message);
          }
        },
        modal: {
          ondismiss: () => setLoading(false),
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.on('payment.failed', (response) => {
        onError(response.error?.description || 'Payment failed');
        setLoading(false);
      });
      rzp.open();
    } catch (err) {
      onError(err.message);
      setLoading(false);
    }
  };

  return (
    <div className="space-y-3">
      <Button
        onClick={handlePay}
        disabled={loading}
        className="w-full rounded-xl font-heading font-bold py-6 text-base shadow-lg"
      >
        {loading ? (
          <span className="flex items-center gap-2"><Loader2 className="w-5 h-5 animate-spin" /> Opening Payment...</span>
        ) : (
          'Pay ₹399 via Razorpay 🌸'
        )}
      </Button>
      <div className="flex items-center justify-center gap-1.5">
        <Shield className="w-3.5 h-3.5 text-muted-foreground" />
        <p className="text-xs text-muted-foreground">Secured by Razorpay · UPI, Cards, Net Banking</p>
      </div>
    </div>
  );
}