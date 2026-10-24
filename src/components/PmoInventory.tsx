import React, { useEffect, useMemo, useState } from 'react';
import {
  Archive,
  CheckCircle2,
  ClipboardList,
  Download,
  LockKeyhole,
  Plus,
  Save,
  ShieldAlert,
  Trash2,
  X,
} from 'lucide-react';
import { useDairySync } from '../context/DairySyncContext';
import { IngredientCategory, PmoInventoryLine, PmoInventoryPeriod, RawIngredient } from '../types';
import { downloadCsv } from '../utils/csv';
import {
  calculatePmoExpectedEnding,
  calculatePmoIssuedToProduction,
  getPmoInventoryActivity,
} from '../utils/pmoInventoryLedger';

type QuantityField = 'purchasesQuantity' | 'endingQuantity';

type ExternalPurchaseDraft = {
  sku: string;
  name: string;
  category: string;
  unit: string;
  quantity: string;
  costPerUnit: string;
  reorderPoint: string;
  safetyStock: string;
  maxStock: string;
  avgDailyConsumption: string;
  leadTimeDays: string;
  supplier: string;
  location: string;
  expiryDate: string;
  expiryNotApplicable: boolean;
};

const makeExternalPurchaseDraft = (): ExternalPurchaseDraft => ({
  sku: `ING-${Math.floor(100 + Math.random() * 900)}`,
  name: '',
  category: 'additive',
  unit: 'kg',
  quantity: '',
  costPerUnit: '0',
  reorderPoint: '0',
  safetyStock: '0',
  maxStock: '100',
  avgDailyConsumption: '0',
  leadTimeDays: '0',
  supplier: '',
  location: 'N/A',
  expiryDate: '',
  expiryNotApplicable: false,
});

const quantityLabel = (value: number | null | undefined) =>
  value == null ? '—' : value.toLocaleString(undefined, { maximumFractionDigits: 3 });

export const PmoInventory: React.FC = () => {
  const {
    pmoInventoryPeriods,
    ingredients,
    transactions,
    currentRole,
    currentUser,
    savePmoInventoryPeriod,
    postPmoInventoryPeriod,
    deletePmoInventoryPeriod,
    addPmoExternalPurchase,
    recordPmoInventoryAdjustment,
  } = useDairySync();
  const canEdit = ['developer', 'procurement', 'plant_manager'].includes(currentRole);
  const isDirectorReadOnly = currentRole === 'director';

  const [selectedPeriodId, setSelectedPeriodId] = useState('');
  const [editingLines, setEditingLines] = useState<PmoInventoryLine[]>([]);
  const [showNewPeriod, setShowNewPeriod] = useState(false);
  const [newPeriodTitle, setNewPeriodTitle] = useState('');
  const [showOutsidePurchase, setShowOutsidePurchase] = useState(false);
  const [outsidePurchase, setOutsidePurchase] = useState<ExternalPurchaseDraft>(makeExternalPurchaseDraft);
  const [adjustmentLine, setAdjustmentLine] = useState<PmoInventoryLine | null>(null);
  const [adjustmentType, setAdjustmentType] = useState<'expired' | 'damage' | 'waste' | 'returned'>('waste');
  const [adjustmentQuantity, setAdjustmentQuantity] = useState('');
  const [adjustmentNotes, setAdjustmentNotes] = useState('');
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const selectedPeriod = pmoInventoryPeriods.find(period => period.id === selectedPeriodId);
  const linesAreDirty = useMemo(
    () => JSON.stringify(editingLines) !== JSON.stringify(selectedPeriod?.lines || []),
    [editingLines, selectedPeriod?.lines],
  );
  const unmatchedCount = editingLines.filter(line => !line.ingredientId).length;
  const adjustmentCount = selectedPeriod
    ? editingLines.filter(line => {
      const activity = getPmoInventoryActivity(selectedPeriod, line, transactions);
      return activity.losses > 0 || activity.returns > 0;
    }).length
    : 0;

  useEffect(() => {
    if (pmoInventoryPeriods.length === 0) {
      setSelectedPeriodId('');
      setEditingLines([]);
      return;
    }
    if (!pmoInventoryPeriods.some(period => period.id === selectedPeriodId)) {
      setSelectedPeriodId(pmoInventoryPeriods[0].id);
    }
  }, [pmoInventoryPeriods, selectedPeriodId]);

  useEffect(() => {
    setEditingLines(selectedPeriod?.lines || []);
  }, [selectedPeriodId, selectedPeriod?.lines]);

  const updateLine = (lineId: string, changes: Partial<PmoInventoryLine>) => {
    setEditingLines(previous => previous.map(line =>
      line.id === lineId ? { ...line, ...changes } : line
    ));
  };

  const handleCreatePeriod = (event: React.FormEvent) => {
    event.preventDefault();
    const title = newPeriodTitle.trim();
    if (!title) {
      setFeedback({ type: 'error', text: 'Enter a name for the inventory period.' });
      return;
    }
    const now = new Date().toISOString();
    const period: PmoInventoryPeriod = {
      id: `pmo-period-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`,
      title,
      sourceFileName: 'Manual entry',
      lines: ingredients.map(ingredient => ({
        id: `pmo-line-${Date.now()}-${Math.random().toString(36).substring(2, 8)}-${ingredient.id}`,
        itemName: ingredient.name,
        ingredientId: ingredient.id,
        unit: ingredient.unit,
        beginningQuantity: ingredient.currentStock,
        endingQuantity: undefined,
        liveLedger: true,
      })),
      createdAt: now,
      createdBy: currentUser.name,
      status: 'draft',
    };
    const result = savePmoInventoryPeriod(period);
    if (!result.success) {
      setFeedback({ type: 'error', text: result.message });
      return;
    }
    setSelectedPeriodId(period.id);
    setEditingLines([]);
    setNewPeriodTitle('');
    setShowNewPeriod(false);
    setFeedback({ type: 'success', text: result.message });
  };

  const handleAddExistingIngredient = (ingredientId: string) => {
    const ingredient = ingredients.find(item => item.id === ingredientId);
    if (!ingredient || !selectedPeriod || editingLines.some(line => line.ingredientId === ingredient.id)) return;
    const currentLine: PmoInventoryLine = {
      id: `pmo-line-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`,
      itemName: ingredient.name,
      ingredientId: ingredient.id,
      unit: ingredient.unit,
      beginningQuantity: ingredient.currentStock,
      liveLedger: true,
    };
    const activity = getPmoInventoryActivity(selectedPeriod, currentLine, transactions);
    currentLine.beginningQuantity = ingredient.currentStock -
      activity.purchases +
      activity.issuedToProduction +
      activity.losses -
      activity.returns -
      activity.adjustments;
    setEditingLines(previous => [...previous, {
      ...currentLine,
    }]);
  };

  const handleSaveDraft = () => {
    if (!selectedPeriod) return;
    const result = savePmoInventoryPeriod({ ...selectedPeriod, lines: editingLines });
    setFeedback({ type: result.success ? 'success' : 'error', text: result.message });
  };

  const handlePostPeriod = () => {
    if (!selectedPeriod || linesAreDirty) return;
    if (!window.confirm(`Post ${selectedPeriod.title} and apply each physical-count variance to the current shared Raw Ingredients balance? This action is recorded in the audit trail.`)) return;
    const result = postPmoInventoryPeriod(selectedPeriod.id);
    setFeedback({ type: result.success ? 'success' : 'error', text: result.message });
  };

  const handleDeletePeriod = () => {
    if (!selectedPeriod || currentRole !== 'developer') return;
    const confirmed = window.confirm(
      `Delete the ${selectedPeriod.status} period "${selectedPeriod.title}"? This removes the period report only. Any stock movements, purchases, losses, returns, or posted reconciliations remain in shared inventory and will not be reversed.`
    );
    if (!confirmed) return;
    const result = deletePmoInventoryPeriod(selectedPeriod.id);
    setFeedback({ type: result.success ? 'success' : 'error', text: result.message });
    if (result.success) {
      const remainingPeriods = pmoInventoryPeriods.filter(period => period.id !== selectedPeriod.id);
      setSelectedPeriodId(remainingPeriods[0]?.id || '');
      setEditingLines(remainingPeriods[0]?.lines || []);
    }
  };

  const handleRecordAdjustment = (event: React.FormEvent) => {
    event.preventDefault();
    if (!adjustmentLine?.ingredientId) return;
    if (linesAreDirty) {
      setFeedback({ type: 'error', text: 'Save the current period draft before recording a stock movement.' });
      return;
    }
    const result = recordPmoInventoryAdjustment(
      adjustmentLine.ingredientId,
      Number(adjustmentQuantity),
      adjustmentType,
      adjustmentNotes.trim(),
    );
    setFeedback({ type: result.success ? 'success' : 'error', text: result.message });
    if (result.success) {
      setAdjustmentLine(null);
      setAdjustmentQuantity('');
      setAdjustmentNotes('');
    }
  };

  const handleOutsidePurchaseSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (!selectedPeriod || !canEdit) return;
    if (linesAreDirty) {
      setFeedback({ type: 'error', text: 'Save the current draft before recording an outside purchase.' });
      return;
    }
    const ingredient: Omit<RawIngredient, 'id' | 'currentStock' | 'lastRestocked'> = {
      sku: outsidePurchase.sku.trim(),
      name: outsidePurchase.name.trim(),
      category: outsidePurchase.category.trim().toLowerCase() as IngredientCategory,
      unit: outsidePurchase.unit.trim(),
      costPerUnit: Number(outsidePurchase.costPerUnit),
      reorderPoint: Number(outsidePurchase.reorderPoint),
      safetyStock: Number(outsidePurchase.safetyStock),
      maxStock: Number(outsidePurchase.maxStock),
      avgDailyConsumption: Number(outsidePurchase.avgDailyConsumption),
      leadTimeDays: Number(outsidePurchase.leadTimeDays),
      supplier: outsidePurchase.supplier.trim(),
      location: outsidePurchase.location.trim(),
      expiryDate: outsidePurchase.expiryNotApplicable ? undefined : (outsidePurchase.expiryDate || undefined),
    };
    const result = addPmoExternalPurchase(selectedPeriod.id, ingredient, Number(outsidePurchase.quantity));
    setFeedback({ type: result.success ? 'success' : 'error', text: result.message });
    if (result.success) {
      setShowOutsidePurchase(false);
      setOutsidePurchase(makeExternalPurchaseDraft());
    }
  };

  const handleExport = () => {
    if (!selectedPeriod) return;
    const liveLine = (line: PmoInventoryLine) => {
      if (line.liveLedger) {
        const activity = getPmoInventoryActivity(selectedPeriod, line, transactions);
        return {
          ...line,
          ...activity,
          purchases: line.purchasesQuantity ?? activity.purchases,
          issuedToProduction: calculatePmoIssuedToProduction(
            line,
            line.purchasesQuantity ?? activity.purchases,
          ),
        };
      }
      const adjustment = line.lossOrReturnQuantity || 0;
      return {
        ...line,
        purchases: line.purchasesQuantity || 0,
        issuedToProduction: calculatePmoIssuedToProduction(line, line.purchasesQuantity || 0),
        losses: line.lossOrReturnDirection === 'increase' ? 0 : adjustment,
        returns: line.lossOrReturnDirection === 'increase' ? adjustment : 0,
        adjustments: 0,
      };
    };
    downloadCsv(
      `DairySync_PMO_Inventory_${selectedPeriod.title.replace(/[^a-z0-9]+/gi, '_')}.csv`,
      [
        'Item Description',
        'Beginning Inventory / Physical Count Qty',
        'Beginning Unit',
        'Purchases Qty',
        'Purchase Unit',
        'Issued to Production',
        'Expired / Damage / Waste / Returned',
        'Ending Inventory / Physical Count Qty',
        'Ending Unit',
        'Expected Ending Qty',
        'Ingredient ID',
      ],
      selectedPeriod.lines.map(rawLine => {
        const line = liveLine(rawLine);
        return [
        line.itemName,
        line.beginningQuantity,
        line.unit,
        line.purchases,
        line.unit,
        line.issuedToProduction,
        `Losses: ${line.losses}; Returns: ${line.returns}; Other adjustments: ${line.adjustments}`,
        line.endingQuantity,
        line.unit,
        calculatePmoExpectedEnding(rawLine, line) ?? '',
        line.ingredientId || '',
        ];
      }),
    );
  };

  const availableIngredients = ingredients.filter(ingredient =>
    !editingLines.some(line => line.ingredientId === ingredient.id)
  );
  const isPosted = selectedPeriod?.status === 'posted';
  const displayedLines = selectedPeriod
    ? editingLines.map(line => ({
      line,
      activity: getPmoInventoryActivity(selectedPeriod, line, transactions),
    }))
    : [];

  return (
    <div className="space-y-5 text-slate-900">
      <header className="flex flex-col gap-4 rounded-3xl border-2 border-slate-200 bg-white p-5 shadow-sm sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <ClipboardList className="h-6 w-6 text-indigo-600" />
            <h1 className="text-xl font-extrabold tracking-tight">PMO Inventory &amp; Stock Reconciliation</h1>
          </div>
          <p className="mt-1 text-xs font-medium text-slate-500">
            Period inventory ledger connected to shared Raw Ingredients stock
          </p>
          {isDirectorReadOnly && (
            <span className="mt-2 inline-flex rounded-full border border-amber-200 bg-amber-50 px-2.5 py-1 text-[10px] font-bold text-amber-800">
              Director / PMO · Read only
            </span>
          )}
        </div>
        <div className="flex flex-wrap gap-2">
          {selectedPeriod && (
            <button
              type="button"
              onClick={handleExport}
              className="inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50"
            >
              <Download className="h-4 w-4" /> Export CSV
            </button>
          )}
          {canEdit && (
            <button
              type="button"
              onClick={() => setShowNewPeriod(true)}
              className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-3 py-2 text-xs font-bold text-white hover:bg-indigo-700"
            >
              <Plus className="h-4 w-4" /> New period
            </button>
          )}
        </div>
      </header>

      {feedback && (
        <div className={`flex items-center justify-between rounded-2xl border p-3 text-xs font-semibold ${
          feedback.type === 'success'
            ? 'border-emerald-200 bg-emerald-50 text-emerald-900'
            : 'border-rose-200 bg-rose-50 text-rose-900'
        }`}>
          <span className="flex items-center gap-2">
            {feedback.type === 'success'
              ? <CheckCircle2 className="h-4 w-4" />
              : <ShieldAlert className="h-4 w-4" />}
            {feedback.text}
          </span>
          <button type="button" onClick={() => setFeedback(null)} aria-label="Dismiss message">
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      <div className="rounded-2xl border border-indigo-200 bg-indigo-50 px-4 py-3 text-[11px] leading-relaxed text-indigo-900">
        <strong>Shared inventory:</strong> posting updates the linked Raw Ingredients balances. WIP and Procurement continue
        to use those same ingredient records. Purchases of new items add a shared ingredient and stock transaction;
        every physical-count reconciliation is recorded once and audited.
      </div>

      {pmoInventoryPeriods.length > 0 && (
        <section className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:flex-row sm:items-end sm:justify-between">
          <label className="block min-w-0 sm:min-w-[300px]">
            <span className="mb-1 block text-[10px] font-extrabold uppercase tracking-wide text-slate-500">Inventory period</span>
            <select
              value={selectedPeriodId}
              onChange={event => {
                if (linesAreDirty && !window.confirm('Discard unsaved line edits and open another period?')) return;
                setSelectedPeriodId(event.target.value);
                setFeedback(null);
              }}
              className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs font-bold text-slate-800"
            >
              {pmoInventoryPeriods.map(period => (
                <option key={period.id} value={period.id}>
                  {period.title} · {period.status === 'posted' ? 'Posted' : 'Draft'}
                </option>
              ))}
            </select>
          </label>
          <div className="flex flex-wrap items-center gap-2 text-[10px] text-slate-500">
            <span>Created by <strong className="text-slate-700">{selectedPeriod?.createdBy}</strong></span>
            {selectedPeriod?.postedAt && <span>· Posted {new Date(selectedPeriod.postedAt).toLocaleString()}</span>}
            <span className={`rounded-full px-2.5 py-1 font-extrabold ${
              isPosted ? 'bg-emerald-50 text-emerald-800' : 'bg-amber-50 text-amber-800'
            }`}>
              {isPosted ? 'POSTED · LOCKED' : 'DRAFT'}
            </span>
            {currentRole === 'developer' && selectedPeriod && (
              <button
                type="button"
                onClick={handleDeletePeriod}
                aria-label={`Delete inventory period ${selectedPeriod.title}`}
                className="inline-flex items-center gap-1 rounded-lg border border-rose-200 bg-rose-50 px-2.5 py-1.5 font-bold text-rose-700 hover:bg-rose-100"
              >
                <Trash2 className="h-3.5 w-3.5" /> Delete period
              </button>
            )}
          </div>
        </section>
      )}

      {!selectedPeriod ? (
        <section className="rounded-3xl border-2 border-dashed border-slate-300 bg-white px-6 py-14 text-center">
          <Archive className="mx-auto h-10 w-10 text-slate-300" />
          <h2 className="mt-3 text-sm font-extrabold">No inventory periods yet</h2>
          <p className="mt-1 text-xs text-slate-500">Create a period to begin a physical-count register.</p>
          {canEdit && (
            <button
              type="button"
              onClick={() => setShowNewPeriod(true)}
              className="mt-4 inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-xs font-bold text-white hover:bg-indigo-700"
            >
              <Plus className="h-4 w-4" /> Create first period
            </button>
          )}
        </section>
      ) : (
        <>
          <section className="grid grid-cols-2 gap-3 lg:grid-cols-4">
            <div className="rounded-2xl border border-slate-200 bg-white p-4">
              <span className="block text-[10px] font-bold text-slate-500">ITEMS IN PERIOD</span>
              <strong className="mt-1 block text-lg">{editingLines.length}</strong>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-white p-4">
              <span className="block text-[10px] font-bold text-slate-500">LOSS / RETURN ADJUSTMENTS</span>
              <strong className="mt-1 block text-lg">{adjustmentCount}</strong>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-white p-4">
              <span className="block text-[10px] font-bold text-slate-500">UNLINKED ITEMS</span>
              <strong className={`mt-1 block text-lg ${unmatchedCount ? 'text-amber-700' : 'text-emerald-700'}`}>{unmatchedCount}</strong>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-white p-4">
              <span className="block text-[10px] font-bold text-slate-500">PERIOD STATUS</span>
              <strong className={`mt-1 block text-lg ${isPosted ? 'text-emerald-700' : 'text-amber-700'}`}>{isPosted ? 'Posted' : 'Draft'}</strong>
            </div>
          </section>

          <section className="overflow-hidden rounded-3xl border-2 border-slate-200 bg-white shadow-sm">
            <div className="flex flex-col gap-3 border-b border-slate-100 p-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-sm font-extrabold">Inventory movement details</h2>
                <p className="mt-1 text-[10px] text-slate-500">
                  Movements are read from shared stock transactions. Posting applies only the physical-count variance to the current balance.
                </p>
              </div>
              {canEdit && !isPosted && (
                <div className="flex flex-wrap gap-2">
                  <select
                    value=""
                    onChange={event => handleAddExistingIngredient(event.target.value)}
                    disabled={availableIngredients.length === 0}
                    className="max-w-[220px] rounded-xl border border-slate-300 bg-white px-3 py-2 text-[11px] font-bold text-slate-700 disabled:opacity-50"
                    aria-label="Add existing Raw Ingredient"
                  >
                    <option value="">＋ Add existing ingredient</option>
                    {availableIngredients.map(item => (
                      <option key={item.id} value={item.id}>{item.name} · {item.unit}</option>
                    ))}
                  </select>
                  <button
                    type="button"
                    onClick={() => setShowOutsidePurchase(true)}
                    disabled={linesAreDirty}
                    className="rounded-xl border border-indigo-200 bg-indigo-50 px-3 py-2 text-[11px] font-bold text-indigo-800 hover:bg-indigo-100 disabled:opacity-50"
                  >
                    ＋ Outside purchase / new item
                  </button>
                </div>
              )}
            </div>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[1120px] border-collapse text-left">
                <thead>
                  <tr className="bg-slate-50 text-[9px] uppercase tracking-wide text-slate-600">
                    <th className="px-3 py-3">Item Description</th>
                    <th className="px-3 py-3 text-center">Beginning Inventory /<br />Physical Count Qty</th>
                    <th className="px-3 py-3 text-center">Unit</th>
                    <th className="px-3 py-3 text-center">Purchases Qty</th>
                    <th className="px-3 py-3 text-center">Unit</th>
                    <th className="px-3 py-3 text-center">Issued to<br />Production</th>
                    <th className="px-3 py-3">Expired / Damage /<br />Waste / Returned</th>
                    <th className="px-3 py-3 text-right">Ending Inventory /<br />Physical Count Qty</th>
                    <th className="px-3 py-3">Unit</th>
                    {canEdit && !isPosted && <th className="px-3 py-3">Action</th>}
                  </tr>
                </thead>
                <tbody>
                  {displayedLines.map(({ line, activity }) => {
                    const expected = calculatePmoExpectedEnding(line, activity);
                    const item = ingredients.find(ingredient => ingredient.id === line.ingredientId);
                    const readOnly = !canEdit || isPosted;
                    const purchases = line.liveLedger
                      ? line.purchasesQuantity ?? activity.purchases
                      : line.purchasesQuantity || 0;
                    const issued = calculatePmoIssuedToProduction(line, purchases);
                    const losses = line.liveLedger ? activity.losses : (
                      line.lossOrReturnDirection === 'increase' ? 0 : line.lossOrReturnQuantity || 0
                    );
                    const returns = line.liveLedger ? activity.returns : (
                      line.lossOrReturnDirection === 'increase' ? line.lossOrReturnQuantity || 0 : 0
                    );
                    const numberInput = (field: QuantityField, label: string) => (
                      <input
                        aria-label={`${line.itemName} ${label}`}
                        type="number"
                        min="0"
                        step="any"
                        value={field === 'purchasesQuantity' ? purchases : line[field] ?? ''}
                        disabled={readOnly}
                        onChange={event => updateLine(line.id, {
                          [field]: event.target.value === '' ? undefined : Number(event.target.value),
                        })}
                        className="w-24 rounded-lg border border-slate-300 bg-white px-2 py-1.5 text-right text-xs font-mono text-slate-800 disabled:border-transparent disabled:bg-transparent"
                      />
                    );
                    return (
                      <tr key={line.id} className="border-t border-slate-100 text-xs">
                        <td className="px-3 py-3">
                          <strong className="block text-slate-800">{line.itemName}</strong>
                          <span className="mt-1 block text-[9px] text-slate-500">
                            {item
                              ? `${item.sku} · Live stock ${quantityLabel(item.currentStock)} ${item.unit}`
                              : 'Not linked to Raw Ingredients'}
                          </span>
                        </td>
                        <td className="px-3 py-3 text-center font-mono">{quantityLabel(line.beginningQuantity)}</td>
                        <td className="px-3 py-3 text-center text-slate-500">{line.unit}</td>
                        <td className="px-3 py-3 text-center">
                          {numberInput('purchasesQuantity', 'purchases quantity')}
                        </td>
                        <td className="px-3 py-3 text-center text-slate-500">{line.unit}</td>
                        <td className="px-3 py-3 text-center font-mono">{quantityLabel(issued)}</td>
                        <td className="px-3 py-3 text-[10px]">
                          <span className="block text-amber-800">Losses: {quantityLabel(losses)}</span>
                          <span className="block text-emerald-700">Returns: {quantityLabel(returns)}</span>
                          {line.liveLedger && activity.adjustments !== 0 && (
                            <span className="mt-1 block text-slate-500">Other adjustments: {quantityLabel(activity.adjustments)}</span>
                          )}
                        </td>
                        <td className="px-3 py-3 text-right">
                          {numberInput('endingQuantity', 'ending physical count')}
                          <span className={`mt-1 block text-[9px] ${expected !== null && expected !== line.endingQuantity ? 'text-amber-700' : 'text-slate-400'}`}>
                            Expected {quantityLabel(expected ?? undefined)}
                            {expected !== null && line.endingQuantity !== undefined
                              ? ` · variance ${quantityLabel(line.endingQuantity - expected)}`
                              : ''}
                          </span>
                        </td>
                        <td className="px-3 py-3 text-slate-500">{line.unit}</td>
                        {canEdit && !isPosted && (
                          <td className="space-x-1 px-3 py-3">
                            {line.ingredientId && line.liveLedger && (
                              <button
                                type="button"
                                disabled={linesAreDirty}
                                onClick={() => {
                                  setAdjustmentLine(line);
                                  setAdjustmentType('waste');
                                  setAdjustmentQuantity('');
                                  setAdjustmentNotes('');
                                }}
                                className="rounded-lg border border-amber-200 bg-amber-50 px-2 py-1.5 text-[10px] font-bold text-amber-800 disabled:opacity-50"
                              >
                                Record loss/return
                              </button>
                            )}
                            <button
                              type="button"
                              onClick={() => setEditingLines(previous => previous.filter(item => item.id !== line.id))}
                              aria-label={`Remove ${line.itemName} from this draft`}
                              className="rounded-lg p-2 text-rose-600 hover:bg-rose-50"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </td>
                        )}
                      </tr>
                    );
                  })}
                  {editingLines.length === 0 && (
                    <tr>
                      <td colSpan={canEdit && !isPosted ? 10 : 9} className="px-4 py-12 text-center text-xs text-slate-500">
                        Add an existing ingredient or record an outside purchase to start this period.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            <div className="flex flex-col gap-3 border-t border-slate-100 bg-slate-50 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
              <span className="text-[10px] text-slate-500">
                {isPosted
                  ? `Locked after posting by ${selectedPeriod.postedBy || 'authorized user'}.`
                  : 'Review the physical count variance before posting; posted periods cannot be edited.'}
              </span>
              {canEdit && !isPosted && (
                <div className="flex flex-wrap justify-end gap-2">
                  <button
                    type="button"
                    onClick={handleSaveDraft}
                    disabled={!linesAreDirty}
                    className="inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-3 py-2 text-[11px] font-bold text-slate-700 hover:bg-slate-100 disabled:opacity-50"
                  >
                    <Save className="h-4 w-4" /> Save draft
                  </button>
                  <button
                    type="button"
                    onClick={handlePostPeriod}
                    disabled={
                      linesAreDirty ||
                      editingLines.length === 0 ||
                      unmatchedCount > 0 ||
                      editingLines.some(line => line.endingQuantity === undefined)
                    }
                    className="inline-flex items-center gap-2 rounded-xl bg-emerald-700 px-3 py-2 text-[11px] font-bold text-white hover:bg-emerald-800 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <CheckCircle2 className="h-4 w-4" /> Post &amp; reconcile stock
                  </button>
                </div>
              )}
              {isDirectorReadOnly && <LockKeyhole className="h-4 w-4 text-amber-600" aria-label="Read only" />}
            </div>
          </section>
        </>
      )}

      {showNewPeriod && canEdit && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4" onClick={() => setShowNewPeriod(false)}>
          <form
            onSubmit={handleCreatePeriod}
            onClick={event => event.stopPropagation()}
            className="w-full max-w-md space-y-4 rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl"
          >
            <div className="flex items-center justify-between">
              <h2 className="text-base font-extrabold">Create inventory period</h2>
              <button type="button" onClick={() => setShowNewPeriod(false)} aria-label="Close" className="text-slate-400 hover:text-slate-800">
                <X className="h-5 w-5" />
              </button>
            </div>
            <label className="block text-xs font-bold text-slate-700">
              Period name
              <input
                autoFocus
                value={newPeriodTitle}
                onChange={event => setNewPeriodTitle(event.target.value)}
                placeholder="e.g. October 2026"
                className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm"
              />
            </label>
            <div className="flex justify-end gap-2">
              <button type="button" onClick={() => setShowNewPeriod(false)} className="rounded-xl border border-slate-300 px-3 py-2 text-xs font-bold text-slate-700">Cancel</button>
              <button type="submit" className="rounded-xl bg-indigo-600 px-3 py-2 text-xs font-bold text-white">Create draft</button>
            </div>
          </form>
        </div>
      )}

      {showOutsidePurchase && canEdit && selectedPeriod && (
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-slate-950/60 p-4" onClick={() => setShowOutsidePurchase(false)}>
          <form
            onSubmit={handleOutsidePurchaseSubmit}
            onClick={event => event.stopPropagation()}
            className="my-auto w-full max-w-2xl space-y-4 rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-base font-extrabold">Record an outside purchase</h2>
                <p className="mt-1 text-xs text-slate-500">Creates a Raw Ingredients record and purchase transaction in the shared inventory.</p>
              </div>
              <button type="button" onClick={() => setShowOutsidePurchase(false)} aria-label="Close" className="text-slate-400 hover:text-slate-800">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <label className="text-[11px] font-bold text-slate-700">Item name<input required value={outsidePurchase.name} onChange={event => setOutsidePurchase({ ...outsidePurchase, name: event.target.value })} className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-xs" /></label>
              <label className="text-[11px] font-bold text-slate-700">SKU<input required value={outsidePurchase.sku} onChange={event => setOutsidePurchase({ ...outsidePurchase, sku: event.target.value })} className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-xs" /></label>
              <label className="text-[11px] font-bold text-slate-700">Category<select value={outsidePurchase.category} onChange={event => setOutsidePurchase({ ...outsidePurchase, category: event.target.value })} className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs"><option value="milk">Milk</option><option value="sweetener">Sweetener</option><option value="flavoring">Flavoring</option><option value="packaging">Packaging</option><option value="additive">Additive</option></select></label>
              <label className="text-[11px] font-bold text-slate-700">Unit<select value={outsidePurchase.unit} onChange={event => setOutsidePurchase({ ...outsidePurchase, unit: event.target.value })} className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs"><option>L</option><option>kg</option><option>pieces</option><option>grams</option><option>packs</option></select></label>
              <label className="text-[11px] font-bold text-slate-700">Purchase quantity<input required type="number" min="0.001" step="any" value={outsidePurchase.quantity} onChange={event => setOutsidePurchase({ ...outsidePurchase, quantity: event.target.value })} className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-xs" /></label>
              <label className="text-[11px] font-bold text-slate-700">Cost per unit (PHP)<input required type="number" min="0" step="any" value={outsidePurchase.costPerUnit} onChange={event => setOutsidePurchase({ ...outsidePurchase, costPerUnit: event.target.value })} className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-xs" /></label>
              <label className="text-[11px] font-bold text-slate-700">Supplier<input required value={outsidePurchase.supplier} onChange={event => setOutsidePurchase({ ...outsidePurchase, supplier: event.target.value })} className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-xs" /></label>
              <div className="text-[11px] font-bold text-slate-700">
                <div className="flex items-center justify-between gap-2">
                  <label htmlFor="pmo-outside-storage-location">Storage location</label>
                  <button
                    type="button"
                    aria-pressed={outsidePurchase.location.trim().toLowerCase() === 'n/a'}
                    onClick={() => setOutsidePurchase({
                      ...outsidePurchase,
                      location: outsidePurchase.location.trim().toLowerCase() === 'n/a' ? 'Warehouse' : 'N/A',
                    })}
                    className="rounded-lg border border-slate-300 bg-white px-2 py-1 text-[10px] font-bold text-slate-600 hover:bg-slate-100"
                  >
                    {outsidePurchase.location.trim().toLowerCase() === 'n/a' ? 'Set location' : 'Location N/A'}
                  </button>
                </div>
                <input
                  id="pmo-outside-storage-location"
                  required
                  disabled={outsidePurchase.location.trim().toLowerCase() === 'n/a'}
                  value={outsidePurchase.location}
                  onChange={event => setOutsidePurchase({ ...outsidePurchase, location: event.target.value })}
                  className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-xs disabled:bg-slate-100"
                />
              </div>
              <label className="text-[11px] font-bold text-slate-700">Reorder point<input required type="number" min="0" step="any" value={outsidePurchase.reorderPoint} onChange={event => setOutsidePurchase({ ...outsidePurchase, reorderPoint: event.target.value })} className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-xs" /></label>
              <label className="text-[11px] font-bold text-slate-700">Safety stock<input required type="number" min="0" step="any" value={outsidePurchase.safetyStock} onChange={event => setOutsidePurchase({ ...outsidePurchase, safetyStock: event.target.value })} className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-xs" /></label>
              <label className="text-[11px] font-bold text-slate-700">Maximum stock<input required type="number" min="0" step="any" value={outsidePurchase.maxStock} onChange={event => setOutsidePurchase({ ...outsidePurchase, maxStock: event.target.value })} className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-xs" /></label>
              <label className="text-[11px] font-bold text-slate-700">Average daily use<input required type="number" min="0" step="any" value={outsidePurchase.avgDailyConsumption} onChange={event => setOutsidePurchase({ ...outsidePurchase, avgDailyConsumption: event.target.value })} className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-xs" /></label>
              <label className="text-[11px] font-bold text-slate-700">Supplier lead time (days)<input required type="number" min="0" step="1" value={outsidePurchase.leadTimeDays} onChange={event => setOutsidePurchase({ ...outsidePurchase, leadTimeDays: event.target.value })} className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-xs" /></label>
              <div className="text-[11px] font-bold text-slate-700">
                <div className="flex items-center justify-between gap-2">
                  <label htmlFor="pmo-outside-expiry-date">Expiry date</label>
                  <button
                    type="button"
                    aria-pressed={outsidePurchase.expiryNotApplicable}
                    onClick={() => setOutsidePurchase({
                      ...outsidePurchase,
                      expiryNotApplicable: !outsidePurchase.expiryNotApplicable,
                      expiryDate: '',
                    })}
                    className="rounded-lg border border-slate-300 bg-white px-2 py-1 text-[10px] font-bold text-slate-600 hover:bg-slate-100"
                  >
                    {outsidePurchase.expiryNotApplicable ? 'Set expiry date' : 'Mark expiry N/A'}
                  </button>
                </div>
                {outsidePurchase.expiryNotApplicable ? (
                  <p className="mt-1 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-medium text-slate-500">
                    Expiry is not applicable for this item.
                  </p>
                ) : (
                  <input
                    id="pmo-outside-expiry-date"
                    type="date"
                    value={outsidePurchase.expiryDate}
                    onChange={event => setOutsidePurchase({ ...outsidePurchase, expiryDate: event.target.value })}
                    className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-xs"
                  />
                )}
              </div>
            </div>
            <div className="flex justify-end gap-2 border-t border-slate-100 pt-3">
              <button type="button" onClick={() => setShowOutsidePurchase(false)} className="rounded-xl border border-slate-300 px-3 py-2 text-xs font-bold text-slate-700">Cancel</button>
              <button type="submit" className="rounded-xl bg-indigo-600 px-3 py-2 text-xs font-bold text-white">Create ingredient &amp; record purchase</button>
            </div>
          </form>
        </div>
      )}

      {adjustmentLine && canEdit && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4" onClick={() => setAdjustmentLine(null)}>
          <form
            onSubmit={handleRecordAdjustment}
            onClick={event => event.stopPropagation()}
            className="w-full max-w-lg space-y-4 rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-base font-extrabold">Record a shared stock movement</h2>
                <p className="mt-1 text-xs text-slate-500">
                  {adjustmentLine.itemName} · Current stock {quantityLabel(ingredients.find(item => item.id === adjustmentLine.ingredientId)?.currentStock)} {adjustmentLine.unit}
                </p>
              </div>
              <button type="button" onClick={() => setAdjustmentLine(null)} aria-label="Close" className="text-slate-400 hover:text-slate-800">
                <X className="h-5 w-5" />
              </button>
            </div>
            <p className="rounded-xl border border-indigo-100 bg-indigo-50 p-3 text-[11px] leading-relaxed text-indigo-900">
              This movement immediately adjusts Raw Ingredients stock and is recorded in the transaction and audit history. It will automatically appear in this PMO period and connected reports.
            </p>
            <label className="block text-xs font-bold text-slate-700">
              Movement type
              <select
                value={adjustmentType}
                onChange={event => setAdjustmentType(event.target.value as typeof adjustmentType)}
                className="mt-1 w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5"
              >
                <option value="expired">Expired (decrease stock)</option>
                <option value="damage">Damaged (decrease stock)</option>
                <option value="waste">Waste (decrease stock)</option>
                <option value="returned">Returned to inventory (increase stock)</option>
              </select>
            </label>
            <label className="block text-xs font-bold text-slate-700">
              Quantity ({adjustmentLine.unit})
              <input
                required
                type="number"
                min="0.001"
                step="any"
                value={adjustmentQuantity}
                onChange={event => setAdjustmentQuantity(event.target.value)}
                className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2.5"
              />
            </label>
            <label className="block text-xs font-bold text-slate-700">
              Notes / reason
              <input
                value={adjustmentNotes}
                onChange={event => setAdjustmentNotes(event.target.value)}
                className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2.5"
              />
            </label>
            <div className="flex justify-end gap-2 border-t border-slate-100 pt-3">
              <button type="button" onClick={() => setAdjustmentLine(null)} className="rounded-xl border border-slate-300 px-3 py-2 text-xs font-bold text-slate-700">Cancel</button>
              <button type="submit" className="rounded-xl bg-indigo-600 px-3 py-2 text-xs font-bold text-white">Record movement</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
