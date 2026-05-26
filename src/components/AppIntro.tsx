// AppIntro - Premium splash screen for Red Whale V1
import { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { Logo } from './Logo';

interface AppIntroProps {
  onComplete: () => void;
}

export function AppIntro({ onComplete }: AppIntroProps) {
  const [phase, setPhase] = useState(0);

  useEffect(() => {
    const t1 = setTimeout(() => setPhase(1), 400);
    const t2 = setTimeout(() => setPhase(2), 1200);
    const t3 = setTimeout(() => setPhase(3), 2800);
    const t4 = setTimeout(() => onComplete(), 3200);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); clearTimeout(t4); };
  }, [onComplete]);

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-background">
      <motion.div
        initial={{ opacity: 1 }}
        animate={{ opacity: phase >= 3 ? 0 : 1 }}
        transition={{ duration: 0.5 }}
        className="flex flex-col items-center gap-5 px-6"
      >
        {/* Glowing Logo */}
        <motion.div
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: phase >= 1 ? 1 : 0.5, opacity: phase >= 1 ? 1 : 0 }}
          transition={{ duration: 0.8, ease: [0.23, 1, 0.32, 1] }}
          className="relative"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-red-500 via-rose-400 to-red-600 rounded-full blur-2xl opacity-25 animate-pulse" />
          <div className="relative w-20 h-20 rounded-full bg-card flex items-center justify-center shadow-2xl border border-border/30">
            <Logo className="w-14 h-14" />
          </div>
        </motion.div>

        {/* Title */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: phase >= 2 ? 0 : 20, opacity: phase >= 2 ? 1 : 0 }}
          transition={{ duration: 0.6, ease: [0.23, 1, 0.32, 1] }}
          className="text-center"
        >
          <h1 className="text-3xl font-black tracking-[0.2em] text-foreground">
            <span className="text-red-500">RED</span>{' '}
            <span className="text-foreground">WHALE</span>
          </h1>
          <p className="text-xs font-semibold text-muted-foreground tracking-widest mt-1">
            V1 — Powerful AI
          </p>
        </motion.div>

        {/* Creator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: phase >= 2 ? 1 : 0 }}
          transition={{ delay: 0.3, duration: 0.5 }}
        >
          <p className="text-[10px] font-medium text-muted-foreground/60 tracking-wider">
            By Shujan
          </p>
        </motion.div>

        {/* Progress dots */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: phase >= 2 ? 1 : 0 }}
          className="flex gap-1.5 mt-1"
        >
          {[0, 150, 300].map((delay) => (
            <div
              key={delay}
              className="w-1.5 h-1.5 rounded-full bg-red-500 animate-bounce"
              style={{ animationDelay: `${delay}ms` }}
            />
          ))}
        </motion.div>
      </motion.div>
    </div>
  );
}
