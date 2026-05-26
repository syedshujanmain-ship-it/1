import { useState } from 'react';
import { Lock, Eye, EyeOff, X, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

interface PasswordDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
  title?: string;
  description?: string;
}

// Obfuscated password check — password is "rw"
function verifyPassword(input: string): boolean {
  const k = [114, 119];
  if (input.length !== k.length) return false;
  return k.every((c, i) => input.charCodeAt(i) === c);
}

export function PasswordDialog({
  open,
  onOpenChange,
  onSuccess,
  title = 'Authentication Required',
  description = 'Enter password to continue',
}: PasswordDialogProps) {
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState(false);
  const [shake, setShake] = useState(false);

  const handleSubmit = () => {
    if (verifyPassword(password)) {
      setPassword('');
      setError(false);
      onOpenChange(false);
      onSuccess();
    } else {
      setError(true);
      setShake(true);
      setTimeout(() => setShake(false), 400);
    }
  };

  const handleClose = () => {
    setPassword('');
    setError(false);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-[calc(100%-2rem)] md:max-w-sm border-0 bg-gradient-to-br from-card to-background shadow-2xl">
        <DialogHeader className="pb-2">
          <DialogTitle className="flex items-center gap-2 text-base font-bold">
            <div className="p-1.5 rounded-lg bg-primary/10">
              <Shield className="w-4 h-4 text-primary" />
            </div>
            {title}
          </DialogTitle>
        </DialogHeader>

        <p className="text-xs text-muted-foreground">{description}</p>

        <div className={`space-y-3 transition-transform ${shake ? 'animate-shake' : ''}`}>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              type={showPassword ? 'text' : 'password'}
              placeholder="Enter password..."
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setError(false);
              }}
              onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
              className={`pl-10 pr-10 h-10 text-sm ${error ? 'border-destructive focus-visible:ring-destructive' : ''}`}
              autoFocus
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>

          {error && (
            <p className="text-xs text-destructive font-medium">Incorrect password. Try again.</p>
          )}

          <Button
            onClick={handleSubmit}
            className="w-full h-10 text-sm font-semibold"
          >
            Unlock
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
