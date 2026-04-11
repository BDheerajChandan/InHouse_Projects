/* src/components/AnimatedFlowers.jsx */
import { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import './AnimatedFlowers.css';

const PETALS_MARRIAGE = ['🌸', '🌹', '🌺', '✿', '❀', '🌷'];
const PETALS_ENGAGEMENT = ['💜', '⭐', '✨', '💫', '🔮', '💎'];

const FloatingPetal = ({ emoji, delay, x, duration, size }) => (
  <motion.div
    className="floating-petal"
    style={{ left: `${x}%`, fontSize: `${size}px` }}
    initial={{ y: -60, opacity: 0, rotate: 0 }}
    animate={{
      y: '110vh',
      opacity: [0, 0.8, 0.8, 0],
      rotate: [0, 180, 360],
      x: [0, 30, -20, 10],
    }}
    transition={{
      duration,
      delay,
      repeat: Infinity,
      ease: 'linear',
    }}
  >
    {emoji}
  </motion.div>
);

const AnimatedFlowers = ({ type = 'Marriage', count = 18 }) => {
  const petals = type === 'Marriage' ? PETALS_MARRIAGE : PETALS_ENGAGEMENT;

  const items = Array.from({ length: count }, (_, i) => ({
    id: i,
    emoji: petals[i % petals.length],
    delay: (i * 0.9) % 12,
    x: Math.random() * 100,
    duration: 8 + Math.random() * 8,
    size: 12 + Math.random() * 14,
  }));

  return (
    <div className="flowers-layer" aria-hidden="true">
      {items.map((p) => (
        <FloatingPetal key={p.id} {...p} />
      ))}
    </div>
  );
};

export default AnimatedFlowers;