import React, { useState, useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { motion } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Plus, Trash2, BellRing, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const DEFAULT_REMINDERS = [
  { type: 'pad_change', title: '🩹 Pad Reminder', message: 'Time to change your pad/tampon!', time: '08:00', repeat: 'cycle_based', days_offset: -4 },
  { type: 'water', title: '💧 Drink Water', message: 'Stay hydrated! Have a glass of water.', time: '10:00', repeat: 'daily' },
  { type: 'water', title: '💧 Afternoon Water', message: 'Afternoon hydration reminder!', time: '14:00', repeat: 'daily' },
  { type: 'sleep', title: '🌙 Bedtime', message: 'Wind down and get ready for sleep.', time: '21:30', repeat: 'daily' },
  { type: 'period_start', title: '🌺 Period Alert', message: 'Your period may start in 4 days. Be prepared!', time: '09:00', repeat: 'cycle_based', days_offset: -4 },
];

const TYPE_ICONS = {
  pad_change: '🩹',
  water: '💧',
  sleep: '🌙',
  period_start: '🌺',
  fertile_window: '🌸',
  custom: '⏰',
};

const TYPE_COLORS = {
  pad_change: 'bg-pink-500/10 border-pink-400/30',
  water: 'bg-blue-500/10 border-blue-400/30',
  sleep: 'bg-indigo-500/10 border-indigo-400/30',
  period_start: 'bg-primary/5 border-primary/20',
  fertile_window: 'bg-accent/10 border-accent/20',
  custom: 'bg-muted border-border',
};

export default function RemindersPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [showAdd, setShowAdd] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newTime, setNewTime] = useState('08:00');
  const [newRepeat, setNewRepeat] = useState('daily');

  const { data: reminders = [], isLoading } = useQuery({
    queryKey: ['reminders'],
    queryFn: () => base44.entities.Reminder.list(),
  });

  const setupDefaults = async () => {
    if (reminders.length === 0 && !isLoading) {
      for (const r of DEFAULT_REMINDERS) {
        await base44.entities.Reminder.create({ ...r, is_active: true });
      }
      queryClient.invalidateQueries({ queryKey: ['reminders'] });
    }
  };

  useEffect(() => { if (!isLoading) setupDefaults(); }, [isLoading]);

  const toggleReminder = async (id, current) => {
    await base44.entities.Reminder.update(id, { is_active: !current });
    queryClient.invalidateQueries({ queryKey: ['reminders'] });
  };

  const deleteReminder = async (id) => {
    await base44.entities.Reminder.delete(id);
    queryClient.invalidateQueries({ queryKey: ['reminders'] });
  };

  const addCustom = async () => {
    if (!newTitle) return;
    await base44.entities.Reminder.create({ type: 'custom', title: newTitle, time: newTime, repeat: newRepeat, is_active: true });
    setNewTitle('');
    setShowAdd(false);
    queryClient.invalidateQueries({ queryKey: ['reminders'] });
  };

  const activeCount = reminders.filter(r => r.is_active).length;

  return (
    <div className="px-5 pt-6 pb-8 space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="w-9 h-9 rounded-full flex items-center justify-center bg-secondary/60 hover:bg-secondary transition-colors">
            <ArrowLeft className="w-5 h-5 text-foreground" />
          </button>
          <div>
            <h1 className="font-heading text-2xl font-bold">Reminders</h1>
            <p className="text-sm text-muted-foreground">{activeCount} active reminders</p>
          </div>
        </div>
        <Button onClick={() => setShowAdd(!showAdd)} size="sm" className="rounded-xl font-heading font-bold">
          <Plus className="w-4 h-4 mr-1" /> Add
        </Button>
      </div>

      {/* Push notification note */}
      <Card className="p-4 bg-gradient-to-r from-primary/10 to-accent/10 border-primary/20">
        <div className="flex items-start gap-3">
          <BellRing className="w-5 h-5 text-primary mt-0.5" />
          <div>
            <p className="text-sm font-bold font-heading">Smart Reminders</p>
            <p className="text-xs text-muted-foreground mt-0.5">
              Pad reminders trigger 4 days before your expected period. Cycle-based reminders auto-calculate from your tracking data.
            </p>
          </div>
        </div>
      </Card>

      {/* Add custom reminder */}
      {showAdd && (
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
          <Card className="p-5 space-y-3 border-primary/30">
            <h3 className="font-heading font-bold">New Reminder</h3>
            <div>
              <Label className="text-xs font-semibold">Title</Label>
              <Input value={newTitle} onChange={e => setNewTitle(e.target.value)} placeholder="e.g. Take vitamins" className="mt-1 rounded-xl" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-xs font-semibold">Time</Label>
                <Input type="time" value={newTime} onChange={e => setNewTime(e.target.value)} className="mt-1 rounded-xl" />
              </div>
              <div>
                <Label className="text-xs font-semibold">Repeat</Label>
                <select value={newRepeat} onChange={e => setNewRepeat(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-input bg-background px-3 py-2 text-sm">
                  <option value="daily">Daily</option>
                  <option value="weekly">Weekly</option>
                  <option value="once">Once</option>
                </select>
              </div>
            </div>
            <div className="flex gap-2">
              <Button onClick={addCustom} disabled={!newTitle} className="flex-1 rounded-xl font-heading font-bold">Save</Button>
              <Button variant="outline" onClick={() => setShowAdd(false)} className="rounded-xl">Cancel</Button>
            </div>
          </Card>
        </motion.div>
      )}

      {/* Reminder groups */}
      {['period_start', 'pad_change', 'water', 'sleep', 'custom'].map(type => {
        const group = reminders.filter(r => r.type === type);
        if (group.length === 0) return null;
        const labels = { period_start: '🌺 Period Alerts', pad_change: '🩹 Pad Reminders', water: '💧 Hydration', sleep: '🌙 Sleep', custom: '⏰ Custom' };
        return (
          <div key={type}>
            <p className="text-xs font-bold text-muted-foreground uppercase tracking-wide mb-2">{labels[type]}</p>
            <div className="space-y-2">
              {group.map((r, i) => (
                <motion.div key={r.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}>
                  <Card className={`p-4 border ${TYPE_COLORS[r.type] || TYPE_COLORS.custom}`}>
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{TYPE_ICONS[r.type] || '⏰'}</span>
                      <div className="flex-1 min-w-0">
                        <p className="font-heading font-semibold text-sm">{r.title}</p>
                        <p className="text-xs text-muted-foreground">
                          {r.time} · {r.repeat === 'cycle_based' ? `${Math.abs(r.days_offset || 4)} days before period` : r.repeat}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Switch checked={r.is_active} onCheckedChange={() => toggleReminder(r.id, r.is_active)} />
                        {r.type === 'custom' && (
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive/60 hover:text-destructive" onClick={() => deleteReminder(r.id)}>
                            <Trash2 className="w-3.5 h-3.5" />
                          </Button>
                        )}
                      </div>
                    </div>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}