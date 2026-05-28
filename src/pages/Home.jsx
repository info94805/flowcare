import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { format } from 'date-fns';
import { Button } from '@/components/ui/button';

import CycleRing from '@/components/home/CycleRing';
import SplashScreen from '@/components/SplashScreen';
import QuickLog from '@/components/home/QuickLog';
import TipCard from '@/components/home/TipCard';
import { calculateCycleDay, daysUntilNextPeriod, getAverageCycleLength, getPhaseInfo, getCyclePhase } from '@/lib/cycleUtils';
import { DAILY_TIPS } from '@/lib/articles';

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

  const today = format(new Date(), 'yyyy-MM-dd');
  const { data: todayLogs = [] } = useQuery({
    queryKey: ['todayLog', today],
    queryFn: () => base44.entities.DailyLog.filter({ date: today }),
  });

  const todayLog = todayLogs[0] || null;
  const latestCycle = cycleLogs[0];
  const avgCycleLength = getAverageCycleLength(cycleLogs);
  const cycleDay = latestCycle ? calculateCycleDay(latestCycle.start_date) : null;
  const daysUntil = latestCycle ? daysUntilNextPeriod(latestCycle.start_date, avgCycleLength) : null;
  const phase = getCyclePhase(cycleDay, avgCycleLength);
  const phaseInfo = getPhaseInfo(phase);

  // Daily tip based on day of year
  const dayOfYear = Math.floor((new Date() - new Date(new Date().getFullYear(), 0, 0)) / 86400000);
  const dailyTip = DAILY_TIPS[dayOfYear % DAILY_TIPS.length];

  const hasSetup = cycleLogs.length > 0;

  return (
    <>
    <AnimatePresence>
      {showSplash && <SplashScreen onDone={handleSplashDone} />}
    </AnimatePresence>
    <div className="px-5 pt-6 space-y-5">
      {/* Header — content below splash */}
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
          className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center hover:bg-primary/20 transition-colors text-2xl leading-none"
        >
          🌸🌸🌸
        </button>
      </motion.div>

      {/* Cycle Ring */}
      {hasSetup ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="flex justify-center"
        >
          <CycleRing
            cycleDay={cycleDay}
            cycleLength={avgCycleLength}
            daysUntil={daysUntil}
          />
        </motion.div>
      ) : (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-8"
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
      )}

      {/* Phase tip */}
      {hasSetup && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className={`p-4 rounded-2xl ${phaseInfo.bg}`}
        >
          <p className={`text-sm font-semibold ${phaseInfo.color}`}>
            {phaseInfo.emoji} {phaseInfo.label}
          </p>
          <p className="text-xs text-muted-foreground mt-1">{phaseInfo.tip}</p>
        </motion.div>
      )}

      {/* Quick Log */}
      <QuickLog
        todayLog={todayLog}
        onLogged={() => queryClient.invalidateQueries({ queryKey: ['todayLog'] })}
      />

      {/* Daily Tip */}
      <TipCard tip={dailyTip} />
    </div>
    </>
  );
}