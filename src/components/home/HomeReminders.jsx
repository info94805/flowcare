import React from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Switch } from '@/components/ui/switch';
import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';

export default function HomeReminders() {
  const queryClient = useQueryClient();
  const { data: reminders = [] } = useQuery({
    queryKey: ['reminders'],
    queryFn: () => base44.entities.Reminder.list(),
  });

  const toggleReminder = async (id, current) => {
    await base44.entities.Reminder.update(id, { is_active: !current });
    queryClient.invalidateQueries({ queryKey: ['reminders'] });
  };

  const padReminder = reminders.find(r => r.type === 'pad_change');

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <p className="text-xs font-bold text-muted-foreground uppercase tracking-wide">Reminders</p>
        <Link to="/reminders" className="flex items-center gap-0.5 text-xs text-primary font-semibold">
          View all <ChevronRight className="w-3 h-3" />
        </Link>
      </div>

      <div className="space-y-2">
        {padReminder && (
          <div className="flex items-center gap-3 bg-card border border-border/50 rounded-2xl p-4 shadow-sm">
            <div className="w-10 h-10 bg-pink-500/10 rounded-xl flex items-center justify-center flex-shrink-0">
              <span className="text-xl">🩹</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-heading font-bold text-sm text-foreground">Pad Reminders</p>
              <p className="text-[11px] text-muted-foreground">
                {padReminder.is_active
                  ? `Active · ${Math.abs(padReminder.days_offset || 4)} days before period`
                  : 'Turned off'}
              </p>
            </div>
            <Switch
              checked={padReminder.is_active}
              onCheckedChange={() => toggleReminder(padReminder.id, padReminder.is_active)}
            />
          </div>
        )}

        {reminders.length === 0 && (
          <Link to="/reminders">
            <div className="flex items-center gap-3 bg-card border border-dashed border-border rounded-2xl p-4">
              <span className="text-2xl">🔔</span>
              <p className="text-sm text-muted-foreground">Set up reminders</p>
              <ChevronRight className="w-4 h-4 text-muted-foreground ml-auto" />
            </div>
          </Link>
        )}
      </div>
    </div>
  );
}