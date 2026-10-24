import React, { useState, useMemo } from 'react';
import { useDairySync } from '../context/DairySyncContext';
import { FinishedGood, ProductCategory } from '../types';
import { 
  Snowflake, 
  Plus, 
  ShoppingCart, 
  GraduationCap, 
  RefreshCw,
  X, 
  DollarSign,
  Download,
  Search,
  SlidersHorizontal,
  AlertTriangle,
  CheckCircle2,
  MapPin,
  LayoutList,
  LayoutGrid,
  TrendingDown,
  Layers,
  Pencil,
  Printer,
  Trash2
} from 'lucide-react';
import { BatchExpirationWidget } from './BatchExpirationWidget';
import { PrintStockReportModal } from './PrintStockReportModal';
import { ExportMenu } from './ExportMenu';
import { downloadCsv } from '../utils/csv';
import { usePagination } from '../hooks/usePagination';
import { TablePagination } from './TablePagination';
import { isAtOrBelowBuffer } from '../utils/inventoryThresholds';

interface FinishedGoodsProps {
  onNavigateTab?: (tab: string) => void;
}

export const FinishedGoods: React.FC<FinishedGoodsProps> = ({ onNavigateTab }) => {
  const { 
    finishedGoods, 
    updateFinishedGoodStock, 
    updateFinishedGoodSafetyStock,
    addFinishedGood,
    updateFinishedGoodRecord,
    currentRole,
    isDeveloperActive,
    deleteFinishedGoodRecord
  } = useDairySync();
  const isDirectorReadOnly = currentRole === 'director';
  const canDeleteRecords = isDeveloperActive && currentRole === 'developer';

  const handleDeleteFinishedGood = (product: FinishedGood) => {
    if (!window.confirm(`Delete ${product.name} (${product.sku}) from Cold Storage? This removes the product record only; related sales and commitments will remain.`)) return;
    if (!deleteFinishedGoodRecord(product.id)) {
      window.alert('The finished good could not be deleted. Confirm you are signed in as the Lead Developer and try again.');
    }
  };
  
  // Search & Filter state
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedLocation, setSelectedLocation] = useState<string>('all');
  const [stockFilter, setStockFilter] = useState<'all' | 'low_stock' | 'overstock' | 'optimal'>('all');
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');

  // Modal states
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingFinishedGood, setEditingFinishedGood] = useState<FinishedGood | null>(null);
  const [showPrintModal, setShowPrintModal] = useState(false);
  const [stockModalItem, setStockModalItem] = useState<FinishedGood | null>(null);
  const [adjustQtyStr, setAdjustQtyStr] = useState<string>('0');
  const [adjustSafetyStockStr, setAdjustSafetyStockStr] = useState<string>('0');
  const [notes, setNotes] = useState('');

  const openAdjustModal = (fg: FinishedGood, customNote?: string) => {
    if (isDirectorReadOnly) return;
    setStockModalItem(fg);
    setAdjustQtyStr(String(fg.currentStock));
    setAdjustSafetyStockStr(String(fg.safetyStock ?? 50));
    setNotes(customNote || '');
  };

  const handleSelectFromRadar = (skuOrName: string, batchNumber?: string) => {
    const cleanSearch = (skuOrName || '').toLowerCase().trim();
    const found = finishedGoods.find(fg => 
      fg.sku.toLowerCase().includes(cleanSearch) || 
      fg.name.toLowerCase().includes(cleanSearch) ||
      cleanSearch.includes(fg.name.toLowerCase())
    ) || finishedGoods[0];

    if (found) {
      openAdjustModal(found, `FEFO Expiration Review for ${batchNumber || skuOrName}`);
    }
  };

  // Form state for new finished good
  const [newFg, setNewFg] = useState<Omit<FinishedGood, 'id'>>({
    sku: 'FG-' + Math.floor(100 + Math.random() * 900),
    name: '',
    category: 'fresh_milk',
    currentStock: 200,
    safetyStock: 50,
    unit: 'bottles',
    coldStorageCapacity: 500,
    maxThreshold: 450,
    unitPrice: 50,
    allocatedFeedingProgram: 100,
    allocatedRetail: 100,
    batchUnitQuantity: 100,
    shelfLifeDays: 14,
    location: 'Cold Storage Room 1 - Rack A',
    recipe: []
  });

  // Typeable string input states for adding a new Finished Good
  const [newUnitPriceStr, setNewUnitPriceStr] = useState<string>('50');
  const [newColdStorageLimitStr, setNewColdStorageLimitStr] = useState<string>('500');
  const [newInitialStockStr, setNewInitialStockStr] = useState<string>('200');
  const [newSafetyStockStr, setNewSafetyStockStr] = useState<string>('50');
  const [coldStorageLimitNotApplicable, setColdStorageLimitNotApplicable] = useState(false);
  const [storageLocationNotApplicable, setStorageLocationNotApplicable] = useState(false);

  const resetFinishedGoodDraft = () => {
    setNewFg({
      sku: 'FG-' + Math.floor(100 + Math.random() * 900),
      name: '',
      category: 'fresh_milk',
      currentStock: 200,
      safetyStock: 50,
      unit: 'bottles',
      coldStorageCapacity: 500,
      maxThreshold: 450,
      unitPrice: 50,
      allocatedFeedingProgram: 100,
      allocatedRetail: 100,
      batchUnitQuantity: 100,
      shelfLifeDays: 14,
      location: 'Cold Storage Room 1 - Rack A',
      recipe: []
    });
    setNewUnitPriceStr('50');
    setNewColdStorageLimitStr('500');
    setColdStorageLimitNotApplicable(false);
    setStorageLocationNotApplicable(false);
    setNewInitialStockStr('200');
    setNewSafetyStockStr('50');
  };

  // Category definitions
  const categories: { key: string; label: string }[] = [
    { key: 'all', label: 'All Categories' },
    { key: 'fresh_milk', label: 'Fresh Milk' },
    { key: 'flavored_milk', label: 'Flavored Milk' },
    { key: 'cultured', label: 'Cultured / Yogurt' },
    { key: 'cheese', label: 'Cheese' },
    { key: 'confectionery', label: 'Confectionery' },
  ];

  // Dynamic unique locations from current inventory
  const uniqueLocations = useMemo(() => {
    const locs = Array.from(new Set(finishedGoods.map(fg => fg.location).filter(Boolean)));
    return locs.sort();
  }, [finishedGoods]);

  // Stock status counts
  const stockMetrics = useMemo(() => {
    const totalUnits = finishedGoods.reduce((sum, fg) => sum + fg.currentStock, 0);
    const totalValuation = finishedGoods.reduce((sum, fg) => sum + (fg.currentStock * fg.unitPrice), 0);
    const lowStockCount = finishedGoods.filter(fg => isAtOrBelowBuffer(fg.currentStock, fg.safetyStock ?? 50)).length;
    const overstockCount = finishedGoods.filter(fg => fg.maxThreshold > 0 && fg.currentStock >= fg.maxThreshold).length;

    return {
      totalUnits,
      totalValuation,
      lowStockCount,
      overstockCount
    };
  }, [finishedGoods]);

  // Filtered Finished Goods
  const filteredGoods = useMemo(() => {
    return finishedGoods.filter(fg => {
      // 1. Search Query
      const query = search.toLowerCase().trim();
      const matchSearch = !query || 
        fg.name.toLowerCase().includes(query) ||
        fg.sku.toLowerCase().includes(query) ||
        fg.location.toLowerCase().includes(query) ||
        fg.category.toLowerCase().includes(query);

      // 2. Category Filter
      const matchCategory = selectedCategory === 'all' || fg.category === selectedCategory;

      // 3. Storage Location Filter
      const matchLocation = selectedLocation === 'all' || fg.location === selectedLocation;

      // 4. Stock Level Filter
      const safetyStockVal = fg.safetyStock ?? 50;
      let matchStock = true;
      if (stockFilter === 'low_stock') {
        matchStock = isAtOrBelowBuffer(fg.currentStock, safetyStockVal);
      } else if (stockFilter === 'overstock') {
        matchStock = fg.maxThreshold > 0 && fg.currentStock >= fg.maxThreshold;
      } else if (stockFilter === 'optimal') {
        matchStock = !isAtOrBelowBuffer(fg.currentStock, safetyStockVal) &&
          (fg.maxThreshold <= 0 || fg.currentStock < fg.maxThreshold);
      }

      return matchSearch && matchCategory && matchLocation && matchStock;
    });
  }, [finishedGoods, search, selectedCategory, selectedLocation, stockFilter]);
  const pagination = usePagination(filteredGoods);

  const hasActiveFilters = search !== '' || selectedCategory !== 'all' || selectedLocation !== 'all' || stockFilter !== 'all';

  const clearAllFilters = () => {
    setSearch('');
    setSelectedCategory('all');
    setSelectedLocation('all');
    setStockFilter('all');
  };

  const handleStockUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!stockModalItem) return;
    const finalQty = Math.max(0, parseFloat(adjustQtyStr) || 0);
    const finalSafety = Math.max(0, parseFloat(adjustSafetyStockStr) || 0);
    updateFinishedGoodStock(stockModalItem.id, finalQty, notes);
    if (finalSafety !== stockModalItem.safetyStock) {
      updateFinishedGoodSafetyStock(stockModalItem.id, finalSafety);
    }
    setStockModalItem(null);
    setNotes('');
  };

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFg.name.trim()) return;

    const parsedUnitPrice = Math.max(0, parseFloat(newUnitPriceStr) || 0);
    const parsedColdStorageCapacity = coldStorageLimitNotApplicable
      ? 0
      : Math.max(1, parseFloat(newColdStorageLimitStr) || 100);
    const parsedCurrentStock = Math.max(0, parseFloat(newInitialStockStr) || 0);
    const parsedSafetyStock = Math.max(0, parseFloat(newSafetyStockStr) || 0);

    const productData: Omit<FinishedGood, 'id'> = {
      ...newFg,
      location: storageLocationNotApplicable ? 'N/A' : newFg.location,
      unitPrice: parsedUnitPrice,
      coldStorageCapacity: parsedColdStorageCapacity,
      maxThreshold: Math.round(parsedColdStorageCapacity * 0.9),
      currentStock: parsedCurrentStock,
      allocatedFeedingProgram: Math.floor(parsedCurrentStock / 2),
      allocatedRetail: Math.ceil(parsedCurrentStock / 2),
      safetyStock: parsedSafetyStock
    };

    if (editingFinishedGood) {
      const updatedProduct: FinishedGood = {
        ...productData,
        id: editingFinishedGood.id,
        sku: newFg.sku.trim(),
        name: newFg.name.trim(),
        allocatedFeedingProgram: editingFinishedGood.allocatedFeedingProgram,
        allocatedRetail: editingFinishedGood.allocatedRetail,
      };
      if (!updateFinishedGoodRecord(updatedProduct)) {
        window.alert('The finished good could not be updated. Confirm you are signed in as the Lead Developer and check the entered values.');
        return;
      }
      setEditingFinishedGood(null);
    } else {
      addFinishedGood(productData);
    }

    setShowAddModal(false);
    resetFinishedGoodDraft();
  };

  const openEditFinishedGood = (product: FinishedGood) => {
    if (!canDeleteRecords) return;
    setEditingFinishedGood(product);
    setNewFg({ ...product });
    setNewUnitPriceStr(String(product.unitPrice));
    setNewColdStorageLimitStr(String(product.coldStorageCapacity));
    setNewInitialStockStr(String(product.currentStock));
    setNewSafetyStockStr(String(product.safetyStock ?? 0));
    setColdStorageLimitNotApplicable(product.coldStorageCapacity <= 0);
    setStorageLocationNotApplicable(product.location.trim().toLowerCase() === 'n/a');
    setShowAddModal(true);
  };

  const closeProductForm = () => {
    setShowAddModal(false);
    setEditingFinishedGood(null);
  };

  const handleExportFinishedGoodsCsv = () => {
    const headers = [
      'SKU',
      'Name',
      'Category',
      'Current Stock',
      'Safety Stock',
      'Cold Storage Capacity',
      'Max Threshold',
      'Unit Price (PHP)',
      'Total Value (PHP)',
      'DepEd Feeding Allocation',
      'Dairy Box Retail Allocation',
      'Shelf Life Days',
      'Storage Location'
    ];
    const rows = filteredGoods.map(fg => [
      fg.sku,
      fg.name,
      fg.category,
      fg.currentStock,
      fg.safetyStock ?? 50,
      fg.coldStorageCapacity,
      fg.maxThreshold,
      fg.unitPrice,
      (fg.currentStock * fg.unitPrice).toFixed(2),
      fg.allocatedFeedingProgram,
      fg.allocatedRetail,
      fg.shelfLifeDays,
      fg.location
    ]);
    downloadCsv(`DairySync_Cold_Storage_Inventory_${new Date().toISOString().split('T')[0]}.csv`, headers, rows);
  };

  return (
    <div className="space-y-6">
      
      {/* Top Header */}
      <div className="flex flex-col gap-4 bg-white border-2 border-slate-200 p-5 sm:p-6 rounded-3xl shadow-sm text-slate-900">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 flex items-center space-x-2 tracking-tight">
            <Snowflake className="w-6 h-6 text-teal-600" />
            <span>Finished Goods &amp; Cold Storage Management</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 font-medium">
            Cold storage vault inventory tracking, safety buffers &amp; FEFO (First-Expiry First-Out) alignment
          </p>
          {isDirectorReadOnly && <span className="mt-2 inline-flex rounded-full border border-amber-200 bg-amber-50 px-2.5 py-1 text-[10px] font-bold text-amber-800">Director / PMO · Read only</span>}
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
            <div className="flex items-center rounded-2xl border border-slate-200 bg-slate-100 p-1 text-xs font-bold">
              <button
                id="view-toggle-table"
                type="button"
                onClick={() => setViewMode('table')}
                className={`flex items-center space-x-1 rounded-xl px-3 py-1.5 transition-all ${
                  viewMode === 'table'
                    ? 'bg-white text-indigo-700 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
                title="Table View"
              >
                <LayoutList className="w-3.5 h-3.5" />
                <span>Table</span>
              </button>
              <button
                id="view-toggle-grid"
                type="button"
                onClick={() => setViewMode('grid')}
                className={`flex items-center space-x-1 rounded-xl px-3 py-1.5 transition-all ${
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
              id="btn-print-finished-goods-hardcopy"
              type="button"
              onClick={() => setShowPrintModal(true)}
              className="flex h-11 w-11 items-center justify-center rounded-2xl border border-slate-200 bg-slate-100 text-slate-700 shadow-sm transition-all hover:bg-slate-200"
              title="Generate and print cold storage physical inventory hard copy"
              aria-label="Print cold storage inventory report"
            >
              <Printer className="h-4 w-4" />
            </button>
          {!isDirectorReadOnly && (
            <button
              id="btn-add-finished-product"
              onClick={() => {
                setEditingFinishedGood(null);
                resetFinishedGoodDraft();
                setShowAddModal(true);
              }}
              className="flex min-h-11 items-center justify-center space-x-2 rounded-2xl bg-indigo-600 px-4 py-2.5 text-xs font-bold text-white shadow-sm transition-all hover:bg-indigo-700"
            >
              <Plus className="w-4 h-4" />
              <span>Add New Product</span>
            </button>
          )}
          <ExportMenu
            onPdf={() => setShowPrintModal(true)}
            onCsv={handleExportFinishedGoodsCsv}
            className="flex h-11 items-center justify-center space-x-1.5 rounded-2xl border border-indigo-500 bg-indigo-600 px-4 text-xs font-bold text-white shadow-sm transition-all hover:bg-indigo-700"
          />
        </div>
      </div>

      {/* Summary KPI Cards with Quick Filter Triggers */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div 
          onClick={() => {
            setStockFilter('all');
            setSelectedCategory('all');
          }}
          className={`bg-white border-2 p-4 rounded-2xl shadow-sm cursor-pointer transition-all hover:border-slate-300 ${
            stockFilter === 'all' && selectedCategory === 'all' ? 'border-slate-300' : 'border-slate-200'
          }`}
        >
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
            <span>Total Cold Inventory</span>
            <Snowflake className="w-4 h-4 text-teal-600" />
          </div>
          <p className="text-2xl font-black text-slate-900 font-mono mt-2">{stockMetrics.totalUnits.toLocaleString()}</p>
          <span className="text-[11px] text-slate-400 font-medium">Across {finishedGoods.length} finished goods</span>
        </div>

        <div className="bg-white border-2 border-slate-200 p-4 rounded-2xl shadow-sm">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
            <span>Finished Goods Value</span>
            <DollarSign className="w-4 h-4 text-emerald-600" />
          </div>
          <p className="text-2xl font-black text-slate-900 font-mono mt-2">₱{stockMetrics.totalValuation.toLocaleString()}</p>
          <span className="text-[11px] text-emerald-600 font-bold">Cold Vault Stock Asset</span>
        </div>

        {/* Low Stock Filter Card */}
        <div 
          onClick={() => setStockFilter(prev => prev === 'low_stock' ? 'all' : 'low_stock')}
          className={`p-4 rounded-2xl border-2 shadow-sm cursor-pointer transition-all ${
            stockFilter === 'low_stock'
              ? 'bg-rose-100/70 border-rose-500 ring-2 ring-rose-400/40'
              : stockMetrics.lowStockCount > 0
              ? 'bg-rose-50/70 border-rose-300 hover:border-rose-400'
              : 'bg-white border-slate-200'
          }`}
        >
          <div className="flex items-center justify-between text-xs font-semibold">
            <span className={stockMetrics.lowStockCount > 0 ? 'text-rose-900 font-bold' : 'text-slate-500'}>
              Below Safety Buffer
            </span>
            <AlertTriangle className={`w-4 h-4 ${stockMetrics.lowStockCount > 0 ? 'text-rose-600' : 'text-slate-400'}`} />
          </div>
          <p className={`text-2xl font-black font-mono mt-2 ${stockMetrics.lowStockCount > 0 ? 'text-rose-700' : 'text-slate-900'}`}>
            {stockMetrics.lowStockCount}
          </p>
          <span className={`text-[11px] font-medium ${stockMetrics.lowStockCount > 0 ? 'text-rose-700 font-bold' : 'text-slate-400'}`}>
            {stockMetrics.lowStockCount > 0 
              ? (stockFilter === 'low_stock' ? 'Active filter (Click to reset)' : 'Click to filter low stock')
              : 'All products above buffer'}
          </span>
        </div>

        {/* Overstock Filter Card */}
        <div 
          onClick={() => setStockFilter(prev => prev === 'overstock' ? 'all' : 'overstock')}
          className={`p-4 rounded-2xl border-2 shadow-sm cursor-pointer transition-all ${
            stockFilter === 'overstock'
              ? 'bg-amber-100/70 border-amber-500 ring-2 ring-amber-400/40'
              : stockMetrics.overstockCount > 0
              ? 'bg-amber-50/70 border-amber-300 hover:border-amber-400'
              : 'bg-white border-slate-200'
          }`}
        >
          <div className="flex items-center justify-between text-xs font-semibold">
            <span className={stockMetrics.overstockCount > 0 ? 'text-amber-900 font-bold' : 'text-slate-500'}>
              Overstock Risk
            </span>
            <TrendingDown className={`w-4 h-4 ${stockMetrics.overstockCount > 0 ? 'text-amber-600' : 'text-slate-400'}`} />
          </div>
          <p className={`text-2xl font-black font-mono mt-2 ${stockMetrics.overstockCount > 0 ? 'text-amber-700' : 'text-slate-900'}`}>
            {stockMetrics.overstockCount}
          </p>
          <span className={`text-[11px] font-medium ${stockMetrics.overstockCount > 0 ? 'text-amber-700 font-bold' : 'text-slate-400'}`}>
            {stockMetrics.overstockCount > 0 
              ? (stockFilter === 'overstock' ? 'Active filter (Click to reset)' : 'Click to filter overstock')
              : 'Within vault safety limits'}
          </span>
        </div>
      </div>

      {/* ========================================================= */}
      {/* SEARCH AND FILTER BAR CONTROLS FOR COLD STORAGE */}
      {/* ========================================================= */}
      <div className="space-y-0 rounded-3xl border-2 border-slate-200 bg-white p-4 shadow-sm sm:p-6">
        <div className="flex flex-col gap-3 sm:flex-row">
          <div className="relative min-w-0 flex-1">
            <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input 
              id="input-search-cold-storage"
              type="text" 
              placeholder="Search cold storage goods, SKU, room location (e.g. Rack A, Room 1)..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full rounded-2xl border-2 border-slate-200 bg-slate-50 py-2.5 pl-10 pr-10 text-xs text-slate-900 placeholder-slate-400 transition-colors focus:border-indigo-500 focus:bg-white focus:outline-none sm:text-sm"
            />
            {search && (
              <button 
                id="btn-clear-cold-search"
                type="button"
                onClick={() => setSearch('')}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 rounded-lg p-0.5 text-slate-400 hover:text-slate-600"
                title="Clear search"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              id="btn-finished-goods-filters"
              aria-expanded={isFiltersOpen}
              onClick={() => setIsFiltersOpen(open => !open)}
              className={`flex items-center justify-center space-x-2 rounded-2xl border px-4 py-2.5 text-xs font-bold transition-all ${
                isFiltersOpen || selectedCategory !== 'all' || selectedLocation !== 'all' || stockFilter !== 'all'
                  ? 'border-indigo-300 bg-indigo-50 text-indigo-700'
                  : 'border-slate-200 bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              <SlidersHorizontal className="h-4 w-4" />
              <span>Filters</span>
              {(selectedCategory !== 'all' || selectedLocation !== 'all' || stockFilter !== 'all') && (
                <span className="h-2 w-2 animate-pulse rounded-full bg-indigo-600" />
              )}
            </button>
            {hasActiveFilters && (
              <button
                id="btn-reset-cold-filters"
                type="button"
                onClick={clearAllFilters}
                className="rounded-2xl border border-slate-200 px-3 py-2.5 text-xs font-bold text-slate-500 transition-colors hover:bg-rose-50 hover:text-rose-600"
                title="Reset all filters"
              >
                Reset
              </button>
            )}
          </div>
        </div>
        {isFiltersOpen && (
          <div className="mt-4 grid grid-cols-1 gap-3 border-t-2 border-slate-100 pt-4 animate-in fade-in duration-150 sm:grid-cols-2 lg:grid-cols-4">
            <div>
              <label htmlFor="select-finished-category-filter" className="mb-1 block text-[10px] font-extrabold uppercase tracking-wider text-slate-500">
                Category
              </label>
              <select
                id="select-finished-category-filter"
                value={selectedCategory}
                onChange={event => setSelectedCategory(event.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-medium text-slate-800 focus:border-indigo-500 focus:outline-none"
              >
                {categories.map(category => {
                  const count = category.key === 'all'
                    ? finishedGoods.length
                    : finishedGoods.filter(product => product.category === category.key).length;
                  return <option key={category.key} value={category.key}>{category.label} ({count})</option>;
                })}
              </select>
            </div>
            <div>
              <label htmlFor="select-storage-location" className="mb-1 block text-[10px] font-extrabold uppercase tracking-wider text-slate-500">
                Storage Location
              </label>
              <select
                id="select-storage-location"
                value={selectedLocation}
                onChange={event => setSelectedLocation(event.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-medium text-slate-800 focus:border-indigo-500 focus:outline-none"
              >
                <option value="all">All Cold Storage Vaults</option>
                {uniqueLocations.map(location => <option key={location} value={location}>{location}</option>)}
              </select>
            </div>
            <div>
              <label htmlFor="select-stock-status" className="mb-1 block text-[10px] font-extrabold uppercase tracking-wider text-slate-500">
                Stock Status
              </label>
              <select
                id="select-stock-status"
                value={stockFilter}
                onChange={event => setStockFilter(event.target.value as typeof stockFilter)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-medium text-slate-800 focus:border-indigo-500 focus:outline-none"
              >
                <option value="all">All Stock Statuses</option>
                <option value="low_stock">Below Safety Buffer ({stockMetrics.lowStockCount})</option>
                <option value="overstock">Overstock Risk ({stockMetrics.overstockCount})</option>
                <option value="optimal">Optimal Stock Range</option>
              </select>
            </div>
          </div>
        )}
      </div>

      {/* Active Filter Indicators */}
      {hasActiveFilters && (
        <div className="flex items-center justify-between text-xs text-slate-500 px-1 bg-slate-100/70 p-3 rounded-2xl border border-slate-200">
          <div className="flex items-center flex-wrap gap-1.5">
            <span className="font-semibold text-slate-700">Active filters:</span>
            
            {search && (
              <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-xl bg-white border border-slate-200 text-slate-800 font-bold text-[11px]">
                <span>Query: "{search}"</span>
                <button onClick={() => setSearch('')} className="hover:text-rose-600 ml-1">
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}

            {selectedCategory !== 'all' && (
              <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-xl bg-indigo-50 border border-indigo-200 text-indigo-800 font-bold text-[11px]">
                <span>Category: {categories.find(c => c.key === selectedCategory)?.label}</span>
                <button onClick={() => setSelectedCategory('all')} className="hover:text-indigo-950 ml-1">
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}

            {selectedLocation !== 'all' && (
              <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-xl bg-teal-50 border border-teal-200 text-teal-800 font-bold text-[11px]">
                <span>Vault: {selectedLocation}</span>
                <button onClick={() => setSelectedLocation('all')} className="hover:text-teal-950 ml-1">
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}

            {stockFilter !== 'all' && (
              <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 font-bold text-[11px]">
                <span>Status: {stockFilter === 'low_stock' ? 'Below Safety Buffer' : stockFilter === 'overstock' ? 'Overstock Risk' : 'Optimal'}</span>
                <button onClick={() => setStockFilter('all')} className="hover:text-amber-950 ml-1">
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}

            <span className="text-slate-400 mx-1">&bull;</span>
            <span className="font-bold text-slate-800">{filteredGoods.length} products found</span>
          </div>

          <button 
            id="btn-reset-cold-filters"
            type="button"
            onClick={clearAllFilters}
            className="text-xs font-bold text-indigo-600 hover:text-indigo-800 hover:underline shrink-0 ml-2"
          >
            Reset All Filters
          </button>
        </div>
      )}

      {/* Empty State when no results match search or filters */}
      {filteredGoods.length === 0 && (
        <div className="bg-white border-2 border-slate-200 rounded-3xl p-12 text-center space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-teal-50 text-teal-600 flex items-center justify-center mx-auto border border-teal-200">
            <Snowflake className="w-6 h-6" />
          </div>
          <h3 className="font-bold text-slate-900 text-base">No matching cold storage products found</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto font-medium">
            No finished goods matched your search term or filter criteria. Try adjusting your search query, location vault, or category filter.
          </p>
          <button
            type="button"
            onClick={clearAllFilters}
            className="mt-2 px-4 py-2 bg-indigo-50 text-indigo-600 font-bold text-xs rounded-xl hover:bg-indigo-100 transition-colors"
          >
            Clear All Filters
          </button>
        </div>
      )}

      {/* ========================================================= */}
      {/* 1. FINISHED GOODS GRID VIEW */}
      {/* ========================================================= */}
      {viewMode === 'grid' && filteredGoods.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {pagination.pageItems.map(fg => {
            const safetyStockVal = fg.safetyStock ?? 50;
            const isLowStock = isAtOrBelowBuffer(fg.currentStock, safetyStockVal);
            const isOverstock = fg.maxThreshold > 0 && fg.currentStock >= fg.maxThreshold;
            const capacityPercent = fg.coldStorageCapacity > 0
              ? Math.min(100, Math.round((fg.currentStock / fg.coldStorageCapacity) * 100))
              : 0;

            return (
              <div 
                key={fg.id}
                className={`border-2 bg-white rounded-3xl p-6 shadow-sm space-y-4 transition-all ${
                  isLowStock 
                    ? 'border-rose-300 hover:border-rose-400 bg-rose-50/20' 
                    : isOverstock
                    ? 'border-amber-300 hover:border-amber-400 bg-amber-50/20'
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                {/* Card Header */}
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200">
                        {fg.sku}
                      </span>
                      <span className="text-[10px] font-bold uppercase px-2.5 py-0.5 rounded-full bg-teal-50 text-teal-700 border border-teal-100">
                        {fg.category.replace('_', ' ')}
                      </span>
                    </div>
                    <h3 className="font-extrabold text-slate-900 text-base mt-2">{fg.name}</h3>
                    <div className="flex items-center space-x-1.5 text-xs text-slate-500 mt-1 font-medium">
                      <MapPin className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                      <span>{fg.location}</span>
                    </div>
                  </div>

                  {/* Stock Status Badge */}
                  {isLowStock ? (
                    <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-xl text-[10px] font-extrabold uppercase bg-rose-100 text-rose-700 border border-rose-300 shrink-0">
                      <AlertTriangle className="w-3 h-3" />
                      <span>Low Buffer</span>
                    </span>
                  ) : isOverstock ? (
                    <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-xl text-[10px] font-extrabold uppercase bg-amber-100 text-amber-800 border border-amber-300 shrink-0">
                      <TrendingDown className="w-3 h-3" />
                      <span>Overstock</span>
                    </span>
                  ) : (
                    <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-xl text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 shrink-0">
                      <CheckCircle2 className="w-3 h-3" />
                      <span>Healthy</span>
                    </span>
                  )}
                </div>

                {/* Cold Storage Capacity Utilization Bar */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-[11px] font-semibold text-slate-600">
                    <span>Vault Utilization</span>
                    <span className="font-mono font-bold text-slate-900">
                      {fg.coldStorageCapacity > 0
                        ? `${capacityPercent}% (${fg.currentStock}/${fg.coldStorageCapacity} ${fg.unit})`
                        : `${fg.currentStock} ${fg.unit} · Capacity N/A`}
                    </span>
                  </div>
                  {fg.coldStorageCapacity > 0 && <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden border border-slate-200">
                    <div 
                      className={`h-full transition-all duration-300 ${
                        isLowStock ? 'bg-rose-500' : isOverstock ? 'bg-amber-500' : 'bg-teal-500'
                      }`}
                      style={{ width: `${capacityPercent}%` }}
                    />
                  </div>}
                </div>

                {/* Stock Details Matrix */}
                <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100 text-xs">
                  <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                    <span className="text-[11px] text-slate-500 block font-medium">Cold Stock</span>
                    <span className="font-extrabold font-mono text-sm text-slate-900">
                      {fg.currentStock} {fg.unit}
                    </span>
                  </div>
                  <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                    <span className="text-[11px] text-slate-500 block font-medium">Vault Capacity</span>
                    <span className="font-extrabold font-mono text-sm text-slate-900">
                      {fg.coldStorageCapacity > 0 ? `${fg.coldStorageCapacity} ${fg.unit}` : 'N/A'}
                    </span>
                  </div>
                  <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                    <span className="text-[11px] text-slate-500 block font-medium">Safety Buffer</span>
                    <span className="font-semibold font-mono text-xs text-slate-700">
                      {safetyStockVal} {fg.unit}
                    </span>
                  </div>
                  <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                    <span className="text-[11px] text-slate-500 block font-medium">Max Safe Limit</span>
                    <span className="font-semibold font-mono text-xs text-slate-700">
                      {fg.maxThreshold} {fg.unit}
                    </span>
                  </div>
                </div>

                {/* Allocation Split (Feeding Program vs Dairy Box Retail) */}
                <div className="grid grid-cols-2 gap-2 p-3 rounded-2xl bg-slate-50 border border-slate-200 text-xs">
                  <div className="flex items-center space-x-2">
                    <GraduationCap className="w-4 h-4 text-blue-600 shrink-0" />
                    <div>
                      <span className="text-[10px] text-slate-400 font-bold block uppercase">DepEd Feeding</span>
                      <strong className="text-slate-900 font-mono font-bold">{fg.allocatedFeedingProgram} {fg.unit}</strong>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2 border-l border-slate-200 pl-2">
                    <ShoppingCart className="w-4 h-4 text-purple-600 shrink-0" />
                    <div>
                      <span className="text-[10px] text-slate-400 font-bold block uppercase">Dairy Box Retail</span>
                      <strong className="text-slate-900 font-mono font-bold">{fg.allocatedRetail} {fg.unit}</strong>
                    </div>
                  </div>
                </div>

                {/* Price & Actions */}
                <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                  <div className="text-[11px] text-slate-500 font-medium">
                    <span>Price: </span>
                    <strong className="text-emerald-600 font-mono text-xs font-bold">₱{fg.unitPrice}.00</strong>
                    <span className="text-slate-400 ml-1.5 font-mono text-[10px]">({fg.shelfLifeDays}d FEFO)</span>
                  </div>

                  <div className="flex items-center gap-2">
                  {canDeleteRecords && (
                    <button
                      type="button"
                      onClick={() => openEditFinishedGood(fg)}
                      aria-label={`Edit ${fg.name}`}
                      title="Edit finished good details and stock"
                      className="flex items-center space-x-1.5 text-xs bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 px-3.5 py-1.5 rounded-xl transition-colors font-bold shadow-sm"
                    >
                      <Pencil className="w-3.5 h-3.5" />
                      <span>Edit</span>
                    </button>
                  )}
                  {!isDirectorReadOnly && (
                    <button
                      onClick={() => openAdjustModal(fg)}
                      className="flex items-center space-x-1.5 text-xs bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-200 px-3.5 py-1.5 rounded-xl transition-colors font-bold shadow-sm"
                    >
                      <RefreshCw className="w-3.5 h-3.5 text-indigo-600" />
                      <span>Adjust Stock</span>
                    </button>
                  )}
                  {canDeleteRecords && (
                    <button
                      type="button"
                      onClick={() => handleDeleteFinishedGood(fg)}
                      aria-label={`Delete ${fg.name}`}
                      title="Delete finished good record"
                      className="inline-flex items-center justify-center rounded-xl border border-rose-200 bg-rose-50 p-2 text-rose-700 hover:bg-rose-100"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  )}
                  </div>
                </div>

              </div>
            );
          })}
        </div>
      )}

      {/* ========================================================= */}
      {/* 2. FINISHED GOODS TABLE VIEW */}
      {/* ========================================================= */}
      {viewMode === 'table' && filteredGoods.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center justify-between px-1">
            <div className="text-xs font-bold text-slate-700 flex items-center space-x-1.5">
              <span>Finished Goods Cold Vault Registry</span>
              <span className="text-slate-400 font-normal">({filteredGoods.length} shown)</span>
            </div>
            <button
              id="btn-table-print-finished-goods"
              type="button"
              onClick={() => setShowPrintModal(true)}
              className="inline-flex items-center space-x-1.5 text-xs font-bold text-indigo-700 hover:text-indigo-900 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 px-3 py-1.5 rounded-xl transition-all shadow-xs cursor-pointer"
              title="Generate printable cold storage stock inventory table"
            >
              <Printer className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="overflow-x-auto border-2 border-slate-200 rounded-3xl bg-white shadow-sm">
            <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 border-b-2 border-slate-200 text-slate-700 font-extrabold text-[11px] uppercase tracking-wider">
                <th className="py-4 px-4">Product &amp; SKU</th>
                <th className="py-4 px-3">Category</th>
                <th className="py-4 px-3">Storage Location</th>
                <th className="py-4 px-3">Cold Stock / Capacity</th>
                <th className="py-4 px-3">Safety Buffer</th>
                <th className="py-4 px-3">Allocation (DepEd / Retail)</th>
                <th className="py-4 px-3">Price &amp; Shelf Life</th>
                <th className="py-4 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {pagination.pageItems.map(fg => {
                const safetyStockVal = fg.safetyStock ?? 50;
                const isLowStock = isAtOrBelowBuffer(fg.currentStock, safetyStockVal);
                const isOverstock = fg.maxThreshold > 0 && fg.currentStock >= fg.maxThreshold;
                const capacityPercent = fg.coldStorageCapacity > 0
                  ? Math.min(100, Math.round((fg.currentStock / fg.coldStorageCapacity) * 100))
                  : 0;

                return (
                  <tr 
                    key={fg.id}
                    className={`transition-colors hover:bg-slate-50/80 ${
                      isLowStock ? 'bg-rose-50/25' : isOverstock ? 'bg-amber-50/25' : ''
                    }`}
                  >
                    {/* Product & SKU */}
                    <td className="py-3.5 px-4">
                      <div className="font-extrabold text-slate-900 text-sm">{fg.name}</div>
                      <div className="flex items-center space-x-2 mt-0.5">
                        <span className="font-mono text-[10px] font-bold px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 border border-slate-200">
                          {fg.sku}
                        </span>
                        {isLowStock ? (
                          <span className="text-[10px] font-extrabold text-rose-600">
                            &bull; Low Stock Alert
                          </span>
                        ) : isOverstock ? (
                          <span className="text-[10px] font-extrabold text-amber-600">
                            &bull; Overstock Limit
                          </span>
                        ) : null}
                      </div>
                    </td>

                    {/* Category */}
                    <td className="py-3.5 px-3">
                      <span className="text-[10px] font-bold uppercase px-2.5 py-1 rounded-full bg-teal-50 text-teal-700 border border-teal-100">
                        {fg.category.replace('_', ' ')}
                      </span>
                    </td>

                    {/* Storage Location */}
                    <td className="py-3.5 px-3">
                      <div className="flex items-center space-x-1 font-semibold text-slate-900">
                        <MapPin className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                        <span>{fg.location}</span>
                      </div>
                    </td>

                    {/* Cold Stock / Capacity */}
                    <td className="py-3.5 px-3">
                      <div className="font-mono text-xs font-bold text-slate-900">
                        {fg.coldStorageCapacity > 0
                          ? `${fg.currentStock} / ${fg.coldStorageCapacity} ${fg.unit}`
                          : `${fg.currentStock} ${fg.unit} / N/A capacity`}
                      </div>
                      <div className="w-28 h-1.5 bg-slate-100 rounded-full overflow-hidden border border-slate-200 mt-1">
                        <div 
                          className={`h-full ${
                            isLowStock ? 'bg-rose-500' : isOverstock ? 'bg-amber-500' : 'bg-teal-500'
                          }`}
                          style={{ width: `${capacityPercent}%` }}
                        />
                      </div>
                    </td>

                    {/* Safety Buffer */}
                    <td className="py-3.5 px-3 font-mono text-xs">
                      <span className={`font-bold ${isLowStock ? 'text-rose-600' : 'text-slate-700'}`}>
                        {safetyStockVal} {fg.unit}
                      </span>
                      <span className="text-slate-400 text-[10px] block">Max: {fg.maxThreshold}</span>
                    </td>

                    {/* Allocation */}
                    <td className="py-3.5 px-3 text-[11px]">
                      <div className="text-slate-700">
                        <span className="text-blue-600 font-bold">DepEd:</span> {fg.allocatedFeedingProgram} {fg.unit}
                      </div>
                      <div className="text-slate-700 mt-0.5">
                        <span className="text-purple-600 font-bold">Retail:</span> {fg.allocatedRetail} {fg.unit}
                      </div>
                    </td>

                    {/* Price & Shelf Life */}
                    <td className="py-3.5 px-3">
                      <span className="font-mono font-bold text-emerald-600">₱{fg.unitPrice}.00</span>
                      <span className="text-slate-400 text-[10px] block">{fg.shelfLifeDays}d Shelf Life</span>
                    </td>

                    {/* Actions */}
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex justify-end gap-2">
                      {canDeleteRecords && (
                        <button
                          type="button"
                          onClick={() => openEditFinishedGood(fg)}
                          aria-label={`Edit ${fg.name}`}
                          title="Edit finished good details and stock"
                          className="inline-flex items-center space-x-1.5 text-xs bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 px-3 py-1.5 rounded-xl transition-colors font-bold shadow-sm"
                        >
                          <Pencil className="w-3 h-3" />
                          <span>Edit</span>
                        </button>
                      )}
                      {!isDirectorReadOnly && (
                        <button
                          onClick={() => openAdjustModal(fg)}
                          className="inline-flex items-center space-x-1.5 text-xs bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-200 px-3 py-1.5 rounded-xl transition-colors font-bold shadow-sm cursor-pointer"
                        >
                          <RefreshCw className="w-3 h-3 text-indigo-600" />
                          <span>Adjust</span>
                        </button>
                      )}
                      {canDeleteRecords && (
                        <button
                          type="button"
                          onClick={() => handleDeleteFinishedGood(fg)}
                          aria-label={`Delete ${fg.name}`}
                          title="Delete finished good record"
                          className="inline-flex items-center justify-center rounded-xl border border-rose-200 bg-rose-50 p-2 text-rose-700 hover:bg-rose-100"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          </div>
        </div>
      )}

      {filteredGoods.length > 0 && (
        <div className="rounded-2xl border border-slate-200 bg-white">
          <TablePagination
            totalItems={filteredGoods.length}
            pageIndex={pagination.pageIndex}
            pageSize={pagination.pageSize}
            pageCount={pagination.pageCount}
            onPageChange={pagination.setPageIndex}
            onPageSizeChange={pagination.setPageSize}
          />
        </div>
      )}

      {/* FEFO Cold Storage Batch Expiry Tracking & Alerts */}
      <BatchExpirationWidget 
        onNavigateTab={onNavigateTab}
        onSelectColdStorageItem={handleSelectFromRadar}
      />

      {/* Adjust Stock & Safety Stock Modal */}
      {stockModalItem && !isDirectorReadOnly && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white border-2 border-slate-200 rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4 text-slate-900">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="font-extrabold text-lg text-slate-900">Adjust Cold Storage Stock &amp; Buffer</h3>
                <p className="text-xs text-slate-500 font-medium">Reconcile physical inventory and update safety stock</p>
              </div>
              <button onClick={() => setStockModalItem(null)} className="text-slate-400 hover:text-slate-900">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleStockUpdate} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1">Product Name &amp; SKU</label>
                <div className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs text-slate-800 font-bold flex items-center justify-between">
                  <span>{stockModalItem.name}</span>
                  <span className="font-mono text-slate-400 text-[11px]">{stockModalItem.sku}</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                {/* Current Stock Count */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Current Stock Count</label>
                  <input
                    type="number"
                    step="any"
                    min="0"
                    required
                    value={adjustQtyStr}
                    onChange={e => setAdjustQtyStr(e.target.value)}
                    placeholder="e.g. 250"
                    className="w-full px-3.5 py-2.5 bg-white border-2 border-indigo-500 rounded-2xl text-xs text-slate-900 font-mono font-extrabold focus:outline-none focus:ring-2 focus:ring-indigo-200 shadow-sm"
                  />
                  <div className="flex items-center gap-1 mt-1.5 flex-wrap">
                    {[
                      { label: '+10', add: 10 },
                      { label: '+50', add: 50 },
                      { label: '+100', add: 100 },
                      { label: '-10', add: -10 }
                    ].map((btn, i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => {
                          const curr = parseFloat(adjustQtyStr) || 0;
                          setAdjustQtyStr(String(Math.max(0, curr + btn.add)));
                        }}
                        className="px-1.5 py-0.5 bg-slate-100 hover:bg-slate-200 border border-slate-200 rounded text-[10px] font-mono font-bold text-slate-700"
                      >
                        {btn.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Safety Stock Buffer */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Safety Stock Buffer</label>
                  <input 
                    type="number" 
                    step="any"
                    min="0"
                    required
                    value={adjustSafetyStockStr}
                    onChange={e => setAdjustSafetyStockStr(e.target.value)}
                    placeholder="e.g. 50"
                    className="w-full px-3.5 py-2.5 bg-white border-2 border-slate-300 rounded-2xl text-xs text-slate-900 font-mono font-extrabold focus:outline-none focus:border-indigo-500 shadow-sm"
                  />
                  <div className="flex items-center gap-1 mt-1.5 flex-wrap">
                    {[25, 50, 100, 150].map((presetVal) => (
                      <button
                        key={presetVal}
                        type="button"
                        onClick={() => setAdjustSafetyStockStr(String(presetVal))}
                        className="px-1.5 py-0.5 bg-slate-100 hover:bg-slate-200 border border-slate-200 rounded text-[10px] font-mono font-bold text-slate-700"
                      >
                        {presetVal}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1">Ledger / Cold Storage Audit Note</label>
                <input
                  type="text"
                  placeholder="e.g. Audit reconciliation, physical count or buffer update"
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-white border-2 border-slate-200 rounded-2xl text-xs text-slate-900 focus:outline-none focus:border-indigo-500 shadow-sm"
                />
              </div>

              <div className="pt-2 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setStockModalItem(null)}
                  className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-2xl cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-2xl shadow-md shadow-indigo-100 cursor-pointer"
                >
                  Save Stock &amp; Buffer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Product Modal */}
      {(showAddModal || (editingFinishedGood && canDeleteRecords)) && !isDirectorReadOnly && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white border-2 border-slate-200 rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto text-slate-900">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-extrabold text-lg text-slate-900">
                {editingFinishedGood ? 'Update Finished Good' : 'Add New Finished Good'}
              </h3>
              <button onClick={closeProductForm} className="text-slate-400 hover:text-slate-900">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddSubmit} className="space-y-4">
              {editingFinishedGood && (
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1">SKU / Item Code</label>
                  <input
                    type="text"
                    required
                    value={newFg.sku}
                    onChange={e => setNewFg({ ...newFg, sku: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-white border-2 border-slate-200 rounded-2xl text-xs text-slate-900 font-mono focus:outline-none focus:border-indigo-500 shadow-sm"
                  />
                </div>
              )}
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1">Product Title *</label>
                <input 
                  type="text" 
                  required
                  placeholder="e.g. Carabao Milk Ice Cream 100ml"
                  value={newFg.name}
                  onChange={e => setNewFg({ ...newFg, name: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-white border-2 border-slate-200 rounded-2xl text-xs text-slate-900 focus:outline-none focus:border-indigo-500 shadow-sm"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Unit Price (₱)</label>
                  <input 
                    type="number" 
                    step="any"
                    min="0"
                    required
                    value={newUnitPriceStr}
                    onChange={e => setNewUnitPriceStr(e.target.value)}
                    placeholder="e.g. 50"
                    className="w-full px-3.5 py-2.5 bg-white border-2 border-slate-200 rounded-2xl text-xs text-slate-900 font-mono font-bold focus:outline-none focus:border-indigo-500 shadow-sm"
                  />
                </div>
                <div>
                  <div className="mb-1 flex items-center justify-between gap-1">
                    <label className="block text-xs font-bold text-slate-700">Cold Storage Limit</label>
                    <button
                      type="button"
                      aria-pressed={coldStorageLimitNotApplicable}
                      onClick={() => setColdStorageLimitNotApplicable(value => !value)}
                      className="rounded-md border border-slate-300 bg-white px-1.5 py-0.5 text-[9px] font-bold text-slate-600 hover:bg-slate-100"
                    >
                      {coldStorageLimitNotApplicable ? 'Set value' : 'N/A'}
                    </button>
                  </div>
                  {coldStorageLimitNotApplicable ? (
                    <div className="rounded-2xl border-2 border-slate-200 bg-slate-100 px-3.5 py-2.5 text-xs font-semibold text-slate-500">N/A</div>
                  ) : (
                    <input
                      type="number"
                      step="any"
                      min="1"
                      required
                      value={newColdStorageLimitStr}
                      onChange={e => setNewColdStorageLimitStr(e.target.value)}
                      placeholder="e.g. 500"
                      className="w-full px-3.5 py-2.5 bg-white border-2 border-slate-200 rounded-2xl text-xs text-slate-900 font-mono font-bold focus:outline-none focus:border-indigo-500 shadow-sm"
                    />
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    {editingFinishedGood ? 'Current Stock' : 'Initial Stock'} ({newFg.unit})
                  </label>
                  <input 
                    type="number" 
                    step="any"
                    min="0"
                    required
                    value={newInitialStockStr}
                    onChange={e => setNewInitialStockStr(e.target.value)}
                    placeholder="e.g. 200"
                    className="w-full px-3.5 py-2.5 bg-white border-2 border-slate-200 rounded-2xl text-xs text-slate-900 font-mono font-bold focus:outline-none focus:border-indigo-500 shadow-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Safety Stock Buffer (bottles)</label>
                  <input 
                    type="number" 
                    step="any"
                    min="0"
                    required
                    value={newSafetyStockStr}
                    onChange={e => setNewSafetyStockStr(e.target.value)}
                    placeholder="e.g. 50"
                    className="w-full px-3.5 py-2.5 bg-white border-2 border-slate-200 rounded-2xl text-xs text-slate-900 font-mono font-bold focus:outline-none focus:border-indigo-500 shadow-sm"
                  />
                </div>
              </div>

              <div>
                <div className="mb-1 flex items-center justify-between gap-2">
                  <label className="block text-xs font-bold text-slate-500">Storage Location Vault</label>
                  <button
                    type="button"
                    aria-pressed={storageLocationNotApplicable}
                    onClick={() => setStorageLocationNotApplicable(value => !value)}
                    className="rounded-md border border-slate-300 bg-white px-2 py-1 text-[10px] font-bold text-slate-600 hover:bg-slate-100"
                  >
                    {storageLocationNotApplicable ? 'Set location' : 'N/A'}
                  </button>
                </div>
                {storageLocationNotApplicable ? (
                  <div className="rounded-2xl border-2 border-slate-200 bg-slate-100 px-3.5 py-2.5 text-xs font-semibold text-slate-500">N/A</div>
                ) : (
                  <input
                    type="text"
                    value={newFg.location}
                    onChange={e => setNewFg({ ...newFg, location: e.target.value })}
                    placeholder="e.g. Cold Storage Room 1 - Rack A"
                    className="w-full px-3.5 py-2.5 bg-white border-2 border-slate-200 rounded-2xl text-xs text-slate-900 focus:outline-none focus:border-indigo-500 shadow-sm"
                  />
                )}
              </div>

              <div className="pt-2 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={closeProductForm}
                  className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-2xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-2xl shadow-md shadow-indigo-100"
                >
                  {editingFinishedGood ? 'Save Changes' : 'Save Product'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Print Stock Report Hard Copy Modal */}
      {showPrintModal && (
        <PrintStockReportModal
          type="cold_storage"
          filteredItems={filteredGoods}
          allItems={finishedGoods}
          filterSummary={
            hasActiveFilters
              ? `Filtered (${filteredGoods.length} of ${finishedGoods.length} goods)`
              : undefined
          }
          onClose={() => setShowPrintModal(false)}
        />
      )}
    </div>
  );
};
