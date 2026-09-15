import React from 'react';
import { useDairySync } from '../../context/DairySyncContext';
import { 
  Truck, 
  Package, 
  AlertTriangle, 
  CheckCircle2, 
  ArrowRight, 
  TrendingDown, 
  DollarSign, 
  Calendar,
  Layers,
  Lock,
  ShoppingCart,
  Snowflake,
  TrendingUp,
  FileText
} from 'lucide-react';

interface SubsystemDashboardProps {
  onNavigateTab: (tab: string) => void;
}

export const ProcurementDashboard: React.FC<SubsystemDashboardProps> = ({ onNavigateTab }) => {
  const { ingredients, transactions, currentUser } = useDairySync();

  // Procurement specific computations
  const criticalRopItems = ingredients.filter(i => i.currentStock <= i.reorderPoint);
  const totalRawValuation = ingredients.reduce((sum, i) => sum + (i.currentStock * i.costPerUnit), 0);
  const rawMilk = ingredients.find(i => i.category === 'milk');
  const packagingItems = ingredients.filter(i => i.category === 'packaging');
  const lowPackagingCount = packagingItems.filter(i => i.currentStock <= i.reorderPoint).length;

  // Recent procurement transactions (stock additions / purchase orders)
  const recentPurchases = transactions.filter(t => t.action === 'in_restock').slice(0, 5);

  return (
    <div className="space-y-6">
      
      {/* Subsystem Header Banner */}
      <div className="bg-gradient-to-r from-amber-900 to-amber-950 text-white rounded-3xl p-6 shadow-md border-2 border-amber-800/60 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="p-2 bg-amber-600/30 text-amber-300 border border-amber-500/30 rounded-xl">
              <Truck className="w-5 h-5" />
            </span>
            <div>
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-amber-300 bg-amber-950/80 px-2 py-0.5 rounded-full border border-amber-700">
                Authorized Subsystem Command
              </span>
              <h2 className="text-xl font-black tracking-tight mt-0.5">Procurement & Raw Material Command Center</h2>
            </div>
          </div>
          <p className="text-xs text-amber-100/80 mt-2 font-medium max-w-2xl leading-relaxed">
            Logged in as <strong>{currentUser.name}</strong> ({currentUser.title}). This specialized command center consolidates your applicable subsystems: <strong>ROP Procurement</strong> and <strong>Raw Ingredients Inventory</strong>.
          </p>
        </div>

        <div className="flex items-center space-x-2 shrink-0">
          <button
            onClick={() => onNavigateTab('procurement')}
            className="flex items-center space-x-2 bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-black px-4 py-2.5 rounded-2xl shadow transition-all"
          >
            <span>Open ROP Procurement</span>
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
          {/* 1. Command Center (Current) */}
          <div className="p-3 bg-amber-50/80 border-2 border-amber-300 rounded-2xl flex flex-col justify-between">
            <span className="text-[10px] font-bold text-amber-800 uppercase">Command Center</span>
            <span className="text-xs font-black text-amber-950 mt-1">Procurement Hub (Active)</span>
            <span className="text-[10px] text-amber-700 font-medium mt-1">Summary of ROP & Raw Stock</span>
          </div>

          {/* 2. ROP Procurement (Authorized) */}
          <button
            onClick={() => onNavigateTab('procurement')}
            className="p-3 bg-white hover:bg-amber-50/50 border-2 border-amber-200 rounded-2xl flex flex-col justify-between text-left transition-all group"
          >
            <div className="flex items-center justify-between w-full">
              <span className="text-[10px] font-bold text-amber-700 uppercase">ROP Procurement</span>
              <ArrowRight className="w-3.5 h-3.5 text-amber-600 group-hover:translate-x-0.5 transition-transform" />
            </div>
            <span className="text-xs font-black text-slate-900 mt-1">Reorder Point Orders</span>
            <span className="text-[10px] text-amber-600 font-bold mt-1">
              {criticalRopItems.length > 0 ? `${criticalRopItems.length} Items Below ROP` : 'All Stocks Healthy'}
            </span>
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
            <span className="text-xs font-black text-slate-900 mt-1">Inventory Levels</span>
            <span className="text-[10px] text-slate-500 font-medium mt-1">{ingredients.length} Stock Materials</span>
          </button>

          {/* 4. WIP Batches (Restricted) */}
          <button
            onClick={() => onNavigateTab('wip')}
            className="p-3 bg-slate-50 border border-slate-200 rounded-2xl flex flex-col justify-between text-left opacity-70 hover:opacity-100 hover:border-rose-200 transition-all"
            title="Restricted subsystem - click to inspect RBAC authorization policy"
          >
            <div className="flex items-center justify-between w-full">
              <span className="text-[10px] font-bold text-slate-400 uppercase">WIP Batches</span>
              <Lock className="w-3 h-3 text-rose-500" />
            </div>
            <span className="text-xs font-bold text-slate-600 mt-1">Production Runs</span>
            <span className="text-[10px] text-rose-600 font-bold mt-1">Restricted</span>
          </button>

          {/* 5. Cold Storage (Restricted) */}
          <button
            onClick={() => onNavigateTab('finished')}
            className="p-3 bg-slate-50 border border-slate-200 rounded-2xl flex flex-col justify-between text-left opacity-70 hover:opacity-100 hover:border-rose-200 transition-all"
            title="Restricted subsystem - click to inspect RBAC authorization policy"
          >
            <div className="flex items-center justify-between w-full">
              <span className="text-[10px] font-bold text-slate-400 uppercase">Cold Storage</span>
              <Lock className="w-3 h-3 text-rose-500" />
            </div>
            <span className="text-xs font-bold text-slate-600 mt-1">Finished Goods</span>
            <span className="text-[10px] text-rose-600 font-bold mt-1">Restricted</span>
          </button>

          {/* 6. Supply & Demand Sync (Restricted) */}
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
            <span className="text-xs font-bold text-slate-600 mt-1">Retail Checkout</span>
            <span className="text-[10px] text-rose-600 font-bold mt-1">Restricted</span>
          </button>
        </div>
      </div>

      {/* Procurement Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Critical ROP Items */}
        <div className="bg-white border-2 border-rose-200 rounded-3xl p-6 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase text-rose-600 font-extrabold tracking-wider">Critical ROP Items</span>
            <div className="p-2.5 bg-rose-50 border border-rose-200 rounded-2xl text-rose-600">
              <AlertTriangle className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <div className="flex items-baseline space-x-2">
              <span className="text-3xl font-black text-rose-600 font-mono">{criticalRopItems.length}</span>
              <span className="text-xs text-rose-500 font-bold">Needs Requisition</span>
            </div>
            <p className="text-xs text-slate-500 mt-2 font-medium">
              Stocks currently below defined Reorder Point threshold
            </p>
          </div>
        </div>

        {/* Raw Ingredients Valuation */}
        <div className="bg-white border-2 border-slate-200 rounded-3xl p-6 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase text-slate-400 font-bold tracking-wider">Raw Material Valuation</span>
            <div className="p-2.5 bg-emerald-50 border border-emerald-100 rounded-2xl text-emerald-600">
              <DollarSign className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <div className="flex items-baseline space-x-1">
              <span className="text-2xl font-black text-slate-900 font-mono">₱{totalRawValuation.toLocaleString()}</span>
            </div>
            <p className="text-xs text-slate-500 mt-2 font-medium">
              Across {ingredients.length} active raw inventory SKUs
            </p>
          </div>
        </div>

        {/* Raw Carabao Milk Intake */}
        <div className="bg-white border-2 border-slate-200 rounded-3xl p-6 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase text-slate-400 font-bold tracking-wider">Raw Carabao Milk Stock</span>
            <div className="p-2.5 bg-blue-50 border border-blue-100 rounded-2xl text-blue-600">
              <Package className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <div className="flex items-baseline space-x-2">
              <span className="text-3xl font-black text-slate-900 font-mono">{rawMilk ? rawMilk.currentStock : 0} L</span>
              <span className="text-xs text-slate-500 font-bold">/ ROP: {rawMilk?.reorderPoint} L</span>
            </div>
            <p className="text-xs text-slate-500 mt-2 font-medium">
              Supplier: {rawMilk?.supplier || 'Dairy Coops'}
            </p>
          </div>
        </div>

        {/* Packaging Buffer Status */}
        <div className="bg-white border-2 border-slate-200 rounded-3xl p-6 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase text-slate-400 font-bold tracking-wider">Packaging Materials Buffer</span>
            <div className="p-2.5 bg-indigo-50 border border-indigo-100 rounded-2xl text-indigo-600">
              <Layers className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <div className="flex items-baseline space-x-2">
              <span className="text-3xl font-black text-slate-900 font-mono">{packagingItems.length}</span>
              <span className="text-xs text-slate-500 font-bold">Packaging Types</span>
            </div>
            <p className="text-xs text-slate-500 mt-2 font-medium">
              {lowPackagingCount > 0 ? (
                <span className="text-amber-600 font-bold">{lowPackagingCount} packaging items need restock</span>
              ) : (
                <span className="text-emerald-600 font-bold">All packaging buffers optimal</span>
              )}
            </p>
          </div>
        </div>

      </div>

      {/* Main Procurement Panels */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left 2 Cols: Reorder Point (ROP) Immediate Action List */}
        <div className="lg:col-span-2 bg-white border-2 border-slate-200 rounded-3xl p-6 shadow-sm space-y-5">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div>
              <h3 className="text-base font-extrabold text-slate-900 flex items-center space-x-2">
                <AlertTriangle className="w-5 h-5 text-amber-500" />
                <span>Reorder Point (ROP) Priority Purchase Watchlist</span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5 font-medium">
                Ingredients and packaging below or approaching reorder points requiring purchase requisitions
              </p>
            </div>
            <button
              onClick={() => onNavigateTab('procurement')}
              className="text-xs font-bold bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 px-3.5 py-2 rounded-xl transition-colors"
            >
              Open Procurement Desk →
            </button>
          </div>

          <div className="space-y-3">
            {criticalRopItems.length > 0 ? (
              criticalRopItems.map(item => {
                const deficit = item.reorderPoint - item.currentStock;
                return (
                  <div key={item.id} className="p-4 rounded-2xl bg-amber-50/50 border border-amber-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="text-xs font-mono font-bold text-amber-800">{item.sku}</span>
                        <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-rose-100 text-rose-700">
                          Deficit: -{deficit} {item.unit}
                        </span>
                      </div>
                      <h4 className="font-extrabold text-slate-900 text-sm mt-1">{item.name}</h4>
                      <p className="text-xs text-slate-500 font-medium">
                        Supplier: <strong>{item.supplier}</strong> • Lead Time: {item.leadTimeDays} days • Unit Cost: ₱{item.costPerUnit}
                      </p>
                    </div>

                    <div className="text-right sm:shrink-0">
                      <div className="text-xs font-medium text-slate-600">
                        Current: <strong className="text-rose-600 font-mono text-sm">{item.currentStock} {item.unit}</strong> / ROP: {item.reorderPoint} {item.unit}
                      </div>
                      <button
                        onClick={() => onNavigateTab('procurement')}
                        className="mt-2 text-xs font-bold px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl shadow-sm transition-all"
                      >
                        Create PO Requisition
                      </button>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="p-8 text-center bg-slate-50 rounded-2xl border border-slate-200 text-slate-500 space-y-2">
                <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto" />
                <p className="text-sm font-bold text-slate-800">All Raw Materials Above Reorder Points</p>
                <p className="text-xs">Inventory safety stock buffers are sufficient across all categories.</p>
              </div>
            )}
          </div>
        </div>

        {/* Right 1 Col: Quick Requisitions & Material Breakdown */}
        <div className="bg-white border-2 border-slate-200 rounded-3xl p-6 shadow-sm space-y-5">
          <div className="border-b border-slate-100 pb-3">
            <h3 className="text-base font-extrabold text-slate-900 flex items-center space-x-2">
              <Package className="w-5 h-5 text-indigo-600" />
              <span>Raw Materials Breakdown</span>
            </h3>
            <p className="text-xs text-slate-500 font-medium mt-0.5">Quick status of managed stock categories</p>
          </div>

          <div className="space-y-3">
            {ingredients.slice(0, 5).map(ing => (
              <div key={ing.id} className="p-3 bg-slate-50 rounded-2xl border border-slate-200 flex justify-between items-center text-xs">
                <div>
                  <p className="font-bold text-slate-800">{ing.name}</p>
                  <p className="text-[10px] text-slate-400">{ing.sku} • {ing.location}</p>
                </div>
                <div className="text-right">
                  <p className="font-mono font-bold text-slate-900">{ing.currentStock} {ing.unit}</p>
                  <span className={`text-[10px] font-bold ${ing.currentStock <= ing.reorderPoint ? 'text-rose-600' : 'text-emerald-600'}`}>
                    {ing.currentStock <= ing.reorderPoint ? 'Low Stock' : 'Optimal'}
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
              <Package className="w-4 h-4 text-amber-400" />
              <span>Manage Full Raw Ingredients Stock</span>
            </button>
          </div>
        </div>

      </div>

    </div>
  );
};
