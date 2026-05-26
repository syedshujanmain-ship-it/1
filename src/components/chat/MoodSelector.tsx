// MoodSelector - Horizontal scrollable mood chips
import { useRef } from 'react';
import { cn } from '@/lib/utils';
import { MOOD_CONFIGS, type ChatMood } from '@/types/chat';
import {
  MessageCircle, Laugh, Flame, Heart, Briefcase, Smile,
  Eye, Brain, Zap, Feather, Glasses, Baby,
  Moon, Hammer, Sparkles, Rocket, Shield, Terminal,
  Radio, Bot, Paintbrush, Search, Wand2, Crown,
  // Real emotion mood icons
  Frown, Sun, PartyPopper, Meh, AlertTriangle, Target,
  EyeOff, Flower2, HelpCircle, Compass, AlertOctagon, Sunrise,
  Star, ThumbsDown, HeartHandshake, HeartCrack, Cloud, Activity,
} from 'lucide-react';

const moodIcons: Record<string, React.ElementType> = {
  MessageCircle, Laugh, Flame, Heart, Briefcase, Smile,
  Eye, Brain, Zap, Feather, Glasses, Baby,
  Moon, Hammer, Sparkles, Rocket, Shield, Terminal,
  Radio, Bot, Paintbrush, Search, Wand2, Crown,
  // Real emotion mood icons
  Frown, Sun, PartyPopper, Meh, AlertTriangle, Target,
  EyeOff, Flower2, HelpCircle, Compass, AlertOctagon, Sunrise,
  Star, ThumbsDown, HeartHandshake, HeartCrack, Cloud, Activity,
};

interface CustomMoodItem {
  id: string;
  name: string;
  icon: string;
  prompt: string;
}

interface MoodSelectorProps {
  selectedMood: ChatMood;
  onMoodChange: (mood: ChatMood) => void;
  disabled?: boolean;
  customMoods?: CustomMoodItem[];
}

export function MoodSelector({ selectedMood, onMoodChange, disabled, customMoods = [] }: MoodSelectorProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  return (
    <div className="relative w-full overflow-visible">
      <div
        ref={scrollRef}
        className="flex gap-1.5 overflow-x-auto overflow-y-visible scrollbar-hide pb-2 pt-1 px-1"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {/* Built-in moods */}
        {(Object.keys(MOOD_CONFIGS) as ChatMood[]).map((mood) => {
          const config = MOOD_CONFIGS[mood];
          const Icon = moodIcons[config.icon];
          const isSelected = selectedMood === mood;

          return (
            <button
              key={mood}
              type="button"
              disabled={disabled}
              onClick={() => onMoodChange(mood)}
              style={isSelected ? {
                boxShadow: `0 0 8px ${config.glowColor}40, 0 0 16px ${config.glowColor}30, 0 0 24px ${config.glowColor}20`,
              } : undefined}
              className={cn(
                'flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-medium whitespace-nowrap shrink-0 transition-all duration-300 border relative overflow-hidden',
                isSelected
                  ? `${config.color} scale-105 border-current animate-mood-glow`
                  : 'bg-card/60 text-muted-foreground border-transparent hover:bg-card hover:text-foreground',
                disabled && 'opacity-50 cursor-not-allowed'
              )}
            >
              {isSelected && (
                <span
                  className="absolute inset-0 rounded-full opacity-20 animate-pulse"
                  style={{ background: `radial-gradient(circle, ${config.glowColor} 0%, transparent 70%)` }}
                />
              )}
              {Icon && <Icon className="w-3 h-3 relative z-10" />}
              <span className="relative z-10">{config.label}</span>
            </button>
          );
        })}

        {/* Custom moods */}
        {customMoods.map((cm) => {
          const CustomIcon = moodIcons[cm.icon] || Sparkles;
          const moodKey = cm.id as ChatMood;
          const isSelected = selectedMood === moodKey;
          return (
            <button
              key={cm.id}
              type="button"
              disabled={disabled}
              onClick={() => onMoodChange(moodKey)}
              className={cn(
                'flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-medium whitespace-nowrap shrink-0 transition-all duration-200 border',
                isSelected
                  ? 'text-primary bg-primary/10 shadow-sm scale-105 border-primary/30'
                  : 'bg-card/60 text-muted-foreground border-transparent hover:bg-card hover:text-foreground',
                disabled && 'opacity-50 cursor-not-allowed'
              )}
            >
              <CustomIcon className="w-3 h-3" />
              <span>{cm.name}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
