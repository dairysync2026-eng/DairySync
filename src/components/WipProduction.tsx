import React, { useState } from 'react';
import { useDairySync } from '../context/DairySyncContext';
import { WipStep, WipBatch } from '../types';
import { HistoricalBatchesTable } from './HistoricalBatchesTable';
import { 
  Layers, 
  Plus, 
  ArrowRight, 
  CheckCircle2, 
  AlertCircle, 
  Clock, 
  User, 
  Thermometer, 
  X, 
  Play,
  ShieldAlert,
  RotateCcw,
  Archive,
  History,
  AlertTriangle
} from 'lucide-react';

export const WipProduction: React.FC = () => {
  const { 
    wipBatches, 
    finishedGoods, 
    ingredients, 
    createWipBatch, 
    advanceWipBatchStep,
    cancelWipBatch,
    currentUser
  } = useDairySync();

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedProductId, setSelectedProductId] = useState<string>(finishedGoods[0]?.id || '');
  const [targetQtyStr, setTargetQtyStr] = useState<string>('300');
  const [multiplierStr, setMultiplierStr] = useState<string>('1.0');
  const [multiplierPreset, setMultiplierPreset] = useState<string>('1.0');
  const [assignedStaff, setAssignedStaff] = useState<string>(currentUser.name);
  const [batchNotes, setBatchNotes] = useState<string>('');
  const [feedbackMessage, setFeedbackMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Cancellation state
  const [batchToCancel, setBatchToCancel] = useState<WipBatch | null>(null);
  const [cancelReasonInput, setCancelReasonInput] = useState<string>('');
  const [showCancelledArchive, setShowCancelledArchive] = useState<boolean>(false);

  const selectedProduct = finishedGoods.find(p => p.id === selectedProductId);
  const baseBatch = selectedProduct?.batchUnitQuantity || 100;

  // Linked handlers for typeable target quantity and formula multiplier
  const handleTargetQtyChange = (val: string) => {
    setTargetQtyStr(val);
    const num = parseFloat(val);
    if (!isNaN(num) && num > 0 && baseBatch > 0) {
      const calculatedMult = Number((num / baseBatch).toFixed(2));
      setMultiplierStr(String(calculatedMult));
      setMultiplierPreset('custom');
    }
  };

  const handleMultiplierChange = (val: string) => {
    setMultiplierStr(val);
    const mult = parseFloat(val);
    if (!isNaN(mult) && mult > 0 && baseBatch > 0) {
      const calculatedQty = Math.round(mult * baseBatch);
      setTargetQtyStr(String(calculatedQty));
      setMultiplierPreset('custom');
    }
  };

  const handlePresetChange = (presetVal: string) => {
    setMultiplierPreset(presetVal);
    if (presetVal !== 'custom') {
      const mult = parseFloat(presetVal);
      setMultiplierStr(presetVal);
      const calculatedQty = Math.round(mult * baseBatch);
      setTargetQtyStr(String(calculatedQty));
    }
  };

  const handleProductSelect = (prodId: string) => {
    setSelectedProductId(prodId);
    const prod = finishedGoods.find(p => p.id === prodId);
    const newBase = prod?.batchUnitQuantity || 100;
    const mult = parseFloat(multiplierStr) || 1;
    setTargetQtyStr(String(Math.round(mult * newBase)));
  };

  const targetQty = Math.max(1, parseFloat(targetQtyStr) || 1);
  const multiplier = Math.max(0.01, parseFloat(multiplierStr) || (targetQty / baseBatch));

  // Calculate BOM requirements dynamically
  const computedBom = selectedProduct ? selectedProduct.recipe.map(r => {
    const ing = ingredients.find(i => i.id === r.ingredientId);
    const needed = r.quantityRequired * multiplier;
    const available = ing ? ing.currentStock : 0;
    const isSufficient = available >= needed;
    return {
      ...r,
      needed,
      available,
      isSufficient
    };
  }) : [];

  const rawMilkRequirement = computedBom.find(b => b.ingredientId === 'ing-1')?.needed || (targetQty * 0.3);

  const handleCreateBatch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProduct) return;

    const result = createWipBatch({
      productId: selectedProduct.id,
      productName: selectedProduct.name,
      targetQuantity: targetQty,
      rawMilkVolumeUsed: rawMilkRequirement,
      assignedStaff: assignedStaff || currentUser.name,
      notes: batchNotes
    });

    if (result.success) {
      setFeedbackMessage({ type: 'success', text: result.message });
      setShowCreateModal(false);
      setBatchNotes('');
    } else {
      setFeedbackMessage({ type: 'error', text: result.message });
    }
  };

  const handleConfirmCancelBatch = () => {
    if (!batchToCancel) return;
    const res = cancelWipBatch(batchToCancel.id, cancelReasonInput.trim() || 'Operator cancelled prior to pasteurization');
    setFeedbackMessage({
      type: res.success ? 'success' : 'error',
      text: res.message
    });
    setBatchToCancel(null);
    setCancelReasonInput('');
  };

  const steps: { key: WipStep; label: string; desc: string }[] = [
    { key: 'scheduled', label: '1. Scheduled Batch', desc: 'Raw milk & materials allocated' },
    { key: 'pasteurization', label: '2. Pasteurization', desc: '72°C - 75°C holding tank' },
    { key: 'homogenization', label: '3. Homogenization', desc: 'Flavoring & consistency mix' },
    { key: 'cooling_bottling', label: '4. Bottling & Cooling', desc: 'Cold storage chill to 4°C' },
    { key: 'completed', label: '5. Finished Goods Release', desc: 'Moved to central cold storage' }
  ];

  const getBatchesByStep = (step: WipStep) => wipBatches.filter(b => b.status === step);

  return (
    <div className="space-y-6">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white border-2 border-slate-200 p-6 rounded-3xl shadow-sm text-slate-900">
        <div>
          <h1 className="text-xl font-extrabold text-slate-900 flex items-center space-x-2 tracking-tight">
            <Layers className="w-6 h-6 text-indigo-600" />
            <span>Work-In-Progress (WIP) Production Pipeline</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1 font-medium">
            Real-time batch lifecycle tracking with automated Bill of Materials (BOM) ingredient deduction
          </p>
        </div>

        <button
          onClick={() => {
            setFeedbackMessage(null);
            setShowCreateModal(true);
          }}
          className="flex items-center space-x-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold px-4 py-2.5 rounded-2xl shadow-sm transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>Start New Production Batch</span>
        </button>
      </div>

      {/* Global Feedback Banner */}
      {feedbackMessage && (
        <div className={`p-4 rounded-2xl border-2 text-xs flex items-center justify-between font-semibold ${
          feedbackMessage.type === 'success' 
            ? 'bg-emerald-50 border-emerald-200 text-emerald-900' 
            : 'bg-rose-50 border-rose-200 text-rose-900'
        }`}>
          <div className="flex items-center space-x-2">
            {feedbackMessage.type === 'success' ? <CheckCircle2 className="w-4 h-4 text-emerald-600" /> : <ShieldAlert className="w-4 h-4 text-rose-600" />}
            <span>{feedbackMessage.text}</span>
          </div>
          <button onClick={() => setFeedbackMessage(null)} className="text-slate-400 hover:text-slate-900">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Pipeline Kanban View */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {steps.map(step => {
          const columnBatches = getBatchesByStep(step.key);

          return (
            <div key={step.key} className="bg-white border-2 border-slate-200 rounded-3xl p-4 flex flex-col min-h-[480px] shadow-sm">
              
              {/* Column Header */}
              <div className="pb-3 mb-3 border-b-2 border-slate-100">
                <div className="flex items-center justify-between">
                  <span className="font-extrabold text-xs text-slate-900">{step.label}</span>
                  <span className="text-[10px] font-mono font-bold bg-indigo-50 border border-indigo-100 px-2.5 py-0.5 rounded-full text-indigo-700">
                    {columnBatches.length}
                  </span>
                </div>
                <p className="text-[10px] text-slate-400 mt-1 font-medium">{step.desc}</p>
              </div>

              {/* Column Batch Cards */}
              <div className="space-y-3 flex-1 overflow-y-auto">
                {columnBatches.length === 0 ? (
                  <div className="text-center py-12 text-[11px] text-slate-400 font-medium border-2 border-dashed border-slate-200 rounded-2xl">
                    No active batches in step
                  </div>
                ) : (
                  columnBatches.map(batch => (
                    <div 
                      key={batch.id} 
                      className={`p-3.5 rounded-2xl border-2 space-y-2.5 text-xs transition-all ${
                        batch.status === 'completed'
                          ? 'bg-slate-50 border-slate-200 opacity-60'
                          : 'bg-white border-slate-200 hover:border-indigo-400 shadow-sm text-slate-900'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-mono font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-full border border-indigo-100">
                          {batch.batchNumber}
                        </span>
                        <span className="text-[10px] text-slate-500 font-mono font-bold flex items-center space-x-1">
                          <Thermometer className="w-3 h-3 text-amber-500" />
                          <span>{batch.coldStorageTemp}</span>
                        </span>
                      </div>

                      <h4 className="font-extrabold text-slate-900 text-xs leading-snug">{batch.productName}</h4>
                      
                      <div className="flex justify-between text-[11px] text-slate-700 bg-slate-50 p-2.5 rounded-xl border border-slate-200 font-semibold">
                        <span>Target: <strong className="text-slate-900">{batch.targetQuantity}</strong></span>
                        <span>Raw Milk: <strong className="text-indigo-600">{batch.rawMilkVolumeUsed} L</strong></span>
                      </div>

                      <div className="text-[10px] text-slate-500 space-y-0.5 font-medium">
                        <p className="flex items-center space-x-1">
                          <User className="w-3 h-3 text-slate-400" />
                          <span>{batch.assignedStaff}</span>
                        </p>
                        {batch.notes && (
                          <p className="text-slate-500 italic truncate">"{batch.notes}"</p>
                        )}
                      </div>

                      {/* Advance Step Button */}
                      {batch.status !== 'completed' && (
                        <div className="pt-2 border-t border-slate-100 flex justify-end">
                          {batch.status === 'scheduled' && (
                            <div className="flex items-center space-x-2 w-full">
                              <button
                                onClick={() => {
                                  setBatchToCancel(batch);
                                  setCancelReasonInput('');
                                }}
                                className="px-2.5 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 font-bold text-[11px] rounded-xl flex items-center justify-center space-x-1 transition-colors shrink-0"
                                title="Cancel scheduled batch and restore raw materials"
                              >
                                <X className="w-3.5 h-3.5 text-rose-600" />
                                <span>Cancel</span>
                              </button>
                              <button
                                onClick={() => advanceWipBatchStep(batch.id, 'pasteurization')}
                                className="flex-1 bg-amber-500 hover:bg-amber-600 text-white font-bold text-[11px] py-2 rounded-xl flex items-center justify-center space-x-1 shadow-sm transition-colors"
                              >
                                <span>Start Pasteurization</span>
                                <ArrowRight className="w-3 h-3" />
                              </button>
                            </div>
                          )}
                          {batch.status === 'pasteurization' && (
                            <button
                              onClick={() => advanceWipBatchStep(batch.id, 'homogenization')}
                              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-[11px] py-2 rounded-xl flex items-center justify-center space-x-1 shadow-sm"
                            >
                              <span>Move to Homogenizer</span>
                              <ArrowRight className="w-3 h-3" />
                            </button>
                          )}
                          {batch.status === 'homogenization' && (
                            <button
                              onClick={() => advanceWipBatchStep(batch.id, 'cooling_bottling')}
                              className="w-full bg-teal-600 hover:bg-teal-700 text-white font-bold text-[11px] py-2 rounded-xl flex items-center justify-center space-x-1 shadow-sm"
                            >
                              <span>Move to Bottling Line</span>
                              <ArrowRight className="w-3 h-3" />
                            </button>
                          )}
                          {batch.status === 'cooling_bottling' && (
                            <button
                              onClick={() => advanceWipBatchStep(batch.id, 'completed')}
                              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[11px] py-2 rounded-xl flex items-center justify-center space-x-1 shadow-sm"
                            >
                              <CheckCircle2 className="w-3 h-3" />
                              <span>Release to Finished Goods</span>
                            </button>
                          )}
                        </div>
                      )}

                    </div>
                  ))
                )}
              </div>

            </div>
          );
        })}
      </div>

      {/* Comprehensive Historical Batches Table & Performance Analysis */}
      <HistoricalBatchesTable />

      {/* Cancellation Confirmation & Reason Modal */}
      {batchToCancel && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white border-2 border-slate-200 rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-4 text-slate-900 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 rounded-xl bg-rose-100 text-rose-600 flex items-center justify-center font-bold">
                  <X className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-base text-slate-900">Cancel Scheduled Batch</h3>
                  <p className="text-xs text-slate-500 font-medium">Batch Ref: <span className="font-mono font-bold text-slate-700">{batchToCancel.batchNumber}</span></p>
                </div>
              </div>
              <button onClick={() => setBatchToCancel(null)} className="text-slate-400 hover:text-slate-900">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Safety Guarantee Callout */}
            <div className="p-4 bg-emerald-50 border-2 border-emerald-200 rounded-2xl space-y-1.5 text-xs text-emerald-900">
              <div className="flex items-center space-x-2 font-extrabold text-emerald-800">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Zero Material Wastage Safeguard</span>
              </div>
              <p className="text-[11px] text-emerald-700 leading-relaxed">
                Because this batch is still in <strong>1. Scheduled Batch</strong> (prior to pasteurization/heating), cancelling will <strong>immediately restore all allocated raw materials</strong> back to warehouse inventory. Raw milk volume and ingredients will NOT be wasted or deducted.
              </p>
              
              <div className="mt-2 pt-2 border-t border-emerald-200/80">
                <p className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider mb-1">Materials Returning to Stock:</p>
                <div className="flex flex-wrap gap-1.5">
                  <span className="bg-white/80 border border-emerald-300 px-2 py-0.5 rounded-lg text-[10px] font-bold text-emerald-800">
                    Raw Milk: +{batchToCancel.rawMilkVolumeUsed} L
                  </span>
                  {batchToCancel.ingredientsUsed.map((ing, idx) => (
                    <span key={idx} className="bg-white/80 border border-emerald-300 px-2 py-0.5 rounded-lg text-[10px] font-bold text-emerald-800">
                      {ing.ingredientName}: +{ing.quantity} {ing.unit}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Target Batch Info */}
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-3 text-xs space-y-1">
              <div className="flex justify-between">
                <span className="text-slate-500 font-semibold">Target Formula:</span>
                <span className="font-extrabold text-slate-800">{batchToCancel.productName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 font-semibold">Scheduled Target Output:</span>
                <span className="font-mono font-bold text-slate-800">{batchToCancel.targetQuantity} units</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 font-semibold">Scheduled Operator:</span>
                <span className="font-bold text-slate-700">{batchToCancel.assignedStaff}</span>
              </div>
            </div>

            {/* Reason input */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Reason for Cancellation (Audit Trail)
              </label>
              <input
                type="text"
                placeholder="e.g. Scheduled tank maintenance, line realignment, milk quality re-test"
                value={cancelReasonInput}
                onChange={e => setCancelReasonInput(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-white border-2 border-slate-200 rounded-2xl text-xs text-slate-900 focus:outline-none focus:border-rose-500 shadow-sm"
              />
              {/* Quick Reason Chips */}
              <div className="flex flex-wrap gap-1.5 mt-2">
                {[
                  'Line equipment maintenance',
                  'Raw milk quality re-inspection',
                  'Rescheduled production schedule',
                  'Operator reassignment'
                ].map(chip => (
                  <button
                    key={chip}
                    type="button"
                    onClick={() => setCancelReasonInput(chip)}
                    className="text-[10px] bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium px-2 py-0.5 rounded-lg transition-colors border border-slate-200"
                  >
                    + {chip}
                  </button>
                ))}
              </div>
            </div>

            {/* Modal Actions */}
            <div className="pt-2 flex justify-end space-x-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setBatchToCancel(null)}
                className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-2xl transition-colors"
              >
                Keep Scheduled Batch
              </button>
              <button
                type="button"
                onClick={handleConfirmCancelBatch}
                className="px-5 py-2.5 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-2xl shadow-sm transition-all flex items-center space-x-1.5"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Confirm Cancellation & Restore Stock</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Start Production Batch Modal with Automated BOM Inspection */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white border-2 border-slate-200 rounded-3xl max-w-xl w-full p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto text-slate-900">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="font-extrabold text-lg text-slate-900">Initialize Production Batch</h3>
                <p className="text-xs text-slate-500 font-medium">Automated Bill of Materials (BOM) verification engine</p>
              </div>
              <button onClick={() => setShowCreateModal(false)} className="text-slate-400 hover:text-slate-900">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateBatch} className="space-y-4">
              
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1">Select Dairy Product Formula</label>
                <select
                  value={selectedProductId}
                  onChange={e => handleProductSelect(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-white border-2 border-slate-200 rounded-2xl text-xs text-slate-900 font-semibold focus:outline-none focus:border-indigo-500 shadow-sm"
                >
                  {finishedGoods.map(fg => (
                    <option key={fg.id} value={fg.id}>
                      {fg.name} ({fg.category}) — Base Batch: {fg.batchUnitQuantity || 100} {fg.unit || 'units'}
                    </option>
                  ))}
                </select>
              </div>

              {/* Target Batch Quantity & Formula Multiplier Controls */}
              <div className="p-4 bg-slate-50 rounded-2xl border-2 border-slate-200 space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  {/* Target Batch Quantity */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Target Batch Quantity ({selectedProduct?.unit || 'bottles'})
                    </label>
                    <input 
                      type="number" 
                      step="1"
                      min="1"
                      required
                      value={targetQtyStr}
                      onChange={e => handleTargetQtyChange(e.target.value)}
                      placeholder="e.g. 300"
                      className="w-full px-3.5 py-2.5 bg-white border-2 border-indigo-400 rounded-2xl text-xs text-slate-900 font-mono font-extrabold shadow-sm focus:outline-none focus:border-indigo-600"
                    />
                    <div className="flex items-center gap-1.5 mt-1.5 flex-wrap">
                      {[
                        { label: '+50', add: 50 },
                        { label: '+100', add: 100 },
                        { label: '+250', add: 250 },
                        { label: 'Reset (1x)', val: baseBatch }
                      ].map((btn, i) => (
                        <button
                          key={i}
                          type="button"
                          onClick={() => {
                            if ('add' in btn) {
                              handleTargetQtyChange(String((parseFloat(targetQtyStr) || 0) + btn.add));
                            } else if (btn.val) {
                              handleTargetQtyChange(String(btn.val));
                            }
                          }}
                          className="px-2 py-0.5 bg-white hover:bg-slate-200 border border-slate-200 rounded-lg text-[10px] font-mono font-semibold text-slate-700 shadow-2xs"
                        >
                          {btn.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Formula Multiplier: Dropdown Menu + Numeric Input */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Formula Multiplier
                    </label>

                    <div className="grid grid-cols-2 gap-2">
                      {/* Dropdown Menu */}
                      <select
                        value={multiplierPreset}
                        onChange={e => handlePresetChange(e.target.value)}
                        className="w-full px-2.5 py-2.5 bg-white border-2 border-slate-200 rounded-2xl text-xs text-slate-900 font-bold focus:outline-none focus:border-emerald-500 shadow-sm"
                      >
                        <option value="0.5">0.5x (Half)</option>
                        <option value="1.0">1.0x (Standard)</option>
                        <option value="1.5">1.5x (Medium)</option>
                        <option value="2.0">2.0x (Double)</option>
                        <option value="3.0">3.0x (Triple)</option>
                        <option value="5.0">5.0x (Commercial)</option>
                        <option value="custom">Custom...</option>
                      </select>

                      {/* Typeable Input */}
                      <div className="relative">
                        <input
                          type="number"
                          step="0.05"
                          min="0.01"
                          value={multiplierStr}
                          onChange={e => handleMultiplierChange(e.target.value)}
                          placeholder="1.0"
                          className="w-full px-3 py-2.5 pr-7 bg-white border-2 border-emerald-400 rounded-2xl text-xs text-slate-900 font-mono font-extrabold shadow-sm focus:outline-none focus:border-emerald-600"
                        />
                        <span className="absolute right-2.5 top-2.5 text-xs text-slate-400 font-bold">x</span>
                      </div>
                    </div>
                    <p className="text-[10px] text-slate-500 mt-1">
                      Base formula: {baseBatch} units per 1.0x batch.
                    </p>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Assigned Dairy Specialist</label>
                  <input 
                    type="text" 
                    value={assignedStaff}
                    onChange={e => setAssignedStaff(e.target.value)}
                    placeholder="Operator name..."
                    className="w-full px-3.5 py-2 bg-white border-2 border-slate-200 rounded-2xl text-xs text-slate-900 font-semibold"
                  />
                </div>
              </div>

              {/* Automated BOM Ingredient Inspector Box */}
              <div className="p-4 rounded-2xl bg-slate-50 border-2 border-slate-200 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">Required Bill of Materials (BOM)</span>
                  <span className="text-[10px] text-indigo-600 font-mono font-bold">Multiplier: {multiplier.toFixed(2)}x ({targetQty} units)</span>
                </div>

                <div className="divide-y divide-slate-200 text-xs">
                  {computedBom.map((req, idx) => (
                    <div key={idx} className="py-2.5 flex items-center justify-between">
                      <div className="space-y-0.5">
                        <p className="font-bold text-slate-900">{req.ingredientName}</p>
                        <p className="text-[11px] text-slate-500 font-medium">
                          Need: <strong className="text-slate-900 font-bold">{req.needed.toFixed(1)} {req.unit}</strong> | Available: <strong className={req.isSufficient ? 'text-emerald-600 font-bold' : 'text-rose-600 font-bold'}>{req.available} {req.unit}</strong>
                        </p>
                      </div>

                      <div>
                        {req.isSufficient ? (
                          <span className="inline-flex items-center text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                            ✓ Ready
                          </span>
                        ) : (
                          <span className="inline-flex items-center text-[10px] font-bold text-rose-700 bg-rose-50 px-2.5 py-0.5 rounded-full border border-rose-200">
                            ✕ Shortage
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1">Batch Operation Notes</label>
                <input 
                  type="text" 
                  placeholder="e.g. Scheduled for DepEd Batac School Feeding delivery"
                  value={batchNotes}
                  onChange={e => setBatchNotes(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-white border-2 border-slate-200 rounded-2xl text-xs text-slate-900 shadow-sm"
                />
              </div>

              <div className="pt-2 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-2xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={computedBom.some(b => !b.isSufficient)}
                  className={`px-5 py-2.5 rounded-2xl text-xs font-bold shadow-md transition-all ${
                    computedBom.some(b => !b.isSufficient)
                      ? 'bg-slate-200 text-slate-400 cursor-not-allowed border border-slate-300'
                      : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-indigo-100'
                  }`}
                >
                  {computedBom.some(b => !b.isSufficient) ? 'Halted: Ingredient Shortage' : 'Deduct BOM & Start Batch'}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
};
