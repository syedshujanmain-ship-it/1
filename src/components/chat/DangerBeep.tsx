// DangerBeep - Plays a beep-beep alarm for 5 seconds using Web Audio API
import { useEffect, useRef, useCallback } from 'react';

export function playDangerBeep(durationMs = 5000): void {
  try {
    const AudioCtx = (window as any).AudioContext || (window as any).webkitAudioContext;
    if (!AudioCtx) return;

    const ctx = new AudioCtx();
    const startTime = ctx.currentTime;
    const endTime = startTime + durationMs / 1000;

    // Beep pattern: 2 short beeps per second
    const beepInterval = 0.25; // seconds between beep pairs
    const beepDuration = 0.08;   // each beep length
    const gapBetweenBeeps = 0.06;

    for (let t = startTime; t < endTime; t += beepInterval) {
      // First beep
      const osc1 = ctx.createOscillator();
      const gain1 = ctx.createGain();
      osc1.connect(gain1);
      gain1.connect(ctx.destination);
      osc1.type = 'square';
      osc1.frequency.value = 1200; // high pitch beep
      gain1.gain.setValueAtTime(0.3, t);
      gain1.gain.exponentialRampToValueAtTime(0.001, t + beepDuration);
      osc1.start(t);
      osc1.stop(t + beepDuration);

      // Second beep (slightly lower pitch for "beep-beep" feel)
      const osc2 = ctx.createOscillator();
      const gain2 = ctx.createGain();
      osc2.connect(gain2);
      gain2.connect(ctx.destination);
      osc2.type = 'square';
      osc2.frequency.value = 1000;
      gain2.gain.setValueAtTime(0.3, t + beepDuration + gapBetweenBeeps);
      gain2.gain.exponentialRampToValueAtTime(0.001, t + beepDuration * 2 + gapBetweenBeeps);
      osc2.start(t + beepDuration + gapBetweenBeeps);
      osc2.stop(t + beepDuration * 2 + gapBetweenBeeps);
    }

    // Close context after done
    setTimeout(() => {
      try { ctx.close(); } catch { /* ignore */ }
    }, durationMs + 200);
  } catch {
    // Audio not supported, ignore
  }
}

interface DangerBeepProps {
  trigger: boolean;
  durationMs?: number;
}

export function DangerBeep({ trigger, durationMs = 5000 }: DangerBeepProps) {
  const hasPlayedRef = useRef(false);

  const play = useCallback(() => {
    if (hasPlayedRef.current) return;
    hasPlayedRef.current = true;
    playDangerBeep(durationMs);
    setTimeout(() => { hasPlayedRef.current = false; }, durationMs + 500);
  }, [durationMs]);

  useEffect(() => {
    if (trigger) {
      play();
    }
  }, [trigger, play]);

  return null;
}
