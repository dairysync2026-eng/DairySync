import React from 'react';
import { useDairySync } from '../../context/DairySyncContext';
import { 
  Snowflake, 
  Factory, 
  Package, 
  Truck, 
  CheckCircle2, 
  ArrowRight, 
  Lock, 
  AlertTriangle, 
  Layers, 
  ThermometerSnowflake,
  Clock,
  ShieldCheck,
  TrendingUp
} from 'lucide-react';

interface SubsystemDashboardProps {
  onNavigateTab: (tab: string) => void;
}

export const PlantManagerDashboard: React.FC<SubsystemDashboardProps> = ({ onNavigateTab }) => {
  const { finishedGoods, wipBatches, ingredients, currentUser } = useDairySync();

  const totalColdCapacity = finishedGoods.reduce((sum, fg) => sum + fg.coldStorageCapacity, 0);
  const currentColdStock = finishedGoods.reduce((sum, fg) => sum + fg.currentStock, 0);
  const coldOccupancyPct = Math.min(100, Math.round((currentColdStock / (totalColdCapacity || 1)) * 100));

  const activeWipBatches = wipBatches.filter(b => b.status !== 'completed' && b.status !== 'cancelled');
  const rawMilk = ingredients.find(i => i.category === 'milk');

  // Nearest shelf life products
  const expiringSoon = [...finishedGoods].sort((a, b) => a.shelfLifeDays - b.shelfLifeDays).slice(0, 4);

  return (
    <div className="space-y-6">
      
      {/* Subsystem Header Banner */}
      <div className="bg-gradient-to-r from-teal-950 via-slate-900 to-teal-900 text-white rounded-3xl p-6 shadow-md border-2 border-teal-800/60 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="p-2 bg-teal-600/30 text-teal-300 border border-teal-500/30 rounded-xl">
              <ThermometerSnowflake className="w-5 h-5" />
            </span>
            <div>
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-teal-300 bg-teal-950/80 px-2 py-0.5 rounded-full border border-teal-700">
                Authorized Subsystem Command
              </span>
              <h2 className="text-xl font-black tracking-tight mt-0.5">Plant Facility, Cold Chain & Custody Command Center</h2>
            </div>
          </div>
          <p className="text-xs text-teal-100/80 mt-2 font-medium max-w-2xl leading-relaxed">
            Logged in as <strong>{currentUser.name}</strong> ({currentUser.title}). This specialized command center consolidates your facility oversight: <strong>Cold Storage (Finished Goods)</strong>, <strong>WIP Batches</strong>, <strong>Raw Ingredients</strong>, and <strong>ROP Procurement</strong>.
          </p>
        </div>

        <div className="flex items-center space-x-2 shrink-0">
          <button
            onClick={() => onNavigateTab('finished')}
            className="flex items-center space-x-2 bg-teal-500 hover:bg-teal-400 text-slate-950 text-xs font-black px-4 py-2.5 rounded-2xl shadow transition-all"
          >
            <span>Open Cold Storage</span>
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
          <span className="text-[11px] text-slate-500 font-medium">5 Active Subsystems • 2 Locked by RBAC</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-8 gap-3">
          {/* 1. Command Center */}
          <div className="p-3 bg-teal-50/80 border-2 border-teal-300 rounded-2xl flex flex-col justify-between">
            <span className="text-[10px] font-bold text-teal-800 uppercase">Command Center</span>
            <span className="text-xs font-black text-teal-950 mt-1">Plant Hub (Active)</span>
            <span className="text-[10px] text-teal-700 font-medium mt-1">Custody & Facility</span>
          </div>

          {/* 2. Cold Storage (Authorized) */}
          <button
            onClick={() => onNavigateTab('finished')}
            className="p-3 bg-white hover:bg-teal-50/50 border-2 border-teal-200 rounded-2xl flex flex-col justify-between text-left transition-all group"
          >
            <div className="flex items-center justify-between w-full">
              <span className="text-[10px] font-bold text-teal-700 uppercase">Cold Storage</span>
              <ArrowRight className="w-3.5 h-3.5 text-teal-600 group-hover:translate-x-0.5 transition-transform" />
            </div>
            <span className="text-xs font-black text-slate-900 mt-1">Finished Goods</span>
            <span className="text-[10px] text-teal-600 font-bold mt-1">{coldOccupancyPct}% Occupied</span>
          </button>

          {/* 3. WIP Batches (Authorized) */}
          <button
            onClick={() => onNavigateTab('wip')}
            className="p-3 bg-white hover:bg-slate-50 border-2 border-slate-200 rounded-2xl flex flex-col justify-between text-left transition-all group"
          >
            <div className="flex items-center justify-between w-full">
              <span className="text-[10px] font-bold text-slate-600 uppercase">WIP Batches</span>
              <ArrowRight className="w-3.5 h-3.5 text-slate-500 group-hover:translate-x-0.5 transition-transform" />
            </div>
            <span className="text-xs font-black text-slate-900 mt-1">Processing Lines</span>
            <span className="text-[10px] text-slate-500 font-medium mt-1">{activeWipBatches.length} Active Runs</span>
          </button>

          {/* 4. Raw Ingredients (Authorized) */}
          <button
            onClick={() => onNavigateTab('ingredients')}
            className="p-3 bg-white hover:bg-slate-50 border-2 border-slate-200 rounded-2xl flex flex-col justify-between text-left transition-all group"
          >
            <div className="flex items-center justify-between w-full">
              <span className="text-[10px] font-bold text-slate-600 uppercase">Raw Ingredients</span>
              <ArrowRight className="w-3.5 h-3.5 text-slate-500 group-hover:translate-x-0.5 transition-transform" />
            </div>
            <span className="text-xs font-black text-slate-900 mt-1">Bulk Storage</span>
            <span className="text-[10px] text-slate-500 font-medium mt-1">{rawMilk?.currentStock} L Milk Silo</span>
          </button>

          {/* 5. Procurement (Authorized) */}
          <button
            onClick={() => onNavigateTab('procurement')}
            className="p-3 bg-white hover:bg-slate-50 border-2 border-slate-200 rounded-2xl flex flex-col justify-between text-left transition-all group"
          >
            <div className="flex items-center justify-between w-full">
              <span className="text-[10px] font-bold text-slate-600 uppercase">Procurement</span>
              <ArrowRight className="w-3.5 h-3.5 text-slate-500 group-hover:translate-x-0.5 transition-transform" />
            </div>
            <span className="text-xs font-black text-slate-900 mt-1">ROP Watch</span>
            <span className="text-[10px] text-slate-500 font-medium mt-1">Buffer Monitoring</span>
          </button>

          {/* 6. Audit Trail (Authorized) */}
          <button
            onClick={() => onNavigateTab('audit')}
            className="p-3 bg-indigo-50/80 hover:bg-indigo-100/70 border-2 border-indigo-200 rounded-2xl flex flex-col justify-between text-left transition-all group"
          >
            <div className="flex items-center justify-between w-full">
              <span className="text-[10px] font-bold text-indigo-700 uppercase">Audit Trail</span>
              <ArrowRight className="w-3.5 h-3.5 text-indigo-600 group-hover:translate-x-0.5 transition-transform" />
            </div>
            <span className="text-xs font-black text-slate-900 mt-1">Accountability</span>
            <span className="text-[10px] text-indigo-600 font-bold mt-1">Stock Provenance</span>
          </button>

          {/* 7. Supply & Demand Sync (Restricted) */}
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

          {/* 8. Dairy Box POS (Restricted) */}
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

      {/* Facility & Cold Chain Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Cold Storage Occupancy */}
        <div className="bg-white border-2 border-teal-200 rounded-3xl p-6 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase text-teal-600 font-extrabold tracking-wider">Cold Storage Utilization</span>
            <div className="p-2.5 bg-teal-50 border border-teal-200 rounded-2xl text-teal-600">
              <Snowflake className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <div className="flex items-baseline space-x-2">
              <span className="text-3xl font-black text-teal-700 font-mono">{coldOccupancyPct}%</span>
              <span className="text-xs text-teal-600 font-bold">Occupied</span>
            </div>
            <p className="text-xs text-slate-500 mt-2 font-medium">
              {currentColdStock} / {totalColdCapacity} bottle units in central chiller (4°C)
            </p>
          </div>
        </div>

        {/* Active WIP Batches */}
        <div className="bg-white border-2 border-slate-200 rounded-3xl p-6 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase text-slate-400 font-bold tracking-wider">Plant WIP Lines</span>
            <div className="p-2.5 bg-indigo-50 border border-indigo-100 rounded-2xl text-indigo-600">
              <Factory className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <div className="flex items-baseline space-x-2">
              <span className="text-3xl font-black text-slate-900 font-mono">{activeWipBatches.length}</span>
              <span className="text-xs text-slate-500 font-bold">Active Tanks</span>
            </div>
            <p className="text-xs text-slate-500 mt-2 font-medium">
              Undergoing thermal processing & incubation
            </p>
          </div>
        </div>

        {/* Raw Carabao Milk Silo Buffer */}
        <div className="bg-white border-2 border-slate-200 rounded-3xl p-6 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase text-slate-400 font-bold tracking-wider">Raw Milk Silo Buffer</span>
            <div className="p-2.5 bg-blue-50 border border-blue-100 rounded-2xl text-blue-600">
              <Package className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <div className="flex items-baseline space-x-2">
              <span className="text-3xl font-black text-slate-900 font-mono">{rawMilk?.currentStock} L</span>
              <span className="text-xs text-slate-500 font-bold">in Chiller Tank A</span>
            </div>
            <p className="text-xs text-slate-500 mt-2 font-medium">
              Reorder Point: <strong className="text-slate-700">{rawMilk?.reorderPoint} L</strong>
            </p>
          </div>
        </div>

        {/* FEFO Shelf-life Watch */}
        <div className="bg-white border-2 border-slate-200 rounded-3xl p-6 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase text-slate-400 font-bold tracking-wider">FEFO Rotation Status</span>
            <div className="p-2.5 bg-purple-50 border border-purple-100 rounded-2xl text-purple-600">
              <Clock className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <div className="flex items-baseline space-x-2">
              <span className="text-3xl font-black text-purple-700 font-mono">100%</span>
              <span className="text-xs text-slate-500 font-bold">FEFO Compliant</span>
            </div>
            <p className="text-xs text-slate-500 mt-2 font-medium">
              Zero expired goods in chiller inventory
            </p>
          </div>
        </div>

      </div>

      {/* Main Chiller Breakdown & Plant Facility Operations */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left 2 Cols: Cold Storage Inventory Holding & FEFO Rotation */}
        <div className="lg:col-span-2 bg-white border-2 border-slate-200 rounded-3xl p-6 shadow-sm space-y-5">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div>
              <h3 className="text-base font-extrabold text-slate-900 flex items-center space-x-2">
                <Snowflake className="w-5 h-5 text-teal-600" />
                <span>Cold Storage Warehouse Allocation & FEFO Priority</span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5 font-medium">
                PCC-MMSU Central Cold Room inventory holding by product category
              </p>
            </div>
            <button
              onClick={() => onNavigateTab('finished')}
              className="text-xs font-bold bg-teal-50 hover:bg-teal-100 text-teal-800 border border-teal-200 px-3.5 py-2 rounded-xl transition-colors"
            >
              Open Chiller Hub →
            </button>
          </div>

          <div className="space-y-3">
            {finishedGoods.map(fg => {
              const capPct = Math.min(100, Math.round((fg.currentStock / (fg.coldStorageCapacity || 1)) * 100));
              return (
                <div key={fg.id} className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="text-xs font-mono font-bold text-slate-500">{fg.sku}</span>
                        <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-teal-100 text-teal-800">
                          {fg.category.replace('_', ' ')}
                        </span>
                      </div>
                      <h4 className="font-extrabold text-slate-900 text-sm mt-1">{fg.name}</h4>
                      <p className="text-xs text-slate-500 font-medium">
                        Shelf Life: <strong>{fg.shelfLifeDays} days</strong> • DepEd Reserved: {fg.allocatedFeedingProgram} • Retail Reserved: {fg.allocatedRetail}
                      </p>
                    </div>

                    <div className="text-right">
                      <span className="font-mono font-black text-slate-900 text-sm">{fg.currentStock} / {fg.coldStorageCapacity} {fg.unit}</span>
                      <p className="text-[11px] text-teal-700 font-bold">{capPct}% Allocated</p>
                    </div>
                  </div>

                  <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                    <div className="bg-teal-600 h-full rounded-full transition-all" style={{ width: `${capPct}%` }}></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right 1 Col: Plant Facility Custody Check */}
        <div className="bg-white border-2 border-slate-200 rounded-3xl p-6 shadow-sm space-y-5">
          <div className="border-b border-slate-100 pb-3">
            <h3 className="text-base font-extrabold text-slate-900 flex items-center space-x-2">
              <ShieldCheck className="w-5 h-5 text-teal-600" />
              <span>Plant Facility Custody</span>
            </h3>
            <p className="text-xs text-slate-500 font-medium mt-0.5">Key equipment and processing units</p>
          </div>

          <div className="space-y-3">
            <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 flex justify-between items-center text-xs">
              <span className="font-bold text-slate-700">Batch Pasteurizer (72°C)</span>
              <span className="font-bold text-emerald-600 px-2 py-0.5 bg-emerald-50 rounded-lg border border-emerald-200">Online / Running</span>
            </div>
            <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 flex justify-between items-center text-xs">
              <span className="font-bold text-slate-700">Central Chiller Room (4°C)</span>
              <span className="font-bold text-emerald-600 px-2 py-0.5 bg-emerald-50 rounded-lg border border-emerald-200">Optimal (3.8°C)</span>
            </div>
            <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 flex justify-between items-center text-xs">
              <span className="font-bold text-slate-700">Incubation Chamber (42°C)</span>
              <span className="font-bold text-emerald-600 px-2 py-0.5 bg-emerald-50 rounded-lg border border-emerald-200">Ready</span>
            </div>
            <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 flex justify-between items-center text-xs">
              <span className="font-bold text-slate-700">Automated Bottling Line</span>
              <span className="font-bold text-emerald-600 px-2 py-0.5 bg-emerald-50 rounded-lg border border-emerald-200">Sanitized</span>
            </div>
          </div>

          <div className="pt-2 border-t border-slate-100 space-y-2">
            <button
              onClick={() => onNavigateTab('wip')}
              className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl shadow-sm flex items-center justify-center space-x-2 transition-all"
            >
              <Factory className="w-4 h-4 text-teal-400" />
              <span>Inspect Processing WIP Floor</span>
            </button>
            <button
              onClick={() => onNavigateTab('procurement')}
              className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs rounded-xl border border-slate-200 flex items-center justify-center space-x-2 transition-all"
            >
              <Truck className="w-4 h-4 text-slate-600" />
              <span>Check Material Reorders (ROP)</span>
            </button>
          </div>
        </div>

      </div>

    </div>
  );
};
