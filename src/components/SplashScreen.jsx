import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const features = [
  { emoji: '📅', title: 'Cycle Tracking', desc: 'Predict & log your periods with ease' },
  { emoji: '✨', title: 'Jia AI', desc: 'Your personal health companion' },
  { emoji: '📊', title: 'Insights', desc: 'Understand your health patterns' },
  { emoji: '🔔', title: 'Reminders', desc: 'Never miss a thing' },
];

export default function SplashScreen({ onDone }) {
  const [phase, setPhase] = useState('logo'); // logo → features → bye

  useEffect(() => {
    const t1 = setTimeout(() => setPhase('features'), 1600);
    const t2 = setTimeout(() => setPhase('bye'), 4200);
    const t3 = setTimeout(() => onDone(), 5000);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
  }, []);

  return (
    <motion.div
      className="fixed inset-0 z-50 flex flex-col items-center justify-center overflow-hidden"
      style={{ background: 'linear-gradient(135deg, hsl(346, 100%, 76%) 0%, hsl(280, 40%, 74%) 50%, hsl(346, 100%, 76%) 100%)' }}
      exit={{ opacity: 0, scale: 1.05 }}
      transition={{ duration: 0.5 }}
    >
      {/* Decorative blobs */}
      <div className="absolute top-[-80px] right-[-80px] w-80 h-80 rounded-full opacity-20"
        style={{ background: 'radial-gradient(circle, hsl(346, 100%, 76%), transparent)' }} />
      <div className="absolute bottom-[-60px] left-[-60px] w-64 h-64 rounded-full opacity-15"
        style={{ background: 'radial-gradient(circle, hsl(280, 40%, 74%), transparent)' }} />

      <AnimatePresence mode="wait">

        {/* LOGO PHASE */}
        {phase === 'logo' && (
          <motion.div
            key="logo"
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ type: 'spring', stiffness: 200, damping: 18 }}
            className="flex flex-col items-center gap-5"
          >
            <motion.div
              animate={{ rotate: [0, -8, 8, -4, 4, 0] }}
              transition={{ delay: 0.4, duration: 0.8 }}
              className="w-32 h-32 rounded-[36px] flex items-center justify-center shadow-2xl"
              style={{ background: 'linear-gradient(135deg, hsl(346, 100%, 76%), hsl(280, 40%, 74%))', boxShadow: '0 20px 40px rgba(255,133,162,0.3)' }}
            >
              <span className="text-7xl">🌸</span>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="text-center"
            >
              <h1 className="font-heading text-5xl font-black text-white drop-shadow-lg tracking-tight" style={{ textShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
                FlowCare
              </h1>
              <p className="text-white/90 text-lg mt-2 font-body font-semibold" style={{ textShadow: '0 2px 4px rgba(0,0,0,0.08)' }}>Your health, beautifully tracked 💕</p>
            </motion.div>
          </motion.div>
        )}

        {/* FEATURES PHASE */}
        {phase === 'features' && (
          <motion.div
            key="features"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.4 }}
            className="flex flex-col items-center gap-5 px-8 w-full max-w-xs"
          >
            <h2 className="font-heading text-3xl font-black text-white text-center drop-shadow-lg" style={{ textShadow: '0 4px 12px rgba(0,0,0,0.12)' }}>
              Everything you need 🌺
            </h2>
            <div className="grid grid-cols-2 gap-4 w-full">
              {features.map((f, i) => (
                <motion.div
                  key={f.title}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className="rounded-3xl p-5 flex flex-col items-center text-center gap-2"
                  style={{ background: 'rgba(255,255,255,0.25)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.3)' }}
                >
                  <span className="text-3xl">{f.emoji}</span>
                  <p className="font-heading font-bold text-white text-sm leading-tight">{f.title}</p>
                  <p className="text-white/85 text-xs leading-snug font-body">{f.desc}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {/* BYE PHASE */}
        {phase === 'bye' && (
          <motion.div
            key="bye"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="flex flex-col items-center gap-3"
          >
            <motion.span
              animate={{ scale: [1, 1.3, 1] }}
              transition={{ repeat: Infinity, duration: 0.8 }}
              className="text-6xl"
            >
              💕
            </motion.span>
            <p className="font-heading text-white text-3xl font-black drop-shadow-lg" style={{ textShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>Let's get started!</p>
          </motion.div>
        )}

      </AnimatePresence>

      {/* Loading dots */}
      {phase !== 'bye' && (
        <div className="absolute bottom-16 flex gap-2">
          {[0, 1, 2].map(i => (
            <motion.div
              key={i}
              className="w-2.5 h-2.5 rounded-full bg-white/70"
              animate={{ opacity: [0.4, 1, 0.4] }}
              transition={{ repeat: Infinity, duration: 1, delay: i * 0.25 }}
            />
          ))}
        </div>
      )}
    </motion.div>
  );
}