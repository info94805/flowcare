import React from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, ArrowRight } from 'lucide-react';

export default function InsightsButton() {
  return (
    <Link to="/jia">
      <div className="flex items-center gap-3 bg-gradient-to-r from-primary to-accent rounded-2xl px-5 py-4 shadow-md active:scale-95 transition-transform">
        <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center flex-shrink-0">
          <Sparkles className="w-5 h-5 text-white" />
        </div>
        <div className="flex-1">
          <p className="font-heading font-bold text-white text-sm">Generate AI Insights</p>
          <p className="text-[11px] text-white/80">Personalised for your cycle</p>
        </div>
        <ArrowRight className="w-5 h-5 text-white" />
      </div>
    </Link>
  );
}