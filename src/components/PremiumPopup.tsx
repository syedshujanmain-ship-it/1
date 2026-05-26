import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Key, Zap, AlertTriangle, Plus, ExternalLink } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Logo } from '@/components/Logo';

type PopupType = 'no-api' | 'quota-exhausted' | null;

interface PremiumPopupProps {
  trigger?: boolean;
  type?: PopupType;
  onClose?: () => void;
}

export function PremiumPopup({ trigger, type, onClose }: PremiumPopupProps) {
  const [open, setOpen] = useState(false);
  const [popupType, setPopupType] = useState<PopupType>(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (trigger && type) {
      setPopupType(type);
      setOpen(true);
    }
  }, [trigger, type]);

  const handleClose = () => {
    setOpen(false);
    onClose?.();
  };

  const handleAddAPI = () => {
    setOpen(false);
    navigate('/api-settings');
  };

  const isNoAPI = popupType === 'no-api';
  const isQuota = popupType === 'quota-exhausted';

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="max-w-[calc(100%-2rem)] md:max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader className="text-center">
          <div className="mx-auto mb-3">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-red-500 to-orange-500 flex items-center justify-center shadow-lg">
              {isNoAPI ? (
                <Key className="w-8 h-8 text-white" />
              ) : (
                <Zap className="w-8 h-8 text-white" />
              )}
            </div>
          </div>
          <DialogTitle className="text-lg font-black">
            {isNoAPI ? 'API Key Required' : 'Quota Exhausted'}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {/* Warning */}
          <div className="flex items-start gap-3 p-3 rounded-xl bg-amber-500/10 border border-amber-500/20">
            <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
            <p className="text-sm text-amber-700">
              {isNoAPI
                ? 'You need to add a Gemini API key to use Red Whale V1. No default keys are provided.'
                : `All your API keys have reached their daily quota. Each key provides 20 requests per day.`}
            </p>
          </div>

          {/* Short Guide */}
          <div className="space-y-3">
            <h4 className="text-sm font-bold text-foreground">How to get a free API key:</h4>
            <ol className="space-y-2 text-sm text-muted-foreground list-decimal list-inside">
              <li>Visit <a href="https://aistudio.google.com/apikey" target="_blank" rel="noopener noreferrer" className="text-primary font-semibold underline inline-flex items-center gap-1">Google AI Studio <ExternalLink className="w-3 h-3" /></a></li>
              <li>Sign in with your Google account</li>
              <li>Click "Create API Key"</li>
              <li>Copy the key (starts with <code className="bg-muted px-1 rounded text-xs">AIzaSy</code>)</li>
              <li>Come back and paste it below</li>
            </ol>
          </div>

          {/* Pro Tip */}
          <div className="p-3 rounded-xl bg-primary/5 border border-primary/10">
            <p className="text-xs text-primary font-medium">
              <Zap className="w-3 h-3 inline mr-1" />
              Pro Tip: Add multiple API keys for more daily quota. 5 keys = 100 requests/day!
            </p>
          </div>

          {/* Actions */}
          <div className="flex flex-col gap-2 pt-2">
            <Button onClick={handleAddAPI} className="w-full bg-gradient-to-r from-red-600 to-rose-500 hover:from-red-700 hover:to-rose-600 text-white font-bold">
              <Plus className="w-4 h-4 mr-2" />
              Add API Key
            </Button>
            <Button variant="outline" onClick={handleClose} className="w-full">
              Maybe Later
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// Hook to check API key status
export function useAPIStatus() {
  const [hasAPIKeys, setHasAPIKeys] = useState(true);
  const [quotaExhausted, setQuotaExhausted] = useState(false);

  useEffect(() => {
    const check = () => {
      try {
        const stored = localStorage.getItem('redwhale_custom_api_keys');
        const keys = stored ? JSON.parse(stored) : [];
        setHasAPIKeys(keys.length > 0);
      } catch {
        setHasAPIKeys(false);
      }
    };
    check();
    window.addEventListener('storage', check);
    return () => window.removeEventListener('storage', check);
  }, []);

  const markQuotaExhausted = () => setQuotaExhausted(true);
  const resetQuota = () => setQuotaExhausted(false);

  return { hasAPIKeys, quotaExhausted, markQuotaExhausted, resetQuota };
}