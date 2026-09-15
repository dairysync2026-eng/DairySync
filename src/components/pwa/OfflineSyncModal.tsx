import React, { useState } from 'react';
import { 
  Database, 
  Wifi, 
  WifiOff, 
  RefreshCw, 
  CheckCircle2, 
  AlertTriangle, 
  HardDrive, 
  Package, 
  Layers, 
  Snowflake, 
  ShoppingCart,
  X,
  Clock,
  ShieldCheck
} from 'lucide-react';
import { InventoryDbStats, clearOfflineQueue } from '../../services/inventoryDb';

interface OfflineSyncModalProps {
  isOpen: boolean;
  onClose: () => void;
  isOnline: boolean;
  dbStats: InventoryDbStats;
  onRefreshCache: () => Promise<void>;
  onForceSync: () => Promise<void>;
}

export const OfflineSyncModal: React.FC<OfflineSyncModalProps> = ({
  isOpen,
  onClose,
  isOnline,
  dbStats,
  onRefreshCache,
  onForceSync,
}) => {
  const [syncing, setSyncing] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleManualSync = async () => {
    setSyncing(true);
    setSuccessMsg(null);
    try {
      if (isOnline) {
        await onForceSync();
        setSuccessMsg('Successfully pushed offline modifications and updated cloud cache!');
      } else {
        await onRefreshCache();
        setSuccessMsg('Refreshed local IndexedDB cache snapshot from local storage.');
      }
    } catch (e) {
      console.error(e);
    } finally {
      setSyncing(false);
    }
  };

  const formattedDate = dbStats.lastSynced 
    ? new Date(dbStats.lastSynced).toLocaleString('en-US', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      })
    : 'Not yet cached';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
      <div className="w-full max-w-lg bg-white rounded-3xl shadow-2xl border-2 border-slate-200 overflow-hidden flex flex-col text-slate-800">
        
        {/* Header */}
        <div className="p-6 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className={`p-2.5 rounded-2xl ${isOnline ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40' : 'bg-amber-500/20 text-amber-400 border border-amber-500/40'}`}>
              {isOnline ? <Wifi className="w-5 h-5" /> : <WifiOff className="w-5 h-5" />}
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="text-base font-extrabold text-white">Offline Data &amp; IndexedDB Status</h3>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${isOnline ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'}`}>
                  {isOnline ? 'Internet Online' : 'Offline / Intermittent'}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                PCC-MMSU local inventory persistence layer
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5 overflow-y-auto max-h-[70vh]">
          
          {/* Status Alert Banner */}
          <div className={`p-4 rounded-2xl border text-xs leading-relaxed ${
            isOnline 
              ? 'bg-emerald-50/80 border-emerald-200 text-emerald-900' 
              : 'bg-amber-50/80 border-amber-200 text-amber-900'
          }`}>
            <div className="flex items-start space-x-2.5">
              {isOnline ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              ) : (
                <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              )}
              <div>
                <p className="font-bold">
                  {isOnline 
                    ? 'Cloud Ledger Connected & Synchronized'
                    : 'Intermittent Connection Detected — Offline Fallback Active'}
                </p>
                <p className="mt-0.5 opacity-90 text-[11px]">
                  {isOnline
                    ? 'All critical inventory items (raw milk, sugar, cocoa, bottles, WIP batches, finished goods) are actively backed up to IndexedDB storage so you can continue operating seamlessly during connectivity outages.'
                    : 'Authorized users can continue logging batches, processing sales, and inspecting stock levels. Any offline actions are safely held in the local IndexedDB queue and will automatically push when your network connection resumes.'}
                </p>
              </div>
            </div>
          </div>

          {/* Cached Inventory Records Grid */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3 flex items-center space-x-1.5">
              <Database className="w-3.5 h-3.5 text-blue-600" />
              <span>Local IndexedDB Cached Stores</span>
            </h4>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 text-center">
                <Package className="w-4 h-4 text-blue-600 mx-auto mb-1" />
                <div className="text-lg font-black font-mono text-slate-900">{dbStats.ingredientCount}</div>
                <div className="text-[10px] font-bold text-slate-500">Raw Ingredients</div>
              </div>

              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 text-center">
                <Snowflake className="w-4 h-4 text-teal-600 mx-auto mb-1" />
                <div className="text-lg font-black font-mono text-slate-900">{dbStats.finishedCount}</div>
                <div className="text-[10px] font-bold text-slate-500">Finished Goods</div>
              </div>

              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 text-center">
                <Layers className="w-4 h-4 text-indigo-600 mx-auto mb-1" />
                <div className="text-lg font-black font-mono text-slate-900">{dbStats.wipCount}</div>
                <div className="text-[10px] font-bold text-slate-500">WIP Batches</div>
              </div>

              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 text-center">
                <ShoppingCart className="w-4 h-4 text-emerald-600 mx-auto mb-1" />
                <div className="text-lg font-black font-mono text-slate-900">{dbStats.transactionCount}</div>
                <div className="text-[10px] font-bold text-slate-500">Ledger Records</div>
              </div>
            </div>
          </div>

          {/* Sync Metadata */}
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2 text-xs">
            <div className="flex justify-between items-center text-slate-600">
              <span className="flex items-center space-x-1.5">
                <Clock className="w-3.5 h-3.5 text-slate-400" />
                <span>Last Snapshot Timestamp:</span>
              </span>
              <span className="font-mono font-bold text-slate-800">{formattedDate}</span>
            </div>

            <div className="flex justify-between items-center text-slate-600">
              <span className="flex items-center space-x-1.5">
                <HardDrive className="w-3.5 h-3.5 text-slate-400" />
                <span>Pending Offline Sync Queue:</span>
              </span>
              <span className={`font-mono font-bold ${dbStats.queueCount > 0 ? 'text-amber-600' : 'text-emerald-600'}`}>
                {dbStats.queueCount} {dbStats.queueCount === 1 ? 'action pending' : 'actions pending'}
              </span>
            </div>

            <div className="flex justify-between items-center text-slate-600">
              <span className="flex items-center space-x-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
                <span>Service Worker Engine:</span>
              </span>
              <span className="font-semibold text-emerald-600">Active (Workbox PWA)</span>
            </div>
          </div>

          {successMsg && (
            <div className="p-3 rounded-xl bg-emerald-100 text-emerald-800 text-xs font-medium flex items-center space-x-2 border border-emerald-200">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}
        </div>

        {/* Footer actions */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3">
          <button
            onClick={handleManualSync}
            disabled={syncing}
            className="w-full sm:w-auto px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-sm transition flex items-center justify-center space-x-2 disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${syncing ? 'animate-spin' : ''}`} />
            <span>{isOnline ? 'Force Cloud & Cache Sync' : 'Refresh Offline Snapshot'}</span>
          </button>

          <button
            onClick={onClose}
            className="w-full sm:w-auto px-4 py-2.5 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-xl text-xs font-bold transition"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
};
