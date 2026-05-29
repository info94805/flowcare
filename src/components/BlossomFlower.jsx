import React from 'react';
import { motion } from 'framer-motion';

export default function BlossomFlower({ size = 140 }) {
  const s = size;
  const cx = s / 2;
  const cy = s / 2;
  const petalR = s * 0.22;
  const petalOffset = s * 0.19;

  // 5 petals positions (angles in degrees: 90, 162, 234, 306, 18 — top first)
  const angles = [90, 162, 234, 306, 18];

  return (
    <div style={{ width: s, height: s, position: 'relative', display: 'inline-block' }}>
      {/* Outer glow rings */}
      {[1.9, 1.5, 1.2].map((scale, i) => (
        <motion.div
          key={i}
          style={{
            position: 'absolute',
            inset: 0,
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(255,133,162,0.18) 0%, transparent 70%)',
            transform: `scale(${scale})`,
          }}
          animate={{ opacity: [0.4, 0.9, 0.4], scale: [scale * 0.95, scale * 1.05, scale * 0.95] }}
          transition={{ duration: 2.5 + i * 0.7, repeat: Infinity, ease: 'easeInOut', delay: i * 0.4 }}
        />
      ))}

      {/* SVG Flower */}
      <motion.svg
        width={s}
        height={s}
        viewBox={`0 0 ${s} ${s}`}
        style={{ position: 'relative', zIndex: 1, filter: 'drop-shadow(0 0 12px rgba(255,100,150,0.7)) drop-shadow(0 0 24px rgba(255,133,162,0.4))' }}
        animate={{ opacity: [0.7, 1, 0.7] }}
        transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
      >
        <defs>
          <radialGradient id="petalGrad" cx="50%" cy="30%" r="70%">
            <stop offset="0%" stopColor="#FFB8D0" />
            <stop offset="60%" stopColor="#FF85A2" />
            <stop offset="100%" stopColor="#E84B7B" />
          </radialGradient>
          <radialGradient id="centerGrad" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#FFFFFF" />
            <stop offset="50%" stopColor="#FFE8F0" />
            <stop offset="100%" stopColor="#FFAEC9" />
          </radialGradient>
          <radialGradient id="innerPetalGrad" cx="50%" cy="30%" r="70%">
            <stop offset="0%" stopColor="#FFD6E8" />
            <stop offset="100%" stopColor="#FF85A2" />
          </radialGradient>
          <filter id="glow">
            <feGaussianBlur stdDeviation="3" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Petals */}
        {angles.map((angle, i) => {
          const rad = (angle * Math.PI) / 180;
          const px = cx + petalOffset * Math.cos(rad);
          const py = cy - petalOffset * Math.sin(rad);
          return (
            <ellipse
              key={i}
              cx={px}
              cy={py}
              rx={petalR}
              ry={petalR * 1.35}
              fill="url(#petalGrad)"
              filter="url(#glow)"
              transform={`rotate(${-(angle - 90)}, ${px}, ${py})`}
              opacity="0.95"
            />
          );
        })}

        {/* Inner accent petals */}
        {angles.map((angle, i) => {
          const rad = (angle * Math.PI) / 180;
          const px = cx + petalOffset * 0.6 * Math.cos(rad);
          const py = cy - petalOffset * 0.6 * Math.sin(rad);
          return (
            <ellipse
              key={`inner-${i}`}
              cx={px}
              cy={py}
              rx={petalR * 0.45}
              ry={petalR * 0.65}
              fill="url(#innerPetalGrad)"
              transform={`rotate(${-(angle - 90)}, ${px}, ${py})`}
              opacity="0.7"
            />
          );
        })}

        {/* Center circle */}
        <circle cx={cx} cy={cy} r={s * 0.11} fill="url(#centerGrad)" filter="url(#glow)" />
        {/* Center dots */}
        {[0, 72, 144, 216, 288].map((a, i) => {
          const rad = (a * Math.PI) / 180;
          return (
            <circle
              key={`dot-${i}`}
              cx={cx + s * 0.065 * Math.cos(rad)}
              cy={cy + s * 0.065 * Math.sin(rad)}
              r={s * 0.018}
              fill="#FFB8D0"
              opacity="0.8"
            />
          );
        })}
        <circle cx={cx} cy={cy} r={s * 0.032} fill="white" opacity="0.9" />
      </motion.svg>

      {/* Sparkle particles */}
      {[...Array(6)].map((_, i) => {
        const angle = (i * 60 * Math.PI) / 180;
        const dist = s * 0.52;
        return (
          <motion.div
            key={`spark-${i}`}
            style={{
              position: 'absolute',
              left: cx + dist * Math.cos(angle) - 3,
              top: cy + dist * Math.sin(angle) - 3,
              width: 6,
              height: 6,
              borderRadius: '50%',
              background: 'rgba(255, 133, 162, 0.9)',
              boxShadow: '0 0 6px 2px rgba(255,133,162,0.7)',
            }}
            animate={{ opacity: [0, 1, 0], scale: [0.5, 1.2, 0.5] }}
            transition={{ duration: 1.8, repeat: Infinity, delay: i * 0.3, ease: 'easeInOut' }}
          />
        );
      })}
    </div>
  );
}