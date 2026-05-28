import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ChevronDown, ChevronUp, Pencil, Send } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { format } from 'date-fns';

export default function WhatsAppAlertCard({ user }) {
  const [expanded, setExpanded] = useState(false);
  const [editing, setEditing] = useState(false);
  const [number, setNumber] = useState('');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const numbers = user?.whatsapp_family || [];
  const primaryNumber = numbers[0] || '';

  const today = format(new Date(), 'MMM d, yyyy');
  const name = user?.full_name?.split(' ')[0] || 'User';
  const previewMessage = `🌺 Hi! My period just started today (${today}). Logging via Jia 💕`;

  const handleSend = () => {
    if (!primaryNumber) return;
    const clean = primaryNumber.replace(/\s+/g, '');
    const encoded = encodeURIComponent(previewMessage);
    window.open(`https://wa.me/${clean.replace('+', '')}?text=${encoded}`, '_blank');
  };

  const saveNumber = async () => {
    if (!number.trim()) return;
    setSaving(true);
    let num = number.trim();
    if (!num.startsWith('+') && num.length === 10) num = '+91' + num;
    const updated = [num, ...numbers.slice(1)];
    await base44.auth.updateMe({ whatsapp_family: updated });
    setSaving(false);
    setSaved(true);
    setEditing(false);
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
          <p className="text-[11px] text-muted-foreground truncate">
            {primaryNumber ? `Contact: ${primaryNumber}` : 'Notify someone when your period starts'}
          </p>
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

            {/* Saved contact display */}
            {primaryNumber && !editing ? (
              <div className="flex gap-2 items-center">
                <div className="flex-1 flex items-center gap-2 px-3 h-9 rounded-xl border border-green-400/50 bg-green-50/50">
                  <span className="text-sm text-green-800 font-medium">{primaryNumber}</span>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  className="rounded-xl h-9 w-9 p-0 border-border"
                  onClick={() => { setNumber(primaryNumber); setEditing(true); }}
                >
                  <Pencil className="w-3.5 h-3.5" />
                </Button>
                <Button
                  size="sm"
                  className="rounded-xl h-9 px-3 bg-green-500 hover:bg-green-600 text-white gap-1.5"
                  onClick={handleSend}
                >
                  <Send className="w-3.5 h-3.5" />
                  Send
                </Button>
              </div>
            ) : (
              /* Edit / Add input */
              <div className="flex gap-2">
                <Input
                  value={number}
                  onChange={e => setNumber(e.target.value)}
                  placeholder="+91 9876543210"
                  className="rounded-xl text-sm h-9 flex-1"
                  autoFocus
                />
                {editing && (
                  <Button size="sm" variant="outline" className="rounded-xl h-9 px-3" onClick={() => setEditing(false)}>
                    Cancel
                  </Button>
                )}
                <Button
                  size="sm"
                  className="rounded-xl h-9 px-3"
                  onClick={saveNumber}
                  disabled={!number.trim() || saving}
                >
                  {saved ? '✓' : saving ? '...' : 'Save'}
                </Button>
              </div>
            )}

            {!primaryNumber && (
              <p className="text-[10px] text-muted-foreground mt-1">Add a parent/guardian number to enable alerts.</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}