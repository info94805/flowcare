import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { base44 } from '@/api/base44Client';
import { X, MessageSquare } from 'lucide-react';

export default function WhatsAppModal({ user, onClose, onUpdate }) {
  const [num, setNum] = useState('');
  const [saving, setSaving] = useState(false);

  const addNumber = async () => {
    if (!num.trim()) return;
    setSaving(true);
    const current = user?.whatsapp_family || [];
    await base44.auth.updateMe({ whatsapp_family: [...current, num.trim()] });
    setSaving(false);
    onUpdate?.();
    onClose?.();
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-end justify-center p-4">
      <motion.div
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="bg-card rounded-2xl p-6 w-full max-w-sm space-y-4"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-green-500" />
            <h3 className="font-heading font-bold">Add WhatsApp Number</h3>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose}><X className="w-4 h-4" /></Button>
        </div>
        <p className="text-xs text-muted-foreground">
          When your period starts, we'll send a WhatsApp message to this number. Include country code (e.g. +91 for India).
        </p>
        <Input
          value={num}
          onChange={e => setNum(e.target.value)}
          placeholder="+91 9876543210"
          className="rounded-xl"
        />
        <Button onClick={addNumber} disabled={!num.trim() || saving} className="w-full rounded-xl font-heading font-bold">
          {saving ? 'Saving...' : 'Save Number'}
        </Button>
      </motion.div>
    </div>
  );
}