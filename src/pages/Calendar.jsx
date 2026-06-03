import React, { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { motion } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import {
  format, startOfMonth, endOfMonth, startOfWeek, endOfWeek,
  addDays, addMonths, subMonths, isSameMonth, isSameDay, isWithinInterval
} from 'date-fns';
import { getAverageCycleLength, isOnPeriod, getFertileWindow, getOvulationDate } from '@/lib/cycleUtils';
import { DAILY_TIPS } from '@/lib/articles';

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export default function Calendar() {
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const { data: cycleLogs = [] } = useQuery({
    queryKey: ['cycleLogs'],
    queryFn: () => base44.entities.CycleLog.list('-start_date', 20),
  });

  const { data: dailyLogs = [] } = useQuery({
    queryKey: ['dailyLogs'],
    queryFn: () => base44.entities.DailyLog.list('-date', 90),
  });

  const latestCycle = cycleLogs[0];
  const avgCycleLength = getAverageCycleLength(cycleLogs);
  const avgPeriodLength = latestCycle?.period_length || 5;

  const fertileWindow = latestCycle ? getFertileWindow(latestCycle.start_date, avgCycleLength) : null;
  const ovulationDate = latestCycle ? getOvulationDate(latestCycle.start_date, avgCycleLength) : null;

  const dailyLogMap = useMemo(() => {
    const map = {};
    dailyLogs.forEach(log => { map[log.date] = log; });
    return map;
  }, [dailyLogs]);

  const getDayInfo = (date) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    const log = dailyLogMap[dateStr];
    const onPeriod = latestCycle ? isOnPeriod(date, latestCycle.start_date, avgPeriodLength, avgCycleLength) : false;
    const isFertile = fertileWindow ? isWithinInterval(date, { start: fertileWindow.start, end: fertileWindow.end }) : false;
    const isOvulation = ovulationDate ? isSameDay(date, ovulationDate) : false;
    
    return { log, onPeriod, isFertile, isOvulation };
  };

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(monthStart);
  const calStart = startOfWeek(monthStart);
  const calEnd = endOfWeek(monthEnd);

  const weeks = [];
  let day = calStart;
  while (day <= calEnd) {
    const week = [];
    for (let i = 0; i < 7; i++) {
      week.push(new Date(day));
      day = addDays(day, 1);
    }
    weeks.push(week);
  }

  const today = new Date();

  return (
    <div className="px-5 pt-6 space-y-4">
      <h1 className="font-heading text-2xl font-bold">Calendar</h1>

      {/* Month navigation */}
      <div className="flex items-center justify-between">
        <Button variant="ghost" size="icon" onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}>
          <ChevronLeft className="w-5 h-5" />
        </Button>
        <h2 className="font-heading font-bold text-lg">
          {format(currentMonth, 'MMMM yyyy')}
        </h2>
        <Button variant="ghost" size="icon" onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}>
          <ChevronRight className="w-5 h-5" />
        </Button>
      </div>

      {/* Calendar grid */}
      <Card className="p-4">
        {/* Weekday headers */}
        <div className="grid grid-cols-7 mb-2">
          {WEEKDAYS.map(d => (
            <div key={d} className="text-center text-xs font-semibold text-muted-foreground py-1">
              {d}
            </div>
          ))}
        </div>

        {/* Days */}
        {weeks.map((week, wi) => (
          <div key={wi} className="grid grid-cols-7">
            {week.map((d) => {
              const inMonth = isSameMonth(d, currentMonth);
              const isToday = isSameDay(d, today);
              const { onPeriod, isFertile, isOvulation, log } = getDayInfo(d);

              return (
                <motion.div
                  key={d.toISOString()}
                  className="aspect-square flex items-center justify-center relative"
                  whileTap={{ scale: 0.9 }}
                >
                  <div
                    className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-medium relative
                      ${!inMonth ? 'text-muted-foreground/30' : ''}
                      ${isToday ? 'ring-2 ring-primary ring-offset-1' : ''}
                      ${onPeriod ? 'bg-primary text-primary-foreground' : ''}
                      ${isFertile && !onPeriod ? 'bg-green-100 text-green-700' : ''}
                      ${isOvulation ? 'bg-accent text-accent-foreground' : ''}
                    `}
                  >
                    {format(d, 'd')}
                    {log?.mood && (
                      <span className="absolute -bottom-0.5 text-[8px]">
                        {log.mood === 'happy' ? '😊' : log.mood === 'sad' ? '😢' : '•'}
                      </span>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </div>
        ))}
      </Card>

      {/* Legend */}
      <div className="flex flex-wrap gap-3 text-xs">
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-full bg-primary" />
          <span className="text-muted-foreground">Period</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-full bg-green-100 border border-green-300" />
          <span className="text-muted-foreground">Fertile window</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-full bg-accent" />
          <span className="text-muted-foreground">Ovulation</span>
        </div>
      </div>

      {/* Health Tips */}
      <div>
        <p className="text-xs font-bold text-muted-foreground uppercase tracking-wide mb-3">Health Tips</p>
        <div className="space-y-2">
          {DAILY_TIPS.slice(0, 5).map((tip, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.07 }}
              className="flex items-start gap-3 bg-card border border-border/50 rounded-2xl p-3 shadow-sm"
            >
              <span className="text-lg flex-shrink-0">{tip.split(' ')[0]}</span>
              <p className="text-xs text-foreground font-medium leading-relaxed">{tip.slice(tip.indexOf(' ') + 1)}</p>
            </motion.div>
          ))}
        </div>
      </div>

      <div className="pb-4" />
    </div>
  );
}