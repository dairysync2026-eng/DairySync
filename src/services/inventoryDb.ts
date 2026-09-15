import { RawIngredient, FinishedGood, WipBatch, StockTransaction } from '../types';

const DB_NAME = 'dairysync_inventory_db';
const DB_VERSION = 1;

export interface OfflineSyncQueueItem {
  id?: number;
  timestamp: string;
  action: string;
  entity: 'ingredient' | 'finished_good' | 'wip_batch' | 'pos_sale' | 'stock_adjustment';
  payload: any;
  userEmail?: string;
  synced: boolean;
}

export interface InventoryDbStats {
  ingredientCount: number;
  finishedCount: number;
  wipCount: number;
  transactionCount: number;
  queueCount: number;
  lastSynced: string | null;
  dbReady: boolean;
}

let dbInstance: IDBDatabase | null = null;

/**
 * Initialize IndexedDB for robust offline inventory storage
 */
export function openInventoryDb(): Promise<IDBDatabase> {
  if (dbInstance) {
    return Promise.resolve(dbInstance);
  }

  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined' || !window.indexedDB) {
      reject(new Error('IndexedDB is not supported in this environment'));
      return;
    }

    const request = window.indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => {
      console.error('Failed to open DairySync IndexedDB:', request.error);
      reject(request.error);
    };

    request.onsuccess = () => {
      dbInstance = request.result;
      resolve(dbInstance);
    };

    request.onupgradeneeded = (event: IDBVersionChangeEvent) => {
      const db = (event.target as IDBOpenDBRequest).result;

      // 1. Raw Ingredients Store
      if (!db.objectStoreNames.contains('raw_ingredients')) {
        const ingStore = db.createObjectStore('raw_ingredients', { keyPath: 'id' });
        ingStore.createIndex('category', 'category', { unique: false });
        ingStore.createIndex('sku', 'sku', { unique: false });
      }

      // 2. Finished Goods (Cold Storage) Store
      if (!db.objectStoreNames.contains('finished_goods')) {
        const fgStore = db.createObjectStore('finished_goods', { keyPath: 'id' });
        fgStore.createIndex('category', 'category', { unique: false });
        fgStore.createIndex('sku', 'sku', { unique: false });
      }

      // 3. WIP Batches Store
      if (!db.objectStoreNames.contains('wip_batches')) {
        const wipStore = db.createObjectStore('wip_batches', { keyPath: 'id' });
        wipStore.createIndex('status', 'status', { unique: false });
        wipStore.createIndex('batchNumber', 'batchNumber', { unique: false });
      }

      // 4. POS & Stock Transactions Store
      if (!db.objectStoreNames.contains('transactions')) {
        const txStore = db.createObjectStore('transactions', { keyPath: 'id' });
        txStore.createIndex('type', 'type', { unique: false });
      }

      // 5. Offline Sync Queue Store (for mutations while internet is disconnected)
      if (!db.objectStoreNames.contains('offline_sync_queue')) {
        db.createObjectStore('offline_sync_queue', { keyPath: 'id', autoIncrement: true });
      }

      // 6. Metadata Store (timestamps, status)
      if (!db.objectStoreNames.contains('metadata')) {
        db.createObjectStore('metadata', { keyPath: 'key' });
      }
    };
  });
}

/**
 * Cache current critical inventory snapshots into IndexedDB
 */
export async function cacheInventoryToIndexedDb(data: {
  ingredients: RawIngredient[];
  finishedGoods: FinishedGood[];
  wipBatches: WipBatch[];
  transactions?: StockTransaction[];
}): Promise<{ success: boolean; timestamp: string; count: number }> {
  try {
    const db = await openInventoryDb();
    const timestamp = new Date().toISOString();

    return new Promise((resolve, reject) => {
      const tx = db.transaction(
        ['raw_ingredients', 'finished_goods', 'wip_batches', 'transactions', 'metadata'],
        'readwrite'
      );

      const ingStore = tx.objectStore('raw_ingredients');
      const fgStore = tx.objectStore('finished_goods');
      const wipStore = tx.objectStore('wip_batches');
      const txStore = tx.objectStore('transactions');
      const metaStore = tx.objectStore('metadata');

      // Clear existing records and replace with fresh snapshot
      ingStore.clear();
      data.ingredients.forEach(item => ingStore.put(item));

      fgStore.clear();
      data.finishedGoods.forEach(item => fgStore.put(item));

      wipStore.clear();
      data.wipBatches.forEach(item => wipStore.put(item));

      if (data.transactions) {
        txStore.clear();
        data.transactions.forEach(item => txStore.put(item));
      }

      metaStore.put({ key: 'last_cached_at', value: timestamp });
      metaStore.put({
        key: 'cache_counts',
        value: {
          ingredients: data.ingredients.length,
          finished: data.finishedGoods.length,
          wip: data.wipBatches.length,
          transactions: data.transactions?.length || 0,
        },
      });

      tx.oncomplete = () => {
        const total =
          data.ingredients.length +
          data.finishedGoods.length +
          data.wipBatches.length +
          (data.transactions?.length || 0);
        resolve({ success: true, timestamp, count: total });
      };

      tx.onerror = () => {
        reject(tx.error);
      };
    });
  } catch (err) {
    console.error('Error caching inventory to IndexedDB:', err);
    return { success: false, timestamp: new Date().toISOString(), count: 0 };
  }
}

/**
 * Load cached inventory items from IndexedDB if running offline or restoring
 */
export async function loadCachedInventoryFromIndexedDb(): Promise<{
  ingredients: RawIngredient[] | null;
  finishedGoods: FinishedGood[] | null;
  wipBatches: WipBatch[] | null;
  transactions: StockTransaction[] | null;
  lastSynced: string | null;
}> {
  try {
    const db = await openInventoryDb();

    return new Promise((resolve, reject) => {
      const tx = db.transaction(
        ['raw_ingredients', 'finished_goods', 'wip_batches', 'transactions', 'metadata'],
        'readonly'
      );

      const ingRequest = tx.objectStore('raw_ingredients').getAll();
      const fgRequest = tx.objectStore('finished_goods').getAll();
      const wipRequest = tx.objectStore('wip_batches').getAll();
      const txRequest = tx.objectStore('transactions').getAll();
      const metaRequest = tx.objectStore('metadata').get('last_cached_at');

      tx.oncomplete = () => {
        const ingredients = ingRequest.result?.length > 0 ? ingRequest.result : null;
        const finishedGoods = fgRequest.result?.length > 0 ? fgRequest.result : null;
        const wipBatches = wipRequest.result?.length > 0 ? wipRequest.result : null;
        const transactions = txRequest.result?.length > 0 ? txRequest.result : null;
        const lastSynced = metaRequest.result?.value || null;

        resolve({
          ingredients,
          finishedGoods,
          wipBatches,
          transactions,
          lastSynced,
        });
      };

      tx.onerror = () => {
        reject(tx.error);
      };
    });
  } catch (err) {
    console.warn('Unable to read cached inventory from IndexedDB:', err);
    return {
      ingredients: null,
      finishedGoods: null,
      wipBatches: null,
      transactions: null,
      lastSynced: null,
    };
  }
}

/**
 * Queue an offline mutation (e.g. stock deduction or new batch) when internet is unavailable
 */
export async function enqueueOfflineAction(
  item: Omit<OfflineSyncQueueItem, 'id' | 'timestamp' | 'synced'>
): Promise<number> {
  try {
    const db = await openInventoryDb();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(['offline_sync_queue'], 'readwrite');
      const store = tx.objectStore('offline_sync_queue');
      const queueItem: OfflineSyncQueueItem = {
        ...item,
        timestamp: new Date().toISOString(),
        synced: false,
      };

      const request = store.add(queueItem);
      request.onsuccess = () => resolve(Number(request.result));
      request.onerror = () => reject(request.error);
    });
  } catch (err) {
    console.error('Failed to enqueue offline action:', err);
    return -1;
  }
}

/**
 * Retrieve all pending offline actions in the sync queue
 */
export async function getPendingOfflineActions(): Promise<OfflineSyncQueueItem[]> {
  try {
    const db = await openInventoryDb();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(['offline_sync_queue'], 'readonly');
      const store = tx.objectStore('offline_sync_queue');
      const request = store.getAll();

      request.onsuccess = () => resolve(request.result || []);
      request.onerror = () => reject(request.error);
    });
  } catch {
    return [];
  }
}

/**
 * Clear queued actions once successfully synced to the cloud/server
 */
export async function clearOfflineQueue(): Promise<void> {
  try {
    const db = await openInventoryDb();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(['offline_sync_queue'], 'readwrite');
      const store = tx.objectStore('offline_sync_queue');
      const request = store.clear();

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  } catch (err) {
    console.error('Failed to clear offline sync queue:', err);
  }
}

/**
 * Get comprehensive cache health and item counts from IndexedDB
 */
export async function getInventoryDbStats(): Promise<InventoryDbStats> {
  try {
    const db = await openInventoryDb();

    return new Promise((resolve) => {
      const tx = db.transaction(
        ['raw_ingredients', 'finished_goods', 'wip_batches', 'transactions', 'offline_sync_queue', 'metadata'],
        'readonly'
      );

      const ingCount = tx.objectStore('raw_ingredients').count();
      const fgCount = tx.objectStore('finished_goods').count();
      const wipCount = tx.objectStore('wip_batches').count();
      const txCount = tx.objectStore('transactions').count();
      const queueCount = tx.objectStore('offline_sync_queue').count();
      const metaReq = tx.objectStore('metadata').get('last_cached_at');

      tx.oncomplete = () => {
        resolve({
          ingredientCount: ingCount.result || 0,
          finishedCount: fgCount.result || 0,
          wipCount: wipCount.result || 0,
          transactionCount: txCount.result || 0,
          queueCount: queueCount.result || 0,
          lastSynced: metaReq.result?.value || null,
          dbReady: true,
        });
      };

      tx.onerror = () => {
        resolve({
          ingredientCount: 0,
          finishedCount: 0,
          wipCount: 0,
          transactionCount: 0,
          queueCount: 0,
          lastSynced: null,
          dbReady: false,
        });
      };
    });
  } catch {
    return {
      ingredientCount: 0,
      finishedCount: 0,
      wipCount: 0,
      transactionCount: 0,
      queueCount: 0,
      lastSynced: null,
      dbReady: false,
    };
  }
}
