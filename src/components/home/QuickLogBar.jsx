import React from 'react';
import { Link } from 'react-router-dom';
import { Droplets, Smile, Activity, StickyNote } from 'lucide-react';

const items = [
  { icon: Droplets, label: 'Flow', color: 'text-primary', bg: 'bg-primary/10' },
  { icon: Smile, label: 'Mood', color: 'text-accent', bg: 'bg-accent/10' },
  { icon: Activity, label: 'Symptoms', color: 'text-rose-400', bg: 'bg-rose-400/10' },
  { icon: StickyNote, label: 'Notes', color: 'text-amber-500', bg: 'bg-amber-500/10' },
];

export default function QuickLogBar() {
  return (
    <div>
      <p className="text-xs font-bold text-muted-foreground uppercase tracking-wide mb-3">Quick Log</p>
      <div className="grid grid-cols-4 gap-2">
        {items.map(({ icon: Icon, label, color, bg }) => (
          <Link to="/log" key={label}>
            <div className="flex flex-col items-center gap-1.5 py-3 rounded-2xl bg-card border border-border/50 shadow-sm hover:shadow-md transition-all active:scale-95">
              <div className={`w-9 h-9 rounded-xl ${bg} flex items-center justify-center`}>
                <Icon className={`w-4 h-4 ${color}`} />
              </div>
              <span className="text-[11px] font-semibold text-foreground">{label}</span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}