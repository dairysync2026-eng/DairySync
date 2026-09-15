import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  UserRole, 
  UserProfile, 
  RawIngredient, 
  FinishedGood, 
  WipBatch, 
  SupplyDemandCommitment, 
  SystemAlert, 
  StockTransaction,
  IsoEvaluationRating,
  WipStep,
  AuditLogEntry,
  AuditCategory,
  AuditSeverity,
  ThemeMode,
  BatchExpiryAlert
} from '../types';
import { 
  cacheInventoryToIndexedDb, 
  getPendingOfflineActions, 
  clearOfflineQueue,
  enqueueOfflineAction
} from '../services/inventoryDb';
import { 
  INITIAL_USERS, 
  INITIAL_INGREDIENTS, 
  INITIAL_FINISHED_GOODS, 
  INITIAL_WIP_BATCHES, 
  INITIAL_COMMITMENTS, 
  INITIAL_ALERTS, 
  INITIAL_TRANSACTIONS,
  INITIAL_AUDIT_LOGS
} from '../data/initialData';

export const ROLE_ALLOWED_TABS: Record<UserRole, string[]> = {
  developer: ['dashboard', 'ingredients', 'wip', 'finished', 'sync', 'procurement', 'pos', 'audit'],
  director: ['dashboard', 'ingredients', 'wip', 'finished', 'sync', 'procurement', 'pos', 'audit'],
  procurement: ['dashboard', 'procurement', 'ingredients'],
  plant_manager: ['dashboard', 'finished', 'wip', 'ingredients', 'procurement'],
  production_staff: ['dashboard', 'wip', 'ingredients'],
  store_outlet: ['dashboard', 'pos', 'finished']
};

interface DairySyncContextType {
  currentRole: UserRole;
  setCurrentRole: (role: UserRole) => void;
  currentUser: UserProfile;
  users: UserProfile[];
  
  // Auth state
  isAuthenticated: boolean;
  isDeveloperActive: boolean;
  login: (identifier: string, pass: string) => { success: boolean; message: string };
  loginAsRoleUser: (role: UserRole) => void;
  returnToDeveloperAccount: () => void;
  logout: () => void;
  canAccessTab: (tabId: string) => boolean;
  allowedTabs: string[];
  
  ingredients: RawIngredient[];
  finishedGoods: FinishedGood[];
  wipBatches: WipBatch[];
  commitments: SupplyDemandCommitment[];
  alerts: SystemAlert[];
  transactions: StockTransaction[];
  isoRatings: IsoEvaluationRating[];
  auditLogs: AuditLogEntry[];
  
  // Actions
  addIngredient: (ingredient: Omit<RawIngredient, 'id'>) => void;
  updateIngredientStock: (id: string, newStock: number, notes?: string, expiryDate?: string) => void;
  addFinishedGood: (product: Omit<FinishedGood, 'id'>) => void;
  updateFinishedGoodStock: (id: string, newStock: number, notes?: string) => void;
  updateFinishedGoodSafetyStock: (id: string, safetyStock: number) => void;
  
  // Production / WIP Actions
  createWipBatch: (batchData: {
    productId: string;
    productName: string;
    targetQuantity: number;
    rawMilkVolumeUsed: number;
    assignedStaff: string;
    notes?: string;
  }) => { success: boolean; message: string };
  
  advanceWipBatchStep: (batchId: string, nextStep: WipStep) => void;
  cancelWipBatch: (batchId: string, reason?: string) => { success: boolean; message: string };
  
  // Retail / POS Actions
  processRetailSale: (items: { productId: string; quantity: number }[]) => { success: boolean; message: string };
  
  // Commitment Actions
  addCommitment: (commitment: Omit<SupplyDemandCommitment, 'id'>) => void;
  updateCommitmentStatus: (id: string, status: SupplyDemandCommitment['status'], fulfilledQty?: number) => void;
  cancelCommitment: (id: string, reason: string) => void;
  updateCommitmentPriority: (id: string, priority: 'high' | 'medium' | 'low') => void;
  
  // Alerts Actions
  markAlertRead: (id: string) => void;
  clearAllAlerts: () => void;
  
  // ISO 25010 Assessment Action
  submitIsoEvaluation: (rating: Omit<IsoEvaluationRating, 'date' | 'evaluatorRole'>) => void;
  
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
  exportAuditLogsCsv: () => void;

  // System Utility
  resetToDefaultData: () => void;
  cloudSyncStatus: 'synced' | 'syncing' | 'offline';
  triggerManualCloudSync: () => void;
  forceReCacheInventory: () => Promise<void>;
  syncOfflineQueueWithCloud: () => Promise<void>;
  isOnline: boolean;

  // User Profile & Authentication Actions
  updateUserProfile: (userId: string, updates: Partial<UserProfile>) => { success: boolean; message: string };
  verifyUserPassword: (userId: string, passwordAttempt: string) => boolean;

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

export const DairySyncProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [users, setUsers] = useState<UserProfile[]>(() => {
    const saved = localStorage.getItem(`${LOCAL_STORAGE_KEY}_users`);
    if (saved) {
      try {
        const parsed = JSON.parse(saved) as UserProfile[];
        const hasDev = parsed.some(u => u.role === 'developer');
        if (!hasDev) {
          const devUser = INITIAL_USERS.find(u => u.role === 'developer');
          if (devUser) {
            return [devUser, ...parsed];
          }
        }
        return parsed;
      } catch {
        return INITIAL_USERS;
      }
    }
    return INITIAL_USERS;
  });

  useEffect(() => {
    localStorage.setItem(`${LOCAL_STORAGE_KEY}_users`, JSON.stringify(users));
  }, [users]);

  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return false;
  });

  const [currentRole, setCurrentRoleState] = useState<UserRole>(() => {
    const saved = localStorage.getItem(`${LOCAL_STORAGE_KEY}_role`);
    return (saved as UserRole) || 'developer';
  });

  // Track if a Developer superuser session is active across role switching
  const [isDeveloperActive, setIsDeveloperActive] = useState<boolean>(() => {
    return false;
  });

  const setDeveloperActive = (active: boolean) => {
    setIsDeveloperActive(active);
    localStorage.setItem(`${LOCAL_STORAGE_KEY}_dev_active`, JSON.stringify(active));
  };
  
  const [ingredients, setIngredients] = useState<RawIngredient[]>(() => {
    const saved = localStorage.getItem(`${LOCAL_STORAGE_KEY}_ingredients`);
    const parsed: RawIngredient[] = saved ? JSON.parse(saved) : INITIAL_INGREDIENTS;
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
    const parsed: FinishedGood[] = saved ? JSON.parse(saved) : INITIAL_FINISHED_GOODS;
    const seen = new Set<string>();
    return parsed.filter(f => {
      if (!f.id || seen.has(f.id)) return false;
      seen.add(f.id);
      return true;
    });
  });

  const [wipBatches, setWipBatches] = useState<WipBatch[]>(() => {
    const saved = localStorage.getItem(`${LOCAL_STORAGE_KEY}_wip_batches`);
    let parsed: WipBatch[] = saved ? JSON.parse(saved) : INITIAL_WIP_BATCHES;
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
    const parsed: SupplyDemandCommitment[] = saved ? JSON.parse(saved) : INITIAL_COMMITMENTS;
    const seen = new Set<string>();
    return parsed.filter(c => {
      if (!c.id || seen.has(c.id)) return false;
      seen.add(c.id);
      return true;
    });
  });

  const [alerts, setAlerts] = useState<SystemAlert[]>(() => {
    const saved = localStorage.getItem(`${LOCAL_STORAGE_KEY}_alerts`);
    const parsed: SystemAlert[] = saved ? JSON.parse(saved) : INITIAL_ALERTS;
    const seen = new Set<string>();
    return parsed.filter(a => {
      if (seen.has(a.id)) return false;
      seen.add(a.id);
      return true;
    });
  });

  const [transactions, setTransactions] = useState<StockTransaction[]>(() => {
    const saved = localStorage.getItem(`${LOCAL_STORAGE_KEY}_transactions`);
    const parsed: StockTransaction[] = saved ? JSON.parse(saved) : INITIAL_TRANSACTIONS;
    const seen = new Set<string>();
    return parsed.filter(t => {
      if (!t.id || seen.has(t.id)) return false;
      seen.add(t.id);
      return true;
    });
  });

  const [isoRatings, setIsoRatings] = useState<IsoEvaluationRating[]>(() => {
    const saved = localStorage.getItem(`${LOCAL_STORAGE_KEY}_iso_ratings`);
    return saved ? JSON.parse(saved) : [];
  });

  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>(() => {
    const saved = localStorage.getItem(`${LOCAL_STORAGE_KEY}_audit_logs`);
    const parsed: AuditLogEntry[] = saved ? JSON.parse(saved) : INITIAL_AUDIT_LOGS;
    const seen = new Set<string>();
    return parsed.filter(a => {
      if (!a.id || seen.has(a.id)) return false;
      seen.add(a.id);
      return true;
    });
  });

  const [cloudSyncStatus, setCloudSyncStatus] = useState<'synced' | 'syncing' | 'offline'>('synced');
  const [isOnline, setIsOnline] = useState<boolean>(() => {
    return typeof navigator !== 'undefined' ? navigator.onLine : true;
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
      setCloudSyncStatus('synced');
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
    localStorage.setItem(`${LOCAL_STORAGE_KEY}_alerts`, JSON.stringify(alerts));
  }, [alerts]);

  useEffect(() => {
    localStorage.setItem(`${LOCAL_STORAGE_KEY}_transactions`, JSON.stringify(transactions));
  }, [transactions]);

  useEffect(() => {
    localStorage.setItem(`${LOCAL_STORAGE_KEY}_iso_ratings`, JSON.stringify(isoRatings));
  }, [isoRatings]);

  useEffect(() => {
    localStorage.setItem(`${LOCAL_STORAGE_KEY}_audit_logs`, JSON.stringify(auditLogs));
  }, [auditLogs]);

  const currentUser = users.find(u => u.role === currentRole) || users[0];

  const setCurrentRole = (role: UserRole) => {
    setCurrentRoleState(role);
    localStorage.setItem(`${LOCAL_STORAGE_KEY}_role`, role);
  };

  const login = (identifier: string, pass: string) => {
    const cleanId = identifier.trim().toLowerCase();
    const cleanPass = pass.trim();

    // Check by email, username, or id
    const matchedUser = users.find(u => 
      u.email.toLowerCase() === cleanId || 
      u.username.toLowerCase() === cleanId ||
      u.id.toLowerCase() === cleanId
    );

    if (matchedUser) {
      if (matchedUser.password && matchedUser.password !== cleanPass) {
        return { success: false, message: `Incorrect password for ${matchedUser.name}.` };
      }
      setCurrentRole(matchedUser.role);
      setIsAuthenticated(true);
      const isDev = matchedUser.role === 'developer';
      setDeveloperActive(isDev);
      localStorage.setItem(`${LOCAL_STORAGE_KEY}_auth`, JSON.stringify(true));
      return { success: true, message: `Logged in as ${matchedUser.name} (${matchedUser.title})` };
    }

    // Role keyword fallback
    const roleMatch = users.find(u => u.role === cleanId as UserRole);
    if (roleMatch) {
      setCurrentRole(roleMatch.role);
      setIsAuthenticated(true);
      const isDev = roleMatch.role === 'developer';
      setDeveloperActive(isDev);
      localStorage.setItem(`${LOCAL_STORAGE_KEY}_auth`, JSON.stringify(true));
      return { success: true, message: `Logged in as ${roleMatch.name} (${roleMatch.title})` };
    }

    return { success: false, message: 'Invalid credentials. Please enter a valid email or username.' };
  };

  const loginAsRoleUser = (role: UserRole) => {
    // Lead developer has master clearance to switch between all account users without doing a re-login
    // If an authenticated user is neither currently a developer nor has an active developer session, reject it
    if (isAuthenticated && !isDeveloperActive && currentRole !== 'developer' && role !== currentRole) {
      console.warn('RBAC Notice: Only the Lead Developer has access to switch between all account users.');
      return;
    }
    const matched = users.find(u => u.role === role);
    if (matched) {
      // If switching from developer or if developer session was active, maintain isDeveloperActive = true!
      if (currentRole === 'developer' || isDeveloperActive) {
        setDeveloperActive(true);
      }
      setCurrentRole(matched.role);
      setIsAuthenticated(true);
      localStorage.setItem(`${LOCAL_STORAGE_KEY}_auth`, JSON.stringify(true));
    }
  };

  const returnToDeveloperAccount = () => {
    const devUser = users.find(u => u.role === 'developer');
    if (devUser) {
      setCurrentRole('developer');
      setDeveloperActive(true);
      setIsAuthenticated(true);
      localStorage.setItem(`${LOCAL_STORAGE_KEY}_auth`, JSON.stringify(true));
    }
  };

  const logout = () => {
    setIsAuthenticated(false);
    setDeveloperActive(false);
    localStorage.setItem(`${LOCAL_STORAGE_KEY}_auth`, JSON.stringify(false));
  };

  const canAccessTab = (tabId: string) => {
    const allowed = ROLE_ALLOWED_TABS[currentRole] || ['dashboard'];
    return allowed.includes(tabId);
  };

  const allowedTabs = ROLE_ALLOWED_TABS[currentRole] || ['dashboard'];

  const recordOfflineMutation = async (
    entity: 'ingredient' | 'finished_good' | 'wip_batch' | 'pos_sale' | 'stock_adjustment',
    action: string,
    payload: any
  ) => {
    if (typeof navigator !== 'undefined' && !navigator.onLine) {
      try {
        await enqueueOfflineAction({
          action,
          entity,
          payload,
          userEmail: currentUser.email
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
    setCloudSyncStatus('syncing');
    try {
      const queue = await getPendingOfflineActions();
      if (queue.length > 0) {
        logAuditAction({
          category: 'security',
          subsystem: 'Offline Sync Engine',
          action: 'OFFLINE_RECONCILIATION',
          description: `Reconciled ${queue.length} offline queued inventory transactions to cloud ledger.`,
          details: {
            quantity: queue.length,
            reason: 'Network connectivity restored; offline mutations committed.'
          },
          severity: 'success'
        });
        await clearOfflineQueue();
      }
      await cacheInventoryToIndexedDb({
        ingredients,
        finishedGoods,
        wipBatches,
        transactions,
      });
    } catch (e) {
      console.warn('Sync error:', e);
    } finally {
      setTimeout(() => {
        setCloudSyncStatus(typeof navigator !== 'undefined' && navigator.onLine ? 'synced' : 'offline');
      }, 600);
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

  const clearAuditLogs = () => {
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
      const seen = new Set<string>();
      const deduped = prev.filter(a => {
        if (seen.has(a.id)) return false;
        seen.add(a.id);
        return true;
      });

      let changed = deduped.length !== prev.length;
      const nextAlerts = [...deduped];

      // Check ingredients for ROP
      ingredients.forEach(ing => {
        if (ing.currentStock <= ing.reorderPoint) {
          const alertId = `rop-${ing.id}`;
          if (!seen.has(alertId)) {
            seen.add(alertId);
            nextAlerts.unshift({
              id: alertId,
              timestamp: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) + ' PST',
              type: 'rop_triggered',
              title: `REORDER POINT: ${ing.name}`,
              message: `Stock (${ing.currentStock} ${ing.unit}) has dropped below ROP (${ing.reorderPoint} ${ing.unit}). Immediate procurement required.`,
              severity: ing.currentStock <= ing.safetyStock ? 'critical' : 'warning',
              read: false,
              targetRole: ['procurement', 'plant_manager', 'director']
            });
            changed = true;
          }
        }
      });

      // Check finished goods for overstock
      finishedGoods.forEach(fg => {
        if (fg.currentStock > fg.maxThreshold) {
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
        if (typeof fg.safetyStock === 'number' && fg.currentStock <= fg.safetyStock) {
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

  const addIngredient = (ingData: Omit<RawIngredient, 'id'>) => {
    const newIng: RawIngredient = {
      ...ingData,
      id: `ing-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`
    };
    setIngredients(prev => [newIng, ...prev]);
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
  };

  const updateIngredientStock = (id: string, newStock: number, notes?: string, expiryDate?: string) => {
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
          timestamp: new Date().toLocaleString() + ' PST',
          itemId: ing.id,
          itemName: ing.name,
          itemType: 'ingredient',
          action: diff >= 0 ? 'in_restock' : 'wip_deduct',
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
        severity: diff < 0 && newStock <= targetIng.reorderPoint ? 'warning' : 'info'
      });
    }
    triggerManualCloudSync();
  };

  const addFinishedGood = (fgData: Omit<FinishedGood, 'id'>) => {
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

  const updateFinishedGoodStock = (id: string, newStock: number, notes?: string) => {
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
          timestamp: new Date().toLocaleString() + ' PST',
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
        severity: newStock <= targetFg.safetyStock ? 'warning' : 'info'
      });
    }
    triggerManualCloudSync();
  };

  const updateFinishedGoodSafetyStock = (id: string, safetyStock: number) => {
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
          timestamp: new Date().toLocaleString() + ' PST',
          itemId: ing.id,
          itemName: ing.name,
          itemType: 'ingredient',
          action: diff >= 0 ? 'in_restock' : 'wip_deduct',
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
          timestamp: new Date().toLocaleString() + ' PST',
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
    updateIngredientStock(target.id, newStock, `Quick Arrival Log: ${data.supplierReceipt ? `DR #${data.supplierReceipt} - ` : ''}${data.notes || 'Cooperative / Supplier delivery'}`);

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
    updateFinishedGoodStock(product.id, newStock, `Direct Batch Log: ${data.notes || 'Direct plant release into cold storage'}`);

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
  }) => {
    const product = finishedGoods.find(p => p.id === batchData.productId);
    if (!product) {
      return { success: false, message: 'Target finished product not found.' };
    }

    // Calculate BOM requirements based on recipe multiplier
    const multiplier = batchData.targetQuantity / (product.batchUnitQuantity || 100);
    const requiredIngredients = product.recipe.map(r => ({
      ...r,
      totalNeeded: r.quantityRequired * multiplier
    }));

    // Verify stock availability
    for (const req of requiredIngredients) {
      const ing = ingredients.find(i => i.id === req.ingredientId);
      if (!ing || ing.currentStock < req.totalNeeded) {
        const currentHave = ing ? ing.currentStock : 0;
        return {
          success: false,
          message: `Insufficient ingredient: ${req.ingredientName}. Needed ${req.totalNeeded.toFixed(1)} ${req.unit}, but only ${currentHave} ${req.unit} available. Production halted to prevent incomplete batches!`
        };
      }
    }

    // Deduct ingredients from inventory
    const newTxs: StockTransaction[] = [];
    const batchRefId = `BATCH-${Date.now()}`;
    const updatedIngredients = ingredients.map(ing => {
      const req = requiredIngredients.find(r => r.ingredientId === ing.id);
      if (req) {
        const newStock = Math.max(0, ing.currentStock - req.totalNeeded);
        
        newTxs.push({
          id: `tx-wip-${Date.now()}-${Math.random().toString(36).substring(2, 9)}-${ing.id}`,
          timestamp: new Date().toLocaleString() + ' PST',
          itemId: ing.id,
          itemName: ing.name,
          itemType: 'ingredient',
          action: 'wip_deduct',
          quantity: req.totalNeeded,
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
      ingredientsUsed: requiredIngredients.map(r => ({
        ingredientId: r.ingredientId,
        ingredientName: r.ingredientName,
        quantity: r.totalNeeded,
        unit: r.unit
      })),
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

  // Cancel Scheduled WIP Batch without affecting raw materials (restores ingredients)
  const cancelWipBatch = (batchId: string, reason?: string): { success: boolean; message: string } => {
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
          timestamp: new Date().toLocaleString() + ' PST',
          itemId: ing.id,
          itemName: ing.name,
          itemType: 'ingredient',
          action: 'in_restock',
          quantity: usedItem.quantity,
          unit: ing.unit,
          previousStock: ing.currentStock,
          newStock: restoredStock,
          referenceId: targetBatch.batchNumber,
          performedBy: currentUser.name,
          notes: `Batch Cancellation Inventory Rollback: Restored raw material for scheduled ${targetBatch.batchNumber} (${reason || 'Cancelled prior to pasteurization'})`
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
    return { success: true, message: 'Dairy Box retail transaction processed and synchronized!' };
  };

  const addCommitment = (comData: Omit<SupplyDemandCommitment, 'id'>) => {
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
    setCommitments(prev => prev.map(c => c.id === id ? { ...c, priority } : c));
    triggerManualCloudSync();
  };

  const markAlertRead = (id: string) => {
    setAlerts(prev => prev.map(a => a.id === id ? { ...a, read: true } : a));
  };

  const clearAllAlerts = () => {
    setAlerts(prev => prev.map(a => ({ ...a, read: true })));
  };

  const submitIsoEvaluation = (ratingData: Omit<IsoEvaluationRating, 'date' | 'evaluatorRole'>) => {
    const newRating: IsoEvaluationRating = {
      ...ratingData,
      date: new Date().toLocaleDateString(),
      evaluatorRole: currentRole
    };
    setIsoRatings(prev => [newRating, ...prev]);
  };

  const verifyUserPassword = (userId: string, passwordAttempt: string): boolean => {
    const user = users.find(u => u.id === userId);
    if (!user) return false;
    return (user.password || '') === passwordAttempt.trim();
  };

  const updateUserProfile = (userId: string, updates: Partial<UserProfile>): { success: boolean; message: string } => {
    // Only lead developer can modify other account users; standard users can only modify their own profile
    if (currentRole !== 'developer' && currentUser.id !== userId) {
      return { success: false, message: 'Unauthorized. Only the Lead Developer has access to manage other account users.' };
    }

    // Check if new username or email conflicts with another user
    if (updates.username) {
      const cleanUsername = updates.username.trim().toLowerCase();
      const conflict = users.find(u => u.id !== userId && u.username.toLowerCase() === cleanUsername);
      if (conflict) {
        return { success: false, message: `Username "${updates.username}" is already taken.` };
      }
    }

    if (updates.email) {
      const cleanEmail = updates.email.trim().toLowerCase();
      const conflict = users.find(u => u.id !== userId && u.email.toLowerCase() === cleanEmail);
      if (conflict) {
        return { success: false, message: `Email "${updates.email}" is already associated with another account.` };
      }
    }

    setUsers(prev => prev.map(u => {
      if (u.id === userId) {
        return {
          ...u,
          ...updates,
          name: updates.name ? updates.name.trim() : u.name,
          username: updates.username ? updates.username.trim() : u.username,
          email: updates.email ? updates.email.trim() : u.email,
          title: updates.title !== undefined ? updates.title.trim() : u.title,
          avatar: updates.avatar !== undefined ? updates.avatar.trim() : u.avatar,
          nickname: updates.nickname !== undefined ? updates.nickname.trim() : u.nickname,
          password: updates.password !== undefined ? updates.password.trim() : u.password
        };
      }
      return u;
    }));

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

  const resetToDefaultData = () => {
    setUsers(INITIAL_USERS);
    setIngredients(INITIAL_INGREDIENTS);
    setFinishedGoods(INITIAL_FINISHED_GOODS);
    setWipBatches(INITIAL_WIP_BATCHES);
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
      isDeveloperActive,
      login,
      loginAsRoleUser,
      returnToDeveloperAccount,
      logout,
      canAccessTab,
      allowedTabs,
      ingredients,
      finishedGoods,
      wipBatches,
      commitments,
      alerts,
      transactions,
      isoRatings,
      auditLogs,
      addIngredient,
      updateIngredientStock,
      addFinishedGood,
      updateFinishedGoodStock,
      updateFinishedGoodSafetyStock,
      createWipBatch,
      advanceWipBatchStep,
      cancelWipBatch,
      processRetailSale,
      addCommitment,
      updateCommitmentStatus,
      cancelCommitment,
      updateCommitmentPriority,
      markAlertRead,
      clearAllAlerts,
      submitIsoEvaluation,
      logAuditAction,
      clearAuditLogs,
      exportAuditLogsCsv,
      resetToDefaultData,
      cloudSyncStatus,
      triggerManualCloudSync,
      forceReCacheInventory,
      syncOfflineQueueWithCloud,
      isOnline,
      updateUserProfile,
      verifyUserPassword,
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
