import React from 'react';
import { useDairySync } from '../../context/DairySyncContext';
import { 
  Factory, 
  Package, 
  CheckCircle2, 
  ArrowRight, 
  Clock, 
  PlayCircle, 
  Flame, 
  Layers, 
  Lock,
  Beaker,
  AlertCircle
} from 'lucide-react';
import { WipBatch, WipStep } from '../../types';

interface SubsystemDashboardProps {
  onNavigateTab: (tab: string) => void;
}

export const ProductionStaffDashboard: React.FC<SubsystemDashboardProps> = ({ onNavigateTab }) => {
  const { wipBatches, ingredients, currentUser, advanceWipBatchStep } = useDairySync();

  const activeBatches = wipBatches.filter(b => b.status !== 'completed' && b.status !== 'cancelled');
  const completedToday = wipBatches.filter(b => b.status === 'completed');
  const totalMilkInWip = activeBatches.reduce((sum, b) => sum + b.rawMilkVolumeUsed, 0);
  const totalTargetUnits = activeBatches.reduce((sum, b) => sum + b.targetQuantity, 0);

  const rawMilk = ingredients.find(i => i.category === 'milk');

  const getNextStep = (status: WipBatch['status']): WipStep | null => {
    switch (status) {
      case 'scheduled': return 'pasteurization';
      case 'pasteurization': return 'homogenization';
      case 'homogenization': return 'cooling_bottling';
      case 'cooling_bottling': return 'completed';
      default: return null;
    }
  };

  const getStepProgress = (status: WipBatch['status']) => {
    switch (status) {
      case 'scheduled': return { pct: 20, label: 'Batch Scheduled' };
      case 'pasteurization': return { pct: 45, label: 'Pasteurization (72°C)' };
      case 'homogenization': return { pct: 70, label: 'Homogenization / Incubation' };
      case 'cooling_bottling': return { pct: 90, label: 'Cooling & Bottling Line' };
      case 'completed': return { pct: 100, label: 'Completed & Transferred' };
      case 'cancelled': return { pct: 0, label: 'Batch Cancelled' };
      default: return { pct: 0, label: 'Batch Scheduled' };
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Subsystem Header Banner */}
      <div className="bg-gradient-to-r from-indigo-950 via-slate-900 to-indigo-900 text-white rounded-3xl p-6 shadow-md border-2 border-indigo-800/60 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="p-2 bg-indigo-600/30 text-indigo-300 border border-indigo-500/30 rounded-xl">
              <Factory className="w-5 h-5" />
            </span>
            <div>
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-indigo-300 bg-indigo-950/80 px-2 py-0.5 rounded-full border border-indigo-700">
                Authorized Subsystem Command
              </span>
              <h2 className="text-xl font-black tracking-tight mt-0.5">Processing Floor & WIP Production Command Center</h2>
            </div>
          </div>
          <p className="text-xs text-indigo-100/80 mt-2 font-medium max-w-2xl leading-relaxed">
            Logged in as <strong>{currentUser.name}</strong> ({currentUser.title}). This specialized command center summarizes your operational scope: <strong>WIP Production Batches</strong> and <strong>Raw Ingredients Consumption</strong>.
          </p>
        </div>

        <div className="flex items-center space-x-2 shrink-0">
          <button
            onClick={() => onNavigateTab('wip')}
            className="flex items-center space-x-2 bg-indigo-500 hover:bg-indigo-400 text-slate-950 text-xs font-black px-4 py-2.5 rounded-2xl shadow transition-all"
          >
            <span>Open WIP Batches Floor</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Applicable Subsystems Quick Navigation & Status Bar */}
      <div className="bg-white border-2 border-slate-200 rounded-3xl p-4 shadow-sm space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-black text-slate-900 uppercase tracking-wider flex items-center space-x-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>Your Authorized Subsystems</span>
          </span>
          <span className="text-[11px] text-slate-500 font-medium">2 Active Subsystems • 4 Locked by RBAC</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-7 gap-3">
          {/* 1. Command Center */}
          <div className="p-3 bg-indigo-50/80 border-2 border-indigo-300 rounded-2xl flex flex-col justify-between">
            <span className="text-[10px] font-bold text-indigo-800 uppercase">Command Center</span>
            <span className="text-xs font-black text-indigo-950 mt-1">Processing Floor (Active)</span>
            <span className="text-[10px] text-indigo-700 font-medium mt-1">Daily Run Summary</span>
          </div>

          {/* 2. WIP Batches (Authorized) */}
          <button
            onClick={() => onNavigateTab('wip')}
            className="p-3 bg-white hover:bg-indigo-50/50 border-2 border-indigo-200 rounded-2xl flex flex-col justify-between text-left transition-all group"
          >
            <div className="flex items-center justify-between w-full">
              <span className="text-[10px] font-bold text-indigo-700 uppercase">WIP Batches</span>
              <ArrowRight className="w-3.5 h-3.5 text-indigo-600 group-hover:translate-x-0.5 transition-transform" />
            </div>
            <span className="text-xs font-black text-slate-900 mt-1">Active Batch Operations</span>
            <span className="text-[10px] text-indigo-600 font-bold mt-1">{activeBatches.length} Active Runs</span>
          </button>

          {/* 3. Raw Ingredients (Authorized) */}
          <button
            onClick={() => onNavigateTab('ingredients')}
            className="p-3 bg-white hover:bg-slate-50 border-2 border-slate-200 rounded-2xl flex flex-col justify-between text-left transition-all group"
          >
            <div className="flex items-center justify-between w-full">
              <span className="text-[10px] font-bold text-slate-600 uppercase">Raw Ingredients</span>
              <ArrowRight className="w-3.5 h-3.5 text-slate-500 group-hover:translate-x-0.5 transition-transform" />
            </div>
            <span className="text-xs font-black text-slate-900 mt-1">Stock Requisitions</span>
            <span className="text-[10px] text-slate-500 font-medium mt-1">Raw Milk & Flavors</span>
          </button>

          {/* 4. Cold Storage (Restricted) */}
          <button
            onClick={() => onNavigateTab('finished')}
            className="p-3 bg-slate-50 border border-slate-200 rounded-2xl flex flex-col justify-between text-left opacity-70 hover:opacity-100 hover:border-rose-200 transition-all"
            title="Restricted subsystem - click to inspect RBAC authorization policy"
          >
            <div className="flex items-center justify-between w-full">
              <span className="text-[10px] font-bold text-slate-400 uppercase">Cold Storage</span>
              <Lock className="w-3 h-3 text-rose-500" />
            </div>
            <span className="text-xs font-bold text-slate-600 mt-1">Finished Goods Chiller</span>
            <span className="text-[10px] text-rose-600 font-bold mt-1">Restricted</span>
          </button>

          {/* 5. Supply & Demand Sync (Restricted) */}
          <button
            onClick={() => onNavigateTab('sync')}
            className="p-3 bg-slate-50 border border-slate-200 rounded-2xl flex flex-col justify-between text-left opacity-70 hover:opacity-100 hover:border-rose-200 transition-all"
            title="Restricted subsystem - click to inspect RBAC authorization policy"
          >
            <div className="flex items-center justify-between w-full">
              <span className="text-[10px] font-bold text-slate-400 uppercase">Supply & Demand</span>
              <Lock className="w-3 h-3 text-rose-500" />
            </div>
            <span className="text-xs font-bold text-slate-600 mt-1">Commitments</span>
            <span className="text-[10px] text-rose-600 font-bold mt-1">Restricted</span>
          </button>

          {/* 6. ROP Procurement (Restricted) */}
          <button
            onClick={() => onNavigateTab('procurement')}
            className="p-3 bg-slate-50 border border-slate-200 rounded-2xl flex flex-col justify-between text-left opacity-70 hover:opacity-100 hover:border-rose-200 transition-all"
            title="Restricted subsystem - click to inspect RBAC authorization policy"
          >
            <div className="flex items-center justify-between w-full">
              <span className="text-[10px] font-bold text-slate-400 uppercase">Procurement</span>
              <Lock className="w-3 h-3 text-rose-500" />
            </div>
            <span className="text-xs font-bold text-slate-600 mt-1">Purchase Orders</span>
            <span className="text-[10px] text-rose-600 font-bold mt-1">Restricted</span>
          </button>

          {/* 7. Dairy Box POS (Restricted) */}
          <button
            onClick={() => onNavigateTab('pos')}
            className="p-3 bg-slate-50 border border-slate-200 rounded-2xl flex flex-col justify-between text-left opacity-70 hover:opacity-100 hover:border-rose-200 transition-all"
            title="Restricted subsystem - click to inspect RBAC authorization policy"
          >
            <div className="flex items-center justify-between w-full">
              <span className="text-[10px] font-bold text-slate-400 uppercase">Dairy Box POS</span>
              <Lock className="w-3 h-3 text-rose-500" />
            </div>
            <span className="text-xs font-bold text-slate-600 mt-1">Retail Outlet</span>
            <span className="text-[10px] text-rose-600 font-bold mt-1">Restricted</span>
          </button>
        </div>
      </div>

      {/* Production Floor KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Active Batches */}
        <div className="bg-white border-2 border-indigo-200 rounded-3xl p-6 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase text-indigo-600 font-extrabold tracking-wider">Active WIP Batches</span>
            <div className="p-2.5 bg-indigo-50 border border-indigo-200 rounded-2xl text-indigo-600">
              <Factory className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <div className="flex items-baseline space-x-2">
              <span className="text-3xl font-black text-indigo-600 font-mono">{activeBatches.length}</span>
              <span className="text-xs text-indigo-500 font-bold">Batches on Floor</span>
            </div>
            <p className="text-xs text-slate-500 mt-2 font-medium">
              In pasteurization, homogenization, or bottling
            </p>
          </div>
        </div>

        {/* Raw Milk Allocated to WIP */}
        <div className="bg-white border-2 border-slate-200 rounded-3xl p-6 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase text-slate-400 font-bold tracking-wider">Milk Processing Today</span>
            <div className="p-2.5 bg-blue-50 border border-blue-100 rounded-2xl text-blue-600">
              <Beaker className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <div className="flex items-baseline space-x-2">
              <span className="text-3xl font-black text-slate-900 font-mono">{totalMilkInWip} L</span>
              <span className="text-xs text-slate-500 font-bold">in active tanks</span>
            </div>
            <p className="text-xs text-slate-500 mt-2 font-medium">
              Remaining raw milk in silo: <strong className="text-slate-800">{rawMilk?.currentStock} L</strong>
            </p>
          </div>
        </div>

        {/* Target Bottling Yield */}
        <div className="bg-white border-2 border-slate-200 rounded-3xl p-6 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase text-slate-400 font-bold tracking-wider">Target Yield Scheduled</span>
            <div className="p-2.5 bg-emerald-50 border border-emerald-100 rounded-2xl text-emerald-600">
              <Layers className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <div className="flex items-baseline space-x-2">
              <span className="text-3xl font-black text-emerald-600 font-mono">{totalTargetUnits}</span>
              <span className="text-xs text-slate-500 font-bold">Finished Units</span>
            </div>
            <p className="text-xs text-slate-500 mt-2 font-medium">
              Destined for Cold Storage upon completion
            </p>
          </div>
        </div>

        {/* Completed Today */}
        <div className="bg-white border-2 border-slate-200 rounded-3xl p-6 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase text-slate-400 font-bold tracking-wider">Completed Batches</span>
            <div className="p-2.5 bg-purple-50 border border-purple-100 rounded-2xl text-purple-600">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <div className="flex items-baseline space-x-2">
              <span className="text-3xl font-black text-slate-900 font-mono">{completedToday.length}</span>
              <span className="text-xs text-slate-500 font-bold">Lots Transferred</span>
            </div>
            <p className="text-xs text-slate-500 mt-2 font-medium">
              Stored and logged for cold-chain holding
            </p>
          </div>
        </div>

      </div>

      {/* Main Floor Queue & Ingredients Readiness */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left 2 Cols: Live Batch Processing Queue */}
        <div className="lg:col-span-2 bg-white border-2 border-slate-200 rounded-3xl p-6 shadow-sm space-y-5">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div>
              <h3 className="text-base font-extrabold text-slate-900 flex items-center space-x-2">
                <Factory className="w-5 h-5 text-indigo-600" />
                <span>Active Floor Batch Queue & Step Advancement</span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5 font-medium">
                Real-time tracking of batches undergoing pasteurization, homogenization, incubation, and packaging
              </p>
            </div>
            <button
              onClick={() => onNavigateTab('wip')}
              className="text-xs font-bold bg-indigo-50 hover:bg-indigo-100 text-indigo-800 border border-indigo-200 px-3.5 py-2 rounded-xl transition-colors"
            >
              Open Full WIP Board →
            </button>
          </div>

          <div className="space-y-4">
            {activeBatches.map(batch => {
              const progress = getStepProgress(batch.status) || { pct: 0, label: 'Batch Scheduled' };
              return (
                <div key={batch.id} className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="text-xs font-mono font-bold text-indigo-600">{batch.batchNumber}</span>
                        <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-700">
                          {progress.label}
                        </span>
                      </div>
                      <h4 className="font-extrabold text-slate-900 text-sm mt-1">{batch.productName}</h4>
                      <p className="text-xs text-slate-500 font-medium">
                        Raw Milk: <strong>{batch.rawMilkVolumeUsed} L</strong> • Target Output: <strong>{batch.targetQuantity} units</strong> • Assigned: {batch.assignedStaff}
                      </p>
                    </div>

                    <button
                      onClick={() => {
                        const nextStep = getNextStep(batch.status);
                        if (nextStep) advanceWipBatchStep(batch.id, nextStep);
                      }}
                      disabled={!getNextStep(batch.status)}
                      className="px-3 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-sm flex items-center justify-center space-x-1.5 transition-all self-start sm:self-center"
                    >
                      <PlayCircle className="w-3.5 h-3.5" />
                      <span>Advance Next Step</span>
                    </button>
                  </div>

                  <div className="space-y-1">
                    <div className="flex justify-between text-xs text-slate-500 font-medium">
                      <span>Process Progression</span>
                      <span className="font-mono font-bold text-indigo-600">{progress.pct}%</span>
                    </div>
                    <div className="w-full bg-slate-200 h-2.5 rounded-full overflow-hidden">
                      <div className="bg-indigo-600 h-full rounded-full transition-all" style={{ width: `${progress.pct}%` }}></div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right 1 Col: Production Recipe Ingredients Readiness */}
        <div className="bg-white border-2 border-slate-200 rounded-3xl p-6 shadow-sm space-y-5">
          <div className="border-b border-slate-100 pb-3">
            <h3 className="text-base font-extrabold text-slate-900 flex items-center space-x-2">
              <Beaker className="w-5 h-5 text-indigo-600" />
              <span>Ingredient Readiness Check</span>
            </h3>
            <p className="text-xs text-slate-500 font-medium mt-0.5">Raw stocks on hand for next batch cycles</p>
          </div>

          <div className="space-y-3">
            {ingredients.slice(0, 5).map(ing => (
              <div key={ing.id} className="p-3 bg-slate-50 rounded-2xl border border-slate-200 flex justify-between items-center text-xs">
                <div>
                  <p className="font-bold text-slate-800">{ing.name}</p>
                  <p className="text-[10px] text-slate-400 font-mono">{ing.sku} • {ing.location}</p>
                </div>
                <div className="text-right">
                  <p className="font-mono font-bold text-slate-900">{ing.currentStock} {ing.unit}</p>
                  <span className={`text-[10px] font-bold ${ing.currentStock > ing.reorderPoint ? 'text-emerald-600' : 'text-amber-600'}`}>
                    {ing.currentStock > ing.reorderPoint ? 'Ready' : 'Low Buffer'}
                  </span>
                </div>
              </div>
            ))}
          </div>

          <div className="pt-2 border-t border-slate-100">
            <button
              onClick={() => onNavigateTab('ingredients')}
              className="w-full py-3 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-2xl shadow-sm flex items-center justify-center space-x-2 transition-all"
            >
              <Package className="w-4 h-4 text-indigo-400" />
              <span>Request Additional Raw Ingredients</span>
            </button>
          </div>
        </div>

      </div>

    </div>
  );
};
