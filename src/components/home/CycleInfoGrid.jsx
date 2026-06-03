import React from 'react';
import { format, addDays, parseISO } from 'date-fns';
import { getFertileWindow } from '@/lib/cycleUtils';

export default function CycleInfoGrid({ latestCycle, cycleLength, cycleLogs }) {
  if (!latestCycle) return null;

  const nextPeriod = addDays(parseISO(latestCycle.start_date), cycleLength);
  const fertileWindow = getFertileWindow(latestCycle.start_date, cycleLength);
  const createdDate = latestCycle.created_date ? new Date(latestCycle.created_date) : null;

  const cards = [
    {
      icon: '🗓️',
      label: 'Next Period',
      value: format(nextPeriod, 'MMM d, yyyy'),
      bg: 'bg-primary/5 border-primary/15',
    },
    {
      icon: '✅',
      label: 'Created',
      value: createdDate ? format(createdDate, 'MMM d, yyyy') : '—',
      bg: 'bg-secondary/50 border-border/50',
    },
    {
      icon: '🌸',
      label: 'Fertile Window',
      value: fertileWindow
        ? `${format(fertileWindow.start, 'MMM d')} – ${format(fertileWindow.end, 'MMM d')}`
        : '—',
      bg: 'bg-accent/5 border-accent/15',
    },
    {
      icon: '🔁',
      label: 'Cycle Length',
      value: `${cycleLength} days`,
      bg: 'bg-secondary/50 border-border/50',
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-2">
      {cards.map(({ icon, label, value, bg }) => (
        <div key={label} className={`p-3 rounded-2xl border ${bg}`}>
          <div className="flex items-center gap-1.5 mb-1">
            <span className="text-base">{icon}</span>
            <span className="text-[11px] font-semibold text-muted-foreground">{label}</span>
          </div>
          <p className="font-heading font-bold text-sm text-foreground">{value}</p>
        </div>
      ))}
    </div>
  );
}