import React, { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { Heart, Shield, Bell, BarChart2, Sparkles, Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import BlossomFlower from '@/components/BlossomFlower';

const features = [
  { icon: Heart, label: 'Period Tracking', desc: 'Track your cycle with ease' },
  { icon: BarChart2, label: 'Health Insights', desc: 'AI-powered analysis' },
  { icon: Bell, label: 'Smart Reminders', desc: 'Never miss milestones' },
  { icon: Shield, label: 'Private & Secure', desc: 'Your data, fully encrypted' },
  { icon: Sparkles, label: 'AI Reports', desc: 'Doctor-ready reports' },
  { icon: Lock, label: 'Secure Login', desc: 'Sign in safely' },
];

export default function Landing() {
  const navigate = useNavigate();

  useEffect(() => {
    base44.auth.isAuthenticated().then(authed => {
      if (authed) navigate('/home');
    });
  }, []);

  const handleLogin = () => {
    base44.auth.redirectToLogin('/home');
  };

  return (
    <div className="h-screen bg-background flex flex-col overflow-hidden">
      {/* Hero */}
      <div className="flex flex-col items-center justify-center px-6 pt-8 pb-4 text-center">
        <div className="mb-3 flex items-center justify-center">
          <BlossomFlower size={110} />
        </div>
        <h1 className="font-heading text-3xl font-bold text-foreground mb-1">FlowCare</h1>
        <p className="text-muted-foreground text-sm max-w-xs mb-5">
          Your personal menstrual health companion — track, understand, and care for your cycle.
        </p>
        <Button onClick={handleLogin} className="rounded-xl font-heading font-bold px-10 py-5 text-base">
          Get Started
        </Button>
      </div>

      {/* Features */}
      <div className="px-6 flex-1">
        <div className="grid grid-cols-3 gap-2 h-full max-h-48">
          {features.map(({ icon: Icon, label, desc }) => (
            <div key={label} className="bg-card border border-border/50 rounded-2xl p-3">
              <Icon className="w-4 h-4 text-primary mb-1" />
              <p className="font-heading font-bold text-xs">{label}</p>
              <p className="text-[10px] text-muted-foreground mt-0.5 leading-tight">{desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div className="border-t border-border/30 py-3 text-center px-6">
        <div className="flex items-center justify-center gap-3 text-[10px] flex-wrap mb-1">
          <Link to="/privacy" className="text-primary hover:underline font-semibold">Privacy Policy</Link>
          <span className="text-border">•</span>
          <Link to="/terms" className="text-primary hover:underline font-semibold">Terms of Service</Link>
          <span className="text-border">•</span>
          <Link to="/refund" className="text-primary hover:underline font-semibold">Refund Policy</Link>
          <span className="text-border">•</span>
          <Link to="/support" className="text-primary hover:underline font-semibold">Support</Link>
        </div>
        <p className="text-[10px] text-muted-foreground">© 2026 FlowCare. All rights reserved.</p>
      </div>
    </div>
  );
}