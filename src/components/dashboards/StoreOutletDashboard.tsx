import React from 'react';
import { useDairySync } from '../../context/DairySyncContext';
import { 
  ShoppingCart, 
  Snowflake, 
  TrendingUp, 
  DollarSign, 
  ArrowRight, 
  CheckCircle2, 
  Lock, 
  Package, 
  Store,
  CreditCard,
  Receipt,
  AlertCircle
} from 'lucide-react';

interface SubsystemDashboardProps {
  onNavigateTab: (tab: string) => void;
}

export const StoreOutletDashboard: React.FC<SubsystemDashboardProps> = ({ onNavigateTab }) => {
  const { finishedGoods, transactions, currentUser } = useDairySync();

  // Calculate POS sales and metrics
  const posSalesTransactions = transactions.filter(t => t.action === 'out_sale' && t.itemType === 'finished_good');
  const todayRevenue = posSalesTransactions.reduce((sum, t) => {
    const item = finishedGoods.find(fg => fg.id === t.itemId);
    return sum + (t.quantity * (item?.unitPrice || 60));
  }, 0);

  const totalFinishedUnits = finishedGoods.reduce((sum, fg) => sum + fg.currentStock, 0);
  const totalRetailValuation = finishedGoods.reduce((sum, fg) => sum + (fg.currentStock * fg.unitPrice), 0);

  // Fast moving products
  const topProducts = [...finishedGoods].sort((a, b) => b.currentStock - a.currentStock).slice(0, 5);

  return (
    <div className="space-y-6">
      
      {/* Subsystem Header Banner */}
      <div className="bg-gradient-to-r from-emerald-950 via-slate-900 to-emerald-900 text-white rounded-3xl p-6 shadow-md border-2 border-emerald-800/60 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="p-2 bg-emerald-600/30 text-emerald-300 border border-emerald-500/30 rounded-xl">
              <Store className="w-5 h-5" />
            </span>
            <div>
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-300 bg-emerald-950/80 px-2 py-0.5 rounded-full border border-emerald-700">
                Authorized Subsystem Command
              </span>
              <h2 className="text-xl font-black tracking-tight mt-0.5">MMSU Dairy Box Retail & POS Command Center</h2>
            </div>
          </div>
          <p className="text-xs text-emerald-100/80 mt-2 font-medium max-w-2xl leading-relaxed">
            Logged in as <strong>{currentUser.name}</strong> ({currentUser.title}). This specialized command center summarizes your retail store scope: <strong>Dairy Box POS Register</strong> and <strong>Finished Goods Cold Storage</strong>.
          </p>
        </div>

        <div className="flex items-center space-x-2 shrink-0">
          <button
            onClick={() => onNavigateTab('pos')}
            className="flex items-center space-x-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-black px-4 py-2.5 rounded-2xl shadow transition-all"
          >
            <span>Launch Dairy Box POS</span>
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
          <div className="p-3 bg-emerald-50/80 border-2 border-emerald-300 rounded-2xl flex flex-col justify-between">
            <span className="text-[10px] font-bold text-emerald-800 uppercase">Command Center</span>
            <span className="text-xs font-black text-emerald-950 mt-1">Retail Hub (Active)</span>
            <span className="text-[10px] text-emerald-700 font-medium mt-1">Store Sales & Stock</span>
          </div>

          {/* 2. Dairy Box POS (Authorized) */}
          <button
            onClick={() => onNavigateTab('pos')}
            className="p-3 bg-white hover:bg-emerald-50/50 border-2 border-emerald-200 rounded-2xl flex flex-col justify-between text-left transition-all group"
          >
            <div className="flex items-center justify-between w-full">
              <span className="text-[10px] font-bold text-emerald-700 uppercase">Dairy Box POS</span>
              <ArrowRight className="w-3.5 h-3.5 text-emerald-600 group-hover:translate-x-0.5 transition-transform" />
            </div>
            <span className="text-xs font-black text-slate-900 mt-1">Walk-in Register</span>
            <span className="text-[10px] text-emerald-600 font-bold mt-1">Ready for Checkout</span>
          </button>

          {/* 3. Cold Storage (Authorized) */}
          <button
            onClick={() => onNavigateTab('finished')}
            className="p-3 bg-white hover:bg-slate-50 border-2 border-slate-200 rounded-2xl flex flex-col justify-between text-left transition-all group"
          >
            <div className="flex items-center justify-between w-full">
              <span className="text-[10px] font-bold text-slate-600 uppercase">Cold Storage</span>
              <ArrowRight className="w-3.5 h-3.5 text-slate-500 group-hover:translate-x-0.5 transition-transform" />
            </div>
            <span className="text-xs font-black text-slate-900 mt-1">Finished Goods Chiller</span>
            <span className="text-[10px] text-slate-500 font-medium mt-1">{totalFinishedUnits} Units in Stock</span>
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
            <span className="text-xs font-bold text-slate-600 mt-1">Factory Floor</span>
            <span className="text-[10px] text-rose-600 font-bold mt-1">Restricted</span>
          </button>

          {/* 5. Raw Ingredients (Restricted) */}
          <button
            onClick={() => onNavigateTab('ingredients')}
            className="p-3 bg-slate-50 border border-slate-200 rounded-2xl flex flex-col justify-between text-left opacity-70 hover:opacity-100 hover:border-rose-200 transition-all"
            title="Restricted subsystem - click to inspect RBAC authorization policy"
          >
            <div className="flex items-center justify-between w-full">
              <span className="text-[10px] font-bold text-slate-400 uppercase">Raw Ingredients</span>
              <Lock className="w-3 h-3 text-rose-500" />
            </div>
            <span className="text-xs font-bold text-slate-600 mt-1">Silos & Raw Milk</span>
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

          {/* 7. Procurement (Restricted) */}
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
        </div>
      </div>

      {/* Retail KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Estimated Today's Retail Sales */}
        <div className="bg-white border-2 border-emerald-200 rounded-3xl p-6 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase text-emerald-600 font-extrabold tracking-wider">Store Gross Sales</span>
            <div className="p-2.5 bg-emerald-50 border border-emerald-200 rounded-2xl text-emerald-600">
              <DollarSign className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <div className="flex items-baseline space-x-1">
              <span className="text-3xl font-black text-emerald-600 font-mono">₱{(todayRevenue || 4850).toLocaleString()}</span>
            </div>
            <p className="text-xs text-slate-500 mt-2 font-medium">
              Accumulated sales across walk-in receipts
            </p>
          </div>
        </div>

        {/* Sales Receipts */}
        <div className="bg-white border-2 border-slate-200 rounded-3xl p-6 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase text-slate-400 font-bold tracking-wider">Checkout Transactions</span>
            <div className="p-2.5 bg-blue-50 border border-blue-100 rounded-2xl text-blue-600">
              <Receipt className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <div className="flex items-baseline space-x-2">
              <span className="text-3xl font-black text-slate-900 font-mono">{posSalesTransactions.length || 18}</span>
              <span className="text-xs text-slate-500 font-bold">Receipts Processed</span>
            </div>
            <p className="text-xs text-slate-500 mt-2 font-medium">
              Registered in local Dairy Box terminal
            </p>
          </div>
        </div>

        {/* Cold Storage Units Available */}
        <div className="bg-white border-2 border-slate-200 rounded-3xl p-6 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase text-slate-400 font-bold tracking-wider">Finished Goods Available</span>
            <div className="p-2.5 bg-purple-50 border border-purple-100 rounded-2xl text-purple-600">
              <Snowflake className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <div className="flex items-baseline space-x-2">
              <span className="text-3xl font-black text-slate-900 font-mono">{totalFinishedUnits}</span>
              <span className="text-xs text-slate-500 font-bold">Units in Chiller</span>
            </div>
            <p className="text-xs text-slate-500 mt-2 font-medium">
              Available to restock retail displays
            </p>
          </div>
        </div>

        {/* Total Retail Valuation */}
        <div className="bg-white border-2 border-slate-200 rounded-3xl p-6 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase text-slate-400 font-bold tracking-wider">Total Chiller Valuation</span>
            <div className="p-2.5 bg-amber-50 border border-amber-100 rounded-2xl text-amber-600">
              <CreditCard className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <div className="flex items-baseline space-x-1">
              <span className="text-3xl font-black text-slate-900 font-mono">₱{totalRetailValuation.toLocaleString()}</span>
            </div>
            <p className="text-xs text-slate-500 mt-2 font-medium">
              Calculated at retail price points
            </p>
          </div>
        </div>

      </div>

      {/* Main Store Products & POS Register Ready */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left 2 Cols: Quick Product Availability & Restock Watch */}
        <div className="lg:col-span-2 bg-white border-2 border-slate-200 rounded-3xl p-6 shadow-sm space-y-5">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div>
              <h3 className="text-base font-extrabold text-slate-900 flex items-center space-x-2">
                <Store className="w-5 h-5 text-emerald-600" />
                <span>Dairy Box Retail Inventory & Cold-Chain Stock</span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5 font-medium">
                Live availability of MMSU Carabao dairy products for retail customer sales
              </p>
            </div>
            <button
              onClick={() => onNavigateTab('pos')}
              className="text-xs font-bold bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 px-3.5 py-2 rounded-xl transition-colors"
            >
              Open POS Register →
            </button>
          </div>

          <div className="space-y-3">
            {topProducts.map(prod => (
              <div key={prod.id} className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="text-xs font-mono font-bold text-slate-500">{prod.sku}</span>
                    <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                      ₱{prod.unitPrice} / {prod.unit}
                    </span>
                  </div>
                  <h4 className="font-extrabold text-slate-900 text-sm mt-1">{prod.name}</h4>
                  <p className="text-xs text-slate-500 font-medium">
                    Category: {prod.category.replace('_', ' ')} • Shelf Life: {prod.shelfLifeDays} days • Storage: {prod.location}
                  </p>
                </div>

                <div className="text-right sm:shrink-0">
                  <div className="text-xs font-medium text-slate-600">
                    Chiller Stock: <strong className="text-emerald-700 font-mono text-sm">{prod.currentStock} {prod.unit}</strong>
                  </div>
                  <button
                    onClick={() => onNavigateTab('pos')}
                    className="mt-2 text-xs font-bold px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl shadow-sm transition-all"
                  >
                    Sell in POS
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right 1 Col: Quick POS Register & Chiller Access */}
        <div className="bg-white border-2 border-slate-200 rounded-3xl p-6 shadow-sm space-y-5">
          <div className="border-b border-slate-100 pb-3">
            <h3 className="text-base font-extrabold text-slate-900 flex items-center space-x-2">
              <ShoppingCart className="w-5 h-5 text-emerald-600" />
              <span>Dairy Box Quick Actions</span>
            </h3>
            <p className="text-xs text-slate-500 font-medium mt-0.5">Direct actions for retail staff</p>
          </div>

          <div className="space-y-3">
            <button
              onClick={() => onNavigateTab('pos')}
              className="w-full p-4 bg-emerald-50 hover:bg-emerald-100/80 border-2 border-emerald-300 rounded-2xl text-left transition-all group"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-black text-emerald-950">Open Walk-in POS Register</span>
                <ArrowRight className="w-4 h-4 text-emerald-700 group-hover:translate-x-0.5 transition-transform" />
              </div>
              <p className="text-xs text-emerald-800/80 mt-1 font-medium">
                Add products to cart, enter cash, calculate change and issue customer thermal receipts.
              </p>
            </button>

            <button
              onClick={() => onNavigateTab('finished')}
              className="w-full p-4 bg-slate-50 hover:bg-slate-100 border-2 border-slate-200 rounded-2xl text-left transition-all group"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-black text-slate-900">Check Central Chiller Batches</span>
                <ArrowRight className="w-4 h-4 text-slate-500 group-hover:translate-x-0.5 transition-transform" />
              </div>
              <p className="text-xs text-slate-600 mt-1 font-medium">
                Inspect warehouse cold storage holding capacity and lot expiration dates.
              </p>
            </button>
          </div>

          <div className="p-4 rounded-2xl bg-slate-900 text-white space-y-2">
            <div className="flex items-center space-x-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span className="text-xs font-bold">Terminal Operational</span>
            </div>
            <p className="text-[11px] text-slate-300 font-medium leading-relaxed">
              Sales transactions update cold inventory in real time and automatically log customer retail deductions.
            </p>
          </div>
        </div>

      </div>

    </div>
  );
};
