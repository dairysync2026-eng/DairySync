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
  Pencil,
  Printer,
  MapPin,
  Filter,
  SlidersHorizontal,
  ChevronDown,
  Trash2
} from 'lucide-react';
import { PrintStockReportModal } from './PrintStockReportModal';
import { ExportMenu } from './ExportMenu';
import { downloadCsv } from '../utils/csv';
import { usePagination } from '../hooks/usePagination';
import { TablePagination } from './TablePagination';
import { isAtOrBelowBuffer } from '../utils/inventoryThresholds';

export interface ExpiryInfo {
  dateStr?: string;
  daysRemaining: number | null;
  status: 'expired' | 'critical' | 'expiring_soon' | 'healthy' | 'non_perishable';
  label: string;
  isFlagged: boolean; // Flagged if expiring within next 7 days or already expired
}

const STANDARD_INGREDIENT_CATEGORIES = ['milk', 'sweetener', 'flavoring', 'packaging', 'additive', 'culture', 'stabilizer', 'sanitizer'];
const STANDARD_INGREDIENT_UNITS = ['l', 'kg', 'pieces', 'grams', 'packs', 'bottles', 'boxes', 'bags', 'caps', 'labels', 'rolls', 'sachets'];

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
    updateIngredientRecord,
    updateIngredientStock,
    currentRole,
    isDeveloperActive,
    deleteIngredientRecord
  } = useDairySync();
  const isDirectorReadOnly = currentRole === 'director';
  const canDeleteRecords = isDeveloperActive && currentRole === 'developer';

  const handleDeleteIngredient = (ingredient: RawIngredient) => {
    if (!window.confirm(`Delete ${ingredient.name} (${ingredient.sku}) from Raw Ingredients? This removes the ingredient record only; related history will remain.`)) return;
    if (!deleteIngredientRecord(ingredient.id)) {
      window.alert('The ingredient could not be deleted. Confirm you are signed in as the Lead Developer and try again.');
    }
  };

  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [isCategoryFilterOpen, setIsCategoryFilterOpen] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState('all');
  const [stockFilter, setStockFilter] = useState<'all' | 'low_stock' | 'overstock' | 'optimal'>('all');
  const [filterExpiringSoonOnly, setFilterExpiringSoonOnly] = useState<boolean>(false);
  const [viewMode, setViewMode] = useState<'table' | 'grid'>('table');

  const [showAddModal, setShowAddModal] = useState(false);
  const [editingIngredient, setEditingIngredient] = useState<RawIngredient | null>(null);
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
  const [unitCostNotApplicable, setUnitCostNotApplicable] = useState(false);
  const [addSafetyStock, setAddSafetyStock] = useState('15');
  const [addReorderPoint, setAddReorderPoint] = useState('30');
  const [addMaxStock, setAddMaxStock] = useState('500');
  const [maxStockNotApplicable, setMaxStockNotApplicable] = useState(false);
  const [isNonPerishable, setIsNonPerishable] = useState(false);
  const [addExpiryDate, setAddExpiryDate] = useState(new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0]);
  const [addSupplier, setAddSupplier] = useState('PCC Local Cooperatives');
  const [addLocation, setAddLocation] = useState('Dry Storage Bay 1');

  const resetMaterialDraft = () => {
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
    setUnitCostNotApplicable(false);
    setAddSafetyStock('15');
    setAddReorderPoint('30');
    setAddMaxStock('500');
    setMaxStockNotApplicable(false);
    setIsNonPerishable(false);
    setAddExpiryDate(new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0]);
    setAddSupplier('PCC Local Cooperatives');
    setAddLocation('Dry Storage Bay 1');
  };

  // Dynamic available categories across inventory
  const availableCategories = useMemo(() => {
    const current = ingredients
      .map(ingredient => ingredient.category.trim().toLowerCase())
      .filter(Boolean);
    const defaultCategories = STANDARD_INGREDIENT_CATEGORIES;
    return Array.from(new Set([...defaultCategories, ...current]));
  }, [ingredients]);
  const customCategories = useMemo(
    () => availableCategories.filter(category => !STANDARD_INGREDIENT_CATEGORIES.includes(category)),
    [availableCategories]
  );

  // Dynamic available units
  const availableUnits = useMemo(() => {
    const defaultUnits = ['L', 'kg', 'pieces', 'grams', 'packs', 'bottles', 'boxes', 'bags', 'caps', 'labels', 'rolls', 'sachets'];
    const current = ingredients.map(ingredient => ingredient.unit.trim()).filter(Boolean);
    return Array.from(
      new Map([...defaultUnits, ...current].map(unit => [unit.toLowerCase(), unit])).values()
    );
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
        list.push({ key: cat, label: cat.replace(/_/g, ' ').replace(/\b\w/g, character => character.toUpperCase()) });
      }
    });
    return list;
  }, [availableCategories]);

  const uniqueLocations = useMemo(
    () => Array.from(new Set(ingredients.map(ingredient => ingredient.location).filter(Boolean))).sort(),
    [ingredients]
  );

  const stockMetrics = useMemo(() => ({
    lowStockCount: ingredients.filter(ingredient => isAtOrBelowBuffer(ingredient.currentStock, ingredient.safetyStock)).length,
    overstockCount: ingredients.filter(ingredient => ingredient.maxStock > 0 && ingredient.currentStock >= ingredient.maxStock).length,
  }), [ingredients]);

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
    const belowRopCount = ingredients.filter(i => isAtOrBelowBuffer(i.currentStock, i.reorderPoint)).length;

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
      const matchCategory = selectedCategory === 'all' || i.category.trim().toLowerCase() === selectedCategory;
      const matchLocation = selectedLocation === 'all' || i.location === selectedLocation;
      const isLowStock = isAtOrBelowBuffer(i.currentStock, i.safetyStock);
      const isOverstock = i.maxStock > 0 && i.currentStock >= i.maxStock;
      const matchStock = stockFilter === 'all' ||
        (stockFilter === 'low_stock' && isLowStock) ||
        (stockFilter === 'overstock' && isOverstock) ||
        (stockFilter === 'optimal' && !isLowStock && !isOverstock);
      
      const expInfo = getIngredientExpiryInfo(i.expiryDate);
      const matchExpiring = !filterExpiringSoonOnly || expInfo.isFlagged;

      return matchSearch && matchCategory && matchLocation && matchStock && matchExpiring;
    });
  }, [ingredients, search, selectedCategory, selectedLocation, stockFilter, filterExpiringSoonOnly]);
  const pagination = usePagination(filtered);

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!addName.trim()) return;

    const ingredientData = {
      sku: addSku.trim() || ('ING-' + Math.floor(100 + Math.random() * 900)),
      name: addName.trim(),
      category: (addCategory.trim().toLowerCase() || 'milk') as IngredientCategory,
      unit: (addUnit.trim() || 'kg') as RawIngredient['unit'],
      currentStock: parseFloat(addInitialStock) || 0,
      costPerUnit: unitCostNotApplicable ? 0 : (parseFloat(addUnitCost) || 0),
      safetyStock: parseFloat(addSafetyStock) || 0,
      reorderPoint: parseFloat(addReorderPoint) || 0,
      maxStock: maxStockNotApplicable ? 0 : (parseFloat(addMaxStock) || 500),
      avgDailyConsumption: 5,
      leadTimeDays: 3,
      supplier: addSupplier.trim() || 'PCC Local Cooperatives',
      location: addLocation.trim() || 'Dry Storage Bay 1',
      lastRestocked: new Date().toLocaleDateString() + ' PST',
      expiryDate: isNonPerishable ? undefined : (addExpiryDate || undefined)
    };

    if (editingIngredient) {
      const updatedIngredient: RawIngredient = {
        ...editingIngredient,
        ...ingredientData,
        avgDailyConsumption: editingIngredient.avgDailyConsumption,
        leadTimeDays: editingIngredient.leadTimeDays,
        lastRestocked: editingIngredient.lastRestocked,
      };
      if (!updateIngredientRecord(updatedIngredient)) {
        window.alert('The raw material could not be updated. Confirm you are signed in as the Lead Developer and check the entered values.');
        return;
      }
      setEditingIngredient(null);
    } else {
      addIngredient(ingredientData);
    }
    setShowAddModal(false);

    resetMaterialDraft();
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

  const openEditIngredient = (item: RawIngredient) => {
    if (!canDeleteRecords) return;
    setEditingIngredient(item);
    setAddSku(item.sku);
    setAddName(item.name);
    setAddCategory(item.category);
    const normalizedCategory = item.category.trim().toLowerCase();
    const hasCategoryOption = availableCategories.includes(normalizedCategory);
    setAddCategorySelect(hasCategoryOption ? normalizedCategory : 'custom');
    setCustomCategory(hasCategoryOption ? '' : item.category);
    setAddUnit(item.unit);
    const isStandardUnit = STANDARD_INGREDIENT_UNITS.includes(item.unit.trim().toLowerCase());
    setAddUnitSelect(isStandardUnit ? item.unit : 'custom');
    setCustomUnit(isStandardUnit ? '' : item.unit);
    setAddInitialStock(String(item.currentStock));
    setAddUnitCost(String(item.costPerUnit));
    setUnitCostNotApplicable(item.costPerUnit === 0);
    setAddSafetyStock(String(item.safetyStock));
    setAddReorderPoint(String(item.reorderPoint));
    setAddMaxStock(String(item.maxStock));
    setMaxStockNotApplicable(item.maxStock === 0);
    setIsNonPerishable(!item.expiryDate);
    setAddExpiryDate(item.expiryDate || '');
    setAddSupplier(item.supplier);
    setAddLocation(item.location);
    setShowAddModal(true);
  };

  const closeMaterialForm = () => {
    setShowAddModal(false);
    setEditingIngredient(null);
  };

  const handleExportIngredientsCsv = () => {
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
    const rows = filtered.map(i => {
      const exp = getIngredientExpiryInfo(i.expiryDate);
      return [
        i.sku,
        i.name,
        i.category,
        i.currentStock,
        i.unit,
        i.reorderPoint,
        i.safetyStock,
        i.maxStock > 0 ? i.maxStock : 'N/A',
        i.expiryDate || 'N/A',
        exp.label,
        i.costPerUnit > 0 ? i.costPerUnit : 'N/A',
        (i.currentStock * i.costPerUnit).toFixed(2),
        i.supplier,
        i.location,
        i.lastRestocked
      ];
    });
    downloadCsv(`DairySync_Raw_Ingredients_${new Date().toISOString().split('T')[0]}.csv`, headers, rows);
  };

  const clearFilters = () => {
    setSearch('');
    setSelectedCategory('all');
    setSelectedLocation('all');
    setStockFilter('all');
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
      <div className="flex flex-col gap-4 bg-white border-2 border-slate-200 p-5 sm:p-6 rounded-3xl shadow-sm text-slate-900">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 flex items-center space-x-2 tracking-tight">
            <Package className="w-6 h-6 text-amber-500" />
            <span>Raw Ingredients & Packaging Inventory</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 font-medium">
            Raw materials, batch expiry tracking, safety buffers & inventory management
          </p>
          {isDirectorReadOnly && <span className="mt-2 inline-flex rounded-full border border-amber-200 bg-amber-50 px-2.5 py-1 text-[10px] font-bold text-amber-800">Director / PMO · Read only</span>}
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
            <div className="flex items-center rounded-2xl border border-slate-200 bg-slate-100 p-1 text-xs font-bold">
              <button
                type="button"
                onClick={() => setViewMode('table')}
                className={`flex items-center space-x-1 rounded-xl px-3 py-1.5 transition-all ${
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
              id="btn-print-ingredients-hardcopy"
              type="button"
              onClick={() => setShowPrintModal(true)}
              className="flex h-11 w-11 items-center justify-center rounded-2xl border border-slate-200 bg-slate-100 text-slate-700 shadow-sm transition-all hover:bg-slate-200"
              title="Generate and print physical stock inventory hard copy"
              aria-label="Print inventory report"
            >
              <Printer className="h-4 w-4" />
            </button>
          {!isDirectorReadOnly && (
            <button
              id="btn-add-new-material"
              onClick={() => {
                setEditingIngredient(null);
                resetMaterialDraft();
                setShowAddModal(true);
              }}
              className="flex min-h-11 items-center justify-center space-x-2 rounded-2xl bg-indigo-600 px-4 py-2.5 text-xs font-bold text-white shadow-sm transition-all hover:bg-indigo-700"
            >
              <Plus className="w-4 h-4" />
              <span>Add New Material</span>
            </button>
          )}
          <ExportMenu
            onPdf={() => setShowPrintModal(true)}
            onCsv={handleExportIngredientsCsv}
            className="flex h-11 items-center justify-center space-x-1.5 rounded-2xl border border-indigo-500 bg-indigo-600 px-4 text-xs font-bold text-white shadow-sm transition-all hover:bg-indigo-700"
          />
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
      <div className="space-y-0 rounded-3xl border-2 border-slate-200 bg-white p-4 shadow-sm sm:p-6">
        <div className="flex flex-col gap-3 sm:flex-row">
          <div className="relative flex-1 min-w-0">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              id="input-search-raw-ingredients"
              type="text"
              placeholder="Search raw materials, SKU, supplier, location..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full rounded-2xl border-2 border-slate-200 bg-slate-50 py-2.5 pl-10 pr-10 text-xs text-slate-900 placeholder-slate-400 transition-colors focus:border-indigo-500 focus:bg-white focus:outline-none sm:text-sm"
            />
            {search && (
              <button
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
              id="btn-raw-category-filter"
              aria-expanded={isCategoryFilterOpen}
              onClick={() => setIsCategoryFilterOpen(open => !open)}
              className={`flex items-center justify-center space-x-2 rounded-2xl border px-4 py-2.5 text-xs font-bold transition-all ${
                isCategoryFilterOpen || selectedCategory !== 'all' || selectedLocation !== 'all' || stockFilter !== 'all' || filterExpiringSoonOnly
                  ? 'border-indigo-300 bg-indigo-50 text-indigo-700'
                  : 'border-slate-200 bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              <SlidersHorizontal className="h-4 w-4" />
              <span>Filters</span>
              {(selectedCategory !== 'all' || selectedLocation !== 'all' || stockFilter !== 'all' || filterExpiringSoonOnly) && (
                <span className="h-2 w-2 animate-pulse rounded-full bg-indigo-600" />
              )}
            </button>
            {(search || selectedCategory !== 'all' || selectedLocation !== 'all' || stockFilter !== 'all' || filterExpiringSoonOnly) && (
              <button
                type="button"
                onClick={clearFilters}
                className="rounded-2xl border border-slate-200 px-3 py-2.5 text-xs font-bold text-slate-500 transition-colors hover:bg-rose-50 hover:text-rose-600"
                title="Reset all filters"
              >
                Reset
              </button>
            )}
          </div>
        </div>
        {isCategoryFilterOpen && (
          <div className="mt-4 grid grid-cols-1 gap-3 border-t-2 border-slate-100 pt-4 animate-in fade-in duration-150 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <label htmlFor="select-raw-category-filter" className="mb-1 block text-[10px] font-extrabold uppercase tracking-wider text-slate-500">
              Category
            </label>
            <select
              id="select-raw-category-filter"
              value={selectedCategory}
              onChange={event => setSelectedCategory(event.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-medium text-slate-800 focus:border-indigo-500 focus:outline-none"
            >
              {categories.map(category => {
                const count = category.key === 'all'
                  ? ingredients.length
                  : ingredients.filter(ingredient => ingredient.category.trim().toLowerCase() === category.key).length;
                return (
                  <option key={category.key} value={category.key}>
                    {category.label} ({count})
                  </option>
                );
              })}
            </select>
          </div>
          <div>
            <label htmlFor="select-raw-storage-location" className="mb-1 block text-[10px] font-extrabold uppercase tracking-wider text-slate-500">
              Storage Location
            </label>
            <select
              id="select-raw-storage-location"
              value={selectedLocation}
              onChange={event => setSelectedLocation(event.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-medium text-slate-800 focus:border-indigo-500 focus:outline-none"
            >
              <option value="all">All Storage Locations</option>
              {uniqueLocations.map(location => <option key={location} value={location}>{location}</option>)}
            </select>
          </div>
          <div>
            <label htmlFor="select-raw-stock-status" className="mb-1 block text-[10px] font-extrabold uppercase tracking-wider text-slate-500">
              Stock Status
            </label>
            <select
              id="select-raw-stock-status"
              value={stockFilter}
              onChange={event => setStockFilter(event.target.value as typeof stockFilter)}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-medium text-slate-800 focus:border-indigo-500 focus:outline-none"
            >
              <option value="all">All Stock Statuses</option>
              <option value="low_stock">Below Safety Stock ({stockMetrics.lowStockCount})</option>
              <option value="overstock">At or Above Max Stock ({stockMetrics.overstockCount})</option>
              <option value="optimal">Optimal Stock Range</option>
            </select>
          </div>
          <div className="flex items-end">
            <button
              type="button"
              id="filter-expiring-within-7-days"
              aria-pressed={filterExpiringSoonOnly}
              onClick={() => setFilterExpiringSoonOnly(prev => !prev)}
              className={`flex h-[34px] w-full items-center justify-between gap-2 rounded-xl border px-3 text-xs font-medium transition-all ${
                filterExpiringSoonOnly
                  ? 'border-amber-300 bg-amber-100 text-amber-800'
                  : 'border-slate-200 bg-slate-50 text-slate-700 hover:bg-amber-50'
              }`}
            >
              <span>Expiring &le; 7 Days</span>
              <span className="rounded-full bg-amber-200/80 px-1.5 py-0.2 text-[10px] font-mono font-bold text-amber-900">
                {expiryMetrics.expiringCount}
              </span>
            </button>
          </div>
          </div>
        )}
      </div>

      {/* Active Filter Indicators */}
      {(search || selectedCategory !== 'all' || selectedLocation !== 'all' || stockFilter !== 'all' || filterExpiringSoonOnly) && (
        <div className="flex items-center justify-between text-xs text-slate-500 px-1">
          <span>
            Showing <strong className="text-slate-800 font-bold">{filtered.length}</strong> of {ingredients.length} raw materials
            {selectedCategory !== 'all' && <> in <span className="font-semibold text-indigo-600 capitalize">{selectedCategory}</span></>}
            {selectedLocation !== 'all' && <> at <span className="font-semibold text-indigo-600">{selectedLocation}</span></>}
            {stockFilter !== 'all' && <> &bull; <span className="font-semibold text-indigo-600">{stockFilter === 'low_stock' ? 'Below Safety Stock' : stockFilter === 'overstock' ? 'At or Above Max Stock' : 'Optimal Stock Range'}</span></>}
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
              {pagination.pageItems.map(ing => {
                const exp = getIngredientExpiryInfo(ing.expiryDate);
                const isBelowRop = isAtOrBelowBuffer(ing.currentStock, ing.reorderPoint);
                const isBelowSafety = isAtOrBelowBuffer(ing.currentStock, ing.safetyStock);

                return (
                  <tr
                    key={ing.id}
                    className={`transition-colors hover:bg-slate-50/80 ${exp.isFlagged ? 'bg-amber-50/30' : ''}`}
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
                          Max: {ing.maxStock > 0 ? `${ing.maxStock} ${ing.unit}` : 'N/A'}
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
                      <span className="font-mono font-bold text-slate-900">{ing.costPerUnit > 0 ? `₱${ing.costPerUnit}.00` : 'N/A'}</span>
                      <span className="text-slate-400 text-[10px] block">/ {ing.unit}</span>
                    </td>

                    {/* Actions */}
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex justify-end gap-2">
                      {canDeleteRecords && (
                        <button
                          type="button"
                          onClick={() => openEditIngredient(ing)}
                          aria-label={`Edit ${ing.name}`}
                          title="Edit raw material details and stock"
                          className="inline-flex items-center space-x-1.5 text-xs bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 px-3 py-1.5 rounded-xl transition-colors font-bold shadow-sm"
                        >
                          <Pencil className="w-3 h-3" />
                          <span>Edit</span>
                        </button>
                      )}
                      {!isDirectorReadOnly && (
                        <button
                          onClick={() => openAdjustModal(ing)}
                          className="inline-flex items-center space-x-1.5 text-xs bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-200 px-3 py-1.5 rounded-xl transition-colors font-bold shadow-sm"
                        >
                          <RefreshCw className="w-3 h-3 text-indigo-600" />
                          <span>Update</span>
                        </button>
                      )}
                      {canDeleteRecords && (
                        <button
                          type="button"
                          onClick={() => handleDeleteIngredient(ing)}
                          aria-label={`Delete ${ing.name}`}
                          title="Delete ingredient record"
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

      {/* ========================================================= */}
      {/* 2. RAW INGREDIENTS GRID (Card View) */}
      {/* ========================================================= */}
      {viewMode === 'grid' && filtered.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {pagination.pageItems.map(ing => {
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
                      {ing.maxStock > 0 ? `${ing.maxStock} ${ing.unit}` : 'N/A'}
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
                    <strong className="text-slate-900 font-mono font-bold">{ing.costPerUnit > 0 ? `₱${ing.costPerUnit}.00` : 'N/A'}</strong>
                  </div>
                  <div className="flex items-center gap-2">
                  {canDeleteRecords && (
                    <button
                      type="button"
                      onClick={() => openEditIngredient(ing)}
                      aria-label={`Edit ${ing.name}`}
                      title="Edit raw material details and stock"
                      className="flex items-center space-x-1.5 text-xs bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 px-3.5 py-1.5 rounded-xl transition-colors font-bold shadow-sm"
                    >
                      <Pencil className="w-3.5 h-3.5" />
                      <span>Edit</span>
                    </button>
                  )}
                  {!isDirectorReadOnly && (
                    <button
                      onClick={() => openAdjustModal(ing)}
                      className="flex items-center space-x-1.5 text-xs bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-200 px-3.5 py-1.5 rounded-xl transition-colors font-bold shadow-sm"
                    >
                      <RefreshCw className="w-3.5 h-3.5 text-indigo-600" />
                      <span>Update Stock</span>
                    </button>
                  )}
                  {canDeleteRecords && (
                    <button
                      type="button"
                      onClick={() => handleDeleteIngredient(ing)}
                      aria-label={`Delete ${ing.name}`}
                      title="Delete ingredient record"
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

      <div className="rounded-2xl border border-slate-200 bg-white">
        <TablePagination
          totalItems={filtered.length}
          pageIndex={pagination.pageIndex}
          pageSize={pagination.pageSize}
          pageCount={pagination.pageCount}
          onPageChange={pagination.setPageIndex}
          onPageSizeChange={pagination.setPageSize}
        />
      </div>

      {/* Update Stock & Expiry Modal */}
      {stockModalItem && !isDirectorReadOnly && (
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
      {(showAddModal || (editingIngredient && canDeleteRecords)) && !isDirectorReadOnly && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white border-2 border-slate-200 rounded-3xl max-w-lg w-full shadow-2xl flex flex-col max-h-[90vh] overflow-hidden text-slate-900 animate-in fade-in zoom-in-95 duration-150">
            {/* Fixed Header */}
            <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4 bg-slate-50/50 shrink-0">
              <div>
                <h3 className="font-extrabold text-lg text-slate-900">
                  {editingIngredient ? 'Update Raw Material / Packaging' : 'Add Raw Material / Packaging'}
                </h3>
                <p className="text-xs text-slate-500">Configure ingredient specifications, reorder triggers, and shelf-life</p>
              </div>
              <button 
                onClick={closeMaterialForm}
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
                    {customCategories.map(category => (
                      <option key={category} value={category}>
                        {category.replace(/_/g, ' ').replace(/\b\w/g, character => character.toUpperCase())}
                      </option>
                    ))}
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
                  <label className="block font-bold text-slate-600 mb-1">
                    {editingIngredient ? 'Current Stock' : 'Initial Stock'}
                  </label>
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
                    <option value="labels">Labels</option>
                    <option value="rolls">Rolls</option>
                    <option value="sachets">Sachets</option>
                    {availableUnits
                      .filter(unit => !STANDARD_INGREDIENT_UNITS.includes(unit.toLowerCase()))
                      .map(unit => (
                        <option key={unit} value={unit}>{unit}</option>
                      ))}
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
                  <div className="mb-1 flex items-center justify-between gap-1">
                    <label className="block font-bold text-slate-600">Unit Cost (₱)</label>
                    <button
                      type="button"
                      aria-pressed={unitCostNotApplicable}
                      onClick={() => setUnitCostNotApplicable(value => !value)}
                      className="rounded-md border border-slate-300 bg-white px-1.5 py-0.5 text-[9px] font-bold text-slate-600 hover:bg-slate-100"
                    >
                      {unitCostNotApplicable ? 'Set value' : 'N/A'}
                    </button>
                  </div>
                  {unitCostNotApplicable ? (
                    <div className="rounded-xl border border-slate-200 bg-slate-100 px-3 py-2 font-semibold text-slate-500">N/A</div>
                  ) : (
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
                  )}
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
                    <div className="mb-1 flex items-center justify-between gap-1">
                    <label className="block font-bold text-slate-600">Max Capacity</label>
                    <button
                      type="button"
                      aria-pressed={maxStockNotApplicable}
                      onClick={() => setMaxStockNotApplicable(value => !value)}
                      className="rounded-md border border-slate-300 bg-white px-1.5 py-0.5 text-[9px] font-bold text-slate-600 hover:bg-slate-100"
                    >
                      {maxStockNotApplicable ? 'Set value' : 'N/A'}
                    </button>
                  </div>
                  {maxStockNotApplicable ? (
                    <div className="rounded-xl border border-slate-200 bg-slate-100 px-3 py-2 font-semibold text-slate-500">N/A</div>
                  ) : (
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
                  )}
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
                    aria-pressed={isNonPerishable}
                    className={`px-3 py-1.5 rounded-xl text-[11px] font-extrabold transition-all flex items-center space-x-1.5 border shadow-2xs ${
                      isNonPerishable 
                        ? 'bg-emerald-600 text-white border-emerald-700' 
                        : 'bg-white text-slate-700 hover:bg-slate-100 border-slate-300'
                    }`}
                  >
                    <span>{isNonPerishable ? '✓ Expiry: N/A · Non-perishable' : 'Mark expiry as N/A'}</span>
                  </button>
                </div>

                {isNonPerishable ? (
                  <div className="p-2.5 bg-emerald-50 rounded-xl border border-emerald-200 text-emerald-800 text-[11px] flex items-center space-x-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Expiry is not applicable for this item (e.g. bottles, caps, dry cartons). Expiration alerts will be skipped.</span>
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
                  <div className="mb-1 flex items-center justify-between gap-2">
                    <label htmlFor="raw-material-primary-supplier" className="block font-bold text-slate-600">Primary Supplier</label>
                    <button
                      type="button"
                      aria-pressed={addSupplier.trim().toLowerCase() === 'n/a'}
                      onClick={() => setAddSupplier(addSupplier.trim().toLowerCase() === 'n/a' ? 'PCC Local Cooperatives' : 'N/A')}
                      className="rounded-lg border border-slate-300 bg-white px-2 py-1 text-[10px] font-bold text-slate-600 hover:bg-slate-100"
                    >
                      {addSupplier.trim().toLowerCase() === 'n/a' ? 'Set supplier' : 'Supplier N/A'}
                    </button>
                  </div>
                  <input 
                    id="raw-material-primary-supplier"
                    type="text" 
                    value={addSupplier} 
                    onChange={e => setAddSupplier(e.target.value)} 
                    placeholder="e.g., PCC Local Cooperatives"
                    disabled={addSupplier.trim().toLowerCase() === 'n/a'}
                    className="w-full px-3 py-2 bg-slate-50 border rounded-xl text-xs" 
                  />
                </div>
                <div>
                  <div className="mb-1 flex items-center justify-between gap-2">
                    <label htmlFor="raw-material-storage-location" className="block font-bold text-slate-600">Storage Location / Bay</label>
                    <button
                      type="button"
                      aria-pressed={addLocation.trim().toLowerCase() === 'n/a'}
                      onClick={() => setAddLocation(addLocation.trim().toLowerCase() === 'n/a' ? 'Dry Storage Bay 1' : 'N/A')}
                      className="rounded-lg border border-slate-300 bg-white px-2 py-1 text-[10px] font-bold text-slate-600 hover:bg-slate-100"
                    >
                      {addLocation.trim().toLowerCase() === 'n/a' ? 'Set location' : 'Location N/A'}
                    </button>
                  </div>
                  <input 
                    id="raw-material-storage-location"
                    type="text" 
                    value={addLocation} 
                    onChange={e => setAddLocation(e.target.value)} 
                    placeholder="e.g., Dry Bay 1, Cold Vault A"
                    disabled={addLocation.trim().toLowerCase() === 'n/a'}
                    className="w-full px-3 py-2 bg-slate-50 border rounded-xl text-xs" 
                  />
                </div>
              </div>
            </form>

            {/* Modal Fixed Footer */}
            <div className="flex items-center justify-end space-x-3 px-6 py-4 border-t border-slate-100 bg-slate-50/50 shrink-0">
              <button 
                type="button" 
                onClick={closeMaterialForm}
                className="px-4 py-2 font-semibold text-slate-600 hover:bg-slate-200 rounded-xl transition-colors cursor-pointer text-xs"
              >
                Cancel
              </button>
              <button 
                type="submit" 
                form="add-raw-material-form"
                className="px-5 py-2.5 font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow cursor-pointer text-xs"
              >
                {editingIngredient ? 'Save Changes' : 'Save Material to Inventory'}
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
