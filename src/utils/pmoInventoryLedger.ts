import { PmoInventoryLine, PmoInventoryPeriod, StockTransaction } from '../types';

export interface PmoInventoryActivity {
  purchases: number;
  issuedToProduction: number;
  losses: number;
  returns: number;
  adjustments: number;
}

export const parseStockTransactionTime = (timestamp: string): number => {
  const direct = Date.parse(timestamp);
  if (Number.isFinite(direct)) return direct;

  const withoutPst = timestamp.replace(/\sPST$/i, '');
  const fallback = Date.parse(withoutPst);
  return Number.isFinite(fallback) ? fallback : Number.NaN;
};

export const getPmoInventoryActivity = (
  period: PmoInventoryPeriod,
  line: PmoInventoryLine,
  transactions: StockTransaction[],
): PmoInventoryActivity => {
  const activity: PmoInventoryActivity = {
    purchases: 0,
    issuedToProduction: 0,
    losses: 0,
    returns: 0,
    adjustments: 0,
  };
  if (!line.ingredientId) return activity;

  const start = Date.parse(period.createdAt);
  const periodEnd = period.status === 'posted' && period.postedAt
    ? Date.parse(period.postedAt)
    : Number.POSITIVE_INFINITY;

  for (const transaction of transactions) {
    if (transaction.itemType !== 'ingredient' || transaction.itemId !== line.ingredientId) continue;
    const occurredAt = parseStockTransactionTime(transaction.timestamp);
    if (!Number.isFinite(occurredAt) || occurredAt < start || occurredAt > periodEnd) continue;
    switch (transaction.action) {
      case 'in_restock':
        activity.purchases += transaction.quantity;
        break;
      case 'wip_deduct':
        activity.issuedToProduction += transaction.quantity;
        break;
      case 'inventory_loss':
        activity.losses += transaction.quantity;
        break;
      case 'inventory_return':
      case 'wip_restore':
        activity.returns += transaction.quantity;
        break;
      case 'inventory_adjustment':
      case 'inventory_reconciliation':
        activity.adjustments += transaction.newStock - transaction.previousStock;
        break;
      default:
        break;
    }
  }

  return activity;
};

export const calculatePmoExpectedEnding = (
  line: PmoInventoryLine,
  activity: PmoInventoryActivity,
): number | null => {
  if (line.beginningQuantity === undefined) return null;
  if (!line.liveLedger) {
    const adjustment = line.lossOrReturnQuantity || 0;
    const signedAdjustment = line.lossOrReturnDirection === 'increase' ? adjustment : -adjustment;
    return line.beginningQuantity +
      (line.purchasesQuantity || 0) -
      (line.issuedToProductionQuantity || 0) +
      signedAdjustment;
  }
  return line.beginningQuantity +
    activity.purchases -
    activity.issuedToProduction -
    activity.losses +
    activity.returns +
    activity.adjustments;
};
