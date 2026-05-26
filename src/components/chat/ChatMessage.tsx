// ChatMessage component - Display individual chat messages
import { User, Copy, Check, FileText, Pencil, RefreshCw, Send, Brain, ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { useState, useRef } from 'react';
import { toast } from 'sonner';
import type { Message, ChatMood } from '@/types/chat';
import { MOOD_CONFIGS } from '@/types/chat';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Logo } from '@/components/Logo';
import { TTSPlayer } from './TTSPlayer';

interface ChatMessageProps {
  message: Message;
  isStreaming?: boolean;
  onEdit?: (messageId: string, newText: string) => void;
  onRetry?: (messageId: string) => void;
  messageIndex?: number;
  mood?: ChatMood;
  isDangerous?: boolean;
}

function CodeBlock({ children, inline }: { children: string; inline?: boolean }) {
  const [copied, setCopied] = useState(false);

  const handleCopyCode = async () => {
    try {
      await navigator.clipboard.writeText(children);
      setCopied(true);
      toast.success('Code copied!');
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error('Copy failed');
    }
  };

  if (inline) {
    return (
      <code className="bg-primary/10 px-1.5 py-0.5 rounded text-[11px] font-mono font-semibold text-primary">
        {children}
      </code>
    );
  }

  return (
    <div className="relative group my-2">
      <Button
        variant="secondary"
        size="sm"
        onClick={handleCopyCode}
        className="absolute right-1.5 top-1.5 z-10 h-6 px-2 text-[10px] opacity-0 group-hover:opacity-100 transition-opacity"
      >
        {copied ? (
          <><Check className="w-3 h-3 mr-1" /> Copied</>
        ) : (
          <><Copy className="w-3 h-3 mr-1" /> Copy</>
        )}
      </Button>
      <pre className="bg-muted/80 p-3 pt-8 rounded-lg overflow-x-auto max-w-full" style={{ fontSize: '11px' }}>
        <code className="text-[11px] font-mono block leading-relaxed whitespace-pre-wrap break-words" style={{ wordWrap: 'break-word', overflowWrap: 'anywhere' }}>{children}</code>
      </pre>
    </div>
  );
}

export function ChatMessage({ message, isStreaming = false, onEdit, onRetry, messageIndex, mood, isDangerous = false }: ChatMessageProps) {
  const [copied, setCopied] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState('');
  const [thinkingExpanded, setThinkingExpanded] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const editInputRef = useRef<HTMLInputElement>(null);
  const isUser = message.role === 'user';

  const textParts = message.parts.filter(part => part.text);
  const imageParts = message.parts.filter(part => part.inlineData);
  const rawText = textParts.map(part => part.text).join(' ');

  // Parse thinking content
  const thinkingMatch = rawText.match(/<thinking>([\s\S]*?)<\/thinking>/i);
  const thinkingContent = thinkingMatch ? thinkingMatch[1].trim() : null;
  const text = rawText.replace(/<thinking>[\s\S]*?<\/thinking>/gi, '').trim();

  // Fold threshold: only USER long messages get collapsed
  const FOLD_CHAR_LIMIT = 120;
  const shouldFold = isUser && !isStreaming && text.length > FOLD_CHAR_LIMIT;
  const displayText = shouldFold && !isExpanded ? text.slice(0, FOLD_CHAR_LIMIT) + '...' : text;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      toast.success('Message copied');
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error('Copy failed');
    }
  };

  const handleEditStart = () => {
    setEditText(text);
    setIsEditing(true);
    setTimeout(() => editInputRef.current?.focus(), 50);
  };

  const handleEditSubmit = () => {
    if (editText.trim() && editText.trim() !== text.trim()) {
      onEdit?.(message.id, editText.trim());
    }
    setIsEditing(false);
  };

  const handleEditKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleEditSubmit();
    } else if (e.key === 'Escape') {
      setIsEditing(false);
    }
  };

  return (
    <div
      className={cn(
        'flex gap-3 mb-3 group w-full',
        isUser ? 'flex-row-reverse' : 'flex-row'
      )}
    >
      <div className={cn(
        "flex-shrink-0 w-8 h-8 rounded-full overflow-hidden flex items-center justify-center",
        isUser ? "bg-primary" : "bg-primary/10"
      )}>
        {isUser ? (
          <User className="w-3.5 h-3.5 text-primary-foreground" />
        ) : (
          <Logo size="xs" fit />
        )}
      </div>
      
      <div className={cn(
        "flex flex-col gap-0.5 max-w-[92%] md:max-w-[85%] min-w-0",
        isUser ? "items-end" : "items-start"
      )}>
        {/* Thinking Process Display — above message */}
        {!isUser && thinkingContent && (
          <div className="w-full mb-1">
            <button
              onClick={() => setThinkingExpanded(!thinkingExpanded)}
              className="flex items-center gap-1.5 text-[11px] text-indigo-400 font-medium hover:text-indigo-300 transition-colors"
            >
              <Brain className="w-3 h-3" />
              <span>Thinking Process</span>
              <ChevronDown className={cn("w-3 h-3 transition-transform", thinkingExpanded && "rotate-180")} />
            </button>
            {thinkingExpanded && (
              <div className="mt-1 p-2.5 rounded-xl bg-indigo-500/5 border border-indigo-500/10 text-[12px] text-indigo-300/80 leading-relaxed whitespace-pre-wrap">
                {thinkingContent}
              </div>
            )}
          </div>
        )}

        <div
          className={cn(
            'rounded-2xl px-3 py-2 break-words select-text overflow-hidden max-w-full border transition-all duration-500',
            isUser
              ? 'bg-primary text-primary-foreground rounded-tr-sm'
              : 'bg-card text-foreground rounded-tl-sm ai-message-glow',
            isDangerous && !isUser && 'animate-[danger-glow_1.5s_ease-in-out_infinite] border-destructive/40'
          )}
          style={{
            wordWrap: 'break-word',
            overflowWrap: 'anywhere',
            wordBreak: 'break-word',
            fontSize: '14px',
            ...(mood && !isUser ? {
              boxShadow: `0 0 12px ${MOOD_CONFIGS[mood]?.glowColor || 'transparent'}20, 0 0 24px ${MOOD_CONFIGS[mood]?.glowColor || 'transparent'}10`,
            } : {}),
          }}
        >
          {imageParts.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-2">
              {imageParts.map((part, index) => (
                <div key={index} className="relative rounded-lg overflow-hidden max-w-full">
                  {part.inlineData?.mimeType.startsWith('image/') ? (
                    <img 
                      src={`data:${part.inlineData.mimeType};base64,${part.inlineData.data}`}
                      alt="Uploaded"
                      className="max-w-full h-auto"
                    />
                  ) : (
                    <div className="flex items-center gap-1.5 p-2 bg-background">
                      <FileText className="w-3 h-3 shrink-0" />
                      <span className="text-xs truncate">File</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {text && (
            isUser ? (
              isEditing ? (
                <div className="flex items-center gap-2 min-w-0">
                  <input
                    ref={editInputRef}
                    type="text"
                    value={editText}
                    onChange={(e) => setEditText(e.target.value)}
                    onKeyDown={handleEditKeyDown}
                    className="flex-1 min-w-0 bg-primary-foreground/20 text-primary-foreground rounded-lg px-2 py-1 text-sm outline-none border border-primary-foreground/30 focus:border-primary-foreground/60"
                  />
                  <Button
                    type="button"
                    size="icon"
                    variant="ghost"
                    onClick={handleEditSubmit}
                    className="h-6 w-6 shrink-0 text-primary-foreground hover:bg-primary-foreground/20"
                  >
                    <Send className="w-3.5 h-3.5" />
                  </Button>
                </div>
              ) : (
                <div className="flex flex-col relative">
                  <p className="text-sm whitespace-pre-wrap leading-relaxed select-text break-words">{displayText}</p>
                  {shouldFold && !isExpanded && (
                    <div className="absolute bottom-6 left-0 right-0 h-8 bg-gradient-to-t from-primary to-transparent pointer-events-none" />
                  )}
                  {shouldFold && (
                    <button
                      onClick={() => setIsExpanded(!isExpanded)}
                      className="mt-2 self-start text-xs font-bold text-primary-foreground bg-primary-foreground/20 hover:bg-primary-foreground/30 px-4 py-1.5 rounded-full transition-colors border border-primary-foreground/30 z-10"
                    >
                      {isExpanded ? 'Show less' : 'Read more...'}
                    </button>
                  )}
                </div>
              )
            ) : (
              <div className="prose prose-sm dark:prose-invert max-w-none select-text leading-relaxed break-words"
                style={{ wordWrap: 'break-word', overflowWrap: 'anywhere', wordBreak: 'break-word', maxWidth: '100%', fontSize: '14px' }}
              >
                <ReactMarkdown
                  remarkPlugins={[remarkGfm]}
                  components={{
                    strong: ({ children }) => <strong className="font-extrabold text-foreground" style={{ fontWeight: 800 }}>{children}</strong>,
                    em: ({ children }) => <em className="italic text-foreground/90">{children}</em>,
                    h1: ({ children }) => <h1 className="text-xl font-black mt-4 mb-3 text-foreground">{children}</h1>,
                    h2: ({ children }) => <h2 className="text-lg font-bold mt-3 mb-2 text-foreground">{children}</h2>,
                    h3: ({ children }) => <h3 className="text-base font-bold mt-2 mb-1.5 text-foreground">{children}</h3>,
                    p: ({ children }) => <p className="mb-3 leading-relaxed text-foreground">{children}</p>,
                    ul: ({ children }) => <ul className="list-disc pl-5 mb-3 space-y-1">{children}</ul>,
                    ol: ({ children }) => <ol className="list-decimal pl-5 mb-3 space-y-1">{children}</ol>,
                    li: ({ children }) => <li className="leading-relaxed text-foreground">{children}</li>,
                    code: ({ inline, children }: any) => {
                      const codeString = String(children).replace(/\n$/, '');
                      return <CodeBlock inline={inline}>{codeString}</CodeBlock>;
                    },
                    pre: ({ children }) => <>{children}</>,
                    blockquote: ({ children }) => (
                      <blockquote className="pl-4 my-3 italic text-muted-foreground bg-muted/30 py-2 rounded-r">{children}</blockquote>
                    ),
                    a: ({ href, children }) => (
                      <a href={href} target="_blank" rel="noopener noreferrer" className="text-primary underline font-semibold hover:text-primary/80 transition-colors">{children}</a>
                    ),
                    hr: () => <hr className="my-4 border-t-2" />,
                    table: ({ children }) => (
                      <div className="overflow-x-auto my-3"><table className="min-w-full border-collapse">{children}</table></div>
                    ),
                    thead: ({ children }) => <thead className="bg-muted">{children}</thead>,
                    tbody: ({ children }) => <tbody>{children}</tbody>,
                    tr: ({ children }) => <tr className="border-b">{children}</tr>,
                    th: ({ children }) => <th className="px-3 py-2 text-left font-bold">{children}</th>,
                    td: ({ children }) => <td className="px-3 py-2">{children}</td>,
                  }}
                >{text}</ReactMarkdown>
              </div>
            )
          )}
        </div>

        {/* Action buttons */}
        {text && (
          <div className={cn(
            'flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity',
            isUser ? 'mr-1 justify-end' : 'ml-1'
          )}>
            {isUser && !isEditing && onEdit && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleEditStart}
                className="h-6 px-2 text-[10px] rounded-full"
              >
                <Pencil className="w-3 h-3 mr-1" /> Edit
              </Button>
            )}
            {!isUser && (
              <>
                <Button variant="ghost" size="sm" onClick={handleCopy} className="h-6 px-2 text-[10px] rounded-full">
                  {copied ? <><Check className="w-3 h-3 mr-1" /> Copied</> : <><Copy className="w-3 h-3 mr-1" /> Copy</>}
                </Button>
                <TTSPlayer text={text} />
                {onRetry && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onRetry(message.id)}
                    className="h-6 px-2 text-[10px] rounded-full text-muted-foreground hover:text-primary"
                  >
                    <RefreshCw className="w-3 h-3 mr-1" /> Retry
                  </Button>
                )}
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
