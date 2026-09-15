import React, { useState } from 'react';
import { Wifi, WifiOff, RefreshCw, CheckCircle2, Database, AlertCircle } from 'lucide-react';
import { useOnlineStatus } from '../../hooks/useOnlineStatus';
import { OfflineSyncModal } from './OfflineSyncModal';
import { useDairySync } from '../../context/DairySyncContext';

export const OfflineIndicator: React.FC = () => {
  const { isOnline, wasOffline, dbStats, refreshStats } = useOnlineStatus();
  const { syncOfflineQueueWithCloud, forceReCacheInventory } = useDairySync();
  const [modalOpen, setModalOpen] = useState(false);

  return (
    <>
      {/* Floating Offline Alert Banner if offline or just reconnected */}
      {!isOnline && (
        <div className="fixed bottom-4 left-4 z-50 flex items-center space-x-3 bg-slate-900/95 text-white px-4 py-2.5 rounded-2xl shadow-xl border-2 border-amber-500/60 backdrop-blur-md animate-slide-up max-w-md">
          <div className="p-2 bg-amber-500/20 text-amber-400 rounded-xl shrink-0">
            <WifiOff className="w-4 h-4 animate-pulse" />
          </div>
          <div className="text-xs">
            <p className="font-bold text-amber-300">Offline Mode Active</p>
            <p className="text-[11px] text-slate-300">
              Working from local IndexedDB ({dbStats.ingredientCount + dbStats.finishedCount} cached items). Changes queued safely.
            </p>
          </div>
          <button
            onClick={() => setModalOpen(true)}
            className="px-2.5 py-1 bg-amber-600 hover:bg-amber-500 text-white rounded-lg text-[11px] font-bold shrink-0 transition"
          >
            Details
          </button>
        </div>
      )}

      {isOnline && wasOffline && (
        <div className="fixed bottom-4 left-4 z-50 flex items-center space-x-3 bg-slate-900/95 text-white px-4 py-2.5 rounded-2xl shadow-xl border-2 border-emerald-500/60 backdrop-blur-md max-w-md">
          <div className="p-2 bg-emerald-500/20 text-emerald-400 rounded-xl shrink-0">
            <CheckCircle2 className="w-4 h-4" />
          </div>
          <div className="text-xs">
            <p className="font-bold text-emerald-300">Connection Restored</p>
            <p className="text-[11px] text-slate-300">Cloud ledger synchronized with local cache.</p>
          </div>
          <button
            onClick={() => setModalOpen(true)}
            className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-[11px] font-bold shrink-0 transition"
          >
            View
          </button>
        </div>
      )}

      {/* Offline Sync & Storage Details Modal */}
      <OfflineSyncModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        isOnline={isOnline}
        dbStats={dbStats}
        onRefreshCache={async () => {
          await forceReCacheInventory();
          await refreshStats();
        }}
        onForceSync={async () => {
          await syncOfflineQueueWithCloud();
          await refreshStats();
        }}
      />
    </>
  );
};

export const OfflineStatusBadge: React.FC<{ compact?: boolean }> = ({ compact = false }) => {
  const { isOnline, dbStats, refreshStats } = useOnlineStatus();
  const { syncOfflineQueueWithCloud, forceReCacheInventory } = useDairySync();
  const [modalOpen, setModalOpen] = useState(false);

  return (
    <>
      <button
        id="network-status-badge"
        onClick={() => setModalOpen(true)}
        className={`flex items-center space-x-1.5 px-2.5 py-1.5 rounded-xl text-xs font-bold transition-all border shadow-xs ${
          isOnline
            ? 'bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border-emerald-300'
            : 'bg-amber-50 hover:bg-amber-100 text-amber-800 border-amber-400 animate-pulse'
        }`}
        title={
          isOnline 
            ? `Online: Connected to cloud ledger (${dbStats.ingredientCount + dbStats.finishedCount} cached in IndexedDB)` 
            : `Offline (Cached): Operating from local storage & IndexedDB cache (${dbStats.queueCount} changes queued)`
        }
      >
        {/* Status Dot: Green for online, Amber for offline/cached */}
        <span className="relative flex h-2.5 w-2.5 shrink-0">
          <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
            isOnline ? 'bg-emerald-400' : 'bg-amber-400'
          }`}></span>
          <span className={`relative inline-flex rounded-full h-2.5 w-2.5 ${
            isOnline ? 'bg-emerald-500' : 'bg-amber-500'
          }`}></span>
        </span>

        <span className={`text-[11px] font-bold ${compact ? 'hidden sm:inline' : 'inline'}`}>
          {isOnline ? 'Online' : 'Offline / Cached'}
        </span>

        {dbStats.queueCount > 0 && (
          <span className="px-1.5 py-0.5 bg-amber-600 text-white rounded-full text-[9px] font-mono font-black shrink-0">
            {dbStats.queueCount}
          </span>
        )}
      </button>

      <OfflineSyncModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        isOnline={isOnline}
        dbStats={dbStats}
        onRefreshCache={async () => {
          await forceReCacheInventory();
          await refreshStats();
        }}
        onForceSync={async () => {
          await syncOfflineQueueWithCloud();
          await refreshStats();
        }}
      />
    </>
  );
};
