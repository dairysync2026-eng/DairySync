import { useState, useEffect } from 'react';

export interface OnlineStatusState {
  isOnline: boolean;
  wasOffline: boolean;
  lastChecked: string;
}

export function useOnlineStatus(): OnlineStatusState {
  const [isOnline, setIsOnline] = useState<boolean>(() => {
    return typeof navigator !== 'undefined' ? navigator.onLine : true;
  });
  const [wasOffline, setWasOffline] = useState(false);
  const [lastChecked, setLastChecked] = useState<string>(new Date().toLocaleTimeString());

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      setLastChecked(new Date().toLocaleTimeString());
    };

    const handleOffline = () => {
      setIsOnline(false);
      setWasOffline(true);
      setLastChecked(new Date().toLocaleTimeString());
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return {
    isOnline,
    wasOffline,
    lastChecked,
  };
}
