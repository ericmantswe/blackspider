import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { playPreloaderLaunchSound } from '../../lib/sound';

interface PreloaderProps {
  onComplete?: () => void;
  minDurationMs?: number;
}

export function Preloader({ onComplete, minDurationMs = 2500 }: PreloaderProps) {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      playPreloaderLaunchSound();
      setTimeout(() => {
        setIsVisible(false);
        if (onComplete) onComplete();
      }, 600);
    }, minDurationMs);
    return () => clearTimeout(timer);
  }, [minDurationMs, onComplete]);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          key="preloader"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.8, ease: 'easeInOut' }}
          className="fixed inset-0 z-[99999] bg-[#1a1a1a] flex items-center justify-center select-none overflow-hidden"
        >
          {/* Subtle noise / grain overlay */}
          <div
            className="absolute inset-0 opacity-[0.03] pointer-events-none"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
            }}
          />

          {/* Radar rings */}
          {[0, 1, 2, 3].map((i) => (
            <motion.div
              key={i}
              className="absolute rounded-full border border-primary/30"
              initial={{ width: 80, height: 80, opacity: 0.7 }}
              animate={{ width: 480, height: 480, opacity: 0 }}
              transition={{
                duration: 2.4,
                ease: 'easeOut',
                repeat: Infinity,
                delay: i * 0.6,
              }}
            />
          ))}

          {/* Static outer glow ring */}
          <motion.div
            className="absolute w-52 h-52 rounded-full"
            style={{
              background:
                'radial-gradient(circle, rgba(193,18,31,0.08) 0%, transparent 70%)',
            }}
            animate={{ scale: [1, 1.12, 1], opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
          />

          {/* Inner sharp border ring */}
          <motion.div
            className="absolute w-32 h-32 border border-primary/20"
            animate={{ rotate: 360 }}
            transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
          />
          <motion.div
            className="absolute w-44 h-44 border border-white/5"
            animate={{ rotate: -360 }}
            transition={{ duration: 12, repeat: Infinity, ease: 'linear' }}
          />

          {/* Logo */}
          <motion.div
            className="relative z-10 flex items-center justify-center"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
          >
            <img
              src="/BlackSpiderlogo.png"
              alt="Blackspider"
              className="w-24 h-24 object-contain"
              style={{
                filter: 'drop-shadow(0 0 20px rgba(193,18,31,0.6)) drop-shadow(0 0 60px rgba(193,18,31,0.2))',
              }}
            />
          </motion.div>

          {/* Corner accent lines */}
          {[
            'top-8 left-8',
            'top-8 right-8 rotate-90',
            'bottom-8 left-8 -rotate-90',
            'bottom-8 right-8 rotate-180',
          ].map((pos, i) => (
            <motion.div
              key={i}
              className={`absolute ${pos} flex flex-col gap-1`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 + i * 0.08 }}
            >
              <div className="w-6 h-px bg-primary/50" />
              <div className="w-px h-6 bg-primary/50" />
            </motion.div>
          ))}

        </motion.div>
      )}
    </AnimatePresence>
  );
}
