import React, { useMemo, useState } from 'react';
import {
  AlertCircle,
  CalendarDays,
  CheckCircle2,
  ClipboardCheck,
  Clock3,
  Factory,
  Milk,
  Package,
  Plus,
  Search,
  Thermometer,
  X,
} from 'lucide-react';
import { useDairySync } from '../context/DairySyncContext';
import { WipBatch, WipProductionRecord, WipYieldPackage } from '../types';

type BatchFilter = 'active' | 'all' | 'completed' | 'cancelled';
type PackageInput = { quantity: string; packSize: string };
type RecordForm = {
  pasteurizationTempC: string;
  pasteurizationTimeMinutes: string;
  coolingTempC: string;
  coolingTimeMinutes: string;
  bestBeforeDate: string;
  remarks: string;
};

const emptyForm: RecordForm = {
  pasteurizationTempC: '',
  pasteurizationTimeMinutes: '',
  coolingTempC: '',
  coolingTimeMinutes: '',
  bestBeforeDate: '',
  remarks: '',
};

const formatDate = (value?: string) => {
  if (!value) return '—';
  const parsed = new Date(value.replace(/ PST$/, ''));
  return Number.isNaN(parsed.getTime()) ? value : parsed.toLocaleDateString();
};

const formatMeasurement = (value: number | undefined, unit: string) =>
  value === undefined ? '—' : `${value} ${unit}`;

const toOptionalNumber = (value: string) => {
  if (!value.trim()) return undefined;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : undefined;
};

export const WipInventory: React.FC = () => {
  const { wipBatches, finishedGoods, wipProductionRecords, saveWipProductionRecord } = useDairySync();
  const [filter, setFilter] = useState<BatchFilter>('active');
  const [search, setSearch] = useState('');
  const [selectedBatch, setSelectedBatch] = useState<WipBatch | null>(null);
  const [form, setForm] = useState<RecordForm>(emptyForm);
  const [packages, setPackages] = useState<PackageInput[]>([{ quantity: '', packSize: '' }]);
  const [feedback, setFeedback] = useState<{ success: boolean; message: string } | null>(null);

  const recordsByBatch = useMemo(
    () => new Map(wipProductionRecords.map(record => [record.batchId, record])),
    [wipProductionRecords],
  );
  const activeBatches = wipBatches.filter(batch => batch.status !== 'completed' && batch.status !== 'cancelled');
  const activeMilkVolume = activeBatches.reduce((total, batch) => total + batch.rawMilkVolumeUsed, 0);
  const plannedOutput = activeBatches.reduce((total, batch) => total + batch.targetQuantity, 0);

  const filteredBatches = useMemo(() => {
    const query = search.trim().toLowerCase();
    return [...wipBatches]
      .filter(batch => {
        if (filter === 'active' && (batch.status === 'completed' || batch.status === 'cancelled')) return false;
        if (filter === 'completed' && batch.status !== 'completed') return false;
        if (filter === 'cancelled' && batch.status !== 'cancelled') return false;
        if (!query) return true;
        const record = recordsByBatch.get(batch.id);
        return [
          batch.batchNumber,
          batch.productName,
          batch.assignedStaff,
          batch.status,
          batch.notes,
          ...batch.ingredientsUsed.map(ingredient => ingredient.ingredientName),
          record?.remarks,
        ].some(value => value?.toLowerCase().includes(query));
      })
      .sort((left, right) => Date.parse(right.startDate.replace(/ PST$/, '')) - Date.parse(left.startDate.replace(/ PST$/, '')));
  }, [wipBatches, recordsByBatch, filter, search]);

  const openRecordForm = (batch: WipBatch) => {
    const record = recordsByBatch.get(batch.id);
    setSelectedBatch(batch);
    setFeedback(null);
    setForm({
      pasteurizationTempC: record?.pasteurizationTempC?.toString() ?? '',
      pasteurizationTimeMinutes: record?.pasteurizationTimeMinutes?.toString() ?? '',
      coolingTempC: record?.coolingTempC?.toString() ?? '',
      coolingTimeMinutes: record?.coolingTimeMinutes?.toString() ?? '',
      bestBeforeDate: record?.bestBeforeDate ?? '',
      remarks: record?.remarks ?? '',
    });
    setPackages(record?.yieldPackages.map(pack => ({
      quantity: pack.quantity.toString(),
      packSize: pack.packSize,
    })) ?? [{ quantity: '', packSize: '' }]);
  };

  const updateForm = (field: keyof RecordForm, value: string) => {
    setForm(previous => ({ ...previous, [field]: value }));
  };

  const updatePackage = (index: number, field: keyof PackageInput, value: string) => {
    setPackages(previous => previous.map((pack, packIndex) =>
      packIndex === index ? { ...pack, [field]: value } : pack,
    ));
  };

  const handleSave = (event: React.FormEvent) => {
    event.preventDefault();
    if (!selectedBatch) return;

    const yieldPackages: WipYieldPackage[] = packages.map(pack => ({
      quantity: Number(pack.quantity),
      packSize: pack.packSize.trim(),
    }));
    if (yieldPackages.length === 0 || yieldPackages.some(pack =>
      !Number.isInteger(pack.quantity) || pack.quantity <= 0 || !pack.packSize
    )) {
      setFeedback({ success: false, message: 'Enter a positive whole-number quantity and pack size for each yield row.' });
      return;
    }

    const record: WipProductionRecord = {
      id: selectedBatch.id,
      batchId: selectedBatch.id,
      pasteurizationTempC: toOptionalNumber(form.pasteurizationTempC),
      pasteurizationTimeMinutes: toOptionalNumber(form.pasteurizationTimeMinutes),
      coolingTempC: toOptionalNumber(form.coolingTempC),
      coolingTimeMinutes: toOptionalNumber(form.coolingTimeMinutes),
      yieldPackages,
      bestBeforeDate: form.bestBeforeDate || undefined,
      remarks: form.remarks.trim() || undefined,
    };
    const result = saveWipProductionRecord(record);
    setFeedback(result);
    if (result.success) setSelectedBatch(null);
  };

  const statusLabel = (status: WipBatch['status']) =>
    status.replaceAll('_', ' ').replace(/\b\w/g, letter => letter.toUpperCase());

  return (
    <div className="space-y-6">
      <section className="rounded-3xl border-2 border-slate-200 bg-white p-5 shadow-sm sm:p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="flex items-center gap-2 text-xl font-extrabold tracking-tight text-slate-900">
              <ClipboardCheck className="h-6 w-6 text-indigo-600" />
              WIP Inventory
            </h1>
            <p className="mt-1 text-xs font-medium text-slate-500">
              Production record register linked to WIP batches, with processing conditions, package yield, and best-before tracking.
            </p>
            <span className="mt-3 inline-flex rounded-full border border-indigo-200 bg-indigo-50 px-2.5 py-1 text-[10px] font-bold text-indigo-800">
              Plant Manager / Developer
            </span>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-xs text-slate-600">
            Create a batch in <strong>WIP Batches</strong> first. Its ingredient quantities and lifecycle are shared here.
          </div>
        </div>
      </section>

      <section className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4" aria-label="WIP inventory summary">
        <Metric icon={Factory} label="Active batches" value={activeBatches.length.toLocaleString()} detail="Currently in production" />
        <Metric icon={Milk} label="Milk in process" value={`${activeMilkVolume.toLocaleString()} L`} detail="Allocated to active batches" />
        <Metric icon={Package} label="Planned output" value={plannedOutput.toLocaleString()} detail="Units across active batches" />
        <Metric icon={CheckCircle2} label="Production records" value={`${wipProductionRecords.length} / ${wipBatches.length}`} detail="Batches with saved form details" />
      </section>

      {feedback && (
        <div className={`flex items-center justify-between gap-3 rounded-2xl border p-4 text-sm font-semibold ${
          feedback.success ? 'border-emerald-200 bg-emerald-50 text-emerald-900' : 'border-rose-200 bg-rose-50 text-rose-900'
        }`} role="status">
          <span className="flex items-center gap-2">
            {feedback.success ? <CheckCircle2 className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}
            {feedback.message}
          </span>
          <button type="button" onClick={() => setFeedback(null)} aria-label="Dismiss message">
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      <section className="overflow-hidden rounded-3xl border-2 border-slate-200 bg-white shadow-sm">
        <div className="flex flex-col gap-3 border-b border-slate-100 p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5">
          <div>
            <h2 className="text-sm font-extrabold text-slate-900">Production batch records</h2>
            <p className="mt-1 text-xs text-slate-500">Ingredient usage and batch status come directly from WIP Production.</p>
          </div>
          <div className="flex flex-col gap-2 sm:flex-row">
            <label className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                type="search"
                value={search}
                onChange={event => setSearch(event.target.value)}
                placeholder="Search batch, product, ingredient"
                className="w-full rounded-xl border border-slate-300 py-2 pl-9 pr-3 text-xs text-slate-800 outline-none focus:border-indigo-500 sm:w-64"
              />
            </label>
            <select
              value={filter}
              onChange={event => setFilter(event.target.value as BatchFilter)}
              aria-label="Filter production batches"
              className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-700 outline-none focus:border-indigo-500"
            >
              <option value="active">Active batches</option>
              <option value="all">All batches</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[1180px] border-collapse text-left text-xs">
            <thead className="bg-slate-50 text-[10px] uppercase tracking-wider text-slate-500">
              <tr>
                <th className="px-4 py-3 font-extrabold">Date / Batch</th>
                <th className="px-4 py-3 font-extrabold">Product / Ingredients</th>
                <th className="px-4 py-3 font-extrabold">Quantity</th>
                <th className="px-4 py-3 font-extrabold">Process</th>
                <th className="px-4 py-3 font-extrabold">Pasteurization</th>
                <th className="px-4 py-3 font-extrabold">Cooling</th>
                <th className="px-4 py-3 font-extrabold">Yield / Best before</th>
                <th className="px-4 py-3 font-extrabold">Remarks</th>
                <th className="px-4 py-3 font-extrabold">Record</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredBatches.map(batch => {
                const record = recordsByBatch.get(batch.id);
                const product = finishedGoods.find(item => item.id === batch.productId);
                return (
                  <tr key={batch.id} className="align-top text-slate-700 hover:bg-slate-50/70">
                    <td className="whitespace-nowrap px-4 py-4">
                      <div className="font-bold text-slate-900">{formatDate(batch.startDate)}</div>
                      <div className="mt-1 font-mono text-[10px] text-slate-500">{batch.batchNumber}</div>
                    </td>
                    <td className="max-w-64 px-4 py-4">
                      <div className="font-bold text-slate-900">{batch.productName}</div>
                      <div className="mt-1 space-y-0.5 text-[10px] text-slate-500">
                        {batch.ingredientsUsed.length ? batch.ingredientsUsed.map(ingredient => (
                          <div key={ingredient.ingredientId}>
                            {ingredient.ingredientName}: {ingredient.quantity.toLocaleString()} {ingredient.unit}
                          </div>
                        )) : <span>No ingredient breakdown recorded</span>}
                      </div>
                    </td>
                    <td className="whitespace-nowrap px-4 py-4">
                      <div className="font-bold text-slate-900">{batch.rawMilkVolumeUsed.toLocaleString()} L</div>
                      <div className="mt-1 text-[10px] text-slate-500">
                        Planned: {batch.targetQuantity.toLocaleString()} {product?.unit || 'units'}
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <span className={`inline-flex rounded-full px-2 py-1 text-[10px] font-bold ${
                        batch.status === 'completed' ? 'bg-emerald-100 text-emerald-800'
                          : batch.status === 'cancelled' ? 'bg-rose-100 text-rose-800'
                            : 'bg-amber-100 text-amber-800'
                      }`}>{statusLabel(batch.status)}</span>
                      <div className="mt-1 text-[10px] text-slate-500">{batch.assignedStaff}</div>
                    </td>
                    <td className="whitespace-nowrap px-4 py-4">
                      <div>{formatMeasurement(record?.pasteurizationTempC, '°C')}</div>
                      <div className="mt-1 text-[10px] text-slate-500">{formatMeasurement(record?.pasteurizationTimeMinutes, 'min')}</div>
                    </td>
                    <td className="whitespace-nowrap px-4 py-4">
                      <div>{formatMeasurement(record?.coolingTempC, '°C')}</div>
                      <div className="mt-1 text-[10px] text-slate-500">{formatMeasurement(record?.coolingTimeMinutes, 'min')}</div>
                    </td>
                    <td className="min-w-40 px-4 py-4">
                      {record?.yieldPackages.length ? record.yieldPackages.map((pack, index) => (
                        <div key={`${pack.packSize}-${index}`}>{pack.quantity.toLocaleString()} × {pack.packSize}</div>
                      )) : <span className="text-slate-400">No yield recorded</span>}
                      <div className="mt-1 text-[10px] text-slate-500">Best before: {formatDate(record?.bestBeforeDate)}</div>
                    </td>
                    <td className="max-w-48 px-4 py-4 text-slate-600">{record?.remarks || batch.notes || '—'}</td>
                    <td className="whitespace-nowrap px-4 py-4">
                      <button
                        type="button"
                        onClick={() => openRecordForm(batch)}
                        className="inline-flex items-center gap-1.5 rounded-xl border border-indigo-200 bg-indigo-50 px-3 py-2 text-[10px] font-bold text-indigo-800 transition-colors hover:bg-indigo-100"
                      >
                        {record ? <ClipboardCheck className="h-3.5 w-3.5" /> : <Plus className="h-3.5 w-3.5" />}
                        {record ? 'Edit record' : 'Add record'}
                      </button>
                    </td>
                  </tr>
                );
              })}
              {filteredBatches.length === 0 && (
                <tr>
                  <td colSpan={9} className="px-4 py-12 text-center text-sm text-slate-500">
                    {wipBatches.length === 0
                      ? 'No WIP batches are available. Start a batch in WIP Batches to create its inventory record.'
                      : 'No batches match this filter.'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      {selectedBatch && (
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-slate-950/50 p-3 sm:p-6">
          <form onSubmit={handleSave} className="my-auto w-full max-w-3xl overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-2xl">
            <header className="flex items-start justify-between gap-3 border-b border-slate-100 p-5 sm:p-6">
              <div>
                <h2 className="text-lg font-extrabold text-slate-900">WIP production record</h2>
                <p className="mt-1 text-xs font-semibold text-slate-600">
                  {selectedBatch.batchNumber} · {selectedBatch.productName} · {formatDate(selectedBatch.startDate)}
                </p>
                <p className="mt-1 text-[10px] text-slate-500">
                  Batch ingredients: {selectedBatch.ingredientsUsed.map(ingredient =>
                    `${ingredient.ingredientName} ${ingredient.quantity.toLocaleString()} ${ingredient.unit}`,
                  ).join(' · ') || 'No ingredients listed'}
                </p>
              </div>
              <button type="button" onClick={() => setSelectedBatch(null)} aria-label="Close form" className="rounded-xl p-2 text-slate-500 hover:bg-slate-100">
                <X className="h-5 w-5" />
              </button>
            </header>

            <div className="max-h-[70vh] space-y-5 overflow-y-auto p-5 sm:p-6">
              <div className="grid gap-4 sm:grid-cols-2">
                <MeasurementGroup icon={Thermometer} title="Pasteurization" temperature={form.pasteurizationTempC} time={form.pasteurizationTimeMinutes}
                  onTemperatureChange={value => updateForm('pasteurizationTempC', value)} onTimeChange={value => updateForm('pasteurizationTimeMinutes', value)} />
                <MeasurementGroup icon={Clock3} title="Cooling" temperature={form.coolingTempC} time={form.coolingTimeMinutes}
                  onTemperatureChange={value => updateForm('coolingTempC', value)} onTimeChange={value => updateForm('coolingTimeMinutes', value)} />
              </div>

              <section className="space-y-3 rounded-2xl border border-slate-200 p-4">
                <div className="flex items-center justify-between gap-2">
                  <div>
                    <h3 className="text-xs font-extrabold text-slate-900">Product yield / packs</h3>
                    <p className="mt-0.5 text-[10px] text-slate-500">Enter each pack size and the quantity produced.</p>
                  </div>
                  <button type="button" onClick={() => setPackages(previous => [...previous, { quantity: '', packSize: '' }])}
                    className="inline-flex items-center gap-1 rounded-lg border border-slate-300 px-2.5 py-1.5 text-[10px] font-bold text-slate-700 hover:bg-slate-50">
                    <Plus className="h-3 w-3" /> Add size
                  </button>
                </div>
                {packages.map((pack, index) => (
                  <div key={index} className="grid grid-cols-[1fr_1.5fr_auto] gap-2">
                    <input type="number" min="1" step="1" required value={pack.quantity} onChange={event => updatePackage(index, 'quantity', event.target.value)}
                      aria-label={`Pack quantity ${index + 1}`} placeholder="Quantity" className="min-w-0 rounded-xl border border-slate-300 px-3 py-2 text-xs outline-none focus:border-indigo-500" />
                    <input type="text" required value={pack.packSize} onChange={event => updatePackage(index, 'packSize', event.target.value)}
                      aria-label={`Pack size ${index + 1}`} placeholder="e.g. 200 mL pouch" className="min-w-0 rounded-xl border border-slate-300 px-3 py-2 text-xs outline-none focus:border-indigo-500" />
                    <button type="button" disabled={packages.length === 1} onClick={() => setPackages(previous => previous.filter((_, packageIndex) => packageIndex !== index))}
                      aria-label={`Remove pack size ${index + 1}`} className="rounded-xl px-2 text-slate-400 hover:bg-rose-50 hover:text-rose-600 disabled:opacity-30">
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </section>

              <div className="grid gap-4 sm:grid-cols-2">
                <label className="space-y-1.5">
                  <span className="flex items-center gap-1.5 text-xs font-bold text-slate-700"><CalendarDays className="h-3.5 w-3.5" /> Best-before date</span>
                  <input type="date" value={form.bestBeforeDate} onChange={event => updateForm('bestBeforeDate', event.target.value)}
                    className="w-full rounded-xl border border-slate-300 px-3 py-2 text-xs outline-none focus:border-indigo-500" />
                </label>
                <label className="space-y-1.5">
                  <span className="text-xs font-bold text-slate-700">Remarks</span>
                  <textarea rows={3} value={form.remarks} onChange={event => updateForm('remarks', event.target.value)}
                    placeholder="Quality notes or production remarks" className="w-full resize-y rounded-xl border border-slate-300 px-3 py-2 text-xs outline-none focus:border-indigo-500" />
                </label>
              </div>
            </div>

            <footer className="flex justify-end gap-2 border-t border-slate-100 bg-slate-50 p-4 sm:p-5">
              <button type="button" onClick={() => setSelectedBatch(null)} className="rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-100">Cancel</button>
              <button type="submit" className="rounded-xl bg-indigo-600 px-4 py-2.5 text-xs font-bold text-white hover:bg-indigo-700">Save production record</button>
            </footer>
          </form>
        </div>
      )}
    </div>
  );
};

const Metric: React.FC<{
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
  detail: string;
}> = ({ icon: Icon, label, value, detail }) => (
  <div className="rounded-2xl border-2 border-slate-200 bg-white p-4 shadow-sm">
    <div className="flex items-center justify-between">
      <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500">{label}</span>
      <Icon className="h-4 w-4 text-indigo-600" />
    </div>
    <div className="mt-2 text-2xl font-black text-slate-900">{value}</div>
    <p className="mt-1 text-[10px] font-medium text-slate-500">{detail}</p>
  </div>
);

const MeasurementGroup: React.FC<{
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  temperature: string;
  time: string;
  onTemperatureChange: (value: string) => void;
  onTimeChange: (value: string) => void;
}> = ({ icon: Icon, title, temperature, time, onTemperatureChange, onTimeChange }) => (
  <section className="space-y-3 rounded-2xl border border-slate-200 p-4">
    <h3 className="flex items-center gap-1.5 text-xs font-extrabold text-slate-900"><Icon className="h-4 w-4 text-indigo-600" /> {title}</h3>
    <div className="grid grid-cols-2 gap-3">
      <label className="space-y-1">
        <span className="text-[10px] font-semibold text-slate-600">Temperature (°C)</span>
        <input type="number" min="0" step="0.1" value={temperature} onChange={event => onTemperatureChange(event.target.value)}
          placeholder="e.g. 72" className="w-full rounded-xl border border-slate-300 px-3 py-2 text-xs outline-none focus:border-indigo-500" />
      </label>
      <label className="space-y-1">
        <span className="text-[10px] font-semibold text-slate-600">Time (minutes)</span>
        <input type="number" min="0" step="1" value={time} onChange={event => onTimeChange(event.target.value)}
          placeholder="e.g. 15" className="w-full rounded-xl border border-slate-300 px-3 py-2 text-xs outline-none focus:border-indigo-500" />
      </label>
    </div>
  </section>
);
