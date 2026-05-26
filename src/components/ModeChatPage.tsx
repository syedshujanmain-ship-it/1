// Shared ModeChatPage component - Clean chat interface for all modes
import { useState, useRef, useEffect } from 'react';
import { Send, Loader2, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import type { Message } from '@/types/chat';
import { ChatService } from '@/services/chat';
import { useNavigate } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import { Logo } from '@/components/Logo';
import { useLanguage } from '@/contexts/LanguageContext';

interface ModeChatPageProps {
  title: string;
  placeholder?: string;
  emptyTitle?: string;
  emptyDescription?: string;
  examples?: string[];
  sendButtonText?: string;
  systemModeFlags: {
    deepSearch?: boolean;
    proMode?: boolean;
    webSearch?: boolean;
    showThinking?: boolean;
    realTimeMode?: boolean;
    codeMode?: boolean;
    builderMode?: boolean;
    studyMode?: boolean;
    fastMode?: boolean;
    redWhaleMode?: boolean;
    stepByStepMode?: boolean;
    whaleCodeMode?: boolean;
    buildWhaleMode?: boolean;
    howToBuildMode?: boolean;
    planningMode?: boolean;
    timetableMode?: boolean;
    rwIntelligenceMode?: boolean;
    rwV1SuperMode?: boolean;
    webSecretMode?: boolean;
    hackMasterMode?: boolean;
  };
}

export function ModeChatPage({
  title,
  placeholder = 'Ask anything...',
  emptyTitle,
  emptyDescription,
  examples = [],
  sendButtonText = 'Send',
  systemModeFlags,
}: ModeChatPageProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [streamingMessage, setStreamingMessage] = useState('');
  const [abortController, setAbortController] = useState<AbortController | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const streamingTextRef = useRef('');
  const navigate = useNavigate();
  const { language } = useLanguage();

  const displayTitle = emptyTitle || title;

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages, streamingMessage]);

  useEffect(() => { inputRef.current?.focus(); }, []);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;
    const userMessage: Message = {
      id: `user_${Date.now()}`,
      role: 'user',
      parts: [{ text: input.trim() }],
      timestamp: new Date(),
    };
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInput('');
    setIsLoading(true);
    streamingTextRef.current = '';
    setStreamingMessage('');
    const controller = new AbortController();
    setAbortController(controller);
    const contents = newMessages.map(msg => ({ role: msg.role, parts: msg.parts }));

    ChatService.streamChatSSE(
      contents,
      systemModeFlags.deepSearch || false,
      systemModeFlags.proMode || false,
      systemModeFlags.webSearch || false,
      systemModeFlags.showThinking || false,
      systemModeFlags.realTimeMode || false,
      systemModeFlags.codeMode || false,
      systemModeFlags.builderMode || false,
      systemModeFlags.studyMode || false,
      systemModeFlags.fastMode || false,
      systemModeFlags.redWhaleMode || false,
      systemModeFlags.stepByStepMode || false,
      systemModeFlags.whaleCodeMode || false,
      systemModeFlags.buildWhaleMode || false,
      'android',
      systemModeFlags.howToBuildMode || false,
      systemModeFlags.planningMode || false,
      systemModeFlags.timetableMode || false,
      systemModeFlags.rwIntelligenceMode || false,
      systemModeFlags.rwV1SuperMode || false,
      systemModeFlags.webSecretMode || false,
      systemModeFlags.hackMasterMode || false,
      language,
      'normal',
      'custom',
      controller.signal,
      (chunk: string) => { streamingTextRef.current = chunk; setStreamingMessage(chunk); },
      () => {
        const finalMessage: Message = {
          id: `model_${Date.now()}`,
          role: 'model',
          parts: [{ text: streamingTextRef.current }],
          timestamp: new Date(),
        };
        setMessages(prev => [...prev, finalMessage]);
        setStreamingMessage('');
        setIsLoading(false);
        setAbortController(null);
      },
      (error: string) => {
        if (error !== 'ABORTED') {
          toast.error(error, { duration: 6000, style: { whiteSpace: 'pre-line' } });
        }
        setIsLoading(false);
        setStreamingMessage('');
        setAbortController(null);
      }
    );
  };

  const handleStop = () => {
    if (abortController) {
      abortController.abort();
      setIsLoading(false);
      setAbortController(null);
    }
  };

  return (
    <div className="flex flex-col h-full bg-background">
      {/* Header */}
      <div className="shrink-0 flex items-center justify-between h-10 px-3 bg-background/80 backdrop-blur-xl">
        <div className="flex items-center gap-2">
          <Button onClick={() => navigate('/')} variant="ghost" size="icon" className="h-7 w-7 rounded-full hover:bg-primary/10">
            <ArrowLeft className="h-3.5 w-3.5 text-muted-foreground" />
          </Button>
          <h1 className="text-xs font-bold text-foreground">{title}</h1>
        </div>
      </div>

      {/* Messages - Clean floating card */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-3 mx-4 mt-3 mb-2 rounded-3xl bg-card/40 shadow-sm">
        {messages.length === 0 && !streamingMessage && (
          <div className="flex flex-col items-center justify-center h-full text-center px-4">
            <Logo size="lg" />
            <h2 className="text-base font-black text-foreground mt-2 mb-0.5">{displayTitle}</h2>
            {emptyDescription && (
              <p className="text-[11px] text-muted-foreground max-w-xs leading-relaxed mb-4">
                {emptyDescription}
              </p>
            )}
            {examples.length > 0 && (
              <div className="flex flex-wrap gap-2 justify-center">
                {examples.map((ex) => (
                  <button
                    key={ex}
                    onClick={() => { setInput(ex); inputRef.current?.focus(); }}
                    className="px-3 py-1.5 rounded-full bg-muted/50 text-[11px] font-medium text-muted-foreground hover:bg-primary/10 hover:text-primary transition-colors"
                  >
                    {ex}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {messages.map((message, index) => (
          <div key={index} className={cn(
            'flex gap-3 p-3 rounded-2xl',
            message.role === 'user'
              ? 'bg-primary/10 ml-auto max-w-[85%]'
              : 'bg-card'
          )}>
            <div className="flex-1 overflow-hidden">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-[10px] font-bold text-muted-foreground">
                  {message.role === 'user' ? 'You' : title}
                </span>
              </div>
              <div className="prose prose-sm dark:prose-invert max-w-none">
                <ReactMarkdown
                  components={{
                    code: ({ inline, className, children, ...props }: any) => (
                      inline ? (
                        <code className="bg-muted px-1 py-0.5 rounded text-xs font-mono text-primary" {...props}>{children}</code>
                      ) : (
                        <pre className="bg-muted/70 p-2 rounded-lg overflow-x-auto">
                          <code className="text-xs font-mono" {...props}>{children}</code>
                        </pre>
                      )
                    ),
                  }}
                >
                  {message.parts.map(p => p.text || '').join('\n')}
                </ReactMarkdown>
              </div>
            </div>
          </div>
        ))}

        {streamingMessage && (
          <div className="flex gap-3 p-3 rounded-2xl bg-card">
            <div className="flex-1 overflow-hidden">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-[10px] font-bold text-muted-foreground">{title}</span>
                <div className="flex gap-1 items-center h-4">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary animate-[typing-pulse_1.4s_ease-in-out_infinite]" style={{ animationDelay: '0ms' }} />
                  <span className="w-1.5 h-1.5 rounded-full bg-primary animate-[typing-pulse_1.4s_ease-in-out_infinite]" style={{ animationDelay: '200ms' }} />
                  <span className="w-1.5 h-1.5 rounded-full bg-primary animate-[typing-pulse_1.4s_ease-in-out_infinite]" style={{ animationDelay: '400ms' }} />
                </div>
              </div>
              <div className="prose prose-sm dark:prose-invert max-w-none">
                <ReactMarkdown
                  components={{
                    code: ({ inline, className, children, ...props }: any) => (
                      inline ? (
                        <code className="bg-muted px-1 py-0.5 rounded text-xs font-mono text-primary" {...props}>{children}</code>
                      ) : (
                        <pre className="bg-muted/70 p-2 rounded-lg overflow-x-auto">
                          <code className="text-xs font-mono" {...props}>{children}</code>
                        </pre>
                      )
                    ),
                  }}
                >
                  {streamingMessage}
                </ReactMarkdown>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Input - Floating rounded-full style matching main chat */}
      <div className="shrink-0 z-50 w-full bg-gradient-to-t from-background via-background/95 to-transparent pt-2 pb-5 px-4 safe-bottom">
        <div className="max-w-4xl mx-auto">
          <div className="rounded-full px-2 py-1.5 flex items-center gap-2 shadow-lg focus-within:ring-1 focus-within:ring-primary/30 transition-all duration-300 hover:shadow-primary/5 bg-card/70 backdrop-blur-md">
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
              placeholder={placeholder}
              disabled={isLoading}
              className="flex-1 min-w-0 bg-transparent border-none outline-none text-sm font-medium placeholder:text-muted-foreground/50 px-2 py-1"
              style={{ fontSize: '14px' }}
            />
            {isLoading ? (
              <Button onClick={handleStop} size="icon" className="h-7 w-7 shrink-0 rounded-full bg-destructive hover:bg-destructive/90 text-white shadow transition-all">
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              </Button>
            ) : (
              <Button onClick={handleSend} disabled={!input.trim()} size="icon" className={cn(
                "h-7 w-7 shrink-0 rounded-full shadow transition-all",
                input.trim()
                  ? "bg-primary hover:bg-primary/90 scale-100 text-primary-foreground"
                  : "bg-muted scale-95 opacity-60 text-muted-foreground"
              )}>
                <Send className="h-3.5 w-3.5" />
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
