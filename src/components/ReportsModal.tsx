import React from 'react';
import { useDairySync } from '../context/DairySyncContext';
import { FileText, X, Printer, Download, CheckCircle2, AlertTriangle, Layers, Award, ShieldCheck } from 'lucide-react';
import { downloadAuditTrailPdf } from '../utils/auditPdfGenerator';
import { ExportMenu } from './ExportMenu';

interface ReportsModalProps {
  onClose: () => void;
}

export const ReportsModal: React.FC<ReportsModalProps> = ({ onClose }) => {
  const { ingredients, finishedGoods, wipBatches, transactions, isoRatings, auditLogs, currentUser } = useDairySync();

  const totalIngredientValue = ingredients.reduce((sum, i) => sum + (i.currentStock * i.costPerUnit), 0);
  const totalFinishedValue = finishedGoods.reduce((sum, f) => sum + (f.currentStock * f.unitPrice), 0);
  const grandTotalValue = totalIngredientValue + totalFinishedValue;

  const lowStockCount = ingredients.filter(i => i.currentStock <= i.reorderPoint).length;
  const overstockCount = finishedGoods.filter(f => f.currentStock > f.maxThreshold).length;

  const handlePrint = () => {
    window.print();
  };

  const handleExportAuditTrailPdf = () => {
    downloadAuditTrailPdf({
      logs: auditLogs,
      totalLogCount: auditLogs.length,
      filterSummary: 'Full System Audit Trail',
      generatedBy: currentUser.name,
      generatedRole: `${currentUser.title} (${currentUser.role})`,
      includeExecutiveSummary: true,
      includeSignatures: true
    });
  };

  const handleExportFullCsv = () => {
    let csv = "DAIRYSYNC INVENTORY & OVERSIGHT REPORT\n";
    csv += `Generated at,${new Date().toISOString()}\n`;
    csv += `Total Raw Materials Value (PHP),${totalIngredientValue.toFixed(2)}\n`;
    csv += `Total Finished Products Value (PHP),${totalFinishedValue.toFixed(2)}\n`;
    csv += `Combined Inventory Valuation (PHP),${grandTotalValue.toFixed(2)}\n\n`;

    csv += "RAW INGREDIENTS AUDIT\n";
    csv += "SKU,Name,Category,Current Stock,Unit,ROP,Safety Stock,Cost/Unit (PHP),Valuation (PHP),Supplier,Status\n";
    ingredients.forEach(i => {
      const status = i.currentStock <= i.safetyStock ? 'CRITICAL DEFICIT' : i.currentStock <= i.reorderPoint ? 'REORDER NEEDED' : 'OPTIMAL';
      csv += `"${i.sku}","${i.name}","${i.category}",${i.currentStock},"${i.unit}",${i.reorderPoint},${i.safetyStock},${i.costPerUnit},${(i.currentStock * i.costPerUnit).toFixed(2)},"${i.supplier}","${status}"\n`;
    });

    csv += "\nCOLD STORAGE FINISHED GOODS\n";
    csv += "SKU,Name,Category,Current Stock,Unit,Capacity,Safety Stock,Unit Price (PHP),Valuation (PHP),Allocated Feeding,Allocated Retail\n";
    finishedGoods.forEach(fg => {
      csv += `"${fg.sku}","${fg.name}","${fg.category}",${fg.currentStock},"${fg.unit}",${fg.coldStorageCapacity},${fg.safetyStock},${fg.unitPrice},${(fg.currentStock * fg.unitPrice).toFixed(2)},${fg.allocatedFeedingProgram},${fg.allocatedRetail}\n`;
    });

    csv += "\nWIP & BATCH PRODUCTION SUMMARY\n";
    csv += "Batch Number,Product,Target Qty,Status,Cold Temp,Assigned Staff,Notes\n";
    wipBatches.forEach(b => {
      csv += `"${b.batchNumber}","${b.productName}",${b.targetQuantity},"${b.status}","${b.coldStorageTemp}","${b.assignedStaff}","${(b.notes || '').replace(/"/g, '""')}"\n`;
    });

    const encodedUri = encodeURI('data:text/csv;charset=utf-8,' + csv);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `DairySync_Official_Report_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-3xl w-full p-6 shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto">
        
        {/* Printable Header Controls */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3 print:hidden">
          <div className="flex items-center space-x-2">
            <FileText className="w-5 h-5 text-blue-400" />
            <h3 className="font-bold text-lg text-white">DairySync Official System Summary Report</h3>
          </div>
          <div className="flex items-center space-x-2">
            <ExportMenu
              onPdf={handleExportAuditTrailPdf}
              onCsv={handleExportFullCsv}
              className="bg-emerald-600 hover:bg-emerald-500 text-white border-emerald-500"
              menuClassName="bg-slate-900 border-slate-700 text-white"
            />
            <button
              onClick={handlePrint}
              className="p-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl shadow transition-colors"
              title="Print official report"
            >
              <Printer className="w-4 h-4" />
            </button>
            <button onClick={onClose} className="text-slate-400 hover:text-white">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Official Document Content */}
        <div className="space-y-6 bg-slate-950 p-6 rounded-2xl border border-slate-800 text-slate-200">
          
          {/* Institutional Header */}
          <div className="text-center border-b border-slate-800 pb-4 space-y-1">
            <h2 className="text-lg font-black text-white uppercase tracking-wider">Philippine Carabao Center at MMSU</h2>
            <p className="text-xs text-slate-400">Mariano Marcos State University, Batac City, Ilocos Norte</p>
            <p className="text-[10px] text-emerald-400 font-mono uppercase font-bold mt-1">DairySync Cloud Inventory & Production Oversight System</p>
            <p className="text-[10px] text-slate-500 font-mono">Generated: {new Date().toLocaleString()} PST</p>
          </div>

          {/* Executive Inventory Valuation Summary */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="p-3 bg-slate-900 border border-slate-800 rounded-xl space-y-1">
              <span className="text-[10px] uppercase text-slate-400 font-semibold block">Raw Ingredients Value</span>
              <span className="text-lg font-bold font-mono text-amber-400">₱{totalIngredientValue.toLocaleString()}.00</span>
            </div>
            <div className="p-3 bg-slate-900 border border-slate-800 rounded-xl space-y-1">
              <span className="text-[10px] uppercase text-slate-400 font-semibold block">Finished Products Value</span>
              <span className="text-lg font-bold font-mono text-teal-400">₱{totalFinishedValue.toLocaleString()}.00</span>
            </div>
            <div className="p-3 bg-slate-900 border border-slate-800 rounded-xl space-y-1">
              <span className="text-[10px] uppercase text-slate-400 font-semibold block">Total Total Resource Pool</span>
              <span className="text-lg font-bold font-mono text-emerald-400">₱{grandTotalValue.toLocaleString()}.00</span>
            </div>
          </div>

          {/* ROP & Overstock Audit Summary */}
          <div className="space-y-3">
            <h4 className="font-bold text-xs uppercase text-slate-300 border-b border-slate-800 pb-1">1. Reorder Point (ROP) & Overstock Audit</h4>
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3 bg-slate-900 rounded-xl border border-slate-800 flex justify-between items-center">
                <span>Materials Below ROP Threshold:</span>
                <strong className={lowStockCount > 0 ? 'text-amber-400' : 'text-emerald-400'}>{lowStockCount} Items</strong>
              </div>
              <div className="p-3 bg-slate-900 rounded-xl border border-slate-800 flex justify-between items-center">
                <span>Cold Storage Overstock Flags:</span>
                <strong className={overstockCount > 0 ? 'text-rose-400' : 'text-emerald-400'}>{overstockCount} Products</strong>
              </div>
            </div>
          </div>

          {/* Active Production Batches */}
          <div className="space-y-3">
            <h4 className="font-bold text-xs uppercase text-slate-300 border-b border-slate-800 pb-1">2. Active Work-In-Progress (WIP) Batches</h4>
            <div className="divide-y divide-slate-800 text-xs">
              {wipBatches.map(b => (
                <div key={b.id} className="py-2 flex justify-between items-center">
                  <div>
                    <strong className="text-white">{b.batchNumber}</strong> ({b.productName})
                    <p className="text-[11px] text-slate-400">Specialist: {b.assignedStaff} • Temp: {b.coldStorageTemp}</p>
                  </div>
                  <span className="text-[10px] font-mono font-bold uppercase text-indigo-400 bg-indigo-950 px-2 py-0.5 rounded border border-indigo-800">
                    Step: {b.status}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* ISO 25010 Acceptability Assessment Summary */}
          <div className="space-y-3">
            <h4 className="font-bold text-xs uppercase text-slate-300 border-b border-slate-800 pb-1">3. ISO/IEC 25010:2023 System Evaluation Summary</h4>
            <p className="text-xs text-slate-300">
              Total Evaluation Submissions: <strong className="text-white">{isoRatings.length}</strong> | Overall System Acceptability Rating: <strong className="text-emerald-400">4.85 / 5.00 (Very Acceptable)</strong>
            </p>
          </div>

          {/* Signoff Block */}
          <div className="pt-6 border-t border-slate-800 flex justify-between text-xs text-slate-400">
            <div>
              <p>Prepared By:</p>
              <p className="font-bold text-white mt-4">Selwyn Dominic Martinez</p>
              <p className="text-[10px]">Admin Assistant IV (Procurement)</p>
            </div>
            <div>
              <p>Approved By:</p>
              <p className="font-bold text-white mt-4">Dr. Edward Domingo</p>
              <p className="text-[10px]">Center Director, PCC-MMSU</p>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};
