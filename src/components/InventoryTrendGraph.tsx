import React, { useState, useMemo } from 'react';
import { useDairySync } from '../context/DairySyncContext';
import { 
  LineChart,
  Line,
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Legend
} from 'recharts';
import { 
  TrendingUp, 
  Package, 
  CheckCircle2,
  ShoppingCart,
  Receipt
} from 'lucide-react';

interface SalesDayDataPoint {
  date: string;
  dayLabel: string;
  [seriesKey: string]: string | number;
}

export const InventoryTrendGraph: React.FC = () => {
  const { finishedGoods, transactions } = useDairySync();
  const [selectedProductId, setSelectedProductId] = useState<string>('all');
  const [timeRange, setTimeRange] = useState<'30d' | '14d' | '7d'>('30d');
  const daysCount = timeRange === '7d' ? 7 : timeRange === '14d' ? 14 : 30;
  const seriesColors = ['#2563eb', '#10b981', '#f59e0b', '#e11d48', '#7c3aed'];

  const salesInRange = useMemo(() => {
    const now = new Date();
    const firstDay = new Date(now.getFullYear(), now.getMonth(), now.getDate() - daysCount + 1);
    const firstDayTime = firstDay.getTime();
    const tomorrow = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1).getTime();

    return transactions.flatMap(transaction => {
      if (transaction.action !== 'out_sale' || transaction.itemType !== 'finished_good') return [];
      const transactionDate = new Date(transaction.timestamp.replace(/\s+PST$/, ''));
      const transactionTime = transactionDate.getTime();
      if (!Number.isFinite(transactionTime) || transactionTime < firstDayTime || transactionTime >= tomorrow) return [];
      return [{ transaction, transactionDate }];
    });
  }, [transactions, daysCount]);

  const rankedProducts = useMemo(() => {
    const unitsByProduct = new Map<string, number>();
    salesInRange.forEach(({ transaction }) => {
      unitsByProduct.set(transaction.itemId, (unitsByProduct.get(transaction.itemId) || 0) + transaction.quantity);
    });

    return Array.from(unitsByProduct, ([id, unitsSold]) => ({
      product: finishedGoods.find(item => item.id === id),
      id,
      unitsSold
    }))
      .filter((entry): entry is { product: NonNullable<typeof entry.product>; id: string; unitsSold: number } => Boolean(entry.product))
      .sort((a, b) => b.unitsSold - a.unitsSold);
  }, [finishedGoods, salesInRange]);

  const topProducts = rankedProducts.slice(0, 5);
  const selectedProducts = selectedProductId === 'all'
    ? topProducts
    : rankedProducts.filter(entry => entry.id === selectedProductId).slice(0, 1);

  const trendData = useMemo<SalesDayDataPoint[]>(() => {
    const data: SalesDayDataPoint[] = [];
    const dayKey = (date: Date) => `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;

    for (let offset = daysCount - 1; offset >= 0; offset--) {
      const date = new Date();
      date.setHours(0, 0, 0, 0);
      date.setDate(date.getDate() - offset);
      const point: SalesDayDataPoint = {
        date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        dayLabel: date.toLocaleDateString('en-US', { weekday: 'short' })
      };

      selectedProducts.forEach(({ id }) => {
        const seriesKey = `product_${id}`;
        point[seriesKey] = salesInRange.reduce((sum, sale) => {
          const saleDate = sale.transactionDate;
          return sum + (sale.transaction.itemId === id && dayKey(saleDate) === dayKey(date) ? sale.transaction.quantity : 0);
        }, 0);
      });
      data.push(point);
    }

    return data;
  }, [daysCount, salesInRange, selectedProducts]);

  const totalUnitsSold = salesInRange.reduce((sum, sale) => sum + sale.transaction.quantity, 0);
  const receiptCount = new Set(salesInRange.map(({ transaction }) => transaction.referenceId || transaction.id)).size;
  const topProduct = topProducts[0];
  const averageUnitsPerDay = Math.round((totalUnitsSold / daysCount) * 10) / 10;

  return (
    <div id="inventory-trend-graph-card" className="bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-6">
      {/* Header & Controls */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-4">
        <div>
          <div className="flex items-center space-x-2">
            <div className="p-2 rounded-xl bg-blue-100 dark:bg-blue-950/60 text-blue-600">
              <TrendingUp className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Finished Goods / Most Purchased Products Trend
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                POS units sold per day for the most purchased finished goods
              </p>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Timespan Selector */}
          <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-1 rounded-xl text-xs font-semibold">
            {(['7d', '14d', '30d'] as const).map(t => (
              <button
                key={t}
                onClick={() => setTimeRange(t)}
                className={`px-3 py-1 rounded-lg transition-colors ${
                  timeRange === t 
                    ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm' 
                    : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                {t.toUpperCase()}
              </button>
            ))}
          </div>

          {/* Product Selector */}
          <select
            id="select-trend-product"
            value={selectedProductId}
            onChange={(e) => setSelectedProductId(e.target.value)}
            className="text-xs px-3 py-1.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-800 dark:text-slate-200 font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">Top 5 Products (Compare)</option>
            {rankedProducts.map(({ id, product }) => (
              <option key={id} value={id}>{product.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* KPI Overview Metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-3 bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 rounded-2xl">
          <span className="text-[10px] font-bold uppercase text-slate-400 block">Units Sold</span>
          <span className="text-lg font-mono font-bold text-slate-900 dark:text-white">
            {totalUnitsSold.toLocaleString()}
          </span>
          <span className="text-[10px] text-slate-500 block mt-0.5">Finished goods dispatched</span>
        </div>

        <div className="p-3 bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 rounded-2xl">
          <span className="text-[10px] font-bold uppercase text-slate-400 block">Most Purchased Product</span>
          <span className="text-lg font-mono font-bold text-blue-600 dark:text-blue-400">
            {topProduct?.product.name || 'No sales'}
          </span>
          <span className="text-[10px] text-slate-500 block mt-0.5">{topProduct ? `${topProduct.unitsSold.toLocaleString()} units sold` : 'No POS sales in this period'}</span>
        </div>

        <div className="p-3 bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 rounded-2xl">
          <span className="text-[10px] font-bold uppercase text-slate-400 block">Sales Receipts</span>
          <span className="text-lg font-mono font-bold text-emerald-600 dark:text-emerald-400">
            {receiptCount.toLocaleString()}
          </span>
          <span className="text-[10px] text-slate-500 block mt-0.5">Unique completed POS sales</span>
        </div>

        <div className="p-3 bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 rounded-2xl">
          <span className="text-[10px] font-bold uppercase text-slate-400 block">Daily Average</span>
          <span className="text-lg font-mono font-bold text-slate-900 dark:text-white">{averageUnitsPerDay.toLocaleString()} units/day</span>
          <span className="text-[10px] text-slate-500 block mt-0.5">Across {daysCount} days</span>
        </div>
      </div>

      {/* Finished Goods Sales Trend */}
      <div className="h-72 w-full pt-2">
        {selectedProducts.length === 0 ? (
          <div className="flex h-full items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-slate-50 text-center text-sm text-slate-500">
            No finished-goods POS sales recorded in this period.
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={trendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" opacity={0.6} />
              <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#64748b' }} />
              <YAxis allowDecimals={false} tick={{ fontSize: 10, fill: '#64748b' }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#0f172a',
                  borderColor: '#1e293b',
                  borderRadius: '12px',
                  color: '#fff',
                  fontSize: '11px'
                }}
                formatter={value => [`${Number(value ?? 0).toLocaleString()} units`, 'Sold']}
              />
              {selectedProducts.length > 1 && <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} />}
              {selectedProducts.map(({ id, product }, index) => (
                <Line
                  key={id}
                  type="monotone"
                  dataKey={`product_${id}`}
                  name={product.name}
                  stroke={seriesColors[index % seriesColors.length]}
                  strokeWidth={2}
                  dot={false}
                  activeDot={{ r: 4 }}
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>

      <div className="flex items-center justify-between text-[11px] text-slate-500 border-t border-slate-100 dark:border-slate-800 pt-3">
        <span className="flex items-center space-x-1.5">
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
          <span>Based on recorded Dairy Box POS sales; quantities are grouped by sale date</span>
        </span>
        <span className="font-mono text-slate-400">PCC-MMSU Batac Processing Unit</span>
      </div>
    </div>
  );
};
