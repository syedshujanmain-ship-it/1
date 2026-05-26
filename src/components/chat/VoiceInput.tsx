// VoiceInput - Mic button with browser Speech Recognition (free, reliable)
import { useState, useRef, useCallback, useEffect } from 'react';
import { Mic, MicOff } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { transcribeAudio } from '@/services/voiceService';

interface VoiceInputProps {
  onTranscript: (text: string) => void;
  disabled?: boolean;
}

export function VoiceInput({ onTranscript, disabled }: VoiceInputProps) {
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef<any>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const pulseIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const [pulsePhase, setPulsePhase] = useState(0);

  const hasBrowserSTT = typeof window !== 'undefined' && ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window);

  const cleanup = useCallback(() => {
    setIsListening(false);
    if (pulseIntervalRef.current) {
      clearInterval(pulseIntervalRef.current);
      pulseIntervalRef.current = null;
    }
    if (recognitionRef.current) {
      try { recognitionRef.current.stop(); } catch { /* ignore */ }
      recognitionRef.current = null;
    }
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      try { mediaRecorderRef.current.stop(); } catch { /* ignore */ }
      mediaRecorderRef.current = null;
    }
    audioChunksRef.current = [];
  }, []);

  // Fallback: Record audio blob → edge function (Whisper API)
  const startFallbackListening = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream, { mimeType: 'audio/webm' });
      mediaRecorderRef.current = recorder;
      audioChunksRef.current = [];

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) audioChunksRef.current.push(e.data);
      };

      recorder.onstop = async () => {
        stream.getTracks().forEach(t => t.stop());
        setIsListening(false);
        if (pulseIntervalRef.current) {
          clearInterval(pulseIntervalRef.current);
          pulseIntervalRef.current = null;
        }

        try {
          const blob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
          const text = await transcribeAudio(blob);
          if (text.trim()) {
            onTranscript(text);
            toast.success('Voice captured!', { duration: 2000 });
          } else {
            toast.info('No speech detected. Try speaking louder.', { duration: 3000 });
          }
        } catch (e: any) {
          toast.error(e.message || 'Voice transcription failed', { duration: 5000 });
        }
      };

      recorder.onerror = () => {
        cleanup();
        toast.error('Recording error. Please try again.');
      };

      recorder.start(100);
      setIsListening(true);
      setPulsePhase(0);
      pulseIntervalRef.current = setInterval(() => {
        setPulsePhase((p) => (p + 1) % 6);
      }, 400);
      toast.info('Listening... Speak now', { duration: 2000 });

      setTimeout(() => {
        if (recorder.state === 'recording') {
          recorder.stop();
        }
      }, 30000);
    } catch {
      toast.error('Microphone access denied. Please allow mic permission.', { duration: 5000 });
    }
  }, [onTranscript, cleanup]);

  // Primary: Browser Web Speech API (free, fast, no upload)
  const startBrowserListening = useCallback(() => {
    const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
    if (!SpeechRecognition) return false;

    const recognition = new SpeechRecognition();
    recognitionRef.current = recognition;
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = 'en-US';

    recognition.onstart = () => {
      setIsListening(true);
      setPulsePhase(0);
      pulseIntervalRef.current = setInterval(() => {
        setPulsePhase((p) => (p + 1) % 6);
      }, 400);
      toast.info('Listening... Speak now', { duration: 2000 });
    };

    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      if (transcript.trim()) {
        onTranscript(transcript);
        toast.success('Voice captured!', { duration: 2000 });
      }
      cleanup();
    };

    recognition.onerror = (event: any) => {
      if (event.error === 'network') {
        toast.error('Network issue with voice. Trying alternative...', { duration: 3000 });
        cleanup();
        setTimeout(() => startFallbackListening(), 500);
        return;
      }
      if (event.error !== 'no-speech' && event.error !== 'aborted') {
        toast.error(`Voice error: ${event.error}`, { duration: 3000 });
      }
      cleanup();
    };

    recognition.onend = () => {
      cleanup();
    };

    try {
      recognition.start();
      return true;
    } catch {
      return false;
    }
  }, [onTranscript, cleanup, startFallbackListening]);

  const startListening = useCallback(() => {
    if (disabled) return;
    if (hasBrowserSTT) {
      const started = startBrowserListening();
      if (!started) startFallbackListening();
    } else {
      startFallbackListening();
    }
  }, [disabled, hasBrowserSTT, startBrowserListening, startFallbackListening]);

  const stopListening = useCallback(() => {
    cleanup();
  }, [cleanup]);

  useEffect(() => {
    return () => cleanup();
  }, [cleanup]);

  const pulseColors = [
    'shadow-red-500/50 text-red-500',
    'shadow-orange-500/50 text-orange-500',
    'shadow-amber-500/50 text-amber-500',
    'shadow-green-500/50 text-green-500',
    'shadow-blue-500/50 text-blue-500',
    'shadow-purple-500/50 text-purple-500',
  ];

  return (
    <button
      type="button"
      disabled={disabled}
      onClick={isListening ? stopListening : startListening}
      className={cn(
        'relative flex items-center justify-center w-7 h-7 rounded-full shrink-0 transition-all duration-300',
        isListening
          ? `bg-destructive/10 ${pulseColors[pulsePhase]} shadow-lg animate-pulse`
          : 'hover:bg-primary/10 text-muted-foreground hover:text-primary',
        disabled && 'opacity-50 cursor-not-allowed'
      )}
      title={isListening ? 'Stop recording' : 'Voice input'}
    >
      {isListening ? (
        <>
          <span className="absolute inset-0 rounded-full animate-ping bg-destructive/20" />
          <MicOff className="w-3.5 h-3.5 relative z-10" />
        </>
      ) : (
        <Mic className="w-3.5 h-3.5" />
      )}
    </button>
  );
}
