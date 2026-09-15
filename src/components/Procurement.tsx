import React, { useState } from 'react';
import { useDairySync } from '../context/DairySyncContext';
import { Truck, AlertTriangle, CheckCircle2, ShoppingBag, Send, FileText } from 'lucide-react';

export const Procurement: React.FC = () => {
  const { ingredients, updateIngredientStock } = useDairySync();
  const [orderedIds, setOrderedIds] = useState<string[]>([]);

  const ropTriggered = ingredients.filter(i => i.currentStock <= i.reorderPoint);

  const handleSimulateRestock = (id: string, ropQty: number) => {
    const item = ingredients.find(i => i.id === id);
    if (!item) return;
    updateIngredientStock(id, item.currentStock + ropQty, `Procurement Order Restock (+${ropQty} ${item.unit})`);
    setOrderedIds(prev => [...prev, id]);
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white border-2 border-slate-200 p-6 rounded-3xl shadow-sm text-slate-900">
        <div>
          <h1 className="text-xl font-bold text-slate-900 flex items-center space-x-2 tracking-tight">
            <Truck className="w-6 h-6 text-amber-500" />
            <span>Procurement & Reorder Point (ROP) Management</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1 font-medium">
            Predictive procurement triggers for raw materials, flavorings, PET bottles & packaging to prevent production halts
          </p>
        </div>
      </div>

      {/* ROP Alert List */}
      <div className="bg-white border-2 border-slate-200 rounded-3xl p-6 shadow-sm space-y-4 text-slate-900">
        <div className="flex items-center justify-between border-b-2 border-slate-100 pb-3">
          <h2 className="text-base font-extrabold text-slate-900 flex items-center space-x-2">
            <AlertTriangle className="w-5 h-5 text-amber-500" />
            <span>Materials Below Reorder Point (ROP) Threshold</span>
          </h2>
          <span className="text-xs font-mono font-bold bg-amber-50 text-amber-700 border border-amber-200 px-3 py-1 rounded-full">
            {ropTriggered.length} Items Require Action
          </span>
        </div>

        {ropTriggered.length === 0 ? (
          <div className="text-center py-12 space-y-2">
            <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto" />
            <h3 className="text-sm font-extrabold text-slate-900">All Raw Material Stocks Optimal!</h3>
            <p className="text-xs text-slate-500 font-medium">No items currently fall below their calculated Reorder Point.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {ropTriggered.map(item => {
              const recommendedOrder = Math.max(item.maxStock - item.currentStock, item.reorderPoint * 2);
              const totalEstCost = recommendedOrder * item.costPerUnit;

              return (
                <div key={item.id} className="p-4 rounded-2xl bg-amber-50/60 border-2 border-amber-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <span className="text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full bg-white text-slate-600 border border-slate-200">
                        {item.sku}
                      </span>
                      <h3 className="font-extrabold text-slate-900 text-sm">{item.name}</h3>
                    </div>
                    <p className="text-xs text-slate-600 font-medium">
                      Supplier: <strong className="text-slate-900 font-bold">{item.supplier}</strong> (Lead time: {item.leadTimeDays} days)
                    </p>
                    <div className="flex items-center space-x-3 text-xs text-slate-500 pt-1 font-medium">
                      <span>Current: <strong className="text-rose-600 font-mono font-bold">{item.currentStock} {item.unit}</strong></span>
                      <span>ROP Threshold: <strong className="text-amber-700 font-mono font-bold">{item.reorderPoint} {item.unit}</strong></span>
                      <span>Safety Stock: <strong className="text-slate-800 font-mono font-bold">{item.safetyStock} {item.unit}</strong></span>
                    </div>
                  </div>

                  <div className="flex flex-col sm:items-end space-y-2 shrink-0 border-t sm:border-t-0 border-amber-200/80 pt-3 sm:pt-0">
                    <div className="text-right">
                      <p className="text-xs text-slate-500 font-medium">Recommended Order Quantity:</p>
                      <p className="text-sm font-extrabold text-amber-700 font-mono">
                        +{recommendedOrder} {item.unit} (Est. ₱{totalEstCost.toLocaleString()}.00)
                      </p>
                    </div>

                    <button
                      onClick={() => handleSimulateRestock(item.id, recommendedOrder)}
                      className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs px-4 py-2.5 rounded-2xl flex items-center space-x-1.5 shadow-sm transition-colors"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>Issue Restock Purchase Order</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Supplier Directory Table */}
      <div className="bg-white border-2 border-slate-200 rounded-3xl p-6 shadow-sm space-y-4 text-slate-900">
        <h2 className="text-base font-extrabold text-slate-900">Full Material Reorder Parameters & Lead Times</h2>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-50 uppercase text-[10px] text-slate-500 font-bold tracking-wider border-b-2 border-slate-100">
              <tr>
                <th className="p-3">Material</th>
                <th className="p-3">Supplier</th>
                <th className="p-3">Lead Time</th>
                <th className="p-3">Daily Usage</th>
                <th className="p-3">ROP Formula</th>
                <th className="p-3 text-right">Unit Price</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {ingredients.map(ing => (
                <tr key={ing.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="p-3 font-bold text-slate-900">{ing.name}</td>
                  <td className="p-3 text-slate-500">{ing.supplier}</td>
                  <td className="p-3 font-mono">{ing.leadTimeDays} days</td>
                  <td className="p-3 font-mono">{ing.avgDailyConsumption} {ing.unit}/day</td>
                  <td className="p-3 font-mono text-amber-600 font-extrabold">{ing.reorderPoint} {ing.unit}</td>
                  <td className="p-3 text-right font-mono font-bold text-slate-900">₱{ing.costPerUnit}.00</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};
