import { useState } from 'react';
import { Smartphone, Loader2, Download, CheckCircle2, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { exportAndroidApp } from '@/utils/androidExport';
import { toast } from 'sonner';

interface AndroidExportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AndroidExportDialog({ open, onOpenChange }: AndroidExportDialogProps) {
  const [appName, setAppName] = useState('Red Whale');
  const [packageName, setPackageName] = useState('com.redwhale.app');
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState('');
  const [progressPercent, setProgressPercent] = useState(0);
  const [result, setResult] = useState<{ success: boolean; filename?: string; message: string } | null>(null);

  const handleExport = async () => {
    if (!appName.trim() || !packageName.trim()) {
      toast.error('Please fill in all fields');
      return;
    }

    setLoading(true);
    setResult(null);
    setProgress('Starting export...');
    setProgressPercent(0);

    const res = await exportAndroidApp(
      appName.trim(),
      packageName.trim(),
      (msg, current, total) => {
        setProgress(msg);
        setProgressPercent(Math.round((current / total) * 100));
      }
    );

    setLoading(false);
    setResult(res);

    if (res.success) {
      toast.success('Android project exported!');
    } else {
      toast.error(res.message);
    }
  };

  const reset = () => {
    setResult(null);
    setProgress('');
    setProgressPercent(0);
    setAppName('Red Whale');
    setPackageName('com.redwhale.app');
  };

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) reset(); onOpenChange(v); }}>
      <DialogContent className="max-w-[calc(100%-2rem)] md:max-w-lg max-h-[90dvh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Smartphone className="w-5 h-5" />
            Export as Android App
          </DialogTitle>
          <DialogDescription>
            Generate a REAL native Android app using Capacitor. Looks exactly like your web app but builds as a standalone APK with native Android integration.
          </DialogDescription>
        </DialogHeader>

        {!result && (
          <div className="space-y-4 py-2">
            <div className="p-3 bg-primary/5 rounded-xl border border-primary/10 space-y-1">
              <p className="text-xs font-medium text-primary">How it works</p>
              <p className="text-[11px] text-muted-foreground">
                Your web app runs inside a native Android WebView. All chat, AI, settings — everything works exactly like the website.
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="app-name">App Name</Label>
              <Input
                id="app-name"
                placeholder="Red Whale"
                value={appName}
                onChange={(e) => setAppName(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="package-name">Package Name</Label>
              <Input
                id="package-name"
                placeholder="com.redwhale.app"
                value={packageName}
                onChange={(e) => setPackageName(e.target.value)}
              />
              <p className="text-[10px] text-muted-foreground">Format: com.company.appname</p>
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
              onClick={handleExport}
              disabled={loading || !appName.trim() || !packageName.trim()}
              className="w-full"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Exporting...
                </>
              ) : (
                <>
                  <Download className="w-4 h-4 mr-2" />
                  Export Android Studio ZIP
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
                  <p className="text-sm font-semibold text-green-600 flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4" />
                    Export complete!
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">{result.message}</p>
                </div>

                <div className="p-3 bg-muted/50 rounded-xl space-y-2">
                  <p className="text-sm font-semibold">📱 Open in Android Studio</p>
                  <ol className="text-xs text-muted-foreground space-y-1 list-decimal list-inside">
                    <li>Extract the ZIP file</li>
                    <li>Open Android Studio</li>
                    <li>File → Open → Select the extracted folder</li>
                    <li>Wait for Gradle sync</li>
                    <li>Click Run (▶) to build & install</li>
                  </ol>
                </div>
              </div>
            ) : (
              <div className="p-3 bg-destructive/10 rounded-xl border border-destructive/20">
                <p className="text-sm font-semibold text-destructive flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4" />
                  Export failed
                </p>
                <p className="text-xs text-muted-foreground mt-1 whitespace-pre-wrap">{result.message}</p>
              </div>
            )}

            <Button onClick={reset} variant="outline" className="w-full">
              Export Again
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
