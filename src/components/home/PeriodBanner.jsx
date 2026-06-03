import React from 'react';
import { format, addDays, parseISO } from 'date-fns';

export default function PeriodBanner({ daysUntil, latestCycle, cycleLength }) {
  if (daysUntil === null || daysUntil === undefined || !latestCycle) return null;

  const nextPeriodDate = addDays(parseISO(latestCycle.start_date), cycleLength);
  const formattedDate = format(nextPeriodDate, 'MMM d, yyyy');

  const overdue = daysUntil < 0;
  const today = daysUntil === 0;
  const bigNumber = today ? 'Today' : String(Math.abs(daysUntil));
  const title = today
    ? 'Period expected today'
    : overdue
      ? `Period late by ${Math.abs(daysUntil)} day${Math.abs(daysUntil) === 1 ? '' : 's'}`
      : `Period in ${daysUntil} day${daysUntil === 1 ? '' : 's'}`;

  return (
    <div className="flex items-center gap-3 bg-primary/10 border border-primary/20 rounded-2xl px-4 py-3">
      <div className="flex-shrink-0 w-12 h-12 bg-primary rounded-xl flex flex-col items-center justify-center shadow-sm">
        <span className={`text-primary-foreground font-heading font-black leading-none ${today ? 'text-xs' : 'text-lg'}`}>{bigNumber}</span>
        {!today && <span className="text-primary-foreground/80 text-[9px] font-semibold leading-none">{overdue ? 'late' : 'days'}</span>}
      </div>
      <div>
        <p className="font-heading font-bold text-foreground text-sm">
          {title}
        </p>
        <p className="text-xs text-muted-foreground">expected {formattedDate}</p>
      </div>
    </div>
  );
}