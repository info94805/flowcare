import React from 'react';
import { motion } from 'framer-motion';
import { getPhaseInfo, getCyclePhase } from '@/lib/cycleUtils';

export default function CycleRing({ cycleDay, cycleLength = 28, daysUntil }) {
  const progress = cycleDay ? (cycleDay / cycleLength) * 100 : 0;
  const phase = getCyclePhase(cycleDay, cycleLength);
  const phaseInfo = getPhaseInfo(phase);
  
  const circumference = 2 * Math.PI * 90;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  return (
    <div className="flex flex-col items-center">
      <div className="relative w-56 h-56">
        <svg className="w-full h-full -rotate-90" viewBox="0 0 200 200">
          {/* Background circle */}
          <circle
            cx="100"
            cy="100"
            r="90"
            fill="none"
            stroke="hsl(var(--secondary))"
            strokeWidth="10"
            strokeLinecap="round"
          />
          {/* Progress circle */}
          <motion.circle
            cx="100"
            cy="100"
            r="90"
            fill="none"
            stroke="hsl(var(--primary))"
            strokeWidth="10"
            strokeLinecap="round"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset }}
            transition={{ duration: 1.2, ease: 'easeOut' }}
          />
        </svg>
        
        {/* Center content */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <motion.span
            className="text-4xl"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.3, type: 'spring' }}
          >
            {phaseInfo.emoji}
          </motion.span>
          <motion.div
            className="text-center mt-1"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            {cycleDay ? (
              <>
                <p className="text-3xl font-heading font-bold text-foreground">
                  Day {cycleDay}
                </p>
                <p className="text-xs font-medium text-muted-foreground mt-0.5">
                  {phaseInfo.label}
                </p>
              </>
            ) : (
              <p className="text-sm font-medium text-muted-foreground">
                Log your period
              </p>
            )}
          </motion.div>
        </div>
      </div>
      
      {daysUntil !== null && daysUntil !== undefined && (
        <motion.p
          className="mt-3 text-sm font-semibold text-primary bg-primary/10 px-4 py-1.5 rounded-full"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
        >
          {daysUntil === 0 ? 'Period expected today' : `${daysUntil} days until next period`}
        </motion.p>
      )}
    </div>
  );
}