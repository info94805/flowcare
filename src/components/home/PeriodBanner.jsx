import React from 'react';
import { format, addDays, parseISO } from 'date-fns';

export default function PeriodBanner({ daysUntil, latestCycle, cycleLength }) {
  if (daysUntil === null || daysUntil === undefined || !latestCycle) return null;

  const nextPeriodDate = addDays(parseISO(latestCycle.start_date), cycleLength);
  const formattedDate = format(nextPeriodDate, 'MMM d, yyyy');

  return (
    <div className="flex items-center gap-3 bg-primary/10 border border-primary/20 rounded-2xl px-4 py-3">
      <div className="flex-shrink-0 w-12 h-12 bg-primary rounded-xl flex flex-col items-center justify-center shadow-sm">
        <span className="text-primary-foreground font-heading font-black text-lg leading-none">{daysUntil}</span>
        <span className="text-primary-foreground/80 text-[9px] font-semibold leading-none">days</span>
      </div>
      <div>
        <p className="font-heading font-bold text-foreground text-sm">
          Period in {daysUntil} days
        </p>
        <p className="text-xs text-muted-foreground">expected {formattedDate}</p>
      </div>
    </div>
  );
}