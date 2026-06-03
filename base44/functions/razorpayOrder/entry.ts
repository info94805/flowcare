import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const { action, orderId, paymentId, signature } = await req.json();

    const KEY_ID = Deno.env.get('RAZORPAY_KEY_ID');
    const KEY_SECRET = Deno.env.get('RAZORPAY_KEY_SECRET');
    const authHeader = 'Basic ' + btoa(`${KEY_ID}:${KEY_SECRET}`);

    // ── CREATE ORDER ──
    if (action === 'create') {
      const res = await fetch('https://api.razorpay.com/v1/orders', {
        method: 'POST',
        headers: { 'Authorization': authHeader, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: 39900, // ₹399 in paise
          currency: 'INR',
          receipt: `fc_${Date.now()}`,
          notes: { user_id: user.id, user_email: user.email, product: 'flowcare_premium_lifetime' },
        }),
      });
      const order = await res.json();
      if (!res.ok) return Response.json({ error: order.error?.description || 'Failed to create order' }, { status: 400 });
      return Response.json({ orderId: order.id, amount: order.amount, currency: order.currency, key: KEY_ID });
    }

    // ── VERIFY PAYMENT ──
    if (action === 'verify') {
      const body = `${orderId}|${paymentId}`;
      const encoder = new TextEncoder();
      const keyData = encoder.encode(KEY_SECRET);
      const msgData = encoder.encode(body);
      const cryptoKey = await crypto.subtle.importKey('raw', keyData, { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
      const signatureBuffer = await crypto.subtle.sign('HMAC', cryptoKey, msgData);
      const expectedSignature = Array.from(new Uint8Array(signatureBuffer)).map(b => b.toString(16).padStart(2, '0')).join('');

      // Constant-time comparison to avoid leaking the signature via timing.
      const timingSafeEqual = (a: string, b: string) => {
        if (a.length !== b.length) return false;
        let diff = 0;
        for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
        return diff === 0;
      };

      if (!signature || !timingSafeEqual(expectedSignature, signature)) {
        return Response.json({ error: 'Payment verification failed' }, { status: 400 });
      }

      // Mark user as premium. Pass through fields the User schema may still
      // mark as required so the update can't fail validation.
      await base44.auth.updateMe({
        subscription_status: 'active',
        subscription_type: 'lifetime',
        subscription_platform: 'razorpay',
        subscription_payment_id: paymentId,
        subscription_date: new Date().toISOString(),
        avatar_url: user.avatar_url || '',
        subscription_country: user.subscription_country || 'IN',
        whatsapp_family: user.whatsapp_family || [],
      });

      return Response.json({ success: true, message: 'Payment verified. Welcome to FlowCare Premium!' });
    }

    return Response.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});