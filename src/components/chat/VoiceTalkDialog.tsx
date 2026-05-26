// VoiceTalkDialog - Premium Voice-to-Voice Interface
// Uses browser-native Web Speech API (free, no uploads, human-like voices)
import { useState, useRef, useEffect, useCallback } from 'react';
import { Mic, X, Volume2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { transcribeAudio } from '@/services/voiceService';
import { speakText } from '@/utils/voiceUtils';

interface VoiceTalkDialogProps {
  open: boolean;
  onClose: () => void;
  onSendMessage: (text: string) => Promise<string>;
}

type VoicePhase = 'idle' | 'listening' | 'processing' | 'speaking';

export function VoiceTalkDialog({ open, onClose, onSendMessage }: VoiceTalkDialogProps) {
  const [phase, setPhase] = useState<VoicePhase>('idle');
  const [transcript, setTranscript] = useState('');
  const [aiText, setAiText] = useState('');
  const recognitionRef = useRef<any>(null);
  const silenceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const hasBrowserSTT = typeof window !== 'undefined' && ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window);

  const stopTTS = useCallback(() => {
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
  }, []);

  const cleanup = useCallback(() => {
    stopTTS();
    if (recognitionRef.current) {
      try { recognitionRef.current.stop(); } catch { /* ignore */ }
      recognitionRef.current = null;
    }
    if (silenceTimerRef.current) {
      clearTimeout(silenceTimerRef.current);
      silenceTimerRef.current = null;
    }
  }, [stopTTS]);

  useEffect(() => {
    if (!open) {
      cleanup();
      setPhase('idle');
      setTranscript('');
      setAiText('');
    }
    return () => cleanup();
  }, [open, cleanup]);

  // Fallback: Record audio blob → edge function (Whisper API)
  const startFallbackRecording = useCallback(async () => {
    setTranscript('');
    setAiText('');

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream, { mimeType: 'audio/webm' });
      const chunks: Blob[] = [];

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunks.push(e.data);
      };

      recorder.onstop = async () => {
        stream.getTracks().forEach(t => t.stop());
        setPhase('processing');
        try {
          const blob = new Blob(chunks, { type: 'audio/webm' });
          const text = await transcribeAudio(blob);
          if (!text.trim()) {
            toast.info('No speech detected. Try again.', { duration: 3000 });
            setPhase('idle');
            return;
          }
          setTranscript(text);
          const response = await onSendMessage(text);
          setAiText(response);
          setPhase('speaking');
          await speakText(response);
          setPhase('idle');
          setTranscript('');
          setAiText('');
        } catch (e: any) {
          toast.error(e.message || 'Voice processing failed');
          setPhase('idle');
        }
      };

      recorder.onerror = () => {
        toast.error('Recording error. Please try again.');
        setPhase('idle');
      };

      recorder.start(100);
      setPhase('listening');
      toast.info('Listening (cloud mode)... Speak now', { duration: 2000 });

      setTimeout(() => {
        if (recorder.state === 'recording') {
          recorder.stop();
        }
      }, 30000);
    } catch {
      toast.error('Microphone access denied. Please allow mic permission.', { duration: 5000 });
      setPhase('idle');
    }
  }, [onSendMessage]);

  // Start listening using browser SpeechRecognition
  const startRecording = useCallback(() => {
    if (!hasBrowserSTT) {
      toast.error('Speech recognition not supported in this browser');
      return;
    }

    setTranscript('');
    setAiText('');

    const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
    const recognition = new SpeechRecognition();
    recognitionRef.current = recognition;

    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = 'en-US';

    recognition.onstart = () => {
      setPhase('listening');
    };

    recognition.onresult = async (event: any) => {
      const text = event.results[0][0].transcript;
      if (!text.trim()) {
        toast.info('No speech detected. Try again.', { duration: 3000 });
        setPhase('idle');
        return;
      }
      setTranscript(text);
      setPhase('processing');

      try {
        const response = await onSendMessage(text);
        setAiText(response);
        setPhase('speaking');
        await speakText(response);
        setPhase('idle');
        setTranscript('');
        setAiText('');
      } catch (e: any) {
        toast.error(e.message || 'Voice processing failed');
        setPhase('idle');
      }
    };

    recognition.onerror = (event: any) => {
      if (event.error === 'network') {
        toast.error('Network issue. Switching to cloud voice...', { duration: 3000 });
        setPhase('idle');
        setTimeout(() => startFallbackRecording(), 500);
        return;
      }
      if (event.error !== 'no-speech' && event.error !== 'aborted') {
        toast.error(`Voice error: ${event.error}`, { duration: 3000 });
      }
      setPhase('idle');
    };

    recognition.onend = () => {
      setPhase((prev) => (prev === 'listening' ? 'idle' : prev));
    };

    try {
      recognition.start();
    } catch (e) {
      toast.error('Failed to start voice recognition');
      setPhase('idle');
    }
  }, [hasBrowserSTT, onSendMessage, startFallbackRecording]);

  const stopRecording = useCallback(() => {
    if (recognitionRef.current) {
      try { recognitionRef.current.stop(); } catch { /* ignore */ }
    }
    if (silenceTimerRef.current) {
      clearTimeout(silenceTimerRef.current);
      silenceTimerRef.current = null;
    }
  }, []);

  const handleMicTap = useCallback(() => {
    if (phase === 'idle') {
      startRecording();
    } else if (phase === 'listening') {
      stopRecording();
    }
  }, [phase, startRecording, stopRecording]);

  // Sound wave bars (20 bars with rainbow gradient)
  const barCount = 20;
  const bars = Array.from({ length: barCount }, (_, i) => i);

  const phaseLabels: Record<VoicePhase, string> = {
    idle: 'Tap to Speak',
    listening: 'Listening...',
    processing: 'Thinking...',
    speaking: 'Speaking...',
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-background/95 backdrop-blur-xl">
      {/* Close button */}
      <button
        onClick={onClose}
        className="absolute top-6 right-6 w-10 h-10 rounded-full bg-muted/50 hover:bg-muted flex items-center justify-center transition-colors"
      >
        <X className="w-5 h-5 text-muted-foreground" />
      </button>

      {/* Status Label */}
      <p className="text-lg font-semibold text-foreground tracking-wide mb-8">
        {phaseLabels[phase]}
      </p>

      {/* Transcript display */}
      {transcript && (
        <div className="max-w-md mx-auto mb-6 px-4">
          <p className="text-sm text-muted-foreground text-center">"{transcript}"</p>
        </div>
      )}
      {aiText && phase === 'speaking' && (
        <div className="max-w-md mx-auto mb-6 px-4">
          <p className="text-sm text-primary text-center font-medium">{aiText}</p>
        </div>
      )}

      {/* Colorful Sound Wave Animation */}
      <div className="flex items-center justify-center gap-[3px] h-32 mb-10">
        {bars.map((i) => (
          <div
            key={i}
            className={cn(
              'w-1.5 rounded-full transition-all duration-100',
              phase === 'idle' && 'voice-bar-idle',
              phase === 'listening' && 'voice-bar-active',
              phase === 'processing' && 'voice-bar-pulse',
              phase === 'speaking' && 'voice-bar-active'
            )}
            style={{
              background: getBarGradient(i, barCount),
              boxShadow: `0 0 8px ${getBarColor(i, barCount)}`,
              animationDelay: `${i * 0.05}s`,
              height: phase === 'idle' ? '12px' : undefined,
            }}
          />
        ))}
      </div>

      {/* Big Mic Button */}
      <button
        onClick={handleMicTap}
        disabled={phase === 'processing'}
        className={cn(
          'relative w-20 h-20 rounded-full flex items-center justify-center transition-all duration-300',
          phase === 'idle' && 'bg-primary hover:scale-105 shadow-lg shadow-primary/30',
          phase === 'listening' && 'bg-destructive animate-pulse shadow-lg shadow-destructive/30',
          phase === 'processing' && 'bg-muted scale-90 opacity-70',
          phase === 'speaking' && 'bg-primary/60 scale-95'
        )}
      >
        {phase === 'speaking' ? (
          <Volume2 className="w-8 h-8 text-primary-foreground" />
        ) : (
          <Mic className="w-8 h-8 text-primary-foreground" />
        )}
        {phase === 'listening' && (
          <span className="absolute inset-0 rounded-full animate-ping bg-destructive/20" />
        )}
      </button>

      <p className="mt-6 text-xs text-muted-foreground">
        {phase === 'idle' ? 'Tap the mic and ask anything' : ''}
        {phase === 'listening' ? 'Tap again to stop' : ''}
      </p>
    </div>
  );
}

// Rainbow gradient for each bar
function getBarGradient(index: number, total: number): string {
  const t = index / (total - 1);
  // Red (0) → Orange (0.17) → Yellow (0.33) → Green (0.5) → Blue (0.67) → Purple (0.83) → Pink (1)
  if (t < 0.17) return `linear-gradient(180deg, hsl(0 90% 60%), hsl(15 90% 55%))`;
  if (t < 0.33) return `linear-gradient(180deg, hsl(30 90% 55%), hsl(45 90% 50%))`;
  if (t < 0.5) return `linear-gradient(180deg, hsl(60 90% 50%), hsl(90 80% 45%))`;
  if (t < 0.67) return `linear-gradient(180deg, hsl(120 70% 45%), hsl(150 70% 45%))`;
  if (t < 0.83) return `linear-gradient(180deg, hsl(200 90% 55%), hsl(240 80% 60%))`;
  return `linear-gradient(180deg, hsl(260 80% 60%), hsl(320 80% 55%))`;
}

function getBarColor(index: number, total: number): string {
  const t = index / (total - 1);
  if (t < 0.17) return 'hsl(0 90% 60%)';
  if (t < 0.33) return 'hsl(30 90% 55%)';
  if (t < 0.5) return 'hsl(60 90% 50%)';
  if (t < 0.67) return 'hsl(120 70% 45%)';
  if (t < 0.83) return 'hsl(200 90% 55%)';
  return 'hsl(260 80% 60%)';
}
