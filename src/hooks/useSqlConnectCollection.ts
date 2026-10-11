import { Dispatch, SetStateAction, useEffect, useRef } from 'react';
import {
  enqueueOfflineAction,
  getPendingOfflineActions,
  OfflineSyncQueueItem,
} from '../services/inventoryDb';
import { SqlConnectCollection, SqlConnectEntity } from '../services/dairySyncCloud';

export type SqlCollectionStatus = 'synced' | 'syncing' | 'offline';

interface UseSqlConnectCollectionOptions<T extends { id: string }> {
  enabled: boolean;
  readEnabled: boolean;
  canSeed: boolean;
  rows: T[];
  setRows: Dispatch<SetStateAction<T[]>>;
  adapter: SqlConnectCollection<T>;
  entity: SqlConnectEntity;
  userEmail?: string;
  userUid?: string;
  online: boolean;
  onStatus: (entity: SqlConnectEntity, status: SqlCollectionStatus) => void;
}

const serializeRows = <T extends { id: string }>(rows: T[]) =>
  new Map(rows.map(row => [row.id, JSON.stringify(row)]));

export function useSqlConnectCollection<T extends { id: string }>({
  enabled,
  readEnabled,
  canSeed,
  rows,
  setRows,
  adapter,
  entity,
  userEmail,
  userUid,
  online,
  onStatus,
}: UseSqlConnectCollectionOptions<T>) {
  const rowsRef = useRef(rows);
  const syncedRowsRef = useRef<Map<string, string> | null>(null);
  const writeChainRef = useRef(Promise.resolve());
  const statusHandlerRef = useRef(onStatus);
  rowsRef.current = rows;
  statusHandlerRef.current = onStatus;

  const preserveQueuedRows = async (cloudRows: T[]) => {
    const pending = await getPendingOfflineActions();
    const rowsById = new Map(cloudRows.map(row => [row.id, row]));
    for (const item of pending) {
      if (item.entity !== entity) continue;
      if (item.userUid && userUid && item.userUid !== userUid) continue;
      if (!item.userUid && item.userEmail && userEmail && item.userEmail.toLowerCase() !== userEmail.toLowerCase()) continue;

      const payload = item.payload as { id?: unknown };
      if (typeof payload?.id !== 'string') continue;
      if (item.action === 'SQL_DELETE' || item.action === 'DELETE_RAW_INGREDIENT') {
        rowsById.delete(payload.id);
      } else if (item.action === 'SQL_UPSERT' || item.action === 'SQL_SEED' || item.action.startsWith('CREATE_') || item.action === 'UPSERT_STOCK_TRANSACTION' || item.action === 'UPSERT_RAW_INGREDIENT') {
        rowsById.set(payload.id, item.payload as T);
      } else if (entity === 'ingredient' && item.action === 'UPDATE_INGREDIENT_STOCK') {
        const localRow = rowsRef.current.find(row => row.id === payload.id) as (T & { currentStock?: number; expiryDate?: string }) | undefined;
        const stockUpdate = item.payload as { newStock?: number; expiryDate?: string };
        if (localRow) {
          rowsById.set(payload.id, {
            ...localRow,
            currentStock: stockUpdate.newStock ?? localRow.currentStock,
            expiryDate: stockUpdate.expiryDate ?? localRow.expiryDate,
          } as T);
        }
      }
    }
    return [...rowsById.values()];
  };

  useEffect(() => {
    if (!enabled) {
      syncedRowsRef.current = null;
      return;
    }

    let active = true;
    let stopSubscription = () => {};
    syncedRowsRef.current = null;

    const initialize = async () => {
      if (!online) {
        syncedRowsRef.current = serializeRows(rowsRef.current);
        statusHandlerRef.current(entity, 'offline');
        return;
      }
      if (!readEnabled) {
        syncedRowsRef.current = serializeRows(rowsRef.current);
        const pendingAfterInitialization = await getPendingOfflineActions();
        statusHandlerRef.current(
          entity,
          pendingAfterInitialization.some(item => item.entity === entity) ? 'offline' : 'synced'
        );
        return;
      }

      statusHandlerRef.current(entity, 'syncing');
      try {
        let cloudRows = await adapter.fetch();
        cloudRows = await preserveQueuedRows(cloudRows);
        if (!active) return;

        const pending = await getPendingOfflineActions();
        const hasPendingForCollection = pending.some(item => item.entity === entity);
        if (canSeed && cloudRows.length === 0 && rowsRef.current.length > 0 && !hasPendingForCollection) {
          let seedFailed = false;
          const seedRows = rowsRef.current;
          for (let index = 0; index < seedRows.length; index += 10) {
            await Promise.all(seedRows.slice(index, index + 10).map(async row => {
              try {
                await (adapter.seed ?? adapter.save)(row);
              } catch (error) {
                seedFailed = true;
                await enqueueOfflineAction({
                  entity,
                  action: 'SQL_SEED',
                  payload: row,
                  userEmail,
                  userUid,
                });
                console.warn(`Queued initial ${entity} record for SQL Connect retry:`, error);
              }
            }));
          }
          cloudRows = await preserveQueuedRows(await adapter.fetch());
          if (seedFailed) statusHandlerRef.current(entity, 'offline');
        } else if (!canSeed && cloudRows.length === 0 && rowsRef.current.length > 0) {
          cloudRows = rowsRef.current;
        }
        if (!active) return;

        syncedRowsRef.current = serializeRows(cloudRows);
        setRows(cloudRows);
        stopSubscription = adapter.subscribe(remoteRows => {
          void preserveQueuedRows(remoteRows).then(mergedRows => {
            if (!active) return;
            if (!canSeed && mergedRows.length === 0 && rowsRef.current.length > 0) {
              mergedRows = rowsRef.current;
            }
            syncedRowsRef.current = serializeRows(mergedRows);
            setRows(mergedRows);
          }).catch(error => {
            console.warn(`Could not merge queued ${entity} changes with SQL Connect:`, error);
          });
        }, error => {
          console.error(`SQL Connect subscription failed for ${entity}:`, error);
          if (active) statusHandlerRef.current(entity, 'offline');
        });
        statusHandlerRef.current(entity, 'synced');
      } catch (error) {
        console.error(`SQL Connect initialization failed for ${entity}:`, error);
        if (active) {
          syncedRowsRef.current = serializeRows(rowsRef.current);
          statusHandlerRef.current(entity, 'offline');
        }
      }
    };

    void initialize();
    return () => {
      active = false;
      stopSubscription();
      syncedRowsRef.current = null;
    };
  }, [enabled, readEnabled, canSeed, online, adapter, entity, setRows, userEmail, userUid]);

  useEffect(() => {
    const previous = syncedRowsRef.current;
    if (!enabled || !previous) return;

    const current = serializeRows(rows);
    const changed = rows.filter(row => previous.get(row.id) !== current.get(row.id));
    const removed = [...previous.keys()].filter(id => !current.has(id));
    if (changed.length === 0 && removed.length === 0) return;
    syncedRowsRef.current = current;
    statusHandlerRef.current(entity, 'syncing');

    writeChainRef.current = writeChainRef.current.then(async () => {
      let failed = false;
      for (const row of changed) {
        try {
          await adapter.save(row);
        } catch (error) {
          failed = true;
          await enqueueOfflineAction({
            entity,
            action: 'SQL_UPSERT',
            payload: row,
            userEmail,
            userUid,
          });
          console.warn(`Queued ${entity} update for SQL Connect retry:`, error);
        }
      }
      for (const id of removed) {
        try {
          await adapter.remove(id);
        } catch (error) {
          failed = true;
          await enqueueOfflineAction({
            entity,
            action: 'SQL_DELETE',
            payload: { id },
            userEmail,
            userUid,
          });
          console.warn(`Queued ${entity} deletion for SQL Connect retry:`, error);
        }
      }

      const pending = await getPendingOfflineActions();
      const entityStillPending = pending.some(item => item.entity === entity);
      statusHandlerRef.current(entity, failed || entityStillPending ? 'offline' : 'synced');
    });
  }, [enabled, rows, adapter, entity, userEmail, userUid]);
}