import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { format } from 'date-fns';

export default function WhatsAppAlertCard({ user }) {
  const [expanded, setExpanded] = useState(false);
  const [number, setNumber] = useState(user?.whatsapp_family?.[0] || '');
  const [saving, setSaving] = useState(false);

  const numbers = user?.whatsapp_family || [];
  const primaryNumber = numbers[0] || '';

  const today = format(new Date(), 'MMM d, yyyy');
  const name = user?.full_name?.split(' ')[0] || 'Anna';
  const previewMessage = `🌺 Hi! My period just started today (${today}). Logging via Jia 💕`;

  const [saved, setSaved] = useState(false);

  const saveNumber = async () => {
    if (!number.trim()) return;
    setSaving(true);
    // Auto-add +91 if no country code
    let num = number.trim();
    if (!num.startsWith('+') && num.length === 10) num = '+91' + num;
    const updated = [num, ...numbers.slice(1)];
    await base44.auth.updateMe({ whatsapp_family: updated });
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="bg-card border border-border/50 rounded-2xl shadow-sm overflow-hidden">
      <button
        className="w-full flex items-center gap-3 p-4"
        onClick={() => setExpanded(v => !v)}
      >
        <div className="w-10 h-10 bg-green-500/10 rounded-xl flex items-center justify-center flex-shrink-0">
          <span className="text-xl">📱</span>
        </div>
        <div className="flex-1 text-left min-w-0">
          <p className="font-heading font-bold text-sm text-foreground">WhatsApp Period Alert</p>
          <p className="text-[11px] text-muted-foreground truncate">Notify someone when your period starts</p>
        </div>
        {expanded ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
      </button>

      {expanded && (
        <div className="px-4 pb-4 space-y-3 border-t border-border/30 pt-3">
          <div>
            <p className="text-[11px] font-semibold text-muted-foreground mb-1">Message preview:</p>
            <div className="bg-green-50 border border-green-200 rounded-xl p-3">
              <p className="text-xs text-green-800">{previewMessage}</p>
            </div>
          </div>

          <div>
            <p className="text-[11px] font-semibold text-muted-foreground mb-1">
              Send to {name} (urgent contact)
            </p>
            <div className="flex gap-2">
              <Input
                value={number}
                onChange={e => setNumber(e.target.value)}
                placeholder="+91 9876543210"
                className="rounded-xl text-sm h-9 flex-1"
              />
              <Button
                size="sm"
                className="rounded-xl h-9 px-3"
                onClick={saveNumber}
                disabled={!number.trim() || saving}
              >
                {saved ? '✓' : saving ? '...' : 'Save'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}