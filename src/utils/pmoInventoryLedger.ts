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
  const inventoryType = period.inventoryType || 'ingredient';
  const itemId = inventoryType === 'finished_good' ? line.finishedGoodId : line.ingredientId;
  if (!itemId) return activity;

  const start = Date.parse(period.createdAt);
  const periodEnd = period.status === 'posted' && period.postedAt
    ? Date.parse(period.postedAt)
    : Number.POSITIVE_INFINITY;

  for (const transaction of transactions) {
    if (transaction.itemType !== inventoryType || transaction.itemId !== itemId) continue;
    const occurredAt = parseStockTransactionTime(transaction.timestamp);
    if (!Number.isFinite(occurredAt) || occurredAt < start || occurredAt > periodEnd) continue;
    if (inventoryType === 'finished_good') {
      switch (transaction.action) {
        case 'in_restock':
        case 'wip_complete':
          activity.purchases += transaction.quantity;
          break;
        case 'out_sale':
        case 'out_feeding':
          activity.issuedToProduction += transaction.quantity;
          break;
        case 'inventory_loss':
          activity.losses += transaction.quantity;
          break;
        case 'inventory_return':
          activity.returns += transaction.quantity;
          break;
        case 'inventory_adjustment':
        case 'inventory_reconciliation':
          activity.adjustments += transaction.newStock - transaction.previousStock;
          break;
        default:
          break;
      }
      continue;
    }

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
  inventoryType: PmoInventoryPeriod['inventoryType'] = 'ingredient',
): number | null => {
  if (line.beginningQuantity === undefined) return null;
  if (inventoryType === 'finished_good') {
    const hasSalesBreakdown = line.cashSalesQuantity !== undefined ||
      line.creditSalesQuantity !== undefined ||
      line.productPromoQuantity !== undefined;
    const released = hasSalesBreakdown
      ? (line.cashSalesQuantity || 0) +
        (line.creditSalesQuantity || 0) +
        (line.productPromoQuantity || 0)
      : line.issuedToProductionQuantity ?? activity.issuedToProduction;
    return line.beginningQuantity +
      (line.purchasesQuantity ?? activity.purchases) -
      released -
      (line.remarksQuantity || 0);
  }
  if (!line.liveLedger) {
    const adjustment = line.lossOrReturnQuantity || 0;
    const signedAdjustment = line.lossOrReturnDirection === 'increase' ? adjustment : -adjustment;
    return line.beginningQuantity +
      (line.purchasesQuantity || 0) -
      (line.issuedToProductionQuantity || 0) +
      signedAdjustment;
  }
  return line.beginningQuantity +
    (line.purchasesQuantity ?? activity.purchases) -
    activity.issuedToProduction -
    activity.losses +
    activity.returns +
    activity.adjustments;
};

export const calculatePmoIssuedToProduction = (
  line: PmoInventoryLine,
  purchases: number,
): number | null => {
  if (line.beginningQuantity === undefined || line.endingQuantity === undefined) return null;
  return purchases + line.beginningQuantity - line.endingQuantity;
};
