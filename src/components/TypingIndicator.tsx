import { Logo } from '@/components/Logo';
import type { TypingIndicatorStyle } from '@/hooks/useAppSettings';

interface TypingIndicatorProps {
  style?: TypingIndicatorStyle;
}

export function TypingIndicator({ style = 'dots' }: TypingIndicatorProps) {
  const renderIndicator = () => {
    switch (style) {
      case 'wave':
        return (
          <div className="flex items-end gap-[3px] h-5 pb-0.5">
            {[0, 120, 240].map((d) => (
              <span
                key={d}
                className="inline-block w-[4px] rounded-full bg-violet-400 animate-typing-wave-bar transition-none"
                style={{ animationDelay: `${d}ms`, height: '16px', willChange: 'transform, opacity' }}
              />
            ))}
          </div>
        );
      case 'pulse':
        return (
          <div className="flex items-center h-5">
            <span className="inline-block w-4 h-4 rounded-full border-2 border-sky-400 animate-typing-pulse-ring transition-none" style={{ willChange: 'transform, opacity, box-shadow' }} />
          </div>
        );
      case 'orbit':
        return (
          <div className="flex items-center justify-center w-8 h-5">
            <div className="typing-orbit transition-none" style={{ willChange: 'transform' }}>
              <span className="transition-none" style={{ willChange: 'transform' }} /><span className="transition-none" style={{ willChange: 'transform' }} /><span className="transition-none" style={{ willChange: 'transform' }} />
            </div>
          </div>
        );
      case 'neon':
        return (
          <div className="flex items-center gap-2 h-5">
            {[0, 180, 360].map((d) => (
              <span
                key={d}
                className="inline-block w-[6px] h-[6px] rounded-full bg-cyan-300 animate-typing-neon transition-none"
                style={{ animationDelay: `${d}ms`, willChange: 'transform, opacity, box-shadow' }}
              />
            ))}
          </div>
        );
      case 'matrix':
        return (
          <div className="flex items-end gap-[5px] h-5 pb-0.5">
            {[0, 150, 300].map((d) => (
              <span
                key={d}
                className="inline-block w-[5px] rounded-sm bg-emerald-400 animate-typing-matrix transition-none"
                style={{ animationDelay: `${d}ms`, height: '14px', willChange: 'transform, opacity' }}
              />
            ))}
          </div>
        );
      case 'fire':
        return (
          <div className="flex items-center gap-[6px] h-5">
            {[0, 120, 240].map((d) => (
              <span
                key={d}
                className="inline-block w-[7px] h-[7px] rounded-[30%] bg-orange-400 animate-typing-fire transition-none"
                style={{ animationDelay: `${d}ms`, willChange: 'transform, opacity' }}
              />
            ))}
          </div>
        );
      case 'heart':
        return (
          <div className="flex items-center gap-[6px] h-5">
            {[0, 200, 400].map((d) => (
              <span
                key={d}
                className="inline-block w-[8px] h-[8px] bg-rose-400 animate-typing-heart transition-none"
                style={{ animationDelay: `${d}ms`, willChange: 'transform, opacity' }}
              />
            ))}
          </div>
        );
      // Default dots
      default:
        return (
          <div className="flex items-center gap-2 h-5">
            {[0, 200, 400].map((d) => (
              <span
                key={d}
                className="inline-block w-[6px] h-[6px] rounded-full bg-primary animate-[typing-pulse_1.4s_ease-in-out_infinite] transition-none"
                style={{ animationDelay: `${d}ms`, willChange: 'transform, opacity' }}
              />
            ))}
          </div>
        );
    }
  };

  return (
    <div className="flex gap-3 mb-6 items-start px-2 animate-fade-in">
      <div className="flex-shrink-0 w-8 h-8 rounded-full overflow-hidden bg-primary/10 flex items-center justify-center">
        <Logo size="xs" fit />
      </div>
      <div className="flex flex-col gap-1.5 mt-0.5">
        {renderIndicator()}
        <p className="text-[11px] text-muted-foreground/60 font-medium tracking-wide">
          Red Whale is thinking
          <span className="inline-block w-4 text-left animate-pulse">...</span>
        </p>
      </div>
    </div>
  );
}
