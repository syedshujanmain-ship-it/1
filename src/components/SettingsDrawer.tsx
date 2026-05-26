import { useState, useEffect } from 'react';
import { Settings, Code2, Paintbrush, Key, Trash2, Moon, Sun, Github, FileDown, Wand2, Lock, Smartphone, Sparkles, Type, Monitor, ToggleLeft, ToggleRight, Plus, X, Trash2Icon, Brain, Zap, Globe, Crown, Rocket, Hammer, GraduationCap, Radio, ListOrdered, Waves, ChevronDown, Clock, Flame, Heart, Star, Ghost, Skull, Smile, Volume2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { useTheme } from 'next-themes';
import { useNavigate } from 'react-router-dom';
import { downloadSourceCode } from '@/utils/downloadSourceCode';
import { downloadChatPDF } from '@/utils/downloadChatPDF';
import { GitHubPushDialog } from '@/components/GitHubPushDialog';
import { PasswordDialog } from '@/components/PasswordDialog';
import { RedWhaleEditor } from '@/components/RedWhaleEditor';
import { AndroidExportDialog } from '@/components/AndroidExportDialog';
import { CodeGenerator } from '@/components/CodeGenerator';
import { toast } from 'sonner';
import { motion } from 'motion/react';
import type { Message } from '@/types/chat';
import { cn } from '@/lib/utils';
import type { AppSettings, CustomMood, CustomMode, DpiScale, CursorStyle, TypingIndicatorStyle, VoiceGender } from '@/hooks/useAppSettings';

interface SettingsDrawerProps {
  onClearChat: () => void;
  messagesCount: number;
  messages: Message[];
  settings: AppSettings;
  setFontFamily: (font: string) => void;
  setDpiScale: (scale: DpiScale) => void;
  setMoodEnabled: (enabled: boolean) => void;
  setCursorStyle: (style: CursorStyle) => void;
  setTypingIndicatorStyle: (style: TypingIndicatorStyle) => void;
  setThinkingMode: (enabled: boolean) => void;
  setRedGlowEnabled: (enabled: boolean) => void;
  setBlueGlowEnabled: (enabled: boolean) => void;
  setVoiceGender: (gender: VoiceGender) => void;
  addCustomMood: (mood: Omit<CustomMood, 'id'>) => string;
  removeCustomMood: (id: string) => void;
  addCustomMode: (mode: Omit<CustomMode, 'id'>) => string;
  removeCustomMode: (id: string) => void;
  tempChatEnabled?: boolean;
  onTempChatToggle?: (enabled: boolean) => void;
}

const FONTS = [
  { label: 'System', value: 'system-ui, -apple-system, sans-serif' },
  { label: 'Inter', value: '"Inter", system-ui, sans-serif' },
  { label: 'Roboto', value: '"Roboto", system-ui, sans-serif' },
  { label: 'Poppins', value: '"Poppins", system-ui, sans-serif' },
  { label: 'Open Sans', value: '"Open Sans", system-ui, sans-serif' },
  { label: 'Montserrat', value: '"Montserrat", system-ui, sans-serif' },
  { label: 'Lato', value: '"Lato", system-ui, sans-serif' },
  { label: 'Nunito', value: '"Nunito", system-ui, sans-serif' },
  { label: 'Quicksand', value: '"Quicksand", system-ui, sans-serif' },
  { label: 'Raleway', value: '"Raleway", system-ui, sans-serif' },
  { label: 'Playfair Display', value: '"Playfair Display", serif' },
  { label: 'Merriweather', value: '"Merriweather", serif' },
  { label: 'Fira Code', value: '"Fira Code", monospace' },
  { label: 'JetBrains Mono', value: '"JetBrains Mono", monospace' },
  { label: 'Oswald', value: '"Oswald", system-ui, sans-serif' },
  { label: 'Bebas Neue', value: '"Bebas Neue", system-ui, sans-serif' },
  { label: 'Comfortaa', value: '"Comfortaa", system-ui, sans-serif' },
  { label: 'Josefin Sans', value: '"Josefin Sans", system-ui, sans-serif' },
  { label: 'Cinzel', value: '"Cinzel", serif' },
  { label: 'Exo 2', value: '"Exo 2", system-ui, sans-serif' },
  // Ultra Premium Fonts
  { label: 'Space Grotesk', value: '"Space Grotesk", system-ui, sans-serif' },
  { label: 'Outfit', value: '"Outfit", system-ui, sans-serif' },
  { label: 'DM Sans', value: '"DM Sans", system-ui, sans-serif' },
  { label: 'Manrope', value: '"Manrope", system-ui, sans-serif' },
  { label: 'Libre Baskerville', value: '"Libre Baskerville", serif' },
  { label: 'Spectral', value: '"Spectral", serif' },
  { label: 'Inconsolata', value: '"Inconsolata", monospace' },
  { label: 'Source Code Pro', value: '"Source Code Pro", monospace' },
  { label: 'Sora', value: '"Sora", system-ui, sans-serif' },
  { label: 'Syne', value: '"Syne", system-ui, sans-serif' },
  { label: 'Space Mono', value: '"Space Mono", monospace' },
  { label: 'Bodoni Moda', value: '"Bodoni Moda", serif' },
  { label: 'Cormorant Garamond', value: '"Cormorant Garamond", serif' },
  { label: 'Teko', value: '"Teko", system-ui, sans-serif' },
  { label: 'Rajdhani', value: '"Rajdhani", system-ui, sans-serif' },
  { label: 'Orbitron', value: '"Orbitron", system-ui, sans-serif' },
  { label: 'Lexend', value: '"Lexend", system-ui, sans-serif' },
  { label: 'Work Sans', value: '"Work Sans", system-ui, sans-serif' },
  { label: 'Red Hat Display', value: '"Red Hat Display", system-ui, sans-serif' },
];

const DPI_OPTIONS = [
  { label: 'Auto', value: 'auto' as const },
  { label: 'Small', value: 'small' as const },
  { label: 'Medium Small', value: 'medium-small' as const },
  { label: 'Medium', value: 'medium' as const },
  { label: 'Medium Big', value: 'medium-big' as const },
  { label: 'Big', value: 'big' as const },
];

const LUCIDE_ICONS = ['Zap', 'Brain', 'Globe', 'Crown', 'Rocket', 'Hammer', 'GraduationCap', 'Radio', 'Sparkles', 'Waves', 'Heart', 'Flame', 'Star', 'Smile', 'Ghost', 'Skull'];

const iconMap: Record<string, any> = {
  Zap, Brain, Globe, Crown, Rocket, Hammer, GraduationCap, Radio, Sparkles, Waves, Smile, Heart, Flame, Star, Ghost, Skull,
};

export function SettingsDrawer({
  onClearChat, messagesCount, messages,
  settings, setFontFamily, setDpiScale, setMoodEnabled,
  setCursorStyle, setTypingIndicatorStyle, setThinkingMode, setRedGlowEnabled, setBlueGlowEnabled, setVoiceGender,
  addCustomMood, removeCustomMood, addCustomMode, removeCustomMode,
  tempChatEnabled = false, onTempChatToggle
}: SettingsDrawerProps) {
  const [open, setOpen] = useState(false);
  const [githubDialogOpen, setGithubDialogOpen] = useState(false);
  const [editorOpen, setEditorOpen] = useState(false);
  const [androidExportOpen, setAndroidExportOpen] = useState(false);
  const [codeGenOpen, setCodeGenOpen] = useState(false);
  const [passDialogOpen, setPassDialogOpen] = useState(false);
  const [passTarget, setPassTarget] = useState<'download' | 'github' | 'editor' | 'android' | 'codegen' | 'newrw'>('download');
  const [showCustomMoodForm, setShowCustomMoodForm] = useState(false);
  const [showCustomModeForm, setShowCustomModeForm] = useState(false);
  const [customMoodName, setCustomMoodName] = useState('');
  const [customMoodPrompt, setCustomMoodPrompt] = useState('');
  const [customMoodIcon, setCustomMoodIcon] = useState('Zap');
  const [customModeName, setCustomModeName] = useState('');
  const [customModeInstructions, setCustomModeInstructions] = useState('');
  const [customModeIcon, setCustomModeIcon] = useState('Zap');
  const [fontDropdownOpen, setFontDropdownOpen] = useState(false);
  const { theme, setTheme } = useTheme();
  const navigate = useNavigate();

  useEffect(() => {
    const handler = () => setGithubDialogOpen(true);
    window.addEventListener('rw-open-github-push', handler);
    return () => window.removeEventListener('rw-open-github-push', handler);
  }, []);

  const requirePass = (target: 'download' | 'github' | 'editor' | 'android' | 'codegen' | 'newrw') => {
    setPassTarget(target);
    setPassDialogOpen(true);
  };

  const onPassSuccess = () => {
    if (passTarget === 'download') {
      handleDownloadSourceCode();
    } else if (passTarget === 'github') {
      setOpen(false);
      setGithubDialogOpen(true);
    } else if (passTarget === 'editor') {
      setOpen(false);
      setEditorOpen(true);
    } else if (passTarget === 'android') {
      setOpen(false);
      setAndroidExportOpen(true);
    } else if (passTarget === 'codegen') {
      setOpen(false);
      setCodeGenOpen(true);
    } else if (passTarget === 'newrw') {
      setOpen(false);
      setGithubDialogOpen(true);
      toast.success('NEW RW GitHub Source Code — Ready to push!');
    }
  };

  const handleDownloadSourceCode = async () => {
    const id = toast.loading('Preparing source code...');
    try {
      await downloadSourceCode();
      toast.dismiss(id);
      toast.success('Source code downloaded!');
    } catch {
      toast.dismiss(id);
      toast.error('Source code download failed');
    }
  };

  const handleDownloadChat = async () => {
    const id = toast.loading('Creating PDF...', { id: 'pdf-export' });
    try {
      await downloadChatPDF(messages);
      toast.success('PDF ready! Download started.', { id });
      setOpen(false);
    } catch {
      toast.error('❌ Failed to create PDF. Please try again.', { id });
    }
  };

  const publicItems = [
    {
      icon: theme === 'dark' ? Sun : Moon,
      label: theme === 'dark' ? 'Light Mode' : 'Dark Mode',
      desc: theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme',
      onClick: () => setTheme(theme === 'dark' ? 'light' : 'dark'),
      color: 'text-amber-500',
    },
    {
      icon: Trash2,
      label: 'Clear Chat',
      desc: 'Delete all conversation',
      onClick: () => { onClearChat(); setOpen(false); },
      color: 'text-red-500',
      disabled: messagesCount === 0,
    },
    {
      icon: FileDown,
      label: 'Export Chat as PDF',
      desc: 'Download full conversation as PDF',
      onClick: handleDownloadChat,
      color: 'text-rose-500',
      disabled: messagesCount === 0,
    },
    {
      icon: Key,
      label: 'API Settings',
      desc: 'API keys and configuration',
      onClick: () => { setOpen(false); navigate('/api-settings'); },
      color: 'text-blue-500',
    },
  ];

  const protectedItems = [
    {
      icon: Code2,
      label: 'Download Source Code',
      desc: 'Download complete project as ZIP',
      onClick: () => requirePass('download'),
      color: 'text-green-500',
    },
    {
      icon: Github,
      label: 'Push to GitHub',
      desc: 'Push code to GitHub & deploy on Vercel',
      onClick: () => requirePass('github'),
      color: 'text-slate-500',
    },
    {
      icon: Plus,
      label: 'NEW RW',
      desc: 'Create new Red Whale from GitHub source code',
      onClick: () => requirePass('newrw'),
      color: 'text-primary',
    },
    {
      icon: Wand2,
      label: 'Red Whale Editor',
      desc: 'AI-powered code editor — modify your app',
      onClick: () => requirePass('editor'),
      color: 'text-orange-500',
    },
    {
      icon: Smartphone,
      label: 'Export as Android App',
      desc: 'Generate Android Studio project ZIP',
      onClick: () => requirePass('android'),
      color: 'text-emerald-500',
    },
    {
      icon: Sparkles,
      label: 'AI Code Generator',
      desc: 'Generate any project — AI builds complete code ZIP',
      onClick: () => requirePass('codegen'),
      color: 'text-pink-500',
    },
  ];

  return (
    <>
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 rounded-full hover:bg-primary/10 transition-all"
          >
            <Settings className="w-4 h-4 text-muted-foreground" />
          </Button>
        </SheetTrigger>
        <SheetContent side="right" className="w-80 bg-card/95 backdrop-blur-2xl border-l border-border/50 flex flex-col h-full">
          <SheetHeader className="pb-4 border-b border-border/30 shrink-0">
            <SheetTitle className="text-base font-bold flex items-center gap-2">
              <Settings className="w-5 h-5 text-primary" />
              Settings
            </SheetTitle>
          </SheetHeader>

          <div className="flex-1 min-h-0 overflow-y-auto mt-4 space-y-2 px-1">
            {/* Public items */}
            {publicItems.map((item, i) => (
              <motion.button
                key={item.label}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
                onClick={item.onClick}
                disabled={item.disabled}
                className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-muted/50 transition-colors disabled:opacity-40 disabled:pointer-events-none text-left"
              >
                <div className={`p-2 rounded-lg bg-muted ${item.color}`}>
                  <item.icon className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-foreground">{item.label}</p>
                  <p className="text-[11px] text-muted-foreground">{item.desc}</p>
                </div>
              </motion.button>
            ))}

            {/* Divider */}
            <div className="flex items-center gap-2 px-3 pt-2">
              <div className="flex-1 h-px bg-border/40" />
              <Lock className="w-3 h-3 text-muted-foreground/50" />
              <span className="text-[10px] text-muted-foreground/50 font-medium">PROTECTED</span>
              <div className="flex-1 h-px bg-border/40" />
            </div>

            {/* Protected items */}
            {protectedItems.map((item, i) => (
              <motion.button
                key={item.label}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: (publicItems.length + i) * 0.05 }}
                onClick={item.onClick}
                className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-muted/50 transition-colors text-left group"
              >
                <div className={`p-2 rounded-lg bg-muted ${item.color}`}>
                  <item.icon className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <p className="text-sm font-semibold text-foreground">{item.label}</p>
                    <Lock className="w-3 h-3 text-muted-foreground/40 group-hover:text-muted-foreground/70 transition-colors" />
                  </div>
                  <p className="text-[11px] text-muted-foreground">{item.desc}</p>
                </div>
              </motion.button>
            ))}

            {/* Appearance Section */}
            <div className="flex items-center gap-2 px-3 pt-4">
              <div className="flex-1 h-px bg-border/40" />
              <Monitor className="w-3 h-3 text-muted-foreground/50" />
              <span className="text-[10px] text-muted-foreground/50 font-medium">APPEARANCE</span>
              <div className="flex-1 h-px bg-border/40" />
            </div>

            {/* Font Family — Large Dropdown List */}
            <div className="px-3 py-2 space-y-1.5">
              <div className="flex items-center gap-2">
                <Type className="w-3.5 h-3.5 text-muted-foreground" />
                <span className="text-xs font-semibold text-foreground">Font</span>
              </div>
              <div className="relative">
                <button
                  onClick={() => setFontDropdownOpen(!fontDropdownOpen)}
                  className="w-full flex items-center justify-between px-3 py-2 rounded-xl bg-muted border border-border hover:border-primary/30 transition-all text-left"
                >
                  <span className="text-sm font-medium" style={{ fontFamily: settings.fontFamily }}>
                    {FONTS.find(f => f.value === settings.fontFamily)?.label || 'System'}
                  </span>
                  <ChevronDown className={cn("w-4 h-4 text-muted-foreground transition-transform", fontDropdownOpen && "rotate-180")} />
                </button>
                {fontDropdownOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="absolute z-50 left-0 right-0 mt-1 max-h-48 overflow-y-auto rounded-xl bg-card border border-border shadow-xl"
                  >
                    {FONTS.map(f => (
                      <button
                        key={f.value}
                        onClick={() => { setFontFamily(f.value); setFontDropdownOpen(false); }}
                        className={cn(
                          "w-full flex items-center gap-3 px-3 py-2.5 text-left transition-all",
                          settings.fontFamily === f.value
                            ? "bg-primary/10 text-primary"
                            : "hover:bg-muted text-foreground"
                        )}
                      >
                        <span className="text-sm font-medium flex-1" style={{ fontFamily: f.value }}>
                          {f.label}
                        </span>
                        {settings.fontFamily === f.value && (
                          <Sparkles className="w-3.5 h-3.5 text-primary" />
                        )}
                      </button>
                    ))}
                  </motion.div>
                )}
              </div>
            </div>

            {/* DPI Scale */}
            <div className="px-3 py-2 space-y-1.5">
              <div className="flex items-center gap-2">
                <Monitor className="w-3.5 h-3.5 text-muted-foreground" />
                <span className="text-xs font-semibold text-foreground">Screen Size</span>
              </div>
              <div className="flex gap-1">
                {DPI_OPTIONS.map(d => (
                  <button
                    key={d.value}
                    onClick={() => setDpiScale(d.value)}
                    className={cn(
                      "flex-1 py-1.5 rounded-lg text-[11px] font-medium border transition-all",
                      settings.dpiScale === d.value
                        ? "bg-primary text-primary-foreground border-primary"
                        : "bg-muted text-muted-foreground border-transparent hover:border-border"
                    )}
                  >
                    {d.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Mood Toggle */}
            <div className="px-3 py-2">
              <button
                onClick={() => setMoodEnabled(!settings.moodEnabled)}
                className="w-full flex items-center gap-3 p-2 rounded-xl hover:bg-muted/50 transition-colors text-left"
              >
                <div className={cn("p-1.5 rounded-lg bg-muted", settings.moodEnabled ? 'text-primary' : 'text-muted-foreground')}>
                  {settings.moodEnabled ? <ToggleRight className="w-4 h-4" /> : <ToggleLeft className="w-4 h-4" />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-foreground">Mood Selector</p>
                  <p className="text-[11px] text-muted-foreground">
                    {settings.moodEnabled ? 'Visible in chat input' : 'Hidden from chat input'}
                  </p>
                </div>
              </button>
            </div>

            {/* Temporary Chat Toggle */}
            {onTempChatToggle && (
              <div className="px-3 py-2">
                <button
                  onClick={() => onTempChatToggle(!tempChatEnabled)}
                  className="w-full flex items-center gap-3 p-2 rounded-xl hover:bg-muted/50 transition-colors text-left"
                >
                  <div className={cn("p-1.5 rounded-lg bg-muted", tempChatEnabled ? 'text-amber-500' : 'text-muted-foreground')}>
                    {tempChatEnabled ? <ToggleRight className="w-4 h-4" /> : <ToggleLeft className="w-4 h-4" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-foreground">Temporary Chat</p>
                    <p className="text-[11px] text-muted-foreground">
                      {tempChatEnabled ? 'No history saved • Auto-clear' : 'Chat history saved normally'}
                    </p>
                  </div>
                </button>
              </div>
            )}

            {/* Red Light Toggle */}
            <div className="px-3 py-2">
              <button
                onClick={() => {
                  if (!settings.redGlowEnabled) {
                    setRedGlowEnabled(true);
                    setBlueGlowEnabled(false);
                  } else {
                    setRedGlowEnabled(false);
                  }
                }}
                className="w-full flex items-center gap-3 p-2 rounded-xl hover:bg-muted/50 transition-colors text-left"
              >
                <div className={cn("p-1.5 rounded-lg bg-muted", settings.redGlowEnabled ? 'text-red-500' : 'text-muted-foreground')}>
                  {settings.redGlowEnabled ? <ToggleRight className="w-4 h-4" /> : <ToggleLeft className="w-4 h-4" />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-foreground">Red Light</p>
                  <p className="text-[11px] text-muted-foreground">
                    {settings.redGlowEnabled ? 'Red glow ON' : 'Red glow OFF'}
                  </p>
                </div>
              </button>
            </div>

            {/* Blue Light Toggle */}
            <div className="px-3 py-2">
              <button
                onClick={() => {
                  if (!settings.blueGlowEnabled) {
                    setBlueGlowEnabled(true);
                    setRedGlowEnabled(false);
                  } else {
                    setBlueGlowEnabled(false);
                  }
                }}
                className="w-full flex items-center gap-3 p-2 rounded-xl hover:bg-muted/50 transition-colors text-left"
              >
                <div className={cn("p-1.5 rounded-lg bg-muted", settings.blueGlowEnabled ? 'text-blue-500' : 'text-muted-foreground')}>
                  {settings.blueGlowEnabled ? <ToggleRight className="w-4 h-4" /> : <ToggleLeft className="w-4 h-4" />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-foreground">Blue Light</p>
                  <p className="text-[11px] text-muted-foreground">
                    {settings.blueGlowEnabled ? 'Blue glow ON' : 'Blue glow OFF'}
                  </p>
                </div>
              </button>
            </div>

            {/* Thinking Mode Toggle */}
            <div className="px-3 py-2">
              <button
                onClick={() => setThinkingMode(!settings.thinkingMode)}
                className="w-full flex items-center gap-3 p-2 rounded-xl hover:bg-muted/50 transition-colors text-left"
              >
                <div className={cn("p-1.5 rounded-lg bg-muted", settings.thinkingMode ? 'text-indigo-400' : 'text-muted-foreground')}>
                  {settings.thinkingMode ? <ToggleRight className="w-4 h-4" /> : <ToggleLeft className="w-4 h-4" />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-foreground">Thinking Process</p>
                  <p className="text-[11px] text-muted-foreground">
                    {settings.thinkingMode ? 'AI shows chain of thought ON' : 'Direct answers only'}
                  </p>
                </div>
              </button>
            </div>

            {/* Voice Gender Selector */}
            <div className="px-3 py-2 space-y-1.5">
              <div className="flex items-center gap-2">
                <Volume2 className="w-3.5 h-3.5 text-muted-foreground" />
                <span className="text-xs font-semibold text-foreground">Voice Gender</span>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setVoiceGender('female')}
                  className={cn(
                    "flex-1 py-1.5 rounded-lg text-[11px] font-medium border transition-all",
                    settings.voiceGender === 'female'
                      ? "bg-primary text-primary-foreground border-primary"
                      : "bg-muted text-muted-foreground border-transparent hover:border-border"
                  )}
                >
                  Female
                </button>
                <button
                  onClick={() => setVoiceGender('male')}
                  className={cn(
                    "flex-1 py-1.5 rounded-lg text-[11px] font-medium border transition-all",
                    settings.voiceGender === 'male'
                      ? "bg-primary text-primary-foreground border-primary"
                      : "bg-muted text-muted-foreground border-transparent hover:border-border"
                  )}
                >
                  Male
                </button>
              </div>
            </div>

            {/* Cursor Style Selector — Premium 4 styles */}
            <div className="px-3 py-2">
              <p className="text-sm font-semibold text-foreground mb-2">Cursor Style</p>
              <div className="grid grid-cols-4 gap-1.5">
                {(['beam', 'block', 'underline', 'glow'] as CursorStyle[]).map((style) => (
                  <button
                    key={style}
                    onClick={() => setCursorStyle(style)}
                    className={cn(
                      "py-2 px-1 rounded-lg text-[10px] font-medium border transition-all",
                      settings.cursorStyle === style
                        ? "bg-primary/10 border-primary text-primary"
                        : "bg-muted/50 border-transparent text-muted-foreground hover:bg-muted"
                    )}
                  >
                    {style.charAt(0).toUpperCase() + style.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            {/* Typing Indicator Style — Premium 8 styles */}
            <div className="px-3 py-2">
              <p className="text-sm font-semibold text-foreground mb-2">Typing Indicator</p>
              <div className="grid grid-cols-4 gap-1.5">
                {(['dots', 'wave', 'pulse', 'orbit', 'neon', 'matrix', 'fire', 'heart'] as TypingIndicatorStyle[]).map((style) => (
                  <button
                    key={style}
                    onClick={() => setTypingIndicatorStyle(style)}
                    className={cn(
                      "py-2 px-1 rounded-lg text-[10px] font-medium border transition-all",
                      settings.typingIndicatorStyle === style
                        ? "bg-primary/10 border-primary text-primary"
                        : "bg-muted/50 border-transparent text-muted-foreground hover:bg-muted"
                    )}
                  >
                    {style.charAt(0).toUpperCase() + style.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            {/* Custom Moods */}
            <div className="flex items-center gap-2 px-3 pt-3">
              <div className="flex-1 h-px bg-border/40" />
              <Sparkles className="w-3 h-3 text-muted-foreground/50" />
              <span className="text-[10px] text-muted-foreground/50 font-medium">CUSTOM MOODS</span>
              <div className="flex-1 h-px bg-border/40" />
            </div>

            {settings.customMoods.map(mood => (
              <div key={mood.id} className="px-3 flex items-center gap-2 py-1">
                <span className="text-xs font-medium flex-1">{mood.name}</span>
                <button
                  onClick={() => removeCustomMood(mood.id)}
                  className="p-1 rounded hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors"
                >
                  <Trash2Icon className="w-3 h-3" />
                </button>
              </div>
            ))}

            {!showCustomMoodForm ? (
              <button
                onClick={() => setShowCustomMoodForm(true)}
                className="mx-3 flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[11px] font-medium text-primary hover:bg-primary/10 transition-colors border border-dashed border-primary/30"
              >
                <Plus className="w-3 h-3" />
                Add Custom Mood
              </button>
            ) : (
              <div className="mx-3 p-2.5 rounded-xl bg-muted/50 border border-border/40 space-y-2">
                <input
                  type="text"
                  value={customMoodName}
                  onChange={e => setCustomMoodName(e.target.value)}
                  placeholder="Mood name"
                  className="w-full bg-background rounded-lg px-2.5 py-1.5 text-xs border border-border outline-none focus:border-primary"
                />
                <textarea
                  value={customMoodPrompt}
                  onChange={e => setCustomMoodPrompt(e.target.value)}
                  placeholder="System prompt for this mood..."
                  rows={2}
                  className="w-full bg-background rounded-lg px-2.5 py-1.5 text-xs border border-border outline-none focus:border-primary resize-none"
                />
                <div className="flex gap-1 flex-wrap">
                  {LUCIDE_ICONS.map(ic => {
                    const IconComp = iconMap[ic] || Zap;
                    return (
                      <button
                        key={ic}
                        onClick={() => setCustomMoodIcon(ic)}
                        className={cn(
                          "p-1 rounded-md transition-all",
                          customMoodIcon === ic ? "bg-primary text-primary-foreground" : "bg-background hover:bg-muted"
                        )}
                      >
                        <IconComp className="w-3 h-3" />
                      </button>
                    );
                  })}
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      if (customMoodName.trim() && customMoodPrompt.trim()) {
                        addCustomMood({ name: customMoodName.trim(), icon: customMoodIcon, prompt: customMoodPrompt.trim() });
                        setCustomMoodName('');
                        setCustomMoodPrompt('');
                        setShowCustomMoodForm(false);
                        toast.success('Custom mood added!');
                      }
                    }}
                    className="flex-1 py-1.5 rounded-lg bg-primary text-primary-foreground text-[11px] font-semibold hover:bg-primary/90 transition-colors"
                  >
                    Save
                  </button>
                  <button
                    onClick={() => { setShowCustomMoodForm(false); setCustomMoodName(''); setCustomMoodPrompt(''); }}
                    className="px-3 py-1.5 rounded-lg bg-muted text-muted-foreground text-[11px] font-medium hover:bg-muted/80 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}

            {/* Custom Modes */}
            <div className="flex items-center gap-2 px-3 pt-3">
              <div className="flex-1 h-px bg-border/40" />
              <Brain className="w-3 h-3 text-muted-foreground/50" />
              <span className="text-[10px] text-muted-foreground/50 font-medium">CUSTOM MODES</span>
              <div className="flex-1 h-px bg-border/40" />
            </div>

            {settings.customModes.map(mode => (
              <div key={mode.id} className="px-3 flex items-center gap-2 py-1">
                <span className="text-xs font-medium flex-1">{mode.name}</span>
                <button
                  onClick={() => removeCustomMode(mode.id)}
                  className="p-1 rounded hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors"
                >
                  <Trash2Icon className="w-3 h-3" />
                </button>
              </div>
            ))}

            {!showCustomModeForm ? (
              <button
                onClick={() => setShowCustomModeForm(true)}
                className="mx-3 flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[11px] font-medium text-primary hover:bg-primary/10 transition-colors border border-dashed border-primary/30"
              >
                <Plus className="w-3 h-3" />
                Add Custom Mode
              </button>
            ) : (
              <div className="mx-3 p-2.5 rounded-xl bg-muted/50 border border-border/40 space-y-2">
                <input
                  type="text"
                  value={customModeName}
                  onChange={e => setCustomModeName(e.target.value)}
                  placeholder="Mode name (e.g. Chef Mode)"
                  className="w-full bg-background rounded-lg px-2.5 py-1.5 text-xs border border-border outline-none focus:border-primary"
                />
                <textarea
                  value={customModeInstructions}
                  onChange={e => setCustomModeInstructions(e.target.value)}
                  placeholder="Instructions: how should AI behave in this mode?"
                  rows={3}
                  className="w-full bg-background rounded-lg px-2.5 py-1.5 text-xs border border-border outline-none focus:border-primary resize-none"
                />
                <div className="flex gap-1 flex-wrap">
                  {LUCIDE_ICONS.map(ic => {
                    const IconComp = iconMap[ic] || Zap;
                    return (
                      <button
                        key={ic}
                        onClick={() => setCustomModeIcon(ic)}
                        className={cn(
                          "p-1 rounded-md transition-all",
                          customModeIcon === ic ? "bg-primary text-primary-foreground" : "bg-background hover:bg-muted"
                        )}
                      >
                        <IconComp className="w-3 h-3" />
                      </button>
                    );
                  })}
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      if (customModeName.trim() && customModeInstructions.trim()) {
                        addCustomMode({ name: customModeName.trim(), icon: customModeIcon, instructions: customModeInstructions.trim() });
                        setCustomModeName('');
                        setCustomModeInstructions('');
                        setShowCustomModeForm(false);
                        toast.success('Custom mode added!');
                      }
                    }}
                    className="flex-1 py-1.5 rounded-lg bg-primary text-primary-foreground text-[11px] font-semibold hover:bg-primary/90 transition-colors"
                  >
                    Save
                  </button>
                  <button
                    onClick={() => { setShowCustomModeForm(false); setCustomModeName(''); setCustomModeInstructions(''); }}
                    className="px-3 py-1.5 rounded-lg bg-muted text-muted-foreground text-[11px] font-medium hover:bg-muted/80 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>

          <div className="shrink-0 py-4 text-center border-t border-border/20">
            <p className="text-[10px] text-muted-foreground/50">
              Red Whale V1 — By Shujan
            </p>
          </div>
        </SheetContent>
      </Sheet>

      <PasswordDialog
        open={passDialogOpen}
        onOpenChange={setPassDialogOpen}
        onSuccess={onPassSuccess}
        title="Protected Access"
        description="Enter the developer password to unlock this feature."
      />

      <GitHubPushDialog open={githubDialogOpen} onOpenChange={setGithubDialogOpen} />
      <RedWhaleEditor open={editorOpen} onOpenChange={setEditorOpen} />
      <AndroidExportDialog open={androidExportOpen} onOpenChange={setAndroidExportOpen} />
      <CodeGenerator open={codeGenOpen} onOpenChange={setCodeGenOpen} />
    </>
  );
}
