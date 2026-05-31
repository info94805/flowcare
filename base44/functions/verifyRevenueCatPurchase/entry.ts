import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { appUserId, platform } = await req.json();

    const apiKey = platform === 'ios'
      ? Deno.env.get('REVENUECAT_API_KEY_IOS')
      : Deno.env.get('REVENUECAT_API_KEY_ANDROID');

    if (!apiKey) {
      return Response.json({ error: 'RevenueCat API key not configured' }, { status: 500 });
    }

    // Fetch subscriber info from RevenueCat
    const rcUserId = appUserId || user.id;
    const response = await fetch(`https://api.revenuecat.com/v1/subscribers/${encodeURIComponent(rcUserId)}`, {
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'X-Platform': platform === 'ios' ? 'ios' : 'android',
      }
    });

    if (!response.ok) {
      const err = await response.text();
      console.error('RevenueCat error:', err);
      return Response.json({ error: 'Failed to verify purchase with RevenueCat' }, { status: 400 });
    }

    const data = await response.json();
    const subscriber = data.subscriber;

    // Check if any entitlement is active
    const entitlements = subscriber?.entitlements || {};
    const productId = Deno.env.get('REVENUECAT_PRODUCT_ID') || '';

    // Check active entitlements or non-subscription purchases
    const hasActiveEntitlement = Object.values(entitlements).some(e => {
      const expiry = e.expires_date;
      return !expiry || new Date(expiry) > new Date();
    });

    const nonSubscriptions = subscriber?.non_subscriptions || {};
    const hasPurchase = Object.keys(nonSubscriptions).length > 0 || hasActiveEntitlement;

    if (hasPurchase || hasActiveEntitlement) {
      // Update user subscription status
      await base44.auth.updateMe({
        subscription_status: 'active',
        subscription_type: 'lifetime',
        subscription_platform: platform,
        subscription_date: new Date().toISOString(),
      });

      return Response.json({ success: true, status: 'active' });
    } else {
      return Response.json({ success: false, status: 'inactive', message: 'No active purchase found' });
    }

  } catch (error) {
    console.error('verifyRevenueCatPurchase error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});