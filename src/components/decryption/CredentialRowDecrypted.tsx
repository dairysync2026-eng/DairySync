import React, { useState } from 'react';
import { MicroPulseLock } from './MicroPulseLock';
import { ScrambleText } from './ScrambleText';

interface CredentialRowDecryptedProps {
  label: string;
  value: string;
  defaultUnlocked?: boolean;
  className?: string;
  badge?: string;
}

export const CredentialRowDecrypted: React.FC<CredentialRowDecryptedProps> = ({
  label,
  value,
  defaultUnlocked = false,
  className = '',
  badge
}) => {
  const [isUnlocked, setIsUnlocked] = useState(defaultUnlocked);
  const [pulseActive, setPulseActive] = useState(false);

  const handleToggle = () => {
    const nextState = !isUnlocked;
    setIsUnlocked(nextState);
    if (nextState) {
      setPulseActive(true);
      setTimeout(() => setPulseActive(false), 900);
    }
  };

  return (
    <div 
      className={`relative overflow-hidden rounded-2xl border p-2.5 transition-all duration-300 ${
        isUnlocked 
          ? 'bg-emerald-50/40 border-emerald-200/80 shadow-xs' 
          : 'bg-slate-50 border-slate-200/90'
      } ${className}`}
    >
      {/* Expanding Ripple Pulse Wave sweeping across entire row */}
      {pulseActive && (
        <span 
          className="absolute inset-0 pointer-events-none bg-radial from-emerald-400/20 via-indigo-500/10 to-transparent animate-pulse"
          aria-hidden="true"
        />
      )}

      <div className="relative z-10 flex items-center justify-between gap-2">
        <div className="flex items-center space-x-2 min-w-0">
          <span className="text-[11px] font-mono text-slate-500 font-semibold shrink-0">
            {label}:
          </span>
          {badge && (
            <span className="text-[9px] font-mono uppercase bg-slate-200 text-slate-700 px-1.5 py-0.2 rounded font-bold shrink-0">
              {badge}
            </span>
          )}
        </div>

        <div className="flex items-center space-x-2 min-w-0">
          <ScrambleText
            text={value || 'none'}
            isRevealed={isUnlocked}
            scrambleDurationMs={550}
            className={`text-xs font-mono font-bold tracking-wide truncate ${
              isUnlocked ? 'text-slate-900' : 'text-slate-400'
            }`}
          />
          
          <MicroPulseLock
            isUnlocked={isUnlocked}
            onToggle={handleToggle}
            title={isUnlocked ? `Lock ${label}` : `Decrypt ${label}`}
          />
        </div>
      </div>
    </div>
  );
};
