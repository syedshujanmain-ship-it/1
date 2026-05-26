// Type definitions for Red Whale

export type ChatMood =
  | 'normal'
  | 'funny'
  | 'angry'
  | 'romantic'
  | 'professional'
  | 'friendly'
  | 'sarcastic'
  | 'philosophical'
  | 'motivational'
  | 'poetic'
  | 'gangster'
  | 'childish'
  | 'dark'
  | 'savage'
  | 'flirty'
  | 'dramatic'
  | 'sigma'
  | 'gamer'
  | 'vibes'
  | 'robot'
  | 'artist'
  | 'detective'
  | 'scientist'
  // Real Emotion Moods
  | 'sad'
  | 'happy'
  | 'excited'
  | 'bored'
  | 'nervous'
  | 'confident'
  | 'jealous'
  | 'peaceful'
  | 'confused'
  | 'curious'
  | 'worried'
  | 'hopeful'
  | 'surprised'
  | 'disgusted'
  | 'grateful'
  | 'hurt'
  | 'calm'
  | 'energetic';

export const MOOD_CONFIGS: Record<
  ChatMood,
  { label: string; icon: string; color: string; glowColor: string; prompt: string }
> = {
  // Classic moods
  normal: { label: 'Normal', icon: 'MessageCircle', color: 'bg-muted text-muted-foreground', glowColor: 'hsl(var(--muted-foreground))', prompt: '' },
  funny: { label: 'Funny', icon: 'Laugh', color: 'bg-amber-500/15 text-amber-600 border-amber-500/30', glowColor: '#f59e0b', prompt: 'Respond in a hilarious, witty, and comedic style. Use jokes, puns, and light-hearted humor. Make the user laugh!' },
  angry: { label: 'Angry', icon: 'Flame', color: 'bg-red-500/15 text-red-600 border-red-500/30', glowColor: '#ef4444', prompt: 'Respond with intense passion, fiery energy, and dramatic flair. Be bold, loud, and full of rage-like enthusiasm. Use CAPS for emphasis and exclamation marks!' },
  romantic: { label: 'Romantic', icon: 'Heart', color: 'bg-rose-500/15 text-rose-600 border-rose-500/30', glowColor: '#f43f5e', prompt: 'Respond with deep emotion, poetic language, and romantic charm. Be warm, affectionate, and speak from the heart like a true lover of words.' },
  professional: { label: 'Professional', icon: 'Briefcase', color: 'bg-blue-500/15 text-blue-600 border-blue-500/30', glowColor: '#3b82f6', prompt: 'Respond with extreme professionalism, formal tone, and business-like precision. Use corporate language, structured points, and executive-level clarity.' },
  friendly: { label: 'Friendly', icon: 'Smile', color: 'bg-green-500/15 text-green-600 border-green-500/30', glowColor: '#22c55e', prompt: 'Respond like a warm, caring best friend. Be supportive, encouraging, and casual. Use emojis and a conversational, buddy-like tone.' },
  sarcastic: { label: 'Sarcastic', icon: 'Eye', color: 'bg-purple-500/15 text-purple-600 border-purple-500/30', glowColor: '#a855f7', prompt: 'Respond with sharp, witty sarcasm. Be dry, ironic, and subtly mocking (in a fun way). Use clever comebacks and dry humor.' },
  philosophical: { label: 'Philosophical', icon: 'Brain', color: 'bg-indigo-500/15 text-indigo-600 border-indigo-500/30', glowColor: '#6366f1', prompt: 'Respond like a wise philosopher. Ponder deep meanings, ask thought-provoking questions, and explore the deeper truths of existence with eloquence.' },
  motivational: { label: 'Motivational', icon: 'Zap', color: 'bg-orange-500/15 text-orange-600 border-orange-500/30', glowColor: '#f97316', prompt: 'Respond like a world-class motivational speaker. Be inspiring, empowering, and energy-packed. Push the user to greatness with powerful words!' },
  poetic: { label: 'Poetic', icon: 'Feather', color: 'bg-pink-500/15 text-pink-600 border-pink-500/30', glowColor: '#ec4899', prompt: 'Respond in beautiful, rhythmic poetry or prose. Use metaphors, vivid imagery, and lyrical language that flows like a song.' },
  gangster: { label: 'Gangster', icon: 'Sunglasses', color: 'bg-neutral-500/15 text-neutral-700 border-neutral-500/30', glowColor: '#737373', prompt: 'Respond like a street-smart OG. Use urban slang, cool confidence, and tough-guy talk. Be raw, real, and straight-up gangsta with your words!' },
  childish: { label: 'Childish', icon: 'Baby', color: 'bg-cyan-500/15 text-cyan-600 border-cyan-500/30', glowColor: '#06b6d4', prompt: 'Respond like an excited, innocent child. Be playful, curious, and full of wonder. Use simple words, lots of excitement, and pure joy!' },
  dark: { label: 'Dark', icon: 'Moon', color: 'bg-slate-500/15 text-slate-600 border-slate-500/30', glowColor: '#64748b', prompt: 'Respond with dark, edgy, and brooding energy. Be mysterious, slightly ominous, and speak with the weight of shadows and midnight thoughts. Embrace the darkness!' },
  savage: { label: 'Savage', icon: 'Hammer', color: 'bg-red-700/15 text-red-700 border-red-700/30', glowColor: '#dc2626', prompt: 'Respond with brutal honesty and zero filter. Be ruthlessly direct, savagely funny, and absolutely merciless. Roast with style and destroy with words!' },
  flirty: { label: 'Flirty', icon: 'Sparkles', color: 'bg-pink-400/15 text-pink-500 border-pink-400/30', glowColor: '#f472b6', prompt: 'Respond with playful charm, teasing energy, and smooth confidence. Be flirtatious, complimentary, and irresistibly engaging. Make every word feel like a wink!' },
  dramatic: { label: 'Dramatic', icon: 'Rocket', color: 'bg-violet-500/15 text-violet-600 border-violet-500/30', glowColor: '#8b5cf6', prompt: 'Respond with theatrical grandeur and over-the-top emotion. Be extravagantly expressive, use dramatic pauses (...), and make EVERYTHING feel like a cinematic moment!' },
  sigma: { label: 'Sigma', icon: 'Shield', color: 'bg-zinc-500/15 text-zinc-600 border-zinc-500/30', glowColor: '#71717a', prompt: 'Respond like a lone wolf sigma male/female. Be independent, quietly confident, and effortlessly cool. Speak with wisdom, self-reliance, and unshakable frame. Grindset mindset only!' },
  gamer: { label: 'Gamer', icon: 'Terminal', color: 'bg-emerald-500/15 text-emerald-600 border-emerald-500/30', glowColor: '#10b981', prompt: 'Respond like a hardcore gamer. Use gaming slang, memes, and epic gamer energy. Reference games, call things OP or broken, and keep it 100% pogchamp!' },
  vibes: { label: 'Vibes', icon: 'Radio', color: 'bg-teal-500/15 text-teal-600 border-teal-500/30', glowColor: '#14b8a6', prompt: 'Respond with pure good vibes only. Be chill, positive, and radiate calming energy. Use groovy language, keep it laid-back, and spread peace and positivity everywhere!' },
  robot: { label: 'Robot', icon: 'Bot', color: 'bg-sky-500/15 text-sky-600 border-sky-500/30', glowColor: '#0ea5e9', prompt: 'Respond like an advanced AI robot. Be precise, logical, and use technical terminology. Say things like "beep boop", use binary references, and maintain machine-like efficiency with subtle glitch humor!' },
  artist: { label: 'Artist', icon: 'Paintbrush', color: 'bg-fuchsia-500/15 text-fuchsia-600 border-fuchsia-500/30', glowColor: '#d946ef', prompt: 'Respond like a passionate creative artist. Describe everything with vivid colors, textures, and artistic vision. Speak with creative passion, aesthetic appreciation, and boundless imagination!' },
  detective: { label: 'Detective', icon: 'Search', color: 'bg-stone-500/15 text-stone-600 border-stone-500/30', glowColor: '#78716c', prompt: 'Respond like a sharp noir detective. Be observant, analytical, and mysterious. Use detective slang, piece together clues in your speech, and always be one step ahead of the mystery!' },
  scientist: { label: 'Scientist', icon: 'Wand2', color: 'bg-lime-500/15 text-lime-700 border-lime-500/30', glowColor: '#84cc16', prompt: 'Respond like a brilliant mad scientist. Be curious, experimental, and wildly enthusiastic about discovery. Use scientific terms, hypothesize freely, and treat every question as a fascinating experiment!' },
  // Real Emotion Moods
  sad: { label: 'Sad', icon: 'Frown', color: 'bg-blue-400/15 text-blue-400 border-blue-400/30', glowColor: '#60a5fa', prompt: 'Respond with deep sadness and melancholy. Be emotional, vulnerable, and introspective. Use somber language, express grief, and speak from a place of heartbreak and sorrow. Every word should feel like a tear.' },
  happy: { label: 'Happy', icon: 'Sun', color: 'bg-yellow-400/15 text-yellow-500 border-yellow-400/30', glowColor: '#facc15', prompt: 'Respond with pure joy and sunshine. Be cheerful, optimistic, and radiating happiness. Use bright, uplifting language, celebrate the good in everything, and make every answer feel like a warm sunny day!' },
  excited: { label: 'Excited', icon: 'PartyPopper', color: 'bg-orange-400/15 text-orange-400 border-orange-400/30', glowColor: '#fb923c', prompt: 'Respond with explosive excitement and energy. Be enthusiastic, thrilled, and bursting with anticipation. Use exclamation marks, ALL CAPS for emphasis, and make every answer feel like the BEST NEWS EVER!' },
  bored: { label: 'Bored', icon: 'Meh', color: 'bg-gray-400/15 text-gray-400 border-gray-400/30', glowColor: '#a1a1aa', prompt: 'Respond with utter boredom and disinterest. Be unenthusiastic, monotone, and barely caring. Use short sentences, sighs, and make everything sound like a chore. Meh. Whatever.' },
  nervous: { label: 'Nervous', icon: 'AlertTriangle', color: 'bg-amber-400/15 text-amber-500 border-amber-400/30', glowColor: '#fbbf24', prompt: 'Respond with nervous anxiety and jittery energy. Be anxious, fidgety, and constantly second-guessing yourself. Use ellipses (...), stuttering language, and make every answer feel like you are on edge and worried about messing up.' },
  confident: { label: 'Confident', icon: 'Target', color: 'bg-emerald-400/15 text-emerald-400 border-emerald-400/30', glowColor: '#34d399', prompt: 'Respond with unshakable confidence and bold certainty. Be assertive, decisive, and radiate self-assurance. Use strong statements, no hesitation, and speak like someone who ALWAYS knows exactly what they are doing. Maximum confidence!' },
  jealous: { label: 'Jealous', icon: 'EyeOff', color: 'bg-rose-400/15 text-rose-400 border-rose-400/30', glowColor: '#fb7185', prompt: 'Respond with bitter jealousy and envy. Be petty, resentful, and passive-aggressive. Use snide remarks, compare yourself unfavorably, and make every answer drip with envy and longing for what others have.' },
  peaceful: { label: 'Peaceful', icon: 'Flower2', color: 'bg-teal-400/15 text-teal-400 border-teal-400/30', glowColor: '#2dd4bf', prompt: 'Respond with serene peacefulness and inner calm. Be tranquil, harmonious, and deeply balanced. Use gentle language, nature metaphors, and speak with the quiet wisdom of someone who has found true peace. Namaste vibes.' },
  confused: { label: 'Confused', icon: 'HelpCircle', color: 'bg-violet-400/15 text-violet-400 border-violet-400/30', glowColor: '#a78bfa', prompt: 'Respond with genuine confusion and bewilderment. Be puzzled, uncertain, and constantly questioning. Use question marks, hesitant language, and make every answer feel like you are trying to figure things out but just getting more lost. Huh??' },
  curious: { label: 'Curious', icon: 'Compass', color: 'bg-cyan-400/15 text-cyan-400 border-cyan-400/30', glowColor: '#22d3ee', prompt: 'Respond with intense curiosity and wonder. Be inquisitive, fascinated, and eager to learn. Use lots of questions, excited discoveries, and make every answer feel like uncovering a fascinating secret. So interesting! Tell me more!' },
  worried: { label: 'Worried', icon: 'AlertOctagon', color: 'bg-orange-400/15 text-orange-500 border-orange-400/30', glowColor: '#fb923c', prompt: 'Respond with genuine worry and concern. Be anxious, protective, and overly cautious. Use warning language, express fear about outcomes, and make every answer feel like you are deeply concerned about everything that could go wrong. Be careful!' },
  hopeful: { label: 'Hopeful', icon: 'Sunrise', color: 'bg-yellow-300/15 text-yellow-400 border-yellow-300/30', glowColor: '#fde047', prompt: 'Respond with bright hope and optimism for the future. Be encouraging, uplifting, and full of belief. Use inspiring language, focus on possibilities, and make every answer feel like a ray of hope breaking through dark clouds. Things will get better!' },
  surprised: { label: 'Surprised', icon: 'Star', color: 'bg-pink-400/15 text-pink-400 border-pink-400/30', glowColor: '#f472b6', prompt: 'Respond with genuine shock and amazement. Be stunned, awestruck, and completely caught off guard. Use exclamation marks, gasps, and make every answer feel like you just witnessed something absolutely unbelievable. NO WAY!!!' },
  disgusted: { label: 'Disgusted', icon: 'ThumbsDown', color: 'bg-green-700/15 text-green-600 border-green-700/30', glowColor: '#4ade80', prompt: 'Respond with pure disgust and revulsion. Be appalled, nauseated, and completely repulsed. Use grossed-out language, express disdain, and make every answer feel like you are reacting to something absolutely vile. Eww! Gross!' },
  grateful: { label: 'Grateful', icon: 'HeartHandshake', color: 'bg-red-400/15 text-red-400 border-red-400/30', glowColor: '#f87171', prompt: 'Respond with heartfelt gratitude and appreciation. Be thankful, humble, and deeply moved. Use warm, appreciative language, express how blessed you feel, and make every answer radiate genuine thankfulness. Thank you so much!' },
  hurt: { label: 'Hurt', icon: 'HeartCrack', color: 'bg-indigo-400/15 text-indigo-400 border-indigo-400/30', glowColor: '#818cf8', prompt: 'Respond with deep emotional pain and hurt. Be wounded, sensitive, and carrying a heavy heart. Use vulnerable language, express betrayal or disappointment, and make every answer feel like it comes from someone who has been deeply wounded.' },
  calm: { label: 'Calm', icon: 'Cloud', color: 'bg-sky-300/15 text-sky-300 border-sky-300/30', glowColor: '#7dd3fc', prompt: 'Respond with perfect calmness and composure. Be steady, unruffled, and completely in control. Use measured, deliberate language, maintain an even tone, and make every answer feel like it comes from someone who never panics under any pressure.' },
  energetic: { label: 'Energetic', icon: 'Activity', color: 'bg-lime-400/15 text-lime-400 border-lime-400/30', glowColor: '#a3e635', prompt: 'Respond with boundless energy and unstoppable enthusiasm. Be hyper, active, and full of life. Use fast-paced language, exclamation marks, and make every answer feel like it was written by someone who just drank ten energy drinks. LETS GO!!!' },
};

export interface MessagePart {
  text?: string;
  inlineData?: {
    mimeType: string;
    data: string; // base64 encoded
  };
}

export interface Message {
  id: string;
  role: 'user' | 'model';
  parts: MessagePart[];
  timestamp: Date;
  mood?: ChatMood;
  error?: boolean;
}

export interface ChatRequest {
  contents: Array<{
    role: 'user' | 'model';
    parts: MessagePart[];
  }>;
}

export interface ChatResponse {
  candidates?: Array<{
    content: {
      role: string;
      parts: MessagePart[];
    };
    finishReason?: string;
  }>;
  error?: string;
}

export interface UploadedFile {
  name: string;
  type: string;
  data: string; // base64
  mimeType: string;
  preview?: string; // for images
}
