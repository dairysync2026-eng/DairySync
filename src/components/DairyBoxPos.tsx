import React, { useMemo, useState } from 'react';
import { useDairySync } from '../context/DairySyncContext';
import { ShoppingCart, Plus, Minus, Trash2, Receipt, AlertCircle, History, X, Search, Printer, Eye, DollarSign, PackageCheck, TrendingUp } from 'lucide-react';
import { ExportMenu } from './ExportMenu';
import { downloadCsv } from '../utils/csv';

export const DairyBoxPos: React.FC = () => {
  const { finishedGoods, transactions, processRetailSale } = useDairySync();
  
  const [cart, setCart] = useState<{ productId: string; quantity: number }[]>([]);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [coldStockNotice, setColdStockNotice] = useState<string | null>(null);
  const [showSalesHistory, setShowSalesHistory] = useState(false);
  const [salesSearch, setSalesSearch] = useState('');
  const [salesPeriod, setSalesPeriod] = useState<'all' | 'today' | '7days'>('all');
  const [selectedSaleReceipt, setSelectedSaleReceipt] = useState<string | null>(null);

  const salesHistory = useMemo(() => {
    const groupedSales = new Map<string, typeof transactions>();
    transactions
      .filter(transaction => transaction.action === 'out_sale' && transaction.itemType === 'finished_good')
      .forEach(transaction => {
        const receiptNo = transaction.referenceId || transaction.id;
        const saleItems = groupedSales.get(receiptNo) || [];
        groupedSales.set(receiptNo, [...saleItems, transaction]);
      });

    return Array.from(groupedSales, ([receiptNo, items]) => ({
      receiptNo,
      timestamp: items[0].timestamp,
      cashier: items[0].performedBy,
      items,
      totalQuantity: items.reduce((sum, item) => sum + item.quantity, 0),
      totalAmount: items.every(item => typeof item.unitPrice === 'number')
        ? items.reduce((sum, item) => sum + item.quantity * (item.unitPrice || 0), 0)
        : null
    })).sort((a, b) => {
      const timeA = new Date(a.timestamp.replace(/\s+PST$/, '')).getTime();
      const timeB = new Date(b.timestamp.replace(/\s+PST$/, '')).getTime();
      return timeB - timeA;
    });
  }, [transactions]);

  const filteredSales = useMemo(() => {
    const query = salesSearch.trim().toLowerCase();
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
    const rangeStart = salesPeriod === 'today'
      ? todayStart
      : salesPeriod === '7days'
        ? now.getTime() - 7 * 24 * 60 * 60 * 1000
        : null;

    return salesHistory.filter(sale => {
      const matchesQuery = !query || sale.receiptNo.toLowerCase().includes(query) ||
        sale.cashier.toLowerCase().includes(query) ||
        sale.items.some(item => item.itemName.toLowerCase().includes(query));
      if (!matchesQuery) return false;
      if (rangeStart === null) return true;

      const saleTime = new Date(sale.timestamp.replace(/\s+PST$/, '')).getTime();
      return Number.isFinite(saleTime) && saleTime >= rangeStart;
    });
  }, [salesHistory, salesSearch, salesPeriod]);

  const selectedSale = salesHistory.find(sale => sale.receiptNo === selectedSaleReceipt) ?? null;
  const knownRevenue = filteredSales.reduce((sum, sale) => sum + (sale.totalAmount ?? 0), 0);
  const pricedSaleCount = filteredSales.filter(sale => sale.totalAmount !== null).length;
  const totalUnitsDispatched = filteredSales.reduce((sum, sale) => sum + sale.totalQuantity, 0);
  const averageTicket = pricedSaleCount ? knownRevenue / pricedSaleCount : null;

  const formatCurrency = (amount: number) => `₱${amount.toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  const exportSalesHistory = () => {
    const headers = ['Receipt Number', 'Date and Time', 'Cashier', 'Purchased Items', 'Units', 'Total Amount (PHP)'];
    const rows = filteredSales.map(sale => [
      sale.receiptNo,
      sale.timestamp,
      sale.cashier,
      sale.items.map(item => `${item.itemName} x ${item.quantity}`).join('; '),
      sale.totalQuantity,
      sale.totalAmount ?? 'Unavailable'
    ]);
    downloadCsv(`DairySync_POS_Sales_History_${new Date().toISOString().split('T')[0]}.csv`, headers, rows);
  };

  const printSalesHistory = () => {
    const printWindow = window.open('', '_blank', 'width=1000,height=800');
    if (!printWindow) return;

    const escapeHtml = (value: string) => value.replace(/[&<>"']/g, character => ({
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#39;'
    })[character] || character);
    const rows = filteredSales.map(sale => `
      <tr>
        <td>${escapeHtml(sale.receiptNo)}</td>
        <td>${escapeHtml(sale.timestamp)}</td>
        <td>${escapeHtml(sale.cashier)}</td>
        <td>${sale.items.map(item => `${escapeHtml(item.itemName)} x ${item.quantity}`).join('<br>')}</td>
        <td>${sale.totalQuantity}</td>
        <td>${sale.totalAmount === null ? 'Unavailable' : escapeHtml(formatCurrency(sale.totalAmount))}</td>
      </tr>`).join('');

    printWindow.document.write(`<!doctype html><html><head><title>Dairy Box POS Sales History</title><style>
      body{font:14px Arial,sans-serif;color:#0f172a;padding:24px}h1{font-size:20px}p{color:#475569}
      table{width:100%;border-collapse:collapse;margin-top:20px}th,td{border:1px solid #cbd5e1;padding:9px;text-align:left;vertical-align:top}
      th{background:#f1f5f9;text-transform:uppercase;font-size:11px} @media print{body{padding:0}}
    </style></head><body><h1>Dairy Box POS Sales History</h1><p>${filteredSales.length} registered sales</p>
    <table><thead><tr><th>Receipt #</th><th>Date &amp; Time</th><th>Cashier</th><th>Purchased Items</th><th>Units</th><th>Total Amount</th></tr></thead>
    <tbody>${rows || '<tr><td colspan="6">No sales match the selected filters.</td></tr>'}</tbody></table></body></html>`);
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
  };

  const addToCart = (productId: string) => {
    setFeedback(null);
    setColdStockNotice(null);
    setCart(prev => {
      const existing = prev.find(i => i.productId === productId);
      if (existing) {
        return prev.map(i => i.productId === productId ? { ...i, quantity: i.quantity + 1 } : i);
      }
      return [...prev, { productId, quantity: 1 }];
    });
  };

  const updateQuantity = (productId: string, delta: number) => {
    setColdStockNotice(null);
    setCart(prev => prev.map(i => {
      if (i.productId === productId) {
        const newQty = i.quantity + delta;
        return newQty > 0 ? { ...i, quantity: newQty } : i;
      }
      return i;
    }));
  };

  const removeFromCart = (productId: string) => {
    setColdStockNotice(null);
    setCart(prev => prev.filter(i => i.productId !== productId));
  };

  const totalAmount = cart.reduce((sum, item) => {
    const fg = finishedGoods.find(p => p.id === item.productId);
    return sum + ((fg?.unitPrice || 0) * item.quantity);
  }, 0);

  const handleCheckout = () => {
    if (cart.length === 0) return;

    const res = processRetailSale(cart);
    if (res.success) {
      setFeedback({ type: 'success', text: res.message });
      setColdStockNotice('Cold stock has been updated and synced to the inventory ledger after this sale.');
      setCart([]);
    } else {
      setFeedback({ type: 'error', text: res.message });
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="bg-white border-2 border-slate-200 p-5 sm:p-6 rounded-3xl shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-slate-900">
        <div>
          <h1 className="text-xl font-bold text-slate-900 flex items-center space-x-2 tracking-tight">
            <ShoppingCart className="w-6 h-6 text-emerald-600" />
            <span>MMSU Dairy Box Retail Outlet POS</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1 font-medium">
            Walk-in sales terminal with instant cold storage inventory deduction
          </p>
        </div>
        <button
          type="button"
          onClick={() => setShowSalesHistory(true)}
          className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-2.5 text-xs font-bold text-emerald-800 hover:bg-emerald-100"
        >
          <History className="h-4 w-4" />
          <span>Sales History</span>
          <span className="rounded-full bg-white px-2 py-0.5 font-mono text-[10px]">{salesHistory.length}</span>
        </button>
      </div>

      {feedback && (
        <div className={`p-4 rounded-2xl border-2 text-xs flex items-center justify-between font-semibold ${
          feedback.type === 'success' ? 'bg-emerald-50 border-emerald-200 text-emerald-800' : 'bg-rose-50 border-rose-200 text-rose-800'
        }`}>
          <span className="font-bold">{feedback.text}</span>
          <button onClick={() => setFeedback(null)} className="text-slate-400 hover:text-slate-900 font-bold">✕</button>
        </div>
      )}

      {coldStockNotice && (
        <div className="relative">
          <div className="bg-amber-50 border-2 border-amber-200 rounded-2xl p-4 shadow-sm max-w-xl">
            <div className="flex items-start gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-amber-100 text-amber-700">
                <AlertCircle className="w-4 h-4" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-extrabold text-amber-900">Cold Stock Updated</p>
                <p className="text-xs text-amber-800 mt-1">{coldStockNotice}</p>
              </div>
              <button onClick={() => setColdStockNotice(null)} className="text-amber-600 hover:text-amber-900 font-bold">✕</button>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left 2 Cols: Product Catalog */}
        <div className="lg:col-span-2 space-y-4">
          <h2 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Select Products for Sale</h2>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {finishedGoods.map(fg => (
              <div 
                key={fg.id} 
                className="bg-white border-2 border-slate-200 rounded-3xl p-5 shadow-sm flex flex-col justify-between space-y-3 hover:border-slate-300 transition-all text-slate-900"
              >
                <div>
                  <div className="flex justify-between items-start">
                    <span className="text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200">{fg.sku}</span>
                    <span className="text-xs font-extrabold text-emerald-600 font-mono">₱{fg.unitPrice}.00</span>
                  </div>
                  <h3 className="font-extrabold text-slate-900 text-sm mt-2">{fg.name}</h3>
                </div>

                <button
                  onClick={() => addToCart(fg.id)}
                  disabled={fg.currentStock <= 0}
                  className={`w-full py-2.5 rounded-2xl text-xs font-bold shadow-sm flex items-center justify-center space-x-1.5 transition-all ${
                    fg.currentStock <= 0 
                      ? 'bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed'
                      : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-100'
                  }`}
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>{fg.currentStock <= 0 ? 'Out of Stock' : 'Add to Cart'}</span>
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Right 1 Col: Cart & Checkout */}
        <div className="bg-white border-2 border-slate-200 rounded-3xl p-6 shadow-sm space-y-4 flex flex-col justify-between min-h-[450px] text-slate-900">
          <div>
            <div className="flex items-center justify-between border-b-2 border-slate-100 pb-3">
              <h2 className="text-base font-extrabold text-slate-900 flex items-center space-x-2">
                <Receipt className="w-5 h-5 text-emerald-600" />
                <span>Retail Cart</span>
              </h2>
              <span className="text-xs font-mono font-bold bg-slate-100 border border-slate-200 px-2.5 py-1 rounded-full text-slate-700">
                {cart.length} Items
              </span>
            </div>

            <div className="divide-y divide-slate-100 my-3 max-h-64 overflow-y-auto pr-1">
              {cart.length === 0 ? (
                <p className="text-center py-10 text-xs text-slate-400 font-medium">Cart is empty. Select items to scan or click.</p>
              ) : (
                cart.map(item => {
                  const fg = finishedGoods.find(p => p.id === item.productId);
                  const subtotal = (fg?.unitPrice || 0) * item.quantity;

                  return (
                    <div key={item.productId} className="py-3 flex items-center justify-between text-xs">
                      <div className="space-y-0.5">
                        <p className="font-bold text-slate-900">{fg?.name}</p>
                        <p className="text-[11px] text-slate-500 font-medium">₱{fg?.unitPrice}.00 x {item.quantity}</p>
                      </div>

                      <div className="flex items-center space-x-2">
                        <div className="flex items-center space-x-1 bg-slate-100 rounded-xl p-1 border border-slate-200">
                          <button onClick={() => updateQuantity(item.productId, -1)} className="p-0.5 text-slate-600 hover:text-slate-900">
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="font-mono font-bold text-slate-900 px-1.5">{item.quantity}</span>
                          <button onClick={() => updateQuantity(item.productId, 1)} className="p-0.5 text-slate-600 hover:text-slate-900">
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>
                        <span className="font-mono font-bold text-emerald-600">₱{subtotal}.00</span>
                        <button onClick={() => removeFromCart(item.productId)} className="text-slate-400 hover:text-rose-600">
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          <div className="pt-4 border-t-2 border-slate-100 space-y-3">
            <div className="flex justify-between items-baseline">
              <span className="text-xs text-slate-500 font-bold uppercase tracking-wider">Total Price:</span>
              <span className="text-2xl font-extrabold text-emerald-600 font-mono">₱{totalAmount}.00</span>
            </div>

            <button
              onClick={handleCheckout}
              disabled={cart.length === 0}
              className={`w-full py-3.5 rounded-2xl font-extrabold text-xs uppercase tracking-wider shadow-md transition-all ${
                cart.length === 0 
                  ? 'bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed shadow-none' 
                  : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-100'
              }`}
            >
              Complete Sale & Sync Inventory
            </button>
          </div>

        </div>

      </div>

      {showSalesHistory && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-2 sm:p-5" role="presentation">
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="pos-sales-history-title"
            className="flex max-h-[92vh] w-full max-w-6xl flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white text-slate-900 shadow-2xl"
          >
            <header className="flex flex-col gap-4 border-b border-slate-200 bg-slate-50/70 p-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
              <div className="flex min-w-0 items-center gap-3">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-emerald-200 bg-emerald-100 text-emerald-700">
                  <History className="h-5 w-5" />
                </span>
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 id="pos-sales-history-title" className="text-base font-extrabold">Dairy Box POS Sales History</h2>
                    <span className="rounded-full border border-emerald-200 bg-emerald-100 px-2.5 py-0.5 text-[10px] font-bold text-emerald-800">
                      {salesHistory.length} Completed Sales
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-slate-500">Archive register of walk-in sales tickets, itemized quantities and recorded revenue</p>
                </div>
              </div>
              <div className="flex shrink-0 items-center gap-2 self-end sm:self-auto">
                <ExportMenu
                  onPdf={printSalesHistory}
                  onCsv={exportSalesHistory}
                  className="bg-white hover:bg-slate-100 text-slate-700 border border-slate-200"
                  menuClassName="bg-white border-slate-200 text-slate-700"
                />
                <button
                  type="button"
                  onClick={printSalesHistory}
                  aria-label="Print sales history"
                  title="Print sales history"
                  className="rounded-xl border border-slate-200 bg-white p-2.5 text-slate-600 hover:bg-slate-100"
                >
                  <Printer className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={() => setShowSalesHistory(false)}
                  aria-label="Close sales history"
                  title="Close sales history"
                  className="rounded-xl p-2.5 text-slate-400 hover:bg-slate-200 hover:text-slate-800"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </header>
            <div className="min-h-0 space-y-5 overflow-y-auto p-4 sm:p-6">
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-3 sm:gap-4">
                <article className="flex items-center justify-between rounded-xl border border-emerald-200 bg-emerald-50/70 p-4">
                  <div>
                    <p className="text-[10px] font-extrabold uppercase text-emerald-700">Gross Retail Revenue</p>
                    <p className="mt-2 font-mono text-xl font-black text-slate-900">{formatCurrency(knownRevenue)}</p>
                    <p className="mt-1 text-[10px] text-slate-500">From {pricedSaleCount} sales with saved prices</p>
                  </div>
                  <span className="rounded-xl bg-emerald-100 p-3 text-emerald-700"><DollarSign className="h-5 w-5" /></span>
                </article>
                <article className="flex items-center justify-between rounded-xl border border-indigo-200 bg-indigo-50/60 p-4">
                  <div>
                    <p className="text-[10px] font-extrabold uppercase text-indigo-700">Total Units Dispatched</p>
                    <p className="mt-2 font-mono text-xl font-black text-slate-900">{totalUnitsDispatched.toLocaleString()}</p>
                    <p className="mt-1 text-[10px] text-slate-500">Finished goods inventory deducted</p>
                  </div>
                  <span className="rounded-xl bg-indigo-100 p-3 text-indigo-700"><PackageCheck className="h-5 w-5" /></span>
                </article>
                <article className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 p-4">
                  <div>
                    <p className="text-[10px] font-extrabold uppercase text-slate-600">Average Ticket Size</p>
                    <p className="mt-2 font-mono text-xl font-black text-slate-900">{averageTicket === null ? '—' : formatCurrency(averageTicket)}</p>
                    <p className="mt-1 text-[10px] text-slate-500">Average per priced sale</p>
                  </div>
                  <span className="rounded-xl bg-slate-200 p-3 text-slate-600"><TrendingUp className="h-5 w-5" /></span>
                </article>
              </div>

              <div className="flex flex-col gap-3 rounded-xl border border-slate-200 bg-slate-50 p-3 sm:flex-row sm:items-center">
                <div className="relative min-w-0 flex-1">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <input
                    type="search"
                    value={salesSearch}
                    onChange={event => setSalesSearch(event.target.value)}
                    placeholder="Search by receipt #, product name, or cashier..."
                    className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-9 pr-3 text-xs text-slate-800 outline-none focus:border-emerald-400"
                  />
                </div>
                <div className="flex shrink-0 gap-1.5" aria-label="Sales history time range">
                  {(['all', 'today', '7days'] as const).map(period => (
                    <button
                      key={period}
                      type="button"
                      onClick={() => setSalesPeriod(period)}
                      aria-pressed={salesPeriod === period}
                      className={`rounded-lg border px-3 py-2 text-[11px] font-bold transition-colors ${salesPeriod === period
                        ? 'border-slate-900 bg-slate-900 text-white'
                        : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-100'}`}
                    >
                      {period === 'all' ? 'All Time' : period === 'today' ? 'Today' : 'Last 7 Days'}
                    </button>
                  ))}
                </div>
              </div>

              <div className="overflow-x-auto rounded-xl border border-slate-200">
                <table className="w-full min-w-[900px] table-fixed border-collapse text-left">
                  <thead className="bg-slate-100 text-[9px] font-extrabold uppercase text-slate-600">
                    <tr>
                      <th className="w-[12%] px-3 py-3">Receipt #</th>
                      <th className="w-[18%] px-3 py-3">Date &amp; Time</th>
                      <th className="w-[16%] px-3 py-3">Cashier / Staff</th>
                      <th className="w-[31%] px-3 py-3">Purchased Items</th>
                      <th className="w-[8%] px-3 py-3 text-center">Units</th>
                      <th className="w-[11%] px-3 py-3 text-right">Total Amount</th>
                      <th className="w-[4%] px-3 py-3 text-center">Receipt</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 bg-white text-[11px]">
                    {filteredSales.length === 0 ? (
                      <tr><td colSpan={7} className="px-4 py-12 text-center text-slate-500">No sales match this search or time range.</td></tr>
                    ) : filteredSales.map(sale => (
                      <tr key={sale.receiptNo} className="align-top hover:bg-slate-50/80">
                        <td className="px-3 py-3"><span className="break-all rounded-md bg-slate-100 px-2 py-1 font-mono text-[10px] font-bold text-slate-700">{sale.receiptNo}</span></td>
                        <td className="px-3 py-3 text-slate-600">{sale.timestamp}</td>
                        <td className="px-3 py-3 font-medium text-slate-700">{sale.cashier}</td>
                        <td className="px-3 py-3 text-slate-700">
                          <div className="space-y-1">
                            {sale.items.slice(0, 2).map(item => (
                              <p key={item.id} className="truncate">{item.itemName} <span className="text-slate-400">×{item.quantity}</span></p>
                            ))}
                            {sale.items.length > 2 && <p className="font-semibold text-indigo-600">+ {sale.items.length - 2} more line items</p>}
                          </div>
                        </td>
                        <td className="px-3 py-3 text-center font-mono font-bold text-slate-700">{sale.totalQuantity}</td>
                        <td className="px-3 py-3 text-right font-mono font-extrabold text-emerald-700" title={sale.totalAmount === null ? 'Prices were not saved for this older sale' : undefined}>
                          {sale.totalAmount === null ? '—' : formatCurrency(sale.totalAmount)}
                        </td>
                        <td className="px-3 py-3 text-center">
                          <button
                            type="button"
                            onClick={() => setSelectedSaleReceipt(sale.receiptNo)}
                            aria-label={`View receipt ${sale.receiptNo} and purchased products`}
                            title="View receipt and purchased products"
                            className="rounded-md p-1.5 text-slate-500 hover:bg-indigo-50 hover:text-indigo-700"
                          >
                            <Eye className="h-4 w-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
            <footer className="flex flex-col gap-3 border-t border-slate-200 bg-slate-50 px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-6">
              <p className="text-[11px] text-slate-500">Showing {filteredSales.length} of {salesHistory.length} total registered receipts</p>
              <button
                type="button"
                onClick={() => setShowSalesHistory(false)}
                className="rounded-lg bg-slate-900 px-4 py-2 text-xs font-bold text-white hover:bg-slate-700"
              >
                Close Sales History
              </button>
            </footer>
          </section>
        </div>
      )}

      {selectedSale && showSalesHistory && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-950/50 p-4" role="presentation">
          <section role="dialog" aria-modal="true" aria-labelledby="sale-details-title" className="w-full max-w-lg rounded-2xl bg-white p-5 text-slate-900 shadow-2xl">
            <header className="flex items-start justify-between border-b border-slate-200 pb-3">
              <div>
                <h2 id="sale-details-title" className="font-extrabold">Sale Receipt</h2>
                <p className="mt-1 font-mono text-xs text-slate-500">{selectedSale.receiptNo}</p>
              </div>
              <button type="button" onClick={() => setSelectedSaleReceipt(null)} aria-label="Close sale details" className="rounded-lg p-2 text-slate-500 hover:bg-slate-100">
                <X className="h-4 w-4" />
              </button>
            </header>
            <p className="py-3 text-xs text-slate-600">{selectedSale.timestamp} · {selectedSale.cashier}</p>
            <ul className="max-h-[45vh] space-y-3 overflow-y-auto border-y border-slate-100 py-3 text-xs">
              {selectedSale.items.map(item => (
                <li key={item.id} className="flex justify-between gap-3">
                  <span>{item.itemName} × {item.quantity}</span>
                  <span className="shrink-0 font-mono text-slate-600">
                    {typeof item.unitPrice === 'number' ? formatCurrency(item.unitPrice * item.quantity) : `${item.quantity} ${item.unit}`}
                  </span>
                </li>
              ))}
            </ul>
            <div className="flex justify-between pt-3 text-sm font-extrabold">
              <span>Total</span>
              <span className="text-emerald-700">{selectedSale.totalAmount === null ? 'Unavailable' : formatCurrency(selectedSale.totalAmount)}</span>
            </div>
          </section>
        </div>
      )}

    </div>
  );
};
