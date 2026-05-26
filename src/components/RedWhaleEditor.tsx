import { useState, useRef } from 'react';
import { Wand2, Send, Check, Download, Code2, Sparkles, Loader2, FileCode, Github, FileDiff, CheckCircle2, AlertTriangle, Wrench } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { toast } from 'sonner';
import { downloadSourceCode } from '@/utils/downloadSourceCode';
import { validateAllFiles, type ValidationResult } from '@/utils/validateCode';

interface RedWhaleEditorProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface EditorMessage {
  role: 'user' | 'editor';
  content: string;
}

function getActiveAPIKey(): string {
  try {
    const stored = localStorage.getItem('redwhale_custom_api_keys');
    if (stored) {
      const keys = JSON.parse(stored);
      if (keys.length > 0) return keys[0].key;
    }
  } catch { /* ignore */ }
  return '';
}

function getGeminiModel(): string {
  return localStorage.getItem('redwhale_custom_model') || 'gemini-2.5-flash';
}

export function RedWhaleEditor({ open, onOpenChange }: RedWhaleEditorProps) {
  const [prompt, setPrompt] = useState('');
  const [messages, setMessages] = useState<EditorMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const [pendingChanges, setPendingChanges] = useState<Record<string, string> | null>(null);
  const [validation, setValidation] = useState<ValidationResult | null>(null);
  const [applied, setApplied] = useState(false);
  const [pushing, setPushing] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const SYSTEM_PROMPT = `You are the Red Whale Editor — an AI that modifies React + TypeScript + Tailwind CSS + Vite web apps.

The user describes a change. You return COMPLETE file contents for every file that needs to change.

CRITICAL RULES — NO EXCEPTIONS:
1. ALWAYS return COMPLETE file contents. Never use "..." or "// rest unchanged".
2. For each file, start with exactly: // FILE: relative/path/to/file.tsx
3. Wrap each file in \`\`\`tsx code blocks.
4. Only return files that need changes. Do NOT return unchanged files.
5. After all files, write a 1-sentence summary.
6. NEVER truncate code. Every file must be syntactically complete and valid.
7. Check your braces: every { must have a matching }. Every ( must have a matching ).
8. Check JSX tags: every opening tag must have a closing tag or be self-closing.
9. Check imports: every imported symbol must exist.

EXAMPLE response format:
\`\`\`tsx
// FILE: src/components/Example.tsx
import { useState } from 'react';
export function Example() {
  const [x, setX] = useState(0);
  return <div>{x}</div>;
}
\`\`\`

Summary: Added Example component with counter state.`;

  const extractFiles = (text: string): Record<string, string> => {
    const extracted: Record<string, string> = {};
    const fileRegex = /```(?:tsx?|typescript)?\s*\n?\/\/ FILE:\s*(.+?)\n([\s\S]*?)```/g;
    let match;
    while ((match = fileRegex.exec(text)) !== null) {
      const filename = match[1].trim();
      const code = match[2].trim();
      if (filename && code && !code.includes('...')) extracted[filename] = code;
    }
    return extracted;
  };

  const handleSend = async (fixPrompt?: string) => {
    const actualPrompt = fixPrompt || prompt;
    if (!actualPrompt.trim() || loading) return;

    const key = getActiveAPIKey();
    if (!key) {
      toast.error('No API key found. Add keys in Settings → API Settings first.');
      return;
    }

    const userMsg: EditorMessage = { role: 'user', content: actualPrompt };
    setMessages((prev) => [...prev, userMsg]);
    if (!fixPrompt) setPrompt('');
    setLoading(true);
    setPendingChanges(null);
    setValidation(null);
    setApplied(false);

    try {
      const model = getGeminiModel();
      const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${key}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [
            { role: 'user', parts: [{ text: SYSTEM_PROMPT }] },
            ...messages.map((m) => ({
              role: m.role === 'user' ? 'user' : 'model',
              parts: [{ text: m.content }],
            })),
            { role: 'user', parts: [{ text: actualPrompt }] },
          ],
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error?.message || `HTTP ${res.status}`);
      }

      const data = await res.json();
      const text = data.candidates?.[0]?.content?.parts?.[0]?.text || '';

      if (!text) {
        throw new Error('AI returned empty response');
      }

      setMessages((prev) => [...prev, { role: 'editor', content: text }]);

      const extracted = extractFiles(text);
      if (Object.keys(extracted).length > 0) {
        setPendingChanges(extracted);
        // Auto-validate
        const v = validateAllFiles(extracted);
        setValidation(v);
      }
    } catch (err: any) {
      toast.error(`Editor failed: ${err.message || 'Check API key'}`);
      setMessages((prev) => [...prev, { role: 'editor', content: `**Error:** ${err.message || 'Something went wrong'}. Please check your API key and try again.` }]);
    } finally {
      setLoading(false);
    }
  };

  const handleFixErrors = () => {
    if (!validation || validation.errors.length === 0) return;
    const errorText = validation.errors.map((e) => `  [${e.severity.toUpperCase()}] ${e.file}${e.line ? `:${e.line}` : ''} — ${e.message}`).join('\n');
    const fixPrompt = `The code you generated has syntax errors. Please fix ALL of these errors and return the COMPLETE corrected files:\n\n${errorText}\n\nReturn the COMPLETE fixed files using the same // FILE: format. Do NOT truncate or use "...". Every file must be 100% complete and valid.`;
    handleSend(fixPrompt);
  };

  const handleApplyChanges = () => {
    if (!pendingChanges) return;
    if (validation && !validation.valid) {
      toast.error('Cannot apply: code has errors. Click "Auto-Fix" to fix them.');
      return;
    }
    setApplied(true);
    toast.success(`${Object.keys(pendingChanges).length} file(s) ready to deploy!`);
  };

  const handleDownload = async () => {
    if (!pendingChanges) return;
    setDownloading(true);
    try {
      await downloadSourceCode(pendingChanges);
      toast.success('Updated source downloaded!');
    } catch {
      toast.error('Download failed');
    } finally {
      setDownloading(false);
    }
  };

  const handlePush = () => {
    if (!pendingChanges) return;
    sessionStorage.setItem('rw_editor_modified', JSON.stringify(pendingChanges));
    onOpenChange(false);
    window.dispatchEvent(new CustomEvent('rw-open-github-push'));
  };

  const close = () => {
    setPrompt('');
    setMessages([]);
    setPendingChanges(null);
    setValidation(null);
    setApplied(false);
    onOpenChange(false);
  };

  const modifiedCount = pendingChanges ? Object.keys(pendingChanges).length : 0;

  return (
    <Dialog open={open} onOpenChange={close}>
      <DialogContent className="max-w-[calc(100%-1rem)] md:max-w-2xl h-[90dvh] max-h-[800px] flex flex-col p-0 border-0 bg-gradient-to-br from-card to-background shadow-2xl">
        <DialogHeader className="shrink-0 px-5 py-4 border-b border-border/30">
          <DialogTitle className="flex items-center gap-2 text-base font-bold">
            <div className="p-1.5 rounded-lg bg-primary/10">
              <Wand2 className="w-4 h-4 text-primary" />
            </div>
            Red Whale Editor
            <span className="ml-auto text-[10px] font-normal text-muted-foreground bg-muted px-2 py-0.5 rounded-full flex items-center gap-1">
              <Sparkles className="w-3 h-3" /> AI Powered
            </span>
          </DialogTitle>
        </DialogHeader>

        <ScrollArea className="flex-1 min-h-0 px-5">
          <div ref={scrollRef} className="space-y-4 py-4">
            {messages.length === 0 && (
              <div className="text-center py-12 space-y-3">
                <div className="w-12 h-12 mx-auto rounded-xl bg-primary/10 flex items-center justify-center">
                  <Code2 className="w-6 h-6 text-primary" />
                </div>
                <p className="text-sm font-semibold text-foreground">Tell the AI what to change</p>
                <p className="text-xs text-muted-foreground max-w-xs mx-auto">
                  Example: "Remove the hamburger menu from the app"
                </p>
                <div className="flex flex-wrap gap-2 justify-center">
                  {[
                    'Remove hamburger menu',
                    'Add a new page called Whale AI',
                    'Change the app name to Blue Whale',
                    'Add dark mode toggle to header',
                  ].map((s) => (
                    <button
                      key={s}
                      onClick={() => setPrompt(s)}
                      className="text-[11px] px-3 py-1.5 rounded-full bg-muted hover:bg-primary/10 transition-colors text-muted-foreground"
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {messages.map((msg, i) => (
              <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div
                  className={`max-w-[90%] rounded-2xl px-4 py-3 text-sm ${
                    msg.role === 'user'
                      ? 'bg-primary text-primary-foreground rounded-br-md'
                      : 'bg-muted text-foreground rounded-bl-md'
                  }`}
                >
                  <p className="whitespace-pre-wrap text-[13px] leading-relaxed">{msg.content}</p>
                </div>
              </div>
            ))}

            {loading && (
              <div className="flex justify-start">
                <div className="bg-muted rounded-2xl rounded-bl-md px-4 py-3">
                  <div className="flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin text-primary" />
                    <span className="text-xs text-muted-foreground">Red Whale Editor is coding...</span>
                  </div>
                </div>
              </div>
            )}

            {/* Validation results */}
            {validation && (
              <div className={`rounded-xl border p-4 space-y-2 ${validation.valid ? 'border-green-500/20 bg-green-500/5' : 'border-amber-500/20 bg-amber-500/5'}`}>
                <div className="flex items-center gap-2">
                  {validation.valid ? (
                    <CheckCircle2 className="w-4 h-4 text-green-500" />
                  ) : (
                    <AlertTriangle className="w-4 h-4 text-amber-500" />
                  )}
                  <p className={`text-sm font-semibold ${validation.valid ? 'text-green-600' : 'text-amber-600'}`}>
                    {validation.valid ? 'All files passed validation!' : `${validation.errors.length} error(s) found`}
                  </p>
                </div>

                {!validation.valid && (
                  <div className="space-y-1.5">
                    {validation.errors.map((err, i) => (
                      <div key={i} className="flex items-start gap-2 text-xs text-amber-700">
                        <AlertTriangle className="w-3 h-3 shrink-0 mt-0.5" />
                        <span>{err.file}{err.line ? `:${err.line}` : ''} — {err.message}</span>
                      </div>
                    ))}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleFixErrors}
                      disabled={loading}
                      className="mt-2 h-8 text-xs"
                    >
                      {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin mr-1" /> : <Wrench className="w-3.5 h-3.5 mr-1" />}
                      Auto-Fix with AI
                    </Button>
                  </div>
                )}

                {validation.warnings.length > 0 && (
                  <div className="space-y-1 pt-1">
                    {validation.warnings.slice(0, 3).map((w, i) => (
                      <div key={i} className="flex items-start gap-2 text-[11px] text-muted-foreground">
                        <span className="shrink-0">⚠</span>
                        <span>{w.file} — {w.message}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Modified files list */}
            {pendingChanges && !applied && validation && (
              <div className="rounded-xl border border-primary/20 bg-primary/5 p-4 space-y-3">
                <div className="flex items-center gap-2">
                  <FileDiff className="w-4 h-4 text-primary" />
                  <p className="text-sm font-semibold text-foreground">{modifiedCount} file(s) ready</p>
                </div>
                <div className="space-y-1">
                  {Object.keys(pendingChanges).map((filename) => (
                    <div key={filename} className="flex items-center gap-2 text-xs text-muted-foreground">
                      <FileCode className="w-3 h-3 shrink-0" />
                      <span className="font-mono">{filename}</span>
                    </div>
                  ))}
                </div>
                <Button
                  onClick={handleApplyChanges}
                  disabled={!validation.valid || loading}
                  className="w-full h-9 text-sm font-semibold"
                >
                  <CheckCircle2 className="w-4 h-4 mr-1.5" />
                  {validation.valid ? 'Apply Changes' : 'Fix Errors First'}
                </Button>
              </div>
            )}

            {/* Applied — deploy actions */}
            {applied && pendingChanges && (
              <div className="rounded-xl border border-green-500/20 bg-green-500/5 p-4 space-y-3">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-green-500" />
                  <p className="text-sm font-semibold text-foreground">Changes applied!</p>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <Button
                    variant="outline"
                    onClick={handleDownload}
                    disabled={downloading}
                    className="h-9 text-xs font-medium"
                  >
                    {downloading ? <Loader2 className="w-3.5 h-3.5 animate-spin mr-1" /> : <Download className="w-3.5 h-3.5 mr-1" />}
                    Download ZIP
                  </Button>
                  <Button
                    onClick={handlePush}
                    disabled={pushing}
                    className="h-9 text-xs font-medium"
                  >
                    {pushing ? <Loader2 className="w-3.5 h-3.5 animate-spin mr-1" /> : <Github className="w-3.5 h-3.5 mr-1" />}
                    Push to GitHub
                  </Button>
                </div>
                <p className="text-[10px] text-muted-foreground/60 text-center">
                  Your updated app is ready to deploy!
                </p>
              </div>
            )}
          </div>
        </ScrollArea>

        {/* Input */}
        <div className="shrink-0 p-4 border-t border-border/30 bg-card/50">
          <div className="flex gap-2">
            <Textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
              placeholder="Describe the change you want..."
              className="min-h-[44px] max-h-[120px] text-sm resize-none bg-background"
            />
            <Button
              onClick={() => handleSend()}
              disabled={!prompt.trim() || loading}
              className="h-[44px] w-[44px] p-0 shrink-0 rounded-xl"
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>
          <p className="text-[10px] text-muted-foreground/60 mt-2 text-center">
            The AI will edit your app files and validate them automatically.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
