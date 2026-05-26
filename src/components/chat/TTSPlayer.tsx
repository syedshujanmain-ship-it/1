// TTSPlayer - Text-to-Speech for AI messages
import { useState, useCallback } from 'react';
import { Volume2, VolumeX } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { speakText } from '@/utils/voiceUtils';

interface TTSPlayerProps {
  text: string;
}

export function TTSPlayer({ text }: TTSPlayerProps) {
  const [isSpeaking, setIsSpeaking] = useState(false);

  const speak = useCallback(async () => {
    if (!window.speechSynthesis) {
      toast.error('Text-to-speech not supported in this browser');
      return;
    }

    setIsSpeaking(true);
    try {
      await speakText(text);
    } catch {
      // speech ended or errored
    }
    setIsSpeaking(false);
  }, [text]);

  const stop = useCallback(() => {
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
    setIsSpeaking(false);
  }, []);

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={isSpeaking ? stop : speak}
      className="h-6 px-2 text-[10px] rounded-full"
      title={isSpeaking ? 'Stop speaking' : 'Read aloud'}
    >
      {isSpeaking ? (
        <><VolumeX className="w-3 h-3 mr-1 text-destructive" /> Stop</>
      ) : (
        <><Volume2 className="w-3 h-3 mr-1" /> Speak</>
      )}
    </Button>
  );
}
