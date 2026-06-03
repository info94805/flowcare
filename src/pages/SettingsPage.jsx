import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { base44 } from '@/api/base44Client';
import { useTheme } from '@/lib/ThemeContext';
import {
  Moon, Sun, GraduationCap, School, CalendarDays, MessageSquare,
  Phone, Plus, Trash2, Shield, FileText, HelpCircle, RefreshCw,
  ChevronRight, Crown, Bell, ArrowLeft
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import WhatsAppModal from '@/components/settings/WhatsAppModal';

export default function SettingsPage() {
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();
  const [user, setUser] = useState(null);
  const [appMode, setAppMode] = useState('daily');
  const [showWhatsApp, setShowWhatsApp] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    base44.auth.me().then(u => {
      setUser(u);
      if (u?.app_mode) setAppMode(u.app_mode);
    });
  }, []);

  const saveMode = async (mode) => {
    setAppMode(mode);
    await base44.auth.updateMe({ app_mode: mode });
  };

  const isPremium = user?.subscription_status === 'active';

  const modes = [
    { id: 'school', label: 'School Mode', icon: School, desc: 'Simplified tracking for school students', emoji: '🎒' },
    { id: 'college', label: 'College Mode', icon: GraduationCap, desc: 'Full features for college students', emoji: '🎓' },
    { id: 'daily', label: 'Daily Mode', icon: CalendarDays, desc: 'Complete daily cycle management', emoji: '📅' },
  ];

  return (
    <div className="px-5 pt-6 pb-10 space-y-5">
      <div className="flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="w-9 h-9 rounded-full flex items-center justify-center bg-secondary/60 hover:bg-secondary transition-colors">
          <ArrowLeft className="w-5 h-5 text-foreground" />
        </button>
        <h1 className="font-heading text-2xl font-bold">Settings</h1>
      </div>

      {/* Subscription Banner */}
      {!isPremium && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <Card className="p-5 bg-gradient-to-br from-primary/10 via-accent/10 to-primary/5 border-primary/30">
            <div className="flex items-start gap-3">
              <Crown className="w-6 h-6 text-primary mt-0.5" />
              <div className="flex-1">
                <p className="font-heading font-bold">Upgrade to FlowCare Premium</p>
                <p className="text-xs text-muted-foreground mt-0.5 mb-3">
                  AI reports, WhatsApp alerts, all insights & reminders
                </p>
                <div className="flex gap-2">
                  <Link to="/subscribe">
                    <Button size="sm" className="rounded-xl font-heading font-bold">
                      ₹399 / $7 — Upgrade Now
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </Card>
        </motion.div>
      )}
      {isPremium && (
        <Card className="p-4 bg-gradient-to-r from-amber-500/10 to-yellow-500/10 border-amber-400/30">
          <div className="flex items-center gap-2">
            <Crown className="w-5 h-5 text-amber-500" />
            <p className="font-heading font-bold text-amber-500">FlowCare Premium Active 🎉</p>
          </div>
        </Card>
      )}

      {/* Appearance */}
      <Card className="p-5 space-y-4">
        <h3 className="font-heading font-bold">Appearance</h3>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {theme === 'dark' ? <Moon className="w-5 h-5 text-accent" /> : <Sun className="w-5 h-5 text-amber-400" />}
            <div>
              <p className="font-medium text-sm">{theme === 'dark' ? 'Dark Mode' : 'Light Mode'}</p>
              <p className="text-xs text-muted-foreground">Toggle app theme</p>
            </div>
          </div>
          <Switch checked={theme === 'dark'} onCheckedChange={toggleTheme} />
        </div>
      </Card>

      {/* App Mode */}
      <Card className="p-5 space-y-3">
        <h3 className="font-heading font-bold">App Mode</h3>
        <div className="space-y-2">
          {modes.map(m => (
            <button
              key={m.id}
              onClick={() => saveMode(m.id)}
              className={`w-full flex items-center gap-3 p-3 rounded-xl border transition-all ${
                appMode === m.id ? 'border-primary bg-primary/5' : 'border-border bg-secondary/30 hover:bg-secondary/60'
              }`}
            >
              <span className="text-2xl">{m.emoji}</span>
              <div className="flex-1 text-left">
                <p className="font-heading font-semibold text-sm">{m.label}</p>
                <p className="text-xs text-muted-foreground">{m.desc}</p>
              </div>
              {appMode === m.id && <Badge className="text-xs rounded-full bg-primary">Active</Badge>}
            </button>
          ))}
        </div>
      </Card>

      {/* WhatsApp Family Alerts */}
      <Card className="p-5 space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="font-heading font-bold flex items-center gap-2">
            <MessageSquare className="w-4 h-4 text-green-500" /> Parent / Family WhatsApp Alert
          </h3>
          <Button size="sm" variant="outline" className="rounded-xl text-xs" onClick={() => setShowWhatsApp(true)}>
            <Plus className="w-3 h-3 mr-1" /> Add
          </Button>
        </div>
        <p className="text-xs text-muted-foreground">When you log your period, a WhatsApp message will be opened to notify your parent/guardian automatically.</p>
        <WhatsAppNumbers user={user} onUpdate={() => base44.auth.me().then(setUser)} />
      </Card>

      {/* Reminders */}
      <Card className="p-5">
        <Link to="/reminders" className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Bell className="w-5 h-5 text-primary" />
            <div>
              <p className="font-heading font-semibold text-sm">Reminders & Notifications</p>
              <p className="text-xs text-muted-foreground">Manage period, pad & wellness alerts</p>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-muted-foreground" />
        </Link>
      </Card>

      <Separator />

      {/* Legal links */}
      <div className="space-y-1">
        {[
          { label: 'Privacy Policy', path: '/privacy', icon: Shield },
          { label: 'Terms & Conditions', path: '/terms', icon: FileText },
          { label: 'Legal & Disclaimer', path: '/legal', icon: FileText },
          { label: 'Refund Policy', path: '/refund', icon: RefreshCw },
          { label: 'Contact Support', path: '/support', icon: HelpCircle },
        ].map(({ label, path, icon: Icon }) => (
          <Link key={path} to={path}>
            <div className="flex items-center justify-between p-3 rounded-xl hover:bg-secondary/50 transition-colors">
              <div className="flex items-center gap-3">
                <Icon className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm font-medium">{label}</span>
              </div>
              <ChevronRight className="w-4 h-4 text-muted-foreground" />
            </div>
          </Link>
        ))}
      </div>

      {showWhatsApp && (
        <WhatsAppModal user={user} onClose={() => setShowWhatsApp(false)} onUpdate={() => base44.auth.me().then(setUser)} />
      )}
    </div>
  );
}

function WhatsAppNumbers({ user, onUpdate }) {
  const numbers = user?.whatsapp_family || [];
  const [adding, setAdding] = useState(false);
  const [num, setNum] = useState('');

  const addNumber = async () => {
    if (!num.trim()) return;
    let n = num.trim();
    if (!n.startsWith('+') && n.length === 10) n = '+91' + n;
    const updated = [...numbers, n];
    await base44.auth.updateMe({ whatsapp_family: updated });
    setNum('');
    setAdding(false);
    onUpdate?.();
  };

  const removeNumber = async (n) => {
    await base44.auth.updateMe({ whatsapp_family: numbers.filter(x => x !== n) });
    onUpdate?.();
  };

  if (numbers.length === 0 && !adding) {
    return (
      <div className="text-center py-2">
        <p className="text-xs text-muted-foreground mb-2">No family numbers added yet</p>
        <Button size="sm" variant="outline" className="rounded-xl text-xs" onClick={() => setAdding(true)}>
          <Plus className="w-3 h-3 mr-1" /> Add WhatsApp Number
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {numbers.map(n => (
        <div key={n} className="flex items-center gap-2 p-2 bg-green-500/10 rounded-xl border border-green-500/30">
          <Phone className="w-3.5 h-3.5 text-green-600" />
          <span className="text-sm flex-1">{n}</span>
          <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive/60" onClick={() => removeNumber(n)}>
            <Trash2 className="w-3 h-3" />
          </Button>
        </div>
      ))}
      {adding && (
        <div className="flex gap-2">
          <Input value={num} onChange={e => setNum(e.target.value)} placeholder="+91 9876543210" className="rounded-xl text-sm h-9" />
          <Button size="sm" className="rounded-xl" onClick={addNumber}>Add</Button>
        </div>
      )}
    </div>
  );
}