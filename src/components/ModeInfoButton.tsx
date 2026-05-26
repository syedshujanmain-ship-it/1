import { useState } from 'react';
import { Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

interface ModeInfo {
  id: string;
  name: string;
  desc: string;
}

const modesInfo: ModeInfo[] = [
  { id: 'all', name: 'All in One', desc: 'Every ability combined — the ultimate mode' },
  { id: 'redwhale', name: 'RW SUPER', desc: 'Most powerful unrestricted mode — raw truth' },
  { id: 'auto', name: 'Auto', desc: 'Smart adaptive — detects best expertise for your question' },
  { id: 'pro', name: 'PRO', desc: 'Deep expert — encyclopedia-level detailed answers' },
  { id: 'elite', name: 'ELITE', desc: 'Ultra-advanced reasoning — beyond expert level' },
  { id: 'deep', name: 'DEEP', desc: 'Research analyst — thorough multi-source analysis' },
  { id: 'code', name: 'CODE', desc: 'Staff engineer — production-grade code & architecture' },
  { id: 'hacker', name: 'HACKER', desc: 'Security expert — pentesting, exploits, cybersecurity' },
  { id: 'scientist', name: 'SCIENTIST', desc: 'Research scientist — discoveries, theories, experiments' },
  { id: 'creator', name: 'CREATOR', desc: 'Creative genius — stories, scripts, content, art' },
  { id: 'builder', name: 'HOW TO BUILD', desc: 'Build master — complete guides with materials & steps' },
  { id: 'study', name: 'STUDY', desc: 'Greatest teacher — makes ANY concept crystal clear' },
  { id: 'think', name: 'PLANNING', desc: 'Strategist — plans, timelines, budgets, risk analysis' },
  { id: 'trader', name: 'TRADER', desc: 'Finance expert — markets, crypto, trading strategies' },
  { id: 'web', name: 'WEB SECRET', desc: 'Web explorer — hidden sites, secret platforms, dark web' },
  { id: 'rtm', name: 'RTM', desc: 'Live intel — real-time news, trends, events' },
  { id: 'fast', name: 'FAST', desc: 'Speed demon — ultra-concise, zero fluff answers' },
  { id: 'stepbystep', name: 'STEP BY STEP', desc: 'Direct steps — numbered actions only' },
  { id: 'normal', name: 'NORMAL', desc: 'Balanced mode — standard friendly chat' },
];

export function ModeInfoButton({ className }: { className?: string }) {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 rounded-full hover:bg-primary/10 transition-all"
        >
          <Info className="w-4 h-4 text-muted-foreground" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-[calc(100%-2rem)] md:max-w-md max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-sm font-bold">Mode Information</DialogTitle>
        </DialogHeader>
        <div className="space-y-2 pt-2">
          {modesInfo.map((mode) => (
            <div key={mode.id} className="p-2 rounded-xl bg-muted/30 hover:bg-muted/50 transition-colors">
              <p className="text-xs font-bold text-primary">{mode.name}</p>
              <p className="text-[11px] text-muted-foreground leading-tight">{mode.desc}</p>
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}
