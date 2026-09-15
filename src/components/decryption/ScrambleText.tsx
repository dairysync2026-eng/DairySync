import React, { useState, useEffect, useRef } from 'react';

interface ScrambleTextProps {
  text: string;
  isRevealed: boolean;
  maskedChar?: string;
  speedMs?: number;
  scrambleDurationMs?: number;
  charset?: string;
  className?: string;
  onComplete?: () => void;
}

const DEFAULT_CHARSET = '!<>-_\\/[]{}—=+*^?#_0123456789ABCDEF';

export const ScrambleText: React.FC<ScrambleTextProps> = ({
  text,
  isRevealed,
  maskedChar = '•',
  speedMs = 30,
  scrambleDurationMs = 500,
  charset = DEFAULT_CHARSET,
  className = '',
  onComplete
}) => {
  const [displayText, setDisplayText] = useState<string>(() => 
    isRevealed ? text : maskedChar.repeat(Math.max(text.length, 8))
  );
  const [isAnimating, setIsAnimating] = useState(false);
  const [blurAmount, setBlurAmount] = useState<number>(0);

  const prevRevealedRef = useRef<boolean>(isRevealed);
  const frameRef = useRef<number | null>(null);
  const startTimeRef = useRef<number>(0);

  useEffect(() => {
    // Only trigger scramble when transitioning from masked to revealed or vice versa
    const wasRevealed = prevRevealedRef.current;
    prevRevealedRef.current = isRevealed;

    if (wasRevealed === isRevealed) {
      // Direct text update without re-animating
      setDisplayText(isRevealed ? text : maskedChar.repeat(Math.max(text.length, 8)));
      return;
    }

    if (!isRevealed) {
      // Re-mask immediately
      setDisplayText(maskedChar.repeat(Math.max(text.length, 8)));
      setBlurAmount(0);
      setIsAnimating(false);
      return;
    }

    // Unlocking / Decrypting transition
    setIsAnimating(true);
    setBlurAmount(4); // Start with blur(4px) as requested
    startTimeRef.current = performance.now();

    const animate = (currentTime: number) => {
      const elapsed = currentTime - startTimeRef.current;
      const progress = Math.min(elapsed / scrambleDurationMs, 1);

      // Decrement blur amount as progress increases
      const currentBlur = Math.max(0, 4 * (1 - progress));
      setBlurAmount(currentBlur);

      // Calculate how many characters are fully resolved
      const resolvedCount = Math.floor(progress * text.length);

      let scrambled = '';
      for (let i = 0; i < text.length; i++) {
        if (i < resolvedCount) {
          scrambled += text[i];
        } else if (i === resolvedCount && progress < 0.95) {
          // Typewriter cursor / glitch pulse character
          scrambled += charset[Math.floor(Math.random() * charset.length)];
        } else {
          // Random character from hacker charset
          scrambled += charset[Math.floor(Math.random() * charset.length)];
        }
      }

      setDisplayText(scrambled);

      if (progress < 1) {
        frameRef.current = requestAnimationFrame(animate);
      } else {
        setDisplayText(text);
        setBlurAmount(0);
        setIsAnimating(false);
        if (onComplete) onComplete();
      }
    };

    frameRef.current = requestAnimationFrame(animate);

    return () => {
      if (frameRef.current) {
        cancelAnimationFrame(frameRef.current);
      }
    };
  }, [isRevealed, text, maskedChar, speedMs, scrambleDurationMs, charset, onComplete]);

  return (
    <span 
      className={`inline-block transition-all duration-150 font-mono ${className} ${
        isAnimating ? 'text-indigo-600 font-extrabold select-none' : ''
      }`}
      style={{
        filter: blurAmount > 0 ? `blur(${blurAmount.toFixed(1)}px)` : 'none',
        transition: 'filter 75ms ease-out'
      }}
    >
      {displayText}
    </span>
  );
};
