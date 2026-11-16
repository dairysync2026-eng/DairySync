import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import {
  getIdTokenResult,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  type User as FirebaseUser
} from 'firebase/auth';
import { 
  UserRole, 
  UserProfile, 
  RawIngredient, 
  FinishedGood, 
  WipBatch, 
  WipProductionRecord,
  SupplyDemandCommitment, 
  SystemAlert, 
  StockTransaction,
  StockRequest,
  BomIngredientRequirement,
  IsoEvaluationRating,
  WipStep,
  normalizeWipStep,
  AuditLogEntry,
  AuditCategory,
  AuditSeverity,
  ThemeMode,
  BatchExpiryAlert,
  USER_ROLE_LABELS,
  PmoInventoryPeriod,
  PmoInventoryLine
} from '../types';
import { 
  cacheInventoryToIndexedDb, 
  getPendingOfflineActions, 
  removeOfflineAction,
  removePendingSampleWrites,
  enqueueOfflineAction,
  OfflineSyncQueueItem
} from '../services/inventoryDb';
import {
  deleteSqlConnectEntity,
  fetchRawIngredients,
  isSqlConnectEntity,
  seedSqlConnectEntity,
  saveRawIngredient,
  saveSqlConnectEntity,
  sqlConnectCollections,
  SqlConnectEntity
} from '../services/dairySyncCloud';
import { useSqlConnectCollection, SqlCollectionStatus } from '../hooks/useSqlConnectCollection';
import { 
  INITIAL_USERS, 
  INITIAL_INGREDIENTS, 
  INITIAL_FINISHED_GOODS, 
  INITIAL_WIP_BATCHES, 
  INITIAL_COMMITMENTS, 
  INITIAL_ALERTS, 
  INITIAL_TRANSACTIONS,
  INITIAL_AUDIT_LOGS,
  SAMPLE_RECORD_IDS
} from '../data/initialData';
import { auth } from '../services/firebase';
import {
  createManagedAccount,
  fetchManagedAccounts as fetchManagedAccountsFromAuth,
  requestManagedAccountPasswordReset,
  setManagedAccountDisabled,
  setManagedAccountRole,
  type ManagedAccount,
} from '../services/adminAccounts';
import { calculatePmoExpectedEnding, getPmoInventoryActivity } from '../utils/pmoInventoryLedger';
import { isAtOrBelowBuffer } from '../utils/inventoryThresholds';
import {
  convertInventoryQuantityToRecipe,
  convertRecipeQuantityToInventory,
  getRecipeUnitsPerInventoryUnit,
} from '../utils/unitConversions';

export const ROLE_ALLOWED_TABS: Record<UserRole, string[]> = {
  developer: ['dashboard', 'ingredients', 'pmo_inventory', 'wip', 'wip_inventory', 'finished', 'recipes', 'sync', 'procurement', 'pos', 'audit', 'documentation', 'administration'],
  system_admin: ['dashboard', 'audit', 'documentation', 'administration'],
  director: ['dashboard', 'ingredients', 'pmo_inventory', 'wip', 'finished', 'recipes', 'sync', 'procurement', 'pos', 'audit'],
  procurement: ['dashboard', 'procurement', 'ingredients', 'pmo_inventory'],
  plant_manager: ['dashboard', 'finished', 'recipes', 'wip', 'wip_inventory', 'ingredients', 'pmo_inventory', 'procurement', 'sync', 'pos', 'audit'],
  production_staff: ['dashboard', 'wip', 'ingredients'],
  store_outlet: ['dashboard', 'pos', 'finished']
};

const isUserRole = (value: unknown): value is UserRole =>
  value === 'developer' || value === 'system_admin' || value === 'director' || value === 'procurement' ||
  value === 'plant_manager' || value === 'production_staff' || value === 'store_outlet';

interface DairySyncContextType {
  currentRole: UserRole;
  setCurrentRole: (role: UserRole) => void;
  currentUser: UserProfile;
  users: UserProfile[];
  
  // Auth state
  isAuthenticated: boolean;
  isAuthReady: boolean;
  authError: string | null;
  isDeveloperActive: boolean;
  login: (identifier: string, pass: string) => Promise<{ success: boolean; message: string }>;
  loginAsRoleUser: (role: UserRole) => void;
  returnToDeveloperAccount: () => void;
  logout: () => void;
  canAccessTab: (tabId: string) => boolean;
  allowedTabs: string[];
  
  ingredients: RawIngredient[];
  recoverRawIngredients: () => Promise<{ sourceCount: number; cloudCount: number; addedCount: number }>;
  finishedGoods: FinishedGood[];
  wipBatches: WipBatch[];
  wipProductionRecords: WipProductionRecord[];
  commitments: SupplyDemandCommitment[];
  stockRequests: StockRequest[];
  alerts: SystemAlert[];
  transactions: StockTransaction[];
  isoRatings: IsoEvaluationRating[];
  auditLogs: AuditLogEntry[];
  pmoInventoryPeriods: PmoInventoryPeriod[];
  importPmoInventoryPeriod: (period: Omit<PmoInventoryPeriod, 'id' | 'createdAt' | 'createdBy' | 'status' | 'postedAt' | 'postedBy'>) => { success: boolean; message: string };
  savePmoInventoryPeriod: (period: PmoInventoryPeriod) => { success: boolean; message: string };
  postPmoInventoryPeriod: (periodId: string, lines?: PmoInventoryLine[]) => { success: boolean; message: string };
  deletePmoInventoryPeriod: (periodId: string) => { success: boolean; message: string };
  addPmoExternalPurchase: (
    periodId: string,
    ingredient: Omit<RawIngredient, 'id' | 'currentStock' | 'lastRestocked'>,
    quantity: number
  ) => { success: boolean; message: string };
  recordPmoInventoryAdjustment: (
    ingredientId: string,
    quantity: number,
    kind: 'expired' | 'damage' | 'waste' | 'returned',
    notes?: string
  ) => { success: boolean; message: string };
  recordPmoFinishedGoodAdjustment: (
    finishedGoodId: string,
    quantity: number,
    kind: 'expired' | 'damage' | 'waste' | 'returned',
    notes?: string
  ) => { success: boolean; message: string };
  
  // Actions
  addIngredient: (ingredient: Omit<RawIngredient, 'id'>) => boolean;
  updateIngredientRecord: (ingredient: RawIngredient) => boolean;
  updateIngredientStock: (id: string, newStock: number, notes?: string, expiryDate?: string) => boolean;
  addFinishedGood: (product: Omit<FinishedGood, 'id'>) => void;
  updateFinishedGoodRecord: (product: FinishedGood) => boolean;
  updateFinishedGoodRecipe: (
    id: string,
    recipe: BomIngredientRequirement[],
    batchUnitQuantity: number,
    unit: string,
    containerVolumeMl?: number
  ) => boolean;
  deleteFinishedGoodRecipe: (id: string) => boolean;
  deleteIngredientRecord: (id: string) => boolean;
  deleteFinishedGoodRecord: (id: string) => boolean;
  updateFinishedGoodStock: (id: string, newStock: number, notes?: string) => boolean;
  updateFinishedGoodSafetyStock: (id: string, safetyStock: number) => void;
  
  // Production / WIP Actions
  createWipBatch: (batchData: {
    productId: string;
    productName: string;
    targetQuantity: number;
    rawMilkVolumeUsed: number;
    assignedStaff: string;
    notes?: string;
    ingredientSelections?: Record<string, string | null>;
  }) => { success: boolean; message: string };
  
  advanceWipBatchStep: (batchId: string, nextStep: WipStep) => void;
  cancelWipBatch: (batchId: string, reason?: string) => { success: boolean; message: string };
  deleteWipBatchRecord: (batchId: string) => boolean;
  saveWipProductionRecord: (record: WipProductionRecord) => { success: boolean; message: string };
  
  // Retail / POS Actions
  processRetailSale: (items: { productId: string; quantity: number }[]) => { success: boolean; message: string };
  createStockRequest: (request: {
    finishedGoodId: string;
    quantity: number;
    neededBy?: string;
    notes?: string;
  }) => { success: boolean; message: string };
  reviewStockRequest: (
    id: string,
    status: 'approved' | 'rejected' | 'fulfilled',
    responseNotes?: string,
    allocationQuantity?: number
  ) => { success: boolean; message: string };
  cancelStockRequest: (id: string) => { success: boolean; message: string };
  deleteStockRequest: (id: string) => Promise<{ success: boolean; message: string }>;
  
  // Commitment Actions
  addCommitment: (commitment: Omit<SupplyDemandCommitment, 'id'>) => void;
  updateCommitmentStatus: (id: string, status: SupplyDemandCommitment['status'], fulfilledQty?: number) => void;
  cancelCommitment: (id: string, reason: string) => void;
  updateCommitmentPriority: (id: string, priority: 'high' | 'medium' | 'low') => void;
  deleteCommitmentRecord: (id: string) => boolean;
  deleteSalesHistoryRecord: (receiptNo: string, transactionIds: string[]) => boolean;
  removeIdentifiedSampleSales: () => Promise<{ deletedCount: number; pendingCount: number; failedIds: string[] }>;
  
  // Alerts Actions
  markAlertRead: (id: string) => void;
  clearAllAlerts: () => void;
  
  // ISO 25010 Assessment Action
  submitIsoEvaluation: (rating: Omit<IsoEvaluationRating, 'id' | 'date' | 'evaluatorRole'>) => void;
  
  // Audit Trail Actions
  logAuditAction: (entry: {
    category: AuditCategory;
    subsystem: string;
    action: string;
    description: string;
    details?: AuditLogEntry['details'];
    severity?: AuditSeverity;
    terminalOrStation?: string;
  }) => void;
  clearAuditLogs: () => void;
  deleteAuditLogRecord: (id: string) => boolean;
  exportAuditLogsCsv: () => void;

  // System Utility
  resetToDefaultData: () => void;
  cloudSyncStatus: 'synced' | 'syncing' | 'offline';
  triggerManualCloudSync: () => void;
  forceReCacheInventory: () => Promise<void>;
  syncOfflineQueueWithCloud: () => Promise<void>;
  isOnline: boolean;

  // User Profile & Authentication Actions
  addUserProfile: (profile: Omit<UserProfile, 'id'>) => { success: boolean; message: string };
  updateUserProfile: (userId: string, updates: Partial<UserProfile>) => { success: boolean; message: string };
  fetchManagedAccounts: () => Promise<ManagedAccount[]>;
  createManagedUser: (profile: Omit<UserProfile, 'id'>) => Promise<{ success: boolean; message: string }>;
  updateManagedUserProfile: (userId: string, updates: Pick<UserProfile, 'name' | 'username' | 'title' | 'department'>) => Promise<{ success: boolean; message: string }>;
  updateManagedUserRole: (account: ManagedAccount, role: UserRole) => Promise<{ success: boolean; message: string }>;
  setManagedUserDisabled: (account: ManagedAccount, disabled: boolean) => Promise<{ success: boolean; message: string }>;
  sendManagedUserPasswordReset: (email: string) => Promise<{ success: boolean; message: string }>;

  // Accessibility Theme Preferences
  themeMode: ThemeMode;
  setThemeMode: (mode: ThemeMode) => void;
  toggleThemeMode: () => void;

  // Bulk Inventory Management Actions
  bulkUpdateIngredientsStock: (updates: { id: string; newStock: number }[], notes: string) => { success: boolean; count: number };
  bulkDeleteIngredients: (ids: string[]) => { success: boolean; count: number };
  bulkUpdateFinishedGoodsStock: (updates: { id: string; newStock: number; newSafetyStock?: number }[], notes: string) => { success: boolean; count: number };
  bulkDeleteFinishedGoods: (ids: string[]) => { success: boolean; count: number };

  // Quick Action Menu Rapid Handlers
  quickRegisterIngredientArrival: (data: { ingredientId: string; quantityAdded: number; supplierReceipt?: string; notes?: string }) => { success: boolean; message: string };
  quickLogFinishedBatch: (data: { productId: string; quantity: number; notes?: string }) => { success: boolean; message: string };

  // Dynamic Cross-Referenced Expiry Intelligence
  batchExpiries: BatchExpiryAlert[];
}

const DairySyncContext = createContext<DairySyncContextType | undefined>(undefined);

const LOCAL_STORAGE_KEY = 'dairysync_pcc_mmsu_state_v1';
const AUTH_IDLE_TIMEOUT_MS = 10 * 60 * 1000;
const AUDIT_HISTORY_CLEAR_BEFORE = Date.parse('2026-10-14T23:59:59+08:00');
const SCREENSHOT_RAW_INGREDIENT_ID = 'ing-1791910661741-2wtls13';
const SCREENSHOT_PRODUCT_IDS = new Set([
  'fg-1791935350535-tgggf5f',
  'fg-1791910512835-abe8kbl',
  'fg-1791940232996-nfed1yl',
]);
const SCREENSHOT_BATCH_NUMBERS = new Set([
  'BATCH-2026-984',
  'BATCH-2026-884',
  'BATCH-2026-734',
]);
const SCREENSHOT_SALE_RECEIPTS = new Set([
  'POS-REC-7443',
  'POS-REC-8976',
  'POS-REC-6570',
]);
const SCREENSHOT_SALE_TRANSACTION_IDS = new Set([
  'tx-fg-1791939044160-e-1stavv8',
]);
const SCREENSHOT_SALE_TRANSACTION_PREFIXES = ['tx-fg-1791939044160-'];
const SCREENSHOT_COMMITMENT_ID = 'com-1791939225179-x2d9jo3';
const SCREENSHOT_ALERT_IDS = new Set([
  'fg-safety-fg-1791935350535-tgggf5f',
  'overstock-fg-1791910512835-abe8kbl',
  'overstock-fg-1791935350535-tgggf5f',
]);
const withoutSampleRows = <T extends { id: string }>(rows: T[], entity: keyof typeof SAMPLE_RECORD_IDS) => {
  const sampleIds = new Set(SAMPLE_RECORD_IDS[entity] ?? []);
  return rows.filter(row => !sampleIds.has(row.id));
};
const isScreenshotRawIngredient = (row: RawIngredient) =>
  row.id === SCREENSHOT_RAW_INGREDIENT_ID ||
  (row.sku === 'sample' && row.name === 'Sample Raw material');
const isScreenshotFinishedGood = (row: FinishedGood) => SCREENSHOT_PRODUCT_IDS.has(row.id);
const isScreenshotWipBatch = (row: WipBatch) => SCREENSHOT_BATCH_NUMBERS.has(row.batchNumber);
const isScreenshotCommitment = (row: SupplyDemandCommitment) =>
  row.id === SCREENSHOT_COMMITMENT_ID ||
  (row.partnerName === 'DepEd Batac District' &&
    row.scheduledDate === '2026-10-14' &&
    row.itemOrMilk === 'Pasteurized Fresh Carabao Milk 1L' &&
    row.targetQuantity === 300);
const isScreenshotAlert = (row: SystemAlert) => SCREENSHOT_ALERT_IDS.has(row.id);
const isScreenshotSaleTransaction = (row: StockTransaction) => {
  if (row.action !== 'out_sale' || row.itemType !== 'finished_good') return false;
  if (
    SCREENSHOT_SALE_TRANSACTION_IDS.has(row.id) ||
    SCREENSHOT_SALE_TRANSACTION_PREFIXES.some(prefix => row.id.startsWith(prefix)) ||
    SCREENSHOT_SALE_RECEIPTS.has(row.referenceId ?? '')
  ) return true;

  const timestamp = row.timestamp;
  return (
    row.itemName === 'Sample 2' &&
    row.quantity === 490 &&
    row.performedBy === 'Wyn Martinez' &&
    timestamp.includes('08:50:44') &&
    (
      timestamp.includes('14/10/2026') ||
      timestamp.includes('10/14/2026') ||
      timestamp.includes('2026-10-14')
    )
  ) || (
    row.performedBy === 'Dairy Box Batac Outlet Staff' &&
    (timestamp.includes('12/10/2026') ||
      timestamp.includes('10/12/2026') ||
      timestamp.includes('2026-10-12')) &&
    timestamp.includes('10:27:54') &&
    ['Carabao Choco Milk Drink 330ml', 'Carabao Milk Yogurt Drink 330ml (Mango)'].includes(row.itemName)
  );
};
const isScreenshotTransaction = (row: StockTransaction) =>
  isScreenshotSaleTransaction(row) ||
  SCREENSHOT_PRODUCT_IDS.has(row.itemId) ||
  row.itemId === SCREENSHOT_RAW_INGREDIENT_ID ||
  (row.itemType === 'ingredient' && row.itemName === 'Sample Raw material') ||
  (row.referenceId !== undefined &&
    (SCREENSHOT_BATCH_NUMBERS.has(row.referenceId) || SCREENSHOT_SALE_RECEIPTS.has(row.referenceId)));
const isScreenshotAuditLog = (row: AuditLogEntry) => {
  const referenceId = String(row.details?.referenceId ?? '');
  return (row.category === 'sales' &&
    (SCREENSHOT_SALE_RECEIPTS.has(referenceId) || SCREENSHOT_SALE_TRANSACTION_IDS.has(referenceId))) ||
  (row.category === 'commitments' &&
    (row.details?.referenceId === SCREENSHOT_COMMITMENT_ID ||
      (row.description.includes('DepEd Batac District') &&
        row.description.includes('Pasteurized Fresh Carabao Milk 1L') &&
        row.description.includes('300'))));
};
const DIRECTOR_READ_ONLY_ACTIONS = new Set([
  'add a raw material',
  'update raw material stock',
  'bulk update raw material stock',
  'delete raw materials',
  'add a finished product',
  'update finished goods stock',
  'update finished goods safety stock',
  'bulk update finished goods stock',
  'delete finished goods',
  'create a production batch',
  'advance a production batch',
  'cancel a production batch'
]);

const normalizeRole = (role: string | undefined | null): UserRole => {
  const normalized = (role ?? 'developer').trim().toLowerCase();

  switch (normalized) {
    case 'developer':
      return 'developer';
    case 'system_admin':
    case 'systemadmin':
    case 'administrator':
      return 'system_admin';
    case 'director':
    case 'pmo':
    case 'pmo/director':
    case 'director/pmo':
    case 'pmo_director':
      return 'director';
    case 'procurement':
      return 'procurement';
    case 'plant_manager':
    case 'plantmanager':
      return 'plant_manager';
    case 'production_staff':
    case 'production':
      return 'production_staff';
    case 'store_outlet':
    case 'storeoutlet':
    case 'dairybox':
      return 'store_outlet';
    default:
      return 'production_staff';
  }
};

export const DairySyncProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [users, setUsers] = useState<UserProfile[]>(() => {
    const saved = localStorage.getItem(`${LOCAL_STORAGE_KEY}_users`);
    if (saved) {
      try {
        const parsed = JSON.parse(saved) as Array<UserProfile & { password?: string }>;
        const normalizedParsed = withoutSampleRows(parsed, 'user_profile').map(user => {
          const safeUser = { ...user };
          delete safeUser.password;
          return { ...safeUser, role: normalizeRole(user.role) };
        });
        const hasDev = normalizedParsed.some(u => u.role === 'developer');
        if (!hasDev) {
          const devUser = INITIAL_USERS.find(u => u.role === 'developer');
          if (devUser) {
            return [{ ...devUser, role: normalizeRole(devUser.role) }, ...normalizedParsed];
          }
        }
        return normalizedParsed;
      } catch {
        return INITIAL_USERS.map(user => ({ ...user, role: normalizeRole(user.role) }));
      }
    }
    return INITIAL_USERS.map(user => ({ ...user, role: normalizeRole(user.role) }));
  });

  useEffect(() => {
    localStorage.setItem(`${LOCAL_STORAGE_KEY}_users`, JSON.stringify(users));
  }, [users]);

  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return false;
  });
  const [isAuthReady, setIsAuthReady] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [authenticatedRole, setAuthenticatedRole] = useState<UserRole | null>(null);

  const [currentRole, setCurrentRoleState] = useState<UserRole>('production_staff');

  // Track if a Developer superuser session is active across role switching
  const [isDeveloperActive, setIsDeveloperActive] = useState<boolean>(() => {
    return false;
  });

  const setDeveloperActive = (active: boolean) => {
    setIsDeveloperActive(active);
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, user => {
      void (async () => {
        if (!user) {
          setFirebaseUser(null);
          setAuthenticatedRole(null);
          setIsAuthenticated(false);
          setDeveloperActive(false);
          setIsAuthReady(true);
          return;
        }

        try {
          const token = await getIdTokenResult(user);
          const claimedRole = token.claims.role;
          if (!isUserRole(claimedRole)) {
            setAuthError('This account is not assigned an authorized DairySync role. Contact PCC-MMSU IT administration.');
            await firebaseSignOut(auth);
            return;
          }

          setFirebaseUser(user);
          setAuthenticatedRole(claimedRole);
          setCurrentRoleState(claimedRole);
          setIsAuthenticated(true);
          setDeveloperActive(claimedRole === 'developer');
          setAuthError(null);
        } catch {
          setAuthError('Could not verify your Firebase session. Please sign in again.');
          await firebaseSignOut(auth);
        } finally {
          setIsAuthReady(true);
        }
      })();
    }, error => {
      console.error('Firebase auth state error:', error);
      setAuthError('Unable to restore your Firebase session. Check your connection and try again.');
      setIsAuthenticated(false);
      setIsAuthReady(true);
    });

    return unsubscribe;
  }, []);

  useEffect(() => {
    if (!isAuthenticated || !firebaseUser) return;

    let lastActivityAt = Date.now();
    let timeoutId = 0;

    const scheduleSignOut = () => {
      window.clearTimeout(timeoutId);
      const remaining = AUTH_IDLE_TIMEOUT_MS - (Date.now() - lastActivityAt);
      timeoutId = window.setTimeout(() => {
        void (async () => {
          const idleDuration = Date.now() - lastActivityAt;
          if (idleDuration < AUTH_IDLE_TIMEOUT_MS) {
            scheduleSignOut();
            return;
          }

          let draftsQueued = true;
          try {
            const savedPeriods = localStorage.getItem(`${LOCAL_STORAGE_KEY}_pmo_inventory_periods`);
            const periods = savedPeriods ? JSON.parse(savedPeriods) as PmoInventoryPeriod[] : [];
            for (const period of periods) {
              if (period.status !== 'draft') continue;
              const queuedId = await enqueueOfflineAction({
                entity: 'pmo_inventory_period',
                action: 'SQL_UPSERT',
                payload: period,
                userEmail: firebaseUser.email || undefined,
                userUid: firebaseUser.uid,
              });
              if (queuedId < 0) draftsQueued = false;
            }
          } catch (error) {
            draftsQueued = false;
            console.error('Could not queue PMO drafts before automatic sign-out:', error);
          }

          setAuthError(draftsQueued
            ? 'You were signed out after 10 minutes of inactivity. PMO drafts are saved and will sync after you sign in again.'
            : 'You were signed out after 10 minutes of inactivity. PMO drafts remain saved on this device, but cloud sync could not be queued.');
          void firebaseSignOut(auth).catch(error => {
            console.error('Automatic sign-out after inactivity failed:', error);
          });
        })();
      }, Math.max(remaining, 0));
    };

    const handleActivity = () => {
      lastActivityAt = Date.now();
      scheduleSignOut();
    };

    const activityEvents: Array<keyof WindowEventMap> = [
      'pointerdown',
      'pointermove',
      'keydown',
      'scroll',
      'focus',
    ];
    activityEvents.forEach(eventName => {
      window.addEventListener(eventName, handleActivity, { passive: true });
    });
    scheduleSignOut();

    return () => {
      window.clearTimeout(timeoutId);
      activityEvents.forEach(eventName => {
        window.removeEventListener(eventName, handleActivity);
      });
    };
  }, [isAuthenticated, firebaseUser?.uid]);
  
  const [ingredients, setIngredients] = useState<RawIngredient[]>(() => {
    const saved = localStorage.getItem(`${LOCAL_STORAGE_KEY}_ingredients`);
    const parsed = withoutSampleRows<RawIngredient>(saved ? JSON.parse(saved) : INITIAL_INGREDIENTS, 'ingredient');
    const seen = new Set<string>();
    return parsed.filter(i => {
      if (!i.id || seen.has(i.id)) return false;
      seen.add(i.id);
      return true;
    }).map(i => {
      // Ensure expiryDate exists from INITIAL_INGREDIENTS if not set
      if (!i.expiryDate) {
        const init = INITIAL_INGREDIENTS.find(orig => orig.id === i.id);
        if (init?.expiryDate) {
          return { ...i, expiryDate: init.expiryDate };
        }
      }
      return i;
    });
  });

  const [finishedGoods, setFinishedGoods] = useState<FinishedGood[]>(() => {
    const saved = localStorage.getItem(`${LOCAL_STORAGE_KEY}_finished_goods`);
    const parsed = withoutSampleRows<FinishedGood>(saved ? JSON.parse(saved) : INITIAL_FINISHED_GOODS, 'finished_good');
    const seen = new Set<string>();
    return parsed.filter(f => {
      if (!f.id || seen.has(f.id)) return false;
      seen.add(f.id);
      return true;
    });
  });

  const [wipBatches, setWipBatches] = useState<WipBatch[]>(() => {
    const saved = localStorage.getItem(`${LOCAL_STORAGE_KEY}_wip_batches`);
    let parsed = withoutSampleRows<WipBatch>(saved ? JSON.parse(saved) : INITIAL_WIP_BATCHES, 'wip_batch')
      .map(batch => ({ ...batch, status: normalizeWipStep(String(batch.status)) }));
    // Ensure historical batches are populated even if an older localStorage cache exists
    const hasHistorical = parsed.some(w => w.status === 'completed' || w.status === 'cancelled');
    if (!hasHistorical) {
      const historical = INITIAL_WIP_BATCHES.filter(w => w.status === 'completed' || w.status === 'cancelled');
      parsed = [...parsed, ...historical];
    }
    const seen = new Set<string>();
    return parsed.filter(w => {
      if (!w.id || seen.has(w.id)) return false;
      seen.add(w.id);
      return true;
    });
  });

  const [wipProductionRecords, setWipProductionRecords] = useState<WipProductionRecord[]>(() => {
    const saved = localStorage.getItem(`${LOCAL_STORAGE_KEY}_wip_production_records`);
    if (!saved) return [];
    try {
      const parsed = JSON.parse(saved) as WipProductionRecord[];
      return Array.isArray(parsed) ? parsed.filter(record =>
        typeof record?.id === 'string' &&
        typeof record.batchId === 'string' &&
        Array.isArray(record.yieldPackages)
      ) : [];
    } catch (error) {
      console.error('Could not read saved WIP production records:', error);
      return [];
    }
  });

  const [themeMode, setThemeModeState] = useState<ThemeMode>(() => {
    const saved = localStorage.getItem(`${LOCAL_STORAGE_KEY}_theme_mode`);
    return (saved === 'high_contrast' ? 'high_contrast' : 'standard') as ThemeMode;
  });

  const setThemeMode = (mode: ThemeMode) => {
    setThemeModeState(mode);
    localStorage.setItem(`${LOCAL_STORAGE_KEY}_theme_mode`, mode);
    if (typeof document !== 'undefined') {
      if (mode === 'high_contrast') {
        document.documentElement.classList.add('high-contrast');
      } else {
        document.documentElement.classList.remove('high-contrast');
      }
    }
  };

  const toggleThemeMode = () => {
    setThemeMode(themeMode === 'high_contrast' ? 'standard' : 'high_contrast');
  };

  useEffect(() => {
    if (typeof document !== 'undefined') {
      if (themeMode === 'high_contrast') {
        document.documentElement.classList.add('high-contrast');
      } else {
        document.documentElement.classList.remove('high-contrast');
      }
    }
  }, [themeMode]);

  const [commitments, setCommitments] = useState<SupplyDemandCommitment[]>(() => {
    const saved = localStorage.getItem(`${LOCAL_STORAGE_KEY}_commitments`);
    const parsed = withoutSampleRows<SupplyDemandCommitment>(saved ? JSON.parse(saved) : INITIAL_COMMITMENTS, 'commitment');
    const seen = new Set<string>();
    return parsed.filter(c => {
      if (!c.id || seen.has(c.id)) return false;
      seen.add(c.id);
      return true;
    });
  });

  const [stockRequests, setStockRequests] = useState<StockRequest[]>(() => {
    const saved = localStorage.getItem(`${LOCAL_STORAGE_KEY}_stock_requests`);
    if (!saved) return [];
    try {
      const parsed = JSON.parse(saved) as StockRequest[];
      if (!Array.isArray(parsed)) return [];
      return parsed.filter(request =>
        typeof request?.id === 'string' &&
        typeof request.finishedGoodId === 'string' &&
        typeof request.quantity === 'number' &&
        typeof request.status === 'string'
      );
    } catch (error) {
      console.error('Could not read saved finished goods stock requests:', error);
      return [];
    }
  });

  const [alerts, setAlerts] = useState<SystemAlert[]>(() => {
    const saved = localStorage.getItem(`${LOCAL_STORAGE_KEY}_alerts`);
    const parsed = withoutSampleRows<SystemAlert>(saved ? JSON.parse(saved) : INITIAL_ALERTS, 'alert');
    const seen = new Set<string>();
    return parsed.filter(a => {
      if (seen.has(a.id)) return false;
      seen.add(a.id);
      return true;
    });
  });

  const [transactions, setTransactions] = useState<StockTransaction[]>(() => {
    const saved = localStorage.getItem(`${LOCAL_STORAGE_KEY}_transactions`);
    const parsed = withoutSampleRows<StockTransaction>(saved ? JSON.parse(saved) : INITIAL_TRANSACTIONS, 'stock_adjustment');
    const seen = new Set<string>();
    return parsed.filter(t => {
      if (isScreenshotTransaction(t)) return false;
      if (!t.id || seen.has(t.id)) return false;
      seen.add(t.id);
      return true;
    });
  });

  const [pmoInventoryPeriods, setPmoInventoryPeriods] = useState<PmoInventoryPeriod[]>(() => {
    const saved = localStorage.getItem(`${LOCAL_STORAGE_KEY}_pmo_inventory_periods`);
    if (!saved) return [];
    try {
      const parsed = JSON.parse(saved) as PmoInventoryPeriod[];
      return parsed.filter(period =>
        typeof period?.id === 'string' &&
        typeof period.title === 'string' &&
        Array.isArray(period.lines)
      ).map(period => ({
        ...period,
        status: period.status === 'posted' ? 'posted' : 'draft'
      }));
    } catch (error) {
      console.error('Could not read saved PMO inventory periods:', error);
      return [];
    }
  });

  const [isoRatings, setIsoRatings] = useState<IsoEvaluationRating[]>(() => {
    const saved = localStorage.getItem(`${LOCAL_STORAGE_KEY}_iso_ratings`);
    const parsed: IsoEvaluationRating[] = saved ? JSON.parse(saved) : [];
    return parsed.map((rating, index) => ({
      ...rating,
      id: rating.id || `iso-${Date.now()}-${index}`,
    }));
  });

  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>(() => {
    const saved = localStorage.getItem(`${LOCAL_STORAGE_KEY}_audit_logs`);
    const parsed = withoutSampleRows<AuditLogEntry>(saved ? JSON.parse(saved) : INITIAL_AUDIT_LOGS, 'audit_log');
    const seen = new Set<string>();
    return parsed.filter(a => {
      if (!a.id || seen.has(a.id)) return false;
      seen.add(a.id);
      return true;
    });
  });
  const [cloudSyncStatus, setCloudSyncStatus] = useState<'synced' | 'syncing' | 'offline'>('offline');
  const [isOnline, setIsOnline] = useState<boolean>(() => {
    return typeof navigator !== 'undefined' ? navigator.onLine : true;
  });
  const collectionStatusesRef = useRef(new Map<SqlConnectEntity, SqlCollectionStatus>());
  const offlineSyncInProgressRef = useRef(false);
  const automaticStockAllocationKeyRef = useRef('');
  const refreshSqlCloudStatus = () => {
    const monitoredEntities: SqlConnectEntity[] = authenticatedRole === 'system_admin'
      ? ['user_profile', 'audit_log']
      : Object.keys(sqlConnectCollections) as SqlConnectEntity[];
    const statuses = monitoredEntities
      .map(entity => collectionStatusesRef.current.get(entity))
      .filter((status): status is SqlCollectionStatus => status !== undefined);
    const collectionCount = monitoredEntities.length;
    setCloudSyncStatus(
      statuses.includes('offline')
        ? 'offline'
        : statuses.length < collectionCount || statuses.includes('syncing')
          ? 'syncing'
          : 'synced'
    );
  };
  const reportSqlCollectionStatus = (entity: SqlConnectEntity, status: SqlCollectionStatus) => {
    collectionStatusesRef.current.set(entity, status);
    refreshSqlCloudStatus();
  };
  const cloudEnabled = Boolean(firebaseUser && isAuthReady);
  const canSeedCloudData = authenticatedRole === 'developer';
  const userEmail = firebaseUser?.email || undefined;
  const userUid = firebaseUser?.uid;

  const recoverRawIngredients = async () => {
    if (!isAuthenticated || authenticatedRole !== 'developer' || !firebaseUser) {
      throw new Error('Sign in with the Lead Developer account to recover raw ingredients.');
    }
    if (!isOnline) {
      throw new Error('Connect to the internet before recovering raw ingredients.');
    }

    const recoveryBaseKey = 'dairysync_sql_connect_ingredient_backfill_v1';
    const savedSource = localStorage.getItem(`${recoveryBaseKey}_source`);
    let preservedRows: RawIngredient[] = [];
    if (savedSource) {
      const parsed: unknown = JSON.parse(savedSource);
      if (!Array.isArray(parsed)) {
        throw new Error('The saved ingredient recovery copy is invalid. Keep this browser data and contact support.');
      }
      preservedRows = parsed.filter((row): row is RawIngredient =>
        Boolean(row) &&
        typeof row === 'object' &&
        typeof (row as RawIngredient).id === 'string'
      );
    }

    const sourceById = new Map<string, RawIngredient>();
    for (const ingredient of preservedRows) sourceById.set(ingredient.id, ingredient);
    for (const ingredient of ingredients) {
      if (!isScreenshotRawIngredient(ingredient) && !(SAMPLE_RECORD_IDS.ingredient ?? []).includes(ingredient.id)) {
        sourceById.set(ingredient.id, ingredient);
      }
    }
    const sourceRows = [...sourceById.values()];
    const cloudRows = await fetchRawIngredients();
    const cloudIds = new Set(cloudRows.map(row => row.id));
    const missingRows = sourceRows.filter(row => !cloudIds.has(row.id));

    for (let index = 0; index < missingRows.length; index += 10) {
      const results = await Promise.allSettled(missingRows.slice(index, index + 10).map(saveRawIngredient));
      const failures = results.filter(result => result.status === 'rejected');
      if (failures.length > 0) {
        reportSqlCollectionStatus('ingredient', 'offline');
        throw new Error(`${failures.length} of ${missingRows.length} missing ingredients could not be uploaded. Check permissions and retry; successful uploads are safe to retry.`);
      }
    }

    const verifiedRows = await fetchRawIngredients();
    const verifiedIds = new Set(verifiedRows.map(row => row.id));
    const missingAfterUpload = sourceRows.filter(row => !verifiedIds.has(row.id));
    if (missingAfterUpload.length > 0) {
      reportSqlCollectionStatus('ingredient', 'offline');
      throw new Error(`Cloud verification found ${missingAfterUpload.length} source ingredients still missing. Keep this browser open and retry.`);
    }

    localStorage.setItem(`${recoveryBaseKey}_source`, JSON.stringify(sourceRows));
    localStorage.setItem(recoveryBaseKey, 'complete');
    setIngredients(verifiedRows);
    reportSqlCollectionStatus('ingredient', 'synced');
    return {
      sourceCount: sourceRows.length,
      cloudCount: verifiedRows.length,
      addedCount: missingRows.length,
    };
  };

  useEffect(() => {
    if (!cloudEnabled) {
      collectionStatusesRef.current.clear();
      setCloudSyncStatus('offline');
    }
  }, [cloudEnabled]);

  useSqlConnectCollection({ enabled: cloudEnabled, readEnabled: true, canSeed: canSeedCloudData, online: isOnline, rows: users, setRows: setUsers, adapter: sqlConnectCollections.user_profile, entity: 'user_profile', userEmail, userUid, onStatus: reportSqlCollectionStatus });
  useSqlConnectCollection({ enabled: cloudEnabled, readEnabled: authenticatedRole !== 'system_admin', canSeed: canSeedCloudData, online: isOnline, rows: ingredients, setRows: setIngredients, adapter: sqlConnectCollections.ingredient, entity: 'ingredient', userEmail, userUid, onStatus: reportSqlCollectionStatus, removeMatchingRows: isScreenshotRawIngredient, preserveLocalWhenCloudEmpty: false, backfillMissingRowsOnce: true });
  useSqlConnectCollection({ enabled: cloudEnabled, readEnabled: authenticatedRole !== 'system_admin', canSeed: canSeedCloudData, online: isOnline, rows: finishedGoods, setRows: setFinishedGoods, adapter: sqlConnectCollections.finished_good, entity: 'finished_good', userEmail, userUid, onStatus: reportSqlCollectionStatus, removeMatchingRows: isScreenshotFinishedGood });
  useSqlConnectCollection({ enabled: cloudEnabled, readEnabled: ['developer', 'director', 'plant_manager', 'production_staff'].includes(authenticatedRole || ''), canSeed: canSeedCloudData, online: isOnline, rows: wipBatches, setRows: setWipBatches, adapter: sqlConnectCollections.wip_batch, entity: 'wip_batch', userEmail, userUid, onStatus: reportSqlCollectionStatus, removeMatchingRows: isScreenshotWipBatch });
  useSqlConnectCollection({ enabled: cloudEnabled, readEnabled: ['developer', 'plant_manager'].includes(authenticatedRole || ''), canSeed: false, online: isOnline, rows: wipProductionRecords, setRows: setWipProductionRecords, adapter: sqlConnectCollections.wip_production_record, entity: 'wip_production_record', userEmail, userUid, onStatus: reportSqlCollectionStatus });
  useSqlConnectCollection({ enabled: cloudEnabled, readEnabled: ['developer', 'director', 'procurement', 'plant_manager'].includes(authenticatedRole || ''), canSeed: canSeedCloudData, online: isOnline, rows: commitments, setRows: setCommitments, adapter: sqlConnectCollections.commitment, entity: 'commitment', userEmail, userUid, onStatus: reportSqlCollectionStatus, removeMatchingRows: isScreenshotCommitment });
  useSqlConnectCollection({ enabled: cloudEnabled, readEnabled: ['developer', 'director', 'plant_manager', 'store_outlet'].includes(authenticatedRole || ''), canSeed: false, online: isOnline, rows: stockRequests, setRows: setStockRequests, adapter: sqlConnectCollections.stock_request, entity: 'stock_request', userEmail, userUid, onStatus: reportSqlCollectionStatus });
  useSqlConnectCollection({ enabled: cloudEnabled, readEnabled: authenticatedRole !== 'system_admin', canSeed: canSeedCloudData, online: isOnline, rows: alerts, setRows: setAlerts, adapter: sqlConnectCollections.alert, entity: 'alert', userEmail, userUid, onStatus: reportSqlCollectionStatus, removeMatchingRows: isScreenshotAlert });
  useSqlConnectCollection({ enabled: cloudEnabled, readEnabled: authenticatedRole !== 'system_admin', canSeed: canSeedCloudData, online: isOnline, rows: transactions, setRows: setTransactions, adapter: sqlConnectCollections.stock_adjustment, entity: 'stock_adjustment', userEmail, userUid, onStatus: reportSqlCollectionStatus, removeMatchingRows: isScreenshotTransaction });
  useSqlConnectCollection({ enabled: cloudEnabled, readEnabled: ['developer', 'director', 'procurement', 'plant_manager'].includes(authenticatedRole || ''), canSeed: canSeedCloudData, online: isOnline, rows: pmoInventoryPeriods, setRows: setPmoInventoryPeriods, adapter: sqlConnectCollections.pmo_inventory_period, entity: 'pmo_inventory_period', userEmail, userUid, onStatus: reportSqlCollectionStatus });
  useSqlConnectCollection({ enabled: cloudEnabled, readEnabled: authenticatedRole !== 'system_admin', canSeed: canSeedCloudData, online: isOnline, rows: isoRatings, setRows: setIsoRatings, adapter: sqlConnectCollections.iso_rating, entity: 'iso_rating', userEmail, userUid, onStatus: reportSqlCollectionStatus });
  useSqlConnectCollection({
    enabled: cloudEnabled,
    readEnabled: ['developer', 'system_admin', 'director'].includes(authenticatedRole || ''),
    canSeed: canSeedCloudData,
    online: isOnline,
    rows: auditLogs,
    setRows: setAuditLogs,
    adapter: sqlConnectCollections.audit_log,
    entity: 'audit_log',
    userEmail,
    userUid,
    onStatus: reportSqlCollectionStatus,
    clearRowsBeforeTimestamp: canSeedCloudData ? AUDIT_HISTORY_CLEAR_BEFORE : undefined,
    removeMatchingRows: isScreenshotAuditLog,
  });

  // Save changes to localStorage
  useEffect(() => {
    localStorage.setItem(`${LOCAL_STORAGE_KEY}_ingredients`, JSON.stringify(ingredients));
  }, [ingredients]);

  useEffect(() => {
    localStorage.setItem(`${LOCAL_STORAGE_KEY}_finished_goods`, JSON.stringify(finishedGoods));
  }, [finishedGoods]);

  useEffect(() => {
    localStorage.setItem(`${LOCAL_STORAGE_KEY}_wip_batches`, JSON.stringify(wipBatches));
  }, [wipBatches]);

  useEffect(() => {
    localStorage.setItem(`${LOCAL_STORAGE_KEY}_wip_production_records`, JSON.stringify(wipProductionRecords));
  }, [wipProductionRecords]);

  // Persist critical inventory stores to IndexedDB for offline durability
  useEffect(() => {
    cacheInventoryToIndexedDb({
      ingredients,
      finishedGoods,
      wipBatches,
      transactions,
    }).catch(err => {
      console.warn('Background IndexedDB cache persistence error:', err);
    });
  }, [ingredients, finishedGoods, wipBatches, transactions]);

  // Offline / Online listeners & Auto-sync
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      syncOfflineQueueWithCloud();
    };

    const handleOffline = () => {
      setIsOnline(false);
      setCloudSyncStatus('offline');
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  useEffect(() => {
    localStorage.setItem(`${LOCAL_STORAGE_KEY}_commitments`, JSON.stringify(commitments));
  }, [commitments]);

  useEffect(() => {
    localStorage.setItem(`${LOCAL_STORAGE_KEY}_stock_requests`, JSON.stringify(stockRequests));
  }, [stockRequests]);

  useEffect(() => {
    localStorage.setItem(`${LOCAL_STORAGE_KEY}_alerts`, JSON.stringify(alerts));
  }, [alerts]);

  useEffect(() => {
    localStorage.setItem(`${LOCAL_STORAGE_KEY}_transactions`, JSON.stringify(transactions));
  }, [transactions]);

  useEffect(() => {
    localStorage.setItem(`${LOCAL_STORAGE_KEY}_pmo_inventory_periods`, JSON.stringify(pmoInventoryPeriods));
  }, [pmoInventoryPeriods]);

  useEffect(() => {
    if (cloudEnabled && (
      collectionStatusesRef.current.get('ingredient') === 'syncing' ||
      collectionStatusesRef.current.get('stock_adjustment') === 'syncing'
    )) return;
    setPmoInventoryPeriods(previous => {
      let changed = false;
      const nextPeriods = previous.map(period => {
        if (period.status !== 'draft' || !period.lines.some(line => line.liveLedger)) return period;
        const knownIngredientIds = new Set(period.lines.map(line => line.ingredientId).filter(Boolean));
        const newLines: PmoInventoryLine[] = ingredients
          .filter(ingredient => !knownIngredientIds.has(ingredient.id))
          .map(ingredient => {
            const line: PmoInventoryLine = {
              id: `pmo-line-${period.id}-${ingredient.id}`,
              itemName: ingredient.name,
              ingredientId: ingredient.id,
              unit: ingredient.unit,
              beginningQuantity: 0,
              liveLedger: true,
            };
            const activity = getPmoInventoryActivity(period, line, transactions);
            line.beginningQuantity = ingredient.currentStock -
              activity.purchases +
              activity.issuedToProduction -
              activity.returns +
              activity.losses -
              activity.adjustments;
            return line;
          });
        if (newLines.length === 0) return period;
        if (newLines.length > 0) changed = true;
        return { ...period, lines: [...period.lines, ...newLines] };
      });
      return changed ? nextPeriods : previous;
    });
  }, [ingredients, transactions, cloudEnabled, cloudSyncStatus]);

  useEffect(() => {
    localStorage.setItem(`${LOCAL_STORAGE_KEY}_iso_ratings`, JSON.stringify(isoRatings));
  }, [isoRatings]);

  useEffect(() => {
    localStorage.setItem(`${LOCAL_STORAGE_KEY}_audit_logs`, JSON.stringify(auditLogs));
  }, [auditLogs]);

  const selectedRoleUser = users.find(u => normalizeRole(u.role) === currentRole) || users[0] || {
    id: firebaseUser?.uid || '',
    name: currentRole === 'developer'
      ? firebaseUser?.displayName || firebaseUser?.email || USER_ROLE_LABELS.developer
      : `${USER_ROLE_LABELS[currentRole]} Dashboard Preview`,
    role: currentRole,
    title: USER_ROLE_LABELS[currentRole],
    department: '',
    avatar: '',
    email: firebaseUser?.email || '',
    username: firebaseUser?.email || '',
  };
  const directoryUser = firebaseUser?.email
    ? users.find(user => user.email.toLowerCase() === firebaseUser.email!.toLowerCase())
    : undefined;
  const currentUser = firebaseUser && authenticatedRole && !(isDeveloperActive && currentRole !== 'developer')
    ? {
        ...(directoryUser || selectedRoleUser),
        id: directoryUser?.id || firebaseUser.uid,
        name: directoryUser?.name || firebaseUser.displayName || firebaseUser.email || selectedRoleUser.name,
        email: firebaseUser.email || directoryUser?.email || selectedRoleUser.email,
        username: directoryUser?.username || firebaseUser.email || selectedRoleUser.username,
        role: authenticatedRole
      }
    : selectedRoleUser;
  const syncIdentityRef = useRef({ firebaseUid: firebaseUser?.uid, email: currentUser.email });
  syncIdentityRef.current = { firebaseUid: firebaseUser?.uid, email: currentUser.email };

  const setCurrentRole = (role: UserRole) => {
    if (!isAuthenticated || authenticatedRole !== 'developer' || !isDeveloperActive) return;
    const safeRole = normalizeRole(role);
    setCurrentRoleState(safeRole);
  };

  const login = async (identifier: string, pass: string): Promise<{ success: boolean; message: string }> => {
    const cleanId = identifier.trim().toLowerCase();
    const directoryUser = users.find(user =>
      user.email.toLowerCase() === cleanId || user.username.toLowerCase() === cleanId
    );
    const email = directoryUser?.email || (cleanId.includes('@') ? cleanId : null);
    if (!email) return { success: false, message: 'Enter your registered email address or username.' };

    try {
      const credential = await signInWithEmailAndPassword(auth, email, pass);
      const token = await getIdTokenResult(credential.user, true);
      const roleClaim = token.claims.role;

      if (!isUserRole(roleClaim)) {
        await firebaseSignOut(auth);
        const message = 'This account is not assigned an authorized DairySync role. Contact PCC-MMSU IT administration.';
        setAuthError(message);
        return { success: false, message };
      }

      setAuthError(null);
      return {
        success: true,
        message: `Logged in as ${credential.user.displayName || directoryUser?.name || credential.user.email} (${roleClaim})`
      };
    } catch (error) {
      const code = (error as { code?: string }).code;
      const message = code === 'auth/operation-not-allowed'
        ? 'Email/password sign-in is not enabled for this Firebase project.'
        : code === 'auth/network-request-failed'
          ? 'Unable to reach Firebase Authentication. Check your network and try again.'
          : 'Invalid email or password.';
      return { success: false, message };
    }
  };

  const loginAsRoleUser = (role: UserRole) => {
    const targetRole = normalizeRole(role);
    if (!isAuthenticated || !isDeveloperActive || authenticatedRole !== 'developer') return;
    // Lead developer has master clearance to switch between all account users without doing a re-login
    // If an authenticated user is neither currently a developer nor has an active developer session, reject it
    if (isAuthenticated && !isDeveloperActive && currentRole !== 'developer' && targetRole !== currentRole) {
      console.warn('RBAC Notice: Only the Lead Developer has access to switch between all account users.');
      return;
    }
    setDeveloperActive(true);
    setCurrentRole(targetRole);
  };

  const returnToDeveloperAccount = () => {
    if (!isAuthenticated || !isDeveloperActive || authenticatedRole !== 'developer') return;
    setCurrentRole('developer');
    setDeveloperActive(true);
  };

  const logout = () => {
    setAuthError(null);
    void firebaseSignOut(auth);
  };

  const canAccessTab = (tabId: string) => {
    const allowed = ROLE_ALLOWED_TABS[currentRole] || ['dashboard'];
    return allowed.includes(tabId);
  };

  const allowedTabs = ROLE_ALLOWED_TABS[currentRole] || ['dashboard'];

  const recordOfflineMutation = async (
    entity: OfflineSyncQueueItem['entity'],
    action: string,
    payload: any
  ) => {
    if (typeof navigator !== 'undefined' && !navigator.onLine) {
      try {
        await enqueueOfflineAction({
          action,
          entity,
          payload,
          userEmail: currentUser.email,
          userUid: firebaseUser?.uid,
        });
      } catch (e) {
        console.warn('Failed to record offline mutation:', e);
      }
    }
  };

  const forceReCacheInventory = async () => {
    await cacheInventoryToIndexedDb({
      ingredients,
      finishedGoods,
      wipBatches,
      transactions,
    });
  };

  const syncOfflineQueueWithCloud = async () => {
    if (typeof navigator !== 'undefined' && !navigator.onLine) {
      setCloudSyncStatus('offline');
      return;
    }

    const { firebaseUid, email } = syncIdentityRef.current;
    if (!firebaseUid) {
      setCloudSyncStatus('offline');
      return;
    }

    if (offlineSyncInProgressRef.current) return;
    offlineSyncInProgressRef.current = true;
    setCloudSyncStatus('syncing');
    let syncedCount = 0;
    const syncedEntities = new Set<SqlConnectEntity>();
    try {
      const queue = await getPendingOfflineActions();
      for (const item of queue) {
        if (item.id === undefined) continue;
        if (item.userUid) {
          if (item.userUid !== firebaseUid) continue;
        } else if (!item.userEmail || !email || item.userEmail.toLowerCase() !== email.toLowerCase()) {
          continue;
        }

        try {
          let handled = false;
          let syncedEntity: SqlConnectEntity | undefined;
          if (isSqlConnectEntity(item.entity) && item.action === 'SQL_SEED') {
            await seedSqlConnectEntity(item.entity, item.payload);
            syncedEntity = item.entity;
            handled = true;
          } else if (isSqlConnectEntity(item.entity) && item.action === 'SQL_UPSERT') {
            await saveSqlConnectEntity(item.entity, item.payload);
            syncedEntity = item.entity;
            handled = true;
          } else if (isSqlConnectEntity(item.entity) && item.action === 'SQL_DELETE') {
            const payload = item.payload as { id: string };
            await deleteSqlConnectEntity(item.entity, payload.id);
            syncedEntity = item.entity;
            handled = true;
          } else if (item.entity === 'ingredient' && ['DELETE_RAW_INGREDIENT', 'SQL_DELETE'].includes(item.action)) {
            await sqlConnectCollections.ingredient.remove((item.payload as { id: string }).id);
            syncedEntity = 'ingredient';
            handled = true;
          } else if (item.entity === 'ingredient' && ['UPSERT_RAW_INGREDIENT', 'CREATE_INGREDIENT'].includes(item.action)) {
            await sqlConnectCollections.ingredient.save(item.payload as RawIngredient);
            syncedEntity = 'ingredient';
            handled = true;
          } else if (item.entity === 'stock_adjustment' && item.action === 'UPDATE_INGREDIENT_STOCK') {
            const payload = item.payload as { id: string; newStock?: number; expiryDate?: string };
            const ingredient = ingredients.find(candidate => candidate.id === payload.id);
            if (ingredient) {
              await sqlConnectCollections.ingredient.save({
                ...ingredient,
                currentStock: payload.newStock ?? ingredient.currentStock,
                expiryDate: payload.expiryDate ?? ingredient.expiryDate,
              });
              syncedEntity = 'ingredient';
              handled = true;
            }
          } else if (item.entity === 'stock_adjustment' && item.action === 'UPSERT_STOCK_TRANSACTION') {
            await sqlConnectCollections.stock_adjustment.save(item.payload as StockTransaction);
            syncedEntity = 'stock_adjustment';
            handled = true;
          } else if (item.entity === 'finished_good' && item.action === 'CREATE_FINISHED_GOOD') {
            await sqlConnectCollections.finished_good.save(item.payload as FinishedGood);
            syncedEntity = 'finished_good';
            handled = true;
          } else if (item.entity === 'wip_batch' && item.action === 'CREATE_WIP_BATCH') {
            await sqlConnectCollections.wip_batch.save(item.payload as WipBatch);
            syncedEntity = 'wip_batch';
            handled = true;
          }

          if (handled) {
            await removeOfflineAction(item.id);
            if (syncedEntity) syncedEntities.add(syncedEntity);
            syncedCount += 1;
          }
        } catch (error) {
          console.warn(`Offline action ${item.id} remains queued after SQL Connect failure:`, error);
        }
      }

      const pending = await getPendingOfflineActions();
      for (const entity of syncedEntities) {
        reportSqlCollectionStatus(entity, 'synced');
      }
      if (syncedCount > 0) {
        logAuditAction({
          category: 'security',
          subsystem: 'Offline Sync Engine',
          action: 'OFFLINE_RECONCILIATION',
          description: `Reconciled ${syncedCount} offline actions to SQL Connect.`,
          details: {
            quantity: syncedCount,
            reason: 'Network connectivity restored; acknowledged SQL Connect mutations were removed from the queue.'
          },
          severity: 'success'
        });
      }
      await cacheInventoryToIndexedDb({
        ingredients,
        finishedGoods,
        wipBatches,
        transactions,
      });
      if (pending.length > 0) {
        for (const item of pending) {
          if (isSqlConnectEntity(item.entity)) reportSqlCollectionStatus(item.entity, 'offline');
        }
        setCloudSyncStatus('offline');
      } else {
        refreshSqlCloudStatus();
      }
    } catch (e) {
      console.warn('Sync error:', e);
      setCloudSyncStatus('offline');
    } finally {
      offlineSyncInProgressRef.current = false;
    }
  };

  const triggerManualCloudSync = () => {
    if (typeof navigator !== 'undefined' && !navigator.onLine) {
      setCloudSyncStatus('offline');
      forceReCacheInventory();
      return;
    }
    syncOfflineQueueWithCloud();
  };

  const logAuditAction = (entry: {
    category: AuditCategory;
    subsystem: string;
    action: string;
    description: string;
    details?: AuditLogEntry['details'];
    severity?: AuditSeverity;
    terminalOrStation?: string;
  }) => {
    const newEntry: AuditLogEntry = {
      id: `audit-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      timestamp: new Date().toLocaleString('en-US', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: true
      }) + ' PST',
      category: entry.category,
      subsystem: entry.subsystem,
      action: entry.action,
      description: entry.description,
      details: entry.details,
      userId: currentUser.id,
      userName: currentUser.name,
      userRole: currentUser.role,
      userTitle: currentUser.title || 'System Operator',
      terminalOrStation: entry.terminalOrStation || (currentUser.department ? `${currentUser.department.split('/')[0].trim()} Terminal` : 'DairySync MMSU Workstation'),
      severity: entry.severity || 'info'
    };
    setAuditLogs(prev => [newEntry, ...prev]);
  };

  useEffect(() => {
    if (currentRole !== 'plant_manager' && currentRole !== 'developer') return;

    const allocationKey = JSON.stringify({
      products: finishedGoods.map(product => [
        product.id,
        product.currentStock,
        product.allocatedRetail,
        product.allocatedFeedingProgram,
      ]),
      requests: stockRequests
        .filter(request => request.status === 'approved')
        .map(request => [request.id, request.quantity, request.fulfilledQuantity ?? 0, request.finishedGoodId]),
    });
    if (automaticStockAllocationKeyRef.current === allocationKey) return;
    automaticStockAllocationKeyRef.current = allocationKey;

    const availableByProduct = new Map(finishedGoods.map(product => [
      product.id,
      Math.max(0, product.currentStock - product.allocatedRetail - product.allocatedFeedingProgram),
    ]));
    const additionalAllocationByProduct = new Map<string, number>();
    const now = new Date().toISOString();
    const updates = new Map<string, StockRequest>();
    const allocationAlerts: SystemAlert[] = [];

    const approvedRequests = stockRequests
      .filter(request => request.status === 'approved')
      .sort((a, b) => Date.parse(a.requestedAt) - Date.parse(b.requestedAt));

    for (const request of approvedRequests) {
      const available = availableByProduct.get(request.finishedGoodId) ?? 0;
      const remaining = Math.max(0, request.quantity - (request.fulfilledQuantity ?? 0));
      const quantityToAllocate = Math.min(available, remaining);
      if (quantityToAllocate < 1) continue;

      const fulfilledQuantity = (request.fulfilledQuantity ?? 0) + quantityToAllocate;
      const isFulfilled = fulfilledQuantity >= request.quantity;
      availableByProduct.set(request.finishedGoodId, available - quantityToAllocate);
      additionalAllocationByProduct.set(
        request.finishedGoodId,
        (additionalAllocationByProduct.get(request.finishedGoodId) ?? 0) + quantityToAllocate
      );
      updates.set(request.id, {
        ...request,
        status: isFulfilled ? 'fulfilled' : 'approved',
        fulfilledQuantity,
        fulfilledAt: isFulfilled ? now : undefined,
        reviewedBy: currentUser.email,
        reviewedAt: now,
      });
      allocationAlerts.push({
        id: `${request.id}-auto-allocation-${fulfilledQuantity}`,
        timestamp: now,
        type: 'stock_request',
        title: `Dairy Box Stock Request ${isFulfilled ? 'fulfilled' : 'partially fulfilled'}`,
        message: isFulfilled
          ? `Your request for ${request.quantity} ${request.unit} of ${request.finishedGoodName} was automatically fulfilled.`
          : `${quantityToAllocate} of ${request.quantity} ${request.unit} of ${request.finishedGoodName} was automatically allocated; the remaining ${request.quantity - fulfilledQuantity} stays approved.`,
        severity: 'info',
        read: false,
        targetRole: ['store_outlet'],
      });
      logAuditAction({
        category: 'cold_storage',
        subsystem: 'Dairy Box Stock Requests',
        action: isFulfilled
          ? 'FINISHED_GOODS_REQUEST_AUTO_FULFILLED'
          : 'FINISHED_GOODS_REQUEST_AUTO_PARTIALLY_FULFILLED',
        description: `Automatically allocated ${quantityToAllocate} ${request.unit} of ${request.finishedGoodName} to Dairy Box${isFulfilled ? '' : `; ${request.quantity - fulfilledQuantity} remains approved`}`,
        details: {
          itemOrBatch: request.finishedGoodName,
          quantity: quantityToAllocate,
          unit: request.unit,
          referenceId: request.id,
          reason: 'Automatic allocation of available finished-goods stock',
        },
        severity: isFulfilled ? 'success' : 'info',
      });
    }

    if (updates.size === 0) return;

    setFinishedGoods(previous => previous.map(product => {
      const additionalAllocation = additionalAllocationByProduct.get(product.id) ?? 0;
      return additionalAllocation > 0
        ? { ...product, allocatedRetail: product.allocatedRetail + additionalAllocation }
        : product;
    }));
    setStockRequests(previous => previous.map(request => updates.get(request.id) ?? request));
    setAlerts(previous => {
      const existingIds = new Set(previous.map(alert => alert.id));
      return [
        ...allocationAlerts.filter(alert => !existingIds.has(alert.id)),
        ...previous,
      ];
    });
  }, [currentRole, currentUser.email, finishedGoods, stockRequests]);

  const clearAuditLogs = () => {
    if (!authorizeDirectorMutation('clear audit history')) return;
    setAuditLogs([]);
    localStorage.removeItem(`${LOCAL_STORAGE_KEY}_audit_logs`);
  };

  const exportAuditLogsCsv = () => {
    const headers = [
      'Audit ID',
      'Timestamp',
      'Category',
      'Subsystem',
      'Action Code',
      'Description',
      'Item / Reference',
      'Previous Value',
      'New Value',
      'Quantity',
      'Unit',
      'Operator Name',
      'User Role',
      'Terminal / Station',
      'Severity',
      'Reason / Notes'
    ];

    const rows = auditLogs.map(log => [
      `"${log.id}"`,
      `"${log.timestamp}"`,
      `"${log.category}"`,
      `"${log.subsystem}"`,
      `"${log.action}"`,
      `"${(log.description || '').replace(/"/g, '""')}"`,
      `"${(log.details?.itemOrBatch || '').toString().replace(/"/g, '""')}"`,
      `"${(log.details?.previousValue ?? '').toString().replace(/"/g, '""')}"`,
      `"${(log.details?.newValue ?? '').toString().replace(/"/g, '""')}"`,
      `"${log.details?.quantity ?? ''}"`,
      `"${log.details?.unit ?? ''}"`,
      `"${(log.userName || '').replace(/"/g, '""')}"`,
      `"${log.userRole}"`,
      `"${(log.terminalOrStation || '').replace(/"/g, '""')}"`,
      `"${log.severity}"`,
      `"${(log.details?.reason || '').toString().replace(/"/g, '""')}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `dairysync_audit_trail_report_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Automated Checker for ROP Alerts & Overstock Flags
  useEffect(() => {
    setAlerts(prev => {
      const dedupedIds = new Set<string>();
      const deduped = prev.filter(a => {
        if (dedupedIds.has(a.id)) return false;
        dedupedIds.add(a.id);
        return true;
      });
      const inactiveBufferAlertIds = new Set([
        ...ingredients.filter(ing => ing.reorderPoint <= 0).map(ing => `rop-${ing.id}`),
        ...finishedGoods.filter(fg => (fg.safetyStock ?? 0) <= 0).map(fg => `fg-safety-${fg.id}`),
      ]);
      const nextAlerts = deduped.filter(alert => !inactiveBufferAlertIds.has(alert.id));
      const seen = new Set(nextAlerts.map(alert => alert.id));
      let changed = nextAlerts.length !== prev.length;

      // Check ingredients for ROP
      ingredients.forEach(ing => {
        if (isAtOrBelowBuffer(ing.currentStock, ing.reorderPoint)) {
          const alertId = `rop-${ing.id}`;
          if (!seen.has(alertId)) {
            seen.add(alertId);
            nextAlerts.unshift({
              id: alertId,
              timestamp: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) + ' PST',
              type: 'rop_triggered',
              title: `REORDER POINT: ${ing.name}`,
              message: `Stock (${ing.currentStock} ${ing.unit}) has dropped below ROP (${ing.reorderPoint} ${ing.unit}). Immediate procurement required.`,
              severity: isAtOrBelowBuffer(ing.currentStock, ing.safetyStock) ? 'critical' : 'warning',
              read: false,
              targetRole: ['procurement', 'plant_manager', 'director']
            });
            changed = true;
          }
        }
      });

      // Check finished goods for overstock
      finishedGoods.forEach(fg => {
        if (fg.maxThreshold > 0 && fg.currentStock > fg.maxThreshold) {
          const alertId = `overstock-${fg.id}`;
          if (!seen.has(alertId)) {
            seen.add(alertId);
            nextAlerts.unshift({
              id: alertId,
              timestamp: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) + ' PST',
              type: 'overstock',
              title: `OVERSTOCK FLAG: ${fg.name}`,
              message: `Inventory count (${fg.currentStock} ${fg.unit}) exceeds safe cold storage threshold (${fg.maxThreshold} ${fg.unit}). Pause production to prevent cold chain overload.`,
              severity: 'warning',
              read: false,
              targetRole: ['director', 'plant_manager', 'production_staff']
            });
            changed = true;
          }
        }

        // Check finished goods for safety stock buffer breach
        if (isAtOrBelowBuffer(fg.currentStock, fg.safetyStock)) {
          const alertId = `fg-safety-${fg.id}`;
          if (!seen.has(alertId)) {
            seen.add(alertId);
            nextAlerts.unshift({
              id: alertId,
              timestamp: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) + ' PST',
              type: 'low_stock',
              title: `SAFETY STOCK BREACH: ${fg.name}`,
              message: `Finished good inventory (${fg.currentStock} ${fg.unit}) is at or below safety stock buffer (${fg.safetyStock} ${fg.unit}). Schedule production run immediately.`,
              severity: 'critical',
              read: false,
              targetRole: ['director', 'plant_manager', 'production_staff']
            });
            changed = true;
          }
        }
      });

      return changed ? nextAlerts : prev;
    });
  }, [ingredients, finishedGoods]);

  const addIngredient = (ingData: Omit<RawIngredient, 'id'>): boolean => {
    if (!authorizeDirectorMutation('add a raw material')) return false;
    const newIng: RawIngredient = {
      ...ingData,
      id: `ing-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`
    };
    const initialStockTransaction: StockTransaction | null = newIng.currentStock > 0 ? {
      id: `tx-ing-initial-${newIng.id}`,
      timestamp: new Date().toISOString(),
      itemId: newIng.id,
      itemName: newIng.name,
      itemType: 'ingredient',
      action: 'in_restock',
      quantity: newIng.currentStock,
      unit: newIng.unit,
      previousStock: 0,
      newStock: newIng.currentStock,
      performedBy: currentUser.name,
      notes: 'Initial stock recorded when raw ingredient was created',
    } : null;
    setIngredients(prev => [newIng, ...prev]);
    if (initialStockTransaction) {
      setTransactions(previous => [initialStockTransaction, ...previous]);
      void recordOfflineMutation('stock_adjustment', 'UPSERT_STOCK_TRANSACTION', initialStockTransaction);
    }
    logAuditAction({
      category: 'inventory',
      subsystem: 'Raw Ingredients',
      action: 'INGREDIENT_CREATED',
      description: `Registered new raw material: ${newIng.name} with initial stock ${newIng.currentStock} ${newIng.unit}`,
      details: {
        itemOrBatch: newIng.name,
        newValue: newIng.currentStock,
        unit: newIng.unit,
        reason: 'New raw ingredient catalog entry'
      },
      severity: 'info'
    });
    recordOfflineMutation('ingredient', 'CREATE_INGREDIENT', newIng);
    triggerManualCloudSync();
    return true;
  };

  const importPmoInventoryPeriod = (period: Omit<PmoInventoryPeriod, 'id' | 'createdAt' | 'createdBy' | 'status' | 'postedAt' | 'postedBy'>) => {
    if (!['developer', 'procurement', 'plant_manager'].includes(currentRole) ||
        !authorizeDirectorMutation('import a PMO inventory report')) {
      return { success: false, message: 'Your role cannot import PMO inventory reports.' };
    }
    if (!period.title.trim() || !period.sourceFileName.trim() || period.lines.length === 0) {
      return { success: false, message: 'Provide a report title, source filename, and at least one inventory line.' };
    }
    const newPeriod: PmoInventoryPeriod = {
      ...period,
      inventoryType: period.inventoryType || 'ingredient',
      id: `pmo-period-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`,
      createdAt: new Date().toISOString(),
      createdBy: currentUser.name,
      status: 'draft',
    };
    setPmoInventoryPeriods(previous => [newPeriod, ...previous]);
    logAuditAction({
      category: 'inventory',
      subsystem: 'PMO Inventory Register',
      action: 'PMO_INVENTORY_PERIOD_IMPORTED',
      description: `Imported ${newPeriod.lines.length} inventory lines for ${newPeriod.title}.`,
      details: {
        itemOrBatch: newPeriod.title,
        quantity: newPeriod.lines.length,
        unit: 'inventory lines',
        reason: `Source: ${newPeriod.sourceFileName}`,
      },
      severity: 'info',
    });
    triggerManualCloudSync();
    return { success: true, message: `Saved ${newPeriod.lines.length} inventory lines for ${newPeriod.title}.` };
  };

  const savePmoInventoryPeriod = (period: PmoInventoryPeriod) => {
    if (!['developer', 'procurement', 'plant_manager'].includes(currentRole)) {
      return { success: false, message: 'Your role cannot edit PMO inventory periods.' };
    }
    if (!period.title.trim() || !period.sourceFileName.trim()) {
      return { success: false, message: 'Provide an inventory period title and source.' };
    }
    if (period.lines.some(line =>
      !line.itemName.trim() ||
      !line.unit.trim() ||
      [
        line.beginningQuantity,
        line.purchasesQuantity,
        line.issuedToProductionQuantity,
        line.cashSalesQuantity,
        line.creditSalesQuantity,
        line.productPromoQuantity,
        line.remarksQuantity,
        line.lossOrReturnQuantity,
        line.endingQuantity,
      ]
        .some(quantity => quantity !== undefined && (!Number.isFinite(quantity) || quantity < 0))
    )) {
      return { success: false, message: 'Inventory item names, units, and quantities must be valid and non-negative.' };
    }
    const existing = pmoInventoryPeriods.find(item => item.id === period.id);
    if (existing?.status === 'posted') {
      return { success: false, message: 'Posted inventory periods are locked and cannot be edited.' };
    }
    const updated: PmoInventoryPeriod = {
      ...period,
      inventoryType: period.inventoryType || existing?.inventoryType || 'ingredient',
      title: period.title.trim(),
      sourceFileName: period.sourceFileName.trim(),
      status: 'draft',
      createdAt: existing?.createdAt || period.createdAt || new Date().toISOString(),
      createdBy: existing?.createdBy || period.createdBy || currentUser.name,
      postedAt: undefined,
      postedBy: undefined,
    };
    setPmoInventoryPeriods(previous => existing
      ? previous.map(item => item.id === updated.id ? updated : item)
      : [updated, ...previous]
    );
    void recordOfflineMutation('pmo_inventory_period', 'SQL_UPSERT', updated);
    logAuditAction({
      category: 'inventory',
      subsystem: 'PMO Inventory Register',
      action: existing ? 'PMO_INVENTORY_PERIOD_UPDATED' : 'PMO_INVENTORY_PERIOD_CREATED',
      description: `${existing ? 'Updated' : 'Created'} the draft inventory period ${updated.title}.`,
      details: { itemOrBatch: updated.title, quantity: updated.lines.length, unit: 'inventory lines' },
      severity: 'info',
    });
    triggerManualCloudSync();
    return { success: true, message: `Saved ${updated.title}.` };
  };

  const postPmoInventoryPeriod = (periodId: string, draftLines?: PmoInventoryLine[]) => {
    if (!['developer', 'procurement', 'plant_manager'].includes(currentRole)) {
      return { success: false, message: 'Your role cannot post PMO inventory periods.' };
    }
    const existingPeriod = pmoInventoryPeriods.find(item => item.id === periodId);
    if (!existingPeriod) return { success: false, message: 'Inventory period not found.' };
    if (existingPeriod.status === 'posted') {
      return { success: false, message: `${existingPeriod.title} has already been posted.` };
    }
    const period = draftLines ? { ...existingPeriod, lines: draftLines } : existingPeriod;
    if (period.lines.length === 0) {
      return { success: false, message: 'Add at least one inventory item before posting.' };
    }

    const inventoryType = period.inventoryType || 'ingredient';
    const seenItems = new Set<string>();
    const endingByItem = new Map<string, number>();
    for (const line of period.lines) {
      const itemId = inventoryType === 'finished_good' ? line.finishedGoodId : line.ingredientId;
      if (!itemId) {
        return {
          success: false,
          message: inventoryType === 'finished_good'
            ? `Link ${line.itemName} to Finished Goods before posting.`
            : `Link ${line.itemName} to Raw Ingredients before posting.`,
        };
      }
      if (seenItems.has(itemId)) {
        return { success: false, message: `${line.itemName} appears more than once in this period.` };
      }
      seenItems.add(itemId);
      const item = inventoryType === 'finished_good'
        ? finishedGoods.find(good => good.id === itemId)
        : ingredients.find(ingredient => ingredient.id === itemId);
      if (!item) {
        return {
          success: false,
          message: inventoryType === 'finished_good'
            ? `Finished good ${line.itemName} no longer exists.`
            : `Raw ingredient ${line.itemName} no longer exists.`,
        };
      }
      if (item.unit.trim().toLowerCase() !== line.unit.trim().toLowerCase()) {
        return { success: false, message: `${line.itemName} uses ${item.unit} in shared inventory but ${line.unit} in this report.` };
      }
      const activity = getPmoInventoryActivity(period, line, transactions);
      const expectedEnding = calculatePmoExpectedEnding(line, activity, inventoryType);
      if ([
        line.beginningQuantity,
        line.purchasesQuantity,
        line.issuedToProductionQuantity,
        line.cashSalesQuantity,
        line.creditSalesQuantity,
        line.productPromoQuantity,
        line.remarksQuantity,
        line.lossOrReturnQuantity,
        line.endingQuantity,
      ].some(quantity => quantity !== undefined && (!Number.isFinite(quantity) || quantity < 0))) {
        return { success: false, message: `Enter non-negative values for all inventory columns for ${line.itemName}.` };
      }
      if (line.beginningQuantity === undefined ||
          !Number.isFinite(line.beginningQuantity) ||
          line.beginningQuantity < 0 ||
          line.endingQuantity === undefined ||
          !Number.isFinite(line.endingQuantity) ||
          line.endingQuantity < 0 ||
          expectedEnding === null ||
          !Number.isFinite(expectedEnding)) {
        return { success: false, message: `Complete valid beginning and physical ending counts for ${line.itemName}.` };
      }
      endingByItem.set(itemId, line.endingQuantity);
    }

    const postedAt = new Date().toISOString();
    const updatedIngredients = ingredients.map(ingredient => {
      const endingQuantity = inventoryType === 'ingredient' ? endingByItem.get(ingredient.id) : undefined;
      return endingQuantity === undefined
        ? ingredient
        : { ...ingredient, currentStock: endingQuantity };
    });
    const updatedFinishedGoods = finishedGoods.map(good => {
      const endingQuantity = inventoryType === 'finished_good' ? endingByItem.get(good.id) : undefined;
      return endingQuantity === undefined
        ? good
        : { ...good, currentStock: endingQuantity };
    });
    const reconciliationTransactions: StockTransaction[] = [];
    if (inventoryType === 'ingredient') {
      for (const ingredient of ingredients) {
        const endingQuantity = endingByItem.get(ingredient.id);
        if (endingQuantity === undefined || endingQuantity === ingredient.currentStock) continue;
        reconciliationTransactions.push({
          id: `tx-pmo-${period.id}-${ingredient.id}`,
          timestamp: postedAt,
          itemId: ingredient.id,
          itemName: ingredient.name,
          itemType: 'ingredient',
          action: 'inventory_reconciliation',
          quantity: Math.abs(endingQuantity - ingredient.currentStock),
          unit: ingredient.unit,
          previousStock: ingredient.currentStock,
          newStock: endingQuantity,
          referenceId: period.id,
          performedBy: currentUser.name,
          notes: `Physical count reconciliation for ${period.title}`,
        });
      }
    } else {
      for (const good of finishedGoods) {
        const endingQuantity = endingByItem.get(good.id);
        if (endingQuantity === undefined || endingQuantity === good.currentStock) continue;
        reconciliationTransactions.push({
          id: `tx-pmo-${period.id}-${good.id}`,
          timestamp: postedAt,
          itemId: good.id,
          itemName: good.name,
          itemType: 'finished_good',
          action: 'inventory_reconciliation',
          quantity: Math.abs(endingQuantity - good.currentStock),
          unit: good.unit,
          previousStock: good.currentStock,
          newStock: endingQuantity,
          referenceId: period.id,
          performedBy: currentUser.name,
          notes: `Physical count reconciliation for ${period.title}`,
        });
      }
    }
    const postedPeriod: PmoInventoryPeriod = {
      ...period,
      status: 'posted',
      postedAt,
      postedBy: currentUser.name,
    };

    if (inventoryType === 'ingredient') setIngredients(updatedIngredients);
    else setFinishedGoods(updatedFinishedGoods);
    setTransactions(previous => [...reconciliationTransactions, ...previous]);
    setPmoInventoryPeriods(previous => previous.map(item => item.id === period.id ? postedPeriod : item));
    if (inventoryType === 'ingredient') {
      for (const ingredient of updatedIngredients) {
        if (!endingByItem.has(ingredient.id)) continue;
        void recordOfflineMutation('ingredient', 'UPSERT_RAW_INGREDIENT', ingredient);
      }
    } else {
      for (const good of updatedFinishedGoods) {
        if (!endingByItem.has(good.id)) continue;
        void recordOfflineMutation('finished_good', 'CREATE_FINISHED_GOOD', good);
      }
    }
    reconciliationTransactions.forEach(transaction => {
      void recordOfflineMutation('stock_adjustment', 'UPSERT_STOCK_TRANSACTION', transaction);
    });
    void recordOfflineMutation('pmo_inventory_period', 'SQL_UPSERT', postedPeriod);
    logAuditAction({
      category: inventoryType === 'finished_good' ? 'cold_storage' : 'inventory',
      subsystem: 'PMO Inventory Register',
      action: 'PMO_INVENTORY_PERIOD_POSTED',
      description: `Posted ${postedPeriod.title} and reconciled ${endingByItem.size} ${inventoryType === 'finished_good' ? 'finished good' : 'raw ingredient'} balances to physical counts.`,
      details: {
        itemOrBatch: postedPeriod.title,
        quantity: endingByItem.size,
        unit: inventoryType === 'finished_good' ? 'finished goods reconciled' : 'ingredients reconciled',
        reason: `${reconciliationTransactions.length} stock balance adjustments recorded`,
        referenceId: postedPeriod.id,
      },
      severity: reconciliationTransactions.length > 0 ? 'warning' : 'success',
    });
    triggerManualCloudSync();
    return { success: true, message: `Posted ${postedPeriod.title}; ${reconciliationTransactions.length} physical-count variances were applied to shared stock.` };
  };

  const deletePmoInventoryPeriod = (periodId: string) => {
    if (currentRole !== 'developer') {
      return { success: false, message: 'Only a Developer can delete PMO inventory periods.' };
    }
    const period = pmoInventoryPeriods.find(item => item.id === periodId);
    if (!period) return { success: false, message: 'Inventory period not found.' };

    setPmoInventoryPeriods(previous => previous.filter(item => item.id !== period.id));
    logAuditAction({
      category: 'inventory',
      subsystem: 'PMO Inventory Register',
      action: 'PMO_INVENTORY_PERIOD_DELETED',
      description: `Deleted the ${period.status} inventory period ${period.title}. Stock movements and reconciliations recorded from this period were not reversed.`,
      details: {
        itemOrBatch: period.title,
        quantity: period.lines.length,
        unit: 'inventory lines',
        reason: 'Developer deleted the PMO inventory period; shared stock transaction history was preserved',
        referenceId: period.id,
      },
      severity: 'warning',
    });
    triggerManualCloudSync();
    return { success: true, message: `${period.title} was deleted. Shared stock movements and transaction history were preserved.` };
  };

  const recordPmoInventoryAdjustment = (
    ingredientId: string,
    quantity: number,
    kind: 'expired' | 'damage' | 'waste' | 'returned',
    notes?: string
  ) => {
    if (!['developer', 'procurement', 'plant_manager'].includes(currentRole)) {
      return { success: false, message: 'Your role cannot record PMO inventory adjustments.' };
    }
    const ingredient = ingredients.find(item => item.id === ingredientId);
    if (!ingredient) return { success: false, message: 'Raw ingredient not found.' };
    if (!Number.isFinite(quantity) || quantity <= 0) {
      return { success: false, message: 'Enter an adjustment quantity greater than zero.' };
    }
    const isReturn = kind === 'returned';
    const newStock = ingredient.currentStock + (isReturn ? quantity : -quantity);
    if (newStock < 0) {
      return { success: false, message: `The adjustment exceeds available ${ingredient.name} stock.` };
    }
    const timestamp = new Date().toISOString();
    const transaction: StockTransaction = {
      id: `tx-pmo-adjustment-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`,
      timestamp,
      itemId: ingredient.id,
      itemName: ingredient.name,
      itemType: 'ingredient',
      action: isReturn ? 'inventory_return' : 'inventory_loss',
      quantity,
      unit: ingredient.unit,
      previousStock: ingredient.currentStock,
      newStock,
      performedBy: currentUser.name,
      notes: `${kind}${notes ? `: ${notes}` : ''}`,
    };
    const updatedIngredient = { ...ingredient, currentStock: newStock };

    setIngredients(previous => previous.map(item =>
      item.id === ingredient.id ? updatedIngredient : item
    ));
    setTransactions(previous => [transaction, ...previous]);
    void recordOfflineMutation('ingredient', 'UPSERT_RAW_INGREDIENT', updatedIngredient);
    void recordOfflineMutation('stock_adjustment', 'UPSERT_STOCK_TRANSACTION', transaction);
    logAuditAction({
      category: 'inventory',
      subsystem: 'PMO Inventory Register',
      action: isReturn ? 'PMO_INVENTORY_RETURN_RECORDED' : 'PMO_INVENTORY_LOSS_RECORDED',
      description: `${kind} ${quantity} ${ingredient.unit} of ${ingredient.name}; shared stock changed from ${ingredient.currentStock} to ${newStock}.`,
      details: {
        itemOrBatch: ingredient.name,
        previousValue: ingredient.currentStock,
        newValue: newStock,
        quantity,
        unit: ingredient.unit,
        reason: notes || kind,
        referenceId: transaction.id,
      },
      severity: isReturn ? 'info' : 'warning',
    });
    triggerManualCloudSync();
    return { success: true, message: `Recorded ${kind} for ${ingredient.name}; the shared stock balance is now ${newStock} ${ingredient.unit}.` };
  };

  const recordPmoFinishedGoodAdjustment = (
    finishedGoodId: string,
    quantity: number,
    kind: 'expired' | 'damage' | 'waste' | 'returned',
    notes?: string
  ) => {
    if (!['developer', 'procurement', 'plant_manager'].includes(currentRole)) {
      return { success: false, message: 'Your role cannot record PMO inventory adjustments.' };
    }
    const good = finishedGoods.find(item => item.id === finishedGoodId);
    if (!good) return { success: false, message: 'Finished good not found.' };
    if (!Number.isFinite(quantity) || quantity <= 0) {
      return { success: false, message: 'Enter an adjustment quantity greater than zero.' };
    }
    const isReturn = kind === 'returned';
    const newStock = good.currentStock + (isReturn ? quantity : -quantity);
    if (newStock < 0) {
      return { success: false, message: `The adjustment exceeds available ${good.name} stock.` };
    }
    const timestamp = new Date().toISOString();
    const transaction: StockTransaction = {
      id: `tx-pmo-adjustment-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`,
      timestamp,
      itemId: good.id,
      itemName: good.name,
      itemType: 'finished_good',
      action: isReturn ? 'inventory_return' : 'inventory_loss',
      quantity,
      unit: good.unit,
      previousStock: good.currentStock,
      newStock,
      performedBy: currentUser.name,
      notes: `${kind}${notes ? `: ${notes}` : ''}`,
    };
    const updatedGood = { ...good, currentStock: newStock };

    setFinishedGoods(previous => previous.map(item => item.id === good.id ? updatedGood : item));
    setTransactions(previous => [transaction, ...previous]);
    void recordOfflineMutation('finished_good', 'CREATE_FINISHED_GOOD', updatedGood);
    void recordOfflineMutation('stock_adjustment', 'UPSERT_STOCK_TRANSACTION', transaction);
    logAuditAction({
      category: 'cold_storage',
      subsystem: 'PMO Inventory Register',
      action: isReturn ? 'PMO_INVENTORY_RETURN_RECORDED' : 'PMO_INVENTORY_LOSS_RECORDED',
      description: `${kind} ${quantity} ${good.unit} of ${good.name}; shared stock changed from ${good.currentStock} to ${newStock}.`,
      details: {
        itemOrBatch: good.name,
        previousValue: good.currentStock,
        newValue: newStock,
        quantity,
        unit: good.unit,
        reason: notes || kind,
        referenceId: transaction.id,
      },
      severity: isReturn ? 'info' : 'warning',
    });
    triggerManualCloudSync();
    return { success: true, message: `Recorded ${kind} for ${good.name}; the shared stock balance is now ${newStock} ${good.unit}.` };
  };

  const addPmoExternalPurchase = (
    periodId: string,
    ingredientData: Omit<RawIngredient, 'id' | 'currentStock' | 'lastRestocked'>,
    quantity: number
  ) => {
    if (!['developer', 'procurement', 'plant_manager'].includes(currentRole)) {
      return { success: false, message: 'Your role cannot record PMO outside purchases.' };
    }
    const period = pmoInventoryPeriods.find(item => item.id === periodId);
    if (!period || period.status !== 'draft' || (period.inventoryType || 'ingredient') !== 'ingredient') {
      return { success: false, message: 'Select an existing draft period before recording an outside purchase.' };
    }
    const name = ingredientData.name.trim();
    const sku = ingredientData.sku.trim();
    if (!name || !sku || !ingredientData.unit.trim() || !ingredientData.supplier.trim()) {
      return { success: false, message: 'Provide an item name, SKU, unit, and supplier.' };
    }
    if (!Number.isFinite(quantity) || quantity <= 0 || !Number.isFinite(ingredientData.costPerUnit) || ingredientData.costPerUnit < 0) {
      return { success: false, message: 'Purchase quantity must be greater than zero and unit cost must be non-negative.' };
    }
    if ([ingredientData.safetyStock, ingredientData.reorderPoint, ingredientData.maxStock, ingredientData.avgDailyConsumption, ingredientData.leadTimeDays]
      .some(value => !Number.isFinite(value) || value < 0) ||
      (ingredientData.maxStock > 0 && ingredientData.maxStock < ingredientData.safetyStock)) {
      return { success: false, message: 'Enter valid non-negative stock thresholds and lead-time values; maximum stock must cover safety stock.' };
    }
    const duplicate = ingredients.find(item =>
      item.sku.trim().toLowerCase() === sku.toLowerCase() ||
      item.name.trim().toLowerCase() === name.toLowerCase()
    );
    if (duplicate) {
      return { success: false, message: `${duplicate.name} already exists in Raw Ingredients. Add the purchase to that existing item instead.` };
    }
    const now = new Date();
    const newIngredient: RawIngredient = {
      ...ingredientData,
      id: `ing-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
      sku,
      name,
      category: ingredientData.category.trim().toLowerCase(),
      unit: ingredientData.unit.trim(),
      supplier: ingredientData.supplier.trim(),
      currentStock: quantity,
      lastRestocked: now.toLocaleString() + ' PST',
    };
    const newLine: PmoInventoryLine = {
      id: `pmo-line-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`,
      itemName: newIngredient.name,
      ingredientId: newIngredient.id,
      unit: newIngredient.unit,
      beginningQuantity: 0,
      liveLedger: true,
      notes: 'Outside purchase recorded with new Raw Ingredients catalog entry',
    };
    const newTransaction: StockTransaction = {
      id: `tx-pmo-purchase-${period.id}-${newIngredient.id}`,
      timestamp: now.toISOString(),
      itemId: newIngredient.id,
      itemName: newIngredient.name,
      itemType: 'ingredient',
      action: 'in_restock',
      quantity,
      unit: newIngredient.unit,
      previousStock: 0,
      newStock: quantity,
      referenceId: period.id,
      unitPrice: newIngredient.costPerUnit,
      performedBy: currentUser.name,
      notes: `Outside purchase recorded for PMO inventory period ${period.title}`,
    };
    const updatedPeriod = { ...period, lines: [...period.lines, newLine] };

    setIngredients(previous => [newIngredient, ...previous]);
    setTransactions(previous => [newTransaction, ...previous]);
    setPmoInventoryPeriods(previous => previous.map(item => item.id === period.id ? updatedPeriod : item));
    void recordOfflineMutation('ingredient', 'CREATE_INGREDIENT', newIngredient);
    void recordOfflineMutation('stock_adjustment', 'UPSERT_STOCK_TRANSACTION', newTransaction);
    void recordOfflineMutation('pmo_inventory_period', 'SQL_UPSERT', updatedPeriod);
    logAuditAction({
      category: 'inventory',
      subsystem: 'PMO Inventory Register',
      action: 'PMO_OUTSIDE_PURCHASE_ADDED',
      description: `Created ${newIngredient.name} in Raw Ingredients and recorded a purchase of ${quantity} ${newIngredient.unit}.`,
      details: {
        itemOrBatch: newIngredient.name,
        quantity,
        unit: newIngredient.unit,
        costOrTotal: quantity * newIngredient.costPerUnit,
        reason: 'Outside purchase created as a shared Raw Ingredients record',
        referenceId: period.id,
      },
      severity: 'success',
    });
    triggerManualCloudSync();
    return { success: true, message: `${newIngredient.name} was added to Raw Ingredients and the purchase was recorded.` };
  };

  const updateIngredientStock = (id: string, newStock: number, notes?: string, expiryDate?: string) => {
    if (!authorizeDirectorMutation('update raw material stock')) return false;
    let newTx: StockTransaction | null = null;
    let targetIng: RawIngredient | undefined;
    let prevStock = 0;

    setIngredients(prev => prev.map(ing => {
      if (ing.id === id) {
        targetIng = ing;
        prevStock = ing.currentStock;
        const diff = newStock - ing.currentStock;
        newTx = {
          id: `tx-ing-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
          timestamp: new Date().toISOString(),
          itemId: ing.id,
          itemName: ing.name,
          itemType: 'ingredient',
          action: diff >= 0 ? 'in_restock' : 'inventory_adjustment',
          quantity: Math.abs(diff),
          unit: ing.unit,
          previousStock: ing.currentStock,
          newStock: newStock,
          performedBy: currentUser.name,
          notes: notes || 'Manual stock adjustment'
        };

        return {
          ...ing,
          currentStock: newStock,
          expiryDate: expiryDate !== undefined ? expiryDate : ing.expiryDate,
          lastRestocked: diff > 0 ? new Date().toLocaleString() + ' PST' : ing.lastRestocked
        };
      }
      return ing;
    }));

    if (newTx) {
      setTransactions(t => [newTx!, ...t]);
    }
    if (targetIng) {
      const diff = newStock - prevStock;
      recordOfflineMutation('stock_adjustment', 'UPDATE_INGREDIENT_STOCK', {
        id,
        name: targetIng.name,
        previousStock: prevStock,
        newStock,
        notes,
        expiryDate
      });
      logAuditAction({
        category: 'inventory',
        subsystem: 'Raw Ingredients',
        action: diff >= 0 ? 'STOCK_RESTOCKED' : 'STOCK_ADJUSTED',
        description: `Raw ingredient stock for ${targetIng.name} modified from ${prevStock} to ${newStock} ${targetIng.unit}`,
        details: {
          itemOrBatch: targetIng.name,
          previousValue: prevStock,
          newValue: newStock,
          quantity: Math.abs(diff),
          unit: targetIng.unit,
          reason: notes || 'Warehouse inventory adjustment'
        },
        severity: diff < 0 && isAtOrBelowBuffer(newStock, targetIng.reorderPoint) ? 'warning' : 'info'
      });
    }
    triggerManualCloudSync();
    return true;
  };

  const addFinishedGood = (fgData: Omit<FinishedGood, 'id'>) => {
    if (!authorizeDirectorMutation('add a finished product')) return;
    const newFg: FinishedGood = {
      ...fgData,
      id: `fg-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`
    };
    setFinishedGoods(prev => [newFg, ...prev]);
    recordOfflineMutation('finished_good', 'CREATE_FINISHED_GOOD', newFg);
    logAuditAction({
      category: 'cold_storage',
      subsystem: 'Cold Storage',
      action: 'PRODUCT_REGISTERED',
      description: `Registered new dairy SKU: ${newFg.name} (Retail ₱${newFg.unitPrice})`,
      details: {
        itemOrBatch: newFg.name,
        newValue: newFg.currentStock,
        unit: newFg.unit,
        costOrTotal: newFg.unitPrice
      },
      severity: 'info'
    });
    triggerManualCloudSync();
  };

  const updateFinishedGoodRecipe = (
    id: string,
    recipe: BomIngredientRequirement[],
    batchUnitQuantity: number,
    unit: string,
    containerVolumeMl?: number
  ) => {
    if (!['developer', 'director', 'plant_manager'].includes(currentRole)) return false;
    if (!authorizeDirectorMutation('update a finished product recipe')) return false;
    if (!Number.isFinite(batchUnitQuantity) || batchUnitQuantity <= 0) return false;
    if (!unit.trim()) return false;
    if (containerVolumeMl !== undefined &&
        (!Number.isFinite(containerVolumeMl) || containerVolumeMl <= 0)) return false;
    if (recipe.some(item =>
      !item.ingredientId ||
      !item.ingredientName.trim() ||
      !item.unit.trim() ||
      !Number.isFinite(item.quantityRequired) ||
      item.quantityRequired <= 0 ||
      (item.quantityRequiredMax !== undefined && (
        !Number.isFinite(item.quantityRequiredMax) ||
        item.quantityRequiredMax < item.quantityRequired
      ))
    )) return false;
    if (recipe.some(item => {
      const ingredient = ingredients.find(row => row.id === item.ingredientId);
      return !ingredient || getRecipeUnitsPerInventoryUnit(
        ingredient.unit,
        item.unit,
        item.recipeUnitsPerInventoryUnit
      ) === null;
    })) return false;
    if (new Set(recipe.map(item => item.ingredientId)).size !== recipe.length) return false;
    if (recipe.some(item => {
      const substituteIds = (item.substitutes || []).map(substitute => substitute.ingredientId);
      return substituteIds.some((substituteId, index) => {
        const substitute = ingredients.find(row => row.id === substituteId);
        return !substitute ||
          substituteId === item.ingredientId ||
          substituteIds.indexOf(substituteId) !== index ||
          getRecipeUnitsPerInventoryUnit(
            substitute.unit,
            item.unit,
            item.substitutes?.[index].recipeUnitsPerInventoryUnit
          ) === null;
      });
    })) return false;

    const target = finishedGoods.find(product => product.id === id);
    if (!target) return false;

    setFinishedGoods(prev => prev.map(product => product.id === id
      ? {
        ...product,
        recipe,
        batchUnitQuantity,
        unit: unit.trim(),
        containerVolumeMl: ['bottles', 'tubs'].includes(unit.trim().toLowerCase())
          ? containerVolumeMl
          : undefined,
      }
      : product
    ));
    logAuditAction({
      category: 'production',
      subsystem: 'Finished Goods',
      action: 'PRODUCT_RECIPE_UPDATED',
      description: `Updated production recipe for ${target.name} to produce ${batchUnitQuantity} ${unit.trim()}`,
      details: {
        itemOrBatch: target.name,
        quantity: recipe.length,
        unit: 'ingredients',
        reason: 'Product bill of materials updated'
      },
      severity: 'info'
    });
    triggerManualCloudSync();
    return true;
  };

  const updateFinishedGoodStock = (id: string, newStock: number, notes?: string) => {
    if (!authorizeDirectorMutation('update finished goods stock')) return false;
    let newTx: StockTransaction | null = null;
    let targetFg: FinishedGood | undefined;
    let prevStock = 0;

    setFinishedGoods(prev => prev.map(fg => {
      if (fg.id === id) {
        targetFg = fg;
        prevStock = fg.currentStock;
        const diff = newStock - fg.currentStock;
        newTx = {
          id: `tx-fg-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
          timestamp: new Date().toISOString(),
          itemId: fg.id,
          itemName: fg.name,
          itemType: 'finished_good',
          action: diff >= 0 ? 'wip_complete' : 'out_sale',
          quantity: Math.abs(diff),
          unit: fg.unit,
          previousStock: fg.currentStock,
          newStock: newStock,
          performedBy: currentUser.name,
          notes: notes || 'Manual finished goods adjustment'
        };

        return {
          ...fg,
          currentStock: newStock
        };
      }
      return fg;
    }));

    if (newTx) {
      setTransactions(t => [newTx!, ...t]);
    }
    if (targetFg) {
      logAuditAction({
        category: 'cold_storage',
        subsystem: 'Cold Storage',
        action: 'COLD_STORAGE_ADJUSTED',
        description: `Cold storage inventory for ${targetFg.name} adjusted from ${prevStock} to ${newStock} ${targetFg.unit}`,
        details: {
          itemOrBatch: targetFg.name,
          previousValue: prevStock,
          newValue: newStock,
          quantity: Math.abs(newStock - prevStock),
          unit: targetFg.unit,
          reason: notes || 'Cold storage audit count'
        },
        severity: isAtOrBelowBuffer(newStock, targetFg.safetyStock) ? 'warning' : 'info'
      });
    }
    triggerManualCloudSync();
    return true;
  };

  const updateFinishedGoodSafetyStock = (id: string, safetyStock: number) => {
    if (!authorizeDirectorMutation('update finished goods safety stock')) return;
    const targetFg = finishedGoods.find(fg => fg.id === id);
    setFinishedGoods(prev => prev.map(fg => fg.id === id ? { ...fg, safetyStock: Math.max(0, safetyStock) } : fg));
    if (targetFg) {
      logAuditAction({
        category: 'cold_storage',
        subsystem: 'Cold Storage',
        action: 'SAFETY_STOCK_UPDATED',
        description: `Safety stock buffer for ${targetFg.name} modified from ${targetFg.safetyStock} to ${safetyStock} ${targetFg.unit}`,
        details: {
          itemOrBatch: targetFg.name,
          previousValue: targetFg.safetyStock,
          newValue: safetyStock,
          unit: targetFg.unit,
          reason: 'Cold storage buffer re-calibration'
        },
        severity: 'info'
      });
    }
    triggerManualCloudSync();
  };

  // Bulk update raw ingredient stocks
  const bulkUpdateIngredientsStock = (updates: { id: string; newStock: number }[], notes: string) => {
    if (updates.length === 0) return { success: false, count: 0 };
    if (!authorizeDirectorMutation('bulk update raw material stock')) return { success: false, count: 0 };
    
    const updateMap = new Map(updates.map(u => [u.id, u.newStock]));
    const newTransactions: StockTransaction[] = [];
    const affectedNames: string[] = [];

    setIngredients(prev => prev.map(ing => {
      if (updateMap.has(ing.id)) {
        const newStock = Math.max(0, updateMap.get(ing.id)!);
        const diff = newStock - ing.currentStock;
        affectedNames.push(`${ing.name} (${ing.currentStock} -> ${newStock} ${ing.unit})`);
        
        newTransactions.push({
          id: `tx-bulk-ing-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
          timestamp: new Date().toISOString(),
          itemId: ing.id,
          itemName: ing.name,
          itemType: 'ingredient',
          action: diff >= 0 ? 'in_restock' : 'inventory_adjustment',
          quantity: Math.abs(diff),
          unit: ing.unit,
          previousStock: ing.currentStock,
          newStock: newStock,
          performedBy: currentUser.name,
          notes: notes || 'Bulk inventory adjustment'
        });

        return {
          ...ing,
          currentStock: newStock,
          lastRestocked: diff > 0 ? new Date().toLocaleString() + ' PST' : ing.lastRestocked
        };
      }
      return ing;
    }));

    if (newTransactions.length > 0) {
      setTransactions(t => [...newTransactions, ...t]);
    }

    logAuditAction({
      category: 'inventory',
      subsystem: 'Raw Ingredients',
      action: 'BULK_STOCK_ADJUSTMENT',
      description: `Bulk updated ${updates.length} raw ingredient items. Reason: ${notes || 'Batch warehouse count'}`,
      details: {
        itemOrBatch: `${updates.length} raw materials`,
        reason: notes || 'Bulk count reconciliation',
        count: updates.length,
        itemsAffected: affectedNames.join(', ')
      },
      severity: 'warning'
    });

    triggerManualCloudSync();
    return { success: true, count: updates.length };
  };

  // Bulk delete raw ingredients
  const bulkDeleteIngredients = (ids: string[]) => {
    if (ids.length === 0) return { success: false, count: 0 };
    if (!authorizeDirectorMutation('delete raw materials')) return { success: false, count: 0 };
    const idSet = new Set(ids);
    const toDelete = ingredients.filter(i => idSet.has(i.id));

    setIngredients(prev => prev.filter(i => !idSet.has(i.id)));

    logAuditAction({
      category: 'inventory',
      subsystem: 'Raw Ingredients',
      action: 'BULK_INGREDIENTS_DELETED',
      description: `Bulk deleted ${toDelete.length} raw ingredient items: ${toDelete.map(i => i.name).join(', ')}`,
      details: {
        count: toDelete.length,
        itemsDeleted: toDelete.map(i => i.name).join(', ')
      },
      severity: 'critical'
    });

    triggerManualCloudSync();
    return { success: true, count: toDelete.length };
  };

  // Bulk update finished goods stock
  const bulkUpdateFinishedGoodsStock = (updates: { id: string; newStock: number; newSafetyStock?: number }[], notes: string) => {
    if (updates.length === 0) return { success: false, count: 0 };
    if (!authorizeDirectorMutation('bulk update finished goods stock')) return { success: false, count: 0 };
    
    const updateMap = new Map(updates.map(u => [u.id, u]));
    const newTransactions: StockTransaction[] = [];
    const affectedNames: string[] = [];

    setFinishedGoods(prev => prev.map(fg => {
      if (updateMap.has(fg.id)) {
        const update = updateMap.get(fg.id)!;
        const newStock = Math.max(0, update.newStock);
        const diff = newStock - fg.currentStock;
        affectedNames.push(`${fg.name} (${fg.currentStock} -> ${newStock} ${fg.unit})`);

        newTransactions.push({
          id: `tx-bulk-fg-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
          timestamp: new Date().toISOString(),
          itemId: fg.id,
          itemName: fg.name,
          itemType: 'finished_good',
          action: diff >= 0 ? 'wip_complete' : 'out_sale',
          quantity: Math.abs(diff),
          unit: fg.unit,
          previousStock: fg.currentStock,
          newStock: newStock,
          performedBy: currentUser.name,
          notes: notes || 'Bulk cold storage adjustment'
        });

        return {
          ...fg,
          currentStock: newStock,
          safetyStock: update.newSafetyStock !== undefined ? Math.max(0, update.newSafetyStock) : fg.safetyStock
        };
      }
      return fg;
    }));

    if (newTransactions.length > 0) {
      setTransactions(t => [...newTransactions, ...t]);
    }

    logAuditAction({
      category: 'cold_storage',
      subsystem: 'Cold Storage',
      action: 'BULK_FINISHED_GOODS_ADJUSTMENT',
      description: `Bulk updated ${updates.length} cold storage finished goods. Reason: ${notes || 'Cold storage audit'}`,
      details: {
        count: updates.length,
        itemsAffected: affectedNames.join(', '),
        reason: notes || 'Bulk count reconciliation'
      },
      severity: 'warning'
    });

    triggerManualCloudSync();
    return { success: true, count: updates.length };
  };

  // Bulk delete finished goods
  const bulkDeleteFinishedGoods = (ids: string[]) => {
    if (ids.length === 0) return { success: false, count: 0 };
    if (!authorizeDirectorMutation('delete finished goods')) return { success: false, count: 0 };
    const idSet = new Set(ids);
    const toDelete = finishedGoods.filter(f => idSet.has(f.id));

    setFinishedGoods(prev => prev.filter(f => !idSet.has(f.id)));

    logAuditAction({
      category: 'cold_storage',
      subsystem: 'Cold Storage',
      action: 'BULK_FINISHED_GOODS_DELETED',
      description: `Bulk removed ${toDelete.length} finished goods from cold storage registry: ${toDelete.map(f => f.name).join(', ')}`,
      details: {
        count: toDelete.length,
        itemsDeleted: toDelete.map(f => f.name).join(', ')
      },
      severity: 'critical'
    });

    triggerManualCloudSync();
    return { success: true, count: toDelete.length };
  };

  // Quick Action: Register Raw Ingredient Arrival
  const quickRegisterIngredientArrival = (data: { ingredientId: string; quantityAdded: number; supplierReceipt?: string; notes?: string }) => {
    const target = ingredients.find(i => i.id === data.ingredientId);
    if (!target) return { success: false, message: 'Ingredient SKU not found.' };
    if (data.quantityAdded <= 0) return { success: false, message: 'Quantity added must be greater than 0.' };

    const newStock = target.currentStock + data.quantityAdded;
    const stockUpdated = updateIngredientStock(target.id, newStock, `Quick Arrival Log: ${data.supplierReceipt ? `DR #${data.supplierReceipt} - ` : ''}${data.notes || 'Cooperative / Supplier delivery'}`);
    if (!stockUpdated) return { success: false, message: 'Director authorization was canceled or failed.' };

    return { 
      success: true, 
      message: `Successfully logged arrival of ${data.quantityAdded} ${target.unit} of ${target.name}. New balance: ${newStock} ${target.unit}.` 
    };
  };

  // Quick Action: Log Finished Batch directly into Cold Storage
  const quickLogFinishedBatch = (data: { productId: string; quantity: number; notes?: string }) => {
    const product = finishedGoods.find(p => p.id === data.productId);
    if (!product) return { success: false, message: 'Finished product not found.' };
    if (data.quantity <= 0) return { success: false, message: 'Quantity must be greater than 0.' };

    const newStock = product.currentStock + data.quantity;
    const stockUpdated = updateFinishedGoodStock(product.id, newStock, `Direct Batch Log: ${data.notes || 'Direct plant release into cold storage'}`);
    if (!stockUpdated) return { success: false, message: 'Director authorization was canceled or failed.' };

    // Create completed batch record
    const batchNum = `BATCH-QUICK-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`;
    const newBatch: WipBatch = {
      id: `wip-quick-${Date.now()}`,
      batchNumber: batchNum,
      productId: product.id,
      productName: product.name,
      targetQuantity: data.quantity,
      rawMilkVolumeUsed: Math.round(data.quantity * 0.3),
      ingredientsUsed: [],
      status: 'completed',
      assignedStaff: currentUser.name,
      startDate: new Date().toLocaleString() + ' PST',
      estimatedCompletion: new Date().toLocaleString() + ' PST',
      completedAt: new Date().toLocaleString() + ' PST',
      notes: data.notes || 'Quick batch completed and released directly to cold storage.',
      coldStorageTemp: '3.8°C'
    };

    setWipBatches(prev => [newBatch, ...prev]);

    return { 
      success: true, 
      message: `Logged batch ${batchNum}: +${data.quantity} ${product.unit} of ${product.name} stored in ${product.location}.` 
    };
  };

  // Cross-reference Cold Storage and WIP Batches for Expiration Widget
  const batchExpiries: BatchExpiryAlert[] = [
    // Cold storage finished goods cross-referenced with shelf-life
    ...finishedGoods.map((fg, idx) => {
      const daysOld = idx === 1 ? 8 : (idx === 4 ? 9 : (idx === 0 ? 11 : 4));
      const daysRemaining = Math.max(0, fg.shelfLifeDays - daysOld);
      const mfgDate = new Date(Date.now() - daysOld * 86400000).toISOString().split('T')[0];
      const expiryDate = new Date(Date.now() + daysRemaining * 86400000).toISOString().split('T')[0];

      let urgencyLevel: 'critical' | 'urgent' | 'warning' | 'optimal' = 'optimal';
      let suggestedAction = 'Standard cold chain storage';

      if (daysRemaining <= 2) {
        urgencyLevel = 'critical';
        suggestedAction = 'Immediate dispatch to School Feeding Program or flash sale at Dairy Box';
      } else if (daysRemaining <= 5) {
        urgencyLevel = 'urgent';
        suggestedAction = 'FEFO Priority: Queue for immediate scheduled distribution';
      } else if (daysRemaining <= 9) {
        urgencyLevel = 'warning';
        suggestedAction = 'Monitor cold storage chiller temperature (< 4.0°C)';
      }

      return {
        id: `exp-fg-${fg.id}`,
        sourceType: 'cold_storage' as const,
        batchOrItemNumber: `${fg.sku}-LOT-${new Date().getFullYear()}${String(idx + 1).padStart(2, '0')}`,
        name: fg.name,
        quantity: fg.currentStock,
        unit: fg.unit,
        manufactureDate: mfgDate,
        expiryDate: expiryDate,
        daysRemaining: daysRemaining,
        urgencyLevel: urgencyLevel,
        location: fg.location,
        suggestedAction: suggestedAction
      };
    }),
    // Active WIP batches entering cold chain soon
    ...wipBatches.filter(b => b.status !== 'completed' && b.status !== 'cancelled').map(batch => {
      const relatedFg = finishedGoods.find(f => f.id === batch.productId);
      const shelfLife = relatedFg?.shelfLifeDays || 14;
      const todayStr = new Date().toISOString().split('T')[0];
      const expiryStr = new Date(Date.now() + shelfLife * 86400000).toISOString().split('T')[0];

      return {
        id: `exp-wip-${batch.id}`,
        sourceType: 'wip_batch' as const,
        batchOrItemNumber: batch.batchNumber,
        name: batch.productName,
        quantity: batch.targetQuantity,
        unit: relatedFg?.unit || 'units',
        manufactureDate: todayStr,
        expiryDate: expiryStr,
        daysRemaining: shelfLife,
        urgencyLevel: 'optimal' as const,
        location: `Production Tank (${batch.status})`,
        suggestedAction: 'Complete pasteurization & bottling to stabilize shelf life'
      };
    })
  ].sort((a, b) => a.daysRemaining - b.daysRemaining);

  // Create WIP Batch with BOM ingredient validation and deduction
  const createWipBatch = (batchData: {
    productId: string;
    productName: string;
    targetQuantity: number;
    rawMilkVolumeUsed: number;
    assignedStaff: string;
    notes?: string;
    ingredientSelections?: Record<string, string | null>;
  }) => {
    if (!authorizeDirectorMutation('create a production batch')) {
      return { success: false, message: 'Director authorization was canceled or failed.' };
    }
    const product = finishedGoods.find(p => p.id === batchData.productId);
    if (!product) {
      return { success: false, message: 'Target finished product not found.' };
    }
    if (product.recipe.length === 0) {
      return {
        success: false,
        message: `No production recipe is configured for ${product.name}. Add its ingredients in Finished Goods before starting a WIP batch.`
      };
    }

    const multiplier = batchData.targetQuantity / (product.batchUnitQuantity || 100);
    const requiredIngredients: Array<BomIngredientRequirement & {
      recipeQuantityNeeded: number;
      totalNeeded: number;
      inventoryUnit: string;
    }> = [];
    for (const recipeLine of product.recipe) {
      const selectedIngredientId = batchData.ingredientSelections &&
        Object.prototype.hasOwnProperty.call(batchData.ingredientSelections, recipeLine.ingredientId)
        ? batchData.ingredientSelections[recipeLine.ingredientId]
        : recipeLine.optional ? null : recipeLine.ingredientId;
      if (!selectedIngredientId) {
        if (recipeLine.optional) continue;
        return {
          success: false,
          message: `Choose a raw ingredient for required recipe item ${recipeLine.ingredientName}.`
        };
      }

      const substitute = selectedIngredientId === recipeLine.ingredientId
        ? undefined
        : recipeLine.substitutes?.find(item => item.ingredientId === selectedIngredientId);
      if (selectedIngredientId !== recipeLine.ingredientId && !substitute) {
        return {
          success: false,
          message: `${selectedIngredientId} is not an approved substitute for ${recipeLine.ingredientName}.`
        };
      }
      const selectedRecipeLine = substitute
        ? {
            ...recipeLine,
            ingredientId: substitute.ingredientId,
            ingredientName: substitute.ingredientName,
            recipeUnitsPerInventoryUnit: substitute.recipeUnitsPerInventoryUnit,
          }
        : recipeLine;
      const ing = ingredients.find(item => item.id === selectedRecipeLine.ingredientId);
      const recipeQuantityNeeded = (recipeLine.quantityRequiredMax ?? recipeLine.quantityRequired) * multiplier;
      const totalNeeded = ing
        ? convertRecipeQuantityToInventory(
            recipeQuantityNeeded,
            ing.unit,
            selectedRecipeLine.unit,
            selectedRecipeLine.recipeUnitsPerInventoryUnit
          )
        : null;
      if (!ing || totalNeeded === null) {
        return {
          success: false,
          message: `The recipe unit for ${selectedRecipeLine.ingredientName} is incompatible with its inventory unit. Update its conversion ratio before starting production.`
        };
      }
      requiredIngredients.push({
        ...selectedRecipeLine,
        recipeQuantityNeeded,
        totalNeeded,
        inventoryUnit: ing.unit,
      });
    }
    if (requiredIngredients.length === 0) {
      return {
        success: false,
        message: 'Select at least one BOM ingredient to include in the production batch.'
      };
    }

    const totalsByIngredient = new Map<string, number>();
    for (const requirement of requiredIngredients) {
      totalsByIngredient.set(
        requirement.ingredientId,
        (totalsByIngredient.get(requirement.ingredientId) || 0) + requirement.totalNeeded
      );
    }

    for (const [ingredientId, totalNeeded] of totalsByIngredient) {
      const ingredient = ingredients.find(item => item.id === ingredientId);
      if (!ingredient || ingredient.currentStock < totalNeeded) {
        return {
          success: false,
          message: `Insufficient ingredient: ${ingredient?.name || ingredientId}. Needed ${totalNeeded.toFixed(2)} ${ingredient?.unit || 'units'}, but only ${ingredient?.currentStock ?? 0} ${ingredient?.unit || 'units'} available. Production halted to prevent incomplete batches!`
        };
      }
    }

    // Deduct ingredients from inventory
    const newTxs: StockTransaction[] = [];
    const batchRefId = `BATCH-${Date.now()}`;
    const updatedIngredients = ingredients.map(ing => {
      const totalNeeded = totalsByIngredient.get(ing.id);
      if (totalNeeded !== undefined) {
        const newStock = Math.max(0, ing.currentStock - totalNeeded);
        
        newTxs.push({
          id: `tx-wip-${Date.now()}-${Math.random().toString(36).substring(2, 9)}-${ing.id}`,
          timestamp: new Date().toISOString(),
          itemId: ing.id,
          itemName: ing.name,
          itemType: 'ingredient',
          action: 'wip_deduct',
          quantity: totalNeeded,
          unit: ing.unit,
          previousStock: ing.currentStock,
          newStock: newStock,
          referenceId: batchRefId,
          performedBy: currentUser.name,
          notes: `Deducted for production of ${batchData.targetQuantity} ${product.unit} ${batchData.productName}`
        });

        return {
          ...ing,
          currentStock: newStock
        };
      }
      return ing;
    });

    setIngredients(updatedIngredients);
    if (newTxs.length > 0) {
      setTransactions(t => [...newTxs, ...t]);
    }

    // Create new WIP batch
    const batchNumber = `BATCH-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`;
    const newBatch: WipBatch = {
      id: `wip-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
      batchNumber,
      productId: batchData.productId,
      productName: batchData.productName,
      targetQuantity: batchData.targetQuantity,
      rawMilkVolumeUsed: batchData.rawMilkVolumeUsed,
      ingredientsUsed: [...totalsByIngredient].map(([ingredientId, quantity]) => {
        const ingredient = ingredients.find(item => item.id === ingredientId)!;
        return {
          ingredientId,
          ingredientName: ingredient.name,
          quantity,
          unit: ingredient.unit,
        };
      }),
      status: 'scheduled',
      assignedStaff: batchData.assignedStaff,
      startDate: new Date().toLocaleString() + ' PST',
      estimatedCompletion: new Date(Date.now() + 4 * 3600 * 1000).toLocaleString() + ' PST',
      notes: batchData.notes || 'Batch initialized successfully.',
      coldStorageTemp: '3.8°C'
    };

    setWipBatches(prev => [newBatch, ...prev]);
    logAuditAction({
      category: 'production',
      subsystem: 'WIP Production',
      action: 'BATCH_CREATED',
      description: `Scheduled new production batch #${batchNumber} for ${batchData.targetQuantity} ${product.unit} ${batchData.productName}`,
      details: {
        itemOrBatch: batchNumber,
        newValue: 'scheduled',
        quantity: batchData.targetQuantity,
        unit: product.unit,
        referenceId: batchNumber,
        reason: `BOM deduction: ${batchData.rawMilkVolumeUsed} L raw carabao milk + ${requiredIngredients.length} ingredients`
      },
      severity: 'info'
    });
    triggerManualCloudSync();

    return {
      success: true,
      message: `Batch ${batchNumber} created! Automated BOM deduction completed for ${requiredIngredients.length} ingredients.`
    };
  };

  // Advance WIP step
  const advanceWipBatchStep = (batchId: string, nextStep: WipStep) => {
    const targetBatch = wipBatches.find(b => b.id === batchId);
    if (!targetBatch) return;
    if (!authorizeDirectorMutation('advance a production batch')) return;

    if (nextStep === 'completed' && targetBatch.status !== 'completed') {
      const fgItem = finishedGoods.find(f => f.id === targetBatch.productId);
      if (fgItem) {
        const updatedStock = fgItem.currentStock + targetBatch.targetQuantity;
        const compTx: StockTransaction = {
          id: `tx-comp-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
          timestamp: new Date().toLocaleString() + ' PST',
          itemId: fgItem.id,
          itemName: fgItem.name,
          itemType: 'finished_good',
          action: 'wip_complete',
          quantity: targetBatch.targetQuantity,
          unit: fgItem.unit,
          previousStock: fgItem.currentStock,
          newStock: updatedStock,
          referenceId: targetBatch.batchNumber,
          performedBy: currentUser.name,
          notes: `Production completed for ${targetBatch.batchNumber}`
        };
        setFinishedGoods(fgList => fgList.map(fg => fg.id === fgItem.id ? { ...fg, currentStock: updatedStock } : fg));
        setTransactions(t => [compTx, ...t]);
      }
    }

    setWipBatches(prev => prev.map(batch => {
      if (batch.id === batchId) {
        return {
          ...batch,
          status: nextStep,
          completedAt: nextStep === 'completed' ? new Date().toLocaleString() + ' PST' : batch.completedAt
        };
      }
      return batch;
    }));

    logAuditAction({
      category: 'production',
      subsystem: 'WIP Production',
      action: nextStep === 'completed' ? 'BATCH_COMPLETED' : 'BATCH_STEP_ADVANCED',
      description: nextStep === 'completed'
        ? `Batch #${targetBatch.batchNumber} marked complete: ${targetBatch.targetQuantity} units transferred to Cold Storage`
        : `Advanced Batch #${targetBatch.batchNumber} from "${targetBatch.status}" to "${nextStep}"`,
      details: {
        itemOrBatch: targetBatch.batchNumber,
        previousValue: targetBatch.status,
        newValue: nextStep,
        quantity: targetBatch.targetQuantity,
        referenceId: targetBatch.batchNumber
      },
      severity: nextStep === 'completed' ? 'success' : 'info'
    });

    triggerManualCloudSync();
  };

  const saveWipProductionRecord = (record: WipProductionRecord) => {
    if (currentRole !== 'developer' && currentRole !== 'plant_manager') {
      return { success: false, message: 'Only the Plant Manager or Developer can update WIP Inventory records.' };
    }
    if (record.id !== record.batchId || !wipBatches.some(batch => batch.id === record.batchId)) {
      return { success: false, message: 'Select an existing WIP production batch before saving its inventory record.' };
    }
    if (!Array.isArray(record.yieldPackages) || record.yieldPackages.length === 0 || record.yieldPackages.some(pack =>
      !Number.isFinite(pack.quantity) || pack.quantity <= 0 || !pack.packSize.trim()
    )) {
      return { success: false, message: 'Each yield package needs a positive quantity and a pack size.' };
    }
    const measuredValues = [
      record.pasteurizationTempC,
      record.pasteurizationTimeMinutes,
      record.coolingTempC,
      record.coolingTimeMinutes,
    ];
    if (measuredValues.some(value => value !== undefined && (!Number.isFinite(value) || value < 0))) {
      return { success: false, message: 'Temperature and duration values must be valid non-negative numbers.' };
    }

    setWipProductionRecords(previous => [
      record,
      ...previous.filter(existing => existing.batchId !== record.batchId),
    ]);
    const batch = wipBatches.find(item => item.id === record.batchId);
    logAuditAction({
      category: 'production',
      subsystem: 'WIP Inventory',
      action: 'WIP_PRODUCTION_RECORD_SAVED',
      description: `Saved WIP inventory production record for batch ${batch?.batchNumber || record.batchId}.`,
      details: {
        itemOrBatch: batch?.batchNumber || record.batchId,
        referenceId: record.batchId,
        quantity: record.yieldPackages.reduce((total, pack) => total + pack.quantity, 0),
        unit: 'packs',
        reason: 'Production temperatures, yield, best-before date, and remarks recorded',
      },
      severity: 'success',
    });
    triggerManualCloudSync();
    return { success: true, message: `WIP Inventory record saved for batch ${batch?.batchNumber || record.batchId}.` };
  };

  // Cancel Scheduled WIP Batch without affecting raw materials (restores ingredients)
  const cancelWipBatch = (batchId: string, reason?: string): { success: boolean; message: string } => {
    if (!authorizeDirectorMutation('cancel a production batch')) {
      return { success: false, message: 'Director authorization was canceled or failed.' };
    }
    const targetBatch = wipBatches.find(b => b.id === batchId);
    if (!targetBatch) {
      return { success: false, message: 'Batch record not found.' };
    }

    if (targetBatch.status !== 'scheduled') {
      return {
        success: false,
        message: `Batch cannot be cancelled from status "${targetBatch.status}". Only batches in "1. Scheduled Batch" can be cancelled with raw material safeguards.`
      };
    }

    // Restore raw ingredients back to inventory
    const newTxs: StockTransaction[] = [];
    const updatedIngredients = ingredients.map(ing => {
      const usedItem = targetBatch.ingredientsUsed.find(u => u.ingredientId === ing.id);
      if (usedItem) {
        const restoredStock = ing.currentStock + usedItem.quantity;
        newTxs.push({
          id: `tx-cancel-${Date.now()}-${Math.random().toString(36).substring(2, 9)}-${ing.id}`,
          timestamp: new Date().toISOString(),
          itemId: ing.id,
          itemName: ing.name,
          itemType: 'ingredient',
          action: 'wip_restore',
          quantity: usedItem.quantity,
          unit: ing.unit,
          previousStock: ing.currentStock,
          newStock: restoredStock,
          referenceId: targetBatch.batchNumber,
          performedBy: currentUser.name,
          notes: `Batch Cancellation Inventory Rollback: Restored raw material for scheduled ${targetBatch.batchNumber} (${reason || 'Cancelled before pasteurization'})`
        });

        return {
          ...ing,
          currentStock: restoredStock
        };
      }
      return ing;
    });

    setIngredients(updatedIngredients);
    if (newTxs.length > 0) {
      setTransactions(t => [...newTxs, ...t]);
    }

    // Update batch to cancelled status
    setWipBatches(prev => prev.map(batch => {
      if (batch.id === batchId) {
        return {
          ...batch,
          status: 'cancelled',
          cancellationReason: reason || 'Scheduled batch cancelled by operator prior to processing',
          cancelledAt: new Date().toLocaleString() + ' PST'
        };
      }
      return batch;
    }));

    logAuditAction({
      category: 'production',
      subsystem: 'WIP Production',
      action: 'BATCH_CANCELLED',
      description: `Cancelled scheduled Batch #${targetBatch.batchNumber}. Restored all ${targetBatch.ingredientsUsed.length} BOM recipe materials.`,
      details: {
        itemOrBatch: targetBatch.batchNumber,
        previousValue: 'scheduled',
        newValue: 'cancelled',
        referenceId: targetBatch.batchNumber,
        reason: reason || 'Batch cancelled before pasteurization'
      },
      severity: 'warning'
    });

    triggerManualCloudSync();

    return {
      success: true,
      message: `Batch ${targetBatch.batchNumber} has been cancelled. All ${targetBatch.ingredientsUsed.length} recipe ingredients and raw milk volumes have been restored to warehouse inventory without depletion.`
    };
  };

  // Process POS Sale at Dairy Box Outlet
  const processRetailSale = (items: { productId: string; quantity: number }[]) => {
    if (!authorizeDirectorMutation('process a retail sale')) {
      return { success: false, message: 'Director authorization was canceled or failed.' };
    }
    for (const item of items) {
      const fg = finishedGoods.find(p => p.id === item.productId);
      if (!fg || fg.currentStock < item.quantity) {
        return {
          success: false,
          message: `Stock deficit for ${fg ? fg.name : 'item'}. Only ${fg ? fg.currentStock : 0} available.`
        };
      }
    }

    const newTxs: StockTransaction[] = [];
    const receiptRef = `POS-REC-${Math.floor(1000 + Math.random() * 9000)}`;

    setFinishedGoods(prev => prev.map(fg => {
      const soldItem = items.find(i => i.productId === fg.id);
      if (soldItem) {
        const newStock = fg.currentStock - soldItem.quantity;
        newTxs.push({
          id: `tx-pos-${Date.now()}-${Math.random().toString(36).substring(2, 9)}-${fg.id}`,
          timestamp: new Date().toLocaleString() + ' PST',
          itemId: fg.id,
          itemName: fg.name,
          itemType: 'finished_good',
          action: 'out_sale',
          quantity: soldItem.quantity,
          unit: fg.unit,
          previousStock: fg.currentStock,
          newStock: newStock,
          referenceId: receiptRef,
          unitPrice: fg.unitPrice,
          performedBy: currentUser.name,
          notes: 'MMSU Dairy Box Retail Sale'
        });

        return {
          ...fg,
          currentStock: newStock,
          allocatedRetail: Math.max(0, fg.allocatedRetail - soldItem.quantity)
        };
      }
      return fg;
    }));

    if (newTxs.length > 0) {
      setTransactions(t => [...newTxs, ...t]);
    }

    const totalItemsCount = items.reduce((sum, it) => sum + it.quantity, 0);
    logAuditAction({
      category: 'sales',
      subsystem: 'Dairy Box POS',
      action: 'RETAIL_SALE_COMPLETED',
      description: `Completed POS Sale #${receiptRef} for ${totalItemsCount} units across ${items.length} line items`,
      details: {
        referenceId: receiptRef,
        quantity: totalItemsCount,
        reason: 'Customer retail purchase at MMSU Dairy Box Outlet'
      },
      terminalOrStation: 'Dairy Box POS Register #1',
      severity: 'success'
    });

    triggerManualCloudSync();
    return { success: true, message: 'Dairy Box retail transaction processed.' };
  };

  const createStockRequest = (request: {
    finishedGoodId: string;
    quantity: number;
    neededBy?: string;
    notes?: string;
  }): { success: boolean; message: string } => {
    if (currentRole !== 'store_outlet' || (!isDeveloperActive && authenticatedRole !== 'store_outlet')) {
      return { success: false, message: 'Only Store Outlet staff can submit a finished goods request.' };
    }
    const product = finishedGoods.find(item => item.id === request.finishedGoodId);
    if (!product) return { success: false, message: 'Select a finished good from the current product list.' };
    if (!Number.isInteger(request.quantity) || request.quantity < 1) {
      return { success: false, message: 'Enter a whole-number quantity greater than zero.' };
    }
    if (request.neededBy && (!Number.isFinite(Date.parse(request.neededBy)) || request.neededBy < new Date().toISOString().slice(0, 10))) {
      return { success: false, message: 'The needed-by date must be today or later.' };
    }

    const newRequest: StockRequest = {
      id: `stock-request-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      finishedGoodId: product.id,
      finishedGoodName: product.name,
      finishedGoodSku: product.sku,
      quantity: request.quantity,
      unit: product.unit,
      requestedByEmail: auth.currentUser?.email || currentUser.email,
      requestedByName: currentUser.name,
      requestedAt: new Date().toISOString(),
      neededBy: request.neededBy || undefined,
      status: 'pending',
      notes: request.notes?.trim() || undefined,
    };
    setStockRequests(previous => [newRequest, ...previous]);
    setAlerts(previous => {
      const requestAlerts: SystemAlert[] = [
        {
          id: `${newRequest.id}-requested`,
          timestamp: newRequest.requestedAt,
          type: 'stock_request',
          title: 'New Dairy Box Stock Request',
          message: `${newRequest.requestedByName} requested ${newRequest.quantity} ${newRequest.unit} of ${product.name}.`,
          severity: 'info',
          read: false,
          targetRole: ['plant_manager'],
        },
        {
          id: `${newRequest.id}-submitted`,
          timestamp: newRequest.requestedAt,
          type: 'stock_request',
          title: 'Stock Request Submitted',
          message: `Your request for ${newRequest.quantity} ${newRequest.unit} of ${product.name} was sent to the Plant Manager.`,
          severity: 'info',
          read: false,
          targetRole: ['store_outlet'],
        },
      ];
      const knownIds = new Set(previous.map(alert => alert.id));
      return [...requestAlerts.filter(alert => !knownIds.has(alert.id)), ...previous];
    });
    logAuditAction({
      category: 'cold_storage',
      subsystem: 'Dairy Box Stock Requests',
      action: 'FINISHED_GOODS_REQUESTED',
      description: `${currentUser.name} requested ${newRequest.quantity} ${newRequest.unit} of ${product.name}`,
      details: {
        itemOrBatch: product.name,
        quantity: newRequest.quantity,
        unit: newRequest.unit,
        referenceId: newRequest.id,
        reason: newRequest.notes || 'Store Outlet replenishment request',
      },
      severity: 'info',
    });
    triggerManualCloudSync();
    return { success: true, message: 'Finished goods request submitted to the Plant Manager.' };
  };

  const reviewStockRequest = (
    id: string,
    status: 'approved' | 'rejected' | 'fulfilled',
    responseNotes?: string,
    allocationQuantity?: number
  ): { success: boolean; message: string } => {
    if (!['plant_manager', 'developer'].includes(currentRole)) {
      return { success: false, message: 'Only the Plant Manager can review and fulfill stock requests.' };
    }
    const target = stockRequests.find(requestItem => requestItem.id === id);
    if (!target) return { success: false, message: 'This stock request is no longer available.' };
    let updatedStatus = status;
    let allocatedQuantity = target.fulfilledQuantity ?? 0;
    let quantityToAllocate = 0;
    if (status === 'approved' || status === 'rejected') {
      if (target.status !== 'pending') {
        return { success: false, message: 'Only pending requests can be approved or rejected.' };
      }
      if (status === 'approved') {
        const product = finishedGoods.find(item => item.id === target.finishedGoodId);
        if (product) {
          const availableForRetail = Math.max(
            0,
            product.currentStock - product.allocatedRetail - product.allocatedFeedingProgram
          );
          quantityToAllocate = Math.min(availableForRetail, target.quantity - allocatedQuantity);
          allocatedQuantity += quantityToAllocate;
          if (allocatedQuantity >= target.quantity) updatedStatus = 'fulfilled';
          if (quantityToAllocate > 0) {
            setFinishedGoods(previous => previous.map(item => item.id === product.id
              ? { ...item, allocatedRetail: item.allocatedRetail + quantityToAllocate }
              : item
            ));
          }
        }
      }
    } else {
      if (target.status !== 'approved') {
        return { success: false, message: 'Approve the request before marking it fulfilled.' };
      }
      const product = finishedGoods.find(item => item.id === target.finishedGoodId);
      if (!product) return { success: false, message: 'The requested finished good is no longer in the catalog.' };
      const availableForRetail = Math.max(
        0,
        product.currentStock - product.allocatedRetail - product.allocatedFeedingProgram
      );
      const remainingQuantity = target.quantity - allocatedQuantity;
      quantityToAllocate = allocationQuantity ?? remainingQuantity;
      if (!Number.isInteger(quantityToAllocate) || quantityToAllocate < 1) {
        return { success: false, message: 'Enter a whole-number quantity greater than zero to allocate.' };
      }
      if (quantityToAllocate > remainingQuantity) {
        return {
          success: false,
          message: `Only ${remainingQuantity} ${product.unit} remains on this request.`,
        };
      }
      if (availableForRetail < quantityToAllocate) {
        return {
          success: false,
          message: `Only ${availableForRetail} ${product.unit} of unallocated stock is available for this allocation.`,
        };
      }
      allocatedQuantity += quantityToAllocate;
      if (allocatedQuantity < target.quantity) updatedStatus = 'approved';
      setFinishedGoods(previous => previous.map(item => item.id === product.id
        ? { ...item, allocatedRetail: item.allocatedRetail + quantityToAllocate }
        : item
      ));
    }

    const now = new Date().toISOString();
    const updatedRequest: StockRequest = {
      ...target,
      status: updatedStatus,
      reviewedBy: currentUser.email,
      reviewedAt: now,
      responseNotes: responseNotes?.trim() || undefined,
      fulfilledAt: updatedStatus === 'fulfilled' ? now : undefined,
      fulfilledQuantity: status === 'fulfilled' || quantityToAllocate > 0
        ? allocatedQuantity
        : target.fulfilledQuantity,
    };
    setStockRequests(previous => previous.map(item => item.id === id ? updatedRequest : item));
    const notificationStatus = updatedStatus === 'fulfilled'
      ? 'fulfilled'
      : quantityToAllocate > 0
        ? 'partially_fulfilled'
        : status;
    const responseMessage = status === 'fulfilled'
      ? updatedStatus === 'fulfilled'
        ? `Your request for ${target.quantity} ${target.unit} of ${target.finishedGoodName} was fulfilled.`
        : `${quantityToAllocate} of ${target.quantity} ${target.unit} of ${target.finishedGoodName} was allocated; ${target.quantity - allocatedQuantity} remains approved.`
      : status === 'approved' && quantityToAllocate > 0
        ? updatedStatus === 'fulfilled'
          ? `Your request for ${target.quantity} ${target.unit} of ${target.finishedGoodName} was approved and automatically fulfilled.`
          : `${quantityToAllocate} of ${target.quantity} ${target.unit} of ${target.finishedGoodName} was automatically allocated; the remaining ${target.quantity - allocatedQuantity} stays approved.`
      : `Your request for ${target.quantity} ${target.unit} of ${target.finishedGoodName} was ${status}${responseNotes?.trim() ? `: ${responseNotes.trim()}` : '.'}`;
    setAlerts(previous => previous.some(alert => alert.id === `${target.id}-${notificationStatus}`)
      ? previous
      : [{
          id: `${target.id}-${notificationStatus}`,
          timestamp: now,
          type: 'stock_request',
          title: `Dairy Box Stock Request ${updatedStatus === 'fulfilled' ? 'fulfilled' : notificationStatus === 'partially_fulfilled' ? 'partially fulfilled' : status}`,
          message: responseMessage,
          severity: status === 'rejected' ? 'warning' : 'info',
          read: false,
          targetRole: ['store_outlet'],
        }, ...previous]
    );
    if (status === 'fulfilled' || (status === 'approved' && quantityToAllocate > 0)) {
      logAuditAction({
        category: 'cold_storage',
        subsystem: 'Dairy Box Stock Requests',
        action: status === 'approved'
          ? updatedStatus === 'fulfilled'
            ? 'FINISHED_GOODS_REQUEST_AUTO_FULFILLED'
            : 'FINISHED_GOODS_REQUEST_AUTO_PARTIALLY_FULFILLED'
          : updatedStatus === 'fulfilled'
            ? 'FINISHED_GOODS_REQUEST_FULFILLED'
            : 'FINISHED_GOODS_REQUEST_PARTIALLY_FULFILLED',
        description: `${status === 'approved' ? 'Automatically a' : 'A'}llocated ${quantityToAllocate} ${target.unit} of ${target.finishedGoodName} to Dairy Box${updatedStatus === 'fulfilled' ? '' : `; ${target.quantity - allocatedQuantity} remains`}`,
        details: {
          itemOrBatch: target.finishedGoodName,
          quantity: quantityToAllocate,
          unit: target.unit,
          referenceId: target.id,
          reason: status === 'approved'
            ? 'Automatic allocation of available finished-goods stock on approval'
            : responseNotes?.trim() || (updatedStatus === 'fulfilled' ? 'Store Outlet stock request fulfilled' : 'Partial Store Outlet stock request allocation'),
        },
        severity: updatedStatus === 'fulfilled' ? 'success' : 'info',
      });
    } else {
      logAuditAction({
        category: 'cold_storage',
        subsystem: 'Dairy Box Stock Requests',
        action: status === 'approved' ? 'FINISHED_GOODS_REQUEST_APPROVED' : 'FINISHED_GOODS_REQUEST_REJECTED',
        description: `${status === 'approved' ? 'Approved' : 'Rejected'} Dairy Box request for ${target.quantity} ${target.unit} of ${target.finishedGoodName}`,
        details: {
          itemOrBatch: target.finishedGoodName,
          quantity: target.quantity,
          unit: target.unit,
          referenceId: target.id,
          reason: responseNotes?.trim() || `Request ${status}`,
        },
        severity: status === 'rejected' ? 'warning' : 'info',
      });
    }
    triggerManualCloudSync();
    return {
      success: true,
      message: status === 'fulfilled'
        ? updatedStatus === 'fulfilled'
          ? 'Stock allocated and request marked fulfilled.'
          : `${quantityToAllocate} ${target.unit} allocated; ${target.quantity - allocatedQuantity} ${target.unit} remains approved.`
        : status === 'approved' && quantityToAllocate > 0
          ? updatedStatus === 'fulfilled'
            ? 'Request approved and automatically fulfilled from available stock.'
            : `${quantityToAllocate} ${target.unit} automatically allocated; ${target.quantity - allocatedQuantity} ${target.unit} remains approved.`
        : `Request ${status}.`,
    };
  };

  const cancelStockRequest = (id: string): { success: boolean; message: string } => {
    if (currentRole !== 'store_outlet' || (!isDeveloperActive && authenticatedRole !== 'store_outlet')) {
      return { success: false, message: 'Only Store Outlet staff can cancel their pending requests.' };
    }
    const target = stockRequests.find(requestItem =>
      requestItem.id === id &&
      (
        requestItem.requestedByEmail.toLowerCase() === currentUser.email.toLowerCase() ||
        (isDeveloperActive && requestItem.requestedByName === currentUser.name)
      )
    );
    if (!target || target.status !== 'pending') {
      return { success: false, message: 'Only your pending stock requests can be cancelled.' };
    }
    setStockRequests(previous => previous.map(item => item.id === id
      ? { ...item, status: 'cancelled' }
      : item
    ));
    setAlerts(previous => previous.some(alert => alert.id === `${target.id}-cancelled`)
      ? previous
      : [{
          id: `${target.id}-cancelled`,
          timestamp: new Date().toISOString(),
          type: 'stock_request',
          title: 'Dairy Box Stock Request Cancelled',
          message: `${target.requestedByName} cancelled the request for ${target.quantity} ${target.unit} of ${target.finishedGoodName}.`,
          severity: 'warning',
          read: false,
          targetRole: ['plant_manager'],
        }, ...previous]
    );
    logAuditAction({
      category: 'cold_storage',
      subsystem: 'Dairy Box Stock Requests',
      action: 'FINISHED_GOODS_REQUEST_CANCELLED',
      description: `${currentUser.name} cancelled the request for ${target.finishedGoodName}`,
      details: { itemOrBatch: target.finishedGoodName, referenceId: target.id },
      severity: 'warning',
    });
    triggerManualCloudSync();
    return { success: true, message: 'Stock request cancelled.' };
  };

  const addCommitment = (comData: Omit<SupplyDemandCommitment, 'id'>) => {
    if (!authorizeDirectorMutation('add a supply or production commitment')) return;
    const newCom: SupplyDemandCommitment = {
      ...comData,
      id: `com-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`
    };
    setCommitments(prev => [newCom, ...prev]);
    logAuditAction({
      category: 'commitments',
      subsystem: 'Supply & Demand',
      action: 'COMMITMENT_SCHEDULED',
      description: `Registered delivery commitment #${newCom.id}: ${newCom.targetQuantity} ${newCom.unit} ${newCom.itemOrMilk} for ${newCom.partnerName}`,
      details: {
        itemOrBatch: newCom.partnerName,
        quantity: newCom.targetQuantity,
        unit: newCom.unit,
        referenceId: newCom.id,
        reason: `Target scheduled date: ${newCom.scheduledDate}`
      },
      severity: 'info'
    });
    triggerManualCloudSync();
  };

  const updateCommitmentStatus = (id: string, status: SupplyDemandCommitment['status'], fulfilledQty?: number) => {
    if (!authorizeDirectorMutation('update a commitment')) return;
    const com = commitments.find(c => c.id === id);
    setCommitments(prev => prev.map(c => {
      if (c.id === id) {
        return {
          ...c,
          status,
          fulfilledQuantity: fulfilledQty !== undefined ? fulfilledQty : c.fulfilledQuantity
        };
      }
      return c;
    }));

    if (com) {
      logAuditAction({
        category: 'commitments',
        subsystem: 'Supply & Demand',
        action: 'COMMITMENT_STATUS_CHANGED',
        description: `Updated status of commitment for ${com.partnerName} to "${status}" (Fulfilled: ${fulfilledQty ?? com.fulfilledQuantity}/${com.targetQuantity} ${com.unit})`,
        details: {
          itemOrBatch: com.partnerName,
          previousValue: com.status,
          newValue: status,
          quantity: fulfilledQty ?? com.fulfilledQuantity,
          unit: com.unit,
          referenceId: com.id
        },
        severity: status === 'fulfilled' ? 'success' : 'info'
      });
    }

    triggerManualCloudSync();
  };

  const cancelCommitment = (id: string, reason: string) => {
    if (!authorizeDirectorMutation('cancel a commitment')) return;
    const com = commitments.find(c => c.id === id);
    setCommitments(prev => prev.map(c => {
      if (c.id === id) {
        return {
          ...c,
          status: 'cancelled',
          cancellationReason: reason,
          cancelledAt: new Date().toLocaleString() + ' PST'
        };
      }
      return c;
    }));

    if (com) {
      logAuditAction({
        category: 'commitments',
        subsystem: 'Supply & Demand',
        action: 'COMMITMENT_CANCELLED',
        description: `Cancelled delivery commitment for ${com.partnerName} (${com.targetQuantity} ${com.unit}). Reason: ${reason}`,
        details: {
          itemOrBatch: com.partnerName,
          previousValue: com.status,
          newValue: 'cancelled',
          referenceId: com.id,
          reason: reason
        },
        severity: 'warning'
      });
    }

    triggerManualCloudSync();
  };

  const updateCommitmentPriority = (id: string, priority: 'high' | 'medium' | 'low') => {
    if (!authorizeDirectorMutation('change commitment priority')) return;
    setCommitments(prev => prev.map(c => c.id === id ? { ...c, priority } : c));
    triggerManualCloudSync();
  };

  const markAlertRead = (id: string) => {
    setAlerts(prev => prev.map(a => a.id === id ? { ...a, read: true } : a));
  };

  const clearAllAlerts = () => {
    setAlerts([]);
  };

  const submitIsoEvaluation = (ratingData: Omit<IsoEvaluationRating, 'id' | 'date' | 'evaluatorRole'>) => {
    if (!authorizeDirectorMutation('submit an ISO 25010 evaluation')) return;
    const newRating: IsoEvaluationRating = {
      ...ratingData,
      id: `iso-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
      date: new Date().toLocaleDateString(),
      evaluatorRole: currentRole
    };
    setIsoRatings(prev => [newRating, ...prev]);
  };

  const authorizeDirectorMutation = (action: string): boolean => {
    if (currentRole !== 'director' || isDeveloperActive) return true;
    if (DIRECTOR_READ_ONLY_ACTIONS.has(action)) {
      window.alert('Director / PMO access to Raw Ingredients, WIP Batches, and Cold Storage is read-only.');
      return false;
    }

    const lastSignInTime = auth.currentUser?.metadata.lastSignInTime;
    const recentlyAuthenticated = lastSignInTime && Date.now() - new Date(lastSignInTime).getTime() < 10 * 60 * 1000;
    if (recentlyAuthenticated) return true;

    window.alert(`Please sign out and sign in again before you ${action}.`);
    return false;
  };

  const addUserProfile = (profile: Omit<UserProfile, 'id'>): { success: boolean; message: string } => {
    if (currentRole !== 'developer' || authenticatedRole !== 'developer') {
      return { success: false, message: 'Only an authenticated Lead Developer can add account profiles.' };
    }

    const cleanEmail = profile.email.trim().toLowerCase();
    const cleanUsername = profile.username.trim();
    const cleanName = profile.name.trim();
    if (!cleanName || !cleanUsername || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
      return { success: false, message: 'Enter a name, username, and valid account email.' };
    }
    if (!isUserRole(profile.role)) {
      return { success: false, message: 'Select a supported DairySync role.' };
    }
    if (users.some(user => user.email.toLowerCase() === cleanEmail)) {
      return { success: false, message: `A profile for ${cleanEmail} already exists.` };
    }
    if (users.some(user => user.username.toLowerCase() === cleanUsername.toLowerCase())) {
      return { success: false, message: `Username "${cleanUsername}" is already taken.` };
    }

    const newProfile: UserProfile = {
      ...profile,
      id: `usr-${crypto.randomUUID()}`,
      name: cleanName,
      email: cleanEmail,
      username: cleanUsername,
      title: profile.title.trim(),
      department: profile.department.trim(),
      avatar: profile.avatar.trim() || users[0]?.avatar || '',
      nickname: profile.nickname?.trim() || undefined,
    };
    setUsers(previous => [...previous, newProfile]);
    logAuditAction({
      category: 'security',
      subsystem: 'User Security',
      action: 'USER_PROFILE_ADDED',
      description: `Added account directory profile for ${cleanEmail} with role ${profile.role}.`,
      details: {
        itemOrBatch: newProfile.id,
        reason: 'Lead Developer added a staff account profile',
      },
      severity: 'info',
    });
    triggerManualCloudSync();
    return {
      success: true,
      message: `Profile for ${cleanName} added. The Firebase account and role claim must also be configured.`,
    };
  };

  const updateUserProfile = (userId: string, updates: Partial<UserProfile>): { success: boolean; message: string } => {
    if (currentRole === 'director' && !authorizeDirectorMutation('update your profile')) {
      return { success: false, message: 'Director authorization was canceled or failed.' };
    }
    // Only lead developer can modify other account users; standard users can only modify their own profile
    if (currentRole !== 'developer' && currentUser.id !== userId) {
      return { success: false, message: 'Unauthorized. Only the Lead Developer has access to manage other account users.' };
    }

    if (updates.email !== undefined) return { success: false, message: 'Account email is managed by Firebase Authentication.' };

    // Check if the new username conflicts with another user
    if (updates.username) {
      const cleanUsername = updates.username.trim().toLowerCase();
      const conflict = users.find(u => u.id !== userId && u.username.toLowerCase() === cleanUsername);
      if (conflict) {
        return { success: false, message: `Username "${updates.username}" is already taken.` };
      }
    }

    const existingProfile = users.find(user => user.id === userId);
    if (!existingProfile && (!firebaseUser || firebaseUser.uid !== userId)) {
      return { success: false, message: 'The profile could not be found. Reload and try again.' };
    }

    const baseProfile: UserProfile = existingProfile || {
      id: firebaseUser?.uid || userId,
      name: firebaseUser?.displayName || firebaseUser?.email || 'DairySync User',
      role: authenticatedRole || currentRole,
      title: '',
      department: '',
      avatar: '',
      email: firebaseUser?.email || '',
      username: firebaseUser?.email || '',
    };
    const updatedProfile: UserProfile = {
      ...baseProfile,
      ...updates,
      id: baseProfile.id,
      role: baseProfile.role,
      email: baseProfile.email,
      name: updates.name ? updates.name.trim() : baseProfile.name,
      username: updates.username ? updates.username.trim() : baseProfile.username,
      title: updates.title !== undefined ? updates.title.trim() : baseProfile.title,
      avatar: updates.avatar !== undefined ? updates.avatar.trim() : baseProfile.avatar,
      nickname: updates.nickname !== undefined ? updates.nickname.trim() : baseProfile.nickname,
    };
    setUsers(prev => existingProfile
      ? prev.map(user => user.id === userId ? updatedProfile : user)
      : [...prev, updatedProfile]
    );

    logAuditAction({
      category: 'security',
      subsystem: 'User Security',
      action: 'PROFILE_UPDATED',
      description: `Updated profile details for operator ${updates.name || userId}`,
      details: {
        itemOrBatch: userId,
        reason: 'Operator credential / personal data update'
      },
      severity: 'info'
    });

    triggerManualCloudSync();
    return { success: true, message: 'Profile updated successfully.' };
  };

  const canManageSystemAccounts = () =>
    isAuthenticated &&
    ((authenticatedRole === 'system_admin' && currentRole === 'system_admin') ||
      (authenticatedRole === 'developer' && currentRole === 'developer' && isDeveloperActive));

  const fetchManagedAccountsForAdmin = async (): Promise<ManagedAccount[]> => {
    if (!canManageSystemAccounts()) {
      throw new Error('Only an authenticated System Administrator or Lead Developer can view managed accounts.');
    }
    return fetchManagedAccountsFromAuth();
  };

  const createManagedUser = async (
    profile: Omit<UserProfile, 'id'>
  ): Promise<{ success: boolean; message: string }> => {
    if (!canManageSystemAccounts()) {
      return { success: false, message: 'Only an authenticated System Administrator or Lead Developer can create accounts.' };
    }
    const cleanEmail = profile.email.trim().toLowerCase();
    const cleanUsername = profile.username.trim();
    const cleanName = profile.name.trim();
    if (!cleanName || !cleanUsername || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
      return { success: false, message: 'Enter a name, username, and valid account email.' };
    }
    if (!isUserRole(profile.role)) {
      return { success: false, message: 'Select a supported DairySync role.' };
    }
    if (authenticatedRole === 'system_admin' && (profile.role === 'developer' || profile.role === 'system_admin')) {
      return { success: false, message: 'System administrators cannot create developer or system-administrator accounts.' };
    }
    const existingProfile = users.find(user => user.email.toLowerCase() === cleanEmail);
    if (!existingProfile && users.some(user => user.username.toLowerCase() === cleanUsername.toLowerCase())) {
      return { success: false, message: `Username "${cleanUsername}" is already taken.` };
    }
    if (existingProfile && users.some(user =>
      user.id !== existingProfile.id && user.username.toLowerCase() === cleanUsername.toLowerCase()
    )) {
      return { success: false, message: `Username "${cleanUsername}" is already taken.` };
    }

    try {
      const { uid } = await createManagedAccount({
        name: cleanName,
        email: cleanEmail,
        role: profile.role,
      });
      const newProfile: UserProfile = {
        ...profile,
        id: existingProfile?.id || uid,
        name: cleanName,
        email: cleanEmail,
        username: cleanUsername,
        title: profile.title.trim(),
        department: profile.department.trim(),
        avatar: profile.avatar.trim() || users[0]?.avatar || '',
        nickname: profile.nickname?.trim() || undefined,
      };

      try {
        await sqlConnectCollections.user_profile.save(newProfile);
      } catch (error) {
        setUsers(previous => existingProfile
          ? previous.map(user => user.id === existingProfile.id ? newProfile : user)
          : [...previous, newProfile]
        );
        const reason = error instanceof Error ? error.message : 'Unknown Data Connect error.';
        return {
          success: false,
          message: `The Firebase account was created, but its staff profile could not be saved: ${reason}. The profile is retained locally for cloud-sync retry; do not create the account again.`,
        };
      }

      setUsers(previous => existingProfile
        ? previous.map(user => user.id === existingProfile.id ? newProfile : user)
        : [...previous, newProfile]
      );
      logAuditAction({
        category: 'security',
        subsystem: 'User Security',
        action: 'USER_ACCOUNT_CREATED',
        description: `Created DairySync account for ${cleanEmail} with role ${profile.role}.`,
        details: { itemOrBatch: uid, reason: 'Administrative account provisioning' },
        severity: 'success',
      });

      try {
        await requestManagedAccountPasswordReset(cleanEmail);
      } catch (error) {
        const reason = error instanceof Error ? error.message : 'Unknown email delivery error.';
        return {
          success: true,
          message: `Account created, but the password setup email could not be sent: ${reason}. Use Send password reset to retry.`,
        };
      }
      return { success: true, message: `Account created and password setup email sent to ${cleanEmail}.` };
    } catch (error) {
      const reason = error instanceof Error ? error.message : 'Unknown account provisioning error.';
      return { success: false, message: reason };
    }
  };

  const updateManagedUserProfile = async (
    userId: string,
    updates: Pick<UserProfile, 'name' | 'username' | 'title' | 'department'>
  ): Promise<{ success: boolean; message: string }> => {
    if (!canManageSystemAccounts()) {
      return { success: false, message: 'Only an authenticated System Administrator or Lead Developer can edit staff profiles.' };
    }
    const existingProfile = users.find(user => user.id === userId);
    if (!existingProfile) return { success: false, message: 'The staff profile could not be found.' };
    const name = updates.name.trim();
    const username = updates.username.trim();
    if (!name || !username) return { success: false, message: 'Name and username are required.' };
    if (users.some(user =>
      user.id !== userId && user.username.toLowerCase() === username.toLowerCase()
    )) {
      return { success: false, message: `Username "${username}" is already taken.` };
    }

    const updatedProfile = {
      ...existingProfile,
      name,
      username,
      title: updates.title.trim(),
      department: updates.department.trim(),
    };
    try {
      await sqlConnectCollections.user_profile.save(updatedProfile);
    } catch (error) {
      const reason = error instanceof Error ? error.message : 'Unknown Data Connect error.';
      return { success: false, message: `Profile changes could not be saved: ${reason}` };
    }
    setUsers(previous => previous.map(user => user.id === userId ? updatedProfile : user));
    logAuditAction({
      category: 'security',
      subsystem: 'User Security',
      action: 'USER_PROFILE_UPDATED',
      description: `Updated account profile for ${updatedProfile.email}.`,
      details: { itemOrBatch: userId, reason: 'Administrative profile update' },
      severity: 'info',
    });
    return { success: true, message: `Profile for ${updatedProfile.email} updated.` };
  };

  const updateManagedUserRole = async (
    account: ManagedAccount,
    role: UserRole
  ): Promise<{ success: boolean; message: string }> => {
    if (!canManageSystemAccounts()) {
      return { success: false, message: 'Only an authenticated System Administrator or Lead Developer can change account roles.' };
    }
    if (!isUserRole(role)) return { success: false, message: 'Select a supported DairySync role.' };
    if (account.uid === firebaseUser?.uid) return { success: false, message: 'You cannot change your own account role.' };
    const profile = users.find(user => user.email.toLowerCase() === account.email.toLowerCase());
    const previousRole = profile?.role;
    try {
      await setManagedAccountRole({ uid: account.uid, role });
    } catch (error) {
      const reason = error instanceof Error ? error.message : 'Unknown Firebase Authentication error.';
      return { success: false, message: `The account role was not changed: ${reason}` };
    }

    if (profile) {
      const updatedProfile = { ...profile, role };
      try {
        await sqlConnectCollections.user_profile.save(updatedProfile);
      } catch (error) {
        const reason = error instanceof Error ? error.message : 'Unknown Data Connect error.';
        if (previousRole) {
          try {
            await setManagedAccountRole({ uid: account.uid, role: previousRole });
          } catch (rollbackError) {
            const rollbackReason = rollbackError instanceof Error ? rollbackError.message : 'Unknown role rollback error.';
            return {
              success: false,
              message: `The Firebase role changed, but the profile update failed: ${reason}. Automatic role rollback also failed: ${rollbackReason}. Reconcile this account before further changes.`,
            };
          }
        }
        return { success: false, message: `Profile synchronization failed and the Firebase role was rolled back: ${reason}` };
      }
      setUsers(previous => previous.map(user => user.id === profile.id ? updatedProfile : user));
    }
    logAuditAction({
      category: 'security',
      subsystem: 'User Security',
      action: 'USER_ROLE_CHANGED',
      description: `Changed DairySync role for ${account.email} to ${role}.`,
      details: { itemOrBatch: account.uid, previousValue: previousRole, newValue: role },
      severity: 'warning',
    });
    return { success: true, message: `Role for ${account.email} changed to ${USER_ROLE_LABELS[role]}.` };
  };

  const setManagedUserDisabled = async (
    account: ManagedAccount,
    disabled: boolean
  ): Promise<{ success: boolean; message: string }> => {
    if (!canManageSystemAccounts()) {
      return { success: false, message: 'Only an authenticated System Administrator or Lead Developer can change account status.' };
    }
    try {
      await setManagedAccountDisabled({ uid: account.uid, disabled });
    } catch (error) {
      const reason = error instanceof Error ? error.message : 'Unknown Firebase Authentication error.';
      return { success: false, message: `Account status was not changed: ${reason}` };
    }
    logAuditAction({
      category: 'security',
      subsystem: 'User Security',
      action: disabled ? 'USER_ACCOUNT_DISABLED' : 'USER_ACCOUNT_REACTIVATED',
      description: `${disabled ? 'Disabled' : 'Reactivated'} DairySync account ${account.email}.`,
      details: { itemOrBatch: account.uid },
      severity: disabled ? 'warning' : 'info',
    });
    return { success: true, message: `${account.email} was ${disabled ? 'disabled' : 'reactivated'}.` };
  };

  const sendManagedUserPasswordReset = async (
    email: string
  ): Promise<{ success: boolean; message: string }> => {
    if (!canManageSystemAccounts()) {
      return { success: false, message: 'Only an authenticated System Administrator or Lead Developer can send password reset emails.' };
    }
    try {
      await requestManagedAccountPasswordReset(email);
      logAuditAction({
        category: 'security',
        subsystem: 'User Security',
        action: 'PASSWORD_RESET_SENT',
        description: `Sent a password reset email to ${email}.`,
        severity: 'info',
      });
      return { success: true, message: `Password reset email sent to ${email}.` };
    } catch (error) {
      const reason = error instanceof Error ? error.message : 'Unknown Firebase Authentication error.';
      return { success: false, message: `Password reset email could not be sent: ${reason}` };
    }
  };

  const canDeleteDataAsDeveloper = () =>
    isAuthenticated &&
    authenticatedRole === 'developer' &&
    isDeveloperActive &&
    currentRole === 'developer';

  const updateIngredientRecord = (ingredient: RawIngredient) => {
    if (!canDeleteDataAsDeveloper()) return false;
    const target = ingredients.find(item => item.id === ingredient.id);
    if (!target) return false;

    const numericValues = [
      ingredient.currentStock,
      ingredient.costPerUnit,
      ingredient.safetyStock,
      ingredient.reorderPoint,
      ingredient.maxStock,
      ingredient.avgDailyConsumption,
      ingredient.leadTimeDays,
    ];
    if (
      !ingredient.sku.trim() ||
      !ingredient.name.trim() ||
      !ingredient.category.trim() ||
      !ingredient.unit.trim() ||
      !ingredient.supplier.trim() ||
      !ingredient.location.trim() ||
      numericValues.some(value => !Number.isFinite(value) || value < 0)
    ) return false;

    const updatedIngredient: RawIngredient = {
      ...ingredient,
      sku: ingredient.sku.trim(),
      name: ingredient.name.trim(),
      category: ingredient.category.trim(),
      unit: ingredient.unit.trim(),
      supplier: ingredient.supplier.trim(),
      location: ingredient.location.trim(),
      expiryDate: ingredient.expiryDate || undefined,
      lastRestocked: ingredient.currentStock > target.currentStock
        ? new Date().toLocaleString() + ' PST'
        : ingredient.lastRestocked,
    };
    setIngredients(prev => prev.map(item => item.id === updatedIngredient.id ? updatedIngredient : item));
    void recordOfflineMutation('ingredient', 'UPSERT_RAW_INGREDIENT', updatedIngredient);

    if (updatedIngredient.currentStock !== target.currentStock) {
      const difference = updatedIngredient.currentStock - target.currentStock;
      const transaction: StockTransaction = {
        id: `tx-ing-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
        timestamp: new Date().toISOString(),
        itemId: target.id,
        itemName: updatedIngredient.name,
        itemType: 'ingredient',
        action: 'inventory_adjustment',
        quantity: Math.abs(difference),
        unit: updatedIngredient.unit,
        previousStock: target.currentStock,
        newStock: updatedIngredient.currentStock,
        performedBy: currentUser.name,
        notes: 'Developer item details and stock update',
      };
      setTransactions(previous => [transaction, ...previous]);
      void recordOfflineMutation('stock_adjustment', 'UPSERT_STOCK_TRANSACTION', transaction);
    }

    logAuditAction({
      category: 'inventory',
      subsystem: 'Raw Ingredients',
      action: 'INGREDIENT_RECORD_UPDATED',
      description: `Updated raw material record ${target.name} (${target.sku})`,
      details: {
        itemOrBatch: updatedIngredient.name,
        previousValue: target.currentStock,
        newValue: updatedIngredient.currentStock,
        unit: updatedIngredient.unit,
        reason: 'Developer updated raw material specifications',
      },
      severity: 'info',
    });
    triggerManualCloudSync();
    return true;
  };

  const updateFinishedGoodRecord = (product: FinishedGood) => {
    if (!canDeleteDataAsDeveloper()) return false;
    const target = finishedGoods.find(item => item.id === product.id);
    if (!target) return false;

    const numericValues = [
      product.currentStock,
      product.coldStorageCapacity,
      product.maxThreshold,
      product.safetyStock,
      product.unitPrice,
      product.allocatedFeedingProgram,
      product.allocatedRetail,
      product.batchUnitQuantity,
      product.shelfLifeDays,
    ];
    if (
      !product.sku.trim() ||
      !product.name.trim() ||
      !product.unit.trim() ||
      !product.location.trim() ||
      numericValues.some(value => !Number.isFinite(value) || value < 0)
    ) return false;

    const updatedProduct: FinishedGood = {
      ...product,
      sku: product.sku.trim(),
      name: product.name.trim(),
      location: product.location.trim(),
    };
    setFinishedGoods(prev => prev.map(item => item.id === updatedProduct.id ? updatedProduct : item));
    void recordOfflineMutation('finished_good', 'CREATE_FINISHED_GOOD', updatedProduct);

    if (updatedProduct.currentStock !== target.currentStock) {
      const difference = updatedProduct.currentStock - target.currentStock;
      const transaction: StockTransaction = {
        id: `tx-fg-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
        timestamp: new Date().toISOString(),
        itemId: target.id,
        itemName: updatedProduct.name,
        itemType: 'finished_good',
        action: 'inventory_adjustment',
        quantity: Math.abs(difference),
        unit: updatedProduct.unit,
        previousStock: target.currentStock,
        newStock: updatedProduct.currentStock,
        performedBy: currentUser.name,
        notes: 'Developer product details and stock update',
      };
      setTransactions(previous => [transaction, ...previous]);
      void recordOfflineMutation('stock_adjustment', 'UPSERT_STOCK_TRANSACTION', transaction);
    }

    logAuditAction({
      category: 'cold_storage',
      subsystem: 'Cold Storage',
      action: 'FINISHED_GOOD_RECORD_UPDATED',
      description: `Updated finished good record ${target.name} (${target.sku})`,
      details: {
        itemOrBatch: updatedProduct.name,
        previousValue: target.currentStock,
        newValue: updatedProduct.currentStock,
        unit: updatedProduct.unit,
        reason: 'Developer updated finished good specifications',
      },
      severity: 'info',
    });
    triggerManualCloudSync();
    return true;
  };

  const deleteIngredientRecord = (id: string) => {
    if (!canDeleteDataAsDeveloper()) return false;
    const target = ingredients.find(item => item.id === id);
    if (!target) return false;

    setIngredients(prev => prev.filter(item => item.id !== id));
    logAuditAction({
      category: 'inventory',
      subsystem: 'Raw Ingredients',
      action: 'INGREDIENT_RECORD_DELETED',
      description: `Deleted raw ingredient record ${target.name} (${target.sku})`,
      details: { itemOrBatch: target.name, reason: 'Developer per-record deletion' },
      severity: 'critical'
    });
    triggerManualCloudSync();
    return true;
  };

  const deleteFinishedGoodRecord = (id: string) => {
    if (!canDeleteDataAsDeveloper()) return false;
    const target = finishedGoods.find(item => item.id === id);
    if (!target) return false;

    setFinishedGoods(prev => prev.filter(item => item.id !== id));
    logAuditAction({
      category: 'cold_storage',
      subsystem: 'Cold Storage',
      action: 'FINISHED_GOOD_RECORD_DELETED',
      description: `Deleted finished good record ${target.name} (${target.sku})`,
      details: { itemOrBatch: target.name, reason: 'Developer per-record deletion' },
      severity: 'critical'
    });
    triggerManualCloudSync();
    return true;
  };

  const deleteFinishedGoodRecipe = (id: string) => {
    if (!canDeleteDataAsDeveloper()) return false;
    const target = finishedGoods.find(item => item.id === id);
    if (!target || !target.recipe?.length) return false;
    return updateFinishedGoodRecipe(
      id,
      [],
      target.batchUnitQuantity || 100,
      target.unit,
      target.containerVolumeMl,
    );
  };

  const deleteWipBatchRecord = (batchId: string) => {
    if (!canDeleteDataAsDeveloper()) return false;
    const target = wipBatches.find(batch => batch.id === batchId);
    if (!target) return false;

    setWipBatches(prev => prev.filter(batch => batch.id !== batchId));
    setWipProductionRecords(prev => prev.filter(record => record.batchId !== batchId));
    logAuditAction({
      category: 'production',
      subsystem: 'WIP Batches',
      action: 'WIP_BATCH_RECORD_DELETED',
      description: `Deleted WIP batch record ${target.batchNumber}`,
      details: { itemOrBatch: target.batchNumber, reason: 'Developer per-record deletion; inventory was not adjusted' },
      severity: 'critical'
    });
    triggerManualCloudSync();
    return true;
  };

  const deleteCommitmentRecord = (id: string) => {
    if (!canDeleteDataAsDeveloper()) return false;
    const target = commitments.find(commitment => commitment.id === id);
    if (!target) return false;

    setCommitments(prev => prev.filter(commitment => commitment.id !== id));
    logAuditAction({
      category: 'commitments',
      subsystem: 'Supply & Demand',
      action: 'COMMITMENT_RECORD_DELETED',
      description: `Deleted ${target.type} commitment for ${target.partnerName}`,
      details: { itemOrBatch: target.itemOrMilk, reason: 'Developer per-record deletion' },
      severity: 'critical'
    });
    triggerManualCloudSync();
    return true;
  };

  const deleteStockRequestRecord = async (id: string): Promise<{ success: boolean; message: string }> => {
    if (
      !isAuthenticated ||
      authenticatedRole !== 'developer' ||
      !isDeveloperActive
    ) {
      return { success: false, message: 'Only the authenticated Lead Developer can delete stock requests.' };
    }
    const target = stockRequests.find(request => request.id === id);
    if (!target) return { success: false, message: 'The stock request is no longer available. Refresh the request list and try again.' };

    try {
      await sqlConnectCollections.stock_request.remove(id);
    } catch (error) {
      console.error(`Could not delete stock request ${id} from shared cloud data:`, error);
      return {
        success: false,
        message: error instanceof Error
          ? `The stock request was not deleted from shared data: ${error.message}`
          : 'The stock request was not deleted from shared data. Check your connection and try again.',
      };
    }

    setStockRequests(previous => previous.filter(request => request.id !== id));
    setAlerts(previous => previous.filter(alert => !alert.id.startsWith(`${id}-`)));
    logAuditAction({
      category: 'cold_storage',
      subsystem: 'Dairy Box Stock Requests',
      action: 'STOCK_REQUEST_RECORD_DELETED',
      description: `Deleted Dairy Box stock request for ${target.quantity} ${target.unit} of ${target.finishedGoodName}`,
      details: {
        itemOrBatch: target.finishedGoodName,
        quantity: target.quantity,
        unit: target.unit,
        referenceId: id,
        reason: `Developer deletion of ${target.status} request; inventory allocations were not changed`,
      },
      severity: 'critical',
    });
    return { success: true, message: 'Stock request deleted from shared data.' };
  };

  const deleteSalesHistoryRecord = (receiptNo: string, transactionIds: string[]) => {
    if (!canDeleteDataAsDeveloper()) return false;
    if (transactionIds.length === 0) return false;
    const requestedIds = new Set(transactionIds);
    const matchingTransactions = transactions.filter(transaction =>
      requestedIds.has(transaction.id) &&
      transaction.action === 'out_sale' &&
      transaction.itemType === 'finished_good'
    );
    if (matchingTransactions.length !== requestedIds.size) return false;

    const deletedIds = new Set(matchingTransactions.map(transaction => transaction.id));
    setTransactions(prev => prev.filter(transaction => !deletedIds.has(transaction.id)));
    logAuditAction({
      category: 'sales',
      subsystem: 'Dairy Box POS',
      action: 'POS_SALES_HISTORY_RECORD_DELETED',
      description: `Deleted POS sales history receipt ${receiptNo}`,
      details: {
        referenceId: receiptNo,
        count: matchingTransactions.length,
        reason: 'Developer per-record deletion; finished goods stock was not restored'
      },
      severity: 'critical'
    });
    triggerManualCloudSync();
    return true;
  };

  const removeIdentifiedSampleSales = async () => {
    if (!canDeleteDataAsDeveloper()) {
      return { deletedCount: 0, pendingCount: 0, failedIds: ['Developer authorization required'] };
    }

    const targets = transactions.filter(isScreenshotSaleTransaction);
    if (targets.length === 0) {
      return { deletedCount: 0, pendingCount: 0, failedIds: [] };
    }

    const targetIds = targets.map(transaction => transaction.id);
    await removePendingSampleWrites('stock_adjustment', targetIds);

    const deletedIds: string[] = [];
    const pendingIds: string[] = [];
    const failedIds: string[] = [];
    for (const transaction of targets) {
      try {
        await sqlConnectCollections.stock_adjustment.remove(transaction.id);
        deletedIds.push(transaction.id);
      } catch (error) {
        console.error(`Could not delete identified sample POS transaction ${transaction.id}:`, error);
        const queueId = await enqueueOfflineAction({
          entity: 'stock_adjustment',
          action: 'SQL_DELETE',
          payload: { id: transaction.id },
          userEmail: firebaseUser?.email || undefined,
          userUid: firebaseUser?.uid,
        });
        if (queueId >= 0) pendingIds.push(transaction.id);
        else failedIds.push(transaction.id);
      }
    }

    const removedIds = new Set([...deletedIds, ...pendingIds]);
    if (removedIds.size > 0) {
      setTransactions(previous => previous.filter(transaction => !removedIds.has(transaction.id)));
      logAuditAction({
        category: 'sales',
        subsystem: 'Dairy Box POS',
        action: 'IDENTIFIED_SAMPLE_SALES_REMOVED',
        description: `Removed ${deletedIds.length} identified sample POS sale transaction(s)${pendingIds.length > 0 ? `; queued ${pendingIds.length} for cloud deletion retry` : ''}`,
        details: {
          count: removedIds.size,
          itemsDeleted: targets.filter(transaction => removedIds.has(transaction.id)).map(transaction => transaction.itemName).join(', '),
          reason: 'Developer cleanup of specifically identified sample sales; sold inventory was not restored'
        },
        severity: 'critical'
      });
      triggerManualCloudSync();
    }

    return { deletedCount: deletedIds.length, pendingCount: pendingIds.length, failedIds };
  };

  const deleteAuditLogRecord = (id: string) => {
    if (!canDeleteDataAsDeveloper()) return false;
    if (!auditLogs.some(log => log.id === id)) return false;
    setAuditLogs(prev => prev.filter(log => log.id !== id));
    return true;
  };

  const resetToDefaultData = () => {
    setUsers(INITIAL_USERS);
    setIngredients(INITIAL_INGREDIENTS);
    setFinishedGoods(INITIAL_FINISHED_GOODS);
    setWipBatches(INITIAL_WIP_BATCHES);
    setWipProductionRecords([]);
    setCommitments(INITIAL_COMMITMENTS);
    setAlerts(INITIAL_ALERTS);
    setTransactions(INITIAL_TRANSACTIONS);
    setIsoRatings([]);
    setAuditLogs(INITIAL_AUDIT_LOGS);
    localStorage.clear();
    triggerManualCloudSync();
  };

  return (
    <DairySyncContext.Provider value={{
      currentRole,
      setCurrentRole,
      currentUser,
      users,
      isAuthenticated,
      isAuthReady,
      authError,
      isDeveloperActive,
      login,
      loginAsRoleUser,
      returnToDeveloperAccount,
      logout,
      canAccessTab,
      allowedTabs,
      ingredients,
      recoverRawIngredients,
      finishedGoods,
      wipBatches,
      wipProductionRecords,
      commitments,
      stockRequests,
      alerts,
      transactions,
      pmoInventoryPeriods,
      importPmoInventoryPeriod,
      savePmoInventoryPeriod,
      postPmoInventoryPeriod,
      deletePmoInventoryPeriod,
      addPmoExternalPurchase,
      recordPmoInventoryAdjustment,
      recordPmoFinishedGoodAdjustment,
      isoRatings,
      auditLogs,
      addIngredient,
      updateIngredientRecord,
      updateIngredientStock,
      addFinishedGood,
      updateFinishedGoodRecord,
      updateFinishedGoodRecipe,
      deleteFinishedGoodRecipe,
      deleteIngredientRecord,
      deleteFinishedGoodRecord,
      updateFinishedGoodStock,
      updateFinishedGoodSafetyStock,
      createWipBatch,
      advanceWipBatchStep,
      cancelWipBatch,
      deleteWipBatchRecord,
      saveWipProductionRecord,
      processRetailSale,
      createStockRequest,
      reviewStockRequest,
      cancelStockRequest,
      deleteStockRequest: deleteStockRequestRecord,
      addCommitment,
      updateCommitmentStatus,
      cancelCommitment,
      updateCommitmentPriority,
      deleteCommitmentRecord,
      deleteSalesHistoryRecord,
      removeIdentifiedSampleSales,
      markAlertRead,
      clearAllAlerts,
      submitIsoEvaluation,
      logAuditAction,
      clearAuditLogs,
      deleteAuditLogRecord,
      exportAuditLogsCsv,
      resetToDefaultData,
      addUserProfile,
      fetchManagedAccounts: fetchManagedAccountsForAdmin,
      createManagedUser,
      updateManagedUserProfile,
      updateManagedUserRole,
      setManagedUserDisabled,
      sendManagedUserPasswordReset,
      cloudSyncStatus,
      triggerManualCloudSync,
      forceReCacheInventory,
      syncOfflineQueueWithCloud,
      isOnline,
      updateUserProfile,
      themeMode,
      setThemeMode,
      toggleThemeMode,
      bulkUpdateIngredientsStock,
      bulkDeleteIngredients,
      bulkUpdateFinishedGoodsStock,
      bulkDeleteFinishedGoods,
      quickRegisterIngredientArrival,
      quickLogFinishedBatch,
      batchExpiries
    }}>
      {children}
    </DairySyncContext.Provider>
  );
};

export const useDairySync = () => {
  const context = useContext(DairySyncContext);
  if (!context) {
    throw new Error('useDairySync must be used within a DairySyncProvider');
  }
  return context;
};
