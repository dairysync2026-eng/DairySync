import React, { useState } from 'react';
import { AuditLogEntry } from '../types';
import { useDairySync } from '../context/DairySyncContext';
import { 
  Download, 
  Printer, 
  X, 
  FileText, 
  ShieldCheck, 
  CheckCircle2, 
  AlertTriangle, 
  AlertCircle, 
  Info,
  Calendar,
  Layers,
  Filter,
  CheckSquare
} from 'lucide-react';
import { downloadAuditTrailPdf } from '../utils/auditPdfGenerator';

interface AuditPdfReportModalProps {
  logs: AuditLogEntry[];
  allLogs: AuditLogEntry[];
  filterSummary?: string;
  onClose: () => void;
}

export const AuditPdfReportModal: React.FC<AuditPdfReportModalProps> = ({
  logs,
  allLogs,
  filterSummary,
  onClose
}) => {
  const { currentUser, currentRole } = useDairySync();

  const [printScope, setPrintScope] = useState<'filtered' | 'all'>(
    logs.length !== allLogs.length ? 'filtered' : 'all'
  );
  const [includeExecutiveSummary, setIncludeExecutiveSummary] = useState(true);
  const [includeSignatures, setIncludeSignatures] = useState(true);
  const [auditorNotes, setAuditorNotes] = useState('');
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState(false);

  const selectedLogs = printScope === 'filtered' ? logs : allLogs;

  // Timestamps and Control Numbers
  const now = new Date();
  const dateFormatted = now.toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric'
  });
  const timeFormatted = now.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: true
  });
  const documentCode = `PCC-MMSU-AUD-${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}-${String(Math.floor(1000 + Math.random() * 9000))}`;

  // Statistics
  const invCount = selectedLogs.filter(l => l.category === 'inventory' || l.category === 'cold_storage').length;
  const prodCount = selectedLogs.filter(l => l.category === 'production').length;
  const warningCount = selectedLogs.filter(l => l.severity === 'warning' || l.severity === 'critical').length;
  const infoCount = selectedLogs.filter(l => l.severity === 'info' || l.severity === 'success').length;

  const handleDownloadPdfFile = () => {
    try {
      setIsDownloading(true);
      const filename = `PCC-MMSU_Audit_Trail_Report_${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}.pdf`;
      
      downloadAuditTrailPdf(
        {
          logs: selectedLogs,
          totalLogCount: allLogs.length,
          filterSummary: printScope === 'filtered' && filterSummary ? filterSummary : 'Full System Provenance',
          generatedBy: currentUser.name,
          generatedRole: `${currentUser.title} (${currentUser.role})`,
          includeExecutiveSummary,
          includeSignatures,
          notes: auditorNotes
        },
        filename
      );

      setDownloadSuccess(true);
      setTimeout(() => setDownloadSuccess(false), 3500);
    } catch (err) {
      console.error('Failed to generate audit PDF:', err);
    } finally {
      setIsDownloading(false);
    }
  };

  const handleTriggerPrint = () => {
    window.print();
  };

  const getSeverityBadge = (severity: string) => {
    switch (severity) {
      case 'critical':
        return <span className="text-[10px] font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded border border-rose-200">CRITICAL</span>;
      case 'warning':
        return <span className="text-[10px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">WARNING</span>;
      case 'success':
        return <span className="text-[10px] font-bold text-teal-700 bg-teal-50 px-2 py-0.5 rounded border border-teal-200">SUCCESS</span>;
      default:
        return <span className="text-[10px] font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">INFO</span>;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-900/75 backdrop-blur-sm overflow-y-auto">
      {/* Modal Card */}
      <div className="bg-white rounded-3xl shadow-2xl border-2 border-slate-200 max-w-5xl w-full my-6 flex flex-col max-h-[94vh] overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        
        {/* ======================================================== */}
        {/* NON-PRINTABLE MODAL HEADER & CONTROLS TOOLBAR */}
        {/* ======================================================== */}
        <div className="p-4 sm:p-5 bg-slate-900 text-white flex flex-col md:flex-row md:items-center justify-between gap-4 shrink-0 print:hidden">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-500/20 border border-indigo-400/40 flex items-center justify-center text-indigo-400 shrink-0">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white flex items-center space-x-2">
                <span>Compliance Audit Trail PDF Export</span>
                <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded-full bg-indigo-500/30 text-indigo-200 border border-indigo-400/30">
                  ISO 25010
                </span>
              </h2>
              <p className="text-xs text-slate-300">
                Official operational provenance report formatted for regulatory compliance, archive & hard copies
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Print Scope selection if list is filtered */}
            {logs.length !== allLogs.length && (
              <div className="flex items-center bg-slate-800 p-1 rounded-xl border border-slate-700 text-xs mr-1">
                <button
                  type="button"
                  onClick={() => setPrintScope('filtered')}
                  className={`px-2.5 py-1 rounded-lg font-semibold transition-all ${
                    printScope === 'filtered'
                      ? 'bg-indigo-600 text-white'
                      : 'text-slate-300 hover:text-white'
                  }`}
                >
                  Filtered ({logs.length})
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
                  All ({allLogs.length})
                </button>
              </div>
            )}

            {/* Checkbox toggles for hard copy printout options */}
            <label className="flex items-center space-x-1.5 text-xs text-slate-300 cursor-pointer bg-slate-800 px-2.5 py-1.5 rounded-xl border border-slate-700 select-none">
              <input 
                type="checkbox" 
                checked={includeExecutiveSummary}
                onChange={e => setIncludeExecutiveSummary(e.target.checked)}
                className="rounded text-indigo-600 focus:ring-0"
              />
              <span className="text-[11px] font-medium">Summary Cards</span>
            </label>

            <label className="flex items-center space-x-1.5 text-xs text-slate-300 cursor-pointer bg-slate-800 px-2.5 py-1.5 rounded-xl border border-slate-700 select-none">
              <input 
                type="checkbox" 
                checked={includeSignatures}
                onChange={e => setIncludeSignatures(e.target.checked)}
                className="rounded text-indigo-600 focus:ring-0"
              />
              <span className="text-[11px] font-medium">Sign-off Block</span>
            </label>

            {/* Direct PDF Download Button */}
            <button
              id="btn-download-audit-pdf-file"
              type="button"
              onClick={handleDownloadPdfFile}
              disabled={isDownloading}
              className={`flex items-center space-x-1.5 text-xs font-bold px-3.5 py-2 rounded-xl shadow-md transition-all cursor-pointer ${
                downloadSuccess 
                  ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-900/40' 
                  : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-indigo-900/50'
              }`}
              title="Download compiled .pdf file to disk"
            >
              {downloadSuccess ? (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>PDF Downloaded!</span>
                </>
              ) : (
                <>
                  <Download className="w-4 h-4" />
                  <span>{isDownloading ? 'Generating...' : 'Download PDF'}</span>
                </>
              )}
            </button>

            {/* Print / Save as PDF Button */}
            <button
              id="btn-trigger-print-audit-pdf"
              type="button"
              onClick={handleTriggerPrint}
              className="flex items-center space-x-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-xs font-bold px-3 py-2 rounded-xl transition-all cursor-pointer"
              title="Open browser print dialog for hard copy or save as PDF"
            >
              <Printer className="w-4 h-4" />
            </button>

            {/* Close Button */}
            <button
              id="btn-close-audit-pdf-modal"
              type="button"
              onClick={onClose}
              className="text-slate-400 hover:text-white p-2 rounded-xl hover:bg-slate-800 transition-colors"
              title="Close Preview"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Optional Notes Input in Preview Controls */}
        <div className="p-3 bg-slate-50 border-b border-slate-200 print:hidden text-xs flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4 px-6">
          <span className="font-bold text-slate-700 whitespace-nowrap flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-indigo-600" />
            Auditor Notes / Compliance Remarks:
          </span>
          <input
            type="text"
            value={auditorNotes}
            onChange={e => setAuditorNotes(e.target.value)}
            placeholder="Optional audit observation notes to append onto the official PDF..."
            className="flex-1 w-full bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-indigo-500"
          />
        </div>

        {/* ======================================================== */}
        {/* PRINTABLE HARD COPY & PDF PREVIEW DOCUMENT */}
        {/* ======================================================== */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-8 bg-slate-100 text-slate-900">
          <div className="printable-report max-w-4xl mx-auto bg-white p-6 sm:p-10 border-2 border-slate-300 shadow-md rounded-2xl print:border-none print:shadow-none print:p-0 print:m-0">
            
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
                    Operational Audit Trail &amp; Provenance Compliance Report
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
                  <span className="text-[10px] font-bold uppercase text-slate-500 block">Generated (PST)</span>
                  <span className="font-mono font-bold text-slate-800 text-[11px]">{dateFormatted}, {timeFormatted}</span>
                </div>
                <div>
                  <span className="text-[10px] font-bold uppercase text-slate-500 block">Extracted By</span>
                  <span className="font-bold text-slate-800 text-[11px]">{currentUser.name}</span>
                  <span className="text-[10px] text-slate-500 block">({currentUser.title})</span>
                </div>
                <div>
                  <span className="text-[10px] font-bold uppercase text-slate-500 block">Scope / Status</span>
                  <span className="font-semibold text-slate-800 text-[11px]">
                    {printScope === 'filtered' && filterSummary ? filterSummary : `All Logs (${selectedLogs.length})`}
                  </span>
                </div>
              </div>
            </div>

            {/* Key Summary Metrics Ribbon */}
            {includeExecutiveSummary && (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5 p-3 rounded-xl bg-slate-50 border border-slate-300 text-xs">
                <div className="text-center">
                  <span className="text-[10px] font-bold uppercase text-slate-500 block">Total Audit Entries</span>
                  <span className="text-base font-black text-slate-900 font-mono">{selectedLogs.length} Events</span>
                </div>
                <div className="text-center sm:border-l border-slate-300">
                  <span className="text-[10px] font-bold uppercase text-slate-500 block">Inventory / Storage</span>
                  <span className="text-base font-black text-amber-700 font-mono">{invCount}</span>
                </div>
                <div className="text-center sm:border-l border-slate-300">
                  <span className="text-[10px] font-bold uppercase text-slate-500 block">WIP Batches</span>
                  <span className="text-base font-black text-indigo-700 font-mono">{prodCount}</span>
                </div>
                <div className="text-center sm:border-l border-slate-300">
                  <span className="text-[10px] font-bold uppercase text-slate-500 block">Warnings / Critical</span>
                  <span className="text-base font-black text-rose-700 font-mono">{warningCount}</span>
                </div>
              </div>
            )}

            {/* Audit Log Entries Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-[11px]">
                <thead>
                  <tr className="bg-slate-100 border-y-2 border-slate-400 text-slate-800 font-black text-[10px] uppercase tracking-wider">
                    <th className="py-2.5 px-2 border border-slate-300 w-8 text-center">#</th>
                    <th className="py-2.5 px-2 border border-slate-300 whitespace-nowrap">Timestamp</th>
                    <th className="py-2.5 px-2 border border-slate-300">Subsystem / Action</th>
                    <th className="py-2.5 px-2 border border-slate-300">Event Description &amp; Traceability</th>
                    <th className="py-2.5 px-2 border border-slate-300">Operator / Station</th>
                    <th className="py-2.5 px-2 border border-slate-300 text-center">Severity</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedLogs.map((log, idx) => {
                    const hasDetails = log.details && Object.keys(log.details).length > 0;

                    return (
                      <tr 
                        key={log.id} 
                        className={`border-b border-slate-300 ${idx % 2 === 1 ? 'bg-slate-50/70' : 'bg-white'}`}
                      >
                        <td className="py-2 px-2 border border-slate-300 text-center font-mono text-slate-500 text-[10px]">
                          {idx + 1}
                        </td>
                        <td className="py-2 px-2 border border-slate-300 font-mono text-slate-800 whitespace-nowrap text-[10px]">
                          <div className="font-bold">{log.timestamp.replace(' PST', '')}</div>
                          <span className="text-[9px] text-slate-400 font-mono">{log.id}</span>
                        </td>
                        <td className="py-2 px-2 border border-slate-300 whitespace-nowrap">
                          <div className="font-bold text-slate-900 uppercase text-[10px]">{log.subsystem}</div>
                          <span className="font-mono text-[9px] text-indigo-700 bg-indigo-50 px-1.5 py-0.5 rounded border border-indigo-200">
                            {log.action}
                          </span>
                        </td>
                        <td className="py-2 px-2 border border-slate-300">
                          <div className="font-medium text-slate-900 leading-snug">{log.description}</div>
                          {hasDetails && (
                            <div className="flex flex-wrap gap-x-2 gap-y-0.5 mt-1 text-[9px] font-mono text-slate-600 bg-slate-100/80 p-1 rounded">
                              {log.details?.itemOrBatch && <span>Ref: <strong>{String(log.details.itemOrBatch)}</strong></span>}
                              {log.details?.quantity !== undefined && <span>Qty: <strong>{log.details.quantity} {log.details.unit || ''}</strong></span>}
                              {log.details?.previousValue !== undefined && log.details?.newValue !== undefined && (
                                <span>Change: [{log.details.previousValue} &rarr; {log.details.newValue}]</span>
                              )}
                              {log.details?.reason && <span>Reason: {log.details.reason}</span>}
                              {log.details?.referenceId && <span>DocRef: {log.details.referenceId}</span>}
                            </div>
                          )}
                        </td>
                        <td className="py-2 px-2 border border-slate-300 whitespace-nowrap">
                          <div className="font-bold text-slate-900 text-[11px]">{log.userName}</div>
                          <div className="text-[10px] text-slate-500 font-mono">
                            {log.terminalOrStation || log.userRole}
                          </div>
                        </td>
                        <td className="py-2 px-2 border border-slate-300 text-center whitespace-nowrap">
                          {getSeverityBadge(log.severity)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Custom Notes Section */}
            {auditorNotes.trim() && (
              <div className="mt-5 border border-slate-300 rounded-xl p-3 bg-slate-50 text-xs">
                <span className="text-[10px] font-bold uppercase text-slate-500 block mb-1">
                  Auditor Compliance &amp; Record-Keeping Remarks:
                </span>
                <p className="text-slate-800 italic leading-relaxed">{auditorNotes}</p>
              </div>
            )}

            {/* Official Institutional Verification & Sign-off Block */}
            {includeSignatures && (
              <div className="mt-8 pt-6 border-t-2 border-slate-400 grid grid-cols-3 gap-6 text-xs">
                <div>
                  <p className="text-[10px] font-bold uppercase text-slate-500 mb-8">1. Audit Trail Extracted By:</p>
                  <div className="border-b border-slate-800 mb-1"></div>
                  <p className="font-bold text-slate-900 text-center text-[11px]">{currentUser.name}</p>
                  <p className="text-[10px] text-slate-500 text-center">System Custodian / Records Officer</p>
                  <p className="text-[9px] text-slate-400 text-center">Date: ________________________</p>
                </div>

                <div>
                  <p className="text-[10px] font-bold uppercase text-slate-500 mb-8">2. Quality &amp; Traceability Verified By:</p>
                  <div className="border-b border-slate-800 mb-1"></div>
                  <p className="font-bold text-slate-900 text-center text-[11px]">QA &amp; Food Safety Inspector</p>
                  <p className="text-[10px] text-slate-500 text-center">PCC-MMSU Laboratory Section</p>
                  <p className="text-[9px] text-slate-400 text-center">Date: ________________________</p>
                </div>

                <div>
                  <p className="text-[10px] font-bold uppercase text-slate-500 mb-8">3. Noted &amp; Officially Endorsed By:</p>
                  <div className="border-b border-slate-800 mb-1"></div>
                  <p className="font-bold text-slate-900 text-center text-[11px]">Center Director / Plant Manager</p>
                  <p className="text-[10px] text-slate-500 text-center">Mariano Marcos State University</p>
                  <p className="text-[9px] text-slate-400 text-center">Date: ________________________</p>
                </div>
              </div>
            )}

            {/* Footer Compliance Notice */}
            <div className="mt-6 pt-3 border-t border-slate-300 flex items-center justify-between text-[9px] text-slate-500">
              <span>DairySync &bull; Philippine Carabao Center @ Mariano Marcos State University</span>
              <span>ISO 25010 Evaluated &bull; System Generated Regulatory Audit Record</span>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
};
