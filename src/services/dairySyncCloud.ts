import {
  connectDataConnectEmulator,
  executeQuery,
  getDataConnect,
  QueryFetchPolicy,
  type QueryRef,
  subscribe,
  type DataConnectError,
} from 'firebase/data-connect';
import {
  connectorConfig,
  cancelOwnStockRequest,
  createStockRequest,
  deleteAppBranding,
  deleteAuditLogEntry,
  deleteCommitment,
  deleteFinishedGood,
  deleteIsoRating,
  deletePmoInventoryPeriod,
  deleteRawIngredient,
  deleteStockTransaction,
  deleteStockRequest as deleteStockRequestOperation,
  deleteSystemAlert,
  deleteUserProfile,
  deleteWipBatch,
  getAppBrandingRef,
  listAuditLogEntriesRef,
  listCommitmentsRef,
  listFinishedGoodsRef,
  listIsoRatingsRef,
  listPmoInventoryPeriodsRef,
  listRawIngredientsRef,
  listStockTransactionsRef,
  listOwnStockRequestsRef,
  listStockRequestsRef,
  listSystemAlertsRef,
  listUserProfilesRef,
  listWipBatchesRef,
  seedAuditLogEntry as seedAuditLogEntryOperation,
  seedIsoRating as seedIsoRatingOperation,
  seedStockTransaction as seedStockTransactionOperation,
  setRetailFinishedGoodStock,
  updateOwnUserProfile,
  upsertAuditLogEntry,
  upsertAppBranding,
  upsertCommitment,
  upsertFinishedGood,
  upsertIsoRating,
  upsertRawIngredient,
  upsertStockTransaction,
  upsertSystemAlert,
  upsertUserProfile,
  upsertWipBatch,
  deleteWipProductionRecord,
  listWipProductionRecordsRef,
  upsertWipProductionRecord,
  updateFinishedGoodRecipe as updateFinishedGoodRecipeOperation,
  upsertPmoInventoryPeriod,
  reviewStockRequest,
  type ListOwnStockRequestsData,
  type ListStockRequestsData,
} from '@dataconnect/dairysync-generated';
import {
  AuditLogEntry,
  FinishedGood,
  IsoEvaluationRating,
  RawIngredient,
  PmoInventoryPeriod,
  StockTransaction,
  StockRequest,
  SupplyDemandCommitment,
  SystemAlert,
  UserProfile,
  UserRole,
  WipBatch,
  WipProductionRecord,
  normalizeWipStep,
} from '../types';
import { app, auth } from './firebase';

export interface SqlConnectCollection<T extends { id: string }> {
  fetch: () => Promise<T[]>;
  subscribe: (
    onData: (rows: T[]) => void,
    onError: (error?: DataConnectError) => void
  ) => () => void;
  save: (row: T) => Promise<void>;
  seed?: (row: T) => Promise<void>;
  remove: (id: string) => Promise<void>;
}

const dataConnect = getDataConnect(app, connectorConfig);

export const DEFAULT_APP_LOGO = '/dairysync-app-icon.png';

export function subscribeToAppLogo(
  onData: (logoUrl: string) => void,
  onError: (error?: DataConnectError) => void
): () => void {
  return subscribe(
    getAppBrandingRef(dataConnect),
    result => onData(result.data.appBrandings[0]?.logoDataUrl || DEFAULT_APP_LOGO),
    onError
  );
}

export async function saveAppLogo(logoDataUrl: string): Promise<void> {
  await upsertAppBranding(dataConnect, { logoDataUrl });
}

export async function resetAppLogo(): Promise<void> {
  await deleteAppBranding(dataConnect);
}

if (import.meta.env.DEV && import.meta.env.VITE_USE_SQL_CONNECT_EMULATOR === 'true') {
  connectDataConnectEmulator(dataConnect, '127.0.0.1', 9399);
}

function createCollectionAdapter<TData extends object, TWire, T extends { id: string }>(
  queryRef: QueryRef<TData, undefined>,
  field: keyof TData,
  mapRow: (row: TWire) => T,
  save: (row: T) => Promise<void>,
  remove: (id: string) => Promise<void>,
  seed?: (row: T) => Promise<void>
): SqlConnectCollection<T> {
  const mapRows = (data: TData) => {
    const rows = (data as Record<string, unknown>)[String(field)] as TWire[];
    return rows.map(mapRow);
  };

  return {
    fetch: async () => {
      const result = await executeQuery(queryRef, { fetchPolicy: QueryFetchPolicy.SERVER_ONLY });
      return mapRows(result.data);
    },
    subscribe: (onData, onError) => subscribe(
      queryRef,
      result => onData(mapRows(result.data)),
      onError
    ),
    save,
    seed,
    remove,
  };
}

async function authenticatedRole(): Promise<unknown> {
  const user = auth.currentUser;
  if (!user) return undefined;
  const token = await user.getIdTokenResult();
  return token.claims.role;
}

export async function fetchRawIngredients(): Promise<RawIngredient[]> {
  const { data } = await executeQuery(listRawIngredientsRef(dataConnect), {
    fetchPolicy: QueryFetchPolicy.SERVER_ONLY,
  });
  return data.rawIngredients.map(ingredient => ({
    ...ingredient,
    expiryDate: ingredient.expiryDate ?? undefined,
  }));
}

export function subscribeToRawIngredients(
  onData: (ingredients: RawIngredient[]) => void,
  onError: (error?: DataConnectError) => void
): () => void {
  return subscribe(
    listRawIngredientsRef(dataConnect),
    result => onData(result.data.rawIngredients.map(ingredient => ({
      ...ingredient,
      expiryDate: ingredient.expiryDate ?? undefined,
    }))),
    onError
  );
}

export async function saveRawIngredient(ingredient: RawIngredient): Promise<void> {
  await upsertRawIngredient(dataConnect, {
    ...ingredient,
    expiryDate: ingredient.expiryDate ?? null,
  });
}

export async function removeRawIngredient(id: string): Promise<void> {
  await deleteRawIngredient(dataConnect, { id });
}

export async function fetchStockTransactions(): Promise<StockTransaction[]> {
  const { data } = await executeQuery(listStockTransactionsRef(dataConnect), {
    fetchPolicy: QueryFetchPolicy.SERVER_ONLY,
  });
  return data.stockTransactions.map(transaction => ({
    ...transaction,
    itemType: transaction.itemType as StockTransaction['itemType'],
    action: transaction.action as StockTransaction['action'],
    referenceId: transaction.referenceId ?? undefined,
    unitPrice: transaction.unitPrice ?? undefined,
    notes: transaction.notes ?? undefined,
  }));
}

export function subscribeToStockTransactions(
  onData: (transactions: StockTransaction[]) => void,
  onError: (error?: DataConnectError) => void
): () => void {
  return subscribe(
    listStockTransactionsRef(dataConnect),
    result => onData(result.data.stockTransactions.map(transaction => ({
      ...transaction,
      itemType: transaction.itemType as StockTransaction['itemType'],
      action: transaction.action as StockTransaction['action'],
      referenceId: transaction.referenceId ?? undefined,
      unitPrice: transaction.unitPrice ?? undefined,
      notes: transaction.notes ?? undefined,
    }))),
    onError
  );
}

export async function saveStockTransaction(transaction: StockTransaction): Promise<void> {
  await upsertStockTransaction(dataConnect, {
    id: transaction.id,
    timestamp: transaction.timestamp,
    itemId: transaction.itemId,
    itemName: transaction.itemName,
    itemType: transaction.itemType,
    action: transaction.action,
    quantity: transaction.quantity,
    unit: transaction.unit,
    previousStock: transaction.previousStock,
    newStock: transaction.newStock,
    referenceId: transaction.referenceId ?? null,
    unitPrice: transaction.unitPrice ?? null,
    notes: transaction.notes ?? null,
  });
}

async function seedHistoricalStockTransaction(transaction: StockTransaction): Promise<void> {
  await seedStockTransactionOperation(dataConnect, {
    ...transaction,
    referenceId: transaction.referenceId ?? null,
    unitPrice: transaction.unitPrice ?? null,
    notes: transaction.notes ?? null,
  });
}

export async function removeStockTransaction(id: string): Promise<void> {
  await deleteStockTransaction(dataConnect, { id });
}

async function saveFinishedGood(product: FinishedGood): Promise<void> {
  const role = await authenticatedRole();
  if (role === 'director') {
    await updateFinishedGoodRecipeOperation(dataConnect, {
      id: product.id,
      recipe: product.recipe,
      batchUnitQuantity: product.batchUnitQuantity,
      containerVolumeMl: product.containerVolumeMl ?? null,
    });
    return;
  }
  if (role === 'store_outlet') {
    await setRetailFinishedGoodStock(dataConnect, {
      id: product.id,
      currentStock: product.currentStock,
      allocatedRetail: product.allocatedRetail,
    });
    return;
  }

  await upsertFinishedGood(dataConnect, product);
}

async function saveWipBatch(batch: WipBatch): Promise<void> {
  await upsertWipBatch(dataConnect, {
    ...batch,
    completedAt: batch.completedAt ?? null,
    cancellationReason: batch.cancellationReason ?? null,
    cancelledAt: batch.cancelledAt ?? null,
    notes: batch.notes ?? null,
  });
}

async function saveWipProductionRecord(record: WipProductionRecord): Promise<void> {
  await upsertWipProductionRecord(dataConnect, {
    ...record,
    bestBeforeDate: record.bestBeforeDate ?? null,
    remarks: record.remarks ?? null,
  });
}

async function saveCommitment(commitment: SupplyDemandCommitment): Promise<void> {
  await upsertCommitment(dataConnect, {
    ...commitment,
    contactPerson: commitment.contactPerson ?? null,
    cancellationReason: commitment.cancellationReason ?? null,
    cancelledAt: commitment.cancelledAt ?? null,
  });
}

async function saveStockRequest(request: StockRequest): Promise<void> {
  const role = await authenticatedRole();
  if ((role === 'store_outlet' || role === 'developer') && request.status === 'pending') {
    try {
      await createStockRequest(dataConnect, {
        id: request.id,
        finishedGoodId: request.finishedGoodId,
        finishedGoodName: request.finishedGoodName,
        finishedGoodSku: request.finishedGoodSku,
        quantity: request.quantity,
        unit: request.unit,
        requestedByName: request.requestedByName,
        requestedAt: request.requestedAt,
        neededBy: request.neededBy ?? null,
        notes: request.notes ?? null,
      });
    } catch (error) {
      const existing = (await executeQuery(listStockRequestsRef(dataConnect), {
        fetchPolicy: QueryFetchPolicy.SERVER_ONLY,
      })).data.stockRequests.find(row => row.id === request.id);
      if (
        existing?.requestedByEmail?.toLowerCase() === request.requestedByEmail.toLowerCase() &&
        existing.finishedGoodId === request.finishedGoodId &&
        existing.quantity === request.quantity
      ) return;
      throw error;
    }
    return;
  }

  if (role === 'store_outlet' && request.status === 'cancelled') {
    const result = await cancelOwnStockRequest(dataConnect, { id: request.id });
    if (result.data.stockRequest_updateMany === 0) {
      throw new Error('This pending stock request could not be cancelled.');
    }
    return;
  }

  if (role === 'plant_manager' || role === 'developer') {
    const result = await reviewStockRequest(dataConnect, {
      id: request.id,
      status: request.status,
      responseNotes: request.responseNotes ?? null,
      reviewedAt: request.reviewedAt || new Date().toISOString(),
      fulfilledAt: request.fulfilledAt ?? null,
      fulfilledQuantity: request.fulfilledQuantity ?? null,
    });
    if (result.data.stockRequest_updateMany === 0) {
      throw new Error('This stock request could not be updated because it no longer exists.');
    }
    return;
  }

  throw new Error('The authenticated role cannot update this stock request.');
}

type StockRequestRow =
  | ListStockRequestsData['stockRequests'][number]
  | ListOwnStockRequestsData['stockRequests'][number];

function mapStockRequest(row: StockRequestRow): StockRequest {
  return {
    ...row,
    status: row.status as StockRequest['status'],
    neededBy: row.neededBy ?? undefined,
    notes: row.notes ?? undefined,
    responseNotes: row.responseNotes ?? undefined,
    reviewedBy: row.reviewedBy ?? undefined,
    reviewedAt: row.reviewedAt ?? undefined,
    fulfilledAt: row.fulfilledAt ?? undefined,
    fulfilledQuantity: row.fulfilledQuantity ?? undefined,
  };
}

const stockRequestCollection: SqlConnectCollection<StockRequest> = {
  fetch: async () => {
    const role = await authenticatedRole();
    const result = role === 'store_outlet'
      ? await executeQuery(listOwnStockRequestsRef(dataConnect), { fetchPolicy: QueryFetchPolicy.SERVER_ONLY })
      : await executeQuery(listStockRequestsRef(dataConnect), { fetchPolicy: QueryFetchPolicy.SERVER_ONLY });
    return result.data.stockRequests.map(row => mapStockRequest(row));
  },
  subscribe: (onData, onError) => {
    let active = true;
    let stopSubscription = () => {};
    void authenticatedRole().then(role => {
      if (!active) return;
      const handleData = (result: { data: ListStockRequestsData | ListOwnStockRequestsData }) => {
        onData(result.data.stockRequests.map(row => mapStockRequest(row)));
      };
      stopSubscription = role === 'store_outlet'
        ? subscribe(listOwnStockRequestsRef(dataConnect), handleData, onError)
        : subscribe(listStockRequestsRef(dataConnect), handleData, onError);
    }).catch(error => {
      console.error('Could not select the stock request query for the authenticated role:', error);
      onError(error as DataConnectError);
    });
    return () => {
      active = false;
      stopSubscription();
    };
  },
  save: saveStockRequest,
  remove: async id => {
    const role = await authenticatedRole();
    if (role !== 'developer') {
      throw new Error('Only the Lead Developer can delete stock requests.');
    }
    await deleteStockRequestOperation(dataConnect, { id });
  },
};

async function saveSystemAlert(alert: SystemAlert): Promise<void> {
  await upsertSystemAlert(dataConnect, {
    ...alert,
    targetRole: alert.targetRole ?? null,
  });
}

async function saveIsoRating(rating: IsoEvaluationRating): Promise<void> {
  await upsertIsoRating(dataConnect, rating);
}

async function savePmoInventoryPeriod(period: PmoInventoryPeriod): Promise<void> {
  await upsertPmoInventoryPeriod(dataConnect, period);
}

async function seedHistoricalIsoRating(rating: IsoEvaluationRating): Promise<void> {
  await seedIsoRatingOperation(dataConnect, rating);
}

async function saveAuditLog(entry: AuditLogEntry): Promise<void> {
  await upsertAuditLogEntry(dataConnect, {
    id: entry.id,
    timestamp: entry.timestamp,
    category: entry.category,
    subsystem: entry.subsystem,
    action: entry.action,
    description: entry.description,
    details: entry.details ?? null,
    userName: entry.userName,
    userTitle: entry.userTitle,
    terminalOrStation: entry.terminalOrStation ?? null,
    severity: entry.severity,
  });
}

async function seedHistoricalAuditLog(entry: AuditLogEntry): Promise<void> {
  await seedAuditLogEntryOperation(dataConnect, {
    ...entry,
    details: entry.details ?? null,
    terminalOrStation: entry.terminalOrStation ?? null,
  });
}

async function saveUserProfile(profile: UserProfile): Promise<void> {
  const role = await authenticatedRole();
  if (role === 'developer') {
    await upsertUserProfile(dataConnect, {
      ...profile,
      nickname: profile.nickname ?? null,
    });
    return;
  }

  if (role === 'system_admin' && profile.email.toLowerCase() !== auth.currentUser?.email?.toLowerCase()) {
    await upsertUserProfile(dataConnect, {
      ...profile,
      nickname: profile.nickname ?? null,
    });
    return;
  }

  const result = await updateOwnUserProfile(dataConnect, {
    id: profile.id,
    name: profile.name,
    title: profile.title,
    department: profile.department,
    avatar: profile.avatar,
    username: profile.username,
    nickname: profile.nickname ?? null,
  });
  if (result.data.userProfile_updateMany === 0) {
    throw new Error('The authenticated user does not own this profile.');
  }
}

function mapRawIngredient(row: RawIngredient): RawIngredient {
  return { ...row, expiryDate: row.expiryDate ?? undefined };
}

function mapFinishedGood(row: FinishedGood): FinishedGood {
  return {
    ...row,
    recipe: row.recipe as FinishedGood['recipe'],
    containerVolumeMl: row.containerVolumeMl ?? undefined,
  };
}

function mapWipBatch(row: WipBatch): WipBatch {
  return {
    ...row,
    status: normalizeWipStep(String(row.status)),
    ingredientsUsed: row.ingredientsUsed as WipBatch['ingredientsUsed'],
    completedAt: row.completedAt ?? undefined,
    cancellationReason: row.cancellationReason ?? undefined,
    cancelledAt: row.cancelledAt ?? undefined,
    notes: row.notes ?? undefined,
  };
}

function mapWipProductionRecord(row: WipProductionRecord): WipProductionRecord {
  return {
    ...row,
    bestBeforeDate: row.bestBeforeDate ?? undefined,
    remarks: row.remarks ?? undefined,
    yieldPackages: row.yieldPackages as WipProductionRecord['yieldPackages'],
  };
}

function mapCommitment(row: SupplyDemandCommitment): SupplyDemandCommitment {
  return {
    ...row,
    contactPerson: row.contactPerson ?? undefined,
    cancellationReason: row.cancellationReason ?? undefined,
    cancelledAt: row.cancelledAt ?? undefined,
  };
}

function mapSystemAlert(row: SystemAlert): SystemAlert {
  return {
    ...row,
    targetRole: row.targetRole as UserRole[] | undefined,
  };
}

function mapIsoRating(row: IsoEvaluationRating): IsoEvaluationRating {
  return { ...row, evaluatorRole: row.evaluatorRole as UserRole };
}

function mapAuditLog(row: AuditLogEntry): AuditLogEntry {
  return {
    ...row,
    details: row.details as AuditLogEntry['details'],
    terminalOrStation: row.terminalOrStation ?? undefined,
    userRole: row.userRole as UserRole,
  };
}

function mapUserProfile(row: UserProfile): UserProfile {
  return {
    ...row,
    role: row.role as UserRole,
    nickname: row.nickname ?? undefined,
  };
}

function mapStockTransaction(row: StockTransaction): StockTransaction {
  return {
    ...row,
    itemType: row.itemType as StockTransaction['itemType'],
    action: row.action as StockTransaction['action'],
    referenceId: row.referenceId ?? undefined,
    unitPrice: row.unitPrice ?? undefined,
    notes: row.notes ?? undefined,
  };
}

function mapPmoInventoryPeriod(row: PmoInventoryPeriod): PmoInventoryPeriod {
  return {
    ...row,
    inventoryType: row.inventoryType === 'finished_good' ? 'finished_good' : 'ingredient',
    lines: row.lines as PmoInventoryPeriod['lines'],
    status: row.status === 'posted' ? 'posted' : 'draft',
    postedAt: row.postedAt ?? undefined,
    postedBy: row.postedBy ?? undefined,
  };
}

export const sqlConnectCollections = {
  ingredient: createCollectionAdapter(listRawIngredientsRef(dataConnect), 'rawIngredients', mapRawIngredient, saveRawIngredient, removeRawIngredient),
  finished_good: createCollectionAdapter(listFinishedGoodsRef(dataConnect), 'finishedGoods', mapFinishedGood, saveFinishedGood, async id => { await deleteFinishedGood(dataConnect, { id }); }),
  wip_batch: createCollectionAdapter(listWipBatchesRef(dataConnect), 'wipBatches', mapWipBatch, saveWipBatch, async id => { await deleteWipBatch(dataConnect, { id }); }),
  wip_production_record: createCollectionAdapter(listWipProductionRecordsRef(dataConnect), 'wipProductionRecords', mapWipProductionRecord, saveWipProductionRecord, async id => { await deleteWipProductionRecord(dataConnect, { id }); }),
  commitment: createCollectionAdapter(listCommitmentsRef(dataConnect), 'supplyDemandCommitments', mapCommitment, saveCommitment, async id => { await deleteCommitment(dataConnect, { id }); }),
  stock_request: stockRequestCollection,
  alert: createCollectionAdapter(listSystemAlertsRef(dataConnect), 'systemAlerts', mapSystemAlert, saveSystemAlert, async id => { await deleteSystemAlert(dataConnect, { id }); }),
  stock_adjustment: createCollectionAdapter(listStockTransactionsRef(dataConnect), 'stockTransactions', mapStockTransaction, saveStockTransaction, removeStockTransaction, seedHistoricalStockTransaction),
  pmo_inventory_period: createCollectionAdapter(listPmoInventoryPeriodsRef(dataConnect), 'pmoInventoryPeriods', mapPmoInventoryPeriod, savePmoInventoryPeriod, async id => {
    await deletePmoInventoryPeriod(dataConnect, { id });
  }),
  iso_rating: createCollectionAdapter(listIsoRatingsRef(dataConnect), 'isoEvaluationRatings', mapIsoRating, saveIsoRating, async id => { await deleteIsoRating(dataConnect, { id }); }, seedHistoricalIsoRating),
  audit_log: createCollectionAdapter(listAuditLogEntriesRef(dataConnect), 'auditLogEntries', mapAuditLog, saveAuditLog, async id => { await deleteAuditLogEntry(dataConnect, { id }); }, seedHistoricalAuditLog),
  user_profile: createCollectionAdapter(listUserProfilesRef(dataConnect), 'userProfiles', mapUserProfile, saveUserProfile, async id => { await deleteUserProfile(dataConnect, { id }); }),
};

export type SqlConnectEntity = keyof typeof sqlConnectCollections;

export function isSqlConnectEntity(entity: string): entity is SqlConnectEntity {
  return Object.prototype.hasOwnProperty.call(sqlConnectCollections, entity);
}

export async function saveSqlConnectEntity(entity: SqlConnectEntity, payload: unknown): Promise<void> {
  switch (entity) {
    case 'ingredient': return sqlConnectCollections.ingredient.save(payload as RawIngredient);
    case 'finished_good': return sqlConnectCollections.finished_good.save(payload as FinishedGood);
    case 'wip_batch': return sqlConnectCollections.wip_batch.save(payload as WipBatch);
    case 'wip_production_record': return sqlConnectCollections.wip_production_record.save(payload as WipProductionRecord);
    case 'commitment': return sqlConnectCollections.commitment.save(payload as SupplyDemandCommitment);
    case 'stock_request': return sqlConnectCollections.stock_request.save(payload as StockRequest);
    case 'alert': return sqlConnectCollections.alert.save(payload as SystemAlert);
    case 'stock_adjustment': return sqlConnectCollections.stock_adjustment.save(payload as StockTransaction);
    case 'pmo_inventory_period': return sqlConnectCollections.pmo_inventory_period.save(payload as PmoInventoryPeriod);
    case 'iso_rating': return sqlConnectCollections.iso_rating.save(payload as IsoEvaluationRating);
    case 'audit_log': return sqlConnectCollections.audit_log.save(payload as AuditLogEntry);
    case 'user_profile': return sqlConnectCollections.user_profile.save(payload as UserProfile);
  }
}

export async function seedSqlConnectEntity(entity: SqlConnectEntity, payload: unknown): Promise<void> {
  switch (entity) {
    case 'stock_adjustment': return sqlConnectCollections.stock_adjustment.seed!(payload as StockTransaction);
    case 'iso_rating': return sqlConnectCollections.iso_rating.seed!(payload as IsoEvaluationRating);
    case 'audit_log': return sqlConnectCollections.audit_log.seed!(payload as AuditLogEntry);
    default: return saveSqlConnectEntity(entity, payload);
  }
}

export async function deleteSqlConnectEntity(entity: SqlConnectEntity, id: string): Promise<void> {
  switch (entity) {
    case 'ingredient': return sqlConnectCollections.ingredient.remove(id);
    case 'finished_good': return sqlConnectCollections.finished_good.remove(id);
    case 'wip_batch': return sqlConnectCollections.wip_batch.remove(id);
    case 'wip_production_record': return sqlConnectCollections.wip_production_record.remove(id);
    case 'commitment': return sqlConnectCollections.commitment.remove(id);
    case 'stock_request': return sqlConnectCollections.stock_request.remove(id);
    case 'alert': return sqlConnectCollections.alert.remove(id);
    case 'stock_adjustment': return sqlConnectCollections.stock_adjustment.remove(id);
    case 'pmo_inventory_period': return sqlConnectCollections.pmo_inventory_period.remove(id);
    case 'iso_rating': return sqlConnectCollections.iso_rating.remove(id);
    case 'audit_log': return sqlConnectCollections.audit_log.remove(id);
    case 'user_profile': return sqlConnectCollections.user_profile.remove(id);
  }
}