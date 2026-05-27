import React from 'react';
import { motion } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Sparkles } from 'lucide-react';

export default function TipCard({ tip }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.6 }}
    >
      <Card className="p-4 bg-gradient-to-r from-accent/10 to-primary/10 border-accent/20">
        <div className="flex items-start gap-3">
          <div className="p-2 bg-accent/20 rounded-xl">
            <Sparkles className="w-4 h-4 text-accent" />
          </div>
          <div>
            <p className="text-xs font-bold text-accent uppercase tracking-wide mb-1">Tip of the day</p>
            <p className="text-sm text-foreground leading-relaxed">{tip}</p>
          </div>
        </div>
      </Card>
    </motion.div>
  );
}