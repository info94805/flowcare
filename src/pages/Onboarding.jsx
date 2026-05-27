import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { base44 } from '@/api/base44Client';
import { ChevronRight, ChevronLeft, Heart, Camera } from 'lucide-react';

const steps = [
  { id: 'welcome', title: 'Welcome to FlowCare 🌸', subtitle: 'Track your flow. Care for yourself.' },
  { id: 'photo', title: 'Add Your Photo', subtitle: 'A friendly face for your FlowCare profile!' },
  { id: 'cycle', title: 'Your Cycle', subtitle: 'Tell us about your average cycle' },
  { id: 'period', title: 'Last Period', subtitle: 'When did your last period start?' },
];

export default function Onboarding() {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [cycleLength, setCycleLength] = useState(28);
  const [periodLength, setPeriodLength] = useState(5);
  const [lastPeriodDate, setLastPeriodDate] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const fileRef = useRef();

  const handlePhotoUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const { file_url } = await base44.integrations.Core.UploadFile({ file });
    setAvatarUrl(file_url);
    setUploading(false);
  };

  const handleFinish = async () => {
    if (!lastPeriodDate) return;
    setSaving(true);
    await base44.entities.CycleLog.create({ start_date: lastPeriodDate, cycle_length: cycleLength, period_length: periodLength });
    const updateData = { cycle_length: cycleLength, period_length: periodLength, onboarded: true };
    if (avatarUrl) updateData.avatar_url = avatarUrl;
    await base44.auth.updateMe(updateData);
    // Send welcome email (fire and forget — don't block navigation)
    base44.functions.invoke('sendWelcomeEmail', {}).catch(() => {});
    setSaving(false);
    navigate('/');
  };

  const canProceed = step === 3 ? !!lastPeriodDate : true;

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 py-10 bg-background">
      {/* Progress */}
      <div className="flex gap-2 mb-8">
        {steps.map((_, i) => (
          <div key={i} className={`h-2 rounded-full transition-all duration-300 ${i === step ? 'w-8 bg-primary' : i < step ? 'w-2 bg-primary/60' : 'w-2 bg-primary/20'}`} />
        ))}
      </div>

      <AnimatePresence mode="wait">
        <motion.div key={step} initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }} transition={{ duration: 0.3 }} className="w-full max-w-sm">

          {step === 0 && (
            <div className="text-center space-y-6">
              <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', delay: 0.2 }}
                className="w-24 h-24 mx-auto rounded-3xl bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
                <Heart className="w-12 h-12 text-primary" />
              </motion.div>
              <h1 className="font-heading text-2xl font-bold">{steps[0].title}</h1>
              <p className="text-muted-foreground">{steps[0].subtitle}</p>
              <p className="text-sm text-muted-foreground leading-relaxed">
                A safe, friendly space to understand your body and track your cycle with confidence. 💕
              </p>
            </div>
          )}

          {step === 1 && (
            <Card className="p-6 space-y-5 text-center">
              <h2 className="font-heading text-xl font-bold">{steps[1].title}</h2>
              <p className="text-sm text-muted-foreground">{steps[1].subtitle}</p>

              <div className="flex flex-col items-center gap-4">
                <div
                  onClick={() => fileRef.current?.click()}
                  className="w-28 h-28 rounded-3xl border-2 border-dashed border-primary/30 bg-primary/5 flex flex-col items-center justify-center cursor-pointer hover:bg-primary/10 transition-colors overflow-hidden"
                >
                  {avatarUrl ? (
                    <img src={avatarUrl} alt="avatar" className="w-full h-full object-cover" />
                  ) : uploading ? (
                    <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      <Camera className="w-8 h-8 text-primary/50 mb-1" />
                      <span className="text-xs text-muted-foreground">Tap to upload</span>
                    </>
                  )}
                </div>
                <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handlePhotoUpload} />
                {avatarUrl && <p className="text-xs text-green-600 font-semibold">✓ Photo uploaded!</p>}
                <p className="text-xs text-muted-foreground">Optional — you can skip this step</p>
              </div>
            </Card>
          )}

          {step === 2 && (
            <Card className="p-6 space-y-6">
              <div className="text-center">
                <h2 className="font-heading text-xl font-bold">{steps[2].title}</h2>
                <p className="text-sm text-muted-foreground">{steps[2].subtitle}</p>
              </div>
              <div className="space-y-4">
                <div>
                  <Label className="text-sm font-semibold">Average cycle length (days)</Label>
                  <div className="flex items-center gap-4 mt-2">
                    <Button variant="outline" size="icon" className="rounded-xl" onClick={() => setCycleLength(Math.max(21, cycleLength - 1))}>-</Button>
                    <span className="text-3xl font-heading font-bold text-primary w-16 text-center">{cycleLength}</span>
                    <Button variant="outline" size="icon" className="rounded-xl" onClick={() => setCycleLength(Math.min(40, cycleLength + 1))}>+</Button>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1 text-center">Most cycles are 21–35 days</p>
                </div>
                <div>
                  <Label className="text-sm font-semibold">Period duration (days)</Label>
                  <div className="flex items-center gap-4 mt-2">
                    <Button variant="outline" size="icon" className="rounded-xl" onClick={() => setPeriodLength(Math.max(2, periodLength - 1))}>-</Button>
                    <span className="text-3xl font-heading font-bold text-primary w-16 text-center">{periodLength}</span>
                    <Button variant="outline" size="icon" className="rounded-xl" onClick={() => setPeriodLength(Math.min(10, periodLength + 1))}>+</Button>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1 text-center">Usually 3–7 days</p>
                </div>
              </div>
            </Card>
          )}

          {step === 3 && (
            <Card className="p-6 space-y-6">
              <div className="text-center">
                <h2 className="font-heading text-xl font-bold">{steps[3].title}</h2>
                <p className="text-sm text-muted-foreground">{steps[3].subtitle}</p>
              </div>
              <div>
                <Label className="text-sm font-semibold">First day of your last period</Label>
                <Input type="date" value={lastPeriodDate} onChange={e => setLastPeriodDate(e.target.value)} className="mt-2 rounded-xl" max={new Date().toISOString().split('T')[0]} />
                <p className="text-xs text-muted-foreground mt-2">Don't worry if you're not sure — an approximate date works!</p>
              </div>
            </Card>
          )}
        </motion.div>
      </AnimatePresence>

      <div className="flex gap-3 mt-8 w-full max-w-sm">
        {step > 0 && (
          <Button variant="outline" onClick={() => setStep(step - 1)} className="rounded-xl flex-1 font-heading font-bold">
            <ChevronLeft className="w-4 h-4 mr-1" /> Back
          </Button>
        )}
        {step < steps.length - 1 ? (
          <Button onClick={() => setStep(step + 1)} className="rounded-xl flex-1 font-heading font-bold">
            {step === 1 && !avatarUrl ? 'Skip' : 'Next'} <ChevronRight className="w-4 h-4 ml-1" />
          </Button>
        ) : (
          <Button onClick={handleFinish} disabled={!canProceed || saving} className="rounded-xl flex-1 font-heading font-bold">
            {saving ? 'Setting up...' : 'Start Tracking 🌸'}
          </Button>
        )}
      </div>
    </div>
  );
}