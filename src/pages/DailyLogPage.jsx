import React, { useState, useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { motion } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { format } from 'date-fns';
import { Check, Droplets, Moon } from 'lucide-react';
import { MOODS, FLOW_LEVELS, SYMPTOMS_LIST } from '@/lib/cycleUtils';

export default function DailyLogPage() {
  const queryClient = useQueryClient();
  const today = format(new Date(), 'yyyy-MM-dd');

  const { data: todayLogs = [] } = useQuery({
    queryKey: ['todayLog', today],
    queryFn: () => base44.entities.DailyLog.filter({ date: today }),
  });

  const existingLog = todayLogs[0];

  const [mood, setMood] = useState('');
  const [flow, setFlow] = useState('none');
  const [symptoms, setSymptoms] = useState([]);
  const [notes, setNotes] = useState('');
  const [water, setWater] = useState(0);
  const [sleep, setSleep] = useState(0);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (existingLog) {
      setMood(existingLog.mood || '');
      setFlow(existingLog.flow_intensity || 'none');
      setSymptoms(existingLog.symptoms || []);
      setNotes(existingLog.notes || '');
      setWater(existingLog.water_intake || 0);
      setSleep(existingLog.sleep_hours || 0);
    }
  }, [existingLog]);

  const toggleSymptom = (id) => {
    setSymptoms(prev => prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id]);
  };

  const handleSave = async () => {
    setSaving(true);
    const data = {
      date: today,
      mood: mood || undefined,
      flow_intensity: flow,
      symptoms,
      notes: notes || undefined,
      water_intake: water || undefined,
      sleep_hours: sleep || undefined,
    };

    if (existingLog?.id) {
      await base44.entities.DailyLog.update(existingLog.id, data);
    } else {
      await base44.entities.DailyLog.create(data);
    }
    
    queryClient.invalidateQueries({ queryKey: ['todayLog'] });
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="px-5 pt-6 space-y-5 pb-8">
      <div>
        <h1 className="font-heading text-2xl font-bold">Daily Log</h1>
        <p className="text-sm text-muted-foreground">{format(new Date(), 'EEEE, MMMM d')}</p>
      </div>

      {/* Mood */}
      <Card className="p-5">
        <h3 className="font-heading font-bold mb-3">Mood</h3>
        <div className="grid grid-cols-4 gap-2">
          {MOODS.map((m) => (
            <motion.button
              key={m.id}
              whileTap={{ scale: 0.9 }}
              onClick={() => setMood(m.id)}
              className={`flex flex-col items-center gap-1 p-2.5 rounded-xl text-xs font-medium transition-all ${
                mood === m.id ? 'bg-primary/15 ring-2 ring-primary/30' : 'bg-secondary/50'
              }`}
            >
              <span className="text-xl">{m.emoji}</span>
              <span className="text-muted-foreground">{m.label}</span>
            </motion.button>
          ))}
        </div>
      </Card>

      {/* Flow */}
      <Card className="p-5">
        <h3 className="font-heading font-bold mb-3">Flow Level</h3>
        <div className="flex gap-2">
          {FLOW_LEVELS.map((f) => (
            <motion.button
              key={f.id}
              whileTap={{ scale: 0.9 }}
              onClick={() => setFlow(f.id)}
              className={`flex-1 flex flex-col items-center gap-1 py-3 rounded-xl text-xs font-medium transition-all ${
                flow === f.id ? 'bg-primary/15 ring-2 ring-primary/30' : 'bg-secondary/50'
              }`}
            >
              <span>{f.emoji}</span>
              <span className="text-muted-foreground">{f.label}</span>
            </motion.button>
          ))}
        </div>
      </Card>

      {/* Symptoms */}
      <Card className="p-5">
        <h3 className="font-heading font-bold mb-3">Symptoms</h3>
        <div className="grid grid-cols-3 gap-2">
          {SYMPTOMS_LIST.map((s) => (
            <motion.button
              key={s.id}
              whileTap={{ scale: 0.9 }}
              onClick={() => toggleSymptom(s.id)}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium transition-all ${
                symptoms.includes(s.id) ? 'bg-primary/15 ring-2 ring-primary/30' : 'bg-secondary/50'
              }`}
            >
              <span>{s.emoji}</span>
              <span className="text-muted-foreground truncate">{s.label}</span>
            </motion.button>
          ))}
        </div>
      </Card>

      {/* Water & Sleep */}
      <Card className="p-5">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Droplets className="w-4 h-4 text-blue-400" />
              <h3 className="font-heading font-bold text-sm">Water (glasses)</h3>
            </div>
            <div className="flex items-center gap-3">
              <Button variant="outline" size="icon" className="rounded-xl h-8 w-8" onClick={() => setWater(Math.max(0, water - 1))}>-</Button>
              <span className="text-xl font-bold text-blue-500 w-8 text-center">{water}</span>
              <Button variant="outline" size="icon" className="rounded-xl h-8 w-8" onClick={() => setWater(water + 1)}>+</Button>
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Moon className="w-4 h-4 text-indigo-400" />
              <h3 className="font-heading font-bold text-sm">Sleep (hours)</h3>
            </div>
            <div className="flex items-center gap-3">
              <Button variant="outline" size="icon" className="rounded-xl h-8 w-8" onClick={() => setSleep(Math.max(0, sleep - 0.5))}>-</Button>
              <span className="text-xl font-bold text-indigo-500 w-8 text-center">{sleep}</span>
              <Button variant="outline" size="icon" className="rounded-xl h-8 w-8" onClick={() => setSleep(Math.min(24, sleep + 0.5))}>+</Button>
            </div>
          </div>
        </div>
      </Card>

      {/* Notes */}
      <Card className="p-5">
        <h3 className="font-heading font-bold mb-2">Notes</h3>
        <Textarea
          placeholder="How are you feeling today? ✍️"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          className="rounded-xl resize-none"
          rows={3}
        />
      </Card>

      {/* Save */}
      <Button
        onClick={handleSave}
        disabled={saving}
        className="w-full rounded-xl font-heading font-bold py-6 text-base"
      >
        {saved ? (
          <span className="flex items-center gap-1"><Check className="w-5 h-5" /> Saved!</span>
        ) : saving ? 'Saving...' : existingLog ? 'Update Log ✨' : 'Save Log ✨'}
      </Button>
    </div>
  );
}