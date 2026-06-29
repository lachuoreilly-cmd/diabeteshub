import React, { useEffect, useRef } from 'react';

interface InactivityTimeoutProps {
  onTimeout: () => void;
  timeoutDuration?: number; // default: 15 minutes
}

const InactivityTimeout: React.FC<InactivityTimeoutProps> = ({ onTimeout, timeoutDuration = 15 * 60 * 1000 }) => {
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Checks whether the stored inactivity duration is exceeded
  const checkSessionExpiry = (): boolean => {
    const lastActivity = localStorage.getItem('lastActivity');
    if (!lastActivity) return false;
    
    const elapsed = Date.now() - parseInt(lastActivity, 10);
    return elapsed > timeoutDuration;
  };

  const handleSessionTimeout = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    if (intervalRef.current) clearInterval(intervalRef.current);
    onTimeout();
  };

  const resetTimeout = () => {
    // First, check if the session is already expired
    if (checkSessionExpiry()) {
      console.log("Session expired due to inactivity upon interaction/detection");
      handleSessionTimeout();
      return;
    }

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    
    // Save last activity to localStorage for persistence across refreshes
    localStorage.setItem('lastActivity', Date.now().toString());
    
    timeoutRef.current = setTimeout(() => {
      console.log("Inactivity timeout reached");
      handleSessionTimeout();
    }, timeoutDuration);
  };

  useEffect(() => {
    // Check key events for activity
    const events: (keyof WindowEventMap)[] = ['mousemove', 'keydown', 'scroll', 'touchstart', 'click'];

    const handleActivity = () => {
      resetTimeout();
    };

    events.forEach(event => {
      window.addEventListener(event, handleActivity);
    });

    // Check visibility change & window focus
    const handleVisibilityAndFocus = () => {
      if (document.visibilityState === 'visible' || !document.hidden) {
        if (checkSessionExpiry()) {
          console.log("Session expired due to inactivity upon page visibility/focus change");
          handleSessionTimeout();
        } else {
          resetTimeout();
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityAndFocus);
    window.addEventListener('focus', handleVisibilityAndFocus);

    // Initial check and setup
    if (checkSessionExpiry()) {
      handleSessionTimeout();
    } else {
      resetTimeout();
    }

    // Periodically inspect expiry to catch computer sleep cycles and unattended screens
    intervalRef.current = setInterval(() => {
      if (checkSessionExpiry()) {
        console.log("Session expired due to inactivity detected by tick");
        handleSessionTimeout();
      }
    }, 10000); // Check every 10 seconds

    return () => {
      if (timeoutRef.current) {
         clearTimeout(timeoutRef.current);
      }
      if (intervalRef.current) {
         clearInterval(intervalRef.current);
      }
      events.forEach(event => {
        window.removeEventListener(event, handleActivity);
      });
      document.removeEventListener('visibilitychange', handleVisibilityAndFocus);
      window.removeEventListener('focus', handleVisibilityAndFocus);
    };
  }, [onTimeout, timeoutDuration]);

  return null;
};

export default InactivityTimeout;
