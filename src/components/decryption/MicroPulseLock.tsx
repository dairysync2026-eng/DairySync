import React, { useState, useEffect } from 'react';

interface MicroPulseLockProps {
  isUnlocked: boolean;
  onToggle: () => void;
  disabled?: boolean;
  className?: string;
  title?: string;
}

export const MicroPulseLock: React.FC<MicroPulseLockProps> = ({
  isUnlocked,
  onToggle,
  disabled = false,
  className = '',
  title
}) => {
  const [showRipple, setShowRipple] = useState(false);

  // Trigger ripple animation whenever unlocked state changes to true
  useEffect(() => {
    if (isUnlocked) {
      setShowRipple(true);
      const timer = setTimeout(() => setShowRipple(false), 900);
      return () => clearTimeout(timer);
    }
  }, [isUnlocked]);

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (disabled) return;
    onToggle();
  };

  return (
    <div className={`relative inline-flex items-center justify-center ${className}`}>
      {/* Expanding SVG Ripple Pulse Wave that sweeps across the row when unlocked */}
      {showRipple && (
        <span 
          className="absolute inset-0 pointer-events-none flex items-center justify-center"
          aria-hidden="true"
        >
          {/* Inner intense pulse */}
          <span className="w-8 h-8 rounded-full bg-emerald-400/30 animate-ping" />
          {/* Secondary expanding radial ripple wave */}
          <span 
            className="absolute w-12 h-12 rounded-full border border-emerald-500/60 opacity-0 animate-[ping_800ms_cubic-bezier(0,0,0.2,1)]" 
          />
        </span>
      )}

      {/* Interactive Micro-Pulse Padlock Button */}
      <button
        type="button"
        onClick={handleClick}
        disabled={disabled}
        className={`relative z-10 p-1.5 rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 ${
          isUnlocked 
            ? 'bg-emerald-50 text-emerald-600 border border-emerald-300 shadow-xs hover:bg-emerald-100' 
            : 'bg-slate-100 text-slate-500 border border-slate-200 hover:bg-slate-200 hover:text-slate-800'
        } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
        title={title || (isUnlocked ? 'Click to re-encrypt and lock' : 'Click to decrypt and unlock credentials')}
        aria-label={isUnlocked ? 'Re-encrypt password' : 'Decrypt password'}
      >
        <svg 
          className="w-3.5 h-3.5" 
          viewBox="0 0 24 24" 
          fill="none" 
          stroke="currentColor" 
          strokeWidth="2.2" 
          strokeLinecap="round" 
          strokeLinejoin="round"
        >
          {/* Shackle: lifts and tilts open when unlocked */}
          <path
            d="M7 11V7a5 5 0 0 1 10 0v4"
            className="transition-all duration-300 ease-out origin-[17px_11px]"
            style={{
              transform: isUnlocked 
                ? 'translateY(-3.5px) rotate(-18deg)' 
                : 'translateY(0) rotate(0deg)'
            }}
          />
          {/* Body of the padlock */}
          <rect x="3" y="11" width="18" height="11" rx="2.5" ry="2.5" />
          {/* Keyhole */}
          <circle cx="12" cy="16" r="1.2" fill="currentColor" />
          <path d="M12 17.5v2" strokeWidth="2" />
        </svg>
      </button>
    </div>
  );
};
