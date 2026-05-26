// ChatInput component - Input area for sending messages with file upload support
import { useState, useRef, useEffect, type FormEvent, type ChangeEvent } from 'react';
import { Send, Loader2, Paperclip, X, Square, AlertTriangle, Headphones } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import type { UploadedFile, ChatMood } from '@/types/chat';
import { ModeSelector, type ChatMode } from './ModeSelector';
import { MoodSelector } from './MoodSelector';
import { VoiceInput } from './VoiceInput';
import { cn } from '@/lib/utils';
import { motion } from 'motion/react';
import { isDangerousQuestion } from '@/utils/dangerDetector';

interface ChatInputProps {
  onSend: (message: string, files?: UploadedFile[]) => void;
  onStop?: () => void;
  onVoiceTranscript?: (text: string) => void;
  onVoiceTalk?: () => void;
  disabled?: boolean;
  isLoading?: boolean;
  selectedMode: ChatMode;
  onModeChange: (mode: ChatMode) => void;
  selectedMood: ChatMood;
  onMoodChange: (mood: ChatMood) => void;
  moodEnabled?: boolean;
  customMoods?: { id: string; name: string; icon: string; prompt: string }[];
  customModes?: { id: string; name: string; icon: string; instructions: string }[];
  cursorStyle?: import('@/hooks/useAppSettings').CursorStyle;
}

export function ChatInput({
  onSend,
  onStop,
  onVoiceTranscript,
  onVoiceTalk,
  disabled,
  isLoading,
  selectedMode,
  onModeChange,
  selectedMood,
  onMoodChange,
  moodEnabled = true,
  customMoods = [],
  customModes = [],
  cursorStyle = 'beam',
}: ChatInputProps) {
  const [message, setMessage] = useState('');
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [cursorPos, setCursorPos] = useState(0);
  const [isFocused, setIsFocused] = useState(false);
  const textareaRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const measureRef = useRef<HTMLSpanElement>(null);
  const [cursorLeft, setCursorLeft] = useState(0);

  // Update custom cursor position
  useEffect(() => {
    if (measureRef.current && cursorStyle !== 'beam' && isFocused) {
      const textBeforeCursor = message.slice(0, cursorPos);
      measureRef.current.textContent = textBeforeCursor || ' ';
      setCursorLeft(measureRef.current.offsetWidth);
    }
  }, [message, cursorPos, cursorStyle, isFocused]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setMessage(e.target.value);
    setCursorPos(e.target.selectionStart || e.target.value.length);
  };

  const handleSelect = (e: React.SyntheticEvent<HTMLInputElement>) => {
    const target = e.target as HTMLInputElement;
    setCursorPos(target.selectionStart || 0);
  };

  const handleFileSelect = async (e: ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const newFiles: UploadedFile[] = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      
      // Check file size (max 4MB)
      if (file.size > 4 * 1024 * 1024) {
        toast.error(`File ${file.name} is too large. Max size is 4MB.`);
        continue;
      }

      // Check file type
      const allowedTypes = [
        'image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp',
        'application/pdf', 'text/plain', 
        'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
      ];

      if (!allowedTypes.includes(file.type)) {
        toast.error(`File type ${file.type} is not supported.`);
        continue;
      }

      // Read file as base64
      const reader = new FileReader();
      const fileData = await new Promise<UploadedFile>((resolve) => {
        reader.onload = () => {
          const base64 = reader.result as string;
          const uploadedFile: UploadedFile = {
            name: file.name,
            type: file.type,
            data: base64.split(',')[1], // Remove data:image/jpeg;base64, prefix
            mimeType: file.type,
          };

          // Add preview for images
          if (file.type.startsWith('image/')) {
            uploadedFile.preview = base64;
          }

          resolve(uploadedFile);
        };
        reader.readAsDataURL(file);
      });

      newFiles.push(fileData);
    }

    setUploadedFiles(prev => [...prev, ...newFiles]);
    
    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }

    if (newFiles.length > 0) {
      toast.success(`${newFiles.length} file(s) uploaded successfully`);
    }
  };

  const removeFile = (index: number) => {
    setUploadedFiles(prev => {
      const newFiles = [...prev];
      // Revoke object URL if it exists
      if (newFiles[index].preview) {
        URL.revokeObjectURL(newFiles[index].preview!);
      }
      newFiles.splice(index, 1);
      return newFiles;
    });
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if ((message.trim() || uploadedFiles.length > 0) && !disabled && !isLoading) {
      onSend(message.trim(), uploadedFiles.length > 0 ? uploadedFiles : undefined);
      setMessage('');
      
      // Clean up file previews
      uploadedFiles.forEach(file => {
        if (file.preview) {
          URL.revokeObjectURL(file.preview);
        }
      });
      setUploadedFiles([]);
    }
  };

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setMessage(e.target.value);
  };

  const getPlaceholder = () => {
    return 'Ask anything...';
  };

  return (
    <div className="z-50 w-full pt-2 pb-5 px-4 safe-bottom">
      <form onSubmit={handleSubmit} className="w-full max-w-4xl mx-auto space-y-2">
        {/* File previews */}
        {uploadedFiles.length > 0 && (
          <div className="flex flex-wrap gap-2 px-2 pb-1">
            {uploadedFiles.map((file, index) => (
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                key={index}
                className="relative group"
              >
                {file.preview ? (
                  <div className="relative w-10 h-10 rounded-xl overflow-hidden shadow bg-card">
                    <img
                      src={file.preview}
                      alt={file.name}
                      className="w-full h-full object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => removeFile(index)}
                      className="absolute top-0.5 right-0.5 bg-black/60 backdrop-blur rounded-md p-0.5 text-white hover:bg-destructive transition-colors"
                    >
                      <X className="w-2.5 h-2.5 stroke-[3]" />
                    </button>
                  </div>
                ) : (
                  <div className="relative flex items-center gap-1.5 px-2 py-1 bg-card rounded-xl shadow">
                    <Paperclip className="w-3 h-3 text-primary shrink-0" />
                    <span className="text-[10px] font-medium max-w-[60px] truncate">{file.name}</span>
                    <button
                      type="button"
                      onClick={() => removeFile(index)}
                      className="hover:text-destructive transition-colors shrink-0"
                    >
                      <X className="w-2.5 h-2.5" />
                    </button>
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        )}

        {/* Mood selector — hidden when disabled */}
        {moodEnabled && (
          <MoodSelector
            selectedMood={selectedMood}
            onMoodChange={onMoodChange}
            disabled={disabled || isLoading}
            customMoods={customMoods}
          />
        )}

        {/* Danger Zone Indicator */}
        {isDangerousQuestion(message) && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-destructive/10 border border-destructive/20 text-destructive text-[10px] font-bold tracking-wide w-fit"
          >
            <AlertTriangle className="w-3 h-3" />
            <span>DANGER ZONE</span>
          </motion.div>
        )}

        {/* Slim Input Container — Boundary back with shadow/glass */}
        <div className={cn(
          "rounded-full px-2 py-1.5 flex items-center gap-2 shadow-lg focus-within:ring-1 focus-within:ring-primary/30 transition-all duration-300 hover:shadow-primary/5 group bg-card/70 backdrop-blur-md",
          isDangerousQuestion(message) && "ring-1 ring-destructive/40 shadow-destructive/10"
        )}>
          {/* Mode selector */}
          <div className="shrink-0">
            <ModeSelector
              selectedMode={selectedMode}
              onModeChange={onModeChange}
              disabled={disabled || isLoading}
              customModes={customModes}
            />
          </div>

          {/* File upload button */}
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={() => fileInputRef.current?.click()}
            disabled={disabled || isLoading}
            className="h-7 w-7 shrink-0 hover:bg-primary/10 rounded-full transition-all"
          >
            <Paperclip className="w-3.5 h-3.5 text-muted-foreground group-focus-within:text-primary transition-colors" />
          </Button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            onChange={handleFileSelect}
            className="hidden"
          />

          {/* Message input with custom cursor */}
          <div className="flex-1 min-w-0 relative">
            {/* Hidden measurement span */}
            <span
              ref={measureRef}
              className="absolute invisible whitespace-pre text-sm font-medium px-2 py-1"
              style={{ fontSize: '14px' }}
            />
            <input
              ref={textareaRef}
              type="text"
              value={message}
              onChange={handleInputChange}
              onSelect={handleSelect}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSubmit(e as any);
                }
                // Update cursor position after key press
                setTimeout(() => {
                  if (textareaRef.current) {
                    setCursorPos(textareaRef.current.selectionStart || 0);
                  }
                }, 0);
              }}
              placeholder={getPlaceholder()}
              disabled={disabled || isLoading}
              className={cn(
                "w-full min-w-0 bg-transparent border-none outline-none text-sm font-medium placeholder:text-muted-foreground/50 px-2 py-1",
                cursorStyle !== 'beam' && 'caret-transparent'
              )}
              style={{
                fontSize: '14px',
                caretColor: cursorStyle === 'beam' ? 'hsl(var(--primary))' : 'transparent',
              }}
            />
            {/* Custom cursor overlay — Premium 4 styles */}
            {cursorStyle !== 'beam' && isFocused && (
              <span
                className={cn(
                  "absolute pointer-events-none",
                  cursorStyle === 'block' && "w-[8px] h-[1.2em] top-1/2 -translate-y-1/2 bg-primary/60 rounded-sm animate-cursor-blink",
                  cursorStyle === 'underline' && "h-[2px] w-[10px] bottom-[4px] bg-primary rounded-full animate-cursor-blink",
                  cursorStyle === 'glow' && "w-[2px] h-[1.2em] top-1/2 -translate-y-1/2 bg-primary animate-cursor-glow shadow-[0_0_8px_2px_hsl(var(--primary))]"
                )}
                style={{ left: `${cursorLeft}px` }}
              />
            )}
          </div>

          {/* Voice input */}
          <VoiceInput
            onTranscript={(text) => {
              if (onVoiceTranscript) {
                onVoiceTranscript(text);
              } else {
                setMessage((prev) => (prev ? prev + ' ' + text : text));
              }
            }}
            disabled={disabled || isLoading}
          />

          {/* Voice Talk Button */}
          {onVoiceTalk && (
            <button
              type="button"
              onClick={onVoiceTalk}
              disabled={disabled || isLoading}
              className={cn(
                'flex items-center justify-center w-7 h-7 rounded-full shrink-0 transition-all duration-300',
                'bg-gradient-to-br from-red-500 via-orange-500 to-purple-500 text-white shadow-md hover:shadow-lg hover:scale-105',
                (disabled || isLoading) && 'opacity-50 cursor-not-allowed'
              )}
              title="Voice Talk"
            >
              <Headphones className="w-3.5 h-3.5" />
            </button>
          )}

          {/* Send/Stop button */}
          {isLoading ? (
            <Button
              type="button"
              size="icon"
              onClick={onStop}
              className="h-7 w-7 shrink-0 rounded-full shadow transition-all bg-destructive hover:bg-destructive/90 text-white"
            >
              <Square className="w-3.5 h-3.5 fill-current" />
            </Button>
          ) : (
            <Button
              type="submit"
              size="icon"
              disabled={disabled || (!message.trim() && uploadedFiles.length === 0)}
              className={cn(
                "h-7 w-7 shrink-0 rounded-full shadow transition-all",
                (message.trim() || uploadedFiles.length > 0)
                  ? "bg-primary hover:bg-primary/90 scale-100 text-primary-foreground"
                  : "bg-muted scale-95 opacity-60 text-muted-foreground"
              )}
            >
              <Send className={cn("w-3.5 h-3.5 fill-current", message.trim() && "translate-x-px -translate-y-px")} />
            </Button>
          )}
        </div>
      </form>
    </div>
  );
}
