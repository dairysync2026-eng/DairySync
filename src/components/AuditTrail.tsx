import React, { useState, useMemo } from 'react';
import { useDairySync } from '../context/DairySyncContext';
import { AuditCategory, AuditSeverity, AuditLogEntry } from '../types';
import { 
  ShieldCheck, 
  Search, 
  Filter, 
  Download, 
  Calendar, 
  User, 
  Layers, 
  AlertTriangle, 
  AlertCircle, 
  CheckCircle2, 
  Info, 
  Trash2, 
  PlusCircle, 
  RefreshCw, 
  Clock, 
  Laptop, 
  FileText,
  X,
  Eye,
  ChevronDown,
  ChevronUp,
  SlidersHorizontal,
  FileSpreadsheet
} from 'lucide-react';
import { AuditPdfReportModal } from './AuditPdfReportModal';
import { AccessRestricted } from './AccessRestricted';

export const AuditTrail: React.FC = () => {
  const { 
    auditLogs, 
    currentUser, 
    currentRole,
    isDeveloperActive,
    users, 
    logAuditAction, 
    clearAuditLogs, 
    exportAuditLogsCsv 
  } = useDairySync();

  // Enforce access control: only Lead Developer and Director can access Audit Trail
  const isAuthorized = currentRole === 'developer' || currentRole === 'director' || isDeveloperActive;

  // Filter and search states
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedUser, setSelectedUser] = useState<string>('all');
  const [selectedSeverity, setSelectedSeverity] = useState<string>('all');
  const [selectedActionType, setSelectedActionType] = useState<string>('all');
  const [dateFilter, setDateFilter] = useState<'all' | 'today' | '7days' | '30days'>('all');
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);
  
  // Modal states
  const [activeDetailLog, setActiveDetailLog] = useState<AuditLogEntry | null>(null);
  const [showManualAuditModal, setShowManualAuditModal] = useState(false);
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [showPdfModal, setShowPdfModal] = useState(false);

  // Manual Audit Form state
  const [manualSubsystem, setManualSubsystem] = useState<AuditCategory>('inventory');
  const [manualAction, setManualAction] = useState('PHYSICAL_AUDIT_VERIFIED');
  const [manualDescription, setManualDescription] = useState('');
  const [manualItemOrBatch, setManualItemOrBatch] = useState('');
  const [manualPreviousValue, setManualPreviousValue] = useState('');
  const [manualNewValue, setManualNewValue] = useState('');
  const [manualNotes, setManualNotes] = useState('');
  const [manualSeverity, setManualSeverity] = useState<AuditSeverity>('info');

  // Distinct Action Types for filter dropdown
  const uniqueActionTypes = useMemo(() => {
    const set = new Set<string>();
    auditLogs.forEach(l => {
      if (l.action) set.add(l.action);
    });
    return Array.from(set).sort();
  }, [auditLogs]);

  // Filtered Logs Calculation
  const filteredLogs = useMemo(() => {
    return auditLogs.filter(log => {
      // 1. Full text search
      if (searchTerm.trim()) {
        const query = searchTerm.toLowerCase();
        const matchesSearch = 
          log.description.toLowerCase().includes(query) ||
          log.action.toLowerCase().includes(query) ||
          log.userName.toLowerCase().includes(query) ||
          log.subsystem.toLowerCase().includes(query) ||
          (log.details?.itemOrBatch && String(log.details.itemOrBatch).toLowerCase().includes(query)) ||
          (log.details?.referenceId && String(log.details.referenceId).toLowerCase().includes(query)) ||
          (log.details?.reason && String(log.details.reason).toLowerCase().includes(query)) ||
          (log.terminalOrStation && log.terminalOrStation.toLowerCase().includes(query));
        
        if (!matchesSearch) return false;
      }

      // 2. Category filter
      if (selectedCategory !== 'all' && log.category !== selectedCategory) {
        return false;
      }

      // 3. User filter
      if (selectedUser !== 'all') {
        if (log.userId !== selectedUser && log.userName !== selectedUser) {
          return false;
        }
      }

      // 4. Severity filter
      if (selectedSeverity !== 'all' && log.severity !== selectedSeverity) {
        return false;
      }

      // 5. Action type filter
      if (selectedActionType !== 'all' && log.action !== selectedActionType) {
        return false;
      }

      // 6. Date filter
      if (dateFilter !== 'all') {
        const logDate = new Date(log.timestamp.replace(' PST', ''));
        const now = new Date();
        if (!isNaN(logDate.getTime())) {
          const diffHours = (now.getTime() - logDate.getTime()) / (1000 * 3600);
          if (dateFilter === 'today' && diffHours > 24) return false;
          if (dateFilter === '7days' && diffHours > 24 * 7) return false;
          if (dateFilter === '30days' && diffHours > 24 * 30) return false;
        }
      }

      return true;
    });
  }, [auditLogs, searchTerm, selectedCategory, selectedUser, selectedSeverity, selectedActionType, dateFilter]);

  // Statistics
  const stats = useMemo(() => {
    const total = auditLogs.length;
    const inventoryCount = auditLogs.filter(l => l.category === 'inventory' || l.category === 'cold_storage').length;
    const productionCount = auditLogs.filter(l => l.category === 'production').length;
    const highSeverityCount = auditLogs.filter(l => l.severity === 'warning' || l.severity === 'critical').length;
    return { total, inventoryCount, productionCount, highSeverityCount };
  }, [auditLogs]);

  // Filter summary string for PDF / Print reports
  const filterSummaryText = useMemo(() => {
    const parts: string[] = [];
    if (searchTerm.trim()) parts.push(`Query: "${searchTerm.trim()}"`);
    if (selectedCategory !== 'all') parts.push(`Subsystem: ${selectedCategory.replace('_', ' ')}`);
    if (selectedUser !== 'all') parts.push(`Operator: ${selectedUser}`);
    if (selectedSeverity !== 'all') parts.push(`Severity: ${selectedSeverity}`);
    if (selectedActionType !== 'all') parts.push(`Action: ${selectedActionType}`);
    if (dateFilter !== 'all') parts.push(`Range: ${dateFilter === 'today' ? 'Past 24h' : dateFilter === '7days' ? 'Past 7d' : 'Past 30d'}`);
    return parts.length > 0 ? parts.join(' | ') : 'All Subsystems & Operators';
  }, [searchTerm, selectedCategory, selectedUser, selectedSeverity, selectedActionType, dateFilter]);

  // Handler for Manual Audit Log Submission
  const handleCreateManualAudit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualDescription.trim()) return;

    logAuditAction({
      category: manualSubsystem,
      subsystem: manualSubsystem === 'inventory' ? 'Raw Materials' 
        : manualSubsystem === 'production' ? 'WIP Production Floor' 
        : manualSubsystem === 'cold_storage' ? 'Cold Storage'
        : manualSubsystem === 'procurement' ? 'Procurement & ROP'
        : manualSubsystem === 'sales' ? 'Dairy Box Outlet'
        : manualSubsystem === 'commitments' ? 'Institutional Demand'
        : 'System & Security',
      action: manualAction,
      description: manualDescription.trim(),
      details: {
        itemOrBatch: manualItemOrBatch || undefined,
        previousValue: manualPreviousValue || undefined,
        newValue: manualNewValue || undefined,
        reason: manualNotes || 'On-site physical audit inspection note'
      },
      severity: manualSeverity,
      terminalOrStation: `${currentUser.name} (Mobile Auditor Console)`
    });

    // Reset and close
    setManualDescription('');
    setManualItemOrBatch('');
    setManualPreviousValue('');
    setManualNewValue('');
    setManualNotes('');
    setShowManualAuditModal(false);
  };

  const getCategoryBadge = (category: AuditCategory) => {
    switch (category) {
      case 'inventory':
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-300">Raw Inventory</span>;
      case 'production':
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-100 text-indigo-800 border border-indigo-300">WIP Production</span>;
      case 'cold_storage':
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-cyan-100 text-cyan-800 border border-cyan-300">Cold Storage</span>;
      case 'procurement':
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-orange-100 text-orange-800 border border-orange-300">Procurement</span>;
      case 'sales':
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">Dairy Box POS</span>;
      case 'commitments':
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-100 text-purple-800 border border-purple-300">Commitments</span>;
      case 'security':
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800 border border-rose-300">Security</span>;
      default:
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-800 border border-slate-300">{category}</span>;
    }
  };

  const getSeverityIcon = (severity?: AuditSeverity) => {
    switch (severity) {
      case 'critical':
        return <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />;
      case 'warning':
        return <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0" />;
      case 'success':
        return <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />;
      default:
        return <Info className="w-4 h-4 text-blue-500 shrink-0" />;
    }
  };

  if (!isAuthorized) {
    return (
      <AccessRestricted 
        requiredTab="audit" 
        onNavigateHome={() => window.location.reload()} 
      />
    );
  }

  return (
    <div className="space-y-6">
      
      {/* Top Header & Action Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white border-2 border-slate-200 p-5 sm:p-6 rounded-3xl shadow-sm text-slate-900">
        <div>
          <div className="flex items-center space-x-2.5">
            <div className="p-2.5 bg-indigo-50 border border-indigo-200 rounded-2xl text-indigo-700">
              <ShieldCheck className="w-6 h-6 text-indigo-600" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
                <span>Operational Audit Trail</span>
                <span className="text-xs font-mono font-bold bg-indigo-100 text-indigo-800 px-2.5 py-0.5 rounded-full border border-indigo-200">
                  ISO 25010 Accountable
                </span>
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 font-medium mt-0.5">
                Centralized provenance tracking user actions, BOM deductions, WIP step advances & cold storage changes
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 pt-2 md:pt-0">
          <button
            id="btn-export-audit-pdf"
            onClick={() => setShowPdfModal(true)}
            className="flex-1 sm:flex-none flex items-center justify-center space-x-2 px-3.5 py-2 rounded-2xl text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm transition-all cursor-pointer"
            title="Export Audit Trail logs into a downloadable PDF report for compliance"
          >
            <FileText className="w-4 h-4" />
            <span>Export PDF Report</span>
          </button>

          <button
            id="btn-manual-audit-record"
            onClick={() => setShowManualAuditModal(true)}
            className="flex-1 sm:flex-none flex items-center justify-center space-x-2 px-3.5 py-2 rounded-2xl text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-200 shadow-xs transition-all cursor-pointer"
            title="Log manual audit check / QA physical verification"
          >
            <PlusCircle className="w-4 h-4 text-indigo-600" />
            <span>Record Verification</span>
          </button>

          <button
            id="btn-export-audit-csv"
            onClick={exportAuditLogsCsv}
            className="flex-1 sm:flex-none flex items-center justify-center space-x-2 px-3.5 py-2 rounded-2xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm transition-all cursor-pointer"
            title="Export all audit logs to CSV"
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>Export CSV</span>
          </button>

          <button
            id="btn-clear-audit-logs"
            onClick={() => setShowClearConfirm(true)}
            className="flex items-center justify-center p-2 rounded-2xl text-xs font-bold bg-slate-100 hover:bg-rose-50 text-slate-600 hover:text-rose-700 border border-slate-200 transition-all cursor-pointer"
            title="Clear or archive audit log"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* KPI Stats Grid - Fully Responsive */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-white border-2 border-slate-200 rounded-3xl p-4 sm:p-5 shadow-sm">
          <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Total Audit Logs</p>
          <div className="flex items-baseline justify-between mt-1">
            <span className="text-2xl sm:text-3xl font-black text-slate-900 font-mono">{stats.total}</span>
            <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">Synchronized</span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1 truncate">Recorded system-wide events</p>
        </div>

        <div className="bg-white border-2 border-slate-200 rounded-3xl p-4 sm:p-5 shadow-sm">
          <p className="text-[11px] font-bold uppercase tracking-wider text-amber-600">Inventory Logs</p>
          <div className="flex items-baseline justify-between mt-1">
            <span className="text-2xl sm:text-3xl font-black text-slate-900 font-mono">{stats.inventoryCount}</span>
            <span className="text-[10px] font-bold text-amber-800 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">Raw & Finished</span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1 truncate">Stock deductions & adjustments</p>
        </div>

        <div className="bg-white border-2 border-slate-200 rounded-3xl p-4 sm:p-5 shadow-sm">
          <p className="text-[11px] font-bold uppercase tracking-wider text-indigo-600">Production Batches</p>
          <div className="flex items-baseline justify-between mt-1">
            <span className="text-2xl sm:text-3xl font-black text-slate-900 font-mono">{stats.productionCount}</span>
            <span className="text-[10px] font-bold text-indigo-800 bg-indigo-50 px-2 py-0.5 rounded-full border border-indigo-200">Processing Floor</span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1 truncate">WIP scheduling & progression</p>
        </div>

        <div className="bg-white border-2 border-slate-200 rounded-3xl p-4 sm:p-5 shadow-sm">
          <p className="text-[11px] font-bold uppercase tracking-wider text-rose-600">Warnings / Critical</p>
          <div className="flex items-baseline justify-between mt-1">
            <span className="text-2xl sm:text-3xl font-black text-slate-900 font-mono">{stats.highSeverityCount}</span>
            <span className="text-[10px] font-bold text-rose-800 bg-rose-50 px-2 py-0.5 rounded-full border border-rose-200">Inspection Flags</span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1 truncate">Reorders, deficits & cancellations</p>
        </div>
      </div>

      {/* Search & Filters Section */}
      <div className="bg-white border-2 border-slate-200 rounded-3xl p-4 sm:p-6 shadow-sm space-y-4 text-slate-900">
        
        {/* Search Bar & Filter Toggle */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              placeholder="Search by action, item, reference ID, operator, or keyword..."
              className="w-full pl-10 pr-4 py-2.5 text-xs sm:text-sm bg-slate-50 border-2 border-slate-200 rounded-2xl focus:bg-white focus:outline-none focus:border-indigo-500 transition-colors"
            />
            {searchTerm && (
              <button 
                onClick={() => setSearchTerm('')}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsFiltersOpen(!isFiltersOpen)}
              className={`flex items-center justify-center space-x-2 px-4 py-2.5 rounded-2xl text-xs font-bold border transition-all ${
                isFiltersOpen || selectedCategory !== 'all' || selectedUser !== 'all' || selectedSeverity !== 'all' || selectedActionType !== 'all' || dateFilter !== 'all'
                  ? 'bg-indigo-50 border-indigo-300 text-indigo-700'
                  : 'bg-slate-100 border-slate-200 text-slate-700 hover:bg-slate-200'
              }`}
            >
              <SlidersHorizontal className="w-4 h-4" />
              <span>Filters</span>
              {(selectedCategory !== 'all' || selectedUser !== 'all' || selectedSeverity !== 'all' || selectedActionType !== 'all' || dateFilter !== 'all') && (
                <span className="w-2 h-2 rounded-full bg-indigo-600 animate-pulse" />
              )}
            </button>

            {(searchTerm || selectedCategory !== 'all' || selectedUser !== 'all' || selectedSeverity !== 'all' || selectedActionType !== 'all' || dateFilter !== 'all') && (
              <button
                onClick={() => {
                  setSearchTerm('');
                  setSelectedCategory('all');
                  setSelectedUser('all');
                  setSelectedSeverity('all');
                  setSelectedActionType('all');
                  setDateFilter('all');
                }}
                className="px-3 py-2.5 rounded-2xl text-xs font-bold text-slate-500 hover:text-rose-600 hover:bg-rose-50 border border-slate-200 transition-colors"
                title="Reset all filters"
              >
                Reset
              </button>
            )}
          </div>
        </div>

        {/* Expandable Filter Controls */}
        {isFiltersOpen && (
          <div className="pt-3 border-t-2 border-slate-100 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 animate-in fade-in duration-150">
            
            {/* Subsystem / Category */}
            <div>
              <label className="block text-[10px] font-extrabold uppercase tracking-wider text-slate-500 mb-1">
                Subsystem
              </label>
              <select
                value={selectedCategory}
                onChange={e => setSelectedCategory(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-800 focus:outline-none focus:border-indigo-500"
              >
                <option value="all">All Subsystems</option>
                <option value="inventory">Raw Materials Inventory</option>
                <option value="production">WIP Production Batches</option>
                <option value="cold_storage">Finished Cold Storage</option>
                <option value="procurement">ROP Procurement</option>
                <option value="sales">Dairy Box POS Outlet</option>
                <option value="commitments">School / Coop Commitments</option>
                <option value="security">User Security & Access</option>
              </select>
            </div>

            {/* User / Operator */}
            <div>
              <label className="block text-[10px] font-extrabold uppercase tracking-wider text-slate-500 mb-1">
                Operator / User
              </label>
              <select
                value={selectedUser}
                onChange={e => setSelectedUser(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-800 focus:outline-none focus:border-indigo-500"
              >
                <option value="all">All Operators</option>
                {users.map(u => (
                  <option key={u.id} value={u.id}>
                    {u.name} ({u.role})
                  </option>
                ))}
              </select>
            </div>

            {/* Action Type */}
            <div>
              <label className="block text-[10px] font-extrabold uppercase tracking-wider text-slate-500 mb-1">
                Action Type
              </label>
              <select
                value={selectedActionType}
                onChange={e => setSelectedActionType(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-800 focus:outline-none focus:border-indigo-500"
              >
                <option value="all">All Action Types</option>
                {uniqueActionTypes.map(act => (
                  <option key={act} value={act}>{act}</option>
                ))}
              </select>
            </div>

            {/* Severity */}
            <div>
              <label className="block text-[10px] font-extrabold uppercase tracking-wider text-slate-500 mb-1">
                Severity Level
              </label>
              <select
                value={selectedSeverity}
                onChange={e => setSelectedSeverity(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-800 focus:outline-none focus:border-indigo-500"
              >
                <option value="all">All Severities</option>
                <option value="info">Info</option>
                <option value="success">Success</option>
                <option value="warning">Warning</option>
                <option value="critical">Critical</option>
              </select>
            </div>

            {/* Date Range */}
            <div>
              <label className="block text-[10px] font-extrabold uppercase tracking-wider text-slate-500 mb-1">
                Date Range
              </label>
              <select
                value={dateFilter}
                onChange={e => setDateFilter(e.target.value as any)}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-800 focus:outline-none focus:border-indigo-500"
              >
                <option value="all">All Historic Time</option>
                <option value="today">Past 24 Hours</option>
                <option value="7days">Past 7 Days</option>
                <option value="30days">Past 30 Days</option>
              </select>
            </div>

          </div>
        )}

      </div>

      {/* Audit Log Results - Responsive Card View on Mobile & Compact Table on Large Screens */}
      <div className="bg-white border-2 border-slate-200 rounded-3xl shadow-sm overflow-hidden text-slate-900">
        <div className="p-4 sm:p-5 border-b-2 border-slate-100 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center space-x-2">
            <h2 className="text-sm sm:text-base font-extrabold text-slate-900">
              Audit Records ({filteredLogs.length})
            </h2>
            {filteredLogs.length < auditLogs.length && (
              <span className="text-[11px] font-medium text-slate-400">
                (Filtered from {auditLogs.length} total)
              </span>
            )}
          </div>
          <div className="flex items-center space-x-3">
            <button
              id="btn-quick-export-audit-pdf"
              onClick={() => setShowPdfModal(true)}
              className="inline-flex items-center space-x-1.5 text-xs font-bold text-indigo-700 hover:text-indigo-900 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 px-3 py-1.5 rounded-xl transition-all shadow-xs cursor-pointer"
              title="Export displayed audit trail records to PDF"
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Export PDF Report</span>
            </button>
            <span className="text-[11px] text-slate-500 font-medium hidden sm:block">
              Click any row to inspect complete immutable provenance
            </span>
          </div>
        </div>

        {filteredLogs.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <ShieldCheck className="w-12 h-12 text-slate-300 mx-auto" />
            <h3 className="text-base font-bold text-slate-800">No matching audit logs found</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Try adjusting your search criteria or resetting applied filters.
            </p>
          </div>
        ) : (
          <div>
            {/* Desktop / Tablet Table View (hidden on very small screens) */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-extrabold text-slate-400 uppercase tracking-wider">
                    <th className="py-3 px-4">Timestamp</th>
                    <th className="py-3 px-4">Subsystem</th>
                    <th className="py-3 px-4">Action Code</th>
                    <th className="py-3 px-4">Description & Provenance</th>
                    <th className="py-3 px-4">Operator / Station</th>
                    <th className="py-3 px-4 text-center">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs">
                  {filteredLogs.map(log => (
                    <tr 
                      key={log.id}
                      onClick={() => setActiveDetailLog(log)}
                      className="hover:bg-slate-50 cursor-pointer transition-colors group"
                    >
                      <td className="py-3 px-4 whitespace-nowrap">
                        <div className="flex items-center space-x-2">
                          {getSeverityIcon(log.severity)}
                          <div>
                            <p className="font-mono font-bold text-slate-800 text-[11px]">
                              {log.timestamp.replace(' PST', '')}
                            </p>
                            <p className="text-[10px] text-slate-400 font-mono">{log.id}</p>
                          </div>
                        </div>
                      </td>

                      <td className="py-3 px-4 whitespace-nowrap">
                        {getCategoryBadge(log.category)}
                      </td>

                      <td className="py-3 px-4 whitespace-nowrap">
                        <span className="font-mono text-[11px] font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                          {log.action}
                        </span>
                      </td>

                      <td className="py-3 px-4 max-w-md">
                        <p className="font-medium text-slate-800 leading-snug truncate">
                          {log.description}
                        </p>
                        {log.details && (
                          <div className="flex items-center gap-2 mt-0.5 text-[10px] text-slate-500 font-mono">
                            {log.details.itemOrBatch && <span>Ref: {String(log.details.itemOrBatch)}</span>}
                            {log.details.quantity !== undefined && (
                              <span>Qty: {log.details.quantity} {log.details.unit || ''}</span>
                            )}
                          </div>
                        )}
                      </td>

                      <td className="py-3 px-4 whitespace-nowrap">
                        <div>
                          <p className="font-bold text-slate-900">{log.userName}</p>
                          <p className="text-[10px] text-slate-500 font-mono">
                            {log.terminalOrStation || log.userRole}
                          </p>
                        </div>
                      </td>

                      <td className="py-3 px-4 text-center whitespace-nowrap">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setActiveDetailLog(log);
                          }}
                          className="p-1.5 rounded-lg bg-slate-100 hover:bg-indigo-50 text-slate-600 hover:text-indigo-600 transition-colors"
                          title="View Full Provenance"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Cards View (displayed below md breakpoint) */}
            <div className="md:hidden divide-y divide-slate-100">
              {filteredLogs.map(log => (
                <div 
                  key={log.id} 
                  onClick={() => setActiveDetailLog(log)}
                  className="p-4 hover:bg-slate-50 cursor-pointer space-y-2 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      {getSeverityIcon(log.severity)}
                      {getCategoryBadge(log.category)}
                    </div>
                    <span className="text-[10px] font-mono text-slate-400">
                      {log.timestamp.replace(' PST', '')}
                    </span>
                  </div>

                  <div>
                    <div className="font-mono text-[11px] font-bold text-indigo-700">
                      {log.action}
                    </div>
                    <p className="text-xs font-semibold text-slate-900 mt-0.5">
                      {log.description}
                    </p>
                  </div>

                  <div className="flex items-center justify-between pt-1 text-[11px] text-slate-500 border-t border-slate-100">
                    <div className="flex items-center space-x-1.5 truncate">
                      <User className="w-3.5 h-3.5 text-slate-400" />
                      <span className="font-bold text-slate-700 truncate">{log.userName}</span>
                    </div>
                    <span className="text-[10px] text-indigo-600 font-bold flex items-center">
                      Details &rarr;
                    </span>
                  </div>
                </div>
              ))}
            </div>

          </div>
        )}

      </div>

      {/* Detail Inspection Modal */}
      {activeDetailLog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white border-2 border-slate-200 rounded-3xl w-full max-w-xl max-h-[90vh] overflow-y-auto p-5 sm:p-6 shadow-2xl text-slate-900 space-y-5">
            
            <div className="flex items-center justify-between border-b-2 border-slate-100 pb-4">
              <div className="flex items-center space-x-2.5">
                {getSeverityIcon(activeDetailLog.severity)}
                <div>
                  <h3 className="text-base font-extrabold text-slate-900">
                    Audit Provenance Details
                  </h3>
                  <p className="text-[11px] font-mono text-slate-400">ID: {activeDetailLog.id}</p>
                </div>
              </div>
              <button 
                onClick={() => setActiveDetailLog(null)}
                className="p-1.5 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              
              <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
                    Subsystem & Action
                  </span>
                  {getCategoryBadge(activeDetailLog.category)}
                </div>
                <p className="font-mono text-xs font-bold text-slate-800">
                  {activeDetailLog.action}
                </p>
                <p className="text-xs text-slate-700 font-medium">
                  {activeDetailLog.description}
                </p>
              </div>

              {/* Detailed Values Grid */}
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200">
                  <p className="text-[10px] font-extrabold uppercase text-slate-400">Timestamp</p>
                  <p className="font-mono font-bold text-slate-800 mt-0.5">{activeDetailLog.timestamp}</p>
                </div>

                <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200">
                  <p className="text-[10px] font-extrabold uppercase text-slate-400">Operator Name</p>
                  <p className="font-bold text-slate-800 mt-0.5">{activeDetailLog.userName}</p>
                  <p className="text-[10px] text-slate-500 font-mono">{activeDetailLog.userRole}</p>
                </div>

                <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 col-span-2">
                  <p className="text-[10px] font-extrabold uppercase text-slate-400">Terminal / Workstation</p>
                  <p className="font-mono text-slate-700 mt-0.5">{activeDetailLog.terminalOrStation || 'PCC-MMSU Network Workstation'}</p>
                </div>
              </div>

              {/* Specific metadata / before-after if available */}
              {activeDetailLog.details && (
                <div className="p-3.5 bg-indigo-50/50 rounded-2xl border border-indigo-200 space-y-2">
                  <p className="text-[10px] font-extrabold uppercase tracking-wider text-indigo-700">
                    Delta / Change Parameters
                  </p>
                  
                  <div className="grid grid-cols-2 gap-2 text-[11px] font-mono">
                    {activeDetailLog.details.itemOrBatch && (
                      <div>
                        <span className="text-slate-400 block text-[9px] uppercase">Item / Batch:</span>
                        <span className="font-bold text-slate-800">{String(activeDetailLog.details.itemOrBatch)}</span>
                      </div>
                    )}
                    {activeDetailLog.details.referenceId && (
                      <div>
                        <span className="text-slate-400 block text-[9px] uppercase">Reference ID:</span>
                        <span className="font-bold text-slate-800">{String(activeDetailLog.details.referenceId)}</span>
                      </div>
                    )}
                    {activeDetailLog.details.previousValue !== undefined && (
                      <div>
                        <span className="text-slate-400 block text-[9px] uppercase">Previous Value:</span>
                        <span className="text-slate-600 line-through">{String(activeDetailLog.details.previousValue)}</span>
                      </div>
                    )}
                    {activeDetailLog.details.newValue !== undefined && (
                      <div>
                        <span className="text-slate-400 block text-[9px] uppercase">New Value:</span>
                        <span className="font-bold text-emerald-700">{String(activeDetailLog.details.newValue)}</span>
                      </div>
                    )}
                    {activeDetailLog.details.quantity !== undefined && (
                      <div>
                        <span className="text-slate-400 block text-[9px] uppercase">Quantity Delta:</span>
                        <span className="font-bold text-indigo-800">{activeDetailLog.details.quantity} {activeDetailLog.details.unit || ''}</span>
                      </div>
                    )}
                  </div>

                  {activeDetailLog.details.reason && (
                    <div className="pt-2 border-t border-indigo-100">
                      <span className="text-slate-400 block text-[9px] uppercase font-bold">Operator Reason / Verification Note:</span>
                      <p className="text-slate-700 text-xs font-sans mt-0.5 italic">
                        "{activeDetailLog.details.reason}"
                      </p>
                    </div>
                  )}
                </div>
              )}

            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setActiveDetailLog(null)}
                className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-colors"
              >
                Close Provenance View
              </button>
            </div>

          </div>
        </div>
      )}

      {/* Manual Verification Entry Modal */}
      {showManualAuditModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white border-2 border-slate-200 rounded-3xl w-full max-w-lg max-h-[90vh] overflow-y-auto p-5 sm:p-6 shadow-2xl text-slate-900 space-y-4">
            
            <div className="flex items-center justify-between border-b-2 border-slate-100 pb-3">
              <div className="flex items-center space-x-2">
                <PlusCircle className="w-5 h-5 text-indigo-600" />
                <h3 className="text-base font-extrabold text-slate-900">
                  Record Verification / Physical Stocktake Audit
                </h3>
              </div>
              <button 
                onClick={() => setShowManualAuditModal(false)}
                className="p-1 rounded-full hover:bg-slate-100 text-slate-400"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateManualAudit} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-[10px] font-extrabold uppercase tracking-wider text-slate-500 mb-1">
                  Target Subsystem
                </label>
                <select
                  value={manualSubsystem}
                  onChange={e => setManualSubsystem(e.target.value as AuditCategory)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium"
                >
                  <option value="inventory">Raw Materials Inventory</option>
                  <option value="production">WIP Production Processing Floor</option>
                  <option value="cold_storage">Cold Storage Warehouse</option>
                  <option value="procurement">Procurement & ROP</option>
                  <option value="sales">Dairy Box POS Outlet</option>
                  <option value="commitments">Institutional Demand & Feeding Commitments</option>
                  <option value="security">User Security & System Config</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-extrabold uppercase tracking-wider text-slate-500 mb-1">
                  Action Code
                </label>
                <input
                  type="text"
                  value={manualAction}
                  onChange={e => setManualAction(e.target.value.toUpperCase())}
                  placeholder="e.g. PHYSICAL_STOCKTAKE_VERIFIED"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-mono font-bold"
                  required
                />
              </div>

              <div>
                <label className="block text-[10px] font-extrabold uppercase tracking-wider text-slate-500 mb-1">
                  Audit Summary Description
                </label>
                <input
                  type="text"
                  value={manualDescription}
                  onChange={e => setManualDescription(e.target.value)}
                  placeholder="e.g. Verified physical milk lactometer readings on Morning intake"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-[10px] font-extrabold uppercase tracking-wider text-slate-500 mb-1">
                    Item or Batch Reference
                  </label>
                  <input
                    type="text"
                    value={manualItemOrBatch}
                    onChange={e => setManualItemOrBatch(e.target.value)}
                    placeholder="e.g. Batch #2026-089"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-extrabold uppercase tracking-wider text-slate-500 mb-1">
                    Severity
                  </label>
                  <select
                    value={manualSeverity}
                    onChange={e => setManualSeverity(e.target.value as AuditSeverity)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium"
                  >
                    <option value="info">Info</option>
                    <option value="success">Success</option>
                    <option value="warning">Warning</option>
                    <option value="critical">Critical</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-[10px] font-extrabold uppercase tracking-wider text-slate-500 mb-1">
                    Previous Observed Value
                  </label>
                  <input
                    type="text"
                    value={manualPreviousValue}
                    onChange={e => setManualPreviousValue(e.target.value)}
                    placeholder="e.g. 500 L"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-mono"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-extrabold uppercase tracking-wider text-slate-500 mb-1">
                    New / Verified Value
                  </label>
                  <input
                    type="text"
                    value={manualNewValue}
                    onChange={e => setManualNewValue(e.target.value)}
                    placeholder="e.g. 500 L verified"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-extrabold uppercase tracking-wider text-slate-500 mb-1">
                  Verification Notes / Signing Remark
                </label>
                <textarea
                  rows={2}
                  value={manualNotes}
                  onChange={e => setManualNotes(e.target.value)}
                  placeholder="Physical verification conducted per ISO 25010 data accuracy protocol..."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>

              <div className="pt-3 flex justify-end space-x-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowManualAuditModal(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 rounded-xl font-bold text-slate-700 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold transition-colors shadow-sm"
                >
                  Submit Audit Record
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

      {/* Confirmation Modal to Clear Audit Trail */}
      {showClearConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white border-2 border-slate-200 rounded-3xl w-full max-w-md p-6 shadow-2xl text-slate-900 space-y-4">
            <div className="flex items-center space-x-3 text-rose-600">
              <AlertTriangle className="w-7 h-7" />
              <h3 className="text-base font-extrabold">Archive / Clear Audit Trail?</h3>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Are you sure you want to clear the active local audit trail? It is recommended to download a CSV backup prior to clearing.
            </p>
            <div className="flex justify-end space-x-2 pt-2">
              <button
                onClick={() => setShowClearConfirm(false)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 rounded-xl text-xs font-bold text-slate-700"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  exportAuditLogsCsv();
                  clearAuditLogs();
                  setShowClearConfirm(false);
                }}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold"
              >
                Export & Clear
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Export PDF Report Modal */}
      {showPdfModal && (
        <AuditPdfReportModal
          logs={filteredLogs}
          allLogs={auditLogs}
          filterSummary={filterSummaryText}
          onClose={() => setShowPdfModal(false)}
        />
      )}

    </div>
  );
};
