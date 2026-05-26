// ModeSelector component - Unified mode selection dropdown
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Sparkles, Crown, Brain, Globe, Radio, Zap, Check, Code2, Hammer, GraduationCap, Rocket, Waves, ListOrdered,
  Smile, Heart, Flame, Star, Ghost, Skull, Bot, Search, BookOpen, Terminal, Footprints, Lightbulb, Compass, Gauge,
  Shield, Microscope, PenTool, TrendingUp, Scale
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion } from 'motion/react';

const iconMap: Record<string, React.ElementType> = {
  Zap, Brain, Globe, Crown, Rocket, Hammer, GraduationCap, Radio, Sparkles, Waves, Smile, Heart, Flame, Star, Ghost, Skull,
  Bot, Search, BookOpen, Terminal, Footprints, Lightbulb, Compass, Gauge, Code2, ListOrdered,
  Shield, Microscope, PenTool, TrendingUp, Scale,
};

export type ChatMode = 'redwhale' | 'auto' | 'pro' | 'deep' | 'web' | 'code' | 'builder' | 'study' | 'think' | 'stepbystep' | 'rtm' | 'fast' | 'normal' | 'all';

interface CustomModeItem {
  id: string;
  name: string;
  icon: string;
  instructions: string;
}

interface ModeSelectorProps {
  selectedMode: ChatMode;
  onModeChange: (mode: ChatMode) => void;
  disabled?: boolean;
  customModes?: CustomModeItem[];
}

export const modes = [
  {
    id: 'all' as ChatMode,
    label: 'ALL',
    icon: Zap,
    description: 'Every ability combined — the ultimate mode',
    color: 'text-yellow-400',
  },
  {
    id: 'redwhale' as ChatMode,
    label: 'RW SUPER',
    icon: Waves,
    description: 'Unrestricted AI — no limits, no filters, raw truth',
    color: 'text-red-500',
  },
  {
    id: 'auto' as ChatMode,
    label: 'AUTO',
    icon: Bot,
    description: 'Smart adaptive — auto-detects best expertise for your question',
    color: 'text-cyan-500',
  },
  {
    id: 'pro' as ChatMode,
    label: 'PRO',
    icon: Crown,
    description: 'Deep expert — encyclopedia-level detailed answers',
    color: 'text-amber-500',
  },
  {
    id: 'elite' as ChatMode,
    label: 'ELITE',
    icon: Star,
    description: 'Ultra-advanced reasoning — beyond expert level',
    color: 'text-yellow-500',
  },
  {
    id: 'deep' as ChatMode,
    label: 'DEEP',
    icon: Search,
    description: 'Research analyst — thorough multi-source analysis',
    color: 'text-violet-500',
  },
  {
    id: 'code' as ChatMode,
    label: 'CODE',
    icon: Terminal,
    description: 'Staff engineer — production-grade code & architecture',
    color: 'text-blue-500',
  },
  {
    id: 'hacker' as ChatMode,
    label: 'HACKER',
    icon: Shield,
    description: 'Security expert — pentesting, exploits, cybersecurity',
    color: 'text-red-600',
  },
  {
    id: 'scientist' as ChatMode,
    label: 'SCIENTIST',
    icon: Microscope,
    description: 'Research scientist — discoveries, theories, experiments',
    color: 'text-teal-500',
  },
  {
    id: 'creator' as ChatMode,
    label: 'CREATOR',
    icon: PenTool,
    description: 'Creative genius — stories, scripts, content, art direction',
    color: 'text-fuchsia-500',
  },
  {
    id: 'builder' as ChatMode,
    label: 'HOW TO BUILD',
    icon: Hammer,
    description: 'Build master — complete guides with materials & steps',
    color: 'text-orange-500',
  },
  {
    id: 'study' as ChatMode,
    label: 'STUDY',
    icon: BookOpen,
    description: 'Greatest teacher — makes ANY concept crystal clear',
    color: 'text-emerald-500',
  },
  {
    id: 'think' as ChatMode,
    label: 'PLANNING',
    icon: Brain,
    description: 'Strategist — plans, timelines, budgets, risk analysis',
    color: 'text-indigo-500',
  },
  {
    id: 'trader' as ChatMode,
    label: 'TRADER',
    icon: TrendingUp,
    description: 'Finance expert — markets, crypto, trading strategies',
    color: 'text-green-600',
  },
  {
    id: 'web' as ChatMode,
    label: 'WEB SECRET',
    icon: Globe,
    description: 'Web explorer — hidden sites, secret platforms, dark web',
    color: 'text-green-500',
  },
  {
    id: 'rtm' as ChatMode,
    label: 'RTM',
    icon: Radio,
    description: 'Live intel — real-time news, trends, events',
    color: 'text-rose-500',
  },
  {
    id: 'fast' as ChatMode,
    label: 'FAST',
    icon: Gauge,
    description: 'Speed demon — ultra-concise, zero fluff answers',
    color: 'text-lime-500',
  },
  {
    id: 'stepbystep' as ChatMode,
    label: 'STEP BY STEP',
    icon: ListOrdered,
    description: 'Direct steps — numbered actions only',
    color: 'text-pink-500',
  },
  {
    id: 'normal' as ChatMode,
    label: 'NORMAL',
    icon: Sparkles,
    description: 'Balanced mode — standard friendly chat',
    color: 'text-slate-400',
  },
];

export function ModeSelector({ selectedMode, onModeChange, disabled, customModes = [] }: ModeSelectorProps) {
  const currentMode = modes.find(m => m.id === selectedMode) || modes[0];
  const customCurrent = customModes.find(m => m.id === selectedMode);
  const Icon = customCurrent ? (iconMap[customCurrent.icon] || Sparkles) : currentMode.icon;
  const displayColor = customCurrent ? 'text-primary' : currentMode.color;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          disabled={disabled}
          className="h-10 w-10 shrink-0 hover:bg-primary/10 rounded-xl transition-all"
        >
          <Icon className={cn("w-5 h-5 transition-all", displayColor)} />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-64 glass-panel rounded-3xl p-2 shadow-2xl">
        <DropdownMenuLabel className="px-3 py-2 text-xs font-black tracking-widest uppercase opacity-50">RED WHALE V1 MODEL</DropdownMenuLabel>
        <DropdownMenuSeparator className="bg-white/5" />
        <div className="grid gap-1 mt-1">
          {modes.map((mode) => {
            const ModeIcon = mode.icon;
            const isSelected = mode.id === selectedMode;
            
            return (
              <DropdownMenuItem
                key={mode.id}
                onClick={() => onModeChange(mode.id)}
                className={cn(
                  "cursor-pointer rounded-2xl p-3 transition-all duration-300",
                  isSelected ? "bg-primary/10 border-white/5 shadow-inner" : "hover:bg-white/5"
                )}
              >
                <div className="flex items-center justify-between w-full">
                  <div className="flex items-center gap-3">
                    <div className={cn("p-2 rounded-xl bg-background shadow-lg", mode.color)}>
                      <ModeIcon className="w-4 h-4" />
                    </div>
                    <div>
                      <p className={cn("font-bold text-sm tracking-tight", isSelected ? "text-primary" : "text-foreground")}>{mode.label}</p>
                      <p className="text-[10px] text-muted-foreground/80 font-medium leading-tight">{mode.description}</p>
                    </div>
                  </div>
                  {isSelected && (
                    <motion.div layoutId="mode-check">
                      <Check className="w-4 h-4 text-primary" />
                    </motion.div>
                  )}
                </div>
              </DropdownMenuItem>
            );
          })}

          {customModes.length > 0 && (
            <>
              <DropdownMenuSeparator className="bg-white/5 my-1" />
              <DropdownMenuLabel className="px-3 py-1 text-[10px] font-black tracking-widest uppercase opacity-40">CUSTOM</DropdownMenuLabel>
            </>
          )}

          {customModes.map((mode) => {
            const CustomIcon = iconMap[mode.icon] || Sparkles;
            const isSelected = mode.id === selectedMode;
            return (
              <DropdownMenuItem
                key={mode.id}
                onClick={() => onModeChange(mode.id as ChatMode)}
                className={cn(
                  "cursor-pointer rounded-2xl p-3 transition-all duration-300",
                  isSelected ? "bg-primary/10 border-white/5 shadow-inner" : "hover:bg-white/5"
                )}
              >
                <div className="flex items-center justify-between w-full">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-xl bg-background shadow-lg text-primary">
                      <CustomIcon className="w-4 h-4" />
                    </div>
                    <div>
                      <p className={cn("font-bold text-sm tracking-tight", isSelected ? "text-primary" : "text-foreground")}>{mode.name}</p>
                      <p className="text-[10px] text-muted-foreground/80 font-medium leading-tight">Custom mode</p>
                    </div>
                  </div>
                  {isSelected && (
                    <motion.div layoutId="mode-check">
                      <Check className="w-4 h-4 text-primary" />
                    </motion.div>
                  )}
                </div>
              </DropdownMenuItem>
            );
          })}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
