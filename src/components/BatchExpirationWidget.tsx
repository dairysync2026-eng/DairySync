import React, { useState } from 'react';
import { useDairySync } from '../context/DairySyncContext';
import { BatchExpiryAlert } from '../types';
import { 
  Clock, 
  AlertTriangle, 
  Snowflake, 
  Layers, 
  CheckCircle2, 
  ArrowRight,
  ShieldAlert,
  Flame,
  Filter
} from 'lucide-react';

interface BatchExpirationWidgetProps {
  onNavigateTab?: (tabId: string) => void;
  onSelectColdStorageItem?: (skuOrName: string, batchNumber?: string) => void;
}

export const BatchExpirationWidget: React.FC<BatchExpirationWidgetProps> = ({ 
  onNavigateTab,
  onSelectColdStorageItem 
}) => {
  const { batchExpiries } = useDairySync();
  const [filterLevel, setFilterLevel] = useState<'all' | 'critical_urgent' | 'cold_storage' | 'wip'>('all');
  const [actionNotice, setActionNotice] = useState<string | null>(null);

  const filteredExpiries = batchExpiries.filter(item => {
    if (filterLevel === 'critical_urgent') {
      return item.urgencyLevel === 'critical' || item.urgencyLevel === 'urgent';
    }
    if (filterLevel === 'cold_storage') {
      return item.sourceType === 'cold_storage';
    }
    if (filterLevel === 'wip') {
      return item.sourceType === 'wip_batch';
    }
    return true;
  });

  const criticalCount = batchExpiries.filter(i => i.urgencyLevel === 'critical').length;
  const urgentCount = batchExpiries.filter(i => i.urgencyLevel === 'urgent').length;

  const handleItemAction = (item: BatchExpiryAlert) => {
    if (item.sourceType === 'cold_storage') {
      if (onSelectColdStorageItem) {
        onSelectColdStorageItem(item.batchOrItemNumber, item.name);
        setActionNotice(`Opened adjustment form for ${item.name} (${item.batchOrItemNumber})`);
      } else if (onNavigateTab) {
        onNavigateTab('finished');
      } else {
        setActionNotice(`Inspected ${item.name}: FEFO priority queue logged.`);
      }
    } else {
      if (onNavigateTab) {
        onNavigateTab('wip');
      } else {
        setActionNotice(`WIP Batch ${item.batchOrItemNumber} marked for pasteurization priority.`);
      }
    }
    setTimeout(() => setActionNotice(null), 4000);
  };

  const getUrgencyBadge = (level: BatchExpiryAlert['urgencyLevel'], days: number) => {
    switch (level) {
      case 'critical':
        return (
          <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-xl text-[10px] font-extrabold uppercase bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border border-rose-300 animate-pulse">
            <Flame className="w-3 h-3" />
            <span>Critical ({days}d remaining)</span>
          </span>
        );
      case 'urgent':
        return (
          <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-xl text-[10px] font-extrabold uppercase bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border border-amber-300">
            <AlertTriangle className="w-3 h-3" />
            <span>Urgent ({days}d left)</span>
          </span>
        );
      case 'warning':
        return (
          <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-xl text-[10px] font-extrabold uppercase bg-yellow-100 dark:bg-yellow-950/60 text-yellow-800 dark:text-yellow-300 border border-yellow-300">
            <Clock className="w-3 h-3" />
            <span>Monitor ({days}d left)</span>
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-xl text-[10px] font-extrabold uppercase bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-300">
            <CheckCircle2 className="w-3 h-3" />
            <span>Optimal ({days}d)</span>
          </span>
        );
    }
  };

  return (
    <div id="batch-expiration-widget-card" className="bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-3">
        <div className="flex items-center space-x-2">
          <div className="p-2 rounded-xl bg-rose-100 dark:bg-rose-950/60 text-rose-600">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center space-x-2">
              <span>Batch Expiration & Shelf-Life Radar</span>
              {(criticalCount > 0 || urgentCount > 0) && (
                <span className="px-2 py-0.5 rounded-full text-xs font-mono font-bold bg-rose-100 dark:bg-rose-900/60 text-rose-700 dark:text-rose-200">
                  {criticalCount + urgentCount} Require Action
                </span>
              )}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Cross-referenced WIP and Cold Storage records enforcing First-Expiry First-Out (FEFO) protocol
            </p>
          </div>
        </div>

        {/* Filter Controls */}
        <div className="flex items-center space-x-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl text-xs font-semibold">
          <button
            onClick={() => setFilterLevel('all')}
            className={`px-3 py-1 rounded-lg transition-colors ${
              filterLevel === 'all' 
                ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm' 
                : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            All ({batchExpiries.length})
          </button>
          <button
            onClick={() => setFilterLevel('critical_urgent')}
            className={`px-3 py-1 rounded-lg transition-colors flex items-center space-x-1 ${
              filterLevel === 'critical_urgent' 
                ? 'bg-white dark:bg-slate-900 text-rose-600 shadow-sm' 
                : 'text-slate-500 hover:text-rose-600'
            }`}
          >
            <span>Priority</span>
            <span className="px-1 rounded bg-rose-100 text-rose-800 text-[10px]">
              {criticalCount + urgentCount}
            </span>
          </button>
          <button
            onClick={() => setFilterLevel('cold_storage')}
            className={`px-3 py-1 rounded-lg transition-colors ${
              filterLevel === 'cold_storage' 
                ? 'bg-white dark:bg-slate-900 text-teal-600 shadow-sm' 
                : 'text-slate-500 hover:text-teal-600'
            }`}
          >
            Cold Room
          </button>
          <button
            onClick={() => setFilterLevel('wip')}
            className={`px-3 py-1 rounded-lg transition-colors ${
              filterLevel === 'wip' 
                ? 'bg-white dark:bg-slate-900 text-indigo-600 shadow-sm' 
                : 'text-slate-500 hover:text-indigo-600'
            }`}
          >
            WIP Batches
          </button>
        </div>
      </div>

      {/* Action Notification Banner */}
      {actionNotice && (
        <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 border-2 border-emerald-300 dark:border-emerald-800 rounded-2xl text-xs font-bold text-emerald-800 dark:text-emerald-300 flex items-center justify-between shadow-sm animate-fadeIn">
          <div className="flex items-center space-x-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{actionNotice}</span>
          </div>
          <button 
            onClick={() => setActionNotice(null)}
            className="text-emerald-600 hover:text-emerald-900 text-[11px] font-extrabold uppercase ml-2"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Expiry Items List */}
      <div className="space-y-2.5 max-h-80 overflow-y-auto pr-1">
        {filteredExpiries.map(item => {
          const isCritical = item.urgencyLevel === 'critical';
          const isUrgent = item.urgencyLevel === 'urgent';

          return (
            <div
              key={item.id}
              className={`p-3.5 rounded-2xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                isCritical
                  ? 'bg-rose-50/50 dark:bg-rose-950/20 border-rose-200 dark:border-rose-900/60'
                  : isUrgent
                  ? 'bg-amber-50/50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-900/60'
                  : 'bg-slate-50/70 dark:bg-slate-950/40 border-slate-200 dark:border-slate-800'
              }`}
            >
              <div className="space-y-1">
                <div className="flex items-center space-x-2">
                  {item.sourceType === 'cold_storage' ? (
                    <Snowflake className="w-4 h-4 text-teal-600 shrink-0" />
                  ) : (
                    <Layers className="w-4 h-4 text-indigo-600 shrink-0" />
                  )}
                  <span className="font-bold text-xs text-slate-900 dark:text-white">
                    {item.name}
                  </span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold">
                    {item.batchOrItemNumber}
                  </span>
                  {getUrgencyBadge(item.urgencyLevel, item.daysRemaining)}
                </div>

                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] text-slate-500 dark:text-slate-400">
                  <span>Stock: <strong className="font-mono text-slate-800 dark:text-slate-200">{item.quantity} {item.unit}</strong></span>
                  <span>Mfg: <strong className="font-mono text-slate-800 dark:text-slate-200">{item.manufactureDate}</strong></span>
                  <span>Expires: <strong className="font-mono text-rose-600 dark:text-rose-400">{item.expiryDate}</strong></span>
                  <span>Location: <strong className="text-slate-800 dark:text-slate-200">{item.location}</strong></span>
                </div>

                <div className="text-[11px] text-slate-600 dark:text-slate-300 flex items-center space-x-1.5 pt-0.5">
                  <span className="font-semibold text-slate-700 dark:text-slate-200">Recommended FEFO Action:</span>
                  <span>{item.suggestedAction}</span>
                </div>
              </div>

              {/* Action Button */}
              <div className="flex items-center space-x-2 shrink-0 self-end sm:self-center">
                <button
                  id={`btn-radar-action-${item.id}`}
                  onClick={() => handleItemAction(item)}
                  title={item.sourceType === 'cold_storage' ? 'Adjust Cold Storage Stock & FEFO Buffer' : 'Inspect WIP Pipeline Batch'}
                  className={`flex items-center space-x-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all shadow-sm cursor-pointer ${
                    isCritical
                      ? 'bg-rose-600 hover:bg-rose-700 text-white shadow-rose-900/20'
                      : isUrgent
                      ? 'bg-amber-600 hover:bg-amber-700 text-white shadow-amber-900/20'
                      : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-indigo-900/20'
                  }`}
                >
                  <span>{item.sourceType === 'cold_storage' ? 'Adjust Stock & FEFO' : 'Inspect WIP Batch'}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
