import { Dispatch, SetStateAction, useEffect, useRef } from 'react';
import {
  enqueueOfflineAction,
  getPendingOfflineActions,
  removeOfflineAction,
  removePendingSampleWrites,
  OfflineSyncQueueItem,
} from '../services/inventoryDb';
import { SqlConnectCollection, SqlConnectEntity } from '../services/dairySyncCloud';
import { SAMPLE_RECORD_IDS } from '../data/initialData';

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
  clearRowsBeforeTimestamp?: number;
  removeMatchingRows?: (row: T) => boolean;
}

const serializeRows = <T extends { id: string }>(rows: T[]) =>
  new Map(rows.map(row => [row.id, JSON.stringify(row)]));

const mergeRowsChangedDuringSync = <T extends { id: string }>(
  cloudRows: T[],
  rowsAtStart: Map<string, string>,
  currentRows: T[]
) => {
  const currentRowsById = new Map(currentRows.map(row => [row.id, row]));
  const currentSerialized = serializeRows(currentRows);
  const mergedRowsById = new Map(cloudRows.map(row => [row.id, row]));

  for (const [id, row] of currentRowsById) {
    if (rowsAtStart.get(id) !== currentSerialized.get(id)) {
      mergedRowsById.set(id, row);
    }
  }
  for (const id of rowsAtStart.keys()) {
    if (!currentRowsById.has(id)) mergedRowsById.delete(id);
  }

  return [...mergedRowsById.values()];
};

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
  clearRowsBeforeTimestamp,
  removeMatchingRows,
}: UseSqlConnectCollectionOptions<T>) {
  const rowsRef = useRef(rows);
  const syncedRowsRef = useRef<Map<string, string> | null>(null);
  const locallyDeletedIdsRef = useRef(new Set<string>());
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

  const removeSampleRows = async (collectionRows: T[]) => {
    if (!canSeed) return collectionRows;
    const sampleIds = SAMPLE_RECORD_IDS[entity] ?? [];
    if (sampleIds.length === 0) return collectionRows;

    await removePendingSampleWrites(entity, sampleIds);
    const sampleIdSet = new Set(sampleIds);
    const sampleRows = collectionRows.filter(row => sampleIdSet.has(row.id));
    await Promise.all(sampleRows.map(async row => {
      try {
        await adapter.remove(row.id);
      } catch (error) {
        await enqueueOfflineAction({
          entity,
          action: 'SQL_DELETE',
          payload: { id: row.id },
          userEmail,
          userUid,
        });
        console.warn(`Queued deletion of sample ${entity} record for SQL Connect retry:`, error);
      }
    }));
    return collectionRows.filter(row => !sampleIdSet.has(row.id));
  };

  const removeTargetedRows = async (collectionRows: T[]) => {
    if (!canSeed || !removeMatchingRows) return collectionRows;
    const targetedRows = collectionRows.filter(removeMatchingRows);
    if (targetedRows.length === 0) return collectionRows;

    const targetedIds = targetedRows.map(row => row.id);
    await removePendingSampleWrites(entity, targetedIds);
    await Promise.all(targetedRows.map(async row => {
      try {
        await adapter.remove(row.id);
      } catch (error) {
        await enqueueOfflineAction({
          entity,
          action: 'SQL_DELETE',
          payload: { id: row.id },
          userEmail,
          userUid,
        });
        console.warn(`Queued targeted ${entity} deletion for SQL Connect retry:`, error);
      }
    }));
    const targetedIdSet = new Set(targetedIds);
    return collectionRows.filter(row => !targetedIdSet.has(row.id));
  };

  const isBeforeClearTimestamp = (row: T) => {
    if (clearRowsBeforeTimestamp === undefined) return false;
    const timestamp = (row as T & { timestamp?: unknown }).timestamp;
    if (typeof timestamp !== 'string') {
      console.warn(`Cannot evaluate historical ${entity} row without a timestamp.`);
      return false;
    }
    const normalizedTimestamp = timestamp.endsWith(' PST')
      ? `${timestamp.slice(0, -4)} GMT+0800`
      : timestamp;
    const parsedTimestamp = Date.parse(normalizedTimestamp);
    if (!Number.isFinite(parsedTimestamp)) {
      console.warn(`Cannot parse historical ${entity} timestamp; preserving the row:`, timestamp);
      return false;
    }
    return parsedTimestamp <= clearRowsBeforeTimestamp;
  };

  const removeHistoricalRows = async (collectionRows: T[]) => {
    if (clearRowsBeforeTimestamp === undefined) return collectionRows;
    const historicalRows = collectionRows.filter(isBeforeClearTimestamp);
    await Promise.all(historicalRows.map(async row => {
      try {
        await adapter.remove(row.id);
      } catch (error) {
        await enqueueOfflineAction({
          entity,
          action: 'SQL_DELETE',
          payload: { id: row.id },
          userEmail,
          userUid,
        });
        console.warn(`Queued deletion of historical ${entity} record for SQL Connect retry:`, error);
      }
    }));
    const historicalIds = new Set(historicalRows.map(row => row.id));
    const pendingWrites = (await getPendingOfflineActions()).filter(item =>
      item.entity === entity &&
      item.action !== 'SQL_DELETE' &&
      item.action !== 'DELETE_RAW_INGREDIENT' &&
      isBeforeClearTimestamp(item.payload as T)
    );
    await Promise.all(pendingWrites.map(item => item.id === undefined
      ? Promise.resolve()
      : removeOfflineAction(item.id)
    ));
    return collectionRows.filter(row => !historicalIds.has(row.id));
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
      const rowsAtStart = serializeRows(rowsRef.current);
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
        let cloudRows = await removeHistoricalRows(await removeSampleRows(await removeTargetedRows(await adapter.fetch())));
        cloudRows = await preserveQueuedRows(cloudRows);
        if (!active) return;

        const pending = await getPendingOfflineActions();
        const hasPendingForCollection = pending.some(item => item.entity === entity);
        const seedRows = rowsRef.current.filter(row =>
          !isBeforeClearTimestamp(row) &&
          !removeMatchingRows?.(row) &&
          !(SAMPLE_RECORD_IDS[entity] ?? []).includes(row.id)
        );
        if (canSeed && cloudRows.length === 0 && seedRows.length > 0 && !hasPendingForCollection) {
          let seedFailed = false;
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
          cloudRows = await preserveQueuedRows(await removeHistoricalRows(await removeSampleRows(await removeTargetedRows(await adapter.fetch()))));
          if (seedFailed) statusHandlerRef.current(entity, 'offline');
        } else if (!canSeed && cloudRows.length === 0 && rowsRef.current.length > 0) {
          cloudRows = rowsRef.current;
        }
        if (!active) return;

        const mergedRows = mergeRowsChangedDuringSync(cloudRows, rowsAtStart, rowsRef.current);
        syncedRowsRef.current = serializeRows(cloudRows);
        setRows(mergedRows);
        stopSubscription = adapter.subscribe(remoteRows => {
          const withoutLocallyDeletedRows = remoteRows.filter(row => !locallyDeletedIdsRef.current.has(row.id));
          void removeTargetedRows(withoutLocallyDeletedRows).then(persistedRows => removeSampleRows(persistedRows)).then(persistedRows => removeHistoricalRows(persistedRows)).then(persistedRows => preserveQueuedRows(persistedRows)).then(mergedRows => {
            if (!active) return;
            if (!canSeed && mergedRows.length === 0 && rowsRef.current.length > 0) {
              mergedRows = rowsRef.current;
              syncedRowsRef.current = serializeRows(mergedRows);
              setRows(mergedRows);
              return;
            }
            const currentRows = mergeRowsChangedDuringSync(
              mergedRows,
              syncedRowsRef.current ?? new Map(),
              rowsRef.current
            );
            syncedRowsRef.current = serializeRows(mergedRows);
            setRows(currentRows);
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
  }, [enabled, readEnabled, canSeed, online, adapter, entity, setRows, userEmail, userUid, clearRowsBeforeTimestamp, removeMatchingRows]);

  useEffect(() => {
    const previous = syncedRowsRef.current;
    if (!enabled || !previous) return;

    const current = serializeRows(rows);
    const changed = rows.filter(row => previous.get(row.id) !== current.get(row.id));
    const removed = [...previous.keys()].filter(id => !current.has(id));
    if (changed.length === 0 && removed.length === 0) return;
    removed.forEach(id => locallyDeletedIdsRef.current.add(id));
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