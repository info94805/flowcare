import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { format } from 'date-fns';
import SplashScreen from '@/components/SplashScreen';
import PeriodBanner from '@/components/home/PeriodBanner';
import QuickLogBar from '@/components/home/QuickLogBar';
import CycleTrackerCard from '@/components/home/CycleTrackerCard';
import CycleInfoGrid from '@/components/home/CycleInfoGrid';
import HomeReminders from '@/components/home/HomeReminders';
import WhatsAppAlertCard from '@/components/home/WhatsAppAlertCard';
import InsightsButton from '@/components/home/InsightsButton';
import { calculateCycleDay, daysUntilNextPeriod, getAverageCycleLength } from '@/lib/cycleUtils';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { Copyright } from 'lucide-react';
import BlossomFlower from '@/components/home/BlossomFlower';

export default function Home() {
  const [user, setUser] = useState(null);
  const queryClient = useQueryClient();
  const [showSplash, setShowSplash] = useState(() => {
    const seen = localStorage.getItem('flowcare_splash_seen');
    return !seen;
  });

  const handleSplashDone = () => {
    localStorage.setItem('flowcare_splash_seen', '1');
    setShowSplash(false);
  };

  const resetSplash = () => {
    localStorage.removeItem('flowcare_splash_seen');
    setShowSplash(true);
  };

  useEffect(() => {
    base44.auth.me().then(setUser);
  }, []);

  const { data: cycleLogs = [] } = useQuery({
    queryKey: ['cycleLogs'],
    queryFn: () => base44.entities.CycleLog.list('-start_date', 20),
  });

  const latestCycle = cycleLogs[0];
  const avgCycleLength = getAverageCycleLength(cycleLogs);
  const cycleDay = latestCycle ? calculateCycleDay(latestCycle.start_date) : null;
  const daysUntil = latestCycle ? daysUntilNextPeriod(latestCycle.start_date, avgCycleLength) : null;

  const hasSetup = cycleLogs.length > 0;

  return (
    <>
      <AnimatePresence>
        {showSplash && <SplashScreen onDone={handleSplashDone} />}
      </AnimatePresence>

      <div className="px-4 pt-5 pb-28 space-y-5">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between"
        >
          <div>
            <h1 className="font-heading text-2xl font-bold text-foreground">
              Hi, {user?.full_name?.split(' ')[0] || 'there'} 💕
            </h1>
            <p className="text-sm text-muted-foreground">
              {format(new Date(), 'EEEE, MMMM d')}
            </p>
          </div>
          <button
            onClick={resetSplash}
            className="w-12 h-12 rounded-full flex items-center justify-center hover:scale-110 transition-transform"
          >
            <BlossomFlower size={44} />
          </button>
        </motion.div>

        {!hasSetup ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-10"
          >
            <p className="text-5xl mb-3">🌸</p>
            <h2 className="font-heading text-lg font-bold mb-2">Welcome to FlowCare!</h2>
            <p className="text-sm text-muted-foreground mb-4">
              Let's set up your cycle tracking to get started.
            </p>
            <Link to="/onboarding">
              <Button className="rounded-xl font-heading font-bold px-8">
                Get Started
              </Button>
            </Link>
          </motion.div>
        ) : (
          <>
            {/* Period Banner */}
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
              <PeriodBanner daysUntil={daysUntil} latestCycle={latestCycle} cycleLength={avgCycleLength} />
            </motion.div>

            {/* Quick Log */}
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
              <QuickLogBar />
            </motion.div>

            {/* Cycle Tracker */}
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="bg-card border border-border/50 rounded-2xl p-4 shadow-sm">
              <CycleTrackerCard cycleDay={cycleDay} cycleLength={avgCycleLength} latestCycle={latestCycle} />
            </motion.div>

            {/* Cycle Info Grid */}
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}>
              <CycleInfoGrid latestCycle={latestCycle} cycleLength={avgCycleLength} cycleLogs={cycleLogs} />
            </motion.div>

            {/* Reminders */}
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
              <HomeReminders />
            </motion.div>

            {/* WhatsApp Alert */}
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}>
              <WhatsAppAlertCard user={user} />
            </motion.div>

            {/* AI Insights Button */}
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
              <InsightsButton />
            </motion.div>

            {/* Upgrade to Premium */}
            {user?.subscription_status !== 'active' && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.45 }}>
                <Link to="/subscribe">
                  <div className="rounded-2xl p-4 bg-gradient-to-r from-primary to-accent text-white shadow-md flex items-center justify-between gap-3">
                    <div>
                      <p className="font-heading font-bold text-base">Upgrade to Premium ✨</p>
                      <p className="text-xs opacity-80 mt-0.5">AI reports, advanced insights & more — one-time ₹399</p>
                    </div>
                    <div className="bg-white/20 rounded-xl px-3 py-2 text-xs font-bold whitespace-nowrap">
                      Get Now →
                    </div>
                  </div>
                </Link>
              </motion.div>
            )}
          </>
        )}

        {/* Footer - Privacy & Legal */}
        <div className="text-center py-4 border-t border-border/30 mt-8">
          <div className="flex items-center justify-center gap-1 text-xs text-muted-foreground">
            <Copyright className="w-3 h-3" />
            <span>2026 FlowCare</span>
          </div>
          <div className="flex items-center justify-center gap-3 mt-2 text-xs">
            <Link to="/privacy" className="text-primary hover:underline">Privacy Policy</Link>
            <span className="text-border">•</span>
            <Link to="/terms" className="text-primary hover:underline">Terms</Link>
          </div>
        </div>
      </div>
    </>
  );
}