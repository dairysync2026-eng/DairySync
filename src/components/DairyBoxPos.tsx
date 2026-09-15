import React, { useState } from 'react';
import { useDairySync } from '../context/DairySyncContext';
import { ShoppingCart, Plus, Minus, Trash2, CheckCircle2, Receipt, AlertCircle } from 'lucide-react';

export const DairyBoxPos: React.FC = () => {
  const { finishedGoods, processRetailSale } = useDairySync();
  
  const [cart, setCart] = useState<{ productId: string; quantity: number }[]>([]);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [lastReceipt, setLastReceipt] = useState<any | null>(null);

  const addToCart = (productId: string) => {
    setFeedback(null);
    setCart(prev => {
      const existing = prev.find(i => i.productId === productId);
      if (existing) {
        return prev.map(i => i.productId === productId ? { ...i, quantity: i.quantity + 1 } : i);
      }
      return [...prev, { productId, quantity: 1 }];
    });
  };

  const updateQuantity = (productId: string, delta: number) => {
    setCart(prev => prev.map(i => {
      if (i.productId === productId) {
        const newQty = i.quantity + delta;
        return newQty > 0 ? { ...i, quantity: newQty } : i;
      }
      return i;
    }));
  };

  const removeFromCart = (productId: string) => {
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
      setLastReceipt({
        receiptNo: `POS-REC-${Math.floor(1000 + Math.random() * 9000)}`,
        date: new Date().toLocaleString() + ' PST',
        items: cart.map(i => {
          const fg = finishedGoods.find(p => p.id === i.productId);
          return {
            name: fg?.name || '',
            qty: i.quantity,
            price: fg?.unitPrice || 0,
            subtotal: (fg?.unitPrice || 0) * i.quantity
          };
        }),
        total: totalAmount
      });

      setFeedback({ type: 'success', text: res.message });
      setCart([]);
    } else {
      setFeedback({ type: 'error', text: res.message });
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="bg-white border-2 border-slate-200 p-6 rounded-3xl shadow-sm flex items-center justify-between text-slate-900">
        <div>
          <h1 className="text-xl font-bold text-slate-900 flex items-center space-x-2 tracking-tight">
            <ShoppingCart className="w-6 h-6 text-emerald-600" />
            <span>MMSU Dairy Box Retail Outlet POS</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1 font-medium">
            Walk-in sales terminal with instant cold storage inventory deduction
          </p>
        </div>
      </div>

      {feedback && (
        <div className={`p-4 rounded-2xl border-2 text-xs flex items-center justify-between font-semibold ${
          feedback.type === 'success' ? 'bg-emerald-50 border-emerald-200 text-emerald-800' : 'bg-rose-50 border-rose-200 text-rose-800'
        }`}>
          <span className="font-bold">{feedback.text}</span>
          <button onClick={() => setFeedback(null)} className="text-slate-400 hover:text-slate-900 font-bold">✕</button>
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
                  <p className="text-xs text-slate-500 mt-0.5 font-medium">Cold Stock: <strong className="text-slate-900 font-bold">{fg.currentStock} {fg.unit}</strong></p>
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

      {/* Last Receipt Preview Modal */}
      {lastReceipt && (
        <div className="bg-white border-2 border-slate-200 rounded-3xl p-6 shadow-sm space-y-3 max-w-md text-slate-900">
          <div className="flex items-center justify-between border-b-2 border-slate-100 pb-2">
            <span className="text-xs font-bold text-emerald-600 uppercase tracking-wider">Latest POS Sale Digital Receipt</span>
            <span className="text-[10px] font-mono font-bold text-slate-500">{lastReceipt.receiptNo}</span>
          </div>
          <div className="text-xs space-y-1 text-slate-700 font-medium">
            {lastReceipt.items.map((i: any, idx: number) => (
              <div key={idx} className="flex justify-between">
                <span>{i.name} x {i.qty}</span>
                <span className="font-mono font-bold">₱{i.subtotal}.00</span>
              </div>
            ))}
            <div className="pt-2 border-t-2 border-slate-100 flex justify-between font-bold text-slate-900 text-sm">
              <span>Total Paid:</span>
              <span className="text-emerald-600 font-mono font-extrabold">₱{lastReceipt.total}.00</span>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
