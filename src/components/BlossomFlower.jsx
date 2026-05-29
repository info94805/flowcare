import React from 'react';
import { motion } from 'framer-motion';

export default function BlossomFlower({ size = 140 }) {
  return (
    <div style={{ width: size, height: size, position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      {/* Glow rings */}
      {[1.8, 1.4, 1.1].map((scale, i) => (
        <motion.div
          key={i}
          style={{
            position: 'absolute',
            width: size,
            height: size,
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(255,133,162,0.22) 0%, transparent 70%)',
            transform: `scale(${scale})`,
          }}
          animate={{ opacity: [0.3, 0.8, 0.3] }}
          transition={{ duration: 2.5 + i * 0.6, repeat: Infinity, ease: 'easeInOut', delay: i * 0.5 }}
        />
      ))}

      {/* Blossom emoji with fade */}
      <motion.span
        style={{
          fontSize: size * 0.75,
          lineHeight: 1,
          display: 'block',
          filter: 'drop-shadow(0 0 14px rgba(255,100,150,0.8)) drop-shadow(0 0 28px rgba(255,133,162,0.5))',
          position: 'relative',
          zIndex: 1,
        }}
        animate={{ opacity: [0.6, 1, 0.6] }}
        transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
      >
        🌸
      </motion.span>

      {/* Sparkle particles */}
      {[...Array(6)].map((_, i) => {
        const angle = (i * 60 * Math.PI) / 180;
        const dist = size * 0.48;
        return (
          <motion.div
            key={`spark-${i}`}
            style={{
              position: 'absolute',
              left: size / 2 + dist * Math.cos(angle) - 3,
              top: size / 2 + dist * Math.sin(angle) - 3,
              width: 6,
              height: 6,
              borderRadius: '50%',
              background: 'rgba(255, 133, 162, 0.9)',
              boxShadow: '0 0 6px 2px rgba(255,133,162,0.7)',
            }}
            animate={{ opacity: [0, 1, 0], scale: [0.5, 1.3, 0.5] }}
            transition={{ duration: 2, repeat: Infinity, delay: i * 0.33, ease: 'easeInOut' }}
          />
        );
      })}
    </div>
  );
}