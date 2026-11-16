import React from 'react';
import { BookOpen, Download } from 'lucide-react';
import userManual from '../../docs/DairySync-User-Manual.html?raw';
import { useDairySync } from '../context/DairySyncContext';
import { AccessRestricted } from './AccessRestricted';

export const SystemDocumentation: React.FC = () => {
  const { currentRole } = useDairySync();

  if (currentRole !== 'developer' && currentRole !== 'system_admin') {
    return <AccessRestricted requiredTab="documentation" onNavigateHome={() => window.location.reload()} />;
  }

  const manualHtml = userManual.replace(
    /\.\.\/public\/dairysync-app-icon\.png/g,
    `${window.location.origin}/dairysync-app-icon.png`
  );

  const downloadManual = () => {
    const fileUrl = URL.createObjectURL(new Blob([manualHtml], { type: 'text/html;charset=utf-8' }));
    const link = document.createElement('a');
    link.href = fileUrl;
    link.download = 'DairySync-User-Manual.html';
    link.click();
    window.setTimeout(() => URL.revokeObjectURL(fileUrl), 1000);
  };

  return (
    <main className="space-y-4 text-slate-900">
      <header className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <BookOpen className="h-6 w-6 text-indigo-600" />
          <div>
            <h1 className="text-xl font-bold">DairySync User Manual</h1>
            <p className="mt-1 text-sm text-slate-500">Visual operating guide for Developers and System Administrators</p>
          </div>
        </div>
        <button
          type="button"
          onClick={downloadManual}
          className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
        >
          <Download className="h-4 w-4" />
          Download user manual
        </button>
      </header>
      <iframe
        title="DairySync user manual"
        srcDoc={manualHtml}
        sandbox="allow-scripts"
        className="h-[78vh] min-h-[640px] w-full rounded-2xl border border-slate-200 bg-white shadow-sm"
      />
    </main>
  );
};