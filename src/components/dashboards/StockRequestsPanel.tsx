import React, { useMemo, useState } from 'react';
import {
  AlertCircle,
  CalendarDays,
  Check,
  ClipboardList,
  PackagePlus,
  Search,
  Trash2,
  Truck,
  X,
} from 'lucide-react';
import { useDairySync } from '../../context/DairySyncContext';
import { productCategoryOptions } from '../FinishedGoods';
import { TablePagination } from '../TablePagination';
import { usePagination } from '../../hooks/usePagination';
import type { ProductCategory, StockRequest, StockRequestStatus } from '../../types';

interface StockRequestsPanelProps {
  mode: 'request' | 'review';
  onNavigateTab?: (tab: string) => void;
}

const statusStyles: Record<StockRequestStatus, string> = {
  pending: 'bg-amber-100 text-amber-800',
  approved: 'bg-blue-100 text-blue-800',
  rejected: 'bg-rose-100 text-rose-800',
  fulfilled: 'bg-emerald-100 text-emerald-800',
  cancelled: 'bg-slate-100 text-slate-600',
};

const formatTimestamp = (value: string) => {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : date.toLocaleString();
};

export const StockRequestsPanel: React.FC<StockRequestsPanelProps> = ({ mode, onNavigateTab }) => {
  const {
    currentUser,
    isDeveloperActive,
    finishedGoods,
    stockRequests,
    createStockRequest,
    reviewStockRequest,
    cancelStockRequest,
    deleteStockRequest,
  } = useDairySync();
  const [finishedGoodId, setFinishedGoodId] = useState('');
  const [quantity, setQuantity] = useState('');
  const [neededBy, setNeededBy] = useState('');
  const [notes, setNotes] = useState('');
  const [responseNotes, setResponseNotes] = useState<Record<string, string>>({});
  const [allocationQuantities, setAllocationQuantities] = useState<Record<string, string>>({});
  const [message, setMessage] = useState<{ text: string; isError: boolean } | null>(null);
  const [deletingRequestId, setDeletingRequestId] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<ProductCategory | 'all'>('all');
  const [selectedStatus, setSelectedStatus] = useState<StockRequestStatus | 'all'>('all');

  const visibleRequests = useMemo(() => mode === 'review'
    ? stockRequests
    : stockRequests.filter(request =>
        request.requestedByEmail.toLowerCase() === currentUser.email.toLowerCase() ||
        request.requestedByName === currentUser.name
      ), [currentUser.email, currentUser.name, mode, stockRequests]);
  const orderedRequests = useMemo(() => [...visibleRequests].sort((a, b) =>
    Date.parse(b.requestedAt) - Date.parse(a.requestedAt)
  ), [visibleRequests]);
  const filteredRequests = useMemo(() => {
    const query = search.trim().toLowerCase();
    return orderedRequests.filter(request => {
      const product = finishedGoods.find(item => item.id === request.finishedGoodId);
      const matchesSearch = !query ||
        request.finishedGoodName.toLowerCase().includes(query) ||
        request.finishedGoodSku.toLowerCase().includes(query) ||
        request.status.toLowerCase().includes(query) ||
        request.notes?.toLowerCase().includes(query) ||
        request.responseNotes?.toLowerCase().includes(query);
      const matchesCategory = selectedCategory === 'all' || product?.category === selectedCategory;
      const matchesStatus = selectedStatus === 'all' || request.status === selectedStatus;
      return matchesSearch && matchesCategory && matchesStatus;
    });
  }, [finishedGoods, orderedRequests, search, selectedCategory, selectedStatus]);
  const pagination = usePagination(filteredRequests);
  const selectedProduct = finishedGoods.find(product => product.id === finishedGoodId);
  const pendingCount = stockRequests.filter(request => request.status === 'pending').length;
  const setActionMessage = (result: { success: boolean; message: string }) => {
    setMessage({ text: result.message, isError: !result.success });
  };
  const getAvailableStock = (request: StockRequest) => {
    const product = finishedGoods.find(item => item.id === request.finishedGoodId);
    return product
      ? Math.max(0, product.currentStock - product.allocatedRetail - product.allocatedFeedingProgram)
      : 0;
  };
  const getProduct = (request: StockRequest) =>
    finishedGoods.find(item => item.id === request.finishedGoodId);
  const getRemainingQuantity = (request: StockRequest) =>
    Math.max(0, request.quantity - (request.fulfilledQuantity ?? 0));
  const getSuggestedAllocation = (request: StockRequest) =>
    Math.min(getAvailableStock(request), getRemainingQuantity(request));
  const getAllocationQuantity = (request: StockRequest) =>
    Number(allocationQuantities[request.id] ?? getSuggestedAllocation(request));

  const submitRequest = (event: React.FormEvent) => {
    event.preventDefault();
    const result = createStockRequest({
      finishedGoodId,
      quantity: Number(quantity),
      neededBy: neededBy || undefined,
      notes,
    });
    setActionMessage(result);
    if (result.success) {
      setFinishedGoodId('');
      setQuantity('');
      setNeededBy('');
      setNotes('');
    }
  };

  const takeReviewAction = (
    id: string,
    status: 'approved' | 'rejected' | 'fulfilled'
  ) => {
    const request = orderedRequests.find(item => item.id === id);
    const allocationQuantity = status === 'fulfilled'
      ? request ? getAllocationQuantity(request) : 0
      : undefined;
    const result = reviewStockRequest(id, status, responseNotes[id], allocationQuantity);
    setActionMessage(result);
    if (result.success && status === 'fulfilled') {
      setAllocationQuantities(previous => {
        const next = { ...previous };
        delete next[id];
        return next;
      });
    }
  };
  const handleDeleteRequest = async (request: StockRequest) => {
    const confirmed = window.confirm(
      `Permanently delete the ${request.status} request for ${request.quantity} ${request.unit} of ${request.finishedGoodName}? Any existing inventory allocations will remain unchanged.`
    );
    if (!confirmed) return;
    setDeletingRequestId(request.id);
    try {
      const result = await deleteStockRequest(request.id);
      setMessage({ text: result.message, isError: !result.success });
    } catch (error) {
      setMessage({
        text: error instanceof Error ? error.message : 'The stock request could not be deleted.',
        isError: true,
      });
    } finally {
      setDeletingRequestId(null);
    }
  };

  return (
    <section className="bg-white border-2 border-slate-200 rounded-3xl p-5 sm:p-6 shadow-sm space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
        <div>
          <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
            {mode === 'request'
              ? <PackagePlus className="w-5 h-5 text-emerald-600" />
              : <ClipboardList className="w-5 h-5 text-teal-700" />}
            Dairy Box Stock Requests
          </h3>
          <p className="text-xs text-slate-500 mt-1">
            {mode === 'request'
              ? 'Submit replenishment requests to the Plant Manager and track their status.'
              : `${pendingCount} request${pendingCount === 1 ? '' : 's'} awaiting review. Approve before allocating available stock.`}
          </p>
        </div>
        {mode === 'review' && (
          <span className="shrink-0 rounded-full bg-amber-100 px-3 py-1 text-[11px] font-bold text-amber-800">
            {pendingCount} Pending
          </span>
        )}
      </div>

      {mode === 'request' && (
        <form onSubmit={submitRequest} className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <label className="text-xs font-bold text-slate-700">
            Finished good
            <select
              value={finishedGoodId}
              onChange={event => setFinishedGoodId(event.target.value)}
              required
              className="mt-1.5 w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm font-medium"
            >
              <option value="">Select a product</option>
              {finishedGoods.map(product => (
                <option key={product.id} value={product.id}>
                  {product.name} ({product.sku})
                </option>
              ))}
            </select>
            {selectedProduct && (
              <span className="mt-1 block text-[11px] font-medium text-slate-500">
                Current stock: {selectedProduct.currentStock} {selectedProduct.unit}
              </span>
            )}
          </label>

          <label className="text-xs font-bold text-slate-700">
            Quantity{selectedProduct ? ` (${selectedProduct.unit})` : ''}
            <input
              type="number"
              min="1"
              step="1"
              value={quantity}
              onChange={event => setQuantity(event.target.value)}
              required
              className="mt-1.5 w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm font-mono"
              placeholder="Enter whole units"
            />
          </label>

          <label className="text-xs font-bold text-slate-700">
            Needed by (optional)
            <span className="relative mt-1.5 block">
              <CalendarDays className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="date"
                min={new Date().toISOString().slice(0, 10)}
                value={neededBy}
                onChange={event => setNeededBy(event.target.value)}
                className="w-full rounded-xl border border-slate-300 bg-white py-2.5 pl-9 pr-3 text-sm"
              />
            </span>
          </label>

          <label className="text-xs font-bold text-slate-700">
            Notes for the Plant Manager (optional)
            <input
              type="text"
              maxLength={300}
              value={notes}
              onChange={event => setNotes(event.target.value)}
              className="mt-1.5 w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm"
              placeholder="Reason or delivery details"
            />
          </label>

          <div className="md:col-span-2 flex flex-wrap items-center justify-between gap-3">
            <p className="text-[11px] text-slate-500">
              Submitting a request does not change inventory. Stock is allocated when the Plant Manager fulfills it.
            </p>
            <button
              type="submit"
              disabled={finishedGoods.length === 0}
              className="inline-flex items-center gap-2 rounded-xl bg-emerald-700 px-4 py-2.5 text-xs font-extrabold text-white shadow-sm transition-colors hover:bg-emerald-800 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <PackagePlus className="w-4 h-4" />
              Submit Stock Request
            </button>
          </div>
        </form>
      )}

      {message && (
        <div className={`flex items-center gap-2 rounded-xl border px-3 py-2 text-xs font-semibold ${
          message.isError
            ? 'border-rose-200 bg-rose-50 text-rose-800'
            : 'border-emerald-200 bg-emerald-50 text-emerald-800'
        }`}>
          {message.isError ? <AlertCircle className="w-4 h-4" /> : <Check className="w-4 h-4" />}
          {message.text}
        </div>
      )}

      <div className="space-y-3">
        {mode === 'request' && (
          <div className="grid grid-cols-1 gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-3 md:grid-cols-[minmax(0,1fr)_200px_200px]">
            <label className="relative block">
              <span className="sr-only">Search stock requests</span>
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                type="search"
                value={search}
                onChange={event => setSearch(event.target.value)}
                placeholder="Search product, SKU, or notes..."
                className="w-full rounded-xl border border-slate-300 bg-white py-2.5 pl-9 pr-3 text-sm"
              />
            </label>
            <label className="text-xs font-bold text-slate-600">
              <span className="sr-only">Filter by finished goods category</span>
              <select
                aria-label="Filter by category"
                value={selectedCategory}
                onChange={event => setSelectedCategory(event.target.value as ProductCategory | 'all')}
                className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm font-medium"
              >
                <option value="all">All categories</option>
                {productCategoryOptions.map(category => (
                  <option key={category.key} value={category.key}>{category.label}</option>
                ))}
              </select>
            </label>
            <label className="text-xs font-bold text-slate-600">
              <span className="sr-only">Filter by request status</span>
              <select
                aria-label="Filter by request status"
                value={selectedStatus}
                onChange={event => setSelectedStatus(event.target.value as StockRequestStatus | 'all')}
                className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm font-medium"
              >
                <option value="all">All request statuses</option>
                {(['pending', 'approved', 'rejected', 'fulfilled', 'cancelled'] as const).map(status => (
                  <option key={status} value={status}>
                    {status.charAt(0).toUpperCase() + status.slice(1)}
                  </option>
                ))}
              </select>
            </label>
          </div>
        )}

        {filteredRequests.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-6 text-center">
            <p className="text-sm font-bold text-slate-700">
              {mode === 'request' && orderedRequests.length > 0
                ? 'No matching stock requests'
                : mode === 'request' ? 'No stock requests yet' : 'No requests to review'}
            </p>
            <p className="mt-1 text-xs text-slate-500">
              {mode === 'request' && orderedRequests.length > 0
                ? 'Try changing your search or filters.'
                : mode === 'request'
                ? 'Submit a finished goods request above when Dairy Box needs replenishment.'
                : 'New Store Outlet requests will appear here.'}
            </p>
          </div>
        ) : pagination.pageItems.map(request => {
          const product = getProduct(request);
          const available = getAvailableStock(request);
          const remaining = getRemainingQuantity(request);
          const maximumAllocation = Math.min(available, remaining);
          const allocation = getAllocationQuantity(request);
          return (
          <article key={request.id} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h4 className="text-sm font-extrabold text-slate-900">{request.finishedGoodName}</h4>
                  <span className={`rounded-full px-2.5 py-1 text-[10px] font-extrabold uppercase ${statusStyles[request.status]}`}>
                    {request.status}
                  </span>
                </div>
                <p className="mt-1 text-xs font-medium text-slate-600">
                  {request.finishedGoodSku} · {request.quantity} {request.unit}
                  {request.fulfilledQuantity !== undefined && ` · Allocated ${request.fulfilledQuantity}`}
                </p>
                <p className="mt-1 text-[11px] text-slate-500">
                  Requested by {request.requestedByName} · {formatTimestamp(request.requestedAt)}
                  {request.neededBy && ` · Needed by ${request.neededBy}`}
                </p>
                {mode === 'review' && (request.status === 'pending' || request.status === 'approved') && (
                  <div className="mt-3 rounded-xl border border-slate-200 bg-white p-3">
                    <p className="text-[11px] font-extrabold uppercase tracking-wide text-slate-600">
                      Finished-goods stock before allocation
                    </p>
                    {product ? (
                      <>
                        <div className="mt-2 grid grid-cols-2 gap-x-4 gap-y-1.5 text-xs sm:grid-cols-4">
                          <p className="text-slate-600">
                            On hand: <strong className="text-slate-900">{product.currentStock} {product.unit}</strong>
                          </p>
                          <p className="text-slate-600">
                            Retail reserved: <strong className="text-slate-900">{product.allocatedRetail} {product.unit}</strong>
                          </p>
                          <p className="text-slate-600">
                            Feeding reserved: <strong className="text-slate-900">{product.allocatedFeedingProgram} {product.unit}</strong>
                          </p>
                          <p className="text-slate-600">
                            Available: <strong className={available > 0 ? 'text-emerald-700' : 'text-rose-700'}>{available} {product.unit}</strong>
                          </p>
                        </div>
                        {request.status === 'pending' && (
                          <p className="mt-2 text-[11px] text-slate-600">
                            Approving will allocate {maximumAllocation} {product.unit} now
                            {maximumAllocation < remaining
                              ? `; ${remaining - maximumAllocation} ${product.unit} will remain approved and wait for stock.`
                              : '.'}
                          </p>
                        )}
                      </>
                    ) : (
                      <p className="mt-1 text-xs font-medium text-rose-700">
                        This finished good is no longer in the inventory catalog; no stock can be allocated.
                      </p>
                    )}
                  </div>
                )}
                {request.notes && <p className="mt-2 text-xs text-slate-700">“{request.notes}”</p>}
                {request.responseNotes && (
                  <p className="mt-2 text-xs font-medium text-slate-700">
                    Plant Manager: {request.responseNotes}
                  </p>
                )}
              </div>

              <div className="flex shrink-0 flex-wrap gap-2">
                {mode === 'request' && request.status === 'pending' && (
                  <button
                    type="button"
                    onClick={() => setActionMessage(cancelStockRequest(request.id))}
                    className="inline-flex items-center justify-center gap-1 rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-bold text-slate-700 hover:bg-slate-100"
                  >
                    <X className="w-3.5 h-3.5" />
                    Cancel
                  </button>
                )}
                {mode === 'review' && isDeveloperActive && (
                  <button
                    type="button"
                    disabled={deletingRequestId !== null}
                    onClick={() => void handleDeleteRequest(request)}
                    aria-label={`Delete ${request.finishedGoodName} stock request`}
                    title="Permanently delete stock request"
                    className="inline-flex items-center justify-center gap-1 rounded-lg border border-rose-300 bg-white px-3 py-2 text-xs font-bold text-rose-700 hover:bg-rose-50 disabled:cursor-wait disabled:opacity-50"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    {deletingRequestId === request.id ? 'Deleting...' : 'Delete'}
                  </button>
                )}
              </div>
            </div>

            {mode === 'review' && (request.status === 'pending' || request.status === 'approved') && (
              <div className="mt-4 border-t border-slate-200 pt-3 space-y-3">
                <input
                  type="text"
                  maxLength={300}
                  value={responseNotes[request.id] ?? ''}
                  onChange={event => setResponseNotes(previous => ({
                    ...previous,
                    [request.id]: event.target.value,
                  }))}
                  placeholder="Optional note for the Store Outlet"
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs"
                />
                {request.status === 'approved' && (
                  <>
                    <label className="block text-xs font-bold text-slate-700">
                      Allocate now ({request.unit}; {available} unallocated, {remaining} remaining)
                      <input
                        type="number"
                        min="1"
                        max={maximumAllocation}
                        step="1"
                        value={allocationQuantities[request.id] ?? String(maximumAllocation)}
                        onChange={event => setAllocationQuantities(previous => ({
                          ...previous,
                          [request.id]: event.target.value,
                        }))}
                        disabled={maximumAllocation < 1}
                        className="mt-1.5 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-medium disabled:bg-slate-100"
                      />
                    </label>
                    {available < remaining && (
                      <p className="text-xs font-medium text-rose-700">
                        Only {available} {request.unit} of unallocated stock is available. The approved request will automatically receive stock as it is recorded; {remaining} {request.unit} remains.
                      </p>
                    )}
                  </>
                )}
                <div className="flex flex-wrap gap-2">
                  {request.status === 'pending' ? (
                    <>
                      <button
                        type="button"
                        onClick={() => takeReviewAction(request.id, 'approved')}
                        className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-700 px-3 py-2 text-xs font-bold text-white hover:bg-emerald-800"
                      >
                        <Check className="w-3.5 h-3.5" />
                        Approve
                      </button>
                      <button
                        type="button"
                        onClick={() => takeReviewAction(request.id, 'rejected')}
                        className="inline-flex items-center gap-1.5 rounded-lg border border-rose-300 bg-white px-3 py-2 text-xs font-bold text-rose-700 hover:bg-rose-50"
                      >
                        <X className="w-3.5 h-3.5" />
                        Reject
                      </button>
                    </>
                  ) : (
                    available < 1 ? (
                      <button
                        type="button"
                        onClick={() => onNavigateTab?.('finished')}
                        className="inline-flex items-center gap-1.5 rounded-lg bg-amber-600 px-3 py-2 text-xs font-bold text-white hover:bg-amber-700"
                      >
                        <PackagePlus className="w-3.5 h-3.5" />
                        Add Finished Goods Stock
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => takeReviewAction(request.id, 'fulfilled')}
                        disabled={!Number.isInteger(allocation) || allocation < 1 ||
                          allocation > available || allocation > remaining}
                        className="inline-flex items-center gap-1.5 rounded-lg bg-teal-700 px-3 py-2 text-xs font-bold text-white hover:bg-teal-800 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        <Truck className="w-3.5 h-3.5" />
                        {allocation >= remaining
                          ? 'Allocate & Mark Fulfilled'
                          : `Allocate ${allocation} ${request.unit}`}
                      </button>
                    )
                  )}
                </div>
              </div>
            )}
          </article>
          );
        })}
        {mode === 'request' && filteredRequests.length > 0 && (
          <TablePagination
            totalItems={filteredRequests.length}
            pageIndex={pagination.pageIndex}
            pageSize={pagination.pageSize}
            pageCount={pagination.pageCount}
            onPageChange={pagination.setPageIndex}
            onPageSizeChange={pagination.setPageSize}
          />
        )}
      </div>
    </section>
  );
};
