// ChatHistory - Stores and manages recent chats
import { useState, useEffect } from 'react';
import { Menu, Trash2, Clock, Code2, FolderOpen, Globe, Shield, FileArchive, Rocket, Zap, Brain, GraduationCap, Hammer, ListOrdered, Sparkles, Crown, Radio, Waves, Smile, Heart, Flame, Star, Ghost, Skull } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import type { Message } from '@/types/chat';

const iconMap: Record<string, React.ElementType> = {
  Zap, Brain, Globe, Crown, Rocket, Hammer, GraduationCap, Radio, Sparkles, Waves, Smile, Heart, Flame, Star, Ghost, Skull,
};

interface ChatSession {
  id: string;
  title: string;
  messages: Message[];
  createdAt: number;
  expiresAt: number;
}

interface CustomModeItem {
  id: string;
  name: string;
  instructions: string;
  icon: string;
}

interface ChatHistoryProps {
  currentMessages: Message[];
  onLoadChat: (messages: Message[]) => void;
  onNewChat: () => void;
  customModes?: CustomModeItem[];
  tempChatEnabled?: boolean;
}

export function ChatHistory({ currentMessages, onLoadChat, onNewChat, customModes = [], tempChatEnabled = false }: ChatHistoryProps) {
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();

  // Load sessions from localStorage
  useEffect(() => {
    const loadSessions = () => {
      const stored = localStorage.getItem('redwhale_chat_sessions');
      if (stored) {
        try {
          const parsed: ChatSession[] = JSON.parse(stored);
          const now = Date.now();
          
          // Filter out expired sessions (older than 10 minutes)
          const validSessions = parsed.filter(session => session.expiresAt > now).map(session => ({
            ...session,
            // Convert ISO strings back to Date objects for messages
            messages: session.messages.map((msg: any) => ({
              ...msg,
              timestamp: msg.timestamp ? new Date(msg.timestamp) : new Date()
            }))
          }));
          
          if (validSessions.length !== parsed.length) {
            // Some sessions expired, update storage
            localStorage.setItem('redwhale_chat_sessions', JSON.stringify(validSessions));
          }
          
          setSessions(validSessions);
        } catch (e) {
          console.error('Failed to load chat sessions:', e);
          localStorage.removeItem('redwhale_chat_sessions');
        }
      }
    };

    loadSessions();
    
    // Check for expired sessions every 30 seconds
    const interval = setInterval(loadSessions, 30000);
    
    return () => clearInterval(interval);
  }, []);

  // Save current chat as a session
  const saveCurrentChat = () => {
    if (currentMessages.length === 0) return;
    if (tempChatEnabled) return; // Don't save in temp chat mode

    try {
      const now = Date.now();
      
      // Convert Date objects to ISO strings for storage
      const messagesToSave = currentMessages.map(msg => ({
        ...msg,
        timestamp: msg.timestamp instanceof Date ? msg.timestamp.toISOString() : msg.timestamp
      }));
      
      const newSession: ChatSession = {
        id: `chat_${now}`,
        title: currentMessages[0]?.parts?.[0]?.text?.substring(0, 50) || 'New Chat',
        messages: messagesToSave as any,
        createdAt: now,
        expiresAt: now + (10 * 60 * 1000), // 10 minutes from now
      };

      const updatedSessions = [newSession, ...sessions].slice(0, 20); // Keep max 20 sessions
      setSessions(updatedSessions);
      localStorage.setItem('redwhale_chat_sessions', JSON.stringify(updatedSessions));
      
      console.log('Chat session saved:', newSession.id);
    } catch (e) {
      console.error('Failed to save chat session:', e);
    }
  };

  // Delete a session
  const deleteSession = (id: string) => {
    const updatedSessions = sessions.filter(s => s.id !== id);
    setSessions(updatedSessions);
    localStorage.setItem('redwhale_chat_sessions', JSON.stringify(updatedSessions));
  };

  // Load a session
  const loadSession = (session: ChatSession) => {
    // Convert ISO strings back to Date objects
    const restoredMessages = session.messages.map((msg: any) => ({
      ...msg,
      timestamp: msg.timestamp ? new Date(msg.timestamp) : new Date()
    }));
    
    onLoadChat(restoredMessages);
    setIsOpen(false);
    console.log('Chat session loaded:', session.id);
  };

  // Start new chat
  const handleNewChat = () => {
    if (currentMessages.length > 0) {
      saveCurrentChat();
    }
    onNewChat();
    setIsOpen(false);
  };

  // Calculate time remaining
  const getTimeRemaining = (expiresAt: number) => {
    const now = Date.now();
    const remaining = expiresAt - now;
    const minutes = Math.floor(remaining / 60000);
    return `${minutes}m`;
  };

const navItems = [
  { path: '/', label: 'Main Chat', icon: Sparkles, color: 'bg-primary text-primary-foreground' },
  { path: '/rw-v1-super', label: 'RW V1 Super', icon: Zap, color: 'bg-gradient-to-r from-red-600 to-orange-600 text-white' },
  { path: '/whale-code', label: 'Whale Code', icon: Code2, color: 'bg-emerald-600 text-white' },
  { path: '/build-whale', label: 'Whale Builder', icon: FolderOpen, color: 'bg-orange-600 text-white' },
  { path: '/how-to-build', label: 'How To Build', icon: Hammer, color: 'bg-violet-600 text-white' },
  { path: '/planning', label: 'Planning', icon: Brain, color: 'bg-blue-600 text-white' },
  { path: '/timetable', label: 'Timetable', icon: ListOrdered, color: 'bg-pink-600 text-white' },
  { path: '/rw-intelligence', label: 'RW Intelligence', icon: Brain, color: 'bg-gradient-to-r from-purple-600 to-pink-600 text-white' },
  { path: '/web-secret', label: 'Web Secret', icon: Globe, color: 'bg-gradient-to-r from-blue-600 to-red-600 text-white' },
  { path: '/hack-master', label: 'Hack Master', icon: Shield, color: 'bg-green-700 text-white' },
  { path: '/world-secrets', label: 'World Secrets', icon: Globe, color: 'bg-slate-700 text-cyan-300' },
  { path: '/zip-whale', label: 'Zip Whale', icon: FileArchive, color: 'bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 text-white' },
  { path: '/nano-red-whale', label: 'Nano Red Whale', icon: Rocket, color: 'bg-gradient-to-r from-red-600 via-orange-600 to-yellow-600 text-white' },
];

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 rounded-full hover:bg-primary/10 transition-colors shrink-0"
          title="Menu"
        >
          <Menu className="w-4 h-4 text-muted-foreground" />
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-96 flex flex-col bg-card/95 backdrop-blur-2xl border-r border-border/50">
        <SheetHeader className="pb-3 border-b border-border/30">
          <div className="flex items-center justify-between">
            <SheetTitle className="text-sm font-bold text-foreground">Menu</SheetTitle>
            {tempChatEnabled && (
              <span className="px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-500 text-[9px] font-bold tracking-wider border border-amber-500/20">
                TEMP MODE
              </span>
            )}
          </div>
        </SheetHeader>
        
        <div className="flex-1 overflow-y-auto py-3">
          <Button onClick={handleNewChat} className="w-full text-xs h-9 mb-3 rounded-xl" variant="default">
            {tempChatEnabled ? '+ New Temp Chat' : '+ New Chat'}
          </Button>
          
          <div className="space-y-1">
            {navItems.map((item) => (
              <Button
                key={item.path}
                onClick={() => { navigate(item.path); setIsOpen(false); }}
                className={`w-full text-xs h-9 ${item.color} rounded-xl font-semibold border-0`}
                variant="secondary"
              >
                <item.icon className="w-3.5 h-3.5 mr-2" />
                {item.label}
              </Button>
            ))}
          </div>

          {/* Custom Modes in Hamburger */}
          {customModes.length > 0 && (
            <>
              <div className="mt-4 mb-2">
                <h3 className="text-xs font-semibold text-muted-foreground">Custom Modes</h3>
              </div>
              <div className="space-y-1">
                {customModes.map((mode) => {
                  const ModeIcon = iconMap[mode.icon] || Sparkles;
                  return (
                    <Button
                      key={mode.id}
                      onClick={() => {
                        // Store instructions in localStorage for chat service to pick up
                        localStorage.setItem('redwhale_custom_mode', mode.id);
                        localStorage.setItem(`redwhale_custom_mode_${mode.id}_instructions`, mode.instructions);
                        toast.success(`${mode.name} mode activated`);
                        setIsOpen(false);
                      }}
                      className="w-full text-xs h-9 bg-gradient-to-r from-primary/20 to-primary/5 text-primary hover:from-primary/30 hover:to-primary/10 rounded-xl font-semibold border border-primary/20"
                      variant="secondary"
                    >
                      <ModeIcon className="w-3.5 h-3.5 mr-2" />
                      {mode.name}
                    </Button>
                  );
                })}
              </div>
            </>
          )}

          <div className="mt-5 mb-2">
            <h3 className="text-xs font-semibold text-muted-foreground">Recent Chats</h3>
            <p className="text-[10px] text-muted-foreground">
              {tempChatEnabled ? 'Temp mode — history not saved' : 'Auto-delete after 10 min'}
            </p>
          </div>

          <div className="space-y-1.5 pb-4">
            {sessions.length === 0 ? (
              <p className="text-xs text-muted-foreground text-center py-6">No recent chats</p>
            ) : (
              sessions.map((session) => (
                <div
                  key={session.id}
                  className="group relative p-2.5 rounded-xl border border-border/40 hover:border-primary/40 transition-all cursor-pointer bg-muted/30"
                  onClick={() => loadSession(session)}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium truncate text-foreground">{session.title}</p>
                      <div className="flex items-center gap-1 mt-1">
                        <Clock className="w-3 h-3 text-muted-foreground" />
                        <span className="text-[10px] text-muted-foreground">{getTimeRemaining(session.expiresAt)} left</span>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={(e) => { e.stopPropagation(); deleteSession(session.id); }}
                    >
                      <Trash2 className="w-3 h-3 text-destructive" />
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
