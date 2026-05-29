import React, { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { Heart, Shield, Bell, BarChart2, Sparkles, Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';

const features = [
{ icon: Heart, label: 'Period Tracking', desc: 'Track your cycle with ease and accuracy' },
{ icon: BarChart2, label: 'Health Insights', desc: 'Understand your body with AI-powered analysis' },
{ icon: Bell, label: 'Smart Reminders', desc: 'Never miss important health milestones' },
{ icon: Shield, label: 'Private & Secure', desc: 'Your data stays yours — fully encrypted' },
{ icon: Sparkles, label: 'AI Reports', desc: 'Generate doctor-ready health reports instantly' },
{ icon: Lock, label: 'Google Login', desc: 'Sign in securely with your Google account' }];


export default function Landing() {
  const navigate = useNavigate();

  useEffect(() => {
    base44.auth.isAuthenticated().then((authed) => {
      if (authed) navigate('/home');
    });
  }, []);

  const handleLogin = () => {
    base44.auth.redirectToLogin('/home');
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Hero */}
      <div className="flex flex-col items-center justify-center px-6 pt-16 pb-10 text-center">
        <div className="text-6xl mb-4">🌸</div>
        <h1 className="font-heading text-4xl font-bold text-foreground mb-2">FlowCare</h1>
        <p className="text-muted-foreground text-base max-w-xs mb-8">
          Your personal menstrual health companion — track, understand, and care for your cycle.
        </p>
        <Button onClick={handleLogin} className="rounded-xl font-heading font-bold px-10 py-6 text-base">
          Get Started with Google
        </Button>
      </div>

      {/* Features */}
      <div className="px-6 pb-10">
        <div className="grid grid-cols-2 gap-3">
          {features.map(({ icon: Icon, label, desc }) =>
          <div key={label} className="bg-card border border-border/50 rounded-2xl p-4">
              <Icon className="w-5 h-5 text-primary mb-2" />
              <p className="font-heading font-bold text-sm">{label}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{desc}</p>
            </div>
          )}
        </div>
      </div>

      {/* Footer with Privacy Policy - visible to Google */}
      <div className="mt-auto border-t border-border/30 py-6 text-center px-6">
        <p className="text-xs text-muted-foreground mb-3">FlowCare is designed for School and Collgirls aged 13–23 to safely track menstrual health.

        </p>
        <div className="flex items-center justify-center gap-4 text-xs flex-wrap">
          <Link to="/privacy" className="text-primary hover:underline font-semibold">Privacy Policy</Link>
          <span className="text-border">•</span>
          <Link to="/terms" className="text-primary hover:underline font-semibold">Terms of Service</Link>
          <span className="text-border">•</span>
          <Link to="/refund" className="text-primary hover:underline font-semibold">Refund Policy</Link>
          <span className="text-border">•</span>
          <Link to="/support" className="text-primary hover:underline font-semibold">Support</Link>
        </div>
        <p className="text-xs text-muted-foreground mt-3">© 2026 FlowCare. All rights reserved.</p>
      </div>
    </div>);

}