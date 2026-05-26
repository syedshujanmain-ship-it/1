// voiceService.ts - Speech-to-Text & Text-to-Speech
// Uses browser-native Web APIs (free, human-like voices) with edge-function fallback
import { speakText } from '@/utils/voiceUtils';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;

// ========== Speech-to-Text ==========

/** Transcribe audio using edge function (Whisper API). Browser STT is handled directly by components. */
export async function transcribeAudio(audioBlob: Blob, language?: string): Promise<string> {
  const base64 = await blobToBase64(audioBlob);

  const res = await fetch(`${supabaseUrl}/functions/v1/speech-to-text`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ audioBase64: base64, language }),
  });

  if (res.status === 429) {
    const err = await res.json();
    throw new Error(`Quota exhausted: ${err.message ?? res.statusText}`);
  }
  if (res.status === 402) {
    const err = await res.json();
    throw new Error(`Insufficient balance: ${err.message ?? res.statusText}`);
  }
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error ?? `Request failed: ${res.status}`);
  }

  const data = await res.json();
  return data.text ?? '';
}

// ========== Text-to-Speech ==========

/** Speak text using browser SpeechSynthesis (free, human-like voices). Re-export from voiceUtils. */
export { speakText };

/** Edge-function TTS fallback (LemonFox) — returns audio URL */
export async function edgeTTS(input: string, voice: string = 'heart'): Promise<string> {
  const res = await fetch(`${supabaseUrl}/functions/v1/text-to-speech`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ input, voice, response_format: 'mp3' }),
  });

  if (res.status === 429) {
    const err = await res.json();
    throw new Error(`Quota exhausted: ${err.message ?? res.statusText}`);
  }
  if (res.status === 402) {
    const err = await res.json();
    throw new Error(`Insufficient balance: ${err.message ?? res.statusText}`);
  }
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error ?? `Request failed: ${res.status}`);
  }

  const data = await res.json();
  return data.audioUrl;
}

function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}
