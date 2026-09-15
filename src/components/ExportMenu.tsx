import React, { useState } from 'react';
import { ChevronDown, Download, FileSpreadsheet, FileText } from 'lucide-react';

interface ExportMenuProps {
  onPdf: () => void;
  onCsv: () => void;
  className?: string;
  menuClassName?: string;
}

export const ExportMenu: React.FC<ExportMenuProps> = ({
  onPdf,
  onCsv,
  className = 'bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200',
  menuClassName = 'bg-white border-slate-200 text-slate-700'
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const selectFormat = (handler: () => void) => {
    setIsOpen(false);
    handler();
  };

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setIsOpen(open => !open)}
        className={`flex items-center space-x-1.5 text-xs font-bold px-3.5 py-2.5 rounded-2xl transition-all ${className}`}
        aria-haspopup="menu"
        aria-expanded={isOpen}
        title="Export data as PDF or Excel/CSV"
      >
        <Download className="w-4 h-4" />
        <span>Export</span>
        <ChevronDown className={`w-3.5 h-3.5 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className={`absolute right-0 top-full z-30 mt-2 min-w-40 overflow-hidden rounded-xl border shadow-lg ${menuClassName}`} role="menu">
          <button
            type="button"
            onClick={() => selectFormat(onPdf)}
            className="flex w-full items-center gap-2 px-3 py-2.5 text-left text-xs font-semibold hover:bg-slate-100"
            role="menuitem"
          >
            <FileText className="h-4 w-4 text-indigo-600" />
            <span>PDF</span>
          </button>
          <button
            type="button"
            onClick={() => selectFormat(onCsv)}
            className="flex w-full items-center gap-2 px-3 py-2.5 text-left text-xs font-semibold hover:bg-slate-100"
            role="menuitem"
          >
            <FileSpreadsheet className="h-4 w-4 text-emerald-600" />
            <span>Excel/CSV</span>
          </button>
        </div>
      )}
    </div>
  );
};
