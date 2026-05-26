// Logo.tsx - Red Whale Brand Logo
// Premium SVG whale-tail icon. The tail viewed from front naturally forms a "W" shape.
type LogoSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

interface LogoProps {
  className?: string;
  size?: LogoSize;
  fit?: boolean;
}

const sizeClassMap: Record<LogoSize, string> = {
  xs: 'w-4 h-4',
  sm: 'w-6 h-6',
  md: 'w-9 h-9',
  lg: 'w-12 h-12',
  xl: 'w-[72px] h-[72px]',
};

const fitClassMap: Record<LogoSize, string> = {
  xs: 'w-3 h-3',
  sm: 'w-4 h-4',
  md: 'w-6 h-6',
  lg: 'w-8 h-8',
  xl: 'w-10 h-10',
};

export function Logo({ className = '', size = 'md', fit = false }: LogoProps) {
  const explicitSize = className.includes('w-') || className.includes('h-');
  const sizeClass = explicitSize ? '' : (fit ? fitClassMap[size] : sizeClassMap[size]);

  return (
    <svg
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`select-none inline-block ${sizeClass} ${className}`}
    >
      {/* Whale tail flukes forming a "W" — left fluke */}
      <path
        d="M22 55 Q30 30 38 38 Q42 42 40 50 Q38 58 45 62"
        fill="#EF4444"
        stroke="#EF4444"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Whale tail flukes forming a "W" — right fluke */}
      <path
        d="M78 55 Q70 30 62 38 Q58 42 60 50 Q62 58 55 62"
        fill="#EF4444"
        stroke="#EF4444"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Central stem / body */}
      <path
        d="M45 62 Q50 68 55 62 L52 78 Q50 82 48 78 Z"
        fill="#EF4444"
      />
      {/* Water wave accent at bottom */}
      <path
        d="M18 82 Q32 74 50 82 Q68 74 82 82"
        stroke="#3B82F6"
        strokeWidth="4"
        strokeLinecap="round"
        fill="none"
      />
      <path
        d="M25 90 Q38 84 50 90 Q62 84 75 90"
        stroke="#3B82F6"
        strokeWidth="3"
        strokeLinecap="round"
        fill="none"
        opacity="0.6"
      />
    </svg>
  );
}
