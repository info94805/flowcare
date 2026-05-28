import React from 'react';
import { format, addDays, parseISO } from 'date-fns';
import { getCyclePhase, getPhaseInfo } from '@/lib/cycleUtils';

const PHASES = [
  { key: 'menstrual', label: 'Period', dayStart: 1, dayEnd: 5, emoji: '🌺' },
  { key: 'follicular', label: 'Follicular', dayStart: 6, dayEnd: 13, emoji: '🌱' },
  { key: 'ovulation', label: 'Ovulation', dayStart: 14, dayEnd: 16, emoji: '🌸' },
  { key: 'luteal', label: 'Luteal', dayStart: 17, dayEnd: 28, emoji: '🍂' },
];

const PHASE_COLORS = {
  menstrual: 'bg-primary text-primary-foreground',
  follicular: 'bg-green-400 text-white',
  ovulation: 'bg-accent text-white',
  luteal: 'bg-amber-400 text-white',
};

const PHASE_BG = {
  menstrual: 'bg-primary/10 border-primary/20',
  follicular: 'bg-green-50 border-green-200',
  ovulation: 'bg-accent/10 border-accent/20',
  luteal: 'bg-amber-50 border-amber-200',
};

export default function CycleTrackerCard({ cycleDay, cycleLength = 28, latestCycle }) {
  const currentPhase = getCyclePhase(cycleDay, cycleLength);

  // Build dot timeline
  const totalDots = Math.min(cycleLength, 28);
  const dots = Array.from({ length: totalDots }, (_, i) => i + 1);

  const getDotColor = (day) => {
    const phase = getCyclePhase(day, cycleLength);
    if (day === cycleDay) return 'bg-foreground scale-125';
    if (phase === 'menstrual') return 'bg-primary';
    if (phase === 'follicular') return 'bg-green-400';
    if (phase === 'ovulation') return 'bg-accent';
    return 'bg-amber-300';
  };

  // Phase date ranges
  const getPhaseDate = (dayOffset) => {
    if (!latestCycle) return '—';
    return format(addDays(parseISO(latestCycle.start_date), dayOffset - 1), 'MMM d–') ;
  };

  const getPhaseEndDate = (dayOffset) => {
    if (!latestCycle) return '—';
    return format(addDays(parseISO(latestCycle.start_date), dayOffset - 1), 'MMM d');
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <p className="text-xs font-bold text-muted-foreground uppercase tracking-wide">Cycle Tracker</p>
        <span className="text-xs font-semibold text-muted-foreground">Day {cycleDay || '—'} / {cycleLength}</span>
      </div>

      {/* Dot timeline */}
      <div className="flex gap-1 flex-wrap mb-4">
        {dots.map(day => (
          <div
            key={day}
            className={`w-2.5 h-2.5 rounded-full transition-all ${getDotColor(day)}`}
          />
        ))}
      </div>

      {/* Phase cards */}
      <div className="grid grid-cols-2 gap-2">
        {PHASES.map(({ key, label, dayStart, dayEnd, emoji }) => {
          const isActive = currentPhase === key;
          return (
            <div
              key={key}
              className={`p-3 rounded-2xl border ${isActive ? PHASE_BG[key] : 'bg-secondary/30 border-border/50'}`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-heading font-bold text-foreground">{emoji} {label}</span>
                {isActive && (
                  <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full ${PHASE_COLORS[key]}`}>Now</span>
                )}
              </div>
              <p className="text-[11px] text-muted-foreground">Day {dayStart}–{dayEnd}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}