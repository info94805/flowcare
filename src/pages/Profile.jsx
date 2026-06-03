import React, { useState, useEffect, useRef } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { motion } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Calendar, LogOut, Save, Camera, Crown, Settings, Trash2 } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { getAverageCycleLength } from '@/lib/cycleUtils';
import { Link } from 'react-router-dom';

export default function Profile() {
  const queryClient = useQueryClient();
  const [user, setUser] = useState(null);
  const [cycleLength, setCycleLength] = useState(28);
  const [periodLength, setPeriodLength] = useState(5);
  const [saving, setSaving] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const fileRef = useRef();

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

  const handleAvatarUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingAvatar(true);
    const { file_url } = await base44.integrations.Core.UploadFile({ file });
    await base44.auth.updateMe({ avatar_url: file_url });
    setUser(prev => ({ ...prev, avatar_url: file_url }));
    setUploadingAvatar(false);
  };

  const handleSaveSettings = async () => {
    setSaving(true);
    await base44.auth.updateMe({ cycle_length: cycleLength, period_length: periodLength });
    setSaving(false);
  };

  const handleLogout = () => base44.auth.logout('/');

  const handleDeleteAccount = async () => {
    await base44.entities.CycleLog.list('-start_date', 100).then(logs =>
      Promise.all(logs.map(l => base44.entities.CycleLog.delete(l.id)))
    );
    await base44.entities.DailyLog.list('-date', 500).then(logs =>
      Promise.all(logs.map(l => base44.entities.DailyLog.delete(l.id)))
    );
    base44.auth.logout('/');
  };

  const isPremium = user?.subscription_status === 'active';

  return (
    <div className="px-5 pt-6 space-y-5 pb-8">
      {/* Avatar + Name */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-4">
        <div className="relative">
          <div className="w-16 h-16 rounded-2xl overflow-hidden bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
            {user?.avatar_url ? (
              <img src={user.avatar_url} alt="avatar" className="w-full h-full object-cover" />
            ) : (
              <span className="text-2xl">🌸</span>
            )}
          </div>
          <button
            onClick={() => fileRef.current?.click()}
            className="absolute -bottom-1 -right-1 w-6 h-6 bg-primary rounded-full flex items-center justify-center shadow"
          >
            {uploadingAvatar ? <span className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <Camera className="w-3 h-3 text-white" />}
          </button>
          <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarUpload} />
        </div>
        <div>
          <h1 className="font-heading text-xl font-bold">{user?.full_name || 'User'}</h1>
          <p className="text-sm text-muted-foreground">{user?.email}</p>
          {isPremium && (
            <div className="flex items-center gap-1 mt-0.5">
              <Crown className="w-3 h-3 text-amber-500" />
              <span className="text-xs font-bold text-amber-600">Premium</span>
            </div>
          )}
        </div>
      </motion.div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        <Card className="p-3 text-center">
          <p className="text-2xl font-heading font-bold text-primary">{cycleLogs.length}</p>
          <p className="text-xs text-muted-foreground">Cycles</p>
        </Card>
        <Card className="p-3 text-center">
          <p className="text-2xl font-heading font-bold text-accent">{dailyLogs.length}</p>
          <p className="text-xs text-muted-foreground">Daily Logs</p>
        </Card>
        <Card className="p-3 text-center">
          <p className="text-2xl font-heading font-bold text-green-600">{avgCycleLength}</p>
          <p className="text-xs text-muted-foreground">Avg Cycle</p>
        </Card>
      </div>

      {/* Premium CTA */}
      {!isPremium && (
        <Link to="/subscribe">
          <Card className="p-4 bg-gradient-to-r from-primary/10 to-accent/10 border-primary/30 cursor-pointer hover:shadow-md transition-shadow">
            <div className="flex items-center gap-3">
              <Crown className="w-5 h-5 text-primary" />
              <div>
                <p className="font-heading font-bold text-sm">Upgrade to Premium</p>
                <p className="text-xs text-muted-foreground">₹399 / $7 — Lifetime access</p>
              </div>
            </div>
          </Card>
        </Link>
      )}

      {/* Cycle Settings */}
      <Card className="p-5 space-y-4">
        <h3 className="font-heading font-bold flex items-center gap-2">
          <Calendar className="w-4 h-4 text-primary" /> Cycle Settings
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
        <Button onClick={handleSaveSettings} disabled={saving} className="w-full rounded-xl font-heading font-bold">
          <Save className="w-4 h-4 mr-2" />{saving ? 'Saving...' : 'Save Settings'}
        </Button>
      </Card>

      {/* Log Period */}
      <Card className="p-5 space-y-3">
        <h3 className="font-heading font-bold">🌺 Log New Period</h3>
        <LogPeriodForm onLogged={() => queryClient.invalidateQueries({ queryKey: ['cycleLogs'] })} user={user} />
      </Card>

      <Separator />

      <Link to="/settings">
        <Button variant="outline" className="w-full rounded-xl font-heading font-bold mb-3">
          <Settings className="w-4 h-4 mr-2" /> Settings & More
        </Button>
      </Link>

      <Button variant="outline" onClick={handleLogout} className="w-full rounded-xl font-heading font-bold text-destructive border-destructive/30">
        <LogOut className="w-4 h-4 mr-2" /> Sign Out
      </Button>

      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button variant="ghost" className="w-full rounded-xl font-heading font-bold text-destructive/60 hover:text-destructive hover:bg-destructive/5 text-sm">
            <Trash2 className="w-4 h-4 mr-2" /> Delete Account Permanently
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Account?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete all your cycle logs, daily logs, and account data. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteAccount} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Yes, Delete Everything
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

function LogPeriodForm({ onLogged, user }) {
  const [startDate, setStartDate] = useState('');
  const [saving, setSaving] = useState(false);
  const [whatsappSent, setWhatsappSent] = useState(false);

  const handleLog = async () => {
    if (!startDate) return;
    setSaving(true);
    await base44.entities.CycleLog.create({ start_date: startDate });

    // Send WhatsApp alert to parent/family contacts if configured
    const numbers = user?.whatsapp_family || [];
    if (numbers.length > 0) {
      try {
        const res = await base44.functions.invoke('sendWhatsAppAlert', { numbers });
        const links = res.data?.links || [];
        if (links.length > 0) {
          // Open a WhatsApp message for every configured contact, not just the first.
          links.forEach(({ link }) => window.open(link, '_blank'));
          setWhatsappSent(true);
          setTimeout(() => setWhatsappSent(false), 4000);
        }
      } catch (e) {
        // WhatsApp alert optional, don't block logging
      }
    }

    onLogged?.();
    setStartDate('');
    setSaving(false);
  };

  return (
    <div className="space-y-2">
      <div className="flex gap-2">
        <Input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} className="rounded-xl flex-1" max={new Date().toISOString().split('T')[0]} />
        <Button onClick={handleLog} disabled={!startDate || saving} className="rounded-xl font-heading font-bold">{saving ? '...' : 'Log'}</Button>
      </div>
      {whatsappSent && (
        <p className="text-xs text-green-600 font-semibold flex items-center gap-1">
          📱 WhatsApp alert sent to your parent/family!
        </p>
      )}
      {(user?.whatsapp_family || []).length === 0 && (
        <p className="text-xs text-muted-foreground">
          💡 Add a parent contact in <Link to="/settings" className="text-primary underline">Settings</Link> to auto-alert on period start.
        </p>
      )}
    </div>
  );
}