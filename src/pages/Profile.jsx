import React, { useState, useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { motion } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { User, Heart, Calendar, LogOut, Save, Flower2 } from 'lucide-react';
import { getAverageCycleLength } from '@/lib/cycleUtils';

export default function Profile() {
  const queryClient = useQueryClient();
  const [user, setUser] = useState(null);
  const [cycleLength, setCycleLength] = useState(28);
  const [periodLength, setPeriodLength] = useState(5);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    base44.auth.me().then((u) => {
      setUser(u);
      if (u?.cycle_length) setCycleLength(u.cycle_length);
      if (u?.period_length) setPeriodLength(u.period_length);
    });
  }, []);

  const { data: cycleLogs = [] } = useQuery({
    queryKey: ['cycleLogs'],
    queryFn: () => base44.entities.CycleLog.list('-start_date', 20),
  });

  const { data: dailyLogs = [] } = useQuery({
    queryKey: ['allDailyLogs'],
    queryFn: () => base44.entities.DailyLog.list('-date', 100),
  });

  const avgCycleLength = getAverageCycleLength(cycleLogs);

  const handleSaveSettings = async () => {
    setSaving(true);
    await base44.auth.updateMe({
      cycle_length: cycleLength,
      period_length: periodLength,
    });
    setSaving(false);
  };

  const handleLogout = () => {
    base44.auth.logout('/');
  };

  return (
    <div className="px-5 pt-6 space-y-5 pb-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center gap-4"
      >
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
          <Flower2 className="w-8 h-8 text-primary" />
        </div>
        <div>
          <h1 className="font-heading text-xl font-bold">{user?.full_name || 'User'}</h1>
          <p className="text-sm text-muted-foreground">{user?.email}</p>
        </div>
      </motion.div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        <Card className="p-3 text-center">
          <p className="text-2xl font-heading font-bold text-primary">{cycleLogs.length}</p>
          <p className="text-xs text-muted-foreground">Cycles Logged</p>
        </Card>
        <Card className="p-3 text-center">
          <p className="text-2xl font-heading font-bold text-accent">{dailyLogs.length}</p>
          <p className="text-xs text-muted-foreground">Daily Logs</p>
        </Card>
        <Card className="p-3 text-center">
          <p className="text-2xl font-heading font-bold text-green-600">{avgCycleLength}</p>
          <p className="text-xs text-muted-foreground">Avg. Cycle</p>
        </Card>
      </div>

      {/* Cycle Settings */}
      <Card className="p-5 space-y-4">
        <h3 className="font-heading font-bold flex items-center gap-2">
          <Calendar className="w-4 h-4 text-primary" />
          Cycle Settings
        </h3>
        <div>
          <Label className="text-sm font-semibold">Average cycle length (days)</Label>
          <div className="flex items-center gap-3 mt-2">
            <Button variant="outline" size="icon" className="rounded-xl h-8 w-8" onClick={() => setCycleLength(Math.max(21, cycleLength - 1))}>-</Button>
            <span className="text-xl font-bold text-primary w-10 text-center">{cycleLength}</span>
            <Button variant="outline" size="icon" className="rounded-xl h-8 w-8" onClick={() => setCycleLength(Math.min(40, cycleLength + 1))}>+</Button>
          </div>
        </div>
        <div>
          <Label className="text-sm font-semibold">Period duration (days)</Label>
          <div className="flex items-center gap-3 mt-2">
            <Button variant="outline" size="icon" className="rounded-xl h-8 w-8" onClick={() => setPeriodLength(Math.max(2, periodLength - 1))}>-</Button>
            <span className="text-xl font-bold text-primary w-10 text-center">{periodLength}</span>
            <Button variant="outline" size="icon" className="rounded-xl h-8 w-8" onClick={() => setPeriodLength(Math.min(10, periodLength + 1))}>+</Button>
          </div>
        </div>
        <Button
          onClick={handleSaveSettings}
          disabled={saving}
          className="w-full rounded-xl font-heading font-bold"
        >
          <Save className="w-4 h-4 mr-2" />
          {saving ? 'Saving...' : 'Save Settings'}
        </Button>
      </Card>

      {/* Log Period */}
      <Card className="p-5 space-y-3">
        <h3 className="font-heading font-bold flex items-center gap-2">
          <Heart className="w-4 h-4 text-primary" />
          Log New Period
        </h3>
        <p className="text-xs text-muted-foreground">
          Mark the start of a new period to keep your predictions accurate.
        </p>
        <LogPeriodForm onLogged={() => queryClient.invalidateQueries({ queryKey: ['cycleLogs'] })} />
      </Card>

      <Separator />

      {/* Privacy */}
      <Card className="p-5">
        <h3 className="font-heading font-bold mb-2">🔒 Your Privacy</h3>
        <p className="text-xs text-muted-foreground leading-relaxed">
          Your data is private and secure. FlowCare does not share your information with anyone. 
          No public profiles, no social features. Your health data belongs to you.
        </p>
      </Card>

      {/* Sign out */}
      <Button
        variant="outline"
        onClick={handleLogout}
        className="w-full rounded-xl font-heading font-bold text-destructive border-destructive/30 hover:bg-destructive/5"
      >
        <LogOut className="w-4 h-4 mr-2" />
        Sign Out
      </Button>
    </div>
  );
}

function LogPeriodForm({ onLogged }) {
  const [startDate, setStartDate] = useState('');
  const [saving, setSaving] = useState(false);

  const handleLog = async () => {
    if (!startDate) return;
    setSaving(true);
    await base44.entities.CycleLog.create({ start_date: startDate });
    onLogged?.();
    setStartDate('');
    setSaving(false);
  };

  return (
    <div className="flex gap-2">
      <Input
        type="date"
        value={startDate}
        onChange={(e) => setStartDate(e.target.value)}
        className="rounded-xl flex-1"
        max={new Date().toISOString().split('T')[0]}
      />
      <Button
        onClick={handleLog}
        disabled={!startDate || saving}
        className="rounded-xl font-heading font-bold"
      >
        {saving ? '...' : 'Log'}
      </Button>
    </div>
  );
}