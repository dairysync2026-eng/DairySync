import React, { useState } from 'react';
import { RawIngredient, FinishedGood } from '../types';
import { useDairySync } from '../context/DairySyncContext';
import { 
  Printer, 
  X, 
  CheckSquare, 
  FileText, 
  Filter, 
  ShieldCheck, 
  Download,
  Building2,
  Calendar,
  AlertTriangle
} from 'lucide-react';

interface PrintStockReportModalProps {
  type: 'raw_ingredients' | 'cold_storage';
  filteredItems: RawIngredient[] | FinishedGood[];
  allItems: RawIngredient[] | FinishedGood[];
  filterSummary?: string;
  onClose: () => void;
}

export const PrintStockReportModal: React.FC<PrintStockReportModalProps> = ({
  type,
  filteredItems,
  allItems,
  filterSummary,
  onClose
}) => {
  const { currentRole } = useDairySync();
  const [printScope, setPrintScope] = useState<'filtered' | 'all'>(
    filteredItems.length !== allItems.length ? 'filtered' : 'all'
  );
  const [showAuditCheckboxes, setShowAuditCheckboxes] = useState(true);
  const [showSignatures, setShowSignatures] = useState(true);

  const itemsToPrint = printScope === 'filtered' ? filteredItems : allItems;
  const isRaw = type === 'raw_ingredients';

  // Current system timestamp
  const now = new Date();
  const dateFormatted = now.toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric'
  });
  const timeFormatted = now.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  });
  const documentCode = isRaw
    ? `PCC-MMSU-INV-RAW-${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}`
    : `PCC-MMSU-INV-COLD-${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}`;

  // Totals calculation
  const totalUnits = itemsToPrint.reduce((sum, item) => sum + item.currentStock, 0);
  const totalValuation = isRaw
    ? (itemsToPrint as RawIngredient[]).reduce((sum, ing) => sum + (ing.currentStock * ing.costPerUnit), 0)
    : (itemsToPrint as FinishedGood[]).reduce((sum, fg) => sum + (fg.currentStock * fg.unitPrice), 0);

  const lowStockCount = isRaw
    ? (itemsToPrint as RawIngredient[]).filter(ing => ing.currentStock <= ing.reorderPoint).length
    : (itemsToPrint as FinishedGood[]).filter(fg => fg.currentStock <= (fg.safetyStock ?? 50)).length;

  const handleTriggerPrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-900/70 backdrop-blur-sm overflow-y-auto">
      {/* Modal Container */}
      <div className="bg-white rounded-3xl shadow-2xl border-2 border-slate-200 max-w-5xl w-full my-6 flex flex-col max-h-[92vh] overflow-hidden">
        
        {/* ======================================================== */}
        {/* NON-PRINTABLE MODAL HEADER & CONTROLS TOOLBAR */}
        {/* ======================================================== */}
        <div className="p-4 sm:p-5 bg-slate-900 text-white flex flex-col md:flex-row md:items-center justify-between gap-4 shrink-0 print:hidden">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-500/20 border border-indigo-400/40 flex items-center justify-center text-indigo-400">
              <Printer className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white flex items-center space-x-2">
                <span>{isRaw ? 'Raw Ingredients Inventory Hard Copy' : 'Cold Storage Stock Inventory Hard Copy'}</span>
                <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded-full bg-indigo-500/30 text-indigo-200 border border-indigo-400/30">
                  Print Ready
                </span>
              </h2>
              <p className="text-xs text-slate-300">
                Official physical audit sheet formatted for standard 8.5" x 11" and A4 hard copies
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Print Scope selection if list is filtered */}
            {filteredItems.length !== allItems.length && (
              <div className="flex items-center bg-slate-800 p-1 rounded-xl border border-slate-700 text-xs mr-2">
                <button
                  type="button"
                  onClick={() => setPrintScope('filtered')}
                  className={`px-2.5 py-1 rounded-lg font-semibold transition-all ${
                    printScope === 'filtered'
                      ? 'bg-indigo-600 text-white'
                      : 'text-slate-300 hover:text-white'
                  }`}
                >
                  Filtered ({filteredItems.length})
                </button>
                <button
                  type="button"
                  onClick={() => setPrintScope('all')}
                  className={`px-2.5 py-1 rounded-lg font-semibold transition-all ${
                    printScope === 'all'
                      ? 'bg-indigo-600 text-white'
                      : 'text-slate-300 hover:text-white'
                  }`}
                >
                  All ({allItems.length})
                </button>
              </div>
            )}

            {/* Checkbox toggles for hard copy printout options */}
            <label className="flex items-center space-x-1.5 text-xs text-slate-300 cursor-pointer bg-slate-800 px-3 py-1.5 rounded-xl border border-slate-700 select-none">
              <input 
                type="checkbox" 
                checked={showAuditCheckboxes}
                onChange={e => setShowAuditCheckboxes(e.target.checked)}
                className="rounded text-indigo-600 focus:ring-0"
              />
              <span className="text-[11px] font-medium">Audit Checks</span>
            </label>

            <label className="flex items-center space-x-1.5 text-xs text-slate-300 cursor-pointer bg-slate-800 px-3 py-1.5 rounded-xl border border-slate-700 select-none">
              <input 
                type="checkbox" 
                checked={showSignatures}
                onChange={e => setShowSignatures(e.target.checked)}
                className="rounded text-indigo-600 focus:ring-0"
              />
              <span className="text-[11px] font-medium">Sign-off Block</span>
            </label>

            {/* Action Buttons */}
            <button
              id="btn-confirm-print-dialog"
              type="button"
              onClick={handleTriggerPrint}
              className="flex items-center space-x-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold px-4 py-2 rounded-xl shadow-md shadow-indigo-900/50 transition-all cursor-pointer"
            >
              <Printer className="w-4 h-4" />
            </button>

            <button
              id="btn-close-print-modal"
              type="button"
              onClick={onClose}
              className="text-slate-400 hover:text-white p-2 rounded-xl hover:bg-slate-800 transition-colors"
              title="Close Preview"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* ======================================================== */}
        {/* PRINTABLE HARD COPY DOCUMENT CONTAINER */}
        {/* ======================================================== */}
        <div className="flex-1 overflow-y-auto p-6 sm:p-8 bg-slate-100 text-slate-900">
          <div className="printable-report max-w-4xl mx-auto bg-white p-8 sm:p-10 border-2 border-slate-300 shadow-md rounded-2xl print:border-none print:shadow-none print:p-0 print:m-0">
            
            {/* Institutional Header with Republic of the Philippines Details */}
            <div className="border-b-2 border-slate-800 pb-4 mb-5">
              <div className="text-center space-y-1">
                <p className="text-[10px] tracking-widest uppercase font-bold text-slate-600">
                  Republic of the Philippines &bull; Department of Agriculture
                </p>
                <h1 className="text-base sm:text-lg font-black text-slate-900 tracking-tight uppercase">
                  Philippine Carabao Center at Mariano Marcos State University
                </h1>
                <p className="text-xs font-semibold text-slate-700">
                  PCC-MMSU Dairy Processing Plant &bull; Batac City, Ilocos Norte 2906
                </p>
                <div className="pt-2">
                  <span className="inline-block px-3 py-1 bg-slate-900 text-white text-xs font-black tracking-wider uppercase rounded-md print:bg-slate-900 print:text-white">
                    {isRaw 
                      ? 'Physical Inventory Audit Sheet — Raw Ingredients & Packaging' 
                      : 'Physical Inventory Audit Sheet — Cold Storage & Finished Goods'}
                  </span>
                </div>
              </div>

              {/* Document Meta Row */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4 pt-3 border-t border-slate-300 text-xs">
                <div>
                  <span className="text-[10px] font-bold uppercase text-slate-500 block">Doc Control No.</span>
                  <span className="font-mono font-bold text-slate-800 text-[11px]">{documentCode}</span>
                </div>
                <div>
                  <span className="text-[10px] font-bold uppercase text-slate-500 block">Audit Date &amp; Time</span>
                  <span className="font-mono font-bold text-slate-800 text-[11px]">{dateFormatted}, {timeFormatted}</span>
                </div>
                <div>
                  <span className="text-[10px] font-bold uppercase text-slate-500 block">Generated By</span>
                  <span className="font-bold text-slate-800 text-[11px] capitalize">{currentRole.replace('_', ' ')}</span>
                </div>
                <div>
                  <span className="text-[10px] font-bold uppercase text-slate-500 block">Scope / Status</span>
                  <span className="font-semibold text-slate-800 text-[11px]">
                    {printScope === 'filtered' && filterSummary ? filterSummary : `All Items (${itemsToPrint.length})`}
                  </span>
                </div>
              </div>
            </div>

            {/* Key Summary Metrics Ribbon */}
            <div className="grid grid-cols-3 gap-3 mb-5 p-3 rounded-xl bg-slate-50 border border-slate-300 text-xs">
              <div className="text-center">
                <span className="text-[10px] font-bold uppercase text-slate-500 block">Total Catalog Items</span>
                <span className="text-base font-black text-slate-900 font-mono">{itemsToPrint.length} Items</span>
              </div>
              <div className="text-center border-x border-slate-300">
                <span className="text-[10px] font-bold uppercase text-slate-500 block">Total Physical Stock Units</span>
                <span className="text-base font-black text-slate-900 font-mono">{totalUnits.toLocaleString()}</span>
              </div>
              <div className="text-center">
                <span className="text-[10px] font-bold uppercase text-slate-500 block">Stock Valuation (PHP)</span>
                <span className="text-base font-black text-slate-900 font-mono">₱{totalValuation.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
              </div>
            </div>

            {/* ======================================================== */}
            {/* 1. RAW INGREDIENTS PRINTABLE TABLE */}
            {/* ======================================================== */}
            {isRaw && (
              <table className="w-full text-left border-collapse text-[11px]">
                <thead>
                  <tr className="bg-slate-100 border-y-2 border-slate-400 text-slate-800 font-black text-[10px] uppercase tracking-wider">
                    <th className="py-2.5 px-2 border border-slate-300">SKU</th>
                    <th className="py-2.5 px-2 border border-slate-300">Material Description</th>
                    <th className="py-2.5 px-2 border border-slate-300">Category</th>
                    <th className="py-2.5 px-2 border border-slate-300 text-right">System Stock</th>
                    <th className="py-2.5 px-2 border border-slate-300 text-right">ROP / Buffer</th>
                    <th className="py-2.5 px-2 border border-slate-300 text-right">Cost (₱)</th>
                    <th className="py-2.5 px-2 border border-slate-300 text-right">Total (₱)</th>
                    <th className="py-2.5 px-2 border border-slate-300">Location</th>
                    {showAuditCheckboxes && (
                      <th className="py-2.5 px-2 border border-slate-300 text-center w-24">Physical Audit</th>
                    )}
                  </tr>
                </thead>
                <tbody>
                  {(itemsToPrint as RawIngredient[]).map((ing, idx) => {
                    const isBelowRop = ing.currentStock <= ing.reorderPoint;
                    const itemValue = ing.currentStock * ing.costPerUnit;

                    return (
                      <tr 
                        key={ing.id} 
                        className={`border-b border-slate-300 ${idx % 2 === 1 ? 'bg-slate-50/70' : 'bg-white'}`}
                      >
                        <td className="py-2 px-2 border border-slate-300 font-mono font-bold text-slate-800 whitespace-nowrap">
                          {ing.sku}
                        </td>
                        <td className="py-2 px-2 border border-slate-300">
                          <div className="font-bold text-slate-900">{ing.name}</div>
                          {ing.expiryDate && (
                            <span className="text-[10px] font-mono text-slate-500 block">
                              Exp: {ing.expiryDate}
                            </span>
                          )}
                        </td>
                        <td className="py-2 px-2 border border-slate-300 capitalize text-slate-700">
                          {ing.category}
                        </td>
                        <td className="py-2 px-2 border border-slate-300 text-right font-mono font-bold text-slate-900 whitespace-nowrap">
                          {ing.currentStock.toLocaleString()} {ing.unit}
                          {isBelowRop && (
                            <span className="text-[9px] font-bold text-rose-600 block print:text-black">
                              *Low ROP
                            </span>
                          )}
                        </td>
                        <td className="py-2 px-2 border border-slate-300 text-right font-mono text-slate-700 whitespace-nowrap">
                          {ing.reorderPoint} / {ing.safetyStock} {ing.unit}
                        </td>
                        <td className="py-2 px-2 border border-slate-300 text-right font-mono text-slate-700 whitespace-nowrap">
                          ₱{ing.costPerUnit.toFixed(2)}
                        </td>
                        <td className="py-2 px-2 border border-slate-300 text-right font-mono font-bold text-slate-900 whitespace-nowrap">
                          ₱{itemValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </td>
                        <td className="py-2 px-2 border border-slate-300 text-slate-700 text-[10px]">
                          {ing.location}
                        </td>
                        {showAuditCheckboxes && (
                          <td className="py-2 px-2 border border-slate-300 text-center">
                            <div className="flex items-center justify-center space-x-1">
                              <span className="inline-block w-4 h-4 border border-slate-500 rounded-sm"></span>
                              <span className="text-[9px] text-slate-400 font-mono">_____</span>
                            </div>
                          </td>
                        )}
                      </tr>
                    );
                  })}
                </tbody>
                <tfoot>
                  <tr className="bg-slate-200 border-t-2 border-slate-400 font-black text-slate-900 text-xs">
                    <td colSpan={3} className="py-2.5 px-2 border border-slate-300 uppercase">
                      Total Summary ({itemsToPrint.length} items)
                    </td>
                    <td className="py-2.5 px-2 border border-slate-300 text-right font-mono">
                      {totalUnits.toLocaleString()} units
                    </td>
                    <td colSpan={2} className="py-2.5 px-2 border border-slate-300 text-right">
                      Total Inventory Value:
                    </td>
                    <td className="py-2.5 px-2 border border-slate-300 text-right font-mono">
                      ₱{totalValuation.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </td>
                    <td colSpan={showAuditCheckboxes ? 2 : 1} className="py-2.5 px-2 border border-slate-300"></td>
                  </tr>
                </tfoot>
              </table>
            )}

            {/* ======================================================== */}
            {/* 2. COLD STORAGE FINISHED GOODS PRINTABLE TABLE */}
            {/* ======================================================== */}
            {!isRaw && (
              <table className="w-full text-left border-collapse text-[11px]">
                <thead>
                  <tr className="bg-slate-100 border-y-2 border-slate-400 text-slate-800 font-black text-[10px] uppercase tracking-wider">
                    <th className="py-2.5 px-2 border border-slate-300">SKU</th>
                    <th className="py-2.5 px-2 border border-slate-300">Product Description</th>
                    <th className="py-2.5 px-2 border border-slate-300">Category</th>
                    <th className="py-2.5 px-2 border border-slate-300">Storage Vault</th>
                    <th className="py-2.5 px-2 border border-slate-300 text-right">Stock / Cap</th>
                    <th className="py-2.5 px-2 border border-slate-300 text-right">DepEd / Retail</th>
                    <th className="py-2.5 px-2 border border-slate-300 text-right">Price (₱)</th>
                    <th className="py-2.5 px-2 border border-slate-300 text-right">Total (₱)</th>
                    {showAuditCheckboxes && (
                      <th className="py-2.5 px-2 border border-slate-300 text-center w-24">Physical Audit</th>
                    )}
                  </tr>
                </thead>
                <tbody>
                  {(itemsToPrint as FinishedGood[]).map((fg, idx) => {
                    const safetyStockVal = fg.safetyStock ?? 50;
                    const isLowStock = fg.currentStock <= safetyStockVal;
                    const itemValue = fg.currentStock * fg.unitPrice;

                    return (
                      <tr 
                        key={fg.id} 
                        className={`border-b border-slate-300 ${idx % 2 === 1 ? 'bg-slate-50/70' : 'bg-white'}`}
                      >
                        <td className="py-2 px-2 border border-slate-300 font-mono font-bold text-slate-800 whitespace-nowrap">
                          {fg.sku}
                        </td>
                        <td className="py-2 px-2 border border-slate-300">
                          <div className="font-bold text-slate-900">{fg.name}</div>
                          <span className="text-[10px] text-slate-500 font-mono block">
                            {fg.shelfLifeDays} days shelf life
                          </span>
                        </td>
                        <td className="py-2 px-2 border border-slate-300 uppercase text-[10px] font-semibold text-slate-700">
                          {fg.category.replace('_', ' ')}
                        </td>
                        <td className="py-2 px-2 border border-slate-300 text-slate-700 text-[10px]">
                          {fg.location}
                        </td>
                        <td className="py-2 px-2 border border-slate-300 text-right font-mono font-bold text-slate-900 whitespace-nowrap">
                          {fg.currentStock.toLocaleString()} / {fg.coldStorageCapacity} {fg.unit}
                          {isLowStock && (
                            <span className="text-[9px] font-bold text-rose-600 block print:text-black">
                              *Below Buffer
                            </span>
                          )}
                        </td>
                        <td className="py-2 px-2 border border-slate-300 text-right font-mono text-[10px] text-slate-700 whitespace-nowrap">
                          <div>F: {fg.allocatedFeedingProgram} {fg.unit}</div>
                          <div>R: {fg.allocatedRetail} {fg.unit}</div>
                        </td>
                        <td className="py-2 px-2 border border-slate-300 text-right font-mono text-slate-700 whitespace-nowrap">
                          ₱{fg.unitPrice.toFixed(2)}
                        </td>
                        <td className="py-2 px-2 border border-slate-300 text-right font-mono font-bold text-slate-900 whitespace-nowrap">
                          ₱{itemValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </td>
                        {showAuditCheckboxes && (
                          <td className="py-2 px-2 border border-slate-300 text-center">
                            <div className="flex items-center justify-center space-x-1">
                              <span className="inline-block w-4 h-4 border border-slate-500 rounded-sm"></span>
                              <span className="text-[9px] text-slate-400 font-mono">_____</span>
                            </div>
                          </td>
                        )}
                      </tr>
                    );
                  })}
                </tbody>
                <tfoot>
                  <tr className="bg-slate-200 border-t-2 border-slate-400 font-black text-slate-900 text-xs">
                    <td colSpan={4} className="py-2.5 px-2 border border-slate-300 uppercase">
                      Total Summary ({itemsToPrint.length} goods)
                    </td>
                    <td className="py-2.5 px-2 border border-slate-300 text-right font-mono">
                      {totalUnits.toLocaleString()} units
                    </td>
                    <td colSpan={2} className="py-2.5 px-2 border border-slate-300 text-right">
                      Total Stock Asset:
                    </td>
                    <td className="py-2.5 px-2 border border-slate-300 text-right font-mono">
                      ₱{totalValuation.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </td>
                    {showAuditCheckboxes && (
                      <td className="py-2.5 px-2 border border-slate-300"></td>
                    )}
                  </tr>
                </tfoot>
              </table>
            )}

            {/* Physical Inventory Discrepancy Remarks Box */}
            {showAuditCheckboxes && (
              <div className="mt-5 border border-slate-300 rounded-xl p-3 bg-slate-50 text-xs">
                <span className="text-[10px] font-bold uppercase text-slate-500 block mb-1">
                  Physical Count Audit Notes / Discrepancy Observations:
                </span>
                <div className="h-10 border-b border-dashed border-slate-400"></div>
              </div>
            )}

            {/* Official Institutional Verification & Sign-off Block */}
            {showSignatures && (
              <div className="mt-8 pt-6 border-t-2 border-slate-400 grid grid-cols-3 gap-6 text-xs">
                <div>
                  <p className="text-[10px] font-bold uppercase text-slate-500 mb-8">1. Physical Count Performed By:</p>
                  <div className="border-b border-slate-800 mb-1"></div>
                  <p className="font-bold text-slate-900 text-center text-[11px]">Inventory Custodian / Warehouseman</p>
                  <p className="text-[10px] text-slate-500 text-center">Date: ________________________</p>
                </div>

                <div>
                  <p className="text-[10px] font-bold uppercase text-slate-500 mb-8">2. Quality &amp; Cold Chain Verified By:</p>
                  <div className="border-b border-slate-800 mb-1"></div>
                  <p className="font-bold text-slate-900 text-center text-[11px]">QA / Food Safety Inspector</p>
                  <p className="text-[10px] text-slate-500 text-center">Date: ________________________</p>
                </div>

                <div>
                  <p className="text-[10px] font-bold uppercase text-slate-500 mb-8">3. Noted &amp; Approved By:</p>
                  <div className="border-b border-slate-800 mb-1"></div>
                  <p className="font-bold text-slate-900 text-center text-[11px]">Center Director / Plant Manager</p>
                  <p className="text-[10px] text-slate-500 text-center">Date: ________________________</p>
                </div>
              </div>
            )}

            {/* Footer Compliance Notice */}
            <div className="mt-6 pt-3 border-t border-slate-300 flex items-center justify-between text-[9px] text-slate-500">
              <span>DairySync &bull; Philippine Carabao Center @ Mariano Marcos State University</span>
              <span>ISO 25010 Evaluated &bull; System Generated Internal Audit Copy</span>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
};
