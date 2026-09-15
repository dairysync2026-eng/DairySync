import React from 'react';
import { useDairySync } from '../context/DairySyncContext';
import { DeveloperDashboard } from './dashboards/DeveloperDashboard';
import { DirectorDashboard } from './dashboards/DirectorDashboard';
import { ProcurementDashboard } from './dashboards/ProcurementDashboard';
import { PlantManagerDashboard } from './dashboards/PlantManagerDashboard';
import { ProductionStaffDashboard } from './dashboards/ProductionStaffDashboard';
import { StoreOutletDashboard } from './dashboards/StoreOutletDashboard';
import { 
  Truck, 
  Package, 
  AlertTriangle, 
  Layers, 
  DollarSign, 
  Factory, 
  Milk, 
  CheckCircle2, 
  Clock, 
  Snowflake, 
  ShoppingCart, 
  TrendingUp,
  ShieldCheck,
  Award
} from 'lucide-react';

interface DashboardProps {
  onNavigateTab: (tab: string) => void;
  onOpenIsoSurvey?: () => void;
  onOpenReports?: () => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ 
  onNavigateTab, 
  onOpenIsoSurvey,
  onOpenReports
}) => {
  const { 
    currentRole, 
    currentUser, 
    ingredients, 
    finishedGoods, 
    wipBatches, 
    commitments, 
    transactions, 
    isoRatings 
  } = useDairySync();

  // Role-Specific Summary Card Computations
  // 1. Procurement Metrics (Warehouse & Procurement staff)
  const criticalRopCount = ingredients.filter(i => i.currentStock <= i.reorderPoint).length;
  const rawMilk = ingredients.find(i => i.category === 'milk');
  const packagingItems = ingredients.filter(i => i.category === 'packaging');
  const lowPackagingCount = packagingItems.filter(i => i.currentStock <= i.reorderPoint).length;
  const totalRawValuation = ingredients.reduce((sum, i) => sum + (i.currentStock * i.costPerUnit), 0);

  // 2. Production Metrics (Supervisors & Production staff)
  const activeWip = wipBatches.filter(b => b.status !== 'completed' && b.status !== 'cancelled');
  const rawMilkInProcessing = activeWip.reduce((sum, b) => sum + b.rawMilkVolumeUsed, 0);
  const targetUnitsOutput = activeWip.reduce((sum, b) => sum + b.targetQuantity, 0);
  const completedToday = wipBatches.filter(b => b.status === 'completed');

  // 3. Retail Metrics (Dairy Box Store Outlet)
  const totalRetailStock = finishedGoods.reduce((sum, fg) => sum + fg.allocatedRetail, 0);
  const retailSalesToday = transactions
    .filter(t => t.action === 'out_sale' && t.itemType === 'finished_good')
    .reduce((sum, t) => {
      const product = finishedGoods.find(fg => fg.id === t.itemId);
      return sum + (t.quantity * (product?.unitPrice || 0));
    }, 0);
  const feedingAllocatedTotal = finishedGoods.reduce((sum, fg) => sum + fg.allocatedFeedingProgram, 0);

  // 4. Executive Metrics (Director & Developer)
  const finishedValuation = finishedGoods.reduce((sum, fg) => sum + (fg.currentStock * fg.unitPrice), 0);
  const totalEnterpriseValuation = totalRawValuation + finishedValuation;
  const totalColdCapacity = finishedGoods.reduce((sum, fg) => sum + fg.coldStorageCapacity, 0);
  const currentColdStock = finishedGoods.reduce((sum, fg) => sum + fg.currentStock, 0);
  const coldOccupancyPct = Math.min(100, Math.round((currentColdStock / (totalColdCapacity || 1)) * 100));

  return (
    <div className="space-y-6">
      {/* Role-Specific Dashboard Summary Cards Section */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-black text-slate-900 uppercase tracking-wider flex items-center space-x-1.5">
            <CheckCircle2 className="w-4 h-4 text-indigo-600" />
            <span>Role-Specific Operational Summary ({currentUser.title})</span>
          </span>
          <span className="text-[11px] text-slate-500 font-medium">
            Tailored for <strong>{currentUser.name}</strong>
          </span>
        </div>

        {/* Conditional Summary Cards by Role */}
        {currentRole === 'procurement' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white border-2 border-rose-200 rounded-3xl p-5 shadow-xs flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-extrabold uppercase text-rose-600 tracking-wider">Critical ROP Items</span>
                <div className="p-2 bg-rose-50 text-rose-600 rounded-xl">
                  <AlertTriangle className="w-4 h-4" />
                </div>
              </div>
              <div className="mt-3">
                <span className="text-3xl font-black text-rose-600 font-mono">{criticalRopCount}</span>
                <span className="text-xs text-rose-500 font-bold ml-1.5">Needs Purchase Order</span>
                <p className="text-[11px] text-slate-500 mt-1 font-medium">Raw materials below reorder point</p>
              </div>
            </div>

            <div className="bg-white border-2 border-slate-200 rounded-3xl p-5 shadow-xs flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase text-slate-400 tracking-wider">Raw Carabao Milk Silo</span>
                <div className="p-2 bg-blue-50 text-blue-600 rounded-xl">
                  <Milk className="w-4 h-4" />
                </div>
              </div>
              <div className="mt-3">
                <span className="text-3xl font-black text-slate-900 font-mono">{rawMilk?.currentStock || 0} L</span>
                <span className="text-xs text-slate-500 font-bold ml-1.5">/ ROP: {rawMilk?.reorderPoint} L</span>
                <p className="text-[11px] text-slate-500 mt-1 font-medium">Buffer level in Reception Chiller</p>
              </div>
            </div>

            <div className="bg-white border-2 border-slate-200 rounded-3xl p-5 shadow-xs flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase text-slate-400 tracking-wider">Packaging Buffer</span>
                <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl">
                  <Package className="w-4 h-4" />
                </div>
              </div>
              <div className="mt-3">
                <span className="text-3xl font-black text-slate-900 font-mono">{packagingItems.length} SKUs</span>
                <p className="text-[11px] text-slate-500 mt-1 font-medium">
                  {lowPackagingCount > 0 ? (
                    <span className="text-amber-600 font-bold">{lowPackagingCount} packaging items need restock</span>
                  ) : (
                    <span className="text-emerald-600 font-bold">Bottles & seals buffer optimal</span>
                  )}
                </p>
              </div>
            </div>

            <div className="bg-white border-2 border-slate-200 rounded-3xl p-5 shadow-xs flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase text-slate-400 tracking-wider">Raw Material Valuation</span>
                <div className="p-2 bg-emerald-50 text-emerald-600 rounded-xl">
                  <DollarSign className="w-4 h-4" />
                </div>
              </div>
              <div className="mt-3">
                <span className="text-2xl font-black text-slate-900 font-mono">₱{totalRawValuation.toLocaleString()}</span>
                <p className="text-[11px] text-slate-500 mt-1 font-medium">Across {ingredients.length} active raw catalog items</p>
              </div>
            </div>
          </div>
        )}

        {(currentRole === 'production_staff' || currentRole === 'plant_manager') && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white border-2 border-indigo-200 rounded-3xl p-5 shadow-xs flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-extrabold uppercase text-indigo-600 tracking-wider">Active WIP Floor Lines</span>
                <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl">
                  <Factory className="w-4 h-4" />
                </div>
              </div>
              <div className="mt-3">
                <span className="text-3xl font-black text-indigo-600 font-mono">{activeWip.length}</span>
                <span className="text-xs text-indigo-500 font-bold ml-1.5">Batches Running</span>
                <p className="text-[11px] text-slate-500 mt-1 font-medium">Undergoing pasteurization / bottling</p>
              </div>
            </div>

            <div className="bg-white border-2 border-slate-200 rounded-3xl p-5 shadow-xs flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase text-slate-400 tracking-wider">Milk in Processing</span>
                <div className="p-2 bg-blue-50 text-blue-600 rounded-xl">
                  <Milk className="w-4 h-4" />
                </div>
              </div>
              <div className="mt-3">
                <span className="text-3xl font-black text-slate-900 font-mono">{rawMilkInProcessing} L</span>
                <p className="text-[11px] text-slate-500 mt-1 font-medium">Currently inside pasteurizer & incubation vats</p>
              </div>
            </div>

            <div className="bg-white border-2 border-slate-200 rounded-3xl p-5 shadow-xs flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase text-slate-400 tracking-wider">Target Finished Units</span>
                <div className="p-2 bg-emerald-50 text-emerald-600 rounded-xl">
                  <CheckCircle2 className="w-4 h-4" />
                </div>
              </div>
              <div className="mt-3">
                <span className="text-3xl font-black text-slate-900 font-mono">{targetUnitsOutput}</span>
                <span className="text-xs text-slate-500 font-bold ml-1.5">Bottles / Packs</span>
                <p className="text-[11px] text-slate-500 mt-1 font-medium">{completedToday.length} batches completed today</p>
              </div>
            </div>

            <div className="bg-white border-2 border-slate-200 rounded-3xl p-5 shadow-xs flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase text-slate-400 tracking-wider">Cold Chiller Status</span>
                <div className="p-2 bg-teal-50 text-teal-600 rounded-xl">
                  <Snowflake className="w-4 h-4" />
                </div>
              </div>
              <div className="mt-3">
                <span className="text-3xl font-black text-teal-700 font-mono">{coldOccupancyPct}%</span>
                <span className="text-xs text-teal-600 font-bold ml-1.5">Chiller Intake Ready</span>
                <p className="text-[11px] text-slate-500 mt-1 font-medium">3.8°C nominal storage temp</p>
              </div>
            </div>
          </div>
        )}

        {currentRole === 'store_outlet' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white border-2 border-emerald-200 rounded-3xl p-5 shadow-xs flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-extrabold uppercase text-emerald-600 tracking-wider">Retail Ready Stock</span>
                <div className="p-2 bg-emerald-50 text-emerald-600 rounded-xl">
                  <Package className="w-4 h-4" />
                </div>
              </div>
              <div className="mt-3">
                <span className="text-3xl font-black text-emerald-700 font-mono">{totalRetailStock}</span>
                <span className="text-xs text-emerald-600 font-bold ml-1.5">Units Available</span>
                <p className="text-[11px] text-slate-500 mt-1 font-medium">In Dairy Box display chillers</p>
              </div>
            </div>

            <div className="bg-white border-2 border-slate-200 rounded-3xl p-5 shadow-xs flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase text-slate-400 tracking-wider">Today's POS Sales</span>
                <div className="p-2 bg-emerald-50 text-emerald-600 rounded-xl">
                  <DollarSign className="w-4 h-4" />
                </div>
              </div>
              <div className="mt-3">
                <span className="text-2xl font-black text-slate-900 font-mono">₱{retailSalesToday.toLocaleString()}</span>
                <p className="text-[11px] text-slate-500 mt-1 font-medium">Gross walk-in register receipts</p>
              </div>
            </div>

            <div className="bg-white border-2 border-slate-200 rounded-3xl p-5 shadow-xs flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase text-slate-400 tracking-wider">School Feeding Reserve</span>
                <div className="p-2 bg-amber-50 text-amber-600 rounded-xl">
                  <TrendingUp className="w-4 h-4" />
                </div>
              </div>
              <div className="mt-3">
                <span className="text-3xl font-black text-slate-900 font-mono">{feedingAllocatedTotal}</span>
                <span className="text-xs text-amber-600 font-bold ml-1.5">Units Protected</span>
                <p className="text-[11px] text-slate-500 mt-1 font-medium">Reserved for DepEd allocation</p>
              </div>
            </div>

            <div className="bg-white border-2 border-slate-200 rounded-3xl p-5 shadow-xs flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase text-slate-400 tracking-wider">POS Register Status</span>
                <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl">
                  <ShoppingCart className="w-4 h-4" />
                </div>
              </div>
              <div className="mt-3">
                <span className="text-2xl font-black text-slate-900 font-mono">Terminal #01</span>
                <p className="text-[11px] text-emerald-600 font-bold mt-1">Cash & QR Receipt Ready</p>
              </div>
            </div>
          </div>
        )}

        {(currentRole === 'director' || currentRole === 'developer') && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white border-2 border-slate-200 rounded-3xl p-5 shadow-xs flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase text-slate-400 tracking-wider">Enterprise Valuation</span>
                <div className="p-2 bg-emerald-50 text-emerald-600 rounded-xl">
                  <DollarSign className="w-4 h-4" />
                </div>
              </div>
              <div className="mt-3">
                <span className="text-2xl font-black text-slate-900 font-mono">₱{totalEnterpriseValuation.toLocaleString()}</span>
                <p className="text-[11px] text-slate-500 mt-1 font-medium">Raw materials + cold storage inventory</p>
              </div>
            </div>

            <div className="bg-white border-2 border-teal-200 rounded-3xl p-5 shadow-xs flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-extrabold uppercase text-teal-600 tracking-wider">Cold Storage Occupancy</span>
                <div className="p-2 bg-teal-50 text-teal-600 rounded-xl">
                  <Snowflake className="w-4 h-4" />
                </div>
              </div>
              <div className="mt-3">
                <span className="text-3xl font-black text-teal-700 font-mono">{coldOccupancyPct}%</span>
                <span className="text-xs text-teal-600 font-bold ml-1.5">Capacity</span>
                <p className="text-[11px] text-slate-500 mt-1 font-medium">{currentColdStock} / {totalColdCapacity} bottle units in chiller</p>
              </div>
            </div>

            <div className="bg-white border-2 border-slate-200 rounded-3xl p-5 shadow-xs flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase text-slate-400 tracking-wider">Critical Alerts</span>
                <div className="p-2 bg-rose-50 text-rose-600 rounded-xl">
                  <AlertTriangle className="w-4 h-4" />
                </div>
              </div>
              <div className="mt-3">
                <span className="text-3xl font-black text-rose-600 font-mono">{criticalRopCount}</span>
                <span className="text-xs text-rose-500 font-bold ml-1.5">Reorder Triggers</span>
                <p className="text-[11px] text-slate-500 mt-1 font-medium">Monitored by automated poller</p>
              </div>
            </div>

            <div className="bg-white border-2 border-slate-200 rounded-3xl p-5 shadow-xs flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase text-slate-400 tracking-wider">ISO 25010 Quality</span>
                <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl">
                  <Award className="w-4 h-4" />
                </div>
              </div>
              <div className="mt-3">
                <span className="text-2xl font-black text-slate-900 font-mono">4.85 / 5.0</span>
                <p className="text-[11px] text-emerald-600 font-bold mt-1">Excellent Institutional Compliance</p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Primary Role Specific Subsystem Dashboard */}
      {currentRole === 'developer' && (
        <DeveloperDashboard 
          onNavigateTab={onNavigateTab} 
          onOpenIsoSurvey={onOpenIsoSurvey} 
          onOpenReports={onOpenReports} 
        />
      )}

      {currentRole === 'director' && (
        <DirectorDashboard 
          onNavigateTab={onNavigateTab} 
          onOpenIsoSurvey={onOpenIsoSurvey} 
          onOpenReports={onOpenReports} 
        />
      )}

      {currentRole === 'procurement' && (
        <ProcurementDashboard 
          onNavigateTab={onNavigateTab} 
        />
      )}

      {currentRole === 'plant_manager' && (
        <PlantManagerDashboard 
          onNavigateTab={onNavigateTab} 
        />
      )}

      {currentRole === 'production_staff' && (
        <ProductionStaffDashboard 
          onNavigateTab={onNavigateTab} 
        />
      )}

      {currentRole === 'store_outlet' && (
        <StoreOutletDashboard 
          onNavigateTab={onNavigateTab} 
        />
      )}
    </div>
  );
};
