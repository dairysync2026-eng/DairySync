import React, { useState } from 'react';
import { useDairySync } from '../context/DairySyncContext';
import { SupplyDemandCommitment, CommitmentType } from '../types';
import { 
  TrendingUp, 
  Truck, 
  GraduationCap, 
  ShoppingCart, 
  Plus, 
  CheckCircle2, 
  Clock, 
  AlertCircle,
  X,
  Calendar,
  Ban,
  Flag,
  RotateCcw,
  SlidersHorizontal,
  ChevronDown
} from 'lucide-react';

export const SupplyDemandSync: React.FC = () => {
  const { 
    commitments, 
    addCommitment, 
    updateCommitmentStatus, 
    cancelCommitment,
    updateCommitmentPriority 
  } = useDairySync();

  const [showAddModal, setShowAddModal] = useState(false);
  const [filterTab, setFilterTab] = useState<'all' | 'active' | 'fulfilled' | 'cancelled'>('all');
  
  // Cancellation Modal state
  const [commitmentToCancel, setCommitmentToCancel] = useState<SupplyDemandCommitment | null>(null);
  const [cancelReason, setCancelReason] = useState('');
  
  const [newCom, setNewCom] = useState<Omit<SupplyDemandCommitment, 'id'>>({
    type: 'National School Feeding Program (DepEd)',
    partnerName: 'DepEd Batac District',
    contactPerson: 'Supervisor',
    scheduledDate: new Date().toISOString().split('T')[0],
    itemOrMilk: 'Pasteurized Fresh Carabao Milk 1L',
    targetQuantity: 300,
    fulfilledQuantity: 0,
    unit: 'bottles',
    status: 'pending',
    priority: 'medium'
  });

  // Typeable input states for commitment type and target quantity
  const [commitmentTypeSelect, setCommitmentTypeSelect] = useState<string>('National School Feeding Program (DepEd)');
  const [customCommitmentType, setCustomCommitmentType] = useState<string>('');
  const [commitmentTypeStr, setCommitmentTypeStr] = useState<string>('National School Feeding Program (DepEd)');
  const [targetQuantityStr, setTargetQuantityStr] = useState<string>('300');

  const getCommitmentIcon = (type: string) => {
    const lower = (type || '').toLowerCase();
    if (lower.includes('coop') || lower.includes('collection') || lower.includes('truck') || lower.includes('intake')) {
      return <Truck className="w-5 h-5 text-emerald-600" />;
    }
    if (lower.includes('school') || lower.includes('feeding') || lower.includes('deped') || lower.includes('education')) {
      return <GraduationCap className="w-5 h-5 text-blue-600" />;
    }
    if (lower.includes('retail') || lower.includes('box') || lower.includes('store') || lower.includes('pos') || lower.includes('outlet')) {
      return <ShoppingCart className="w-5 h-5 text-purple-600" />;
    }
    return <TrendingUp className="w-5 h-5 text-indigo-600" />;
  };

  const formatCommitmentLabel = (type: string) => {
    if (type === 'school_feeding') return 'School Feeding (DepEd)';
    if (type === 'coop_collection') return 'Raw Milk Intake (Coop)';
    if (type === 'dairy_box_retail') return 'Dairy Box Retail Demand';
    return type.replace(/_/g, ' ');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCom.partnerName) return;

    const parsedTargetQty = Math.max(1, parseFloat(targetQuantityStr) || 1);
    const finalType = commitmentTypeStr.trim() || 'National School Feeding Program (DepEd)';

    addCommitment({
      ...newCom,
      type: finalType,
      targetQuantity: parsedTargetQty
    });

    setShowAddModal(false);
    setNewCom({
      type: 'National School Feeding Program (DepEd)',
      partnerName: '',
      contactPerson: '',
      scheduledDate: new Date().toISOString().split('T')[0],
      itemOrMilk: 'Pasteurized Fresh Carabao Milk 1L',
      targetQuantity: 100,
      fulfilledQuantity: 0,
      unit: 'bottles',
      status: 'pending',
      priority: 'medium'
    });
    setCommitmentTypeSelect('National School Feeding Program (DepEd)');
    setCustomCommitmentType('');
    setCommitmentTypeStr('National School Feeding Program (DepEd)');
    setTargetQuantityStr('300');
  };

  const handleConfirmCancel = () => {
    if (!commitmentToCancel) return;
    const finalReason = cancelReason.trim() || 'Commitment cancelled by logistics coordinator';
    cancelCommitment(commitmentToCancel.id, finalReason);
    setCommitmentToCancel(null);
    setCancelReason('');
  };

  const filteredCommitments = commitments.filter(c => {
    if (filterTab === 'active') return c.status === 'pending' || c.status === 'in_progress';
    if (filterTab === 'fulfilled') return c.status === 'fulfilled';
    if (filterTab === 'cancelled') return c.status === 'cancelled';
    return true;
  });

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white border-2 border-slate-200 p-6 rounded-3xl shadow-sm text-slate-900">
        <div>
          <h1 className="text-xl font-bold text-slate-900 flex items-center space-x-2 tracking-tight">
            <TrendingUp className="w-6 h-6 text-emerald-600" />
            <span>Supply & Demand Synchronization Hub</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1 font-medium">
            Synchronizing raw carabao milk intake with National School Feeding commitments & Dairy Box retail
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center space-x-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold px-4 py-2.5 rounded-2xl shadow-sm transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>Add Supply / Demand Commitment</span>
        </button>
      </div>

      {/* Filter Tabs & Summary */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white border-2 border-slate-200 p-3 rounded-2xl">
        <div className="flex items-center space-x-1.5">
          {(['all', 'active', 'fulfilled', 'cancelled'] as const).map(tab => {
            const count = tab === 'all' 
              ? commitments.length 
              : tab === 'active' 
                ? commitments.filter(c => c.status === 'pending' || c.status === 'in_progress').length
                : tab === 'fulfilled'
                  ? commitments.filter(c => c.status === 'fulfilled').length
                  : commitments.filter(c => c.status === 'cancelled').length;

            return (
              <button
                key={tab}
                onClick={() => setFilterTab(tab)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold capitalize transition-all ${
                  filterTab === tab 
                    ? 'bg-slate-900 text-white shadow-sm' 
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {tab} ({count})
              </button>
            );
          })}
        </div>

        <div className="text-xs text-slate-500 font-medium">
          <span>Priority Selection & Full Commitment Audit Trail Active</span>
        </div>
      </div>

      {/* Commitments Matrix Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredCommitments.map(com => {
          const isCancelled = com.status === 'cancelled';
          const isFulfilled = com.status === 'fulfilled';
          const pct = Math.min(100, Math.round((com.fulfilledQuantity / com.targetQuantity) * 100));

          return (
            <div 
              key={com.id} 
              className={`border-2 rounded-3xl p-6 shadow-sm space-y-4 transition-all text-slate-900 ${
                isCancelled 
                  ? 'bg-slate-50/80 border-slate-300 opacity-90' 
                  : isFulfilled 
                    ? 'bg-white border-slate-200' 
                    : 'bg-white border-slate-200 hover:border-slate-300'
              }`}
            >
              
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-3">
                  <div className={`p-2.5 rounded-2xl border-2 ${
                    isCancelled ? 'bg-rose-50 border-rose-200' : 'bg-slate-50 border-slate-200'
                  }`}>
                    {isCancelled ? <Ban className="w-5 h-5 text-rose-500" /> : getCommitmentIcon(com.type)}
                  </div>
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                      {formatCommitmentLabel(com.type)}
                    </span>
                    <h3 className="font-extrabold text-slate-900 text-sm mt-0.5">{com.partnerName}</h3>
                  </div>
                </div>

                {/* Interactive Priority Option Selector */}
                {!isCancelled ? (
                  <div className="relative group">
                    <select
                      value={com.priority}
                      onChange={e => updateCommitmentPriority(com.id, e.target.value as 'high' | 'medium' | 'low')}
                      className={`text-[10px] font-extrabold uppercase px-2.5 py-1 rounded-xl border cursor-pointer focus:outline-none transition-colors appearance-none pr-6 ${
                        com.priority === 'high' 
                          ? 'bg-rose-50 text-rose-700 border-rose-300 hover:bg-rose-100' 
                          : com.priority === 'medium' 
                            ? 'bg-amber-50 text-amber-700 border-amber-300 hover:bg-amber-100' 
                            : 'bg-slate-100 text-slate-600 border-slate-300 hover:bg-slate-200'
                      }`}
                      title="Click to change commitment priority"
                    >
                      <option value="high">High Priority</option>
                      <option value="medium">Medium Priority</option>
                      <option value="low">Low Priority</option>
                    </select>
                    <ChevronDown className="w-3 h-3 text-slate-400 absolute right-2 top-2 pointer-events-none" />
                  </div>
                ) : (
                  <span className="text-[10px] font-extrabold uppercase px-2.5 py-1 rounded-xl border bg-rose-100 text-rose-700 border-rose-300">
                    CANCELLED
                  </span>
                )}
              </div>

              <div className="p-3.5 bg-slate-50 rounded-2xl border-2 border-slate-200/80 space-y-2 text-xs font-medium">
                <div className="flex justify-between text-slate-600">
                  <span>Item / Stock:</span>
                  <strong className="text-slate-900 font-bold">{com.itemOrMilk}</strong>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Scheduled Date:</span>
                  <span className="font-mono text-indigo-600 font-bold">{com.scheduledDate}</span>
                </div>
                {com.contactPerson && (
                  <div className="flex justify-between text-slate-500 text-[11px]">
                    <span>Contact:</span>
                    <span className="font-semibold text-slate-700">{com.contactPerson}</span>
                  </div>
                )}
                {isCancelled && com.cancellationReason && (
                  <div className="pt-2 border-t border-rose-200/60 text-[11px] text-rose-800 bg-rose-50 p-2 rounded-xl">
                    <span className="font-bold block text-rose-900">Cancellation Reason:</span>
                    <span className="italic">"{com.cancellationReason}"</span>
                    {com.cancelledAt && (
                      <span className="block text-[10px] text-rose-500 mt-0.5">Recorded: {com.cancelledAt}</span>
                    )}
                  </div>
                )}
              </div>

              {/* Progress Bar */}
              {!isCancelled && (
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs text-slate-600 font-semibold">
                    <span>Fulfillment Status:</span>
                    <span className="font-bold font-mono text-slate-900">
                      {com.fulfilledQuantity} / {com.targetQuantity} {com.unit} ({pct}%)
                    </span>
                  </div>
                  <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden border border-slate-200">
                    <div 
                      className={`h-full rounded-full transition-all ${
                        com.status === 'fulfilled' ? 'bg-emerald-500' : 'bg-indigo-600'
                      }`}
                      style={{ width: `${pct}%` }}
                    ></div>
                  </div>
                </div>
              )}

              {/* Action Bar with Cancellation Button close to Mark Fulfilled */}
              <div className="pt-3 border-t border-slate-200 flex items-center justify-between">
                <span className={`text-[10px] font-bold uppercase px-3 py-1 rounded-full border ${
                  com.status === 'fulfilled' 
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
                    : isCancelled
                      ? 'bg-rose-50 text-rose-700 border-rose-200'
                      : 'bg-amber-50 text-amber-700 border-amber-200'
                }`}>
                  {com.status.replace('_', ' ')}
                </span>

                {!isCancelled && !isFulfilled && (
                  <div className="flex items-center space-x-2">
                    {/* Cancellation button close to Mark Fulfilled button */}
                    <button
                      onClick={() => {
                        setCommitmentToCancel(com);
                        setCancelReason('');
                      }}
                      className="text-xs bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 font-bold px-3 py-1.5 rounded-xl flex items-center space-x-1 transition-colors"
                      title="Cancel commitment order"
                    >
                      <X className="w-3.5 h-3.5 text-rose-600" />
                      <span>Cancel</span>
                    </button>

                    <button
                      onClick={() => updateCommitmentStatus(com.id, 'fulfilled', com.targetQuantity)}
                      className="text-xs bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-3.5 py-1.5 rounded-xl flex items-center space-x-1.5 shadow-sm transition-colors"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Mark Fulfilled</span>
                    </button>
                  </div>
                )}
              </div>

            </div>
          );
        })}
      </div>

      {/* Cancellation Modal Popup Panel */}
      {commitmentToCancel && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white border-2 border-slate-200 rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4 text-slate-900 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 rounded-xl bg-rose-100 text-rose-600 flex items-center justify-center font-bold">
                  <Ban className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-base text-slate-900">Cancel Supply / Demand Commitment</h3>
                  <p className="text-xs text-slate-500 font-medium">Partner: <span className="font-bold text-slate-700">{commitmentToCancel.partnerName}</span></p>
                </div>
              </div>
              <button onClick={() => setCommitmentToCancel(null)} className="text-slate-400 hover:text-slate-900">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Commitment Details Overview */}
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-3.5 text-xs space-y-1.5">
              <div className="flex justify-between">
                <span className="text-slate-500 font-medium">Item & Spec:</span>
                <span className="font-bold text-slate-800">{commitmentToCancel.itemOrMilk}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 font-medium">Scheduled Target:</span>
                <span className="font-mono font-bold text-slate-800">
                  {commitmentToCancel.targetQuantity} {commitmentToCancel.unit}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 font-medium">Scheduled Delivery:</span>
                <span className="font-mono text-indigo-600 font-bold">{commitmentToCancel.scheduledDate}</span>
              </div>
            </div>

            {/* Reason Input */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Reason of Cancellation *
              </label>
              <textarea
                rows={3}
                placeholder="Enter specific reason for cancelling this commitment (e.g. school schedule change, inclement weather, contract re-negotiation)..."
                value={cancelReason}
                onChange={e => setCancelReason(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-white border-2 border-slate-200 rounded-2xl text-xs text-slate-900 focus:outline-none focus:border-rose-500 shadow-sm resize-none"
              />

              {/* Quick Reason Chips */}
              <div className="flex flex-wrap gap-1.5 mt-2">
                {[
                  'School Feeding Calendar Adjustment',
                  'DepEd Delivery Postponement',
                  'Cooperative Volume Shortage',
                  'Inclement Weather / Road Hazard',
                  'Mutual Partner Cancellation'
                ].map(chip => (
                  <button
                    key={chip}
                    type="button"
                    onClick={() => setCancelReason(chip)}
                    className="text-[10px] bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium px-2 py-0.5 rounded-lg transition-colors border border-slate-200"
                  >
                    + {chip}
                  </button>
                ))}
              </div>
            </div>

            <div className="pt-2 flex justify-end space-x-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setCommitmentToCancel(null)}
                className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-2xl"
              >
                Keep Active
              </button>
              <button
                type="button"
                onClick={handleConfirmCancel}
                className="px-5 py-2.5 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-2xl shadow-sm flex items-center space-x-1.5"
              >
                <Ban className="w-3.5 h-3.5" />
                <span>Confirm Cancellation</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Commitment Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white border-2 border-slate-200 rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4 text-slate-900">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-extrabold text-lg text-slate-900">Add Supply / Demand Commitment</h3>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-slate-900">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Commitment Type</label>
                <select
                  value={commitmentTypeSelect}
                  onChange={e => {
                    const val = e.target.value;
                    setCommitmentTypeSelect(val);
                    if (val !== 'custom') {
                      setCommitmentTypeStr(val);
                    } else {
                      setCommitmentTypeStr(customCommitmentType || '');
                    }
                  }}
                  className="w-full px-3.5 py-2.5 bg-white border-2 border-slate-200 rounded-2xl text-xs text-slate-900 font-semibold focus:outline-none focus:border-indigo-500 shadow-sm cursor-pointer"
                >
                  <option value="National School Feeding Program (DepEd)">National School Feeding Program (DepEd)</option>
                  <option value="Raw Milk Intake (Dairy Cooperative)">Raw Milk Intake (Dairy Cooperative)</option>
                  <option value="Dairy Box Retail Demand">Dairy Box Retail Demand</option>
                  <option value="custom">+ Custom Commitment Type...</option>
                </select>
                {commitmentTypeSelect === 'custom' && (
                  <input
                    type="text"
                    required
                    value={customCommitmentType}
                    onChange={e => {
                      setCustomCommitmentType(e.target.value);
                      setCommitmentTypeStr(e.target.value);
                    }}
                    placeholder="Type custom commitment type..."
                    className="w-full mt-1.5 px-3.5 py-2 bg-slate-50 border-2 border-indigo-300 rounded-xl text-xs font-semibold text-slate-900 focus:outline-none focus:border-indigo-500 shadow-sm"
                  />
                )}
              </div>

              {/* Priority Option Selection */}
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1">Priority Option *</label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { val: 'high', label: 'High Priority', color: 'border-rose-300 peer-checked:bg-rose-50 peer-checked:border-rose-500 peer-checked:text-rose-700' },
                    { val: 'medium', label: 'Medium Priority', color: 'border-amber-300 peer-checked:bg-amber-50 peer-checked:border-amber-500 peer-checked:text-amber-700' },
                    { val: 'low', label: 'Low Priority', color: 'border-slate-300 peer-checked:bg-slate-100 peer-checked:border-slate-600 peer-checked:text-slate-800' }
                  ].map(opt => (
                    <label key={opt.val} className="relative cursor-pointer">
                      <input
                        type="radio"
                        name="priority"
                        value={opt.val}
                        checked={newCom.priority === opt.val}
                        onChange={() => setNewCom({ ...newCom, priority: opt.val as 'high' | 'medium' | 'low' })}
                        className="sr-only peer"
                      />
                      <div className={`p-2.5 border-2 rounded-2xl text-center text-xs font-bold transition-all ${opt.color}`}>
                        {opt.label}
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1">Partner / Beneficiary Name *</label>
                <input 
                  type="text" 
                  required
                  placeholder="e.g. Batac District Elementary Schools"
                  value={newCom.partnerName}
                  onChange={e => setNewCom({ ...newCom, partnerName: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-white border-2 border-slate-200 rounded-2xl text-xs text-slate-900 focus:outline-none focus:border-indigo-500 shadow-sm"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Scheduled Date</label>
                  <input 
                    type="date" 
                    value={newCom.scheduledDate}
                    onChange={e => setNewCom({ ...newCom, scheduledDate: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-white border-2 border-slate-200 rounded-2xl text-xs text-slate-900 font-semibold"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Target Quantity</label>
                  <input 
                    type="number" 
                    step="any"
                    min="1"
                    required
                    value={targetQuantityStr}
                    onChange={e => setTargetQuantityStr(e.target.value)}
                    placeholder="e.g. 300"
                    className="w-full px-3.5 py-2.5 bg-white border-2 border-slate-200 rounded-2xl text-xs text-slate-900 font-mono font-bold focus:outline-none focus:border-indigo-500 shadow-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1">Item / Raw Milk Specs</label>
                <input 
                  type="text" 
                  value={newCom.itemOrMilk}
                  onChange={e => setNewCom({ ...newCom, itemOrMilk: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-white border-2 border-slate-200 rounded-2xl text-xs text-slate-900"
                />
              </div>

              <div className="pt-2 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-2xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-2xl shadow-md shadow-indigo-100"
                >
                  Save Commitment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
