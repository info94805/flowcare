import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MOODS, FLOW_LEVELS } from '@/lib/cycleUtils';
import { base44 } from '@/api/base44Client';
import { format } from 'date-fns';
import { Check } from 'lucide-react';

export default function QuickLog({ todayLog, onLogged }) {
  const [selectedMood, setSelectedMood] = useState(todayLog?.mood || null);
  const [selectedFlow, setSelectedFlow] = useState(todayLog?.flow_intensity || null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    const today = format(new Date(), 'yyyy-MM-dd');
    const data = { date: today };
    if (selectedMood) data.mood = selectedMood;
    if (selectedFlow) data.flow_intensity = selectedFlow;

    if (todayLog?.id) {
      await base44.entities.DailyLog.update(todayLog.id, data);
    } else {
      await base44.entities.DailyLog.create(data);
    }
    setSaving(false);
    setSaved(true);
    onLogged?.();
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <Card className="p-5 bg-card border-border/50 shadow-sm">
      <h3 className="font-heading font-bold text-foreground mb-3">How are you feeling?</h3>
      
      {/* Mood selector */}
      <div className="flex flex-wrap gap-2 mb-4">
        {MOODS.map((mood) => (
          <motion.button
            key={mood.id}
            whileTap={{ scale: 0.9 }}
            onClick={() => setSelectedMood(mood.id)}
            className={`flex flex-col items-center gap-0.5 px-2.5 py-2 rounded-xl text-xs font-medium transition-all ${
              selectedMood === mood.id
                ? 'bg-primary/15 ring-2 ring-primary/30'
                : 'bg-secondary/50 hover:bg-secondary'
            }`}
          >
            <span className="text-lg">{mood.emoji}</span>
            <span className="text-muted-foreground">{mood.label}</span>
          </motion.button>
        ))}
      </div>

      {/* Flow selector */}
      <h3 className="font-heading font-bold text-foreground mb-2">Flow level</h3>
      <div className="flex gap-2 mb-4">
        {FLOW_LEVELS.map((flow) => (
          <motion.button
            key={flow.id}
            whileTap={{ scale: 0.9 }}
            onClick={() => setSelectedFlow(flow.id)}
            className={`flex-1 flex flex-col items-center gap-0.5 py-2 rounded-xl text-xs font-medium transition-all ${
              selectedFlow === flow.id
                ? 'bg-primary/15 ring-2 ring-primary/30'
                : 'bg-secondary/50 hover:bg-secondary'
            }`}
          >
            <span className="text-sm">{flow.emoji}</span>
            <span className="text-muted-foreground">{flow.label}</span>
          </motion.button>
        ))}
      </div>

      <Button
        onClick={handleSave}
        disabled={(!selectedMood && !selectedFlow) || saving}
        className="w-full rounded-xl font-heading font-bold"
      >
        {saved ? (
          <span className="flex items-center gap-1"><Check className="w-4 h-4" /> Saved!</span>
        ) : saving ? 'Saving...' : 'Save Quick Log'}
      </Button>
    </Card>
  );
}