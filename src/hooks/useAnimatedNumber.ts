import { useState, useEffect } from 'react';

interface UseAnimatedNumberProps {
  from: number;
  to: number;
  duration?: number; // milliseconds
  startDelay?: number; // delay before starting animation (ms)
}

export const useAnimatedNumber = ({ from, to, duration = 2000, startDelay = 0 }: UseAnimatedNumberProps): number => {
  const [currentValue, setCurrentValue] = useState(from);

  useEffect(() => {
    // Reset to starting value when 'from' changes
    setCurrentValue(from);
    
    if (from === to) {
      return;
    }

    console.log(`💰 Animating score: ${from} → ${to} (delay: ${startDelay}ms)`);

    // Delay animation start if specified
    const delayTimeout = setTimeout(() => {
      const startTime = Date.now();
      const difference = to - from;
      
      const animate = () => {
        const now = Date.now();
        const elapsed = now - startTime;
        const progress = Math.min(elapsed / duration, 1);
        
        // Easing function (ease-out)
        const easeOut = 1 - Math.pow(1 - progress, 3);
        const value = from + (difference * easeOut);
        
        setCurrentValue(Math.round(value));
        
        if (progress < 1) {
          requestAnimationFrame(animate);
        }
      };

      requestAnimationFrame(animate);
    }, startDelay);

    return () => clearTimeout(delayTimeout);
  }, [from, to, duration, startDelay]);

  return currentValue;
};
