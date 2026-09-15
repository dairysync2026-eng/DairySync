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
  Filter,
  AlertTriangle,
  CheckCircle2,
  MapPin,
  LayoutList,
  LayoutGrid,
  TrendingDown,
  Layers,
  ChevronDown,
  Printer
} from 'lucide-react';
import { BatchExpirationWidget } from './BatchExpirationWidget';
import { PrintStockReportModal } from './PrintStockReportModal';
import { ExportMenu } from './ExportMenu';

interface FinishedGoodsProps {
  onNavigateTab?: (tab: string) => void;
}

export const FinishedGoods: React.FC<FinishedGoodsProps> = ({ onNavigateTab }) => {
  const { 
    finishedGoods, 
    updateFinishedGoodStock, 
    updateFinishedGoodSafetyStock,
    addFinishedGood
  } = useDairySync();
  
  // Search & Filter state
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedLocation, setSelectedLocation] = useState<string>('all');
  const [stockFilter, setStockFilter] = useState<'all' | 'low_stock' | 'overstock' | 'optimal'>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');

  // Modal states
  const [showAddModal, setShowAddModal] = useState(false);
  const [showPrintModal, setShowPrintModal] = useState(false);
  const [stockModalItem, setStockModalItem] = useState<FinishedGood | null>(null);
  const [adjustQtyStr, setAdjustQtyStr] = useState<string>('0');
  const [adjustSafetyStockStr, setAdjustSafetyStockStr] = useState<string>('0');
  const [notes, setNotes] = useState('');

  const openAdjustModal = (fg: FinishedGood, customNote?: string) => {
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
    recipe: [
      { ingredientId: 'ing-1', ingredientName: 'Raw Carabao Milk', quantityRequired: 30, unit: 'L' }
    ]
  });

  // Typeable string input states for adding a new Finished Good
  const [newUnitPriceStr, setNewUnitPriceStr] = useState<string>('50');
  const [newColdStorageLimitStr, setNewColdStorageLimitStr] = useState<string>('500');
  const [newInitialStockStr, setNewInitialStockStr] = useState<string>('200');
  const [newSafetyStockStr, setNewSafetyStockStr] = useState<string>('50');

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
    const lowStockCount = finishedGoods.filter(fg => fg.currentStock <= (fg.safetyStock ?? 50)).length;
    const overstockCount = finishedGoods.filter(fg => fg.currentStock >= fg.maxThreshold).length;

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
        matchStock = fg.currentStock <= safetyStockVal;
      } else if (stockFilter === 'overstock') {
        matchStock = fg.currentStock >= fg.maxThreshold;
      } else if (stockFilter === 'optimal') {
        matchStock = fg.currentStock > safetyStockVal && fg.currentStock < fg.maxThreshold;
      }

      return matchSearch && matchCategory && matchLocation && matchStock;
    });
  }, [finishedGoods, search, selectedCategory, selectedLocation, stockFilter]);

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
    if (!newFg.name) return;

    const parsedUnitPrice = Math.max(0, parseFloat(newUnitPriceStr) || 0);
    const parsedColdStorageCapacity = Math.max(1, parseFloat(newColdStorageLimitStr) || 100);
    const parsedCurrentStock = Math.max(0, parseFloat(newInitialStockStr) || 0);
    const parsedSafetyStock = Math.max(0, parseFloat(newSafetyStockStr) || 0);

    addFinishedGood({
      ...newFg,
      unitPrice: parsedUnitPrice,
      coldStorageCapacity: parsedColdStorageCapacity,
      maxThreshold: Math.round(parsedColdStorageCapacity * 0.9),
      currentStock: parsedCurrentStock,
      allocatedFeedingProgram: Math.floor(parsedCurrentStock / 2),
      allocatedRetail: Math.ceil(parsedCurrentStock / 2),
      safetyStock: parsedSafetyStock
    });

    setShowAddModal(false);
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
      recipe: [
        { ingredientId: 'ing-1', ingredientName: 'Raw Carabao Milk', quantityRequired: 30, unit: 'L' }
      ]
    });
    setNewUnitPriceStr('50');
    setNewColdStorageLimitStr('500');
    setNewInitialStockStr('200');
    setNewSafetyStockStr('50');
  };

  const handleExportFinishedGoodsCsv = () => {
    const dataToExport = filteredGoods.length > 0 ? filteredGoods : finishedGoods;
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
    const rows = dataToExport.map(fg => [
      `"${fg.sku}"`,
      `"${fg.name}"`,
      `"${fg.category}"`,
      fg.currentStock,
      fg.safetyStock ?? 50,
      fg.coldStorageCapacity,
      fg.maxThreshold,
      fg.unitPrice,
      (fg.currentStock * fg.unitPrice).toFixed(2),
      fg.allocatedFeedingProgram,
      fg.allocatedRetail,
      fg.shelfLifeDays,
      `"${fg.location}"`
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `DairySync_Cold_Storage_Inventory_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white border-2 border-slate-200 p-6 rounded-3xl shadow-sm text-slate-900">
        <div>
          <h1 className="text-xl font-bold text-slate-900 flex items-center space-x-2 tracking-tight">
            <Snowflake className="w-6 h-6 text-teal-600" />
            <span>Finished Goods &amp; Cold Storage Management</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1 font-medium">
            Cold storage vault inventory tracking, safety buffers &amp; FEFO (First-Expiry First-Out) alignment
          </p>
        </div>

        <div className="flex items-center space-x-2">
          {/* View Toggle (Grid / Table) */}
          <div className="flex items-center bg-slate-100 p-1 rounded-2xl border border-slate-200 text-xs font-bold mr-1">
            <button
              id="view-toggle-grid"
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
            <button
              id="view-toggle-table"
              type="button"
              onClick={() => setViewMode('table')}
              className={`flex items-center space-x-1 px-3 py-1.5 rounded-xl transition-all ${
                viewMode === 'table'
                  ? 'bg-white text-indigo-700 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
              title="Table View"
            >
              <LayoutList className="w-3.5 h-3.5" />
              <span>Table</span>
            </button>
          </div>

          <button
            id="btn-print-finished-goods-hardcopy"
            type="button"
            onClick={() => setShowPrintModal(true)}
            className="flex items-center space-x-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold px-3.5 py-2.5 rounded-2xl border border-slate-200 transition-all cursor-pointer"
            title="Generate and print cold storage physical inventory hard copy"
          >
            <Printer className="w-4 h-4 text-slate-600" />
          </button>
          <ExportMenu onPdf={() => setShowPrintModal(true)} onCsv={handleExportFinishedGoodsCsv} />
          <button
            id="btn-add-finished-product"
            onClick={() => setShowAddModal(true)}
            className="flex items-center space-x-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold px-4 py-2.5 rounded-2xl shadow-sm transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Add New Product</span>
          </button>
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
      <div className="space-y-3">
        <div className="flex flex-col md:flex-row gap-3">
          
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-4 top-3.5" />
            <input 
              id="input-search-cold-storage"
              type="text" 
              placeholder="Search cold storage goods, SKU, room location (e.g. Rack A, Room 1)..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-11 pr-10 py-3 bg-white border-2 border-slate-200 rounded-2xl text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-indigo-500 shadow-sm"
            />
            {search && (
              <button 
                id="btn-clear-cold-search"
                onClick={() => setSearch('')}
                className="absolute right-3.5 top-3 text-slate-400 hover:text-slate-600 p-0.5 rounded-lg"
                title="Clear search"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Location Selector */}
          <div className="relative min-w-[210px]">
            <div className="absolute left-3.5 top-3.5 pointer-events-none text-slate-400">
              <MapPin className="w-4 h-4 text-indigo-500" />
            </div>
            <select
              id="select-storage-location"
              value={selectedLocation}
              onChange={e => setSelectedLocation(e.target.value)}
              className="w-full pl-10 pr-9 py-3 bg-white border-2 border-slate-200 rounded-2xl text-xs font-bold text-slate-800 appearance-none focus:outline-none focus:border-indigo-500 shadow-sm cursor-pointer"
            >
              <option value="all">All Cold Storage Vaults</option>
              {uniqueLocations.map(loc => (
                <option key={loc} value={loc}>{loc}</option>
              ))}
            </select>
            <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3.5 top-3.5 pointer-events-none" />
          </div>

          {/* Stock Level Selector */}
          <div className="relative min-w-[190px]">
            <div className="absolute left-3.5 top-3.5 pointer-events-none text-slate-400">
              <Filter className="w-4 h-4 text-indigo-500" />
            </div>
            <select
              id="select-stock-status"
              value={stockFilter}
              onChange={e => setStockFilter(e.target.value as any)}
              className="w-full pl-10 pr-9 py-3 bg-white border-2 border-slate-200 rounded-2xl text-xs font-bold text-slate-800 appearance-none focus:outline-none focus:border-indigo-500 shadow-sm cursor-pointer"
            >
              <option value="all">All Stock Statuses</option>
              <option value="low_stock">Below Safety Buffer ({stockMetrics.lowStockCount})</option>
              <option value="overstock">Overstock Risk ({stockMetrics.overstockCount})</option>
              <option value="optimal">Optimal Stock Range</option>
            </select>
            <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3.5 top-3.5 pointer-events-none" />
          </div>

        </div>

        {/* Category Filter Pills & Quick Badges */}
        <div className="flex items-center space-x-2 overflow-x-auto pb-1 scroll-smooth [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {categories.map(cat => {
            const count = cat.key === 'all'
              ? finishedGoods.length
              : finishedGoods.filter(fg => fg.category === cat.key).length;
            const isSelected = selectedCategory === cat.key;

            return (
              <button
                key={cat.key}
                id={`filter-cat-${cat.key}`}
                type="button"
                onClick={() => setSelectedCategory(cat.key)}
                className={`px-3.5 py-2 rounded-2xl text-xs font-bold whitespace-nowrap transition-all flex items-center space-x-1.5 ${
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
          {filteredGoods.map(fg => {
            const safetyStockVal = fg.safetyStock ?? 50;
            const isLowStock = fg.currentStock <= safetyStockVal;
            const isOverstock = fg.currentStock >= fg.maxThreshold;
            const capacityPercent = Math.min(100, Math.round((fg.currentStock / fg.coldStorageCapacity) * 100));

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
                    <span className="font-mono font-bold text-slate-900">{capacityPercent}% ({fg.currentStock}/{fg.coldStorageCapacity} {fg.unit})</span>
                  </div>
                  <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden border border-slate-200">
                    <div 
                      className={`h-full transition-all duration-300 ${
                        isLowStock ? 'bg-rose-500' : isOverstock ? 'bg-amber-500' : 'bg-teal-500'
                      }`}
                      style={{ width: `${capacityPercent}%` }}
                    />
                  </div>
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
                      {fg.coldStorageCapacity} {fg.unit}
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

                  <button
                    onClick={() => openAdjustModal(fg)}
                    className="flex items-center space-x-1.5 text-xs bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-200 px-3.5 py-1.5 rounded-xl transition-colors font-bold shadow-sm"
                  >
                    <RefreshCw className="w-3.5 h-3.5 text-indigo-600" />
                    <span>Adjust Stock</span>
                  </button>
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
              {filteredGoods.map(fg => {
                const safetyStockVal = fg.safetyStock ?? 50;
                const isLowStock = fg.currentStock <= safetyStockVal;
                const isOverstock = fg.currentStock >= fg.maxThreshold;
                const capacityPercent = Math.min(100, Math.round((fg.currentStock / fg.coldStorageCapacity) * 100));

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
                        {fg.currentStock} / {fg.coldStorageCapacity} {fg.unit}
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
                      <button
                        onClick={() => openAdjustModal(fg)}
                        className="inline-flex items-center space-x-1.5 text-xs bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-200 px-3 py-1.5 rounded-xl transition-colors font-bold shadow-sm cursor-pointer"
                      >
                        <RefreshCw className="w-3 h-3 text-indigo-600" />
                        <span>Adjust</span>
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

      {/* FEFO Cold Storage Batch Expiry Tracking & Alerts */}
      <BatchExpirationWidget 
        onNavigateTab={onNavigateTab}
        onSelectColdStorageItem={handleSelectFromRadar}
      />

      {/* Adjust Stock & Safety Stock Modal */}
      {stockModalItem && (
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
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white border-2 border-slate-200 rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto text-slate-900">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-extrabold text-lg text-slate-900">Add New Finished Good</h3>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-slate-900">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddSubmit} className="space-y-4">
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
                  <label className="block text-xs font-bold text-slate-700 mb-1">Cold Storage Limit</label>
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
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Initial Stock (bottles)</label>
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
                <label className="block text-xs font-bold text-slate-500 mb-1">Storage Location Vault</label>
                <input 
                  type="text" 
                  value={newFg.location}
                  onChange={e => setNewFg({ ...newFg, location: e.target.value })}
                  placeholder="e.g. Cold Storage Room 1 - Rack A"
                  className="w-full px-3.5 py-2.5 bg-white border-2 border-slate-200 rounded-2xl text-xs text-slate-900 focus:outline-none focus:border-indigo-500 shadow-sm"
                />
              </div>

              <div className="pt-2 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-2xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-2xl shadow-md shadow-indigo-100"
                >
                  Save Product
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
