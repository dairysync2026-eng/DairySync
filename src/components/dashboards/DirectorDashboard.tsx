import React from 'react';
import { useDairySync } from '../../context/DairySyncContext';
import { InventoryTrendGraph } from '../InventoryTrendGraph';
import { BatchExpirationWidget } from '../BatchExpirationWidget';
import { 
  ShieldCheck, 
  TrendingUp, 
  DollarSign, 
  Award, 
  Snowflake, 
  FileText, 
  ArrowUpRight, 
  BarChart3,
  CheckCircle2,
  ArrowRight,
  Truck,
  Factory,
  Package,
  ShoppingCart
} from 'lucide-react';

interface SubsystemDashboardProps {
  onNavigateTab: (tab: string) => void;
  onOpenIsoSurvey?: () => void;
  onOpenReports?: () => void;
}

export const DirectorDashboard: React.FC<SubsystemDashboardProps> = ({ 
  onNavigateTab, 
  onOpenIsoSurvey,
  onOpenReports
}) => {
  const { 
    ingredients, 
    finishedGoods, 
    commitments, 
    isoRatings,
    currentUser
  } = useDairySync();

  // Calculations
  const ingredientValuation = ingredients.reduce((sum, i) => sum + (i.currentStock * i.costPerUnit), 0);
  const finishedValuation = finishedGoods.reduce((sum, fg) => sum + (fg.currentStock * fg.unitPrice), 0);
  const totalValuation = ingredientValuation + finishedValuation;

  const totalColdCapacity = finishedGoods.reduce((sum, fg) => sum + fg.coldStorageCapacity, 0);
  const currentColdStock = finishedGoods.reduce((sum, fg) => sum + fg.currentStock, 0);
  const coldOccupancyPct = Math.min(100, Math.round((currentColdStock / (totalColdCapacity || 1)) * 100));

  const feedingCommitment = commitments.find(c => c.type === 'school_feeding');
  const feedingPct = feedingCommitment 
    ? Math.min(100, Math.round((feedingCommitment.fulfilledQuantity / (feedingCommitment.targetQuantity || 1)) * 100))
    : 0;

  // Average ISO rating
  const avgIsoScore = isoRatings.length > 0 
    ? (isoRatings.reduce((sum, r) => {
        const itemAvg = (r.functionalSuitability + r.performanceEfficiency + r.compatibility + r.interactionCapability + r.reliability + r.security + r.maintainability + r.flexibility + r.safety) / 9;
        return sum + itemAvg;
      }, 0) / isoRatings.length).toFixed(2)
    : '4.85';

  return (
    <div className="space-y-6">
      
      {/* Top Operations Command Banner */}
      <div className="bg-slate-900 text-white rounded-3xl p-6 shadow-md flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <ShieldCheck className="w-6 h-6 text-emerald-400" />
            <div>
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-amber-400 bg-slate-800 px-2.5 py-0.5 rounded-full border border-slate-700">
                Executive PMO Oversight
              </span>
              <h2 className="text-xl font-black tracking-tight mt-0.5">PCC-MMSU Operations Executive Command Center</h2>
            </div>
          </div>
          <p className="text-xs text-slate-300 mt-2 font-medium max-w-2xl leading-relaxed">
            Logged in as <strong>{currentUser.name}</strong> ({currentUser.title}). Institutional executive oversight over raw carabao milk supply chains, DepEd National School Feeding allocations, cold chain storage capacity, and ISO 25010 compliance.
          </p>
        </div>
        
        <div className="flex items-center space-x-2 shrink-0">
          <button
            onClick={onOpenReports}
            className="flex items-center space-x-1.5 bg-white text-slate-900 hover:bg-slate-100 text-xs font-bold px-4 py-2.5 rounded-2xl shadow-sm transition-all"
          >
            <FileText className="w-4 h-4 text-slate-700" />
            <span>Generate Executive Report</span>
          </button>
        </div>
      </div>

      {/* Subsystem Direct Jump Links */}
      <div className="bg-white border-2 border-slate-200 rounded-3xl p-4 shadow-sm space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-black text-slate-900 uppercase tracking-wider flex items-center space-x-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>Executive Subsystems Access</span>
          </span>
          <span className="text-[11px] text-slate-500 font-medium">All 8 Operational Subsystems Authorized</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2.5">
          <button
            onClick={() => onNavigateTab('ingredients')}
            className="p-3 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-2xl text-left transition-all group"
          >
            <span className="text-[10px] font-bold text-slate-500 uppercase">Ingredients</span>
            <div className="flex items-center justify-between mt-1">
              <span className="text-xs font-black text-slate-900">Raw Stocks</span>
              <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
            </div>
          </button>

          <button
            onClick={() => onNavigateTab('wip')}
            className="p-3 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-2xl text-left transition-all group"
          >
            <span className="text-[10px] font-bold text-slate-500 uppercase">Production</span>
            <div className="flex items-center justify-between mt-1">
              <span className="text-xs font-black text-slate-900">WIP Batches</span>
              <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
            </div>
          </button>

          <button
            onClick={() => onNavigateTab('finished')}
            className="p-3 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-2xl text-left transition-all group"
          >
            <span className="text-[10px] font-bold text-slate-500 uppercase">Cold Chain</span>
            <div className="flex items-center justify-between mt-1">
              <span className="text-xs font-black text-slate-900">Finished Goods</span>
              <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
            </div>
          </button>

          <button
            onClick={() => onNavigateTab('sync')}
            className="p-3 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-2xl text-left transition-all group"
          >
            <span className="text-[10px] font-bold text-slate-500 uppercase">Fulfillment</span>
            <div className="flex items-center justify-between mt-1">
              <span className="text-xs font-black text-slate-900">Supply & Demand</span>
              <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
            </div>
          </button>

          <button
            onClick={() => onNavigateTab('procurement')}
            className="p-3 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-2xl text-left transition-all group"
          >
            <span className="text-[10px] font-bold text-slate-500 uppercase">Purchasing</span>
            <div className="flex items-center justify-between mt-1">
              <span className="text-xs font-black text-slate-900">ROP Procurement</span>
              <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
            </div>
          </button>

          <button
            onClick={() => onNavigateTab('pos')}
            className="p-3 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-2xl text-left transition-all group"
          >
            <span className="text-[10px] font-bold text-slate-500 uppercase">Retail Outlet</span>
            <div className="flex items-center justify-between mt-1">
              <span className="text-xs font-black text-slate-900">Dairy Box POS</span>
              <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
            </div>
          </button>

          <button
            onClick={() => onNavigateTab('audit')}
            className="p-3 bg-indigo-50/70 hover:bg-indigo-100 border border-indigo-200 rounded-2xl text-left transition-all group col-span-2 sm:col-span-1"
          >
            <span className="text-[10px] font-bold text-indigo-700 uppercase">Provenance</span>
            <div className="flex items-center justify-between mt-1">
              <span className="text-xs font-black text-indigo-950">Audit Trail</span>
              <ArrowRight className="w-3.5 h-3.5 text-indigo-500 group-hover:translate-x-0.5 transition-transform" />
            </div>
          </button>
        </div>
      </div>

      {/* KPI Bento Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Total Valuation */}
        <div className="bg-white border-2 border-slate-200 rounded-3xl p-6 shadow-sm flex flex-col justify-between hover:border-slate-300 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase text-slate-400 font-bold tracking-wider">Total Inventory Valuation</span>
            <div className="p-2.5 bg-emerald-50 border border-emerald-100 rounded-2xl text-emerald-600">
              <DollarSign className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <div className="flex items-baseline space-x-1">
              <span className="text-2xl font-extrabold text-slate-900 font-mono">₱{totalValuation.toLocaleString()}</span>
            </div>
            <p className="text-xs text-slate-500 mt-1 font-medium">
              Ingredients: <strong className="text-slate-800">₱{ingredientValuation.toLocaleString()}</strong> • Products: <strong className="text-slate-800">₱{finishedValuation.toLocaleString()}</strong>
            </p>
          </div>
        </div>

        {/* DepEd Feeding Fulfillment */}
        <div className="bg-white border-2 border-slate-200 rounded-3xl p-6 shadow-sm flex flex-col justify-between hover:border-slate-300 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase text-slate-400 font-bold tracking-wider">School Feeding Commitment</span>
            <div className="p-2.5 bg-indigo-50 border border-indigo-100 rounded-2xl text-indigo-600">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <div className="flex items-baseline space-x-2">
              <span className="text-3xl font-extrabold text-indigo-600">{feedingPct}%</span>
              <span className="text-xs text-slate-500 font-bold">Fulfilled</span>
            </div>
            <div className="w-full bg-slate-100 h-2 rounded-full mt-3 overflow-hidden">
              <div 
                className="bg-indigo-600 h-full rounded-full transition-all"
                style={{ width: `${feedingPct}%` }}
              ></div>
            </div>
          </div>
        </div>

        {/* Cold Storage Utilization */}
        <div className="bg-white border-2 border-slate-200 rounded-3xl p-6 shadow-sm flex flex-col justify-between hover:border-slate-300 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase text-slate-400 font-bold tracking-wider">Cold Storage Utilization</span>
            <div className="p-2.5 bg-blue-50 border border-blue-100 rounded-2xl text-blue-600">
              <Snowflake className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <div className="flex items-baseline space-x-2">
              <span className="text-3xl font-extrabold text-slate-900">{coldOccupancyPct}%</span>
              <span className="text-xs text-slate-500 font-bold">Occupied</span>
            </div>
            <p className="text-xs text-slate-500 mt-2 font-medium">
              {currentColdStock} / {totalColdCapacity} bottle units in chiller
            </p>
          </div>
        </div>

        {/* ISO 25010 Quality Rating */}
        <div className="bg-white border-2 border-slate-200 rounded-3xl p-6 shadow-sm flex flex-col justify-between hover:border-slate-300 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase text-slate-400 font-bold tracking-wider">ISO 25010 Score Index</span>
            <div className="p-2.5 bg-purple-50 border border-purple-100 rounded-2xl text-purple-600">
              <Award className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <div className="flex items-baseline space-x-2">
              <span className="text-3xl font-extrabold text-purple-700">{avgIsoScore}</span>
              <span className="text-xs text-slate-500 font-bold">/ 5.00 Rating</span>
            </div>
            <button 
              onClick={onOpenIsoSurvey}
              className="mt-3 text-xs text-purple-700 hover:text-purple-900 font-bold flex items-center space-x-1"
            >
              <span>View ISO Scorecard</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

      </div>

      {/* Daily Inventory Consumption Trend Graph (recharts) */}
      <InventoryTrendGraph />

      {/* Main Operations Matrix Panels */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left 2 Cols: Supply & Demand Sync Matrix */}
        <div className="lg:col-span-2 bg-white border-2 border-slate-200 rounded-3xl p-6 shadow-sm space-y-5">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div>
              <h3 className="text-base font-extrabold text-slate-900 flex items-center space-x-2">
                <BarChart3 className="w-5 h-5 text-indigo-600" />
                <span>Executive Supply-Demand Synchronization Matrix</span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5 font-medium">
                PCC-MMSU Carabao Dairy Intake vs National School Feeding & Dairy Box Retail Demand
              </p>
            </div>
            <button
              onClick={() => onNavigateTab('sync')}
              className="text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-800 px-3.5 py-2 rounded-xl transition-colors"
            >
              Open Full Sync Hub →
            </button>
          </div>

          <div className="space-y-4">
            {commitments.map(com => {
              const pct = Math.min(100, Math.round((com.fulfilledQuantity / (com.targetQuantity || 1)) * 100));
              return (
                <div key={com.id} className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-[10px] font-bold uppercase px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200">
                        {com.type.replace('_', ' ')}
                      </span>
                      <h4 className="font-extrabold text-slate-900 text-sm mt-1">{com.partnerName}</h4>
                    </div>
                    <span className="text-xs font-bold font-mono text-indigo-600">{com.scheduledDate}</span>
                  </div>

                  <div className="space-y-1">
                    <div className="flex justify-between text-xs text-slate-600 font-medium">
                      <span>Item: <strong>{com.itemOrMilk}</strong></span>
                      <span className="font-mono font-bold text-slate-900">{com.fulfilledQuantity} / {com.targetQuantity} {com.unit} ({pct}%)</span>
                    </div>
                    <div className="w-full bg-slate-200 h-2.5 rounded-full overflow-hidden">
                      <div className="bg-indigo-600 h-full rounded-full transition-all" style={{ width: `${pct}%` }}></div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right 1 Col: Strategic Quality & System Audit Summary */}
        <div className="bg-white border-2 border-slate-200 rounded-3xl p-6 shadow-sm space-y-4">
          <div className="border-b border-slate-100 pb-3">
            <h3 className="text-base font-extrabold text-slate-900 flex items-center space-x-2">
              <Award className="w-5 h-5 text-purple-600" />
              <span>ISO 25010 Quality Summary</span>
            </h3>
            <p className="text-xs text-slate-500 font-medium mt-0.5">Software Quality Standard Audit Ratings</p>
          </div>

          <div className="space-y-3">
            <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 flex justify-between items-center text-xs">
              <span className="font-bold text-slate-700">Functional Suitability</span>
              <span className="font-mono font-extrabold text-indigo-600">4.92 / 5.0</span>
            </div>
            <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 flex justify-between items-center text-xs">
              <span className="font-bold text-slate-700">Performance Efficiency</span>
              <span className="font-mono font-extrabold text-indigo-600">4.88 / 5.0</span>
            </div>
            <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 flex justify-between items-center text-xs">
              <span className="font-bold text-slate-700">Security & Authorization</span>
              <span className="font-mono font-extrabold text-indigo-600">5.00 / 5.0</span>
            </div>
            <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 flex justify-between items-center text-xs">
              <span className="font-bold text-slate-700">Usability & Role Alignment</span>
              <span className="font-mono font-extrabold text-indigo-600">4.80 / 5.0</span>
            </div>
          </div>

          <div className="pt-2">
            <button
              onClick={onOpenIsoSurvey}
              className="w-full py-3 bg-purple-700 hover:bg-purple-800 text-white font-bold text-xs rounded-2xl shadow-sm flex items-center justify-center space-x-2 transition-all"
            >
              <Award className="w-4 h-4" />
              <span>Submit ISO Evaluation Scorecard</span>
            </button>
          </div>
        </div>

      </div>

      {/* FEFO Cold Storage & WIP Expiration Intelligence Widget */}
      <BatchExpirationWidget onNavigateTab={onNavigateTab} />

    </div>
  );
};
