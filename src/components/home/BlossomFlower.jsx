import React from 'react';
import { motion } from 'framer-motion';

const PETALS = [0, 45, 90, 135, 180, 225, 270, 315];

export default function BlossomFlower({ size = 40 }) {
  const petalW = size * 0.32;
  const petalH = size * 0.52;
  const center = size / 2;

  return (
    <div style={{ width: size, height: size, position: 'relative' }}>
      {/* Outer glow pulse */}
      <motion.div
        style={{
          position: 'absolute',
          inset: -size * 0.2,
          borderRadius: '50%',
          background: 'radial-gradient(circle, hsl(346,100%,76%,0.25) 0%, transparent 70%)',
        }}
        animate={{ scale: [1, 1.4, 1], opacity: [0.5, 0.9, 0.5] }}
        transition={{ duration: 2.8, repeat: Infinity, ease: 'easeInOut' }}
      />

      {/* Rotating petal group */}
      <motion.div
        style={{ width: size, height: size, position: 'relative' }}
        animate={{ rotate: 360 }}
        transition={{ duration: 10, repeat: Infinity, ease: 'linear' }}
      >
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} overflow="visible">
          <defs>
            <radialGradient id="petalGrad" cx="50%" cy="30%" r="60%">
              <stop offset="0%" stopColor="hsl(346,100%,88%)" />
              <stop offset="100%" stopColor="hsl(346,100%,68%)" />
            </radialGradient>
            <radialGradient id="innerGrad" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="hsl(36,100%,85%)" />
              <stop offset="100%" stopColor="hsl(30,90%,68%)" />
            </radialGradient>
          </defs>

          {PETALS.map((angle, i) => (
            <motion.ellipse
              key={angle}
              cx={center}
              cy={center - size * 0.28}
              rx={petalW / 2}
              ry={petalH / 2}
              fill="url(#petalGrad)"
              opacity={0.88}
              style={{ transformOrigin: `${center}px ${center}px` }}
              transform={`rotate(${angle} ${center} ${center})`}
              animate={{ scaleY: [1, 1.12, 0.95, 1], opacity: [0.82, 1, 0.82] }}
              transition={{
                duration: 2.5,
                repeat: Infinity,
                ease: 'easeInOut',
                delay: i * 0.18,
              }}
            />
          ))}

          {/* Center circle */}
          <motion.circle
            cx={center}
            cy={center}
            r={size * 0.14}
            fill="url(#innerGrad)"
            animate={{ r: [size * 0.14, size * 0.17, size * 0.14] }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
          />

          {/* Tiny center dot */}
          <circle cx={center} cy={center} r={size * 0.055} fill="hsl(346,100%,92%)" opacity={0.9} />
        </svg>
      </motion.div>

      {/* Sparkle dots orbiting */}
      {[0, 120, 240].map((deg, i) => (
        <motion.div
          key={deg}
          style={{
            position: 'absolute',
            width: size * 0.09,
            height: size * 0.09,
            borderRadius: '50%',
            background: 'hsl(346,100%,80%)',
            top: '50%',
            left: '50%',
            marginTop: -(size * 0.045),
            marginLeft: -(size * 0.045),
          }}
          animate={{
            x: [
              Math.cos((deg * Math.PI) / 180) * size * 0.58,
              Math.cos(((deg + 360) * Math.PI) / 180) * size * 0.58,
            ],
            y: [
              Math.sin((deg * Math.PI) / 180) * size * 0.58,
              Math.sin(((deg + 360) * Math.PI) / 180) * size * 0.58,
            ],
            opacity: [0.3, 0.9, 0.3],
            scale: [0.6, 1.2, 0.6],
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: 'linear',
            delay: i * 1.33,
          }}
        />
      ))}
    </div>
  );
}