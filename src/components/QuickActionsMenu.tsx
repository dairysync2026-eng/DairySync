import React, { useState } from 'react';
import { useDairySync } from '../context/DairySyncContext';
import { 
  Zap, 
  Plus, 
  Truck, 
  Snowflake, 
  X, 
  CheckCircle2, 
  AlertTriangle, 
  ClipboardCheck,
  Package
} from 'lucide-react';

export const QuickActionsMenu: React.FC = () => {
  const { 
    ingredients, 
    finishedGoods, 
    quickRegisterIngredientArrival, 
    quickLogFinishedBatch 
  } = useDairySync();

  const [isOpen, setIsOpen] = useState(false);
  const [activeModal, setActiveModal] = useState<'arrival' | 'finished_batch' | null>(null);

  // Raw Ingredient Arrival Form State
  const [arrivalIngredientId, setArrivalIngredientId] = useState<string>(ingredients[0]?.id || 'ing-1');
  const [arrivalQty, setArrivalQty] = useState<number>(100);
  const [supplierReceipt, setSupplierReceipt] = useState<string>('COOP-REC-' + Math.floor(1000 + Math.random() * 9000));
  const [arrivalNotes, setArrivalNotes] = useState<string>('San Nicolas Dairy Cooperative morning delivery');

  // Finished Batch Log Form State
  const [finishedProductId, setFinishedProductId] = useState<string>(finishedGoods[0]?.id || 'fg-1');
  const [finishedQty, setFinishedQty] = useState<number>(200);
  const [finishedNotes, setFinishedNotes] = useState<string>('Express packaging run stored in Cold Room 1');

  // Feedback Toast State
  const [toastMessage, setToastMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const selectedArrivalIng = ingredients.find(i => i.id === arrivalIngredientId);
  const selectedFg = finishedGoods.find(fg => fg.id === finishedProductId);

  const handleArrivalSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const res = quickRegisterIngredientArrival({
      ingredientId: arrivalIngredientId,
      quantityAdded: Number(arrivalQty),
      supplierReceipt,
      notes: arrivalNotes
    });

    if (res.success) {
      setToastMessage({ type: 'success', text: res.message });
      setActiveModal(null);
      setIsOpen(false);
      setTimeout(() => setToastMessage(null), 5000);
    } else {
      setToastMessage({ type: 'error', text: res.message });
    }
  };

  const handleFinishedBatchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const res = quickLogFinishedBatch({
      productId: finishedProductId,
      quantity: Number(finishedQty),
      notes: finishedNotes
    });

    if (res.success) {
      setToastMessage({ type: 'success', text: res.message });
      setActiveModal(null);
      setIsOpen(false);
      setTimeout(() => setToastMessage(null), 5000);
    } else {
      setToastMessage({ type: 'error', text: res.message });
    }
  };

  return (
    <>
      {/* Toast Notification */}
      {toastMessage && (
        <div 
          id="quick-actions-toast"
          className={`fixed top-20 right-6 z-50 p-4 rounded-2xl shadow-2xl border-2 flex items-center space-x-3 text-xs font-semibold animate-in slide-in-from-top-4 duration-200 ${
            toastMessage.type === 'success' 
              ? 'bg-emerald-500 text-white border-emerald-400 shadow-emerald-900/30' 
              : 'bg-rose-600 text-white border-rose-500 shadow-rose-900/30'
          }`}
        >
          {toastMessage.type === 'success' ? <CheckCircle2 className="w-5 h-5 shrink-0" /> : <AlertTriangle className="w-5 h-5 shrink-0" />}
          <span>{toastMessage.text}</span>
          <button onClick={() => setToastMessage(null)} className="p-1 hover:opacity-75">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Floating Action Button Container */}
      <div id="quick-actions-fab-container" className="fixed bottom-6 right-6 z-40 flex flex-col items-end space-y-3">
        {/* Expanded Speed-Dial Buttons */}
        {isOpen && (
          <div className="flex flex-col items-end space-y-2 animate-in fade-in slide-in-from-bottom-3 duration-200">
            {/* Action 1: Register Raw Ingredient Arrival */}
            <button
              id="btn-quick-arrival"
              type="button"
              onClick={() => setActiveModal('arrival')}
              className="flex items-center space-x-2 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 hover:bg-slate-50 dark:hover:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 px-4 py-2.5 rounded-2xl shadow-xl text-xs font-bold transition-all transform hover:-translate-y-0.5"
            >
              <Truck className="w-4 h-4 text-amber-500" />
              <span>Register Raw Ingredient Arrival</span>
            </button>

            {/* Action 2: Log Finished Batch */}
            <button
              id="btn-quick-finished-batch"
              type="button"
              onClick={() => setActiveModal('finished_batch')}
              className="flex items-center space-x-2 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 hover:bg-slate-50 dark:hover:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 px-4 py-2.5 rounded-2xl shadow-xl text-xs font-bold transition-all transform hover:-translate-y-0.5"
            >
              <Snowflake className="w-4 h-4 text-teal-500" />
              <span>Log Finished Goods Batch</span>
            </button>
          </div>
        )}

        {/* Primary FAB Trigger (Icon Only) */}
        <button
          id="btn-quick-actions-fab"
          type="button"
          aria-label={isOpen ? 'Close Quick Actions' : 'Quick Actions'}
          onClick={() => setIsOpen(!isOpen)}
          className={`w-12 h-12 rounded-full flex items-center justify-center shadow-2xl transition-all duration-200 transform hover:scale-110 active:scale-95 border-2 ${
            isOpen 
              ? 'bg-slate-900 text-white border-slate-700 shadow-slate-950/40' 
              : 'bg-indigo-600 hover:bg-indigo-700 text-white border-indigo-500/50 shadow-indigo-900/40'
          }`}
          title={isOpen ? 'Close Quick Actions' : 'Quick Actions'}
        >
          {isOpen ? (
            <X className="w-5 h-5 text-amber-400" />
          ) : (
            <Zap className="w-5 h-5 text-white" />
          )}
        </button>
      </div>

      {/* Modal 1: Register Raw Ingredient Arrival */}
      {activeModal === 'arrival' && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in duration-150">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="flex items-center space-x-2.5">
                <div className="p-2.5 rounded-xl bg-amber-100 dark:bg-amber-950/60 text-amber-600">
                  <Truck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    Register Raw Material Arrival
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Instant cooperative or supplier intake without switching tabs
                  </p>
                </div>
              </div>
              <button 
                type="button" 
                onClick={() => setActiveModal(null)} 
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleArrivalSubmit} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Raw Material Item:
                </label>
                <select
                  id="select-arrival-ingredient"
                  value={arrivalIngredientId}
                  onChange={(e) => setArrivalIngredientId(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
                >
                  {ingredients.map(ing => (
                    <option key={ing.id} value={ing.id}>
                      {ing.name} ({ing.currentStock} {ing.unit} on hand)
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Delivered Quantity ({selectedArrivalIng?.unit || 'units'}):
                  </label>
                  <input
                    id="input-arrival-quantity"
                    type="number"
                    min="1"
                    required
                    value={arrivalQty}
                    onChange={(e) => setArrivalQty(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-slate-100 font-mono font-bold focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Delivery DR / Waybill:
                  </label>
                  <input
                    id="input-arrival-receipt"
                    type="text"
                    value={supplierReceipt}
                    onChange={(e) => setSupplierReceipt(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-slate-100 font-mono focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Supplier / Notes:
                </label>
                <input
                  id="input-arrival-notes"
                  type="text"
                  value={arrivalNotes}
                  onChange={(e) => setArrivalNotes(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {selectedArrivalIng && (
                <div className="p-3 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/60 rounded-xl text-amber-800 dark:text-amber-200">
                  <span className="font-bold block">Summary:</span>
                  Stock will increase from <span className="font-mono font-bold">{selectedArrivalIng.currentStock} {selectedArrivalIng.unit}</span> to{' '}
                  <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">
                    {selectedArrivalIng.currentStock + Number(arrivalQty)} {selectedArrivalIng.unit}
                  </span>.
                </div>
              )}

              <div className="flex items-center justify-end space-x-3 pt-2">
                <button
                  type="button"
                  onClick={() => setActiveModal(null)}
                  className="px-4 py-2 font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button
                  id="btn-submit-quick-arrival"
                  type="submit"
                  className="flex items-center space-x-1.5 px-4 py-2 font-semibold text-white bg-amber-600 hover:bg-amber-700 rounded-xl shadow transition-all"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Commit Arrival</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal 2: Log Finished Goods Batch */}
      {activeModal === 'finished_batch' && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in duration-150">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="flex items-center space-x-2.5">
                <div className="p-2.5 rounded-xl bg-teal-100 dark:bg-teal-950/60 text-teal-600">
                  <Snowflake className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    Log Finished Goods Batch
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Direct entry into Cold Storage registry & WIP batch history
                  </p>
                </div>
              </div>
              <button 
                type="button" 
                onClick={() => setActiveModal(null)} 
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleFinishedBatchSubmit} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Finished Product:
                </label>
                <select
                  id="select-finished-product"
                  value={finishedProductId}
                  onChange={(e) => setFinishedProductId(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
                >
                  {finishedGoods.map(fg => (
                    <option key={fg.id} value={fg.id}>
                      {fg.name} ({fg.currentStock} {fg.unit} in {fg.location})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Completed Output ({selectedFg?.unit || 'units'}):
                </label>
                <input
                  id="input-finished-quantity"
                  type="number"
                  min="1"
                  required
                  value={finishedQty}
                  onChange={(e) => setFinishedQty(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-slate-100 font-mono font-bold focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Production / Storage Notes:
                </label>
                <input
                  id="input-finished-notes"
                  type="text"
                  value={finishedNotes}
                  onChange={(e) => setFinishedNotes(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {selectedFg && (
                <div className="p-3 bg-teal-50 dark:bg-teal-950/30 border border-teal-200 dark:border-teal-800/60 rounded-xl text-teal-800 dark:text-teal-200">
                  <span className="font-bold block">Cold Storage Balance:</span>
                  Stock will increase from <span className="font-mono font-bold">{selectedFg.currentStock} {selectedFg.unit}</span> to{' '}
                  <span className="font-mono font-bold text-teal-600 dark:text-teal-400">
                    {selectedFg.currentStock + Number(finishedQty)} {selectedFg.unit}
                  </span> in {selectedFg.location}.
                </div>
              )}

              <div className="flex items-center justify-end space-x-3 pt-2">
                <button
                  type="button"
                  onClick={() => setActiveModal(null)}
                  className="px-4 py-2 font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button
                  id="btn-submit-quick-finished"
                  type="submit"
                  className="flex items-center space-x-1.5 px-4 py-2 font-semibold text-white bg-teal-600 hover:bg-teal-700 rounded-xl shadow transition-all"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Release to Cold Room</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};
