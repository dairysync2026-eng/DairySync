import React, { useState, useMemo } from 'react';
import { useDairySync } from '../context/DairySyncContext';
import { WipBatch } from '../types';
import { 
  History, 
  CheckCircle2, 
  XCircle, 
  Search, 
  Download, 
  Filter, 
  BarChart3, 
  Milk, 
  User, 
  Calendar, 
  Clock, 
  ArrowUpRight,
  ShieldCheck,
  RotateCcw,
  Sparkles
} from 'lucide-react';
import { ExportMenu } from './ExportMenu';

export const HistoricalBatchesTable: React.FC = () => {
  const { wipBatches, finishedGoods } = useDairySync();
  const [filterStatus, setFilterStatus] = useState<'all' | 'completed' | 'cancelled'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBatchForDetails, setSelectedBatchForDetails] = useState<WipBatch | null>(null);

  // All historical batches (completed or cancelled)
  const historicalBatches = useMemo(() => {
    return wipBatches.filter(b => b.status === 'completed' || b.status === 'cancelled');
  }, [wipBatches]);

  // Filtered by search and status
  const filteredBatches = useMemo(() => {
    return historicalBatches.filter(batch => {
      if (filterStatus !== 'all' && batch.status !== filterStatus) {
        return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesNumber = batch.batchNumber.toLowerCase().includes(q);
        const matchesProduct = batch.productName.toLowerCase().includes(q);
        const matchesStaff = batch.assignedStaff.toLowerCase().includes(q);
        const matchesNotes = (batch.notes || '').toLowerCase().includes(q);
        const matchesReason = (batch.cancellationReason || '').toLowerCase().includes(q);
        return matchesNumber || matchesProduct || matchesStaff || matchesNotes || matchesReason;
      }
      return true;
    });
  }, [historicalBatches, filterStatus, searchQuery]);

  // Performance Analysis KPIs
  const completedBatches = historicalBatches.filter(b => b.status === 'completed');
  const cancelledBatches = historicalBatches.filter(b => b.status === 'cancelled');

  const totalCompletedUnits = completedBatches.reduce((acc, b) => acc + b.targetQuantity, 0);
  const totalRawMilkProcessed = completedBatches.reduce((acc, b) => acc + b.rawMilkVolumeUsed, 0);
  const avgYieldRatio = totalRawMilkProcessed > 0 
    ? (totalCompletedUnits / totalRawMilkProcessed).toFixed(2) 
    : '0.00';

  const completionSuccessRate = historicalBatches.length > 0
    ? Math.round((completedBatches.length / historicalBatches.length) * 100)
    : 100;

  // Export CSV
  const handleExportCsv = () => {
    const headers = [
      'Batch Number',
      'Product Name',
      'Status',
      'Target Output (units)',
      'Raw Milk Used (L)',
      'Assigned Staff',
      'Start Date',
      'Completed/Cancelled Date',
      'Quality Notes / Reason'
    ];

    const rows = filteredBatches.map(b => [
      `"${b.batchNumber}"`,
      `"${b.productName}"`,
      `"${b.status.toUpperCase()}"`,
      b.targetQuantity,
      b.rawMilkVolumeUsed,
      `"${b.assignedStaff}"`,
      `"${b.startDate}"`,
      `"${b.completedAt || b.cancelledAt || 'N/A'}"`,
      `"${(b.status === 'cancelled' ? b.cancellationReason : b.notes) || ''}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `DairySync_Historical_Batches_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div id="historical-batches-section" className="bg-white border-2 border-slate-200 rounded-3xl p-6 shadow-sm space-y-6">
      
      {/* Header and Title */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-4">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-2xl bg-indigo-50 border border-indigo-200 text-indigo-700 flex items-center justify-center font-bold">
            <History className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h3 className="text-base font-extrabold text-slate-900">Historical Batches & Performance Log</h3>
              <span className="text-[10px] font-mono font-bold bg-indigo-100 text-indigo-800 px-2 py-0.5 rounded-full">
                {historicalBatches.length} Archived
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5 font-medium">
              Performance analysis, output yields, and audit trail for all completed and cancelled dairy production runs.
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2 shrink-0">
          <ExportMenu onPdf={() => window.print()} onCsv={handleExportCsv} />
        </div>
      </div>

      {/* Performance Analytics Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-1">
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">Finished Units Output</span>
          <div className="flex items-baseline space-x-1.5">
            <span className="text-2xl font-black font-mono text-emerald-600">{totalCompletedUnits.toLocaleString()}</span>
            <span className="text-xs text-slate-500 font-bold">units</span>
          </div>
          <p className="text-[11px] text-slate-500 font-medium">Across {completedBatches.length} successful batch runs</p>
        </div>

        <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-1">
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">Raw Milk Converted</span>
          <div className="flex items-baseline space-x-1.5">
            <span className="text-2xl font-black font-mono text-indigo-600">{totalRawMilkProcessed.toLocaleString()}</span>
            <span className="text-xs text-slate-500 font-bold">Liters</span>
          </div>
          <p className="text-[11px] text-slate-500 font-medium">Pure carabao dairy intake converted</p>
        </div>

        <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-1">
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">Yield Ratio</span>
          <div className="flex items-baseline space-x-1.5">
            <span className="text-2xl font-black font-mono text-slate-900">{avgYieldRatio}</span>
            <span className="text-xs text-slate-500 font-bold">units/L</span>
          </div>
          <p className="text-[11px] text-slate-500 font-medium">Product efficiency conversion factor</p>
        </div>

        <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-1">
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">Production Run Success</span>
          <div className="flex items-baseline space-x-1.5">
            <span className="text-2xl font-black font-mono text-teal-600">{completionSuccessRate}%</span>
            <span className="text-xs text-slate-500 font-bold">rate</span>
          </div>
          <p className="text-[11px] text-slate-500 font-medium">
            {cancelledBatches.length > 0 ? `${cancelledBatches.length} cancelled with 100% material refund` : 'Zero batch aborts'}
          </p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            id="input-search-historical-batches"
            type="text"
            placeholder="Search by batch #, product formula, specialist, or notes..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-indigo-500 transition-colors"
          />
        </div>

        {/* Filter Pills */}
        <div className="flex items-center space-x-1.5 bg-slate-100 p-1 rounded-2xl border border-slate-200 text-xs font-bold">
          <button
            type="button"
            onClick={() => setFilterStatus('all')}
            className={`px-3 py-1.5 rounded-xl transition-all ${
              filterStatus === 'all'
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            All ({historicalBatches.length})
          </button>
          <button
            type="button"
            onClick={() => setFilterStatus('completed')}
            className={`px-3 py-1.5 rounded-xl transition-all ${
              filterStatus === 'completed'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Completed ({completedBatches.length})
          </button>
          <button
            type="button"
            onClick={() => setFilterStatus('cancelled')}
            className={`px-3 py-1.5 rounded-xl transition-all ${
              filterStatus === 'cancelled'
                ? 'bg-rose-600 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Cancelled ({cancelledBatches.length})
          </button>
        </div>
      </div>

      {/* Historical Table */}
      <div className="overflow-x-auto border border-slate-200 rounded-2xl">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200 text-slate-700 font-extrabold">
              <th className="py-3 px-4">Batch Number & Formula</th>
              <th className="py-3 px-4">Status</th>
              <th className="py-3 px-4">Output & Milk Usage</th>
              <th className="py-3 px-4">Production Lead</th>
              <th className="py-3 px-4">Execution Timeline</th>
              <th className="py-3 px-4">Performance & Audit Notes</th>
              <th className="py-3 px-4 text-right">Details</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredBatches.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-12 text-center text-slate-400 font-medium">
                  No historical batches match the active filter criteria.
                </td>
              </tr>
            ) : (
              filteredBatches.map(batch => {
                const isCompleted = batch.status === 'completed';
                const yieldEfficiency = batch.rawMilkVolumeUsed > 0 
                  ? (batch.targetQuantity / batch.rawMilkVolumeUsed).toFixed(2) 
                  : 'N/A';

                return (
                  <tr key={batch.id} className="hover:bg-slate-50/80 transition-colors">
                    {/* Batch Number & Product */}
                    <td className="py-3 px-4">
                      <div className="space-y-0.5">
                        <span className="font-mono font-bold text-xs text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-md border border-indigo-100">
                          {batch.batchNumber}
                        </span>
                        <p className="font-extrabold text-slate-900 text-xs mt-1">{batch.productName}</p>
                      </div>
                    </td>

                    {/* Status Badge */}
                    <td className="py-3 px-4">
                      {isCompleted ? (
                        <span className="inline-flex items-center space-x-1 bg-emerald-100 text-emerald-800 border border-emerald-300 font-bold px-2.5 py-0.5 rounded-full text-[10px]">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                          <span>Completed</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center space-x-1 bg-rose-100 text-rose-800 border border-rose-300 font-bold px-2.5 py-0.5 rounded-full text-[10px]">
                          <XCircle className="w-3 h-3 text-rose-600" />
                          <span>Cancelled</span>
                        </span>
                      )}
                    </td>

                    {/* Output & Milk Usage */}
                    <td className="py-3 px-4">
                      <div className="space-y-0.5">
                        <div className="font-bold text-slate-900">
                          {batch.targetQuantity.toLocaleString()} units
                        </div>
                        <div className="text-[11px] text-slate-500 font-medium">
                          Raw Milk: <span className="font-bold text-indigo-600">{batch.rawMilkVolumeUsed} L</span> ({yieldEfficiency} u/L)
                        </div>
                      </div>
                    </td>

                    {/* Personnel */}
                    <td className="py-3 px-4">
                      <div className="flex items-center space-x-1.5 text-slate-700 font-semibold">
                        <User className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span>{batch.assignedStaff}</span>
                      </div>
                    </td>

                    {/* Timeline */}
                    <td className="py-3 px-4">
                      <div className="text-[11px] space-y-0.5 font-mono">
                        <div className="text-slate-600">Started: {batch.startDate}</div>
                        <div className={isCompleted ? 'text-emerald-700 font-semibold' : 'text-rose-700 font-semibold'}>
                          {isCompleted ? `Done: ${batch.completedAt || batch.estimatedCompletion}` : `Cancelled: ${batch.cancelledAt || 'Recorded'}`}
                        </div>
                      </div>
                    </td>

                    {/* Quality Notes */}
                    <td className="py-3 px-4 max-w-xs">
                      {isCompleted ? (
                        <p className="text-[11px] text-slate-600 truncate font-medium" title={batch.notes}>
                          {batch.notes || 'Passed laboratory quality verification.'}
                        </p>
                      ) : (
                        <div className="space-y-0.5">
                          <p className="text-[11px] text-rose-700 font-medium truncate" title={batch.cancellationReason}>
                            Reason: {batch.cancellationReason || 'Prior to heating process'}
                          </p>
                          <span className="text-[10px] text-emerald-700 font-bold flex items-center space-x-1">
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                            <span>100% Restored</span>
                          </span>
                        </div>
                      )}
                    </td>

                    {/* View Details Button */}
                    <td className="py-3 px-4 text-right">
                      <button
                        type="button"
                        onClick={() => setSelectedBatchForDetails(batch)}
                        className="px-2.5 py-1 text-[11px] font-bold text-indigo-600 hover:text-indigo-800 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition-colors"
                      >
                        Inspect
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Inspect Batch Details Modal */}
      {selectedBatchForDetails && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white border-2 border-slate-200 rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-4 text-slate-900 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold">
                  <History className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-base text-slate-900">Historical Batch Details</h3>
                  <p className="text-xs text-slate-500 font-mono font-bold">{selectedBatchForDetails.batchNumber}</p>
                </div>
              </div>
              <button 
                onClick={() => setSelectedBatchForDetails(null)} 
                className="text-slate-400 hover:text-slate-900"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 space-y-1.5">
                <div className="flex justify-between">
                  <span className="text-slate-500 font-semibold">Formula / Product:</span>
                  <span className="font-extrabold text-slate-900">{selectedBatchForDetails.productName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500 font-semibold">Batch Status:</span>
                  <span className={`font-bold capitalize ${selectedBatchForDetails.status === 'completed' ? 'text-emerald-700' : 'text-rose-700'}`}>
                    {selectedBatchForDetails.status}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500 font-semibold">Total Output:</span>
                  <span className="font-mono font-bold text-slate-900">{selectedBatchForDetails.targetQuantity} units</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500 font-semibold">Carabao Milk Allocated:</span>
                  <span className="font-mono font-bold text-indigo-600">{selectedBatchForDetails.rawMilkVolumeUsed} Liters</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500 font-semibold">Assigned Staff Specialist:</span>
                  <span className="font-bold text-slate-800">{selectedBatchForDetails.assignedStaff}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500 font-semibold">Cold Storage Temperature:</span>
                  <span className="font-mono font-bold text-slate-800">{selectedBatchForDetails.coldStorageTemp}</span>
                </div>
              </div>

              {/* Ingredients BOM Allocated */}
              <div className="border border-slate-200 rounded-2xl p-3 space-y-2">
                <span className="font-bold text-[11px] text-slate-700 uppercase tracking-wider block">
                  Bill of Materials (BOM) Record
                </span>
                <div className="space-y-1">
                  {selectedBatchForDetails.ingredientsUsed.map((ing, idx) => (
                    <div key={idx} className="flex justify-between text-[11px] text-slate-600">
                      <span>{ing.ingredientName}</span>
                      <span className="font-mono font-bold text-slate-800">{ing.quantity} {ing.unit}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Notes or Reason */}
              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 space-y-1">
                <span className="font-bold text-[11px] text-slate-700 uppercase tracking-wider block">
                  {selectedBatchForDetails.status === 'cancelled' ? 'Cancellation Safeguard Audit' : 'Quality Clearance & Notes'}
                </span>
                <p className="text-[11px] text-slate-700 leading-relaxed font-medium">
                  {selectedBatchForDetails.status === 'cancelled'
                    ? selectedBatchForDetails.cancellationReason || 'Prior to heating process. Zero material wastage.'
                    : selectedBatchForDetails.notes || 'Lab test passed.'}
                </p>
              </div>
            </div>

            <div className="pt-2 flex justify-end border-t border-slate-100">
              <button
                type="button"
                onClick={() => setSelectedBatchForDetails(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-2xl transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
