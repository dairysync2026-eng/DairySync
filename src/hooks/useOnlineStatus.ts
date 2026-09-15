import { useState, useEffect, useCallback } from 'react';
import { getInventoryDbStats, InventoryDbStats } from '../services/inventoryDb';

export interface OnlineStatusState {
  isOnline: boolean;
  wasOffline: boolean;
  dbStats: InventoryDbStats;
  lastChecked: string;
  refreshStats: () => Promise<void>;
}

export function useOnlineStatus(): OnlineStatusState {
  const [isOnline, setIsOnline] = useState<boolean>(() => {
    return typeof navigator !== 'undefined' ? navigator.onLine : true;
  });
  const [wasOffline, setWasOffline] = useState(false);
  const [lastChecked, setLastChecked] = useState<string>(new Date().toLocaleTimeString());
  const [dbStats, setDbStats] = useState<InventoryDbStats>({
    ingredientCount: 0,
    finishedCount: 0,
    wipCount: 0,
    transactionCount: 0,
    queueCount: 0,
    lastSynced: null,
    dbReady: false,
  });

  const refreshStats = useCallback(async () => {
    try {
      const stats = await getInventoryDbStats();
      setDbStats(stats);
      setLastChecked(new Date().toLocaleTimeString());
    } catch (e) {
      console.warn('Failed to load DB stats:', e);
    }
  }, []);

  useEffect(() => {
    refreshStats();

    const handleOnline = () => {
      setIsOnline(true);
      refreshStats();
    };

    const handleOffline = () => {
      setIsOnline(false);
      setWasOffline(true);
      refreshStats();
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Periodic check on DB stats (e.g. every 10 seconds)
    const interval = setInterval(() => {
      refreshStats();
    }, 10000);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      clearInterval(interval);
    };
  }, [refreshStats]);

  return {
    isOnline,
    wasOffline,
    dbStats,
    lastChecked,
    refreshStats,
  };
}
