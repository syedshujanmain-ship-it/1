import { useState, useEffect } from 'react';
import { Github, Loader2, ExternalLink, Copy, Check, Rocket, Globe, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { pushToGitHub } from '@/utils/githubPush';
import { toast } from 'sonner';

interface GitHubPushDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function GitHubPushDialog({ open, onOpenChange }: GitHubPushDialogProps) {
  const [token, setToken] = useState('');
  const [repoName, setRepoName] = useState('red-whale-v1');
  const [isPrivate, setIsPrivate] = useState(false);
  const [includeAndroid, setIncludeAndroid] = useState(false);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState('');
  const [progressPercent, setProgressPercent] = useState(0);
  const [result, setResult] = useState<{ success: boolean; repoUrl?: string; message: string } | null>(null);
  const [copied, setCopied] = useState(false);
  const [countdown, setCountdown] = useState(0);

  const handlePush = async () => {
    if (!token.trim()) {
      toast.error('Please enter your GitHub Personal Access Token');
      return;
    }
    if (!repoName.trim()) {
      toast.error('Please enter a repository name');
      return;
    }

    setLoading(true);
    setResult(null);
    setProgress('Starting...');
    setProgressPercent(0);

    // Check for editor-modified file overrides
    let fileOverrides: Record<string, string> | undefined;
    try {
      const stored = sessionStorage.getItem('rw_editor_modified');
      if (stored) {
        fileOverrides = JSON.parse(stored);
      }
    } catch { /* ignore */ }

    const res = await pushToGitHub(
      token.trim(),
      repoName.trim(),
      isPrivate,
      (msg, current, total) => {
        setProgress(msg);
        setProgressPercent(Math.round((current / total) * 100));
      },
      fileOverrides,
      includeAndroid
    );

    // Clear overrides after push attempt
    sessionStorage.removeItem('rw_editor_modified');

    setLoading(false);
    setResult(res);

    if (res.success) {
      toast.success('Pushed to GitHub successfully!');
      // Start 10-second countdown before showing deploy button
      // This gives GitHub time to index the repo so Vercel can clone it
      setCountdown(10);
    } else {
      toast.error(res.message);
    }
  };

  const copyRepoUrl = () => {
    if (result?.repoUrl) {
      navigator.clipboard.writeText(result.repoUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      toast.success('URL copied!');
    }
  };

  const reset = () => {
    setResult(null);
    setProgress('');
    setProgressPercent(0);
    setToken('');
    setRepoName('red-whale-v1');
    setIsPrivate(false);
    setIncludeAndroid(false);
    setCopied(false);
    setCountdown(0);
  };

  // Countdown timer for Vercel deploy (gives GitHub time to index the repo)
  useEffect(() => {
    if (result?.success && countdown > 0) {
      const timer = setInterval(() => {
        setCountdown((c) => {
          if (c <= 1) {
            clearInterval(timer);
            return 0;
          }
          return c - 1;
        });
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [result?.success, countdown]);

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) reset(); onOpenChange(v); }}>
      <DialogContent className="max-w-[calc(100%-2rem)] md:max-w-lg max-h-[90dvh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Github className="w-5 h-5" />
            Push to GitHub
          </DialogTitle>
          <DialogDescription>
            Push the complete source code to your GitHub repository for self-hosting on Vercel, Netlify, etc.
          </DialogDescription>
        </DialogHeader>

        {!result && (
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="github-token">
                GitHub Classic Token (NOT Fine-Grained)
                <a
                  href="https://github.com/settings/tokens/new"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="ml-2 text-[10px] text-primary underline inline-flex items-center gap-0.5"
                >
                  Get Classic Token <ExternalLink className="w-3 h-3" />
                </a>
              </Label>
              <Input
                id="github-token"
                type="password"
                placeholder="ghp_xxxxxxxxxxxxxxxxxxxx"
                value={token}
                onChange={(e) => setToken(e.target.value)}
              />
              <div className="text-[10px] text-muted-foreground space-y-1">
                <p>⚠️ You MUST use a <strong>Classic Token</strong> (NOT Fine-Grained) with these scopes:</p>
                <ul className="list-disc list-inside ml-1">
                  <li><strong>repo</strong> — Full control of private repositories</li>
                </ul>
                <p>Fine-grained tokens will NOT work for creating repos.</p>
                <p>Your token is only used to push code and is never stored.</p>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="repo-name">Repository Name</Label>
              <Input
                id="repo-name"
                placeholder="red-whale-v1"
                value={repoName}
                onChange={(e) => setRepoName(e.target.value)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">Private Repository</p>
                <p className="text-[10px] text-muted-foreground">
                  {isPrivate
                    ? 'One-click Vercel deploy will NOT work. Use manual deploy.'
                    : 'Recommended — one-click Vercel deploy works'}
                </p>
              </div>
              <Switch checked={isPrivate} onCheckedChange={setIsPrivate} />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">Include Android Project</p>
                <p className="text-[10px] text-muted-foreground">
                  {includeAndroid
                    ? 'Capacitor native Android project + web source code'
                    : 'Push web source code only'}
                </p>
              </div>
              <Switch checked={includeAndroid} onCheckedChange={setIncludeAndroid} />
            </div>

            {loading && (
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  {progress}
                </div>
                <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full bg-primary rounded-full transition-all duration-300"
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
              </div>
            )}

            <Button
              onClick={handlePush}
              disabled={loading || !token.trim() || !repoName.trim()}
              className="w-full"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Pushing...
                </>
              ) : (
                <>
                  <Github className="w-4 h-4 mr-2" />
                  Push to GitHub
                </>
              )}
            </Button>
          </div>
        )}

        {result && (
          <div className="space-y-4 py-2">
            {result.success ? (
              <div className="space-y-3">
                <div className="p-3 bg-green-500/10 rounded-xl border border-green-500/20">
                  <p className="text-sm font-semibold text-green-600">✅ Successfully pushed!</p>
                  <p className="text-xs text-muted-foreground mt-1">{result.message}</p>
                </div>

                {result.repoUrl && (
                  <div className="space-y-2">
                    <Label>Repository URL</Label>
                    <div className="flex gap-2">
                      <Input value={result.repoUrl} readOnly className="flex-1" />
                      <Button variant="outline" size="icon" onClick={copyRepoUrl}>
                        {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                      </Button>
                    </div>
                  </div>
                )}

                <div className="p-3 bg-muted/50 rounded-xl space-y-3">
                  <p className="text-sm font-semibold flex items-center gap-2">
                    <Rocket className="w-4 h-4" />
                    Deploy on Vercel
                  </p>

                  {isPrivate && (
                    <div className="p-2 bg-amber-500/10 rounded-lg border border-amber-500/20 flex items-start gap-2">
                      <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
                      <p className="text-[10px] text-amber-700">
                        Your repo is <strong>private</strong>. One-click deploy only works with <strong>public</strong> repos.
                        Make it public in GitHub repo settings, or use manual deploy below.
                      </p>
                    </div>
                  )}

                  {!isPrivate && result.repoUrl && (
                    <>
                      {countdown > 0 ? (
                        <div className="text-center py-2">
                          <p className="text-xs text-muted-foreground">
                            Waiting for GitHub to index repo...
                          </p>
                          <p className="text-lg font-mono font-bold text-primary mt-1">
                            {countdown}s
                          </p>
                          <p className="text-[10px] text-muted-foreground">
                            Deploy button will appear automatically
                          </p>
                        </div>
                      ) : (
                        <a
                          href={`https://vercel.com/new/clone?repository-url=${encodeURIComponent(result.repoUrl)}&framework=vite`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="block"
                        >
                          <Button variant="default" className="w-full">
                            <Rocket className="w-4 h-4 mr-2" />
                            Deploy to Vercel
                            <ExternalLink className="w-3 h-3 ml-2" />
                          </Button>
                        </a>
                      )}
                    </>
                  )}

                  <div className="border-t border-border/40 pt-2 space-y-1.5">
                    <p className="text-[10px] font-medium text-muted-foreground">Manual deploy (always works):</p>
                    <ol className="text-[10px] text-muted-foreground space-y-0.5 list-decimal list-inside">
                      <li>Go to <a href="https://vercel.com/new" target="_blank" rel="noopener noreferrer" className="text-primary underline">vercel.com/new</a></li>
                      <li>Sign in with GitHub</li>
                      <li>Import your repository: <strong>{repoName}</strong></li>
                      <li>Framework: Select <strong>Vite</strong></li>
                      <li>Click <strong>Deploy</strong></li>
                    </ol>
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-3 bg-destructive/10 rounded-xl border border-destructive/20">
                <p className="text-sm font-semibold text-destructive">❌ Push failed</p>
                <p className="text-xs text-muted-foreground mt-1 whitespace-pre-wrap">{result.message}</p>
              </div>
            )}

            <Button onClick={reset} variant="outline" className="w-full">
              Push Again
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
