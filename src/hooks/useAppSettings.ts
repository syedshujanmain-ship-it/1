// useAppSettings - Global app settings (font, DPI, mood on/off, custom moods/modes)
import { useState, useEffect, useCallback } from 'react';

export interface CustomMood {
  id: string;
  name: string;
  icon: string; // lucide icon name
  prompt: string;
}

export interface CustomMode {
  id: string;
  name: string;
  instructions: string;
  icon: string; // lucide icon name
}

export type DpiScale = 'auto' | 'small' | 'medium-small' | 'medium' | 'medium-big' | 'big';

export type TypingIndicatorStyle = 'dots' | 'wave' | 'pulse' | 'orbit' | 'neon' | 'matrix' | 'fire' | 'heart';
export type CursorStyle = 'beam' | 'block' | 'underline' | 'glow';

export type VoiceGender = 'female' | 'male';

export interface AppSettings {
  fontFamily: string;
  dpiScale: DpiScale;
  moodEnabled: boolean;
  customMoods: CustomMood[];
  customModes: CustomMode[];
  cursorStyle: CursorStyle;
  typingIndicatorStyle: TypingIndicatorStyle;
  thinkingMode: boolean;
  redGlowEnabled: boolean;
  blueGlowEnabled: boolean;
  selectedModel: string;
  voiceGender: VoiceGender;
}

const DEFAULT_SETTINGS: AppSettings = {
  fontFamily: 'system-ui, -apple-system, sans-serif',
  dpiScale: 'auto',
  moodEnabled: true,
  customMoods: [],
  customModes: [],
  cursorStyle: 'beam',
  typingIndicatorStyle: 'dots',
  thinkingMode: false,
  redGlowEnabled: true,
  blueGlowEnabled: false,
  selectedModel: 'gemini-2.5-flash',
  voiceGender: 'female',
};

const STORAGE_KEY = 'redwhale_app_settings';

export function useAppSettings() {
  const [settings, setSettings] = useState<AppSettings>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        return { ...DEFAULT_SETTINGS, ...parsed };
      }
    } catch {
      // ignore
    }
    return DEFAULT_SETTINGS;
  });

  // Persist settings
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
    } catch {
      // ignore
    }
  }, [settings]);

  // Apply font family to entire app — all text elements
  useEffect(() => {
    const style = document.getElementById('rw-font-override') as HTMLStyleElement | null;
    const css = `
      html, body, div, span, p, h1, h2, h3, h4, h5, h6, a, li, td, th, label, input, textarea, button, code, pre, blockquote, small, strong, em {
        font-family: ${settings.fontFamily} !important;
      }
    `;
    if (style) {
      style.textContent = css;
    } else {
      const newStyle = document.createElement('style');
      newStyle.id = 'rw-font-override';
      newStyle.textContent = css;
      document.head.appendChild(newStyle);
    }
  }, [settings.fontFamily]);

  // Apply DPI scale
  useEffect(() => {
    const html = document.documentElement;
    const scaleMap: Record<DpiScale, string> = {
      auto: '14px',
      small: '13px',
      'medium-small': '13.5px',
      medium: '14px',
      'medium-big': '15px',
      big: '16px',
    };
    html.style.fontSize = scaleMap[settings.dpiScale];
  }, [settings.dpiScale]);

  const setFontFamily = useCallback((font: string) => {
    setSettings(prev => ({ ...prev, fontFamily: font }));
  }, []);

  const setDpiScale = useCallback((scale: DpiScale) => {
    setSettings(prev => ({ ...prev, dpiScale: scale }));
  }, []);

  const setMoodEnabled = useCallback((enabled: boolean) => {
    setSettings(prev => ({ ...prev, moodEnabled: enabled }));
  }, []);

  const setCursorStyle = useCallback((style: CursorStyle) => {
    setSettings(prev => ({ ...prev, cursorStyle: style }));
  }, []);

  const setTypingIndicatorStyle = useCallback((style: TypingIndicatorStyle) => {
    setSettings(prev => ({ ...prev, typingIndicatorStyle: style }));
  }, []);

  const setThinkingMode = useCallback((enabled: boolean) => {
    setSettings(prev => ({ ...prev, thinkingMode: enabled }));
  }, []);

  const setRedGlowEnabled = useCallback((enabled: boolean) => {
    setSettings(prev => ({ ...prev, redGlowEnabled: enabled }));
  }, []);

  const setBlueGlowEnabled = useCallback((enabled: boolean) => {
    setSettings(prev => ({ ...prev, blueGlowEnabled: enabled }));
  }, []);

  const setSelectedModel = useCallback((model: string) => {
    setSettings(prev => ({ ...prev, selectedModel: model }));
    localStorage.setItem('redwhale_custom_model', model);
  }, []);

  const setVoiceGender = useCallback((gender: VoiceGender) => {
    setSettings(prev => ({ ...prev, voiceGender: gender }));
  }, []);

  const addCustomMood = useCallback((mood: Omit<CustomMood, 'id'>) => {
    const newMood: CustomMood = { ...mood, id: `custom_${Date.now()}` };
    setSettings(prev => ({ ...prev, customMoods: [...prev.customMoods, newMood] }));
    return newMood.id;
  }, []);

  const removeCustomMood = useCallback((id: string) => {
    setSettings(prev => ({ ...prev, customMoods: prev.customMoods.filter(m => m.id !== id) }));
  }, []);

  const addCustomMode = useCallback((mode: Omit<CustomMode, 'id'>) => {
    const newMode: CustomMode = { ...mode, id: `custommode_${Date.now()}` };
    setSettings(prev => ({ ...prev, customModes: [...prev.customModes, newMode] }));
    return newMode.id;
  }, []);

  const removeCustomMode = useCallback((id: string) => {
    setSettings(prev => ({ ...prev, customModes: prev.customModes.filter(m => m.id !== id) }));
  }, []);

  return {
    settings,
    setFontFamily,
    setDpiScale,
    setMoodEnabled,
    setCursorStyle,
    setTypingIndicatorStyle,
    setThinkingMode,
    setRedGlowEnabled,
    setBlueGlowEnabled,
    setSelectedModel,
    setVoiceGender,
    addCustomMood,
    removeCustomMood,
    addCustomMode,
    removeCustomMode,
  };
}
