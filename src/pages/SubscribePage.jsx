import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { base44 } from '@/api/base44Client';
import { Check, Crown, Sparkles, Heart, Shield } from 'lucide-react';
import { Link } from 'react-router-dom';

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
  const [country, setCountry] = useState('OTHER');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    base44.auth.me().then(u => {
      setUser(u);
      // Detect India via timezone or stored country
      const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
      if (tz.includes('Asia/Kolkata') || tz.includes('Asia/Calcutta')) setCountry('IN');
    });
  }, []);

  const price = country === 'IN' ? '₹399' : '$7';
  const isPremium = user?.subscription_status === 'active';

  const handleSubscribe = async () => {
    setLoading(true);
    // Mark as active (in production connect to Stripe/Razorpay)
    await base44.auth.updateMe({
      subscription_status: 'active',
      subscription_country: country,
    });
    setLoading(false);
    window.location.reload();
  };

  if (isPremium) {
    return (
      <div className="px-5 pt-12 pb-8 flex flex-col items-center text-center min-h-screen">
        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring' }}>
          <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-amber-100 to-yellow-100 border-2 border-amber-300 flex items-center justify-center mb-4 mx-auto">
            <Crown className="w-10 h-10 text-amber-500" />
          </div>
        </motion.div>
        <h1 className="font-heading text-2xl font-bold mb-2">You're Premium! 🎉</h1>
        <p className="text-muted-foreground mb-6">All FlowCare features are unlocked for you.</p>
        <Link to="/"><Button className="rounded-xl font-heading font-bold px-8">Go to Home</Button></Link>
      </div>
    );
  }

  return (
    <div className="px-5 pt-8 pb-10 max-w-sm mx-auto">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-8">
        <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center mb-4">
          <Crown className="w-8 h-8 text-primary" />
        </div>
        <h1 className="font-heading text-2xl font-bold">FlowCare Premium</h1>
        <p className="text-muted-foreground mt-1">Unlock your full health journey</p>
      </motion.div>

      {/* Price card */}
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.1 }}>
        <Card className="p-6 mb-5 border-2 border-primary/30 bg-gradient-to-br from-primary/5 to-accent/5 relative overflow-hidden">
          <div className="absolute top-3 right-3">
            <Badge className="bg-primary text-primary-foreground font-heading text-xs rounded-full px-3">
              Most Popular
            </Badge>
          </div>
          <div className="text-center mb-4">
            <p className="text-5xl font-heading font-bold text-primary">{price}</p>
            <p className="text-sm text-muted-foreground mt-1">One-time · Lifetime access</p>
            {country === 'IN' ? (
              <p className="text-xs text-muted-foreground">For India · All other countries: $7 USD</p>
            ) : (
              <p className="text-xs text-muted-foreground">Outside India · India users: ₹399</p>
            )}
          </div>

          <div className="space-y-2.5 mb-6">
            {FEATURES.map((f, i) => (
              <motion.div key={i} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 + i * 0.05 }} className="flex items-center gap-2.5">
                <div className="w-5 h-5 rounded-full bg-primary/15 flex items-center justify-center shrink-0">
                  <Check className="w-3 h-3 text-primary" />
                </div>
                <span className="text-sm">{f}</span>
              </motion.div>
            ))}
          </div>

          <Button
            onClick={handleSubscribe}
            disabled={loading}
            className="w-full rounded-xl font-heading font-bold py-6 text-base shadow-lg"
          >
            {loading ? 'Processing...' : `Get Premium for ${price} 🌸`}
          </Button>

          <div className="flex items-center justify-center gap-1 mt-3">
            <Shield className="w-3.5 h-3.5 text-muted-foreground" />
            <p className="text-xs text-muted-foreground">10-day money-back guarantee · Secure payment</p>
          </div>
        </Card>
      </motion.div>

      {/* Free comparison */}
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
        By subscribing you agree to our{' '}
        <Link to="/terms" className="text-primary underline">Terms</Link>{' & '}
        <Link to="/privacy" className="text-primary underline">Privacy Policy</Link>
      </p>
    </div>
  );
}