import { useState, useEffect, useCallback } from 'react';
import { InventoryDbStats, getInventoryDbStats } from '../services/inventoryDb';

const EMPTY_DB_STATS: InventoryDbStats = {
  ingredientCount: 0,
  finishedCount: 0,
  wipCount: 0,
  transactionCount: 0,
  queueCount: 0,
  lastSynced: null,
  dbReady: false,
};

export interface OnlineStatusState {
  isOnline: boolean;
  wasOffline: boolean;
  lastChecked: string;
  dbStats: InventoryDbStats;
  refreshStats: () => Promise<void>;
}

export function useOnlineStatus(): OnlineStatusState {
  const [isOnline, setIsOnline] = useState<boolean>(() => {
    return typeof navigator !== 'undefined' ? navigator.onLine : true;
  });
  const [wasOffline, setWasOffline] = useState(false);
  const [lastChecked, setLastChecked] = useState<string>(new Date().toLocaleTimeString());
  const [dbStats, setDbStats] = useState<InventoryDbStats>(EMPTY_DB_STATS);

  const refreshStats = useCallback(async (): Promise<void> => {
    try {
      const stats = await getInventoryDbStats();
      setDbStats(stats);
    } catch (error) {
      console.error('Failed to refresh IndexedDB stats:', error);
      setDbStats(EMPTY_DB_STATS);
    }
  }, []);

  useEffect(() => {
    void refreshStats();

    const handleOnline = () => {
      setIsOnline(true);
      setWasOffline(false);
      setLastChecked(new Date().toLocaleTimeString());
      void refreshStats();
    };

    const handleOffline = () => {
      setIsOnline(false);
      setWasOffline(true);
      setLastChecked(new Date().toLocaleTimeString());
      void refreshStats();
    };

    if (typeof window !== 'undefined') {
      window.addEventListener('online', handleOnline);
      window.addEventListener('offline', handleOffline);
    }

    return () => {
      if (typeof window !== 'undefined') {
        window.removeEventListener('online', handleOnline);
        window.removeEventListener('offline', handleOffline);
      }
    };
  }, [refreshStats]);

  return {
    isOnline,
    wasOffline,
    lastChecked,
    dbStats,
    refreshStats,
  };
}
