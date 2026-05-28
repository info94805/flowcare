import React, { useEffect } from 'react';
import { motion } from 'framer-motion';

export default function SplashScreen({ onDone }) {
  useEffect(() => {
    const t = setTimeout(() => onDone(), 3200);
    return () => clearTimeout(t);
  }, []);

  return (
    <motion.div
      className="fixed inset-0 z-50 flex flex-col items-center justify-center overflow-hidden"
      style={{ background: 'linear-gradient(160deg, hsl(340, 100%, 98%) 0%, hsl(320, 60%, 94%) 50%, hsl(280, 40%, 93%) 100%)' }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.6 }}
    >
      {/* Soft decorative blobs */}
      <div className="absolute top-[-100px] right-[-100px] w-96 h-96 rounded-full"
        style={{ background: 'radial-gradient(circle, hsl(346, 100%, 88%), transparent)', opacity: 0.5 }} />
      <div className="absolute bottom-[-80px] left-[-80px] w-80 h-80 rounded-full"
        style={{ background: 'radial-gradient(circle, hsl(280, 40%, 85%), transparent)', opacity: 0.4 }} />
      <div className="absolute top-1/3 left-[-60px] w-52 h-52 rounded-full"
        style={{ background: 'radial-gradient(circle, hsl(346, 100%, 90%), transparent)', opacity: 0.3 }} />

      {/* Main content */}
      <div className="flex flex-col items-center gap-6 px-8 relative z-10">

        {/* Logo */}
        <motion.div
          initial={{ opacity: 0, scale: 0.6, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ type: 'spring', stiffness: 180, damping: 16, duration: 0.8 }}
        >
          <div className="text-8xl drop-shadow-xl">🌸</div>
        </motion.div>

        {/* App name */}
        <motion.div
          className="text-center flex flex-col items-center gap-2"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.6 }}
        >
          <h1
            className="font-heading font-black tracking-tight"
            style={{
              fontSize: '2.8rem',
              background: 'linear-gradient(135deg, hsl(346, 80%, 60%), hsl(280, 50%, 60%))',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              lineHeight: 1.1,
            }}
          >
            FlowCare
          </h1>
          <motion.p
            className="font-body font-semibold text-center"
            style={{
              fontSize: '1rem',
              color: 'hsl(300, 20%, 45%)',
              letterSpacing: '0.01em',
              lineHeight: 1.4,
            }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.9, duration: 0.5 }}
          >
            A premium period &amp; wellness companion
          </motion.p>
        </motion.div>

        {/* Loading dots */}
        <motion.div
          className="flex gap-2 mt-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2 }}
        >
          {[0, 1, 2].map(i => (
            <motion.div
              key={i}
              className="w-2 h-2 rounded-full"
              style={{ background: 'hsl(346, 80%, 70%)' }}
              animate={{ opacity: [0.3, 1, 0.3], scale: [0.8, 1.2, 0.8] }}
              transition={{ repeat: Infinity, duration: 1.2, delay: i * 0.2 }}
            />
          ))}
        </motion.div>
      </div>
    </motion.div>
  );
}