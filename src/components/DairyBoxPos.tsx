import React, { useMemo, useState } from 'react';
import { useDairySync } from '../context/DairySyncContext';
import { ShoppingCart, Plus, Minus, Trash2, CheckCircle2, Receipt, AlertCircle, History, X } from 'lucide-react';

export const DairyBoxPos: React.FC = () => {
  const { finishedGoods, transactions, processRetailSale } = useDairySync();
  
  const [cart, setCart] = useState<{ productId: string; quantity: number }[]>([]);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [coldStockNotice, setColdStockNotice] = useState<string | null>(null);
  const [showSalesHistory, setShowSalesHistory] = useState(false);

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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-3 sm:p-6" role="presentation">
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="pos-sales-history-title"
            className="flex max-h-[90vh] w-full max-w-3xl flex-col overflow-hidden rounded-2xl bg-white text-slate-900 shadow-2xl"
          >
            <header className="flex items-center justify-between border-b border-slate-200 p-4 sm:p-5">
              <div>
                <h2 id="pos-sales-history-title" className="text-lg font-extrabold">Sales History</h2>
                <p className="mt-1 text-xs text-slate-500">Completed Dairy Box POS transactions</p>
              </div>
              <button
                type="button"
                onClick={() => setShowSalesHistory(false)}
                aria-label="Close sales history"
                className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-900"
              >
                <X className="h-5 w-5" />
              </button>
            </header>
            <div className="overflow-y-auto p-4 sm:p-5">
              {salesHistory.length === 0 ? (
                <p className="py-12 text-center text-sm text-slate-500">No completed sales recorded yet.</p>
              ) : (
                <div className="space-y-3">
                  {salesHistory.map(sale => (
                    <article key={sale.receiptNo} className="rounded-xl border border-slate-200 p-4">
                      <div className="flex flex-col gap-2 border-b border-slate-100 pb-3 sm:flex-row sm:items-start sm:justify-between">
                        <div>
                          <h3 className="font-mono text-sm font-bold text-slate-900">{sale.receiptNo}</h3>
                          <p className="mt-1 text-xs text-slate-500">{sale.timestamp} · {sale.cashier}</p>
                        </div>
                        <div className="text-left sm:text-right">
                          <p className="text-xs font-semibold text-slate-600">{sale.totalQuantity} units</p>
                          <p className="mt-1 text-sm font-extrabold text-emerald-700">
                            {sale.totalAmount === null ? 'Total unavailable' : `₱${sale.totalAmount.toLocaleString()}.00`}
                          </p>
                        </div>
                      </div>
                      <ul className="mt-3 space-y-2 text-xs">
                        {sale.items.map(item => (
                          <li key={item.id} className="flex justify-between gap-3 text-slate-700">
                            <span>{item.itemName} × {item.quantity}</span>
                            <span className="shrink-0 font-mono text-slate-500">
                              {typeof item.unitPrice === 'number' ? `₱${(item.quantity * item.unitPrice).toLocaleString()}.00` : `${item.quantity} ${item.unit}`}
                            </span>
                          </li>
                        ))}
                      </ul>
                    </article>
                  ))}
                </div>
              )}
            </div>
          </section>
        </div>
      )}

    </div>
  );
};
