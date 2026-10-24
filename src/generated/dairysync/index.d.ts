import { ConnectorConfig, DataConnect, QueryRef, QueryPromise, ExecuteQueryOptions, MutationRef, MutationPromise, DataConnectSettings } from 'firebase/data-connect';

export const connectorConfig: ConnectorConfig;
export const dataConnectSettings: DataConnectSettings;

export type TimestampString = string;
export type UUIDString = string;
export type Int64String = string;
export type DateString = string;




export interface AuditLogEntry_Key {
  id: string;
  __typename?: 'AuditLogEntry_Key';
}

export interface DeleteAuditLogEntryData {
  auditLogEntry_delete?: AuditLogEntry_Key | null;
}

export interface DeleteAuditLogEntryVariables {
  id: string;
}

export interface DeleteCommitmentData {
  supplyDemandCommitment_delete?: SupplyDemandCommitment_Key | null;
}

export interface DeleteCommitmentVariables {
  id: string;
}

export interface DeleteFinishedGoodData {
  finishedGood_delete?: FinishedGood_Key | null;
}

export interface DeleteFinishedGoodVariables {
  id: string;
}

export interface DeleteIsoRatingData {
  isoEvaluationRating_delete?: IsoEvaluationRating_Key | null;
}

export interface DeleteIsoRatingVariables {
  id: string;
}

export interface DeletePmoInventoryPeriodData {
  pmoInventoryPeriod_delete?: PmoInventoryPeriod_Key | null;
}

export interface DeletePmoInventoryPeriodVariables {
  id: string;
}

export interface DeleteRawIngredientData {
  rawIngredient_delete?: RawIngredient_Key | null;
}

export interface DeleteRawIngredientVariables {
  id: string;
}

export interface DeleteStockTransactionData {
  stockTransaction_delete?: StockTransaction_Key | null;
}

export interface DeleteStockTransactionVariables {
  id: string;
}

export interface DeleteSystemAlertData {
  systemAlert_delete?: SystemAlert_Key | null;
}

export interface DeleteSystemAlertVariables {
  id: string;
}

export interface DeleteUserProfileData {
  userProfile_delete?: UserProfile_Key | null;
}

export interface DeleteUserProfileVariables {
  id: string;
}

export interface DeleteWipBatchData {
  wipBatch_delete?: WipBatch_Key | null;
}

export interface DeleteWipBatchVariables {
  id: string;
}

export interface FinishedGood_Key {
  id: string;
  __typename?: 'FinishedGood_Key';
}

export interface IsoEvaluationRating_Key {
  id: string;
  __typename?: 'IsoEvaluationRating_Key';
}

export interface ListAuditLogEntriesData {
  auditLogEntries: ({
    id: string;
    timestamp: string;
    category: string;
    subsystem: string;
    action: string;
    description: string;
    details?: unknown | null;
    userId: string;
    userName: string;
    userRole: string;
    userTitle: string;
    terminalOrStation?: string | null;
    severity: string;
  } & AuditLogEntry_Key)[];
}

export interface ListCommitmentsData {
  supplyDemandCommitments: ({
    id: string;
    type: string;
    partnerName: string;
    contactPerson?: string | null;
    scheduledDate: string;
    itemOrMilk: string;
    targetQuantity: number;
    fulfilledQuantity: number;
    unit: string;
    status: string;
    priority: string;
    cancellationReason?: string | null;
    cancelledAt?: string | null;
  } & SupplyDemandCommitment_Key)[];
}

export interface ListFinishedGoodsData {
  finishedGoods: ({
    id: string;
    sku: string;
    name: string;
    category: string;
    currentStock: number;
    unit: string;
    coldStorageCapacity: number;
    maxThreshold: number;
    safetyStock: number;
    unitPrice: number;
    allocatedFeedingProgram: number;
    allocatedRetail: number;
    recipe: unknown[];
    batchUnitQuantity: number;
    shelfLifeDays: number;
    location: string;
  } & FinishedGood_Key)[];
}

export interface ListIsoRatingsData {
  isoEvaluationRatings: ({
    id: string;
    functionalSuitability: number;
    performanceEfficiency: number;
    compatibility: number;
    interactionCapability: number;
    reliability: number;
    security: number;
    maintainability: number;
    flexibility: number;
    safety: number;
    evaluatorRole: string;
    comments: string;
    date: string;
    evaluatorUid: string;
  } & IsoEvaluationRating_Key)[];
}

export interface ListPmoInventoryPeriodsData {
  pmoInventoryPeriods: ({
    id: string;
    title: string;
    sourceFileName: string;
    lines: unknown[];
    createdAt: string;
    createdBy: string;
    status?: string | null;
    postedAt?: string | null;
    postedBy?: string | null;
  } & PmoInventoryPeriod_Key)[];
}

export interface ListRawIngredientsData {
  rawIngredients: ({
    id: string;
    sku: string;
    name: string;
    category: string;
    currentStock: number;
    unit: string;
    reorderPoint: number;
    safetyStock: number;
    maxStock: number;
    avgDailyConsumption: number;
    leadTimeDays: number;
    costPerUnit: number;
    supplier: string;
    lastRestocked: string;
    location: string;
    expiryDate?: DateString | null;
  } & RawIngredient_Key)[];
}

export interface ListStockTransactionsData {
  stockTransactions: ({
    id: string;
    timestamp: string;
    itemId: string;
    itemName: string;
    itemType: string;
    action: string;
    quantity: number;
    unit: string;
    previousStock: number;
    newStock: number;
    referenceId?: string | null;
    unitPrice?: number | null;
    performedBy: string;
    notes?: string | null;
  } & StockTransaction_Key)[];
}

export interface ListSystemAlertsData {
  systemAlerts: ({
    id: string;
    timestamp: string;
    type: string;
    title: string;
    message: string;
    severity: string;
    read: boolean;
    targetRole?: string[] | null;
  } & SystemAlert_Key)[];
}

export interface ListUserProfilesData {
  userProfiles: ({
    id: string;
    name: string;
    role: string;
    title: string;
    department: string;
    avatar: string;
    email: string;
    username: string;
    nickname?: string | null;
  } & UserProfile_Key)[];
}

export interface ListWipBatchesData {
  wipBatches: ({
    id: string;
    batchNumber: string;
    productId: string;
    productName: string;
    targetQuantity: number;
    rawMilkVolumeUsed: number;
    ingredientsUsed: unknown[];
    status: string;
    assignedStaff: string;
    startDate: string;
    estimatedCompletion: string;
    completedAt?: string | null;
    cancellationReason?: string | null;
    cancelledAt?: string | null;
    notes?: string | null;
    coldStorageTemp: string;
  } & WipBatch_Key)[];
}

export interface PmoInventoryPeriod_Key {
  id: string;
  __typename?: 'PmoInventoryPeriod_Key';
}

export interface RawIngredient_Key {
  id: string;
  __typename?: 'RawIngredient_Key';
}

export interface SeedAuditLogEntryData {
  auditLogEntry_upsert: AuditLogEntry_Key;
}

export interface SeedAuditLogEntryVariables {
  id: string;
  timestamp: string;
  category: string;
  subsystem: string;
  action: string;
  description: string;
  details?: unknown | null;
  userId: string;
  userName: string;
  userRole: string;
  userTitle: string;
  terminalOrStation?: string | null;
  severity: string;
}

export interface SeedIsoRatingData {
  isoEvaluationRating_upsert: IsoEvaluationRating_Key;
}

export interface SeedIsoRatingVariables {
  id: string;
  functionalSuitability: number;
  performanceEfficiency: number;
  compatibility: number;
  interactionCapability: number;
  reliability: number;
  security: number;
  maintainability: number;
  flexibility: number;
  safety: number;
  evaluatorRole: string;
  comments: string;
  date: string;
}

export interface SeedStockTransactionData {
  stockTransaction_upsert: StockTransaction_Key;
}

export interface SeedStockTransactionVariables {
  id: string;
  timestamp: string;
  itemId: string;
  itemName: string;
  itemType: string;
  action: string;
  quantity: number;
  unit: string;
  previousStock: number;
  newStock: number;
  referenceId?: string | null;
  unitPrice?: number | null;
  performedBy: string;
  notes?: string | null;
}

export interface SetRetailFinishedGoodStockData {
  finishedGood_update?: FinishedGood_Key | null;
}

export interface SetRetailFinishedGoodStockVariables {
  id: string;
  currentStock: number;
  allocatedRetail: number;
}

export interface StockTransaction_Key {
  id: string;
  __typename?: 'StockTransaction_Key';
}

export interface SupplyDemandCommitment_Key {
  id: string;
  __typename?: 'SupplyDemandCommitment_Key';
}

export interface SystemAlert_Key {
  id: string;
  __typename?: 'SystemAlert_Key';
}

export interface UpdateFinishedGoodRecipeData {
  finishedGood_update?: FinishedGood_Key | null;
}

export interface UpdateFinishedGoodRecipeVariables {
  id: string;
  recipe: unknown[];
  batchUnitQuantity: number;
}

export interface UpdateOwnUserProfileData {
  userProfile_updateMany: number;
}

export interface UpdateOwnUserProfileVariables {
  id: string;
  name: string;
  title: string;
  department: string;
  avatar: string;
  username: string;
  nickname?: string | null;
}

export interface UpsertAuditLogEntryData {
  auditLogEntry_upsert: AuditLogEntry_Key;
}

export interface UpsertAuditLogEntryVariables {
  id: string;
  timestamp: string;
  category: string;
  subsystem: string;
  action: string;
  description: string;
  details?: unknown | null;
  userName: string;
  userTitle: string;
  terminalOrStation?: string | null;
  severity: string;
}

export interface UpsertCommitmentData {
  supplyDemandCommitment_upsert: SupplyDemandCommitment_Key;
}

export interface UpsertCommitmentVariables {
  id: string;
  type: string;
  partnerName: string;
  contactPerson?: string | null;
  scheduledDate: string;
  itemOrMilk: string;
  targetQuantity: number;
  fulfilledQuantity: number;
  unit: string;
  status: string;
  priority: string;
  cancellationReason?: string | null;
  cancelledAt?: string | null;
}

export interface UpsertFinishedGoodData {
  finishedGood_upsert: FinishedGood_Key;
}

export interface UpsertFinishedGoodVariables {
  id: string;
  sku: string;
  name: string;
  category: string;
  currentStock: number;
  unit: string;
  coldStorageCapacity: number;
  maxThreshold: number;
  safetyStock: number;
  unitPrice: number;
  allocatedFeedingProgram: number;
  allocatedRetail: number;
  recipe: unknown[];
  batchUnitQuantity: number;
  shelfLifeDays: number;
  location: string;
}

export interface UpsertIsoRatingData {
  isoEvaluationRating_upsert: IsoEvaluationRating_Key;
}

export interface UpsertIsoRatingVariables {
  id: string;
  functionalSuitability: number;
  performanceEfficiency: number;
  compatibility: number;
  interactionCapability: number;
  reliability: number;
  security: number;
  maintainability: number;
  flexibility: number;
  safety: number;
  comments: string;
  date: string;
}

export interface UpsertPmoInventoryPeriodData {
  pmoInventoryPeriod_upsert: PmoInventoryPeriod_Key;
}

export interface UpsertPmoInventoryPeriodVariables {
  id: string;
  title: string;
  sourceFileName: string;
  lines: unknown[];
  createdAt: string;
  createdBy: string;
  status: string;
  postedAt?: string | null;
  postedBy?: string | null;
}

export interface UpsertRawIngredientData {
  rawIngredient_upsert: RawIngredient_Key;
}

export interface UpsertRawIngredientVariables {
  id: string;
  sku: string;
  name: string;
  category: string;
  currentStock: number;
  unit: string;
  reorderPoint: number;
  safetyStock: number;
  maxStock: number;
  avgDailyConsumption: number;
  leadTimeDays: number;
  costPerUnit: number;
  supplier: string;
  lastRestocked: string;
  location: string;
  expiryDate?: DateString | null;
}

export interface UpsertStockTransactionData {
  stockTransaction_upsert: StockTransaction_Key;
}

export interface UpsertStockTransactionVariables {
  id: string;
  timestamp: string;
  itemId: string;
  itemName: string;
  itemType: string;
  action: string;
  quantity: number;
  unit: string;
  previousStock: number;
  newStock: number;
  referenceId?: string | null;
  unitPrice?: number | null;
  notes?: string | null;
}

export interface UpsertSystemAlertData {
  systemAlert_upsert: SystemAlert_Key;
}

export interface UpsertSystemAlertVariables {
  id: string;
  timestamp: string;
  type: string;
  title: string;
  message: string;
  severity: string;
  read: boolean;
  targetRole?: string[] | null;
}

export interface UpsertUserProfileData {
  userProfile_upsert: UserProfile_Key;
}

export interface UpsertUserProfileVariables {
  id: string;
  name: string;
  role: string;
  title: string;
  department: string;
  avatar: string;
  email: string;
  username: string;
  nickname?: string | null;
}

export interface UpsertWipBatchData {
  wipBatch_upsert: WipBatch_Key;
}

export interface UpsertWipBatchVariables {
  id: string;
  batchNumber: string;
  productId: string;
  productName: string;
  targetQuantity: number;
  rawMilkVolumeUsed: number;
  ingredientsUsed: unknown[];
  status: string;
  assignedStaff: string;
  startDate: string;
  estimatedCompletion: string;
  completedAt?: string | null;
  cancellationReason?: string | null;
  cancelledAt?: string | null;
  notes?: string | null;
  coldStorageTemp: string;
}

export interface UserProfile_Key {
  id: string;
  __typename?: 'UserProfile_Key';
}

export interface WipBatch_Key {
  id: string;
  __typename?: 'WipBatch_Key';
}

interface SeedStockTransactionRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: SeedStockTransactionVariables): MutationRef<SeedStockTransactionData, SeedStockTransactionVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: SeedStockTransactionVariables): MutationRef<SeedStockTransactionData, SeedStockTransactionVariables>;
  operationName: string;
}
export const seedStockTransactionRef: SeedStockTransactionRef;

export function seedStockTransaction(vars: SeedStockTransactionVariables): MutationPromise<SeedStockTransactionData, SeedStockTransactionVariables>;
export function seedStockTransaction(dc: DataConnect, vars: SeedStockTransactionVariables): MutationPromise<SeedStockTransactionData, SeedStockTransactionVariables>;

interface SeedIsoRatingRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: SeedIsoRatingVariables): MutationRef<SeedIsoRatingData, SeedIsoRatingVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: SeedIsoRatingVariables): MutationRef<SeedIsoRatingData, SeedIsoRatingVariables>;
  operationName: string;
}
export const seedIsoRatingRef: SeedIsoRatingRef;

export function seedIsoRating(vars: SeedIsoRatingVariables): MutationPromise<SeedIsoRatingData, SeedIsoRatingVariables>;
export function seedIsoRating(dc: DataConnect, vars: SeedIsoRatingVariables): MutationPromise<SeedIsoRatingData, SeedIsoRatingVariables>;

interface SeedAuditLogEntryRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: SeedAuditLogEntryVariables): MutationRef<SeedAuditLogEntryData, SeedAuditLogEntryVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: SeedAuditLogEntryVariables): MutationRef<SeedAuditLogEntryData, SeedAuditLogEntryVariables>;
  operationName: string;
}
export const seedAuditLogEntryRef: SeedAuditLogEntryRef;

export function seedAuditLogEntry(vars: SeedAuditLogEntryVariables): MutationPromise<SeedAuditLogEntryData, SeedAuditLogEntryVariables>;
export function seedAuditLogEntry(dc: DataConnect, vars: SeedAuditLogEntryVariables): MutationPromise<SeedAuditLogEntryData, SeedAuditLogEntryVariables>;

interface ListRawIngredientsRef {
  /* Allow users to create refs without passing in DataConnect */
  (): QueryRef<ListRawIngredientsData, undefined>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect): QueryRef<ListRawIngredientsData, undefined>;
  operationName: string;
}
export const listRawIngredientsRef: ListRawIngredientsRef;

export function listRawIngredients(options?: ExecuteQueryOptions): QueryPromise<ListRawIngredientsData, undefined>;
export function listRawIngredients(dc: DataConnect, options?: ExecuteQueryOptions): QueryPromise<ListRawIngredientsData, undefined>;

interface UpsertRawIngredientRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: UpsertRawIngredientVariables): MutationRef<UpsertRawIngredientData, UpsertRawIngredientVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: UpsertRawIngredientVariables): MutationRef<UpsertRawIngredientData, UpsertRawIngredientVariables>;
  operationName: string;
}
export const upsertRawIngredientRef: UpsertRawIngredientRef;

export function upsertRawIngredient(vars: UpsertRawIngredientVariables): MutationPromise<UpsertRawIngredientData, UpsertRawIngredientVariables>;
export function upsertRawIngredient(dc: DataConnect, vars: UpsertRawIngredientVariables): MutationPromise<UpsertRawIngredientData, UpsertRawIngredientVariables>;

interface DeleteRawIngredientRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: DeleteRawIngredientVariables): MutationRef<DeleteRawIngredientData, DeleteRawIngredientVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: DeleteRawIngredientVariables): MutationRef<DeleteRawIngredientData, DeleteRawIngredientVariables>;
  operationName: string;
}
export const deleteRawIngredientRef: DeleteRawIngredientRef;

export function deleteRawIngredient(vars: DeleteRawIngredientVariables): MutationPromise<DeleteRawIngredientData, DeleteRawIngredientVariables>;
export function deleteRawIngredient(dc: DataConnect, vars: DeleteRawIngredientVariables): MutationPromise<DeleteRawIngredientData, DeleteRawIngredientVariables>;

interface ListStockTransactionsRef {
  /* Allow users to create refs without passing in DataConnect */
  (): QueryRef<ListStockTransactionsData, undefined>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect): QueryRef<ListStockTransactionsData, undefined>;
  operationName: string;
}
export const listStockTransactionsRef: ListStockTransactionsRef;

export function listStockTransactions(options?: ExecuteQueryOptions): QueryPromise<ListStockTransactionsData, undefined>;
export function listStockTransactions(dc: DataConnect, options?: ExecuteQueryOptions): QueryPromise<ListStockTransactionsData, undefined>;

interface UpsertStockTransactionRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: UpsertStockTransactionVariables): MutationRef<UpsertStockTransactionData, UpsertStockTransactionVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: UpsertStockTransactionVariables): MutationRef<UpsertStockTransactionData, UpsertStockTransactionVariables>;
  operationName: string;
}
export const upsertStockTransactionRef: UpsertStockTransactionRef;

export function upsertStockTransaction(vars: UpsertStockTransactionVariables): MutationPromise<UpsertStockTransactionData, UpsertStockTransactionVariables>;
export function upsertStockTransaction(dc: DataConnect, vars: UpsertStockTransactionVariables): MutationPromise<UpsertStockTransactionData, UpsertStockTransactionVariables>;

interface DeleteStockTransactionRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: DeleteStockTransactionVariables): MutationRef<DeleteStockTransactionData, DeleteStockTransactionVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: DeleteStockTransactionVariables): MutationRef<DeleteStockTransactionData, DeleteStockTransactionVariables>;
  operationName: string;
}
export const deleteStockTransactionRef: DeleteStockTransactionRef;

export function deleteStockTransaction(vars: DeleteStockTransactionVariables): MutationPromise<DeleteStockTransactionData, DeleteStockTransactionVariables>;
export function deleteStockTransaction(dc: DataConnect, vars: DeleteStockTransactionVariables): MutationPromise<DeleteStockTransactionData, DeleteStockTransactionVariables>;

interface UpdateFinishedGoodRecipeRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: UpdateFinishedGoodRecipeVariables): MutationRef<UpdateFinishedGoodRecipeData, UpdateFinishedGoodRecipeVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: UpdateFinishedGoodRecipeVariables): MutationRef<UpdateFinishedGoodRecipeData, UpdateFinishedGoodRecipeVariables>;
  operationName: string;
}
export const updateFinishedGoodRecipeRef: UpdateFinishedGoodRecipeRef;

export function updateFinishedGoodRecipe(vars: UpdateFinishedGoodRecipeVariables): MutationPromise<UpdateFinishedGoodRecipeData, UpdateFinishedGoodRecipeVariables>;
export function updateFinishedGoodRecipe(dc: DataConnect, vars: UpdateFinishedGoodRecipeVariables): MutationPromise<UpdateFinishedGoodRecipeData, UpdateFinishedGoodRecipeVariables>;

interface ListPmoInventoryPeriodsRef {
  /* Allow users to create refs without passing in DataConnect */
  (): QueryRef<ListPmoInventoryPeriodsData, undefined>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect): QueryRef<ListPmoInventoryPeriodsData, undefined>;
  operationName: string;
}
export const listPmoInventoryPeriodsRef: ListPmoInventoryPeriodsRef;

export function listPmoInventoryPeriods(options?: ExecuteQueryOptions): QueryPromise<ListPmoInventoryPeriodsData, undefined>;
export function listPmoInventoryPeriods(dc: DataConnect, options?: ExecuteQueryOptions): QueryPromise<ListPmoInventoryPeriodsData, undefined>;

interface UpsertPmoInventoryPeriodRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: UpsertPmoInventoryPeriodVariables): MutationRef<UpsertPmoInventoryPeriodData, UpsertPmoInventoryPeriodVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: UpsertPmoInventoryPeriodVariables): MutationRef<UpsertPmoInventoryPeriodData, UpsertPmoInventoryPeriodVariables>;
  operationName: string;
}
export const upsertPmoInventoryPeriodRef: UpsertPmoInventoryPeriodRef;

export function upsertPmoInventoryPeriod(vars: UpsertPmoInventoryPeriodVariables): MutationPromise<UpsertPmoInventoryPeriodData, UpsertPmoInventoryPeriodVariables>;
export function upsertPmoInventoryPeriod(dc: DataConnect, vars: UpsertPmoInventoryPeriodVariables): MutationPromise<UpsertPmoInventoryPeriodData, UpsertPmoInventoryPeriodVariables>;

interface DeletePmoInventoryPeriodRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: DeletePmoInventoryPeriodVariables): MutationRef<DeletePmoInventoryPeriodData, DeletePmoInventoryPeriodVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: DeletePmoInventoryPeriodVariables): MutationRef<DeletePmoInventoryPeriodData, DeletePmoInventoryPeriodVariables>;
  operationName: string;
}
export const deletePmoInventoryPeriodRef: DeletePmoInventoryPeriodRef;

export function deletePmoInventoryPeriod(vars: DeletePmoInventoryPeriodVariables): MutationPromise<DeletePmoInventoryPeriodData, DeletePmoInventoryPeriodVariables>;
export function deletePmoInventoryPeriod(dc: DataConnect, vars: DeletePmoInventoryPeriodVariables): MutationPromise<DeletePmoInventoryPeriodData, DeletePmoInventoryPeriodVariables>;

interface ListFinishedGoodsRef {
  /* Allow users to create refs without passing in DataConnect */
  (): QueryRef<ListFinishedGoodsData, undefined>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect): QueryRef<ListFinishedGoodsData, undefined>;
  operationName: string;
}
export const listFinishedGoodsRef: ListFinishedGoodsRef;

export function listFinishedGoods(options?: ExecuteQueryOptions): QueryPromise<ListFinishedGoodsData, undefined>;
export function listFinishedGoods(dc: DataConnect, options?: ExecuteQueryOptions): QueryPromise<ListFinishedGoodsData, undefined>;

interface UpsertFinishedGoodRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: UpsertFinishedGoodVariables): MutationRef<UpsertFinishedGoodData, UpsertFinishedGoodVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: UpsertFinishedGoodVariables): MutationRef<UpsertFinishedGoodData, UpsertFinishedGoodVariables>;
  operationName: string;
}
export const upsertFinishedGoodRef: UpsertFinishedGoodRef;

export function upsertFinishedGood(vars: UpsertFinishedGoodVariables): MutationPromise<UpsertFinishedGoodData, UpsertFinishedGoodVariables>;
export function upsertFinishedGood(dc: DataConnect, vars: UpsertFinishedGoodVariables): MutationPromise<UpsertFinishedGoodData, UpsertFinishedGoodVariables>;

interface SetRetailFinishedGoodStockRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: SetRetailFinishedGoodStockVariables): MutationRef<SetRetailFinishedGoodStockData, SetRetailFinishedGoodStockVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: SetRetailFinishedGoodStockVariables): MutationRef<SetRetailFinishedGoodStockData, SetRetailFinishedGoodStockVariables>;
  operationName: string;
}
export const setRetailFinishedGoodStockRef: SetRetailFinishedGoodStockRef;

export function setRetailFinishedGoodStock(vars: SetRetailFinishedGoodStockVariables): MutationPromise<SetRetailFinishedGoodStockData, SetRetailFinishedGoodStockVariables>;
export function setRetailFinishedGoodStock(dc: DataConnect, vars: SetRetailFinishedGoodStockVariables): MutationPromise<SetRetailFinishedGoodStockData, SetRetailFinishedGoodStockVariables>;

interface DeleteFinishedGoodRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: DeleteFinishedGoodVariables): MutationRef<DeleteFinishedGoodData, DeleteFinishedGoodVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: DeleteFinishedGoodVariables): MutationRef<DeleteFinishedGoodData, DeleteFinishedGoodVariables>;
  operationName: string;
}
export const deleteFinishedGoodRef: DeleteFinishedGoodRef;

export function deleteFinishedGood(vars: DeleteFinishedGoodVariables): MutationPromise<DeleteFinishedGoodData, DeleteFinishedGoodVariables>;
export function deleteFinishedGood(dc: DataConnect, vars: DeleteFinishedGoodVariables): MutationPromise<DeleteFinishedGoodData, DeleteFinishedGoodVariables>;

interface ListWipBatchesRef {
  /* Allow users to create refs without passing in DataConnect */
  (): QueryRef<ListWipBatchesData, undefined>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect): QueryRef<ListWipBatchesData, undefined>;
  operationName: string;
}
export const listWipBatchesRef: ListWipBatchesRef;

export function listWipBatches(options?: ExecuteQueryOptions): QueryPromise<ListWipBatchesData, undefined>;
export function listWipBatches(dc: DataConnect, options?: ExecuteQueryOptions): QueryPromise<ListWipBatchesData, undefined>;

interface UpsertWipBatchRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: UpsertWipBatchVariables): MutationRef<UpsertWipBatchData, UpsertWipBatchVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: UpsertWipBatchVariables): MutationRef<UpsertWipBatchData, UpsertWipBatchVariables>;
  operationName: string;
}
export const upsertWipBatchRef: UpsertWipBatchRef;

export function upsertWipBatch(vars: UpsertWipBatchVariables): MutationPromise<UpsertWipBatchData, UpsertWipBatchVariables>;
export function upsertWipBatch(dc: DataConnect, vars: UpsertWipBatchVariables): MutationPromise<UpsertWipBatchData, UpsertWipBatchVariables>;

interface DeleteWipBatchRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: DeleteWipBatchVariables): MutationRef<DeleteWipBatchData, DeleteWipBatchVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: DeleteWipBatchVariables): MutationRef<DeleteWipBatchData, DeleteWipBatchVariables>;
  operationName: string;
}
export const deleteWipBatchRef: DeleteWipBatchRef;

export function deleteWipBatch(vars: DeleteWipBatchVariables): MutationPromise<DeleteWipBatchData, DeleteWipBatchVariables>;
export function deleteWipBatch(dc: DataConnect, vars: DeleteWipBatchVariables): MutationPromise<DeleteWipBatchData, DeleteWipBatchVariables>;

interface ListCommitmentsRef {
  /* Allow users to create refs without passing in DataConnect */
  (): QueryRef<ListCommitmentsData, undefined>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect): QueryRef<ListCommitmentsData, undefined>;
  operationName: string;
}
export const listCommitmentsRef: ListCommitmentsRef;

export function listCommitments(options?: ExecuteQueryOptions): QueryPromise<ListCommitmentsData, undefined>;
export function listCommitments(dc: DataConnect, options?: ExecuteQueryOptions): QueryPromise<ListCommitmentsData, undefined>;

interface UpsertCommitmentRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: UpsertCommitmentVariables): MutationRef<UpsertCommitmentData, UpsertCommitmentVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: UpsertCommitmentVariables): MutationRef<UpsertCommitmentData, UpsertCommitmentVariables>;
  operationName: string;
}
export const upsertCommitmentRef: UpsertCommitmentRef;

export function upsertCommitment(vars: UpsertCommitmentVariables): MutationPromise<UpsertCommitmentData, UpsertCommitmentVariables>;
export function upsertCommitment(dc: DataConnect, vars: UpsertCommitmentVariables): MutationPromise<UpsertCommitmentData, UpsertCommitmentVariables>;

interface DeleteCommitmentRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: DeleteCommitmentVariables): MutationRef<DeleteCommitmentData, DeleteCommitmentVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: DeleteCommitmentVariables): MutationRef<DeleteCommitmentData, DeleteCommitmentVariables>;
  operationName: string;
}
export const deleteCommitmentRef: DeleteCommitmentRef;

export function deleteCommitment(vars: DeleteCommitmentVariables): MutationPromise<DeleteCommitmentData, DeleteCommitmentVariables>;
export function deleteCommitment(dc: DataConnect, vars: DeleteCommitmentVariables): MutationPromise<DeleteCommitmentData, DeleteCommitmentVariables>;

interface ListSystemAlertsRef {
  /* Allow users to create refs without passing in DataConnect */
  (): QueryRef<ListSystemAlertsData, undefined>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect): QueryRef<ListSystemAlertsData, undefined>;
  operationName: string;
}
export const listSystemAlertsRef: ListSystemAlertsRef;

export function listSystemAlerts(options?: ExecuteQueryOptions): QueryPromise<ListSystemAlertsData, undefined>;
export function listSystemAlerts(dc: DataConnect, options?: ExecuteQueryOptions): QueryPromise<ListSystemAlertsData, undefined>;

interface UpsertSystemAlertRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: UpsertSystemAlertVariables): MutationRef<UpsertSystemAlertData, UpsertSystemAlertVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: UpsertSystemAlertVariables): MutationRef<UpsertSystemAlertData, UpsertSystemAlertVariables>;
  operationName: string;
}
export const upsertSystemAlertRef: UpsertSystemAlertRef;

export function upsertSystemAlert(vars: UpsertSystemAlertVariables): MutationPromise<UpsertSystemAlertData, UpsertSystemAlertVariables>;
export function upsertSystemAlert(dc: DataConnect, vars: UpsertSystemAlertVariables): MutationPromise<UpsertSystemAlertData, UpsertSystemAlertVariables>;

interface DeleteSystemAlertRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: DeleteSystemAlertVariables): MutationRef<DeleteSystemAlertData, DeleteSystemAlertVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: DeleteSystemAlertVariables): MutationRef<DeleteSystemAlertData, DeleteSystemAlertVariables>;
  operationName: string;
}
export const deleteSystemAlertRef: DeleteSystemAlertRef;

export function deleteSystemAlert(vars: DeleteSystemAlertVariables): MutationPromise<DeleteSystemAlertData, DeleteSystemAlertVariables>;
export function deleteSystemAlert(dc: DataConnect, vars: DeleteSystemAlertVariables): MutationPromise<DeleteSystemAlertData, DeleteSystemAlertVariables>;

interface ListIsoRatingsRef {
  /* Allow users to create refs without passing in DataConnect */
  (): QueryRef<ListIsoRatingsData, undefined>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect): QueryRef<ListIsoRatingsData, undefined>;
  operationName: string;
}
export const listIsoRatingsRef: ListIsoRatingsRef;

export function listIsoRatings(options?: ExecuteQueryOptions): QueryPromise<ListIsoRatingsData, undefined>;
export function listIsoRatings(dc: DataConnect, options?: ExecuteQueryOptions): QueryPromise<ListIsoRatingsData, undefined>;

interface UpsertIsoRatingRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: UpsertIsoRatingVariables): MutationRef<UpsertIsoRatingData, UpsertIsoRatingVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: UpsertIsoRatingVariables): MutationRef<UpsertIsoRatingData, UpsertIsoRatingVariables>;
  operationName: string;
}
export const upsertIsoRatingRef: UpsertIsoRatingRef;

export function upsertIsoRating(vars: UpsertIsoRatingVariables): MutationPromise<UpsertIsoRatingData, UpsertIsoRatingVariables>;
export function upsertIsoRating(dc: DataConnect, vars: UpsertIsoRatingVariables): MutationPromise<UpsertIsoRatingData, UpsertIsoRatingVariables>;

interface DeleteIsoRatingRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: DeleteIsoRatingVariables): MutationRef<DeleteIsoRatingData, DeleteIsoRatingVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: DeleteIsoRatingVariables): MutationRef<DeleteIsoRatingData, DeleteIsoRatingVariables>;
  operationName: string;
}
export const deleteIsoRatingRef: DeleteIsoRatingRef;

export function deleteIsoRating(vars: DeleteIsoRatingVariables): MutationPromise<DeleteIsoRatingData, DeleteIsoRatingVariables>;
export function deleteIsoRating(dc: DataConnect, vars: DeleteIsoRatingVariables): MutationPromise<DeleteIsoRatingData, DeleteIsoRatingVariables>;

interface ListAuditLogEntriesRef {
  /* Allow users to create refs without passing in DataConnect */
  (): QueryRef<ListAuditLogEntriesData, undefined>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect): QueryRef<ListAuditLogEntriesData, undefined>;
  operationName: string;
}
export const listAuditLogEntriesRef: ListAuditLogEntriesRef;

export function listAuditLogEntries(options?: ExecuteQueryOptions): QueryPromise<ListAuditLogEntriesData, undefined>;
export function listAuditLogEntries(dc: DataConnect, options?: ExecuteQueryOptions): QueryPromise<ListAuditLogEntriesData, undefined>;

interface UpsertAuditLogEntryRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: UpsertAuditLogEntryVariables): MutationRef<UpsertAuditLogEntryData, UpsertAuditLogEntryVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: UpsertAuditLogEntryVariables): MutationRef<UpsertAuditLogEntryData, UpsertAuditLogEntryVariables>;
  operationName: string;
}
export const upsertAuditLogEntryRef: UpsertAuditLogEntryRef;

export function upsertAuditLogEntry(vars: UpsertAuditLogEntryVariables): MutationPromise<UpsertAuditLogEntryData, UpsertAuditLogEntryVariables>;
export function upsertAuditLogEntry(dc: DataConnect, vars: UpsertAuditLogEntryVariables): MutationPromise<UpsertAuditLogEntryData, UpsertAuditLogEntryVariables>;

interface DeleteAuditLogEntryRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: DeleteAuditLogEntryVariables): MutationRef<DeleteAuditLogEntryData, DeleteAuditLogEntryVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: DeleteAuditLogEntryVariables): MutationRef<DeleteAuditLogEntryData, DeleteAuditLogEntryVariables>;
  operationName: string;
}
export const deleteAuditLogEntryRef: DeleteAuditLogEntryRef;

export function deleteAuditLogEntry(vars: DeleteAuditLogEntryVariables): MutationPromise<DeleteAuditLogEntryData, DeleteAuditLogEntryVariables>;
export function deleteAuditLogEntry(dc: DataConnect, vars: DeleteAuditLogEntryVariables): MutationPromise<DeleteAuditLogEntryData, DeleteAuditLogEntryVariables>;

interface ListUserProfilesRef {
  /* Allow users to create refs without passing in DataConnect */
  (): QueryRef<ListUserProfilesData, undefined>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect): QueryRef<ListUserProfilesData, undefined>;
  operationName: string;
}
export const listUserProfilesRef: ListUserProfilesRef;

export function listUserProfiles(options?: ExecuteQueryOptions): QueryPromise<ListUserProfilesData, undefined>;
export function listUserProfiles(dc: DataConnect, options?: ExecuteQueryOptions): QueryPromise<ListUserProfilesData, undefined>;

interface UpsertUserProfileRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: UpsertUserProfileVariables): MutationRef<UpsertUserProfileData, UpsertUserProfileVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: UpsertUserProfileVariables): MutationRef<UpsertUserProfileData, UpsertUserProfileVariables>;
  operationName: string;
}
export const upsertUserProfileRef: UpsertUserProfileRef;

export function upsertUserProfile(vars: UpsertUserProfileVariables): MutationPromise<UpsertUserProfileData, UpsertUserProfileVariables>;
export function upsertUserProfile(dc: DataConnect, vars: UpsertUserProfileVariables): MutationPromise<UpsertUserProfileData, UpsertUserProfileVariables>;

interface UpdateOwnUserProfileRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: UpdateOwnUserProfileVariables): MutationRef<UpdateOwnUserProfileData, UpdateOwnUserProfileVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: UpdateOwnUserProfileVariables): MutationRef<UpdateOwnUserProfileData, UpdateOwnUserProfileVariables>;
  operationName: string;
}
export const updateOwnUserProfileRef: UpdateOwnUserProfileRef;

export function updateOwnUserProfile(vars: UpdateOwnUserProfileVariables): MutationPromise<UpdateOwnUserProfileData, UpdateOwnUserProfileVariables>;
export function updateOwnUserProfile(dc: DataConnect, vars: UpdateOwnUserProfileVariables): MutationPromise<UpdateOwnUserProfileData, UpdateOwnUserProfileVariables>;

interface DeleteUserProfileRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: DeleteUserProfileVariables): MutationRef<DeleteUserProfileData, DeleteUserProfileVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: DeleteUserProfileVariables): MutationRef<DeleteUserProfileData, DeleteUserProfileVariables>;
  operationName: string;
}
export const deleteUserProfileRef: DeleteUserProfileRef;

export function deleteUserProfile(vars: DeleteUserProfileVariables): MutationPromise<DeleteUserProfileData, DeleteUserProfileVariables>;
export function deleteUserProfile(dc: DataConnect, vars: DeleteUserProfileVariables): MutationPromise<DeleteUserProfileData, DeleteUserProfileVariables>;

