import React, { useState, useMemo } from 'react';
import { useDairySync } from '../context/DairySyncContext';
import { RawIngredient, IngredientCategory } from '../types';
import { 
  Package, 
  Search,
  Plus, 
  RefreshCw, 
  X, 
  Download,
  AlertTriangle,
  Clock,
  CheckCircle2,
  XCircle,
  Calendar,
  LayoutList,
  LayoutGrid,
  DollarSign,
  Printer
} from 'lucide-react';
import { PrintStockReportModal } from './PrintStockReportModal';

export interface ExpiryInfo {
  dateStr?: string;
  daysRemaining: number | null;
  status: 'expired' | 'critical' | 'expiring_soon' | 'healthy' | 'non_perishable';
  label: string;
  isFlagged: boolean; // Flagged if expiring within next 7 days or already expired
}

export const getIngredientExpiryInfo = (expiryDate?: string): ExpiryInfo => {
  if (!expiryDate) {
    return {
      dateStr: undefined,
      daysRemaining: null,
      status: 'non_perishable',
      label: 'Non-perishable',
      isFlagged: false
    };
  }

  const today = new Date();
  const todayMidnight = new Date(today.getFullYear(), today.getMonth(), today.getDate()).getTime();
  
  const expiry = new Date(expiryDate);
  const expiryMidnight = new Date(expiry.getFullYear(), expiry.getMonth(), expiry.getDate()).getTime();

  const diffDays = Math.ceil((expiryMidnight - todayMidnight) / (1000 * 60 * 60 * 24));

  if (diffDays < 0) {
    return {
      dateStr: expiryDate,
      daysRemaining: diffDays,
      status: 'expired',
      label: `Expired (${Math.abs(diffDays)}d ago)`,
      isFlagged: true
    };
  }

  if (diffDays === 0) {
    return {
      dateStr: expiryDate,
      daysRemaining: 0,
      status: 'critical',
      label: 'Expires Today',
      isFlagged: true
    };
  }

  if (diffDays <= 3) {
    return {
      dateStr: expiryDate,
      daysRemaining: diffDays,
      status: 'critical',
      label: `${diffDays}d left (Critical)`,
      isFlagged: true
    };
  }

  if (diffDays <= 7) {
    return {
      dateStr: expiryDate,
      daysRemaining: diffDays,
      status: 'expiring_soon',
      label: `${diffDays}d left (Within 7d)`,
      isFlagged: true
    };
  }

  return {
    dateStr: expiryDate,
    daysRemaining: diffDays,
    status: 'healthy',
    label: `${diffDays}d left`,
    isFlagged: false
  };
};

export const RawIngredients: React.FC = () => {
  const { 
    ingredients, 
    addIngredient, 
    updateIngredientStock
  } = useDairySync();

  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [filterExpiringSoonOnly, setFilterExpiringSoonOnly] = useState<boolean>(false);
  const [viewMode, setViewMode] = useState<'table' | 'grid'>('table');

  const [showAddModal, setShowAddModal] = useState(false);
  const [showPrintModal, setShowPrintModal] = useState(false);
  const [stockModalItem, setStockModalItem] = useState<RawIngredient | null>(null);
  const [stockAdjustQty, setStockAdjustQty] = useState<number>(0);
  const [stockAdjustQtyStr, setStockAdjustQtyStr] = useState<string>('0');
  const [stockNotes, setStockNotes] = useState('');
  const [stockExpiryDate, setStockExpiryDate] = useState<string>('');

  // Form state for new raw material / packaging
  const [addSku, setAddSku] = useState('ING-' + Math.floor(100 + Math.random() * 900));
  const [addName, setAddName] = useState('');
  const [addCategory, setAddCategory] = useState('milk');
  const [addCategorySelect, setAddCategorySelect] = useState('milk');
  const [customCategory, setCustomCategory] = useState('');
  const [addUnit, setAddUnit] = useState('kg');
  const [addUnitSelect, setAddUnitSelect] = useState('kg');
  const [customUnit, setCustomUnit] = useState('');
  const [addInitialStock, setAddInitialStock] = useState('100');
  const [addUnitCost, setAddUnitCost] = useState('50');
  const [addSafetyStock, setAddSafetyStock] = useState('15');
  const [addReorderPoint, setAddReorderPoint] = useState('30');
  const [addMaxStock, setAddMaxStock] = useState('500');
  const [isNonPerishable, setIsNonPerishable] = useState(false);
  const [addExpiryDate, setAddExpiryDate] = useState(new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0]);
  const [addSupplier, setAddSupplier] = useState('PCC Local Cooperatives');
  const [addLocation, setAddLocation] = useState('Dry Storage Bay 1');

  // Dynamic available categories across inventory
  const availableCategories = useMemo(() => {
    const defaultCategories = ['milk', 'sweetener', 'flavoring', 'packaging', 'additive', 'culture', 'stabilizer', 'sanitizer'];
    const current = ingredients.map(i => i.category).filter(Boolean);
    return Array.from(new Set([...defaultCategories, ...current]));
  }, [ingredients]);

  // Dynamic available units
  const availableUnits = useMemo(() => {
    const defaultUnits = ['L', 'kg', 'pieces', 'grams', 'packs', 'bottles', 'boxes', 'bags', 'caps', 'labels', 'rolls', 'sachets'];
    const current = ingredients.map(i => i.unit).filter(Boolean);
    return Array.from(new Set([...defaultUnits, ...current]));
  }, [ingredients]);

  const categories = useMemo(() => {
    const list: { key: string; label: string }[] = [
      { key: 'all', label: 'All Categories' },
      { key: 'milk', label: 'Carabao Milk' },
      { key: 'sweetener', label: 'Sweetener' },
      { key: 'flavoring', label: 'Flavoring' },
      { key: 'packaging', label: 'Packaging' },
      { key: 'additive', label: 'Additive' },
    ];
    availableCategories.forEach(cat => {
      if (!list.some(c => c.key === cat)) {
        list.push({
          key: cat,
          label: cat.charAt(0).toUpperCase() + cat.slice(1).replace('_', ' ')
        });
      }
    });
    return list;
  }, [availableCategories]);

  // Expiry stats calculation
  const expiryMetrics = useMemo(() => {
    let expiringCount = 0;
    let criticalCount = 0;
    let expiredCount = 0;

    ingredients.forEach(i => {
      const exp = getIngredientExpiryInfo(i.expiryDate);
      if (exp.isFlagged) {
        expiringCount++;
        if (exp.status === 'critical') criticalCount++;
        if (exp.status === 'expired') expiredCount++;
      }
    });

    const totalValuation = ingredients.reduce((sum, i) => sum + (i.currentStock * i.costPerUnit), 0);
    const belowRopCount = ingredients.filter(i => i.currentStock <= i.reorderPoint).length;

    return {
      expiringCount,
      criticalCount,
      expiredCount,
      totalValuation,
      belowRopCount
    };
  }, [ingredients]);

  const filtered = useMemo(() => {
    return ingredients.filter(i => {
      const query = search.toLowerCase().trim();
      const matchSearch = !query || 
        i.name.toLowerCase().includes(query) || 
        i.sku.toLowerCase().includes(query) ||
        i.supplier.toLowerCase().includes(query) ||
        i.location.toLowerCase().includes(query);
      const matchCategory = selectedCategory === 'all' || i.category === selectedCategory;
      
      const expInfo = getIngredientExpiryInfo(i.expiryDate);
      const matchExpiring = !filterExpiringSoonOnly || expInfo.isFlagged;

      return matchSearch && matchCategory && matchExpiring;
    });
  }, [ingredients, search, selectedCategory, filterExpiringSoonOnly]);

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!addName.trim()) return;

    const newIngredient: Omit<RawIngredient, 'id'> = {
      sku: addSku.trim() || ('ING-' + Math.floor(100 + Math.random() * 900)),
      name: addName.trim(),
      category: (addCategory.trim().toLowerCase() || 'milk') as IngredientCategory,
      unit: (addUnit.trim() || 'kg') as RawIngredient['unit'],
      currentStock: parseFloat(addInitialStock) || 0,
      costPerUnit: parseFloat(addUnitCost) || 0,
      safetyStock: parseFloat(addSafetyStock) || 0,
      reorderPoint: parseFloat(addReorderPoint) || 0,
      maxStock: parseFloat(addMaxStock) || 500,
      avgDailyConsumption: 5,
      leadTimeDays: 3,
      supplier: addSupplier.trim() || 'PCC Local Cooperatives',
      location: addLocation.trim() || 'Dry Storage Bay 1',
      lastRestocked: new Date().toLocaleDateString() + ' PST',
      expiryDate: isNonPerishable ? undefined : (addExpiryDate || undefined)
    };

    addIngredient(newIngredient);
    setShowAddModal(false);

    // Reset form fields
    setAddSku('ING-' + Math.floor(100 + Math.random() * 900));
    setAddName('');
    setAddCategory('milk');
    setAddCategorySelect('milk');
    setCustomCategory('');
    setAddUnit('kg');
    setAddUnitSelect('kg');
    setCustomUnit('');
    setAddInitialStock('100');
    setAddUnitCost('50');
    setAddSafetyStock('15');
    setAddReorderPoint('30');
    setAddMaxStock('500');
    setIsNonPerishable(false);
    setAddExpiryDate(new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0]);
  };

  const handleStockUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!stockModalItem) return;
    const finalQty = parseFloat(stockAdjustQtyStr) || 0;
    updateIngredientStock(
      stockModalItem.id, 
      finalQty, 
      stockNotes, 
      stockExpiryDate ? stockExpiryDate : undefined
    );
    setStockModalItem(null);
    setStockNotes('');
    setStockExpiryDate('');
  };

  const openAdjustModal = (item: RawIngredient) => {
    setStockModalItem(item);
    setStockAdjustQty(item.currentStock);
    setStockAdjustQtyStr(String(item.currentStock));
    setStockExpiryDate(item.expiryDate || '');
    setStockNotes('');
  };

  const handleExportIngredientsCsv = () => {
    const exportData = filtered.length > 0 ? filtered : ingredients;
    const headers = [
      'SKU',
      'Name',
      'Category',
      'Current Stock',
      'Unit',
      'Reorder Point (ROP)',
      'Safety Stock',
      'Max Stock',
      'Expiry Date',
      'Expiry Status',
      'Cost Per Unit (PHP)',
      'Total Valuation (PHP)',
      'Supplier',
      'Location',
      'Last Restocked'
    ];
    const rows = exportData.map(i => {
      const exp = getIngredientExpiryInfo(i.expiryDate);
      return [
        `"${i.sku}"`,
        `"${i.name}"`,
        `"${i.category}"`,
        i.currentStock,
        `"${i.unit}"`,
        i.reorderPoint,
        i.safetyStock,
        i.maxStock,
        `"${i.expiryDate || 'N/A'}"`,
        `"${exp.label}"`,
        i.costPerUnit,
        (i.currentStock * i.costPerUnit).toFixed(2),
        `"${i.supplier}"`,
        `"${i.location}"`,
        `"${i.lastRestocked}"`
      ];
    });
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `DairySync_Raw_Ingredients_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const clearFilters = () => {
    setSearch('');
    setSelectedCategory('all');
    setFilterExpiringSoonOnly(false);
  };

  // Render the Expiry Tracking Badge
  const renderExpiryBadge = (exp: ExpiryInfo) => {
    if (exp.status === 'expired') {
      return (
        <div className="flex flex-col items-start gap-1">
          <span className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-xl text-xs font-black bg-red-100 text-red-800 border border-red-300">
            <XCircle className="w-3.5 h-3.5 text-red-600 shrink-0" />
            <span>{exp.label}</span>
          </span>
          {exp.dateStr && (
            <span className="text-[11px] font-mono text-red-600 font-semibold pl-1">
              Expired: {exp.dateStr}
            </span>
          )}
        </div>
      );
    }

    if (exp.status === 'critical') {
      return (
        <div className="flex flex-col items-start gap-1">
          <span className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-xl text-xs font-black bg-rose-100 text-rose-700 border border-rose-300 shadow-sm animate-pulse">
            <AlertTriangle className="w-3.5 h-3.5 text-rose-600 shrink-0" />
            <span>{exp.label}</span>
          </span>
          {exp.dateStr && (
            <span className="text-[11px] font-mono text-rose-600 font-semibold pl-1">
              Due: {exp.dateStr}
            </span>
          )}
        </div>
      );
    }

    if (exp.status === 'expiring_soon') {
      return (
        <div className="flex flex-col items-start gap-1">
          <span className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-xl text-xs font-black bg-amber-100 text-amber-800 border border-amber-300 shadow-sm">
            <Clock className="w-3.5 h-3.5 text-amber-600 shrink-0" />
            <span>{exp.label}</span>
          </span>
          {exp.dateStr && (
            <span className="text-[11px] font-mono text-amber-700 font-semibold pl-1">
              Due: {exp.dateStr}
            </span>
          )}
        </div>
      );
    }

    if (exp.status === 'healthy') {
      return (
        <div className="flex flex-col items-start gap-1">
          <span className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-xl text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
            <span>{exp.label}</span>
          </span>
          {exp.dateStr && (
            <span className="text-[11px] font-mono text-slate-500 pl-1">
              Exp: {exp.dateStr}
            </span>
          )}
        </div>
      );
    }

    return (
      <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-xl text-xs font-medium bg-slate-100 text-slate-500 border border-slate-200">
        <span>Non-perishable</span>
      </span>
    );
  };

  return (
    <div className="space-y-6">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white border-2 border-slate-200 p-6 rounded-3xl shadow-sm text-slate-900">
        <div>
          <h1 className="text-xl font-bold text-slate-900 flex items-center space-x-2 tracking-tight">
            <Package className="w-6 h-6 text-amber-500" />
            <span>Raw Ingredients & Packaging Inventory</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1 font-medium">
            Raw materials, batch expiry tracking, safety buffers & inventory management
          </p>
        </div>

        <div className="flex items-center space-x-2">
          {/* View Toggle */}
          <div className="flex items-center bg-slate-100 p-1 rounded-2xl border border-slate-200 text-xs font-bold mr-1">
            <button
              type="button"
              onClick={() => setViewMode('table')}
              className={`flex items-center space-x-1 px-3 py-1.5 rounded-xl transition-all ${
                viewMode === 'table'
                  ? 'bg-white text-indigo-700 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
              title="Table View (with Expiry Tracking column)"
            >
              <LayoutList className="w-3.5 h-3.5" />
              <span>Table</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode('grid')}
              className={`flex items-center space-x-1 px-3 py-1.5 rounded-xl transition-all ${
                viewMode === 'grid'
                  ? 'bg-white text-indigo-700 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
              title="Grid Cards View"
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span>Grid</span>
            </button>
          </div>

          <button
            id="btn-print-ingredients-hardcopy"
            type="button"
            onClick={() => setShowPrintModal(true)}
            className="flex items-center space-x-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold px-3.5 py-2.5 rounded-2xl border border-slate-200 transition-all cursor-pointer"
            title="Generate and print physical stock inventory hard copy"
          >
            <Printer className="w-4 h-4 text-slate-600" />
            <span>Print Hard Copy</span>
          </button>
          <button
            id="btn-export-ingredients-csv"
            type="button"
            onClick={handleExportIngredientsCsv}
            className="flex items-center space-x-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold px-3.5 py-2.5 rounded-2xl border border-slate-200 transition-all"
          >
            <Download className="w-4 h-4 text-slate-500" />
            <span>Export CSV</span>
          </button>
          <button
            id="btn-add-new-material"
            onClick={() => setShowAddModal(true)}
            className="flex items-center space-x-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold px-4 py-2.5 rounded-2xl shadow-sm transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Add New Material</span>
          </button>
        </div>
      </div>

      {/* KPI Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border-2 border-slate-200 p-4 rounded-2xl shadow-sm">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
            <span>Total Raw Materials</span>
            <Package className="w-4 h-4 text-amber-500" />
          </div>
          <p className="text-2xl font-black text-slate-900 font-mono mt-2">{ingredients.length}</p>
          <span className="text-[11px] text-slate-400 font-medium">Catalog items tracked</span>
        </div>

        {/* Expiring Soon Flag Card */}
        <div 
          onClick={() => setFilterExpiringSoonOnly(prev => !prev)}
          className={`p-4 rounded-2xl border-2 shadow-sm cursor-pointer transition-all ${
            filterExpiringSoonOnly
              ? 'bg-amber-100/60 border-amber-500 ring-2 ring-amber-400/40'
              : expiryMetrics.expiringCount > 0
              ? 'bg-amber-50/70 border-amber-300 hover:border-amber-400'
              : 'bg-white border-slate-200'
          }`}
        >
          <div className="flex items-center justify-between text-xs font-semibold">
            <span className={expiryMetrics.expiringCount > 0 ? 'text-amber-900 font-bold' : 'text-slate-500'}>
              Expiring in &le; 7 Days
            </span>
            <AlertTriangle className={`w-4 h-4 ${expiryMetrics.expiringCount > 0 ? 'text-amber-600' : 'text-slate-400'}`} />
          </div>
          <p className={`text-2xl font-black font-mono mt-2 ${expiryMetrics.expiringCount > 0 ? 'text-amber-700' : 'text-slate-900'}`}>
            {expiryMetrics.expiringCount}
          </p>
          <span className={`text-[11px] font-medium ${expiryMetrics.expiringCount > 0 ? 'text-amber-700 font-bold' : 'text-slate-400'}`}>
            {expiryMetrics.expiringCount > 0 
              ? `${filterExpiringSoonOnly ? 'Active filter (Click to reset)' : 'Click to filter expiring'}` 
              : 'All lots shelf-life stable'}
          </span>
        </div>

        <div className={`p-4 rounded-2xl border-2 shadow-sm ${
          expiryMetrics.belowRopCount > 0 ? 'bg-rose-50/70 border-rose-300' : 'bg-white border-slate-200'
        }`}>
          <div className="flex items-center justify-between text-xs font-semibold">
            <span className={expiryMetrics.belowRopCount > 0 ? 'text-rose-800 font-bold' : 'text-slate-500'}>Below Reorder Point</span>
            <AlertTriangle className={`w-4 h-4 ${expiryMetrics.belowRopCount > 0 ? 'text-rose-600' : 'text-slate-400'}`} />
          </div>
          <p className={`text-2xl font-black font-mono mt-2 ${expiryMetrics.belowRopCount > 0 ? 'text-rose-700' : 'text-slate-900'}`}>
            {expiryMetrics.belowRopCount}
          </p>
          <span className="text-[11px] text-slate-500 font-medium">Auto PO replenishment required</span>
        </div>

        <div className="bg-white border-2 border-slate-200 p-4 rounded-2xl shadow-sm">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
            <span>Raw Inventory Value</span>
            <DollarSign className="w-4 h-4 text-emerald-600" />
          </div>
          <p className="text-2xl font-black text-slate-900 font-mono mt-2">₱{expiryMetrics.totalValuation.toLocaleString()}</p>
          <span className="text-[11px] text-emerald-600 font-bold">Materials asset valuation</span>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="flex flex-col md:flex-row gap-3">
        {/* Search Input */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-4 top-3.5" />
          <input 
            id="input-search-raw-ingredients"
            type="text" 
            placeholder="Search raw ingredients, packaging, SKU, supplier, location..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-11 pr-10 py-3 bg-white border-2 border-slate-200 rounded-2xl text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-indigo-500 shadow-sm"
          />
          {search && (
            <button 
              onClick={() => setSearch('')}
              className="absolute right-3.5 top-3 text-slate-400 hover:text-slate-600 p-0.5 rounded-lg"
              title="Clear search"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Category Filter Pills & Expiring Flag Pill */}
        <div className="flex items-center space-x-2 overflow-x-auto pb-1 md:pb-0 scroll-smooth [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {/* Quick Flag: Expiring within 7 Days */}
          <button
            type="button"
            id="filter-expiring-within-7-days"
            onClick={() => setFilterExpiringSoonOnly(prev => !prev)}
            className={`px-3.5 py-2.5 rounded-2xl text-xs font-bold whitespace-nowrap transition-all flex items-center space-x-1.5 ${
              filterExpiringSoonOnly
                ? 'bg-amber-600 text-white shadow-sm ring-2 ring-amber-500/30'
                : 'bg-amber-50/80 border-2 border-amber-200 text-amber-800 hover:bg-amber-100'
            }`}
          >
            <AlertTriangle className={`w-3.5 h-3.5 ${filterExpiringSoonOnly ? 'text-white' : 'text-amber-600'}`} />
            <span>Expiring &le; 7 Days</span>
            <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono font-bold ${
              filterExpiringSoonOnly ? 'bg-amber-700 text-amber-100' : 'bg-amber-200/80 text-amber-900'
            }`}>
              {expiryMetrics.expiringCount}
            </span>
          </button>

          {categories.map(cat => {
            const count = cat.key === 'all' 
              ? ingredients.length 
              : ingredients.filter(i => i.category === cat.key).length;
            const isSelected = selectedCategory === cat.key;

            return (
              <button
                key={cat.key}
                id={`filter-cat-${cat.key}`}
                onClick={() => setSelectedCategory(cat.key)}
                className={`px-3.5 py-2.5 rounded-2xl text-xs font-bold whitespace-nowrap transition-all flex items-center space-x-1.5 ${
                  isSelected
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'bg-white border-2 border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                <span>{cat.label}</span>
                <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono font-bold ${
                  isSelected ? 'bg-indigo-700 text-indigo-100' : 'bg-slate-100 text-slate-600'
                }`}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Active Filter Indicators */}
      {(search || selectedCategory !== 'all' || filterExpiringSoonOnly) && (
        <div className="flex items-center justify-between text-xs text-slate-500 px-1">
          <span>
            Showing <strong className="text-slate-800 font-bold">{filtered.length}</strong> of {ingredients.length} raw materials
            {selectedCategory !== 'all' && <> in <span className="font-semibold text-indigo-600 capitalize">{selectedCategory}</span></>}
            {filterExpiringSoonOnly && <> &bull; <span className="font-semibold text-amber-700">Flagged Expiring Within 7 Days</span></>}
            {search && <> matching "<span className="font-semibold text-slate-800">{search}</span>"</>}
          </span>
          <button 
            onClick={clearFilters}
            className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 hover:underline"
          >
            Reset All Filters
          </button>
        </div>
      )}

      {/* Empty State */}
      {filtered.length === 0 && (
        <div className="bg-white border-2 border-slate-200 rounded-3xl p-12 text-center space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
            <Package className="w-6 h-6" />
          </div>
          <h3 className="font-bold text-slate-900 text-base">No matching ingredients found</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            No raw materials match your current search query or filter criteria. Try clearing or resetting your filters.
          </p>
          <button
            onClick={clearFilters}
            className="mt-2 px-4 py-2 bg-indigo-50 text-indigo-600 font-bold text-xs rounded-xl hover:bg-indigo-100 transition-colors"
          >
            Clear Filters
          </button>
        </div>
      )}

      {/* ========================================================= */}
      {/* 1. RAW INGREDIENTS TABLE (Primary View with Expiry Tracking) */}
      {/* ========================================================= */}
      {viewMode === 'table' && filtered.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center justify-between px-1">
            <div className="text-xs font-bold text-slate-700 flex items-center space-x-1.5">
              <span>Ingredients &amp; Materials Registry</span>
              <span className="text-slate-400 font-normal">({filtered.length} shown)</span>
            </div>
            <button
              id="btn-table-print-ingredients"
              type="button"
              onClick={() => setShowPrintModal(true)}
              className="inline-flex items-center space-x-1.5 text-xs font-bold text-indigo-700 hover:text-indigo-900 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 px-3 py-1.5 rounded-xl transition-all shadow-xs cursor-pointer"
              title="Generate printable stock inventory table"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print Hard Copy Table</span>
            </button>
          </div>

          <div className="overflow-x-auto border-2 border-slate-200 rounded-3xl bg-white shadow-sm">
            <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 border-b-2 border-slate-200 text-slate-700 font-extrabold text-[11px] uppercase tracking-wider">
                <th className="py-4 px-4">Material &amp; SKU</th>
                <th className="py-4 px-3">Category</th>
                <th className="py-4 px-3">Current Stock</th>
                <th className="py-4 px-3">Buffer (ROP / Safety)</th>
                <th className="py-4 px-4 bg-amber-50/50 border-x border-amber-200/80 text-amber-950 font-black">
                  <div className="flex items-center space-x-1.5">
                    <Calendar className="w-3.5 h-3.5 text-amber-600" />
                    <span>Expiry Tracking</span>
                  </div>
                </th>
                <th className="py-4 px-3">Supplier &amp; Location</th>
                <th className="py-4 px-3">Unit Cost</th>
                <th className="py-4 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map(ing => {
                const exp = getIngredientExpiryInfo(ing.expiryDate);
                const isBelowRop = ing.currentStock <= ing.reorderPoint;
                const isBelowSafety = ing.currentStock <= ing.safetyStock;

                return (
                  <tr 
                    key={ing.id}
                    className={`transition-colors hover:bg-slate-50/80 ${
                      exp.isFlagged ? 'bg-amber-50/30' : ''
                    }`}
                  >
                    {/* Material & SKU */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-start space-x-2">
                        <div>
                          <div className="font-extrabold text-slate-900 text-sm">{ing.name}</div>
                          <div className="flex items-center space-x-2 mt-0.5">
                            <span className="font-mono text-[10px] font-bold px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 border border-slate-200">
                              {ing.sku}
                            </span>
                            <span className="text-[10px] text-slate-400 font-medium">
                              Restocked: {ing.lastRestocked.split(' ')[0]}
                            </span>
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Category */}
                    <td className="py-3.5 px-3">
                      <span className="text-[10px] font-bold uppercase px-2.5 py-1 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-100">
                        {ing.category}
                      </span>
                    </td>

                    {/* Current Stock */}
                    <td className="py-3.5 px-3">
                      <div className="font-mono text-sm font-extrabold text-slate-900">
                        {ing.currentStock} {ing.unit}
                      </div>
                      {isBelowSafety ? (
                        <span className="text-[10px] font-extrabold text-rose-600 block">
                          &bull; Critical Safety Buffer!
                        </span>
                      ) : isBelowRop ? (
                        <span className="text-[10px] font-bold text-amber-600 block">
                          &bull; ROP Triggered
                        </span>
                      ) : (
                        <span className="text-[10px] text-slate-400 font-medium block">
                          Max: {ing.maxStock} {ing.unit}
                        </span>
                      )}
                    </td>

                    {/* Buffer (ROP / Safety) */}
                    <td className="py-3.5 px-3 font-mono text-xs">
                      <div className="text-slate-700">
                        <span className="text-slate-400 font-sans text-[10px] block">ROP Threshold:</span>
                        <strong className="font-bold">{ing.reorderPoint} {ing.unit}</strong>
                      </div>
                      <div className="text-slate-500 text-[10px] mt-0.5">
                        Safety: {ing.safetyStock} {ing.unit}
                      </div>
                    </td>

                    {/* EXPIRY TRACKING COLUMN (Flagged if <= 7 days) */}
                    <td className="py-3.5 px-4 bg-amber-50/20 border-x border-amber-200/60">
                      {renderExpiryBadge(exp)}
                    </td>

                    {/* Supplier & Location */}
                    <td className="py-3.5 px-3">
                      <div className="text-slate-900 font-semibold">{ing.supplier}</div>
                      <div className="text-slate-400 text-[10px] mt-0.5">{ing.location}</div>
                    </td>

                    {/* Unit Cost */}
                    <td className="py-3.5 px-3">
                      <span className="font-mono font-bold text-slate-900">₱{ing.costPerUnit}.00</span>
                      <span className="text-slate-400 text-[10px] block">/ {ing.unit}</span>
                    </td>

                    {/* Actions */}
                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => openAdjustModal(ing)}
                        className="inline-flex items-center space-x-1.5 text-xs bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-200 px-3 py-1.5 rounded-xl transition-colors font-bold shadow-sm"
                      >
                        <RefreshCw className="w-3 h-3 text-indigo-600" />
                        <span>Update</span>
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 2. RAW INGREDIENTS GRID (Card View) */}
      {/* ========================================================= */}
      {viewMode === 'grid' && filtered.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map(ing => {
            const exp = getIngredientExpiryInfo(ing.expiryDate);

            return (
              <div 
                key={ing.id} 
                className={`border-2 rounded-3xl p-6 shadow-sm space-y-4 transition-all ${
                  exp.isFlagged
                    ? 'bg-amber-50/30 border-amber-300 hover:border-amber-400'
                    : 'bg-white border-slate-200 hover:border-slate-300'
                }`}
              >
                {/* Card Header */}
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200">
                        {ing.sku}
                      </span>
                      <span className="text-[10px] font-bold uppercase px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-100">
                        {ing.category}
                      </span>
                    </div>
                    <h3 className="font-extrabold text-slate-900 text-base mt-2">{ing.name}</h3>
                    <p className="text-xs text-slate-500 mt-0.5 font-medium">{ing.location} &bull; {ing.supplier}</p>
                  </div>
                </div>

                {/* Expiry Tracking Section */}
                <div className="p-2.5 rounded-2xl bg-amber-50/50 border border-amber-200/80 flex items-center justify-between">
                  <div className="flex items-center space-x-1.5 text-xs font-bold text-slate-700">
                    <Calendar className="w-3.5 h-3.5 text-amber-600" />
                    <span>Expiry Tracking:</span>
                  </div>
                  {renderExpiryBadge(exp)}
                </div>

                {/* Stock Details */}
                <div className="grid grid-cols-2 gap-2 pt-1 border-t border-slate-100 text-xs">
                  <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                    <span className="text-[11px] text-slate-500 block font-medium">Current Stock</span>
                    <span className="font-extrabold font-mono text-sm text-slate-900">
                      {ing.currentStock} {ing.unit}
                    </span>
                  </div>
                  <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                    <span className="text-[11px] text-slate-500 block font-medium">Max Capacity</span>
                    <span className="font-extrabold font-mono text-sm text-slate-900">
                      {ing.maxStock} {ing.unit}
                    </span>
                  </div>
                  <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                    <span className="text-[11px] text-slate-500 block font-medium">Reorder Point</span>
                    <span className="font-semibold font-mono text-xs text-slate-700">
                      {ing.reorderPoint} {ing.unit}
                    </span>
                  </div>
                  <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                    <span className="text-[11px] text-slate-500 block font-medium">Safety Stock</span>
                    <span className="font-semibold font-mono text-xs text-slate-700">
                      {ing.safetyStock} {ing.unit}
                    </span>
                  </div>
                </div>

                {/* Cost and Actions */}
                <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                  <div className="text-[11px] text-slate-500 font-medium">
                    <span>Unit Cost: </span>
                    <strong className="text-slate-900 font-mono font-bold">₱{ing.costPerUnit}.00</strong>
                  </div>

                  <button
                    onClick={() => openAdjustModal(ing)}
                    className="flex items-center space-x-1.5 text-xs bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-200 px-3.5 py-1.5 rounded-xl transition-colors font-bold shadow-sm"
                  >
                    <RefreshCw className="w-3.5 h-3.5 text-indigo-600" />
                    <span>Update Stock</span>
                  </button>
                </div>

              </div>
            );
          })}
        </div>
      )}

      {/* Update Stock & Expiry Modal */}
      {stockModalItem && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white border-2 border-slate-200 rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4 text-slate-900">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-extrabold text-lg text-slate-900">Adjust Material Stock &amp; Expiry</h3>
              <button onClick={() => setStockModalItem(null)} className="text-slate-400 hover:text-slate-900">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleStockUpdate} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1">Material Name</label>
                <input type="text" disabled value={stockModalItem.name} className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs text-slate-800 font-bold" />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1">Current Stock</label>
                  <div className="px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs text-slate-700 font-mono font-bold">
                    {stockModalItem.currentStock} {stockModalItem.unit}
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1">New Stock Count</label>
                  <input
                    type="number"
                    step="any"
                    min="0"
                    value={stockAdjustQtyStr}
                    onChange={(e) => setStockAdjustQtyStr(e.target.value)}
                    placeholder="Enter stock count..."
                    className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-2xl text-xs font-mono font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              {/* Expiry Date input */}
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1 flex items-center space-x-1">
                  <Calendar className="w-3.5 h-3.5 text-amber-600" />
                  <span>Expiration Date (Shelf-Life)</span>
                </label>
                <input
                  type="date"
                  value={stockExpiryDate}
                  onChange={(e) => setStockExpiryDate(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-2xl text-xs font-mono font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
                <span className="text-[11px] text-slate-400 mt-1 block">
                  Leave empty if packaging or non-perishable material.
                </span>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1">Operational Audit Note</label>
                <input
                  type="text"
                  placeholder="e.g., Physical count verification, supplier delivery, lot verification..."
                  value={stockNotes}
                  onChange={(e) => setStockNotes(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-2xl text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="flex items-center justify-end space-x-3 pt-2">
                <button
                  type="button"
                  onClick={() => setStockModalItem(null)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow"
                >
                  Save Adjustment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add New Material Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white border-2 border-slate-200 rounded-3xl max-w-lg w-full shadow-2xl flex flex-col max-h-[90vh] overflow-hidden text-slate-900 animate-in fade-in zoom-in-95 duration-150">
            {/* Fixed Header */}
            <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4 bg-slate-50/50 shrink-0">
              <div>
                <h3 className="font-extrabold text-lg text-slate-900">Add Raw Material / Packaging</h3>
                <p className="text-xs text-slate-500">Configure ingredient specifications, reorder triggers, and shelf-life</p>
              </div>
              <button 
                onClick={() => setShowAddModal(false)} 
                className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Scrollable Form Body with internal padding and custom sleek scrollbar */}
            <form onSubmit={handleAddSubmit} id="add-raw-material-form" className="p-6 space-y-4 text-xs overflow-y-auto custom-scrollbar flex-1">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-600 mb-1">SKU / Item Code</label>
                  <input 
                    type="text" 
                    required 
                    value={addSku} 
                    onChange={e => setAddSku(e.target.value)} 
                    placeholder="e.g. ING-842"
                    className="w-full px-3 py-2 bg-slate-50 border rounded-xl font-mono focus:ring-2 focus:ring-indigo-500 focus:outline-none" 
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-600 mb-1">Category</label>
                  <select
                    value={addCategorySelect}
                    onChange={e => {
                      const val = e.target.value;
                      setAddCategorySelect(val);
                      if (val !== 'custom') {
                        setAddCategory(val);
                      } else {
                        setAddCategory(customCategory || '');
                      }
                    }}
                    className="w-full px-3 py-2 bg-white border border-indigo-200 rounded-xl font-semibold text-slate-900 focus:ring-2 focus:ring-indigo-500 focus:outline-none cursor-pointer shadow-sm text-xs"
                  >
                    <option value="milk">Milk (Raw Carabao Milk, Skim, Cream)</option>
                    <option value="packaging">Packaging (Bottles, Caps, Pouches, Labels)</option>
                    <option value="sweetener">Sweetener (Refined Sugar, Syrup)</option>
                    <option value="flavoring">Flavoring (Cocoa, Vanilla, Fruit Extracts)</option>
                    <option value="culture">Cultures (Starter, Rennet, Probiotics)</option>
                    <option value="additive">Additives & Minerals</option>
                    <option value="stabilizer">Stabilizer & Emulsifiers</option>
                    <option value="sanitizer">Sanitizer & Cleaning Agents</option>
                    <option value="custom">+ Custom Category...</option>
                  </select>
                  {addCategorySelect === 'custom' && (
                    <input
                      type="text"
                      required
                      value={customCategory}
                      onChange={e => {
                        setCustomCategory(e.target.value);
                        setAddCategory(e.target.value);
                      }}
                      placeholder="Type custom category name..."
                      className="w-full mt-1.5 px-3 py-1.5 bg-slate-50 border border-indigo-300 rounded-xl text-xs font-semibold text-slate-900 focus:ring-2 focus:ring-indigo-500 focus:outline-none shadow-sm"
                    />
                  )}
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-600 mb-1">Material / Packaging Name</label>
                <input 
                  type="text" 
                  required 
                  placeholder="e.g., Raw Carabao Milk Grade A, HDPE 200ml Bottle, Refined White Sugar..."
                  value={addName} 
                  onChange={e => setAddName(e.target.value)} 
                  className="w-full px-3.5 py-2.5 bg-slate-50 border rounded-xl font-medium focus:ring-2 focus:ring-indigo-500 focus:outline-none" 
                />
              </div>

              {/* Stock and Units */}
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-slate-600 mb-1">Initial Stock</label>
                  <input 
                    type="number" 
                    step="any"
                    min="0"
                    required 
                    value={addInitialStock} 
                    onChange={e => setAddInitialStock(e.target.value)} 
                    placeholder="100"
                    className="w-full px-3 py-2 bg-slate-50 border rounded-xl font-mono focus:ring-2 focus:ring-indigo-500 focus:outline-none" 
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-600 mb-1">Unit</label>
                  <select
                    value={addUnitSelect}
                    onChange={e => {
                      const val = e.target.value;
                      setAddUnitSelect(val);
                      if (val !== 'custom') {
                        setAddUnit(val);
                      } else {
                        setAddUnit(customUnit || '');
                      }
                    }}
                    className="w-full px-3 py-2 bg-white border border-indigo-200 rounded-xl font-semibold text-slate-900 focus:ring-2 focus:ring-indigo-500 focus:outline-none cursor-pointer shadow-sm text-xs"
                  >
                    <option value="kg">Kilograms (kg)</option>
                    <option value="L">Liters (L)</option>
                    <option value="pieces">Pieces (pcs)</option>
                    <option value="bottles">Bottles</option>
                    <option value="caps">Caps / Seals</option>
                    <option value="packs">Packs / Pouches</option>
                    <option value="grams">Grams (g)</option>
                    <option value="boxes">Boxes</option>
                    <option value="bags">Bags</option>
                    <option value="custom">+ Custom Unit...</option>
                  </select>
                  {addUnitSelect === 'custom' && (
                    <input
                      type="text"
                      required
                      value={customUnit}
                      onChange={e => {
                        setCustomUnit(e.target.value);
                        setAddUnit(e.target.value);
                      }}
                      placeholder="Type custom unit..."
                      className="w-full mt-1.5 px-3 py-1.5 bg-slate-50 border border-indigo-300 rounded-xl text-xs font-mono font-semibold text-slate-900 focus:ring-2 focus:ring-indigo-500 focus:outline-none shadow-sm"
                    />
                  )}
                </div>
                <div>
                  <label className="block font-bold text-slate-600 mb-1">Unit Cost (₱)</label>
                  <input 
                    type="number" 
                    step="any"
                    min="0"
                    required 
                    value={addUnitCost} 
                    onChange={e => setAddUnitCost(e.target.value)} 
                    placeholder="50"
                    className="w-full px-3 py-2 bg-slate-50 border rounded-xl font-mono focus:ring-2 focus:ring-indigo-500 focus:outline-none" 
                  />
                </div>
              </div>

              {/* ROP and Safety Stock Buffer */}
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-slate-600 mb-1">Safety Stock</label>
                  <input 
                    type="number" 
                    step="any"
                    min="0"
                    required 
                    value={addSafetyStock} 
                    onChange={e => setAddSafetyStock(e.target.value)} 
                    placeholder="15"
                    className="w-full px-3 py-2 bg-slate-50 border rounded-xl font-mono focus:ring-2 focus:ring-indigo-500 focus:outline-none" 
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-600 mb-1">Reorder Point</label>
                  <input 
                    type="number" 
                    step="any"
                    min="0"
                    required 
                    value={addReorderPoint} 
                    onChange={e => setAddReorderPoint(e.target.value)} 
                    placeholder="30"
                    className="w-full px-3 py-2 bg-slate-50 border rounded-xl font-mono focus:ring-2 focus:ring-indigo-500 focus:outline-none" 
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-600 mb-1">Max Capacity</label>
                  <input 
                    type="number" 
                    step="any"
                    min="0"
                    required 
                    value={addMaxStock} 
                    onChange={e => setAddMaxStock(e.target.value)} 
                    placeholder="500"
                    className="w-full px-3 py-2 bg-slate-50 border rounded-xl font-mono focus:ring-2 focus:ring-indigo-500 focus:outline-none" 
                  />
                </div>
              </div>

              {/* Expiry Date & Non-Perishable Toggle */}
              <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 space-y-2.5">
                <div className="flex items-center justify-between">
                  <label className="font-extrabold text-slate-800 flex items-center space-x-1.5">
                    <Calendar className="w-4 h-4 text-amber-600" />
                    <span>Shelf-Life & Expiration Setting</span>
                  </label>
                  
                  {/* Non-Perishable Toggle Button */}
                  <button
                    type="button"
                    onClick={() => setIsNonPerishable(!isNonPerishable)}
                    className={`px-3 py-1.5 rounded-xl text-[11px] font-extrabold transition-all flex items-center space-x-1.5 border shadow-2xs ${
                      isNonPerishable 
                        ? 'bg-emerald-600 text-white border-emerald-700' 
                        : 'bg-white text-slate-700 hover:bg-slate-100 border-slate-300'
                    }`}
                  >
                    <span>{isNonPerishable ? '✓ Non-Perishable Item' : 'Mark as Non-Perishable'}</span>
                  </button>
                </div>

                {isNonPerishable ? (
                  <div className="p-2.5 bg-emerald-50 rounded-xl border border-emerald-200 text-emerald-800 text-[11px] flex items-center space-x-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Item marked as non-perishable (e.g. bottles, caps, dry cartons). Expiration alerts will be skipped.</span>
                  </div>
                ) : (
                  <div>
                    <input 
                      type="date" 
                      value={addExpiryDate} 
                      onChange={e => setAddExpiryDate(e.target.value)} 
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl font-mono focus:ring-2 focus:ring-indigo-500 focus:outline-none text-xs" 
                    />
                    <div className="flex items-center gap-1.5 mt-2 flex-wrap">
                      <span className="text-[10px] text-slate-500 font-bold">Quick Presets:</span>
                      {[
                        { label: '+7d (Milk)', days: 7 },
                        { label: '+14d (Yogurt)', days: 14 },
                        { label: '+30d (Cheese)', days: 30 },
                        { label: '+90d (Frozen)', days: 90 },
                        { label: '+1 Year', days: 365 },
                      ].map(preset => (
                        <button
                          key={preset.days}
                          type="button"
                          onClick={() => {
                            const d = new Date(Date.now() + preset.days * 86400000);
                            setAddExpiryDate(d.toISOString().split('T')[0]);
                          }}
                          className="px-2 py-0.5 bg-white hover:bg-slate-100 border border-slate-200 rounded-lg text-[10px] font-semibold text-slate-600"
                        >
                          {preset.label}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Supplier & Storage Bay */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-600 mb-1">Primary Supplier</label>
                  <input 
                    type="text" 
                    value={addSupplier} 
                    onChange={e => setAddSupplier(e.target.value)} 
                    placeholder="e.g., PCC Local Cooperatives"
                    className="w-full px-3 py-2 bg-slate-50 border rounded-xl text-xs" 
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-600 mb-1">Storage Location / Bay</label>
                  <input 
                    type="text" 
                    value={addLocation} 
                    onChange={e => setAddLocation(e.target.value)} 
                    placeholder="e.g., Dry Bay 1, Cold Vault A"
                    className="w-full px-3 py-2 bg-slate-50 border rounded-xl text-xs" 
                  />
                </div>
              </div>
            </form>

            {/* Modal Fixed Footer */}
            <div className="flex items-center justify-end space-x-3 px-6 py-4 border-t border-slate-100 bg-slate-50/50 shrink-0">
              <button 
                type="button" 
                onClick={() => setShowAddModal(false)} 
                className="px-4 py-2 font-semibold text-slate-600 hover:bg-slate-200 rounded-xl transition-colors cursor-pointer text-xs"
              >
                Cancel
              </button>
              <button 
                type="submit" 
                form="add-raw-material-form"
                className="px-5 py-2.5 font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow cursor-pointer text-xs"
              >
                Save Material to Inventory
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Print Stock Report Hard Copy Modal */}
      {showPrintModal && (
        <PrintStockReportModal
          type="raw_ingredients"
          filteredItems={filtered}
          allItems={ingredients}
          filterSummary={
            search || selectedCategory !== 'all' || filterExpiringSoonOnly
              ? `Filtered (${filtered.length} of ${ingredients.length} items)`
              : undefined
          }
          onClose={() => setShowPrintModal(false)}
        />
      )}
    </div>
  );
};
