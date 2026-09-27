import React from 'react';
import { BookOpen, Download } from 'lucide-react';
import systemGuide from '../../docs/DairySync-System-Guide.md?raw';
import { useDairySync } from '../context/DairySyncContext';
import { AccessRestricted } from './AccessRestricted';

export const SystemDocumentation: React.FC = () => {
  const { currentRole } = useDairySync();

  if (currentRole !== 'developer') {
    return <AccessRestricted requiredTab="documentation" onNavigateHome={() => window.location.reload()} />;
  }

  const downloadGuide = () => {
    const fileUrl = URL.createObjectURL(new Blob([systemGuide], { type: 'text/markdown;charset=utf-8' }));
    const link = document.createElement('a');
    link.href = fileUrl;
    link.download = 'DairySync-System-Guide.md';
    link.click();
    URL.revokeObjectURL(fileUrl);
  };

  return (
    <main className="space-y-4 text-slate-900">
      <header className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <BookOpen className="h-6 w-6 text-indigo-600" />
          <div>
            <h1 className="text-xl font-bold">System Manual &amp; Documentation</h1>
            <p className="mt-1 text-sm text-slate-500">DairySync operating guide and subsystem reference</p>
          </div>
        </div>
        <button
          type="button"
          onClick={downloadGuide}
          className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
        >
          <Download className="h-4 w-4" />
          Download guide
        </button>
      </header>
      <article className="max-h-[70vh] overflow-auto rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-8">
        <pre className="whitespace-pre-wrap break-words font-sans text-sm leading-6 text-slate-700">{systemGuide}</pre>
      </article>
    </main>
  );
};