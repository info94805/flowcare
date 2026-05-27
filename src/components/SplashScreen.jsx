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
      style={{ background: 'linear-gradient(160deg, #FFB6C8 0%, #E8D5F5 50%, #FFC9D8 100%)' }}
      exit={{ opacity: 0, scale: 1.05 }}
      transition={{ duration: 0.5 }}
    >
      {/* Decorative blobs */}
      <div className="absolute top-[-60px] right-[-60px] w-52 h-52 rounded-full opacity-30"
        style={{ background: 'radial-gradient(circle, #FF85A2, transparent)' }} />
      <div className="absolute bottom-[-40px] left-[-40px] w-40 h-40 rounded-full opacity-25"
        style={{ background: 'radial-gradient(circle, #C9A0DC, transparent)' }} />

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
              className="w-28 h-28 rounded-[32px] flex items-center justify-center shadow-2xl"
              style={{ background: 'linear-gradient(135deg, #FF85A2, #C9A0DC)' }}
            >
              <span className="text-6xl">🌸</span>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="text-center"
            >
              <h1 className="font-heading text-4xl font-extrabold text-white drop-shadow-sm tracking-tight">
                FlowCare
              </h1>
              <p className="text-white/80 text-base mt-1 font-body">Your health, beautifully tracked 💕</p>
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
            <h2 className="font-heading text-xl font-bold text-white text-center drop-shadow-sm">
              Everything you need 🌺
            </h2>
            <div className="grid grid-cols-2 gap-3 w-full">
              {features.map((f, i) => (
                <motion.div
                  key={f.title}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className="rounded-2xl p-4 flex flex-col items-center text-center gap-1"
                  style={{ background: 'rgba(255,255,255,0.35)', backdropFilter: 'blur(10px)' }}
                >
                  <span className="text-2xl">{f.emoji}</span>
                  <p className="font-heading font-bold text-white text-xs leading-tight">{f.title}</p>
                  <p className="text-white/75 text-[11px] leading-tight">{f.desc}</p>
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
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ repeat: Infinity, duration: 0.8 }}
              className="text-5xl"
            >
              💕
            </motion.span>
            <p className="font-heading text-white text-xl font-bold drop-shadow-sm">Let's get started!</p>
          </motion.div>
        )}

      </AnimatePresence>

      {/* Loading dots */}
      {phase !== 'bye' && (
        <div className="absolute bottom-16 flex gap-2">
          {[0, 1, 2].map(i => (
            <motion.div
              key={i}
              className="w-2 h-2 rounded-full bg-white/60"
              animate={{ opacity: [0.3, 1, 0.3] }}
              transition={{ repeat: Infinity, duration: 1, delay: i * 0.25 }}
            />
          ))}
        </div>
      )}
    </motion.div>
  );
}