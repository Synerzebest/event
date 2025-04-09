'use client';

import { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaRegHeart, FaHeart } from 'react-icons/fa';

interface Particle {
  id: string;
  x: number;
  y: number;
  size: number;
  color: string;
}

const getRandomParticle = (): Particle => {
  const angle = Math.random() * 2 * Math.PI;
  const distance = 30 + Math.random() * 30;
  const x = Math.cos(angle) * distance;
  const y = Math.sin(angle) * distance;
  const size = 4 + Math.random() * 4;
  const colors = ['#f472b6', '#fb7185', '#facc15', '#4ade80', '#38bdf8', '#c084fc'];
  const color = colors[Math.floor(Math.random() * colors.length)];

  return {
    id: `${Date.now()}-${Math.random()}`,
    x,
    y,
    size,
    color,
  };
};

interface AnimatedLikeButtonProps {
  liked: boolean;
  onToggle: () => void;
}

export default function AnimatedLikeButton({ liked, onToggle }: AnimatedLikeButtonProps) {
  const [particles, setParticles] = useState<Particle[]>([]);
  const [burstId, setBurstId] = useState(0);
  const hasTriggeredOnce = useRef(false);

  useEffect(() => {
    if (liked) {
      if (hasTriggeredOnce.current) {
        const newParticles = Array.from({ length: 14 }, getRandomParticle);
        setParticles(newParticles);
        setBurstId((prev) => prev + 1);
        setTimeout(() => setParticles([]), 600);
      } else {
        hasTriggeredOnce.current = true;
      }
    }
  }, [liked]);

  return (
    <motion.button
      onClick={onToggle}
      className="relative w-16 h-16 flex items-center justify-center"
      whileTap={{ scale: 0.9 }}
      transition={{ type: 'spring', stiffness: 400, damping: 12 }}
    >
      <motion.div
        key={liked ? 'full' : 'empty'}
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0, opacity: 0 }}
        transition={{ type: 'spring', stiffness: 300 }}
        className="absolute"
      >
        {liked ? (
          <FaHeart size={28} className="text-pink-500" />
        ) : (
          <FaRegHeart size={28} className="text-gray-400" />
        )}
      </motion.div>

      <AnimatePresence key={burstId}>
        {particles.map((p) => (
          <motion.div
            key={p.id}
            className="absolute rounded-full"
            style={{
              width: p.size,
              height: p.size,
              backgroundColor: p.color,
            }}
            initial={{ x: 0, y: 0, opacity: 1, scale: 1 }}
            animate={{ x: p.x, y: p.y, opacity: 0, scale: 0.2, rotate: 360 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4, ease: 'easeOut' }}
          />
        ))}
      </AnimatePresence>
    </motion.button>
  );
}
