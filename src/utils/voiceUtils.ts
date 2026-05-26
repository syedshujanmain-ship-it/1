// voiceUtils.ts - Shared voice/text utilities for TTS/STT
// Strips emojis, loads voices properly, selects natural-sounding voices

/** Strip emojis and symbol characters that TTS shouldn't read aloud */
export function stripEmojis(text: string): string {
  return text
    // Remove emoji ranges
    .replace(/[\u{1F600}-\u{1F64F}]/gu, '')   // emoticons
    .replace(/[\u{1F300}-\u{1F5FF}]/gu, '')   // symbols & pictographs
    .replace(/[\u{1F680}-\u{1F6FF}]/gu, '')   // transport & map
    .replace(/[\u{1F700}-\u{1F77F}]/gu, '')   // alchemical symbols
    .replace(/[\u{1F780}-\u{1F7FF}]/gu, '')   // geometric shapes
    .replace(/[\u{1F800}-\u{1F8FF}]/gu, '')   // supplemental arrows
    .replace(/[\u{1F900}-\u{1F9FF}]/gu, '')   // supplemental symbols
    .replace(/[\u{1FA00}-\u{1FA6F}]/gu, '')   // chess symbols
    .replace(/[\u{1FA70}-\u{1FAFF}]/gu, '')   // symbols & pictographs extended
    .replace(/[\u{2600}-\u{26FF}]/gu, '')    // miscellaneous symbols
    .replace(/[\u{2700}-\u{27BF}]/gu, '')    // dingbats
    .replace(/[\u{FE00}-\u{FE0F}]/gu, '')    // variation selectors
    .replace(/[\u{1F1E0}-\u{1F1FF}]/gu, '')  // regional indicator symbols (flags)
    .replace(/[\u{200D}]/gu, '')              // zero-width joiner
    // Remove markdown link syntax (keep just the text)
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    // Remove markdown bold/italic markers
    .replace(/(\*\*|__|`|\*|_)/g, '')
    // Remove markdown headers
    .replace(/#{1,6}\s?/g, '')
    // Clean up multiple spaces
    .replace(/\s{2,}/g, ' ')
    .trim();
}

/** Read voice gender preference from localStorage settings */
export function getVoiceGender(): 'female' | 'male' {
  try {
    const raw = localStorage.getItem('redwhale_app_settings');
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed.voiceGender === 'female' || parsed.voiceGender === 'male') {
        return parsed.voiceGender;
      }
    }
  } catch { /* ignore */ }
  return 'female';
}

/** Wait for speech synthesis voices to be loaded (handles Chrome/Edge async loading) */
export function loadVoices(): Promise<SpeechSynthesisVoice[]> {
  return new Promise((resolve) => {
    if (!window.speechSynthesis) {
      resolve([]);
      return;
    }

    const voices = window.speechSynthesis.getVoices();
    if (voices.length > 0) {
      resolve(voices);
      return;
    }

    // Chrome loads voices asynchronously
    const handler = () => {
      resolve(window.speechSynthesis.getVoices());
      window.speechSynthesis.removeEventListener('voiceschanged', handler);
    };
    window.speechSynthesis.addEventListener('voiceschanged', handler);

    // Fallback timeout in case event never fires
    setTimeout(() => {
      window.speechSynthesis.removeEventListener('voiceschanged', handler);
      resolve(window.speechSynthesis.getVoices());
    }, 2000);
  });
}

/** Pick the best natural-sounding voice by gender */
export async function selectVoice(gender: 'female' | 'male'): Promise<SpeechSynthesisVoice | null> {
  const voices = await loadVoices();
  if (!voices.length) return null;

  const femaleRanked = [
    'Samantha',       // macOS — very natural
    'Karen',          // macOS — natural
    'Victoria',       // macOS — natural
    'Moira',          // macOS — natural Irish
    'Tessa',          // macOS — natural South African
    'Google UK English Female', // Chrome
    'Google US English',        // Chrome
    'Microsoft Zira',           // Windows
    'Microsoft Hazel',          // Windows
    'Microsoft Susan',          // Windows
    'Alex',                     // macOS male fallback
    'Ting-Ting',                // Chinese
    'Mei-Jia',                  // Chinese
    'Kyoko',                    // Japanese
  ];

  const maleRanked = [
    'Daniel',              // macOS — very natural
    'Fred',                // macOS
    'Gordon',              // macOS
    'Lee',                 // macOS
    'Alex',                // macOS
    'Google UK English Male',   // Chrome
    'Google US English',        // Chrome
    'Microsoft David',          // Windows
    'Microsoft Mark',           // Windows
    'Microsoft James',          // Windows
    'Microsoft George',         // Windows
  ];

  const ranked = gender === 'female' ? femaleRanked : maleRanked;
  for (const name of ranked) {
    const found = voices.find((v) => v.name.includes(name));
    if (found) return found;
  }

  // Fallback: search by gender hints in voice name
  const hints = gender === 'female'
    ? ['female', 'woman', 'girl', 'samantha', 'karen', 'zira', 'susan', 'hazel', 'victoria', 'moira', 'tessa']
    : ['male', 'man', 'boy', 'daniel', 'david', 'mark', 'fred', 'gordon', 'lee', 'james', 'george'];
  const hinted = voices.find((v) => {
    const n = v.name.toLowerCase();
    return hints.some((h) => n.includes(h));
  });
  if (hinted) return hinted;

  // Ultimate fallback: any English voice
  return voices.find((v) => v.lang.startsWith('en')) || voices[0] || null;
}

/** Speak text using browser SpeechSynthesis with all utilities applied */
export async function speakText(text: string): Promise<void> {
  return new Promise(async (resolve, reject) => {
    if (!window.speechSynthesis) {
      reject(new Error('Browser speech synthesis not available'));
      return;
    }

    const cleanText = stripEmojis(text);
    if (!cleanText.trim()) {
      resolve(); // nothing to speak
      return;
    }

    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(cleanText);
    const gender = getVoiceGender();
    const voice = await selectVoice(gender);

    if (voice) utterance.voice = voice;
    utterance.rate = 1.0;
    utterance.pitch = gender === 'female' ? 1.05 : 0.95;
    utterance.volume = 1.0;

    utterance.onend = () => resolve();
    utterance.onerror = (e) => reject(new Error(`Speech error: ${e.type}`));

    window.speechSynthesis.speak(utterance);
  });
}
