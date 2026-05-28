import React, { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { motion } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell, RadialBarChart, RadialBar } from 'recharts';
import { getAverageCycleLength } from '@/lib/cycleUtils';
import { MOODS, SYMPTOMS_LIST } from '@/lib/cycleUtils';
import { TrendingUp, Droplets, Heart, Moon, Zap } from 'lucide-react';
import { format, parseISO, subDays } from 'date-fns';

const COLORS = ['#FF85A2', '#C9A0DC', '#FFB3C6', '#85D1FF', '#B5EAD7'];

export default function Insights() {
  const { data: cycleLogs = [] } = useQuery({
    queryKey: ['cycleLogs'],
    queryFn: () => base44.entities.CycleLog.list('-start_date', 20),
  });
  const { data: dailyLogs = [] } = useQuery({
    queryKey: ['allDailyLogs'],
    queryFn: () => base44.entities.DailyLog.list('-date', 90),
  });

  const avgCycleLength = getAverageCycleLength(cycleLogs);

  // Mood distribution
  const moodData = useMemo(() => {
    const counts = {};
    dailyLogs.forEach(l => { if (l.mood) counts[l.mood] = (counts[l.mood] || 0) + 1; });
    return Object.entries(counts).map(([id, count]) => ({
      name: MOODS.find(m => m.id === id)?.emoji + ' ' + (MOODS.find(m => m.id === id)?.label || id),
      value: count,
    })).sort((a, b) => b.value - a.value).slice(0, 5);
  }, [dailyLogs]);

  // Symptom frequency
  const symptomData = useMemo(() => {
    const counts = {};
    dailyLogs.forEach(l => (l.symptoms || []).forEach(s => { counts[s] = (counts[s] || 0) + 1; }));
    return Object.entries(counts).map(([id, count]) => ({
      name: SYMPTOMS_LIST.find(s => s.id === id)?.emoji + ' ' + (SYMPTOMS_LIST.find(s => s.id === id)?.label || id),
      count,
    })).sort((a, b) => b.count - a.count).slice(0, 6);
  }, [dailyLogs]);

  // Cycle lengths over time
  const cycleLengthData = useMemo(() => {
    const sorted = [...cycleLogs].sort((a, b) => new Date(a.start_date) - new Date(b.start_date));
    return sorted.slice(-8).map((log, i) => ({
      name: format(parseISO(log.start_date), 'MMM d'),
      days: log.cycle_length || avgCycleLength,
    }));
  }, [cycleLogs, avgCycleLength]);

  // Water intake last 7 days
  const waterData = useMemo(() => {
    return Array.from({ length: 7 }, (_, i) => {
      const d = subDays(new Date(), 6 - i);
      const dateStr = format(d, 'yyyy-MM-dd');
      const log = dailyLogs.find(l => l.date === dateStr);
      return { name: format(d, 'EEE'), glasses: log?.water_intake || 0 };
    });
  }, [dailyLogs]);

  // Sleep last 7 days
  const sleepData = useMemo(() => {
    return Array.from({ length: 7 }, (_, i) => {
      const d = subDays(new Date(), 6 - i);
      const dateStr = format(d, 'yyyy-MM-dd');
      const log = dailyLogs.find(l => l.date === dateStr);
      return { name: format(d, 'EEE'), hours: log?.sleep_hours || 0 };
    });
  }, [dailyLogs]);

  // Summary stats
  const totalDaysLogged = dailyLogs.length;
  const avgWater = dailyLogs.filter(l => l.water_intake).reduce((a, b) => a + (b.water_intake || 0), 0) / Math.max(1, dailyLogs.filter(l => l.water_intake).length);
  const avgSleep = dailyLogs.filter(l => l.sleep_hours).reduce((a, b) => a + (b.sleep_hours || 0), 0) / Math.max(1, dailyLogs.filter(l => l.sleep_hours).length);

  const radialData = [
    { name: 'Cycle Reg.', value: 85, fill: '#FF85A2' },
    { name: 'Logging', value: Math.min(100, totalDaysLogged * 3), fill: '#C9A0DC' },
    { name: 'Hydration', value: Math.min(100, (avgWater / 8) * 100), fill: '#85D1FF' },
  ];

  return (
    <div className="px-4 pt-6 pb-8 space-y-5">
      <h1 className="font-heading text-2xl font-bold px-1">Insights ✨</h1>

      {/* Summary cards */}
      <div className="grid grid-cols-2 gap-3">
        {[
          { icon: Heart, label: 'Avg Cycle', value: `${avgCycleLength} days`, color: 'text-primary', bg: 'from-primary/10 to-primary/5' },
          { icon: TrendingUp, label: 'Days Tracked', value: totalDaysLogged, color: 'text-accent', bg: 'from-accent/10 to-accent/5' },
          { icon: Droplets, label: 'Avg Water', value: `${avgWater.toFixed(1)} glasses`, color: 'text-blue-500', bg: 'from-blue-50 to-blue-50/30' },
          { icon: Moon, label: 'Avg Sleep', value: `${avgSleep.toFixed(1)} hrs`, color: 'text-indigo-500', bg: 'from-indigo-50 to-indigo-50/30' },
        ].map((s, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
            <Card className={`p-4 bg-gradient-to-br ${s.bg}`}>
              <s.icon className={`w-5 h-5 ${s.color} mb-1`} />
              <p className={`text-xl font-heading font-bold ${s.color}`}>{s.value}</p>
              <p className="text-xs text-muted-foreground">{s.label}</p>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Wellness Score */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}>
        <Card className="p-5">
          <h3 className="font-heading font-bold mb-3 flex items-center gap-2">
            <Zap className="w-4 h-4 text-primary" /> Wellness Score
          </h3>
          <ResponsiveContainer width="100%" height={160}>
            <RadialBarChart cx="50%" cy="50%" innerRadius="30%" outerRadius="90%" data={radialData} startAngle={180} endAngle={0}>
              <RadialBar dataKey="value" cornerRadius={8} />
              <Tooltip formatter={(v) => `${Math.round(v)}%`} />
            </RadialBarChart>
          </ResponsiveContainer>
          <div className="flex justify-center gap-4 mt-2">
            {radialData.map((d, i) => (
              <div key={i} className="flex items-center gap-1">
                <div className="w-2.5 h-2.5 rounded-full" style={{ background: d.fill }} />
                <span className="text-xs text-muted-foreground">{d.name}</span>
              </div>
            ))}
          </div>
        </Card>
      </motion.div>

      {/* Mood Distribution */}
      {moodData.length > 0 && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}>
          <Card className="p-5">
            <h3 className="font-heading font-bold mb-3">😊 Mood Distribution</h3>
            <ResponsiveContainer width="100%" height={180}>
              <PieChart>
                <Pie data={moodData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={70} label={({ name, percent }) => `${(percent * 100).toFixed(0)}%`} labelLine={false}>
                  {moodData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex flex-wrap justify-center gap-2 mt-1">
              {moodData.map((d, i) => (
                <div key={i} className="flex items-center gap-1 text-xs">
                  <div className="w-2.5 h-2.5 rounded-full" style={{ background: COLORS[i % COLORS.length] }} />
                  <span className="text-muted-foreground">{d.name}</span>
                </div>
              ))}
            </div>
          </Card>
        </motion.div>
      )}

      {/* Top Symptoms */}
      {symptomData.length > 0 && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}>
          <Card className="p-5">
            <h3 className="font-heading font-bold mb-3">🩺 Common Symptoms</h3>
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={symptomData} layout="vertical">
                <XAxis type="number" hide />
                <YAxis dataKey="name" type="category" width={110} tick={{ fontSize: 11 }} />
                <Tooltip />
                <Bar dataKey="count" radius={[0, 6, 6, 0]}>
                  {symptomData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </motion.div>
      )}

      {/* Cycle Lengths */}
      {cycleLengthData.length > 1 && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }}>
          <Card className="p-5">
            <h3 className="font-heading font-bold mb-3">📅 Cycle Length History</h3>
            <ResponsiveContainer width="100%" height={160}>
              <LineChart data={cycleLengthData}>
                <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                <YAxis domain={[20, 40]} hide />
                <Tooltip />
                <Line type="monotone" dataKey="days" stroke="#FF85A2" strokeWidth={2.5} dot={{ fill: '#FF85A2', r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </Card>
        </motion.div>
      )}

      {/* Water & Sleep */}
      <div className="grid grid-cols-2 gap-3">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.7 }}>
          <Card className="p-4">
            <h3 className="font-heading font-bold text-sm mb-2 flex items-center gap-1"><Droplets className="w-3.5 h-3.5 text-blue-400" /> Water</h3>
            <ResponsiveContainer width="100%" height={80}>
              <BarChart data={waterData}>
                <XAxis dataKey="name" tick={{ fontSize: 9 }} />
                <Tooltip />
                <Bar dataKey="glasses" fill="#85D1FF" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </motion.div>
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.8 }}>
          <Card className="p-4">
            <h3 className="font-heading font-bold text-sm mb-2 flex items-center gap-1"><Moon className="w-3.5 h-3.5 text-indigo-400" /> Sleep</h3>
            <ResponsiveContainer width="100%" height={80}>
              <BarChart data={sleepData}>
                <XAxis dataKey="name" tick={{ fontSize: 9 }} />
                <Tooltip />
                <Bar dataKey="hours" fill="#C9A0DC" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}