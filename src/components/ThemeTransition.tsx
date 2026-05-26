import { useState, useEffect, useCallback } from 'react';

let globalToggle: (() => void) | null = null;

export function triggerThemeTransition() {
  globalToggle?.();
}

export function ThemeTransitionOverlay() {
  const [animating, setAnimating] = useState(false);

  useEffect(() => {
    globalToggle = () => {
      setAnimating(true);
      setTimeout(() => setAnimating(false), 600);
    };
    return () => { globalToggle = null; };
  }, []);

  if (!animating) return null;

  return (
    <div
      className="fixed inset-0 z-[9999] pointer-events-none"
      style={{ animation: 'theme-flash 0.6s ease-out forwards' }}
    >
      <div
        className="absolute inset-0 bg-red-500/20"
        style={{ animation: 'theme-radial 0.6s ease-out forwards' }}
      />
    </div>
  );
}