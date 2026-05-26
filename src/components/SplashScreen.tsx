import { motion } from 'motion/react';
import { useEffect, useState } from 'react';
import { Logo } from './Logo';

interface SplashScreenProps {
  onComplete: () => void;
}

export function SplashScreen({ onComplete }: SplashScreenProps) {
  const [show, setShow] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShow(false);
      setTimeout(onComplete, 500);
    }, 2800);
    return () => clearTimeout(timer);
  }, [onComplete]);

  if (!show) return null;

  return (
    <motion.div
      initial={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-black overflow-hidden"
    >
      {/* Red ambient glow behind logo */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1 }}
        className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-red-900/30 via-transparent to-transparent pointer-events-none"
      />

      <div className="relative z-10 flex flex-col items-center px-6">
        {/* Logo with glow */}
        <motion.div
          initial={{ scale: 0.4, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 1, ease: [0.23, 1, 0.32, 1] }}
          className="relative mb-5"
        >
          <div className="absolute inset-0 bg-red-500 rounded-full blur-3xl opacity-25 animate-pulse" />
          <div className="relative w-16 h-16 rounded-full bg-zinc-950 flex items-center justify-center shadow-2xl border border-red-500/20">
            <Logo className="w-11 h-11" />
          </div>
        </motion.div>

        {/* Progress line */}
        <motion.div
          initial={{ opacity: 0, scaleX: 0 }}
          animate={{ opacity: 1, scaleX: 1 }}
          transition={{ delay: 1, duration: 1.2 }}
          className="h-[1px] w-24 bg-gradient-to-r from-transparent via-red-500/60 to-transparent mt-5"
        />
      </div>
    </motion.div>
  );
}

