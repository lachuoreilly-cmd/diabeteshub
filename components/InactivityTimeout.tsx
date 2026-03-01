import React, { useEffect, useRef } from 'react';

interface InactivityTimeoutProps {
  onTimeout: () => void;
  timeoutDuration?: number;
}

const InactivityTimeout: React.FC<InactivityTimeoutProps> = ({ onTimeout, timeoutDuration = 10 * 60 * 1000 }) => {
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const resetTimeout = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    timeoutRef.current = setTimeout(onTimeout, timeoutDuration);
  };

  useEffect(() => {
    const events: (keyof WindowEventMap)[] = ['mousemove', 'keydown', 'scroll', 'touchstart'];

    const reset = () => resetTimeout();

    events.forEach(event => {
      window.addEventListener(event, reset);
    });

    resetTimeout();

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      events.forEach(event => {
        window.removeEventListener(event, reset);
      });
    };
  }, [onTimeout, timeoutDuration]);

  return null;
};

export default InactivityTimeout;
