import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { base44 } from '@/api/base44Client';
import { Check, Crown, Shield, AlertCircle, Smartphone, Globe } from 'lucide-react';
import { Link } from 'react-router-dom';
import { getPlatform } from '@/lib/platform';
import RazorpayPayment from '@/components/subscribe/RazorpayPayment';
import RevenueCatPayment from '@/components/subscribe/RevenueCatPayment';

const FEATURES = [
  'AI Health Companion — Jia (unlimited)',
  'AI-generated PDF health reports',
  'WhatsApp family period alerts',
  'Advanced cycle insights & charts',
  'Pad reminder (4 days before period)',
  'All app modes: School, College, Daily',
  'Unlimited reminders',
  'Priority support',
  '10-day refund guarantee',
];

const FREE_FEATURES = [
  'Basic cycle tracking',
  'Calendar view',
  'Daily mood & symptom log',
  '3 educational articles',
  'Limited reminders (2)',
];

export default function SubscribePage() {
  const [user, setUser] = useState(null);
  const [platform, setPlatform] = useState('web');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    base44.auth.me().then(u => setUser(u));
    setPlatform(getPlatform());
  }, []);

  const isPremium = user?.subscription_status === 'active';

  const handleSuccess = async (customerInfo) => {
    // For RevenueCat (native): update user on our backend too
    if (customerInfo) {
      await base44.auth.updateMe({
        subscription_status: 'active',
        subscription_type: 'lifetime',
        subscription_platform: platform,
        subscription_date: new Date().toISOString(),
      });
    }
    setSuccess(true);
    setTimeout(() => window.location.reload(), 2000);
  };

  const handleError = (msg) => {
    setError(msg);
    setTimeout(() => setError(''), 5000);
  };

  // ── ALREADY PREMIUM ──
  if (isPremium || success) {
    return (
      <div className="px-5 pt-12 pb-8 flex flex-col items-center text-center min-h-screen">
        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring' }}>
          <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-amber-100 to-yellow-100 border-2 border-amber-300 flex items-center justify-center mb-4 mx-auto">
            <Crown className="w-10 h-10 text-amber-500" />
          </div>
        </motion.div>
        <h1 className="font-heading text-2xl font-bold mb-2">You're Premium! 🎉</h1>
        <p className="text-muted-foreground mb-1">All FlowCare features are unlocked for you.</p>
        <p className="text-sm font-semibold text-amber-600 mb-6">✨ Lifetime Access — Never expires</p>
        <Link to="/"><Button className="rounded-xl font-heading font-bold px-8">Go to Home</Button></Link>
      </div>
    );
  }

  // iOS/Android user agent = native app shell with IAP support
  const isMobileApp = platform === 'ios' || platform === 'android';
  const isIndia = () => {
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
    return tz.includes('Kolkata') || tz.includes('Calcutta');
  };

  // Native app (iOS/Android): RevenueCat IAP
  // Web browser: Razorpay (India) or coming soon (international)
  const showRevenueCat = isMobileApp;
  const showRazorpay = !isMobileApp && isIndia();
  const showGlobalMessage = !isMobileApp && !isIndia();

  return (
    <div className="px-5 pt-8 pb-10 max-w-sm mx-auto">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-6">
        <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center mb-4">
          <Crown className="w-8 h-8 text-primary" />
        </div>
        <h1 className="font-heading text-2xl font-bold">FlowCare Premium</h1>
        <p className="text-muted-foreground mt-1">Unlock your full health journey</p>

        {/* Platform indicator */}
        <div className="flex items-center justify-center gap-1.5 mt-3">
          {isMobileApp ? (
            <Badge variant="outline" className="text-xs gap-1">
              <Smartphone className="w-3 h-3" />
              {platform === 'ios' ? 'iOS App' : 'Android App'} — In-App Purchase
            </Badge>
          ) : (
            <Badge variant="outline" className="text-xs gap-1">
              <Globe className="w-3 h-3" />
              Web — {isIndia() ? 'Razorpay' : 'International'}
            </Badge>
          )}
        </div>
      </motion.div>

      {/* Price + features card */}
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.1 }}>
      <Card className="p-6 mb-5 border-2 border-primary/30 bg-gradient-to-br from-primary/5 to-accent/5 relative overflow-hidden">
        <div className="absolute top-3 right-3">
          <Badge className="bg-primary text-primary-foreground font-heading text-xs rounded-full px-3">Lifetime</Badge>
        </div>

        {/* 7-day trial banner */}
        <div className="bg-green-500/10 border border-green-500/30 rounded-xl px-4 py-2.5 mb-4 text-center">
          <p className="text-green-700 font-heading font-bold text-sm">🎉 7-Day Free Trial Included</p>
          <p className="text-green-600 text-xs mt-0.5">Try all premium features free for 7 days</p>
        </div>

        {/* Price display */}
        <div className="text-center mb-5">
          {isMobileApp ? (
            <>
              <p className="text-5xl font-heading font-bold text-primary">$6.99</p>
              <p className="text-sm text-muted-foreground mt-1">One-time · Lifetime access</p>
              <p className="text-xs text-muted-foreground">Via {platform === 'ios' ? 'Apple App Store' : 'Google Play'} In-App Purchase</p>
            </>
          ) : isIndia() ? (
            <>
              <p className="text-5xl font-heading font-bold text-primary">₹399</p>
              <p className="text-sm text-muted-foreground mt-1">One-time · Lifetime access</p>
              <p className="text-xs text-muted-foreground">India pricing via Razorpay</p>
            </>
          ) : (
            <>
              <p className="text-5xl font-heading font-bold text-primary">$6.99</p>
              <p className="text-sm text-muted-foreground mt-1">One-time · Lifetime access</p>
              <p className="text-xs text-muted-foreground">Download the app to purchase</p>
            </>
          )}
        </div>

          {/* Feature list */}
          <div className="space-y-2.5 mb-6">
            {FEATURES.map((f, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 + i * 0.04 }}
                className="flex items-center gap-2.5"
              >
                <div className="w-5 h-5 rounded-full bg-primary/15 flex items-center justify-center shrink-0">
                  <Check className="w-3 h-3 text-primary" />
                </div>
                <span className="text-sm">{f}</span>
              </motion.div>
            ))}
          </div>

          {/* Error banner */}
          {error && (
            <div className="flex items-start gap-2 p-3 rounded-xl bg-destructive/10 border border-destructive/20 mb-4">
              <AlertCircle className="w-4 h-4 text-destructive shrink-0 mt-0.5" />
              <p className="text-xs text-destructive">{error}</p>
            </div>
          )}

          {/* Payment component — platform aware */}
          {showRevenueCat && (
            <RevenueCatPayment
              platform={platform}
              onSuccess={handleSuccess}
              onError={handleError}
            />
          )}

          {showRazorpay && (
            <RazorpayPayment
              user={user}
              onSuccess={() => handleSuccess(null)}
              onError={handleError}
            />
          )}

          {showGlobalMessage && (
            <div className="space-y-3">
              <div className="p-4 rounded-xl bg-accent/10 border border-accent/20 text-center">
                <Smartphone className="w-8 h-8 text-accent mx-auto mb-2" />
                <p className="text-sm font-semibold">Download the FlowCare App</p>
                <p className="text-xs text-muted-foreground mt-1">
                  International payments are available via the iOS App Store or Google Play Store.
                </p>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <a href="#" className="flex items-center justify-center gap-1.5 p-3 rounded-xl border bg-black text-white text-xs font-semibold">
                  🍎 App Store
                </a>
                <a href="#" className="flex items-center justify-center gap-1.5 p-3 rounded-xl border bg-green-600 text-white text-xs font-semibold">
                  ▶ Google Play
                </a>
              </div>
              <div className="flex items-center justify-center gap-1">
                <Shield className="w-3.5 h-3.5 text-muted-foreground" />
                <p className="text-xs text-muted-foreground">Secure payment via App Store / Google Play</p>
              </div>
            </div>
          )}
        </Card>
      </motion.div>

      {/* Free plan comparison */}
      <Card className="p-4 bg-muted/50">
        <p className="text-xs font-bold text-muted-foreground uppercase tracking-wide mb-2">Free Plan</p>
        <div className="space-y-1.5">
          {FREE_FEATURES.map((f, i) => (
            <div key={i} className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full bg-muted-foreground/20 flex items-center justify-center shrink-0">
                <Check className="w-2.5 h-2.5 text-muted-foreground" />
              </div>
              <span className="text-xs text-muted-foreground">{f}</span>
            </div>
          ))}
        </div>
      </Card>

      <p className="text-center text-xs text-muted-foreground mt-4">
        By purchasing you agree to our{' '}
        <Link to="/terms" className="text-primary underline">Terms</Link>{' & '}
        <Link to="/privacy" className="text-primary underline">Privacy Policy</Link>
      </p>
    </div>
  );
}