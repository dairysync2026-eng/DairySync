# Generated TypeScript README
This README will guide you through the process of using the generated JavaScript SDK package for the connector `dairysync`. It will also provide examples on how to use your generated SDK to call your Data Connect queries and mutations.

***NOTE:** This README is generated alongside the generated SDK. If you make changes to this file, they will be overwritten when the SDK is regenerated.*

# Table of Contents
- [**Overview**](#generated-javascript-readme)
- [**Accessing the connector**](#accessing-the-connector)
  - [*Connecting to the local Emulator*](#connecting-to-the-local-emulator)
- [**Queries**](#queries)
  - [*ListRawIngredients*](#listrawingredients)
  - [*ListStockTransactions*](#liststocktransactions)
  - [*ListPmoInventoryPeriods*](#listpmoinventoryperiods)
  - [*ListFinishedGoods*](#listfinishedgoods)
  - [*ListWipBatches*](#listwipbatches)
  - [*ListCommitments*](#listcommitments)
  - [*ListSystemAlerts*](#listsystemalerts)
  - [*ListIsoRatings*](#listisoratings)
  - [*ListAuditLogEntries*](#listauditlogentries)
  - [*ListUserProfiles*](#listuserprofiles)
- [**Mutations**](#mutations)
  - [*SeedStockTransaction*](#seedstocktransaction)
  - [*SeedIsoRating*](#seedisorating)
  - [*SeedAuditLogEntry*](#seedauditlogentry)
  - [*UpsertRawIngredient*](#upsertrawingredient)
  - [*DeleteRawIngredient*](#deleterawingredient)
  - [*UpsertStockTransaction*](#upsertstocktransaction)
  - [*DeleteStockTransaction*](#deletestocktransaction)
  - [*UpdateFinishedGoodRecipe*](#updatefinishedgoodrecipe)
  - [*UpsertPmoInventoryPeriod*](#upsertpmoinventoryperiod)
  - [*UpsertFinishedGood*](#upsertfinishedgood)
  - [*SetRetailFinishedGoodStock*](#setretailfinishedgoodstock)
  - [*DeleteFinishedGood*](#deletefinishedgood)
  - [*UpsertWipBatch*](#upsertwipbatch)
  - [*DeleteWipBatch*](#deletewipbatch)
  - [*UpsertCommitment*](#upsertcommitment)
  - [*DeleteCommitment*](#deletecommitment)
  - [*UpsertSystemAlert*](#upsertsystemalert)
  - [*DeleteSystemAlert*](#deletesystemalert)
  - [*UpsertIsoRating*](#upsertisorating)
  - [*DeleteIsoRating*](#deleteisorating)
  - [*UpsertAuditLogEntry*](#upsertauditlogentry)
  - [*DeleteAuditLogEntry*](#deleteauditlogentry)
  - [*UpsertUserProfile*](#upsertuserprofile)
  - [*UpdateOwnUserProfile*](#updateownuserprofile)
  - [*DeleteUserProfile*](#deleteuserprofile)

# Accessing the connector
A connector is a collection of Queries and Mutations. One SDK is generated for each connector - this SDK is generated for the connector `dairysync`. You can find more information about connectors in the [Data Connect documentation](https://firebase.google.com/docs/data-connect#how-does).

You can use this generated SDK by importing from the package `@dataconnect/dairysync-generated` as shown below. Both CommonJS and ESM imports are supported.

You can also follow the instructions from the [Data Connect documentation](https://firebase.google.com/docs/data-connect/web-sdk#set-client).

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig } from '@dataconnect/dairysync-generated';

const dataConnect = getDataConnect(connectorConfig);
```

## Connecting to the local Emulator
By default, the connector will connect to the production service.

To connect to the emulator, you can use the following code.
You can also follow the emulator instructions from the [Data Connect documentation](https://firebase.google.com/docs/data-connect/web-sdk#instrument-clients).

```typescript
import { connectDataConnectEmulator, getDataConnect } from 'firebase/data-connect';
import { connectorConfig } from '@dataconnect/dairysync-generated';

const dataConnect = getDataConnect(connectorConfig);
connectDataConnectEmulator(dataConnect, 'localhost', 9399);
```

After it's initialized, you can call your Data Connect [queries](#queries) and [mutations](#mutations) from your generated SDK.

# Queries

There are two ways to execute a Data Connect Query using the generated Web SDK:
- Using a Query Reference function, which returns a `QueryRef`
  - The `QueryRef` can be used as an argument to `executeQuery()`, which will execute the Query and return a `QueryPromise`
- Using an action shortcut function, which returns a `QueryPromise`
  - Calling the action shortcut function will execute the Query and return a `QueryPromise`

The following is true for both the action shortcut function and the `QueryRef` function:
- The `QueryPromise` returned will resolve to the result of the Query once it has finished executing
- If the Query accepts arguments, both the action shortcut function and the `QueryRef` function accept a single argument: an object that contains all the required variables (and the optional variables) for the Query
- Both functions can be called with or without passing in a `DataConnect` instance as an argument. If no `DataConnect` argument is passed in, then the generated SDK will call `getDataConnect(connectorConfig)` behind the scenes for you.

Below are examples of how to use the `dairysync` connector's generated functions to execute each query. You can also follow the examples from the [Data Connect documentation](https://firebase.google.com/docs/data-connect/web-sdk#using-queries).

## ListRawIngredients
You can execute the `ListRawIngredients` query using the following action shortcut function, or by calling `executeQuery()` after calling the following `QueryRef` function, both of which are defined in [dairysync/index.d.ts](./index.d.ts):
```typescript
listRawIngredients(options?: ExecuteQueryOptions): QueryPromise<ListRawIngredientsData, undefined>;

interface ListRawIngredientsRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (): QueryRef<ListRawIngredientsData, undefined>;
}
export const listRawIngredientsRef: ListRawIngredientsRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `QueryRef` function.
```typescript
listRawIngredients(dc: DataConnect, options?: ExecuteQueryOptions): QueryPromise<ListRawIngredientsData, undefined>;

interface ListRawIngredientsRef {
  ...
  (dc: DataConnect): QueryRef<ListRawIngredientsData, undefined>;
}
export const listRawIngredientsRef: ListRawIngredientsRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the listRawIngredientsRef:
```typescript
const name = listRawIngredientsRef.operationName;
console.log(name);
```

### Variables
The `ListRawIngredients` query has no variables.
### Return Type
Recall that executing the `ListRawIngredients` query returns a `QueryPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `ListRawIngredientsData`, which is defined in [dairysync/index.d.ts](./index.d.ts). It has the following fields:
```typescript
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
```
### Using `ListRawIngredients`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, listRawIngredients } from '@dataconnect/dairysync-generated';


// Call the `listRawIngredients()` function to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await listRawIngredients();

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await listRawIngredients(dataConnect);

console.log(data.rawIngredients);

// Or, you can use the `Promise` API.
listRawIngredients().then((response) => {
  const data = response.data;
  console.log(data.rawIngredients);
});
```

### Using `ListRawIngredients`'s `QueryRef` function

```typescript
import { getDataConnect, executeQuery } from 'firebase/data-connect';
import { connectorConfig, listRawIngredientsRef } from '@dataconnect/dairysync-generated';


// Call the `listRawIngredientsRef()` function to get a reference to the query.
const ref = listRawIngredientsRef();

// You can also pass in a `DataConnect` instance to the `QueryRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = listRawIngredientsRef(dataConnect);

// Call `executeQuery()` on the reference to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeQuery(ref);

console.log(data.rawIngredients);

// Or, you can use the `Promise` API.
executeQuery(ref).then((response) => {
  const data = response.data;
  console.log(data.rawIngredients);
});
```

## ListStockTransactions
You can execute the `ListStockTransactions` query using the following action shortcut function, or by calling `executeQuery()` after calling the following `QueryRef` function, both of which are defined in [dairysync/index.d.ts](./index.d.ts):
```typescript
listStockTransactions(options?: ExecuteQueryOptions): QueryPromise<ListStockTransactionsData, undefined>;

interface ListStockTransactionsRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (): QueryRef<ListStockTransactionsData, undefined>;
}
export const listStockTransactionsRef: ListStockTransactionsRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `QueryRef` function.
```typescript
listStockTransactions(dc: DataConnect, options?: ExecuteQueryOptions): QueryPromise<ListStockTransactionsData, undefined>;

interface ListStockTransactionsRef {
  ...
  (dc: DataConnect): QueryRef<ListStockTransactionsData, undefined>;
}
export const listStockTransactionsRef: ListStockTransactionsRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the listStockTransactionsRef:
```typescript
const name = listStockTransactionsRef.operationName;
console.log(name);
```

### Variables
The `ListStockTransactions` query has no variables.
### Return Type
Recall that executing the `ListStockTransactions` query returns a `QueryPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `ListStockTransactionsData`, which is defined in [dairysync/index.d.ts](./index.d.ts). It has the following fields:
```typescript
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
```
### Using `ListStockTransactions`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, listStockTransactions } from '@dataconnect/dairysync-generated';


// Call the `listStockTransactions()` function to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await listStockTransactions();

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await listStockTransactions(dataConnect);

console.log(data.stockTransactions);

// Or, you can use the `Promise` API.
listStockTransactions().then((response) => {
  const data = response.data;
  console.log(data.stockTransactions);
});
```

### Using `ListStockTransactions`'s `QueryRef` function

```typescript
import { getDataConnect, executeQuery } from 'firebase/data-connect';
import { connectorConfig, listStockTransactionsRef } from '@dataconnect/dairysync-generated';


// Call the `listStockTransactionsRef()` function to get a reference to the query.
const ref = listStockTransactionsRef();

// You can also pass in a `DataConnect` instance to the `QueryRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = listStockTransactionsRef(dataConnect);

// Call `executeQuery()` on the reference to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeQuery(ref);

console.log(data.stockTransactions);

// Or, you can use the `Promise` API.
executeQuery(ref).then((response) => {
  const data = response.data;
  console.log(data.stockTransactions);
});
```

## ListPmoInventoryPeriods
You can execute the `ListPmoInventoryPeriods` query using the following action shortcut function, or by calling `executeQuery()` after calling the following `QueryRef` function, both of which are defined in [dairysync/index.d.ts](./index.d.ts):
```typescript
listPmoInventoryPeriods(options?: ExecuteQueryOptions): QueryPromise<ListPmoInventoryPeriodsData, undefined>;

interface ListPmoInventoryPeriodsRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (): QueryRef<ListPmoInventoryPeriodsData, undefined>;
}
export const listPmoInventoryPeriodsRef: ListPmoInventoryPeriodsRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `QueryRef` function.
```typescript
listPmoInventoryPeriods(dc: DataConnect, options?: ExecuteQueryOptions): QueryPromise<ListPmoInventoryPeriodsData, undefined>;

interface ListPmoInventoryPeriodsRef {
  ...
  (dc: DataConnect): QueryRef<ListPmoInventoryPeriodsData, undefined>;
}
export const listPmoInventoryPeriodsRef: ListPmoInventoryPeriodsRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the listPmoInventoryPeriodsRef:
```typescript
const name = listPmoInventoryPeriodsRef.operationName;
console.log(name);
```

### Variables
The `ListPmoInventoryPeriods` query has no variables.
### Return Type
Recall that executing the `ListPmoInventoryPeriods` query returns a `QueryPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `ListPmoInventoryPeriodsData`, which is defined in [dairysync/index.d.ts](./index.d.ts). It has the following fields:
```typescript
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
```
### Using `ListPmoInventoryPeriods`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, listPmoInventoryPeriods } from '@dataconnect/dairysync-generated';


// Call the `listPmoInventoryPeriods()` function to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await listPmoInventoryPeriods();

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await listPmoInventoryPeriods(dataConnect);

console.log(data.pmoInventoryPeriods);

// Or, you can use the `Promise` API.
listPmoInventoryPeriods().then((response) => {
  const data = response.data;
  console.log(data.pmoInventoryPeriods);
});
```

### Using `ListPmoInventoryPeriods`'s `QueryRef` function

```typescript
import { getDataConnect, executeQuery } from 'firebase/data-connect';
import { connectorConfig, listPmoInventoryPeriodsRef } from '@dataconnect/dairysync-generated';


// Call the `listPmoInventoryPeriodsRef()` function to get a reference to the query.
const ref = listPmoInventoryPeriodsRef();

// You can also pass in a `DataConnect` instance to the `QueryRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = listPmoInventoryPeriodsRef(dataConnect);

// Call `executeQuery()` on the reference to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeQuery(ref);

console.log(data.pmoInventoryPeriods);

// Or, you can use the `Promise` API.
executeQuery(ref).then((response) => {
  const data = response.data;
  console.log(data.pmoInventoryPeriods);
});
```

## ListFinishedGoods
You can execute the `ListFinishedGoods` query using the following action shortcut function, or by calling `executeQuery()` after calling the following `QueryRef` function, both of which are defined in [dairysync/index.d.ts](./index.d.ts):
```typescript
listFinishedGoods(options?: ExecuteQueryOptions): QueryPromise<ListFinishedGoodsData, undefined>;

interface ListFinishedGoodsRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (): QueryRef<ListFinishedGoodsData, undefined>;
}
export const listFinishedGoodsRef: ListFinishedGoodsRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `QueryRef` function.
```typescript
listFinishedGoods(dc: DataConnect, options?: ExecuteQueryOptions): QueryPromise<ListFinishedGoodsData, undefined>;

interface ListFinishedGoodsRef {
  ...
  (dc: DataConnect): QueryRef<ListFinishedGoodsData, undefined>;
}
export const listFinishedGoodsRef: ListFinishedGoodsRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the listFinishedGoodsRef:
```typescript
const name = listFinishedGoodsRef.operationName;
console.log(name);
```

### Variables
The `ListFinishedGoods` query has no variables.
### Return Type
Recall that executing the `ListFinishedGoods` query returns a `QueryPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `ListFinishedGoodsData`, which is defined in [dairysync/index.d.ts](./index.d.ts). It has the following fields:
```typescript
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
```
### Using `ListFinishedGoods`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, listFinishedGoods } from '@dataconnect/dairysync-generated';


// Call the `listFinishedGoods()` function to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await listFinishedGoods();

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await listFinishedGoods(dataConnect);

console.log(data.finishedGoods);

// Or, you can use the `Promise` API.
listFinishedGoods().then((response) => {
  const data = response.data;
  console.log(data.finishedGoods);
});
```

### Using `ListFinishedGoods`'s `QueryRef` function

```typescript
import { getDataConnect, executeQuery } from 'firebase/data-connect';
import { connectorConfig, listFinishedGoodsRef } from '@dataconnect/dairysync-generated';


// Call the `listFinishedGoodsRef()` function to get a reference to the query.
const ref = listFinishedGoodsRef();

// You can also pass in a `DataConnect` instance to the `QueryRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = listFinishedGoodsRef(dataConnect);

// Call `executeQuery()` on the reference to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeQuery(ref);

console.log(data.finishedGoods);

// Or, you can use the `Promise` API.
executeQuery(ref).then((response) => {
  const data = response.data;
  console.log(data.finishedGoods);
});
```

## ListWipBatches
You can execute the `ListWipBatches` query using the following action shortcut function, or by calling `executeQuery()` after calling the following `QueryRef` function, both of which are defined in [dairysync/index.d.ts](./index.d.ts):
```typescript
listWipBatches(options?: ExecuteQueryOptions): QueryPromise<ListWipBatchesData, undefined>;

interface ListWipBatchesRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (): QueryRef<ListWipBatchesData, undefined>;
}
export const listWipBatchesRef: ListWipBatchesRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `QueryRef` function.
```typescript
listWipBatches(dc: DataConnect, options?: ExecuteQueryOptions): QueryPromise<ListWipBatchesData, undefined>;

interface ListWipBatchesRef {
  ...
  (dc: DataConnect): QueryRef<ListWipBatchesData, undefined>;
}
export const listWipBatchesRef: ListWipBatchesRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the listWipBatchesRef:
```typescript
const name = listWipBatchesRef.operationName;
console.log(name);
```

### Variables
The `ListWipBatches` query has no variables.
### Return Type
Recall that executing the `ListWipBatches` query returns a `QueryPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `ListWipBatchesData`, which is defined in [dairysync/index.d.ts](./index.d.ts). It has the following fields:
```typescript
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
```
### Using `ListWipBatches`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, listWipBatches } from '@dataconnect/dairysync-generated';


// Call the `listWipBatches()` function to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await listWipBatches();

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await listWipBatches(dataConnect);

console.log(data.wipBatches);

// Or, you can use the `Promise` API.
listWipBatches().then((response) => {
  const data = response.data;
  console.log(data.wipBatches);
});
```

### Using `ListWipBatches`'s `QueryRef` function

```typescript
import { getDataConnect, executeQuery } from 'firebase/data-connect';
import { connectorConfig, listWipBatchesRef } from '@dataconnect/dairysync-generated';


// Call the `listWipBatchesRef()` function to get a reference to the query.
const ref = listWipBatchesRef();

// You can also pass in a `DataConnect` instance to the `QueryRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = listWipBatchesRef(dataConnect);

// Call `executeQuery()` on the reference to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeQuery(ref);

console.log(data.wipBatches);

// Or, you can use the `Promise` API.
executeQuery(ref).then((response) => {
  const data = response.data;
  console.log(data.wipBatches);
});
```

## ListCommitments
You can execute the `ListCommitments` query using the following action shortcut function, or by calling `executeQuery()` after calling the following `QueryRef` function, both of which are defined in [dairysync/index.d.ts](./index.d.ts):
```typescript
listCommitments(options?: ExecuteQueryOptions): QueryPromise<ListCommitmentsData, undefined>;

interface ListCommitmentsRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (): QueryRef<ListCommitmentsData, undefined>;
}
export const listCommitmentsRef: ListCommitmentsRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `QueryRef` function.
```typescript
listCommitments(dc: DataConnect, options?: ExecuteQueryOptions): QueryPromise<ListCommitmentsData, undefined>;

interface ListCommitmentsRef {
  ...
  (dc: DataConnect): QueryRef<ListCommitmentsData, undefined>;
}
export const listCommitmentsRef: ListCommitmentsRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the listCommitmentsRef:
```typescript
const name = listCommitmentsRef.operationName;
console.log(name);
```

### Variables
The `ListCommitments` query has no variables.
### Return Type
Recall that executing the `ListCommitments` query returns a `QueryPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `ListCommitmentsData`, which is defined in [dairysync/index.d.ts](./index.d.ts). It has the following fields:
```typescript
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
```
### Using `ListCommitments`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, listCommitments } from '@dataconnect/dairysync-generated';


// Call the `listCommitments()` function to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await listCommitments();

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await listCommitments(dataConnect);

console.log(data.supplyDemandCommitments);

// Or, you can use the `Promise` API.
listCommitments().then((response) => {
  const data = response.data;
  console.log(data.supplyDemandCommitments);
});
```

### Using `ListCommitments`'s `QueryRef` function

```typescript
import { getDataConnect, executeQuery } from 'firebase/data-connect';
import { connectorConfig, listCommitmentsRef } from '@dataconnect/dairysync-generated';


// Call the `listCommitmentsRef()` function to get a reference to the query.
const ref = listCommitmentsRef();

// You can also pass in a `DataConnect` instance to the `QueryRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = listCommitmentsRef(dataConnect);

// Call `executeQuery()` on the reference to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeQuery(ref);

console.log(data.supplyDemandCommitments);

// Or, you can use the `Promise` API.
executeQuery(ref).then((response) => {
  const data = response.data;
  console.log(data.supplyDemandCommitments);
});
```

## ListSystemAlerts
You can execute the `ListSystemAlerts` query using the following action shortcut function, or by calling `executeQuery()` after calling the following `QueryRef` function, both of which are defined in [dairysync/index.d.ts](./index.d.ts):
```typescript
listSystemAlerts(options?: ExecuteQueryOptions): QueryPromise<ListSystemAlertsData, undefined>;

interface ListSystemAlertsRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (): QueryRef<ListSystemAlertsData, undefined>;
}
export const listSystemAlertsRef: ListSystemAlertsRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `QueryRef` function.
```typescript
listSystemAlerts(dc: DataConnect, options?: ExecuteQueryOptions): QueryPromise<ListSystemAlertsData, undefined>;

interface ListSystemAlertsRef {
  ...
  (dc: DataConnect): QueryRef<ListSystemAlertsData, undefined>;
}
export const listSystemAlertsRef: ListSystemAlertsRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the listSystemAlertsRef:
```typescript
const name = listSystemAlertsRef.operationName;
console.log(name);
```

### Variables
The `ListSystemAlerts` query has no variables.
### Return Type
Recall that executing the `ListSystemAlerts` query returns a `QueryPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `ListSystemAlertsData`, which is defined in [dairysync/index.d.ts](./index.d.ts). It has the following fields:
```typescript
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
```
### Using `ListSystemAlerts`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, listSystemAlerts } from '@dataconnect/dairysync-generated';


// Call the `listSystemAlerts()` function to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await listSystemAlerts();

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await listSystemAlerts(dataConnect);

console.log(data.systemAlerts);

// Or, you can use the `Promise` API.
listSystemAlerts().then((response) => {
  const data = response.data;
  console.log(data.systemAlerts);
});
```

### Using `ListSystemAlerts`'s `QueryRef` function

```typescript
import { getDataConnect, executeQuery } from 'firebase/data-connect';
import { connectorConfig, listSystemAlertsRef } from '@dataconnect/dairysync-generated';


// Call the `listSystemAlertsRef()` function to get a reference to the query.
const ref = listSystemAlertsRef();

// You can also pass in a `DataConnect` instance to the `QueryRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = listSystemAlertsRef(dataConnect);

// Call `executeQuery()` on the reference to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeQuery(ref);

console.log(data.systemAlerts);

// Or, you can use the `Promise` API.
executeQuery(ref).then((response) => {
  const data = response.data;
  console.log(data.systemAlerts);
});
```

## ListIsoRatings
You can execute the `ListIsoRatings` query using the following action shortcut function, or by calling `executeQuery()` after calling the following `QueryRef` function, both of which are defined in [dairysync/index.d.ts](./index.d.ts):
```typescript
listIsoRatings(options?: ExecuteQueryOptions): QueryPromise<ListIsoRatingsData, undefined>;

interface ListIsoRatingsRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (): QueryRef<ListIsoRatingsData, undefined>;
}
export const listIsoRatingsRef: ListIsoRatingsRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `QueryRef` function.
```typescript
listIsoRatings(dc: DataConnect, options?: ExecuteQueryOptions): QueryPromise<ListIsoRatingsData, undefined>;

interface ListIsoRatingsRef {
  ...
  (dc: DataConnect): QueryRef<ListIsoRatingsData, undefined>;
}
export const listIsoRatingsRef: ListIsoRatingsRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the listIsoRatingsRef:
```typescript
const name = listIsoRatingsRef.operationName;
console.log(name);
```

### Variables
The `ListIsoRatings` query has no variables.
### Return Type
Recall that executing the `ListIsoRatings` query returns a `QueryPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `ListIsoRatingsData`, which is defined in [dairysync/index.d.ts](./index.d.ts). It has the following fields:
```typescript
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
```
### Using `ListIsoRatings`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, listIsoRatings } from '@dataconnect/dairysync-generated';


// Call the `listIsoRatings()` function to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await listIsoRatings();

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await listIsoRatings(dataConnect);

console.log(data.isoEvaluationRatings);

// Or, you can use the `Promise` API.
listIsoRatings().then((response) => {
  const data = response.data;
  console.log(data.isoEvaluationRatings);
});
```

### Using `ListIsoRatings`'s `QueryRef` function

```typescript
import { getDataConnect, executeQuery } from 'firebase/data-connect';
import { connectorConfig, listIsoRatingsRef } from '@dataconnect/dairysync-generated';


// Call the `listIsoRatingsRef()` function to get a reference to the query.
const ref = listIsoRatingsRef();

// You can also pass in a `DataConnect` instance to the `QueryRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = listIsoRatingsRef(dataConnect);

// Call `executeQuery()` on the reference to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeQuery(ref);

console.log(data.isoEvaluationRatings);

// Or, you can use the `Promise` API.
executeQuery(ref).then((response) => {
  const data = response.data;
  console.log(data.isoEvaluationRatings);
});
```

## ListAuditLogEntries
You can execute the `ListAuditLogEntries` query using the following action shortcut function, or by calling `executeQuery()` after calling the following `QueryRef` function, both of which are defined in [dairysync/index.d.ts](./index.d.ts):
```typescript
listAuditLogEntries(options?: ExecuteQueryOptions): QueryPromise<ListAuditLogEntriesData, undefined>;

interface ListAuditLogEntriesRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (): QueryRef<ListAuditLogEntriesData, undefined>;
}
export const listAuditLogEntriesRef: ListAuditLogEntriesRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `QueryRef` function.
```typescript
listAuditLogEntries(dc: DataConnect, options?: ExecuteQueryOptions): QueryPromise<ListAuditLogEntriesData, undefined>;

interface ListAuditLogEntriesRef {
  ...
  (dc: DataConnect): QueryRef<ListAuditLogEntriesData, undefined>;
}
export const listAuditLogEntriesRef: ListAuditLogEntriesRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the listAuditLogEntriesRef:
```typescript
const name = listAuditLogEntriesRef.operationName;
console.log(name);
```

### Variables
The `ListAuditLogEntries` query has no variables.
### Return Type
Recall that executing the `ListAuditLogEntries` query returns a `QueryPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `ListAuditLogEntriesData`, which is defined in [dairysync/index.d.ts](./index.d.ts). It has the following fields:
```typescript
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
```
### Using `ListAuditLogEntries`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, listAuditLogEntries } from '@dataconnect/dairysync-generated';


// Call the `listAuditLogEntries()` function to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await listAuditLogEntries();

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await listAuditLogEntries(dataConnect);

console.log(data.auditLogEntries);

// Or, you can use the `Promise` API.
listAuditLogEntries().then((response) => {
  const data = response.data;
  console.log(data.auditLogEntries);
});
```

### Using `ListAuditLogEntries`'s `QueryRef` function

```typescript
import { getDataConnect, executeQuery } from 'firebase/data-connect';
import { connectorConfig, listAuditLogEntriesRef } from '@dataconnect/dairysync-generated';


// Call the `listAuditLogEntriesRef()` function to get a reference to the query.
const ref = listAuditLogEntriesRef();

// You can also pass in a `DataConnect` instance to the `QueryRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = listAuditLogEntriesRef(dataConnect);

// Call `executeQuery()` on the reference to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeQuery(ref);

console.log(data.auditLogEntries);

// Or, you can use the `Promise` API.
executeQuery(ref).then((response) => {
  const data = response.data;
  console.log(data.auditLogEntries);
});
```

## ListUserProfiles
You can execute the `ListUserProfiles` query using the following action shortcut function, or by calling `executeQuery()` after calling the following `QueryRef` function, both of which are defined in [dairysync/index.d.ts](./index.d.ts):
```typescript
listUserProfiles(options?: ExecuteQueryOptions): QueryPromise<ListUserProfilesData, undefined>;

interface ListUserProfilesRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (): QueryRef<ListUserProfilesData, undefined>;
}
export const listUserProfilesRef: ListUserProfilesRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `QueryRef` function.
```typescript
listUserProfiles(dc: DataConnect, options?: ExecuteQueryOptions): QueryPromise<ListUserProfilesData, undefined>;

interface ListUserProfilesRef {
  ...
  (dc: DataConnect): QueryRef<ListUserProfilesData, undefined>;
}
export const listUserProfilesRef: ListUserProfilesRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the listUserProfilesRef:
```typescript
const name = listUserProfilesRef.operationName;
console.log(name);
```

### Variables
The `ListUserProfiles` query has no variables.
### Return Type
Recall that executing the `ListUserProfiles` query returns a `QueryPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `ListUserProfilesData`, which is defined in [dairysync/index.d.ts](./index.d.ts). It has the following fields:
```typescript
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
```
### Using `ListUserProfiles`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, listUserProfiles } from '@dataconnect/dairysync-generated';


// Call the `listUserProfiles()` function to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await listUserProfiles();

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await listUserProfiles(dataConnect);

console.log(data.userProfiles);

// Or, you can use the `Promise` API.
listUserProfiles().then((response) => {
  const data = response.data;
  console.log(data.userProfiles);
});
```

### Using `ListUserProfiles`'s `QueryRef` function

```typescript
import { getDataConnect, executeQuery } from 'firebase/data-connect';
import { connectorConfig, listUserProfilesRef } from '@dataconnect/dairysync-generated';


// Call the `listUserProfilesRef()` function to get a reference to the query.
const ref = listUserProfilesRef();

// You can also pass in a `DataConnect` instance to the `QueryRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = listUserProfilesRef(dataConnect);

// Call `executeQuery()` on the reference to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeQuery(ref);

console.log(data.userProfiles);

// Or, you can use the `Promise` API.
executeQuery(ref).then((response) => {
  const data = response.data;
  console.log(data.userProfiles);
});
```

# Mutations

There are two ways to execute a Data Connect Mutation using the generated Web SDK:
- Using a Mutation Reference function, which returns a `MutationRef`
  - The `MutationRef` can be used as an argument to `executeMutation()`, which will execute the Mutation and return a `MutationPromise`
- Using an action shortcut function, which returns a `MutationPromise`
  - Calling the action shortcut function will execute the Mutation and return a `MutationPromise`

The following is true for both the action shortcut function and the `MutationRef` function:
- The `MutationPromise` returned will resolve to the result of the Mutation once it has finished executing
- If the Mutation accepts arguments, both the action shortcut function and the `MutationRef` function accept a single argument: an object that contains all the required variables (and the optional variables) for the Mutation
- Both functions can be called with or without passing in a `DataConnect` instance as an argument. If no `DataConnect` argument is passed in, then the generated SDK will call `getDataConnect(connectorConfig)` behind the scenes for you.

Below are examples of how to use the `dairysync` connector's generated functions to execute each mutation. You can also follow the examples from the [Data Connect documentation](https://firebase.google.com/docs/data-connect/web-sdk#using-mutations).

## SeedStockTransaction
You can execute the `SeedStockTransaction` mutation using the following action shortcut function, or by calling `executeMutation()` after calling the following `MutationRef` function, both of which are defined in [dairysync/index.d.ts](./index.d.ts):
```typescript
seedStockTransaction(vars: SeedStockTransactionVariables): MutationPromise<SeedStockTransactionData, SeedStockTransactionVariables>;

interface SeedStockTransactionRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: SeedStockTransactionVariables): MutationRef<SeedStockTransactionData, SeedStockTransactionVariables>;
}
export const seedStockTransactionRef: SeedStockTransactionRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `MutationRef` function.
```typescript
seedStockTransaction(dc: DataConnect, vars: SeedStockTransactionVariables): MutationPromise<SeedStockTransactionData, SeedStockTransactionVariables>;

interface SeedStockTransactionRef {
  ...
  (dc: DataConnect, vars: SeedStockTransactionVariables): MutationRef<SeedStockTransactionData, SeedStockTransactionVariables>;
}
export const seedStockTransactionRef: SeedStockTransactionRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the seedStockTransactionRef:
```typescript
const name = seedStockTransactionRef.operationName;
console.log(name);
```

### Variables
The `SeedStockTransaction` mutation requires an argument of type `SeedStockTransactionVariables`, which is defined in [dairysync/index.d.ts](./index.d.ts). It has the following fields:

```typescript
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
```
### Return Type
Recall that executing the `SeedStockTransaction` mutation returns a `MutationPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `SeedStockTransactionData`, which is defined in [dairysync/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface SeedStockTransactionData {
  stockTransaction_upsert: StockTransaction_Key;
}
```
### Using `SeedStockTransaction`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, seedStockTransaction, SeedStockTransactionVariables } from '@dataconnect/dairysync-generated';

// The `SeedStockTransaction` mutation requires an argument of type `SeedStockTransactionVariables`:
const seedStockTransactionVars: SeedStockTransactionVariables = {
  id: ..., 
  timestamp: ..., 
  itemId: ..., 
  itemName: ..., 
  itemType: ..., 
  action: ..., 
  quantity: ..., 
  unit: ..., 
  previousStock: ..., 
  newStock: ..., 
  referenceId: ..., // optional
  unitPrice: ..., // optional
  performedBy: ..., 
  notes: ..., // optional
};

// Call the `seedStockTransaction()` function to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await seedStockTransaction(seedStockTransactionVars);
// Variables can be defined inline as well.
const { data } = await seedStockTransaction({ id: ..., timestamp: ..., itemId: ..., itemName: ..., itemType: ..., action: ..., quantity: ..., unit: ..., previousStock: ..., newStock: ..., referenceId: ..., unitPrice: ..., performedBy: ..., notes: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await seedStockTransaction(dataConnect, seedStockTransactionVars);

console.log(data.stockTransaction_upsert);

// Or, you can use the `Promise` API.
seedStockTransaction(seedStockTransactionVars).then((response) => {
  const data = response.data;
  console.log(data.stockTransaction_upsert);
});
```

### Using `SeedStockTransaction`'s `MutationRef` function

```typescript
import { getDataConnect, executeMutation } from 'firebase/data-connect';
import { connectorConfig, seedStockTransactionRef, SeedStockTransactionVariables } from '@dataconnect/dairysync-generated';

// The `SeedStockTransaction` mutation requires an argument of type `SeedStockTransactionVariables`:
const seedStockTransactionVars: SeedStockTransactionVariables = {
  id: ..., 
  timestamp: ..., 
  itemId: ..., 
  itemName: ..., 
  itemType: ..., 
  action: ..., 
  quantity: ..., 
  unit: ..., 
  previousStock: ..., 
  newStock: ..., 
  referenceId: ..., // optional
  unitPrice: ..., // optional
  performedBy: ..., 
  notes: ..., // optional
};

// Call the `seedStockTransactionRef()` function to get a reference to the mutation.
const ref = seedStockTransactionRef(seedStockTransactionVars);
// Variables can be defined inline as well.
const ref = seedStockTransactionRef({ id: ..., timestamp: ..., itemId: ..., itemName: ..., itemType: ..., action: ..., quantity: ..., unit: ..., previousStock: ..., newStock: ..., referenceId: ..., unitPrice: ..., performedBy: ..., notes: ..., });

// You can also pass in a `DataConnect` instance to the `MutationRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = seedStockTransactionRef(dataConnect, seedStockTransactionVars);

// Call `executeMutation()` on the reference to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeMutation(ref);

console.log(data.stockTransaction_upsert);

// Or, you can use the `Promise` API.
executeMutation(ref).then((response) => {
  const data = response.data;
  console.log(data.stockTransaction_upsert);
});
```

## SeedIsoRating
You can execute the `SeedIsoRating` mutation using the following action shortcut function, or by calling `executeMutation()` after calling the following `MutationRef` function, both of which are defined in [dairysync/index.d.ts](./index.d.ts):
```typescript
seedIsoRating(vars: SeedIsoRatingVariables): MutationPromise<SeedIsoRatingData, SeedIsoRatingVariables>;

interface SeedIsoRatingRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: SeedIsoRatingVariables): MutationRef<SeedIsoRatingData, SeedIsoRatingVariables>;
}
export const seedIsoRatingRef: SeedIsoRatingRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `MutationRef` function.
```typescript
seedIsoRating(dc: DataConnect, vars: SeedIsoRatingVariables): MutationPromise<SeedIsoRatingData, SeedIsoRatingVariables>;

interface SeedIsoRatingRef {
  ...
  (dc: DataConnect, vars: SeedIsoRatingVariables): MutationRef<SeedIsoRatingData, SeedIsoRatingVariables>;
}
export const seedIsoRatingRef: SeedIsoRatingRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the seedIsoRatingRef:
```typescript
const name = seedIsoRatingRef.operationName;
console.log(name);
```

### Variables
The `SeedIsoRating` mutation requires an argument of type `SeedIsoRatingVariables`, which is defined in [dairysync/index.d.ts](./index.d.ts). It has the following fields:

```typescript
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
```
### Return Type
Recall that executing the `SeedIsoRating` mutation returns a `MutationPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `SeedIsoRatingData`, which is defined in [dairysync/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface SeedIsoRatingData {
  isoEvaluationRating_upsert: IsoEvaluationRating_Key;
}
```
### Using `SeedIsoRating`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, seedIsoRating, SeedIsoRatingVariables } from '@dataconnect/dairysync-generated';

// The `SeedIsoRating` mutation requires an argument of type `SeedIsoRatingVariables`:
const seedIsoRatingVars: SeedIsoRatingVariables = {
  id: ..., 
  functionalSuitability: ..., 
  performanceEfficiency: ..., 
  compatibility: ..., 
  interactionCapability: ..., 
  reliability: ..., 
  security: ..., 
  maintainability: ..., 
  flexibility: ..., 
  safety: ..., 
  evaluatorRole: ..., 
  comments: ..., 
  date: ..., 
};

// Call the `seedIsoRating()` function to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await seedIsoRating(seedIsoRatingVars);
// Variables can be defined inline as well.
const { data } = await seedIsoRating({ id: ..., functionalSuitability: ..., performanceEfficiency: ..., compatibility: ..., interactionCapability: ..., reliability: ..., security: ..., maintainability: ..., flexibility: ..., safety: ..., evaluatorRole: ..., comments: ..., date: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await seedIsoRating(dataConnect, seedIsoRatingVars);

console.log(data.isoEvaluationRating_upsert);

// Or, you can use the `Promise` API.
seedIsoRating(seedIsoRatingVars).then((response) => {
  const data = response.data;
  console.log(data.isoEvaluationRating_upsert);
});
```

### Using `SeedIsoRating`'s `MutationRef` function

```typescript
import { getDataConnect, executeMutation } from 'firebase/data-connect';
import { connectorConfig, seedIsoRatingRef, SeedIsoRatingVariables } from '@dataconnect/dairysync-generated';

// The `SeedIsoRating` mutation requires an argument of type `SeedIsoRatingVariables`:
const seedIsoRatingVars: SeedIsoRatingVariables = {
  id: ..., 
  functionalSuitability: ..., 
  performanceEfficiency: ..., 
  compatibility: ..., 
  interactionCapability: ..., 
  reliability: ..., 
  security: ..., 
  maintainability: ..., 
  flexibility: ..., 
  safety: ..., 
  evaluatorRole: ..., 
  comments: ..., 
  date: ..., 
};

// Call the `seedIsoRatingRef()` function to get a reference to the mutation.
const ref = seedIsoRatingRef(seedIsoRatingVars);
// Variables can be defined inline as well.
const ref = seedIsoRatingRef({ id: ..., functionalSuitability: ..., performanceEfficiency: ..., compatibility: ..., interactionCapability: ..., reliability: ..., security: ..., maintainability: ..., flexibility: ..., safety: ..., evaluatorRole: ..., comments: ..., date: ..., });

// You can also pass in a `DataConnect` instance to the `MutationRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = seedIsoRatingRef(dataConnect, seedIsoRatingVars);

// Call `executeMutation()` on the reference to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeMutation(ref);

console.log(data.isoEvaluationRating_upsert);

// Or, you can use the `Promise` API.
executeMutation(ref).then((response) => {
  const data = response.data;
  console.log(data.isoEvaluationRating_upsert);
});
```

## SeedAuditLogEntry
You can execute the `SeedAuditLogEntry` mutation using the following action shortcut function, or by calling `executeMutation()` after calling the following `MutationRef` function, both of which are defined in [dairysync/index.d.ts](./index.d.ts):
```typescript
seedAuditLogEntry(vars: SeedAuditLogEntryVariables): MutationPromise<SeedAuditLogEntryData, SeedAuditLogEntryVariables>;

interface SeedAuditLogEntryRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: SeedAuditLogEntryVariables): MutationRef<SeedAuditLogEntryData, SeedAuditLogEntryVariables>;
}
export const seedAuditLogEntryRef: SeedAuditLogEntryRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `MutationRef` function.
```typescript
seedAuditLogEntry(dc: DataConnect, vars: SeedAuditLogEntryVariables): MutationPromise<SeedAuditLogEntryData, SeedAuditLogEntryVariables>;

interface SeedAuditLogEntryRef {
  ...
  (dc: DataConnect, vars: SeedAuditLogEntryVariables): MutationRef<SeedAuditLogEntryData, SeedAuditLogEntryVariables>;
}
export const seedAuditLogEntryRef: SeedAuditLogEntryRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the seedAuditLogEntryRef:
```typescript
const name = seedAuditLogEntryRef.operationName;
console.log(name);
```

### Variables
The `SeedAuditLogEntry` mutation requires an argument of type `SeedAuditLogEntryVariables`, which is defined in [dairysync/index.d.ts](./index.d.ts). It has the following fields:

```typescript
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
```
### Return Type
Recall that executing the `SeedAuditLogEntry` mutation returns a `MutationPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `SeedAuditLogEntryData`, which is defined in [dairysync/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface SeedAuditLogEntryData {
  auditLogEntry_upsert: AuditLogEntry_Key;
}
```
### Using `SeedAuditLogEntry`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, seedAuditLogEntry, SeedAuditLogEntryVariables } from '@dataconnect/dairysync-generated';

// The `SeedAuditLogEntry` mutation requires an argument of type `SeedAuditLogEntryVariables`:
const seedAuditLogEntryVars: SeedAuditLogEntryVariables = {
  id: ..., 
  timestamp: ..., 
  category: ..., 
  subsystem: ..., 
  action: ..., 
  description: ..., 
  details: ..., // optional
  userId: ..., 
  userName: ..., 
  userRole: ..., 
  userTitle: ..., 
  terminalOrStation: ..., // optional
  severity: ..., 
};

// Call the `seedAuditLogEntry()` function to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await seedAuditLogEntry(seedAuditLogEntryVars);
// Variables can be defined inline as well.
const { data } = await seedAuditLogEntry({ id: ..., timestamp: ..., category: ..., subsystem: ..., action: ..., description: ..., details: ..., userId: ..., userName: ..., userRole: ..., userTitle: ..., terminalOrStation: ..., severity: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await seedAuditLogEntry(dataConnect, seedAuditLogEntryVars);

console.log(data.auditLogEntry_upsert);

// Or, you can use the `Promise` API.
seedAuditLogEntry(seedAuditLogEntryVars).then((response) => {
  const data = response.data;
  console.log(data.auditLogEntry_upsert);
});
```

### Using `SeedAuditLogEntry`'s `MutationRef` function

```typescript
import { getDataConnect, executeMutation } from 'firebase/data-connect';
import { connectorConfig, seedAuditLogEntryRef, SeedAuditLogEntryVariables } from '@dataconnect/dairysync-generated';

// The `SeedAuditLogEntry` mutation requires an argument of type `SeedAuditLogEntryVariables`:
const seedAuditLogEntryVars: SeedAuditLogEntryVariables = {
  id: ..., 
  timestamp: ..., 
  category: ..., 
  subsystem: ..., 
  action: ..., 
  description: ..., 
  details: ..., // optional
  userId: ..., 
  userName: ..., 
  userRole: ..., 
  userTitle: ..., 
  terminalOrStation: ..., // optional
  severity: ..., 
};

// Call the `seedAuditLogEntryRef()` function to get a reference to the mutation.
const ref = seedAuditLogEntryRef(seedAuditLogEntryVars);
// Variables can be defined inline as well.
const ref = seedAuditLogEntryRef({ id: ..., timestamp: ..., category: ..., subsystem: ..., action: ..., description: ..., details: ..., userId: ..., userName: ..., userRole: ..., userTitle: ..., terminalOrStation: ..., severity: ..., });

// You can also pass in a `DataConnect` instance to the `MutationRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = seedAuditLogEntryRef(dataConnect, seedAuditLogEntryVars);

// Call `executeMutation()` on the reference to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeMutation(ref);

console.log(data.auditLogEntry_upsert);

// Or, you can use the `Promise` API.
executeMutation(ref).then((response) => {
  const data = response.data;
  console.log(data.auditLogEntry_upsert);
});
```

## UpsertRawIngredient
You can execute the `UpsertRawIngredient` mutation using the following action shortcut function, or by calling `executeMutation()` after calling the following `MutationRef` function, both of which are defined in [dairysync/index.d.ts](./index.d.ts):
```typescript
upsertRawIngredient(vars: UpsertRawIngredientVariables): MutationPromise<UpsertRawIngredientData, UpsertRawIngredientVariables>;

interface UpsertRawIngredientRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: UpsertRawIngredientVariables): MutationRef<UpsertRawIngredientData, UpsertRawIngredientVariables>;
}
export const upsertRawIngredientRef: UpsertRawIngredientRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `MutationRef` function.
```typescript
upsertRawIngredient(dc: DataConnect, vars: UpsertRawIngredientVariables): MutationPromise<UpsertRawIngredientData, UpsertRawIngredientVariables>;

interface UpsertRawIngredientRef {
  ...
  (dc: DataConnect, vars: UpsertRawIngredientVariables): MutationRef<UpsertRawIngredientData, UpsertRawIngredientVariables>;
}
export const upsertRawIngredientRef: UpsertRawIngredientRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the upsertRawIngredientRef:
```typescript
const name = upsertRawIngredientRef.operationName;
console.log(name);
```

### Variables
The `UpsertRawIngredient` mutation requires an argument of type `UpsertRawIngredientVariables`, which is defined in [dairysync/index.d.ts](./index.d.ts). It has the following fields:

```typescript
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
```
### Return Type
Recall that executing the `UpsertRawIngredient` mutation returns a `MutationPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `UpsertRawIngredientData`, which is defined in [dairysync/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface UpsertRawIngredientData {
  rawIngredient_upsert: RawIngredient_Key;
}
```
### Using `UpsertRawIngredient`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, upsertRawIngredient, UpsertRawIngredientVariables } from '@dataconnect/dairysync-generated';

// The `UpsertRawIngredient` mutation requires an argument of type `UpsertRawIngredientVariables`:
const upsertRawIngredientVars: UpsertRawIngredientVariables = {
  id: ..., 
  sku: ..., 
  name: ..., 
  category: ..., 
  currentStock: ..., 
  unit: ..., 
  reorderPoint: ..., 
  safetyStock: ..., 
  maxStock: ..., 
  avgDailyConsumption: ..., 
  leadTimeDays: ..., 
  costPerUnit: ..., 
  supplier: ..., 
  lastRestocked: ..., 
  location: ..., 
  expiryDate: ..., // optional
};

// Call the `upsertRawIngredient()` function to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await upsertRawIngredient(upsertRawIngredientVars);
// Variables can be defined inline as well.
const { data } = await upsertRawIngredient({ id: ..., sku: ..., name: ..., category: ..., currentStock: ..., unit: ..., reorderPoint: ..., safetyStock: ..., maxStock: ..., avgDailyConsumption: ..., leadTimeDays: ..., costPerUnit: ..., supplier: ..., lastRestocked: ..., location: ..., expiryDate: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await upsertRawIngredient(dataConnect, upsertRawIngredientVars);

console.log(data.rawIngredient_upsert);

// Or, you can use the `Promise` API.
upsertRawIngredient(upsertRawIngredientVars).then((response) => {
  const data = response.data;
  console.log(data.rawIngredient_upsert);
});
```

### Using `UpsertRawIngredient`'s `MutationRef` function

```typescript
import { getDataConnect, executeMutation } from 'firebase/data-connect';
import { connectorConfig, upsertRawIngredientRef, UpsertRawIngredientVariables } from '@dataconnect/dairysync-generated';

// The `UpsertRawIngredient` mutation requires an argument of type `UpsertRawIngredientVariables`:
const upsertRawIngredientVars: UpsertRawIngredientVariables = {
  id: ..., 
  sku: ..., 
  name: ..., 
  category: ..., 
  currentStock: ..., 
  unit: ..., 
  reorderPoint: ..., 
  safetyStock: ..., 
  maxStock: ..., 
  avgDailyConsumption: ..., 
  leadTimeDays: ..., 
  costPerUnit: ..., 
  supplier: ..., 
  lastRestocked: ..., 
  location: ..., 
  expiryDate: ..., // optional
};

// Call the `upsertRawIngredientRef()` function to get a reference to the mutation.
const ref = upsertRawIngredientRef(upsertRawIngredientVars);
// Variables can be defined inline as well.
const ref = upsertRawIngredientRef({ id: ..., sku: ..., name: ..., category: ..., currentStock: ..., unit: ..., reorderPoint: ..., safetyStock: ..., maxStock: ..., avgDailyConsumption: ..., leadTimeDays: ..., costPerUnit: ..., supplier: ..., lastRestocked: ..., location: ..., expiryDate: ..., });

// You can also pass in a `DataConnect` instance to the `MutationRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = upsertRawIngredientRef(dataConnect, upsertRawIngredientVars);

// Call `executeMutation()` on the reference to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeMutation(ref);

console.log(data.rawIngredient_upsert);

// Or, you can use the `Promise` API.
executeMutation(ref).then((response) => {
  const data = response.data;
  console.log(data.rawIngredient_upsert);
});
```

## DeleteRawIngredient
You can execute the `DeleteRawIngredient` mutation using the following action shortcut function, or by calling `executeMutation()` after calling the following `MutationRef` function, both of which are defined in [dairysync/index.d.ts](./index.d.ts):
```typescript
deleteRawIngredient(vars: DeleteRawIngredientVariables): MutationPromise<DeleteRawIngredientData, DeleteRawIngredientVariables>;

interface DeleteRawIngredientRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: DeleteRawIngredientVariables): MutationRef<DeleteRawIngredientData, DeleteRawIngredientVariables>;
}
export const deleteRawIngredientRef: DeleteRawIngredientRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `MutationRef` function.
```typescript
deleteRawIngredient(dc: DataConnect, vars: DeleteRawIngredientVariables): MutationPromise<DeleteRawIngredientData, DeleteRawIngredientVariables>;

interface DeleteRawIngredientRef {
  ...
  (dc: DataConnect, vars: DeleteRawIngredientVariables): MutationRef<DeleteRawIngredientData, DeleteRawIngredientVariables>;
}
export const deleteRawIngredientRef: DeleteRawIngredientRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the deleteRawIngredientRef:
```typescript
const name = deleteRawIngredientRef.operationName;
console.log(name);
```

### Variables
The `DeleteRawIngredient` mutation requires an argument of type `DeleteRawIngredientVariables`, which is defined in [dairysync/index.d.ts](./index.d.ts). It has the following fields:

```typescript
export interface DeleteRawIngredientVariables {
  id: string;
}
```
### Return Type
Recall that executing the `DeleteRawIngredient` mutation returns a `MutationPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `DeleteRawIngredientData`, which is defined in [dairysync/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface DeleteRawIngredientData {
  rawIngredient_delete?: RawIngredient_Key | null;
}
```
### Using `DeleteRawIngredient`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, deleteRawIngredient, DeleteRawIngredientVariables } from '@dataconnect/dairysync-generated';

// The `DeleteRawIngredient` mutation requires an argument of type `DeleteRawIngredientVariables`:
const deleteRawIngredientVars: DeleteRawIngredientVariables = {
  id: ..., 
};

// Call the `deleteRawIngredient()` function to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await deleteRawIngredient(deleteRawIngredientVars);
// Variables can be defined inline as well.
const { data } = await deleteRawIngredient({ id: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await deleteRawIngredient(dataConnect, deleteRawIngredientVars);

console.log(data.rawIngredient_delete);

// Or, you can use the `Promise` API.
deleteRawIngredient(deleteRawIngredientVars).then((response) => {
  const data = response.data;
  console.log(data.rawIngredient_delete);
});
```

### Using `DeleteRawIngredient`'s `MutationRef` function

```typescript
import { getDataConnect, executeMutation } from 'firebase/data-connect';
import { connectorConfig, deleteRawIngredientRef, DeleteRawIngredientVariables } from '@dataconnect/dairysync-generated';

// The `DeleteRawIngredient` mutation requires an argument of type `DeleteRawIngredientVariables`:
const deleteRawIngredientVars: DeleteRawIngredientVariables = {
  id: ..., 
};

// Call the `deleteRawIngredientRef()` function to get a reference to the mutation.
const ref = deleteRawIngredientRef(deleteRawIngredientVars);
// Variables can be defined inline as well.
const ref = deleteRawIngredientRef({ id: ..., });

// You can also pass in a `DataConnect` instance to the `MutationRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = deleteRawIngredientRef(dataConnect, deleteRawIngredientVars);

// Call `executeMutation()` on the reference to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeMutation(ref);

console.log(data.rawIngredient_delete);

// Or, you can use the `Promise` API.
executeMutation(ref).then((response) => {
  const data = response.data;
  console.log(data.rawIngredient_delete);
});
```

## UpsertStockTransaction
You can execute the `UpsertStockTransaction` mutation using the following action shortcut function, or by calling `executeMutation()` after calling the following `MutationRef` function, both of which are defined in [dairysync/index.d.ts](./index.d.ts):
```typescript
upsertStockTransaction(vars: UpsertStockTransactionVariables): MutationPromise<UpsertStockTransactionData, UpsertStockTransactionVariables>;

interface UpsertStockTransactionRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: UpsertStockTransactionVariables): MutationRef<UpsertStockTransactionData, UpsertStockTransactionVariables>;
}
export const upsertStockTransactionRef: UpsertStockTransactionRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `MutationRef` function.
```typescript
upsertStockTransaction(dc: DataConnect, vars: UpsertStockTransactionVariables): MutationPromise<UpsertStockTransactionData, UpsertStockTransactionVariables>;

interface UpsertStockTransactionRef {
  ...
  (dc: DataConnect, vars: UpsertStockTransactionVariables): MutationRef<UpsertStockTransactionData, UpsertStockTransactionVariables>;
}
export const upsertStockTransactionRef: UpsertStockTransactionRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the upsertStockTransactionRef:
```typescript
const name = upsertStockTransactionRef.operationName;
console.log(name);
```

### Variables
The `UpsertStockTransaction` mutation requires an argument of type `UpsertStockTransactionVariables`, which is defined in [dairysync/index.d.ts](./index.d.ts). It has the following fields:

```typescript
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
```
### Return Type
Recall that executing the `UpsertStockTransaction` mutation returns a `MutationPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `UpsertStockTransactionData`, which is defined in [dairysync/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface UpsertStockTransactionData {
  stockTransaction_upsert: StockTransaction_Key;
}
```
### Using `UpsertStockTransaction`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, upsertStockTransaction, UpsertStockTransactionVariables } from '@dataconnect/dairysync-generated';

// The `UpsertStockTransaction` mutation requires an argument of type `UpsertStockTransactionVariables`:
const upsertStockTransactionVars: UpsertStockTransactionVariables = {
  id: ..., 
  timestamp: ..., 
  itemId: ..., 
  itemName: ..., 
  itemType: ..., 
  action: ..., 
  quantity: ..., 
  unit: ..., 
  previousStock: ..., 
  newStock: ..., 
  referenceId: ..., // optional
  unitPrice: ..., // optional
  notes: ..., // optional
};

// Call the `upsertStockTransaction()` function to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await upsertStockTransaction(upsertStockTransactionVars);
// Variables can be defined inline as well.
const { data } = await upsertStockTransaction({ id: ..., timestamp: ..., itemId: ..., itemName: ..., itemType: ..., action: ..., quantity: ..., unit: ..., previousStock: ..., newStock: ..., referenceId: ..., unitPrice: ..., notes: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await upsertStockTransaction(dataConnect, upsertStockTransactionVars);

console.log(data.stockTransaction_upsert);

// Or, you can use the `Promise` API.
upsertStockTransaction(upsertStockTransactionVars).then((response) => {
  const data = response.data;
  console.log(data.stockTransaction_upsert);
});
```

### Using `UpsertStockTransaction`'s `MutationRef` function

```typescript
import { getDataConnect, executeMutation } from 'firebase/data-connect';
import { connectorConfig, upsertStockTransactionRef, UpsertStockTransactionVariables } from '@dataconnect/dairysync-generated';

// The `UpsertStockTransaction` mutation requires an argument of type `UpsertStockTransactionVariables`:
const upsertStockTransactionVars: UpsertStockTransactionVariables = {
  id: ..., 
  timestamp: ..., 
  itemId: ..., 
  itemName: ..., 
  itemType: ..., 
  action: ..., 
  quantity: ..., 
  unit: ..., 
  previousStock: ..., 
  newStock: ..., 
  referenceId: ..., // optional
  unitPrice: ..., // optional
  notes: ..., // optional
};

// Call the `upsertStockTransactionRef()` function to get a reference to the mutation.
const ref = upsertStockTransactionRef(upsertStockTransactionVars);
// Variables can be defined inline as well.
const ref = upsertStockTransactionRef({ id: ..., timestamp: ..., itemId: ..., itemName: ..., itemType: ..., action: ..., quantity: ..., unit: ..., previousStock: ..., newStock: ..., referenceId: ..., unitPrice: ..., notes: ..., });

// You can also pass in a `DataConnect` instance to the `MutationRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = upsertStockTransactionRef(dataConnect, upsertStockTransactionVars);

// Call `executeMutation()` on the reference to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeMutation(ref);

console.log(data.stockTransaction_upsert);

// Or, you can use the `Promise` API.
executeMutation(ref).then((response) => {
  const data = response.data;
  console.log(data.stockTransaction_upsert);
});
```

## DeleteStockTransaction
You can execute the `DeleteStockTransaction` mutation using the following action shortcut function, or by calling `executeMutation()` after calling the following `MutationRef` function, both of which are defined in [dairysync/index.d.ts](./index.d.ts):
```typescript
deleteStockTransaction(vars: DeleteStockTransactionVariables): MutationPromise<DeleteStockTransactionData, DeleteStockTransactionVariables>;

interface DeleteStockTransactionRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: DeleteStockTransactionVariables): MutationRef<DeleteStockTransactionData, DeleteStockTransactionVariables>;
}
export const deleteStockTransactionRef: DeleteStockTransactionRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `MutationRef` function.
```typescript
deleteStockTransaction(dc: DataConnect, vars: DeleteStockTransactionVariables): MutationPromise<DeleteStockTransactionData, DeleteStockTransactionVariables>;

interface DeleteStockTransactionRef {
  ...
  (dc: DataConnect, vars: DeleteStockTransactionVariables): MutationRef<DeleteStockTransactionData, DeleteStockTransactionVariables>;
}
export const deleteStockTransactionRef: DeleteStockTransactionRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the deleteStockTransactionRef:
```typescript
const name = deleteStockTransactionRef.operationName;
console.log(name);
```

### Variables
The `DeleteStockTransaction` mutation requires an argument of type `DeleteStockTransactionVariables`, which is defined in [dairysync/index.d.ts](./index.d.ts). It has the following fields:

```typescript
export interface DeleteStockTransactionVariables {
  id: string;
}
```
### Return Type
Recall that executing the `DeleteStockTransaction` mutation returns a `MutationPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `DeleteStockTransactionData`, which is defined in [dairysync/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface DeleteStockTransactionData {
  stockTransaction_delete?: StockTransaction_Key | null;
}
```
### Using `DeleteStockTransaction`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, deleteStockTransaction, DeleteStockTransactionVariables } from '@dataconnect/dairysync-generated';

// The `DeleteStockTransaction` mutation requires an argument of type `DeleteStockTransactionVariables`:
const deleteStockTransactionVars: DeleteStockTransactionVariables = {
  id: ..., 
};

// Call the `deleteStockTransaction()` function to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await deleteStockTransaction(deleteStockTransactionVars);
// Variables can be defined inline as well.
const { data } = await deleteStockTransaction({ id: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await deleteStockTransaction(dataConnect, deleteStockTransactionVars);

console.log(data.stockTransaction_delete);

// Or, you can use the `Promise` API.
deleteStockTransaction(deleteStockTransactionVars).then((response) => {
  const data = response.data;
  console.log(data.stockTransaction_delete);
});
```

### Using `DeleteStockTransaction`'s `MutationRef` function

```typescript
import { getDataConnect, executeMutation } from 'firebase/data-connect';
import { connectorConfig, deleteStockTransactionRef, DeleteStockTransactionVariables } from '@dataconnect/dairysync-generated';

// The `DeleteStockTransaction` mutation requires an argument of type `DeleteStockTransactionVariables`:
const deleteStockTransactionVars: DeleteStockTransactionVariables = {
  id: ..., 
};

// Call the `deleteStockTransactionRef()` function to get a reference to the mutation.
const ref = deleteStockTransactionRef(deleteStockTransactionVars);
// Variables can be defined inline as well.
const ref = deleteStockTransactionRef({ id: ..., });

// You can also pass in a `DataConnect` instance to the `MutationRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = deleteStockTransactionRef(dataConnect, deleteStockTransactionVars);

// Call `executeMutation()` on the reference to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeMutation(ref);

console.log(data.stockTransaction_delete);

// Or, you can use the `Promise` API.
executeMutation(ref).then((response) => {
  const data = response.data;
  console.log(data.stockTransaction_delete);
});
```

## UpdateFinishedGoodRecipe
You can execute the `UpdateFinishedGoodRecipe` mutation using the following action shortcut function, or by calling `executeMutation()` after calling the following `MutationRef` function, both of which are defined in [dairysync/index.d.ts](./index.d.ts):
```typescript
updateFinishedGoodRecipe(vars: UpdateFinishedGoodRecipeVariables): MutationPromise<UpdateFinishedGoodRecipeData, UpdateFinishedGoodRecipeVariables>;

interface UpdateFinishedGoodRecipeRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: UpdateFinishedGoodRecipeVariables): MutationRef<UpdateFinishedGoodRecipeData, UpdateFinishedGoodRecipeVariables>;
}
export const updateFinishedGoodRecipeRef: UpdateFinishedGoodRecipeRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `MutationRef` function.
```typescript
updateFinishedGoodRecipe(dc: DataConnect, vars: UpdateFinishedGoodRecipeVariables): MutationPromise<UpdateFinishedGoodRecipeData, UpdateFinishedGoodRecipeVariables>;

interface UpdateFinishedGoodRecipeRef {
  ...
  (dc: DataConnect, vars: UpdateFinishedGoodRecipeVariables): MutationRef<UpdateFinishedGoodRecipeData, UpdateFinishedGoodRecipeVariables>;
}
export const updateFinishedGoodRecipeRef: UpdateFinishedGoodRecipeRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the updateFinishedGoodRecipeRef:
```typescript
const name = updateFinishedGoodRecipeRef.operationName;
console.log(name);
```

### Variables
The `UpdateFinishedGoodRecipe` mutation requires an argument of type `UpdateFinishedGoodRecipeVariables`, which is defined in [dairysync/index.d.ts](./index.d.ts). It has the following fields:

```typescript
export interface UpdateFinishedGoodRecipeVariables {
  id: string;
  recipe: unknown[];
  batchUnitQuantity: number;
}
```
### Return Type
Recall that executing the `UpdateFinishedGoodRecipe` mutation returns a `MutationPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `UpdateFinishedGoodRecipeData`, which is defined in [dairysync/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface UpdateFinishedGoodRecipeData {
  finishedGood_update?: FinishedGood_Key | null;
}
```
### Using `UpdateFinishedGoodRecipe`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, updateFinishedGoodRecipe, UpdateFinishedGoodRecipeVariables } from '@dataconnect/dairysync-generated';

// The `UpdateFinishedGoodRecipe` mutation requires an argument of type `UpdateFinishedGoodRecipeVariables`:
const updateFinishedGoodRecipeVars: UpdateFinishedGoodRecipeVariables = {
  id: ..., 
  recipe: ..., 
  batchUnitQuantity: ..., 
};

// Call the `updateFinishedGoodRecipe()` function to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await updateFinishedGoodRecipe(updateFinishedGoodRecipeVars);
// Variables can be defined inline as well.
const { data } = await updateFinishedGoodRecipe({ id: ..., recipe: ..., batchUnitQuantity: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await updateFinishedGoodRecipe(dataConnect, updateFinishedGoodRecipeVars);

console.log(data.finishedGood_update);

// Or, you can use the `Promise` API.
updateFinishedGoodRecipe(updateFinishedGoodRecipeVars).then((response) => {
  const data = response.data;
  console.log(data.finishedGood_update);
});
```

### Using `UpdateFinishedGoodRecipe`'s `MutationRef` function

```typescript
import { getDataConnect, executeMutation } from 'firebase/data-connect';
import { connectorConfig, updateFinishedGoodRecipeRef, UpdateFinishedGoodRecipeVariables } from '@dataconnect/dairysync-generated';

// The `UpdateFinishedGoodRecipe` mutation requires an argument of type `UpdateFinishedGoodRecipeVariables`:
const updateFinishedGoodRecipeVars: UpdateFinishedGoodRecipeVariables = {
  id: ..., 
  recipe: ..., 
  batchUnitQuantity: ..., 
};

// Call the `updateFinishedGoodRecipeRef()` function to get a reference to the mutation.
const ref = updateFinishedGoodRecipeRef(updateFinishedGoodRecipeVars);
// Variables can be defined inline as well.
const ref = updateFinishedGoodRecipeRef({ id: ..., recipe: ..., batchUnitQuantity: ..., });

// You can also pass in a `DataConnect` instance to the `MutationRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = updateFinishedGoodRecipeRef(dataConnect, updateFinishedGoodRecipeVars);

// Call `executeMutation()` on the reference to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeMutation(ref);

console.log(data.finishedGood_update);

// Or, you can use the `Promise` API.
executeMutation(ref).then((response) => {
  const data = response.data;
  console.log(data.finishedGood_update);
});
```

## UpsertPmoInventoryPeriod
You can execute the `UpsertPmoInventoryPeriod` mutation using the following action shortcut function, or by calling `executeMutation()` after calling the following `MutationRef` function, both of which are defined in [dairysync/index.d.ts](./index.d.ts):
```typescript
upsertPmoInventoryPeriod(vars: UpsertPmoInventoryPeriodVariables): MutationPromise<UpsertPmoInventoryPeriodData, UpsertPmoInventoryPeriodVariables>;

interface UpsertPmoInventoryPeriodRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: UpsertPmoInventoryPeriodVariables): MutationRef<UpsertPmoInventoryPeriodData, UpsertPmoInventoryPeriodVariables>;
}
export const upsertPmoInventoryPeriodRef: UpsertPmoInventoryPeriodRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `MutationRef` function.
```typescript
upsertPmoInventoryPeriod(dc: DataConnect, vars: UpsertPmoInventoryPeriodVariables): MutationPromise<UpsertPmoInventoryPeriodData, UpsertPmoInventoryPeriodVariables>;

interface UpsertPmoInventoryPeriodRef {
  ...
  (dc: DataConnect, vars: UpsertPmoInventoryPeriodVariables): MutationRef<UpsertPmoInventoryPeriodData, UpsertPmoInventoryPeriodVariables>;
}
export const upsertPmoInventoryPeriodRef: UpsertPmoInventoryPeriodRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the upsertPmoInventoryPeriodRef:
```typescript
const name = upsertPmoInventoryPeriodRef.operationName;
console.log(name);
```

### Variables
The `UpsertPmoInventoryPeriod` mutation requires an argument of type `UpsertPmoInventoryPeriodVariables`, which is defined in [dairysync/index.d.ts](./index.d.ts). It has the following fields:

```typescript
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
```
### Return Type
Recall that executing the `UpsertPmoInventoryPeriod` mutation returns a `MutationPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `UpsertPmoInventoryPeriodData`, which is defined in [dairysync/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface UpsertPmoInventoryPeriodData {
  pmoInventoryPeriod_upsert: PmoInventoryPeriod_Key;
}
```
### Using `UpsertPmoInventoryPeriod`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, upsertPmoInventoryPeriod, UpsertPmoInventoryPeriodVariables } from '@dataconnect/dairysync-generated';

// The `UpsertPmoInventoryPeriod` mutation requires an argument of type `UpsertPmoInventoryPeriodVariables`:
const upsertPmoInventoryPeriodVars: UpsertPmoInventoryPeriodVariables = {
  id: ..., 
  title: ..., 
  sourceFileName: ..., 
  lines: ..., 
  createdAt: ..., 
  createdBy: ..., 
  status: ..., 
  postedAt: ..., // optional
  postedBy: ..., // optional
};

// Call the `upsertPmoInventoryPeriod()` function to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await upsertPmoInventoryPeriod(upsertPmoInventoryPeriodVars);
// Variables can be defined inline as well.
const { data } = await upsertPmoInventoryPeriod({ id: ..., title: ..., sourceFileName: ..., lines: ..., createdAt: ..., createdBy: ..., status: ..., postedAt: ..., postedBy: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await upsertPmoInventoryPeriod(dataConnect, upsertPmoInventoryPeriodVars);

console.log(data.pmoInventoryPeriod_upsert);

// Or, you can use the `Promise` API.
upsertPmoInventoryPeriod(upsertPmoInventoryPeriodVars).then((response) => {
  const data = response.data;
  console.log(data.pmoInventoryPeriod_upsert);
});
```

### Using `UpsertPmoInventoryPeriod`'s `MutationRef` function

```typescript
import { getDataConnect, executeMutation } from 'firebase/data-connect';
import { connectorConfig, upsertPmoInventoryPeriodRef, UpsertPmoInventoryPeriodVariables } from '@dataconnect/dairysync-generated';

// The `UpsertPmoInventoryPeriod` mutation requires an argument of type `UpsertPmoInventoryPeriodVariables`:
const upsertPmoInventoryPeriodVars: UpsertPmoInventoryPeriodVariables = {
  id: ..., 
  title: ..., 
  sourceFileName: ..., 
  lines: ..., 
  createdAt: ..., 
  createdBy: ..., 
  status: ..., 
  postedAt: ..., // optional
  postedBy: ..., // optional
};

// Call the `upsertPmoInventoryPeriodRef()` function to get a reference to the mutation.
const ref = upsertPmoInventoryPeriodRef(upsertPmoInventoryPeriodVars);
// Variables can be defined inline as well.
const ref = upsertPmoInventoryPeriodRef({ id: ..., title: ..., sourceFileName: ..., lines: ..., createdAt: ..., createdBy: ..., status: ..., postedAt: ..., postedBy: ..., });

// You can also pass in a `DataConnect` instance to the `MutationRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = upsertPmoInventoryPeriodRef(dataConnect, upsertPmoInventoryPeriodVars);

// Call `executeMutation()` on the reference to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeMutation(ref);

console.log(data.pmoInventoryPeriod_upsert);

// Or, you can use the `Promise` API.
executeMutation(ref).then((response) => {
  const data = response.data;
  console.log(data.pmoInventoryPeriod_upsert);
});
```

## UpsertFinishedGood
You can execute the `UpsertFinishedGood` mutation using the following action shortcut function, or by calling `executeMutation()` after calling the following `MutationRef` function, both of which are defined in [dairysync/index.d.ts](./index.d.ts):
```typescript
upsertFinishedGood(vars: UpsertFinishedGoodVariables): MutationPromise<UpsertFinishedGoodData, UpsertFinishedGoodVariables>;

interface UpsertFinishedGoodRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: UpsertFinishedGoodVariables): MutationRef<UpsertFinishedGoodData, UpsertFinishedGoodVariables>;
}
export const upsertFinishedGoodRef: UpsertFinishedGoodRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `MutationRef` function.
```typescript
upsertFinishedGood(dc: DataConnect, vars: UpsertFinishedGoodVariables): MutationPromise<UpsertFinishedGoodData, UpsertFinishedGoodVariables>;

interface UpsertFinishedGoodRef {
  ...
  (dc: DataConnect, vars: UpsertFinishedGoodVariables): MutationRef<UpsertFinishedGoodData, UpsertFinishedGoodVariables>;
}
export const upsertFinishedGoodRef: UpsertFinishedGoodRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the upsertFinishedGoodRef:
```typescript
const name = upsertFinishedGoodRef.operationName;
console.log(name);
```

### Variables
The `UpsertFinishedGood` mutation requires an argument of type `UpsertFinishedGoodVariables`, which is defined in [dairysync/index.d.ts](./index.d.ts). It has the following fields:

```typescript
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
```
### Return Type
Recall that executing the `UpsertFinishedGood` mutation returns a `MutationPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `UpsertFinishedGoodData`, which is defined in [dairysync/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface UpsertFinishedGoodData {
  finishedGood_upsert: FinishedGood_Key;
}
```
### Using `UpsertFinishedGood`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, upsertFinishedGood, UpsertFinishedGoodVariables } from '@dataconnect/dairysync-generated';

// The `UpsertFinishedGood` mutation requires an argument of type `UpsertFinishedGoodVariables`:
const upsertFinishedGoodVars: UpsertFinishedGoodVariables = {
  id: ..., 
  sku: ..., 
  name: ..., 
  category: ..., 
  currentStock: ..., 
  unit: ..., 
  coldStorageCapacity: ..., 
  maxThreshold: ..., 
  safetyStock: ..., 
  unitPrice: ..., 
  allocatedFeedingProgram: ..., 
  allocatedRetail: ..., 
  recipe: ..., 
  batchUnitQuantity: ..., 
  shelfLifeDays: ..., 
  location: ..., 
};

// Call the `upsertFinishedGood()` function to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await upsertFinishedGood(upsertFinishedGoodVars);
// Variables can be defined inline as well.
const { data } = await upsertFinishedGood({ id: ..., sku: ..., name: ..., category: ..., currentStock: ..., unit: ..., coldStorageCapacity: ..., maxThreshold: ..., safetyStock: ..., unitPrice: ..., allocatedFeedingProgram: ..., allocatedRetail: ..., recipe: ..., batchUnitQuantity: ..., shelfLifeDays: ..., location: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await upsertFinishedGood(dataConnect, upsertFinishedGoodVars);

console.log(data.finishedGood_upsert);

// Or, you can use the `Promise` API.
upsertFinishedGood(upsertFinishedGoodVars).then((response) => {
  const data = response.data;
  console.log(data.finishedGood_upsert);
});
```

### Using `UpsertFinishedGood`'s `MutationRef` function

```typescript
import { getDataConnect, executeMutation } from 'firebase/data-connect';
import { connectorConfig, upsertFinishedGoodRef, UpsertFinishedGoodVariables } from '@dataconnect/dairysync-generated';

// The `UpsertFinishedGood` mutation requires an argument of type `UpsertFinishedGoodVariables`:
const upsertFinishedGoodVars: UpsertFinishedGoodVariables = {
  id: ..., 
  sku: ..., 
  name: ..., 
  category: ..., 
  currentStock: ..., 
  unit: ..., 
  coldStorageCapacity: ..., 
  maxThreshold: ..., 
  safetyStock: ..., 
  unitPrice: ..., 
  allocatedFeedingProgram: ..., 
  allocatedRetail: ..., 
  recipe: ..., 
  batchUnitQuantity: ..., 
  shelfLifeDays: ..., 
  location: ..., 
};

// Call the `upsertFinishedGoodRef()` function to get a reference to the mutation.
const ref = upsertFinishedGoodRef(upsertFinishedGoodVars);
// Variables can be defined inline as well.
const ref = upsertFinishedGoodRef({ id: ..., sku: ..., name: ..., category: ..., currentStock: ..., unit: ..., coldStorageCapacity: ..., maxThreshold: ..., safetyStock: ..., unitPrice: ..., allocatedFeedingProgram: ..., allocatedRetail: ..., recipe: ..., batchUnitQuantity: ..., shelfLifeDays: ..., location: ..., });

// You can also pass in a `DataConnect` instance to the `MutationRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = upsertFinishedGoodRef(dataConnect, upsertFinishedGoodVars);

// Call `executeMutation()` on the reference to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeMutation(ref);

console.log(data.finishedGood_upsert);

// Or, you can use the `Promise` API.
executeMutation(ref).then((response) => {
  const data = response.data;
  console.log(data.finishedGood_upsert);
});
```

## SetRetailFinishedGoodStock
You can execute the `SetRetailFinishedGoodStock` mutation using the following action shortcut function, or by calling `executeMutation()` after calling the following `MutationRef` function, both of which are defined in [dairysync/index.d.ts](./index.d.ts):
```typescript
setRetailFinishedGoodStock(vars: SetRetailFinishedGoodStockVariables): MutationPromise<SetRetailFinishedGoodStockData, SetRetailFinishedGoodStockVariables>;

interface SetRetailFinishedGoodStockRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: SetRetailFinishedGoodStockVariables): MutationRef<SetRetailFinishedGoodStockData, SetRetailFinishedGoodStockVariables>;
}
export const setRetailFinishedGoodStockRef: SetRetailFinishedGoodStockRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `MutationRef` function.
```typescript
setRetailFinishedGoodStock(dc: DataConnect, vars: SetRetailFinishedGoodStockVariables): MutationPromise<SetRetailFinishedGoodStockData, SetRetailFinishedGoodStockVariables>;

interface SetRetailFinishedGoodStockRef {
  ...
  (dc: DataConnect, vars: SetRetailFinishedGoodStockVariables): MutationRef<SetRetailFinishedGoodStockData, SetRetailFinishedGoodStockVariables>;
}
export const setRetailFinishedGoodStockRef: SetRetailFinishedGoodStockRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the setRetailFinishedGoodStockRef:
```typescript
const name = setRetailFinishedGoodStockRef.operationName;
console.log(name);
```

### Variables
The `SetRetailFinishedGoodStock` mutation requires an argument of type `SetRetailFinishedGoodStockVariables`, which is defined in [dairysync/index.d.ts](./index.d.ts). It has the following fields:

```typescript
export interface SetRetailFinishedGoodStockVariables {
  id: string;
  currentStock: number;
  allocatedRetail: number;
}
```
### Return Type
Recall that executing the `SetRetailFinishedGoodStock` mutation returns a `MutationPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `SetRetailFinishedGoodStockData`, which is defined in [dairysync/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface SetRetailFinishedGoodStockData {
  finishedGood_update?: FinishedGood_Key | null;
}
```
### Using `SetRetailFinishedGoodStock`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, setRetailFinishedGoodStock, SetRetailFinishedGoodStockVariables } from '@dataconnect/dairysync-generated';

// The `SetRetailFinishedGoodStock` mutation requires an argument of type `SetRetailFinishedGoodStockVariables`:
const setRetailFinishedGoodStockVars: SetRetailFinishedGoodStockVariables = {
  id: ..., 
  currentStock: ..., 
  allocatedRetail: ..., 
};

// Call the `setRetailFinishedGoodStock()` function to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await setRetailFinishedGoodStock(setRetailFinishedGoodStockVars);
// Variables can be defined inline as well.
const { data } = await setRetailFinishedGoodStock({ id: ..., currentStock: ..., allocatedRetail: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await setRetailFinishedGoodStock(dataConnect, setRetailFinishedGoodStockVars);

console.log(data.finishedGood_update);

// Or, you can use the `Promise` API.
setRetailFinishedGoodStock(setRetailFinishedGoodStockVars).then((response) => {
  const data = response.data;
  console.log(data.finishedGood_update);
});
```

### Using `SetRetailFinishedGoodStock`'s `MutationRef` function

```typescript
import { getDataConnect, executeMutation } from 'firebase/data-connect';
import { connectorConfig, setRetailFinishedGoodStockRef, SetRetailFinishedGoodStockVariables } from '@dataconnect/dairysync-generated';

// The `SetRetailFinishedGoodStock` mutation requires an argument of type `SetRetailFinishedGoodStockVariables`:
const setRetailFinishedGoodStockVars: SetRetailFinishedGoodStockVariables = {
  id: ..., 
  currentStock: ..., 
  allocatedRetail: ..., 
};

// Call the `setRetailFinishedGoodStockRef()` function to get a reference to the mutation.
const ref = setRetailFinishedGoodStockRef(setRetailFinishedGoodStockVars);
// Variables can be defined inline as well.
const ref = setRetailFinishedGoodStockRef({ id: ..., currentStock: ..., allocatedRetail: ..., });

// You can also pass in a `DataConnect` instance to the `MutationRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = setRetailFinishedGoodStockRef(dataConnect, setRetailFinishedGoodStockVars);

// Call `executeMutation()` on the reference to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeMutation(ref);

console.log(data.finishedGood_update);

// Or, you can use the `Promise` API.
executeMutation(ref).then((response) => {
  const data = response.data;
  console.log(data.finishedGood_update);
});
```

## DeleteFinishedGood
You can execute the `DeleteFinishedGood` mutation using the following action shortcut function, or by calling `executeMutation()` after calling the following `MutationRef` function, both of which are defined in [dairysync/index.d.ts](./index.d.ts):
```typescript
deleteFinishedGood(vars: DeleteFinishedGoodVariables): MutationPromise<DeleteFinishedGoodData, DeleteFinishedGoodVariables>;

interface DeleteFinishedGoodRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: DeleteFinishedGoodVariables): MutationRef<DeleteFinishedGoodData, DeleteFinishedGoodVariables>;
}
export const deleteFinishedGoodRef: DeleteFinishedGoodRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `MutationRef` function.
```typescript
deleteFinishedGood(dc: DataConnect, vars: DeleteFinishedGoodVariables): MutationPromise<DeleteFinishedGoodData, DeleteFinishedGoodVariables>;

interface DeleteFinishedGoodRef {
  ...
  (dc: DataConnect, vars: DeleteFinishedGoodVariables): MutationRef<DeleteFinishedGoodData, DeleteFinishedGoodVariables>;
}
export const deleteFinishedGoodRef: DeleteFinishedGoodRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the deleteFinishedGoodRef:
```typescript
const name = deleteFinishedGoodRef.operationName;
console.log(name);
```

### Variables
The `DeleteFinishedGood` mutation requires an argument of type `DeleteFinishedGoodVariables`, which is defined in [dairysync/index.d.ts](./index.d.ts). It has the following fields:

```typescript
export interface DeleteFinishedGoodVariables {
  id: string;
}
```
### Return Type
Recall that executing the `DeleteFinishedGood` mutation returns a `MutationPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `DeleteFinishedGoodData`, which is defined in [dairysync/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface DeleteFinishedGoodData {
  finishedGood_delete?: FinishedGood_Key | null;
}
```
### Using `DeleteFinishedGood`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, deleteFinishedGood, DeleteFinishedGoodVariables } from '@dataconnect/dairysync-generated';

// The `DeleteFinishedGood` mutation requires an argument of type `DeleteFinishedGoodVariables`:
const deleteFinishedGoodVars: DeleteFinishedGoodVariables = {
  id: ..., 
};

// Call the `deleteFinishedGood()` function to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await deleteFinishedGood(deleteFinishedGoodVars);
// Variables can be defined inline as well.
const { data } = await deleteFinishedGood({ id: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await deleteFinishedGood(dataConnect, deleteFinishedGoodVars);

console.log(data.finishedGood_delete);

// Or, you can use the `Promise` API.
deleteFinishedGood(deleteFinishedGoodVars).then((response) => {
  const data = response.data;
  console.log(data.finishedGood_delete);
});
```

### Using `DeleteFinishedGood`'s `MutationRef` function

```typescript
import { getDataConnect, executeMutation } from 'firebase/data-connect';
import { connectorConfig, deleteFinishedGoodRef, DeleteFinishedGoodVariables } from '@dataconnect/dairysync-generated';

// The `DeleteFinishedGood` mutation requires an argument of type `DeleteFinishedGoodVariables`:
const deleteFinishedGoodVars: DeleteFinishedGoodVariables = {
  id: ..., 
};

// Call the `deleteFinishedGoodRef()` function to get a reference to the mutation.
const ref = deleteFinishedGoodRef(deleteFinishedGoodVars);
// Variables can be defined inline as well.
const ref = deleteFinishedGoodRef({ id: ..., });

// You can also pass in a `DataConnect` instance to the `MutationRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = deleteFinishedGoodRef(dataConnect, deleteFinishedGoodVars);

// Call `executeMutation()` on the reference to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeMutation(ref);

console.log(data.finishedGood_delete);

// Or, you can use the `Promise` API.
executeMutation(ref).then((response) => {
  const data = response.data;
  console.log(data.finishedGood_delete);
});
```

## UpsertWipBatch
You can execute the `UpsertWipBatch` mutation using the following action shortcut function, or by calling `executeMutation()` after calling the following `MutationRef` function, both of which are defined in [dairysync/index.d.ts](./index.d.ts):
```typescript
upsertWipBatch(vars: UpsertWipBatchVariables): MutationPromise<UpsertWipBatchData, UpsertWipBatchVariables>;

interface UpsertWipBatchRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: UpsertWipBatchVariables): MutationRef<UpsertWipBatchData, UpsertWipBatchVariables>;
}
export const upsertWipBatchRef: UpsertWipBatchRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `MutationRef` function.
```typescript
upsertWipBatch(dc: DataConnect, vars: UpsertWipBatchVariables): MutationPromise<UpsertWipBatchData, UpsertWipBatchVariables>;

interface UpsertWipBatchRef {
  ...
  (dc: DataConnect, vars: UpsertWipBatchVariables): MutationRef<UpsertWipBatchData, UpsertWipBatchVariables>;
}
export const upsertWipBatchRef: UpsertWipBatchRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the upsertWipBatchRef:
```typescript
const name = upsertWipBatchRef.operationName;
console.log(name);
```

### Variables
The `UpsertWipBatch` mutation requires an argument of type `UpsertWipBatchVariables`, which is defined in [dairysync/index.d.ts](./index.d.ts). It has the following fields:

```typescript
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
```
### Return Type
Recall that executing the `UpsertWipBatch` mutation returns a `MutationPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `UpsertWipBatchData`, which is defined in [dairysync/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface UpsertWipBatchData {
  wipBatch_upsert: WipBatch_Key;
}
```
### Using `UpsertWipBatch`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, upsertWipBatch, UpsertWipBatchVariables } from '@dataconnect/dairysync-generated';

// The `UpsertWipBatch` mutation requires an argument of type `UpsertWipBatchVariables`:
const upsertWipBatchVars: UpsertWipBatchVariables = {
  id: ..., 
  batchNumber: ..., 
  productId: ..., 
  productName: ..., 
  targetQuantity: ..., 
  rawMilkVolumeUsed: ..., 
  ingredientsUsed: ..., 
  status: ..., 
  assignedStaff: ..., 
  startDate: ..., 
  estimatedCompletion: ..., 
  completedAt: ..., // optional
  cancellationReason: ..., // optional
  cancelledAt: ..., // optional
  notes: ..., // optional
  coldStorageTemp: ..., 
};

// Call the `upsertWipBatch()` function to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await upsertWipBatch(upsertWipBatchVars);
// Variables can be defined inline as well.
const { data } = await upsertWipBatch({ id: ..., batchNumber: ..., productId: ..., productName: ..., targetQuantity: ..., rawMilkVolumeUsed: ..., ingredientsUsed: ..., status: ..., assignedStaff: ..., startDate: ..., estimatedCompletion: ..., completedAt: ..., cancellationReason: ..., cancelledAt: ..., notes: ..., coldStorageTemp: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await upsertWipBatch(dataConnect, upsertWipBatchVars);

console.log(data.wipBatch_upsert);

// Or, you can use the `Promise` API.
upsertWipBatch(upsertWipBatchVars).then((response) => {
  const data = response.data;
  console.log(data.wipBatch_upsert);
});
```

### Using `UpsertWipBatch`'s `MutationRef` function

```typescript
import { getDataConnect, executeMutation } from 'firebase/data-connect';
import { connectorConfig, upsertWipBatchRef, UpsertWipBatchVariables } from '@dataconnect/dairysync-generated';

// The `UpsertWipBatch` mutation requires an argument of type `UpsertWipBatchVariables`:
const upsertWipBatchVars: UpsertWipBatchVariables = {
  id: ..., 
  batchNumber: ..., 
  productId: ..., 
  productName: ..., 
  targetQuantity: ..., 
  rawMilkVolumeUsed: ..., 
  ingredientsUsed: ..., 
  status: ..., 
  assignedStaff: ..., 
  startDate: ..., 
  estimatedCompletion: ..., 
  completedAt: ..., // optional
  cancellationReason: ..., // optional
  cancelledAt: ..., // optional
  notes: ..., // optional
  coldStorageTemp: ..., 
};

// Call the `upsertWipBatchRef()` function to get a reference to the mutation.
const ref = upsertWipBatchRef(upsertWipBatchVars);
// Variables can be defined inline as well.
const ref = upsertWipBatchRef({ id: ..., batchNumber: ..., productId: ..., productName: ..., targetQuantity: ..., rawMilkVolumeUsed: ..., ingredientsUsed: ..., status: ..., assignedStaff: ..., startDate: ..., estimatedCompletion: ..., completedAt: ..., cancellationReason: ..., cancelledAt: ..., notes: ..., coldStorageTemp: ..., });

// You can also pass in a `DataConnect` instance to the `MutationRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = upsertWipBatchRef(dataConnect, upsertWipBatchVars);

// Call `executeMutation()` on the reference to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeMutation(ref);

console.log(data.wipBatch_upsert);

// Or, you can use the `Promise` API.
executeMutation(ref).then((response) => {
  const data = response.data;
  console.log(data.wipBatch_upsert);
});
```

## DeleteWipBatch
You can execute the `DeleteWipBatch` mutation using the following action shortcut function, or by calling `executeMutation()` after calling the following `MutationRef` function, both of which are defined in [dairysync/index.d.ts](./index.d.ts):
```typescript
deleteWipBatch(vars: DeleteWipBatchVariables): MutationPromise<DeleteWipBatchData, DeleteWipBatchVariables>;

interface DeleteWipBatchRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: DeleteWipBatchVariables): MutationRef<DeleteWipBatchData, DeleteWipBatchVariables>;
}
export const deleteWipBatchRef: DeleteWipBatchRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `MutationRef` function.
```typescript
deleteWipBatch(dc: DataConnect, vars: DeleteWipBatchVariables): MutationPromise<DeleteWipBatchData, DeleteWipBatchVariables>;

interface DeleteWipBatchRef {
  ...
  (dc: DataConnect, vars: DeleteWipBatchVariables): MutationRef<DeleteWipBatchData, DeleteWipBatchVariables>;
}
export const deleteWipBatchRef: DeleteWipBatchRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the deleteWipBatchRef:
```typescript
const name = deleteWipBatchRef.operationName;
console.log(name);
```

### Variables
The `DeleteWipBatch` mutation requires an argument of type `DeleteWipBatchVariables`, which is defined in [dairysync/index.d.ts](./index.d.ts). It has the following fields:

```typescript
export interface DeleteWipBatchVariables {
  id: string;
}
```
### Return Type
Recall that executing the `DeleteWipBatch` mutation returns a `MutationPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `DeleteWipBatchData`, which is defined in [dairysync/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface DeleteWipBatchData {
  wipBatch_delete?: WipBatch_Key | null;
}
```
### Using `DeleteWipBatch`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, deleteWipBatch, DeleteWipBatchVariables } from '@dataconnect/dairysync-generated';

// The `DeleteWipBatch` mutation requires an argument of type `DeleteWipBatchVariables`:
const deleteWipBatchVars: DeleteWipBatchVariables = {
  id: ..., 
};

// Call the `deleteWipBatch()` function to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await deleteWipBatch(deleteWipBatchVars);
// Variables can be defined inline as well.
const { data } = await deleteWipBatch({ id: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await deleteWipBatch(dataConnect, deleteWipBatchVars);

console.log(data.wipBatch_delete);

// Or, you can use the `Promise` API.
deleteWipBatch(deleteWipBatchVars).then((response) => {
  const data = response.data;
  console.log(data.wipBatch_delete);
});
```

### Using `DeleteWipBatch`'s `MutationRef` function

```typescript
import { getDataConnect, executeMutation } from 'firebase/data-connect';
import { connectorConfig, deleteWipBatchRef, DeleteWipBatchVariables } from '@dataconnect/dairysync-generated';

// The `DeleteWipBatch` mutation requires an argument of type `DeleteWipBatchVariables`:
const deleteWipBatchVars: DeleteWipBatchVariables = {
  id: ..., 
};

// Call the `deleteWipBatchRef()` function to get a reference to the mutation.
const ref = deleteWipBatchRef(deleteWipBatchVars);
// Variables can be defined inline as well.
const ref = deleteWipBatchRef({ id: ..., });

// You can also pass in a `DataConnect` instance to the `MutationRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = deleteWipBatchRef(dataConnect, deleteWipBatchVars);

// Call `executeMutation()` on the reference to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeMutation(ref);

console.log(data.wipBatch_delete);

// Or, you can use the `Promise` API.
executeMutation(ref).then((response) => {
  const data = response.data;
  console.log(data.wipBatch_delete);
});
```

## UpsertCommitment
You can execute the `UpsertCommitment` mutation using the following action shortcut function, or by calling `executeMutation()` after calling the following `MutationRef` function, both of which are defined in [dairysync/index.d.ts](./index.d.ts):
```typescript
upsertCommitment(vars: UpsertCommitmentVariables): MutationPromise<UpsertCommitmentData, UpsertCommitmentVariables>;

interface UpsertCommitmentRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: UpsertCommitmentVariables): MutationRef<UpsertCommitmentData, UpsertCommitmentVariables>;
}
export const upsertCommitmentRef: UpsertCommitmentRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `MutationRef` function.
```typescript
upsertCommitment(dc: DataConnect, vars: UpsertCommitmentVariables): MutationPromise<UpsertCommitmentData, UpsertCommitmentVariables>;

interface UpsertCommitmentRef {
  ...
  (dc: DataConnect, vars: UpsertCommitmentVariables): MutationRef<UpsertCommitmentData, UpsertCommitmentVariables>;
}
export const upsertCommitmentRef: UpsertCommitmentRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the upsertCommitmentRef:
```typescript
const name = upsertCommitmentRef.operationName;
console.log(name);
```

### Variables
The `UpsertCommitment` mutation requires an argument of type `UpsertCommitmentVariables`, which is defined in [dairysync/index.d.ts](./index.d.ts). It has the following fields:

```typescript
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
```
### Return Type
Recall that executing the `UpsertCommitment` mutation returns a `MutationPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `UpsertCommitmentData`, which is defined in [dairysync/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface UpsertCommitmentData {
  supplyDemandCommitment_upsert: SupplyDemandCommitment_Key;
}
```
### Using `UpsertCommitment`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, upsertCommitment, UpsertCommitmentVariables } from '@dataconnect/dairysync-generated';

// The `UpsertCommitment` mutation requires an argument of type `UpsertCommitmentVariables`:
const upsertCommitmentVars: UpsertCommitmentVariables = {
  id: ..., 
  type: ..., 
  partnerName: ..., 
  contactPerson: ..., // optional
  scheduledDate: ..., 
  itemOrMilk: ..., 
  targetQuantity: ..., 
  fulfilledQuantity: ..., 
  unit: ..., 
  status: ..., 
  priority: ..., 
  cancellationReason: ..., // optional
  cancelledAt: ..., // optional
};

// Call the `upsertCommitment()` function to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await upsertCommitment(upsertCommitmentVars);
// Variables can be defined inline as well.
const { data } = await upsertCommitment({ id: ..., type: ..., partnerName: ..., contactPerson: ..., scheduledDate: ..., itemOrMilk: ..., targetQuantity: ..., fulfilledQuantity: ..., unit: ..., status: ..., priority: ..., cancellationReason: ..., cancelledAt: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await upsertCommitment(dataConnect, upsertCommitmentVars);

console.log(data.supplyDemandCommitment_upsert);

// Or, you can use the `Promise` API.
upsertCommitment(upsertCommitmentVars).then((response) => {
  const data = response.data;
  console.log(data.supplyDemandCommitment_upsert);
});
```

### Using `UpsertCommitment`'s `MutationRef` function

```typescript
import { getDataConnect, executeMutation } from 'firebase/data-connect';
import { connectorConfig, upsertCommitmentRef, UpsertCommitmentVariables } from '@dataconnect/dairysync-generated';

// The `UpsertCommitment` mutation requires an argument of type `UpsertCommitmentVariables`:
const upsertCommitmentVars: UpsertCommitmentVariables = {
  id: ..., 
  type: ..., 
  partnerName: ..., 
  contactPerson: ..., // optional
  scheduledDate: ..., 
  itemOrMilk: ..., 
  targetQuantity: ..., 
  fulfilledQuantity: ..., 
  unit: ..., 
  status: ..., 
  priority: ..., 
  cancellationReason: ..., // optional
  cancelledAt: ..., // optional
};

// Call the `upsertCommitmentRef()` function to get a reference to the mutation.
const ref = upsertCommitmentRef(upsertCommitmentVars);
// Variables can be defined inline as well.
const ref = upsertCommitmentRef({ id: ..., type: ..., partnerName: ..., contactPerson: ..., scheduledDate: ..., itemOrMilk: ..., targetQuantity: ..., fulfilledQuantity: ..., unit: ..., status: ..., priority: ..., cancellationReason: ..., cancelledAt: ..., });

// You can also pass in a `DataConnect` instance to the `MutationRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = upsertCommitmentRef(dataConnect, upsertCommitmentVars);

// Call `executeMutation()` on the reference to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeMutation(ref);

console.log(data.supplyDemandCommitment_upsert);

// Or, you can use the `Promise` API.
executeMutation(ref).then((response) => {
  const data = response.data;
  console.log(data.supplyDemandCommitment_upsert);
});
```

## DeleteCommitment
You can execute the `DeleteCommitment` mutation using the following action shortcut function, or by calling `executeMutation()` after calling the following `MutationRef` function, both of which are defined in [dairysync/index.d.ts](./index.d.ts):
```typescript
deleteCommitment(vars: DeleteCommitmentVariables): MutationPromise<DeleteCommitmentData, DeleteCommitmentVariables>;

interface DeleteCommitmentRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: DeleteCommitmentVariables): MutationRef<DeleteCommitmentData, DeleteCommitmentVariables>;
}
export const deleteCommitmentRef: DeleteCommitmentRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `MutationRef` function.
```typescript
deleteCommitment(dc: DataConnect, vars: DeleteCommitmentVariables): MutationPromise<DeleteCommitmentData, DeleteCommitmentVariables>;

interface DeleteCommitmentRef {
  ...
  (dc: DataConnect, vars: DeleteCommitmentVariables): MutationRef<DeleteCommitmentData, DeleteCommitmentVariables>;
}
export const deleteCommitmentRef: DeleteCommitmentRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the deleteCommitmentRef:
```typescript
const name = deleteCommitmentRef.operationName;
console.log(name);
```

### Variables
The `DeleteCommitment` mutation requires an argument of type `DeleteCommitmentVariables`, which is defined in [dairysync/index.d.ts](./index.d.ts). It has the following fields:

```typescript
export interface DeleteCommitmentVariables {
  id: string;
}
```
### Return Type
Recall that executing the `DeleteCommitment` mutation returns a `MutationPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `DeleteCommitmentData`, which is defined in [dairysync/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface DeleteCommitmentData {
  supplyDemandCommitment_delete?: SupplyDemandCommitment_Key | null;
}
```
### Using `DeleteCommitment`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, deleteCommitment, DeleteCommitmentVariables } from '@dataconnect/dairysync-generated';

// The `DeleteCommitment` mutation requires an argument of type `DeleteCommitmentVariables`:
const deleteCommitmentVars: DeleteCommitmentVariables = {
  id: ..., 
};

// Call the `deleteCommitment()` function to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await deleteCommitment(deleteCommitmentVars);
// Variables can be defined inline as well.
const { data } = await deleteCommitment({ id: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await deleteCommitment(dataConnect, deleteCommitmentVars);

console.log(data.supplyDemandCommitment_delete);

// Or, you can use the `Promise` API.
deleteCommitment(deleteCommitmentVars).then((response) => {
  const data = response.data;
  console.log(data.supplyDemandCommitment_delete);
});
```

### Using `DeleteCommitment`'s `MutationRef` function

```typescript
import { getDataConnect, executeMutation } from 'firebase/data-connect';
import { connectorConfig, deleteCommitmentRef, DeleteCommitmentVariables } from '@dataconnect/dairysync-generated';

// The `DeleteCommitment` mutation requires an argument of type `DeleteCommitmentVariables`:
const deleteCommitmentVars: DeleteCommitmentVariables = {
  id: ..., 
};

// Call the `deleteCommitmentRef()` function to get a reference to the mutation.
const ref = deleteCommitmentRef(deleteCommitmentVars);
// Variables can be defined inline as well.
const ref = deleteCommitmentRef({ id: ..., });

// You can also pass in a `DataConnect` instance to the `MutationRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = deleteCommitmentRef(dataConnect, deleteCommitmentVars);

// Call `executeMutation()` on the reference to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeMutation(ref);

console.log(data.supplyDemandCommitment_delete);

// Or, you can use the `Promise` API.
executeMutation(ref).then((response) => {
  const data = response.data;
  console.log(data.supplyDemandCommitment_delete);
});
```

## UpsertSystemAlert
You can execute the `UpsertSystemAlert` mutation using the following action shortcut function, or by calling `executeMutation()` after calling the following `MutationRef` function, both of which are defined in [dairysync/index.d.ts](./index.d.ts):
```typescript
upsertSystemAlert(vars: UpsertSystemAlertVariables): MutationPromise<UpsertSystemAlertData, UpsertSystemAlertVariables>;

interface UpsertSystemAlertRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: UpsertSystemAlertVariables): MutationRef<UpsertSystemAlertData, UpsertSystemAlertVariables>;
}
export const upsertSystemAlertRef: UpsertSystemAlertRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `MutationRef` function.
```typescript
upsertSystemAlert(dc: DataConnect, vars: UpsertSystemAlertVariables): MutationPromise<UpsertSystemAlertData, UpsertSystemAlertVariables>;

interface UpsertSystemAlertRef {
  ...
  (dc: DataConnect, vars: UpsertSystemAlertVariables): MutationRef<UpsertSystemAlertData, UpsertSystemAlertVariables>;
}
export const upsertSystemAlertRef: UpsertSystemAlertRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the upsertSystemAlertRef:
```typescript
const name = upsertSystemAlertRef.operationName;
console.log(name);
```

### Variables
The `UpsertSystemAlert` mutation requires an argument of type `UpsertSystemAlertVariables`, which is defined in [dairysync/index.d.ts](./index.d.ts). It has the following fields:

```typescript
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
```
### Return Type
Recall that executing the `UpsertSystemAlert` mutation returns a `MutationPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `UpsertSystemAlertData`, which is defined in [dairysync/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface UpsertSystemAlertData {
  systemAlert_upsert: SystemAlert_Key;
}
```
### Using `UpsertSystemAlert`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, upsertSystemAlert, UpsertSystemAlertVariables } from '@dataconnect/dairysync-generated';

// The `UpsertSystemAlert` mutation requires an argument of type `UpsertSystemAlertVariables`:
const upsertSystemAlertVars: UpsertSystemAlertVariables = {
  id: ..., 
  timestamp: ..., 
  type: ..., 
  title: ..., 
  message: ..., 
  severity: ..., 
  read: ..., 
  targetRole: ..., // optional
};

// Call the `upsertSystemAlert()` function to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await upsertSystemAlert(upsertSystemAlertVars);
// Variables can be defined inline as well.
const { data } = await upsertSystemAlert({ id: ..., timestamp: ..., type: ..., title: ..., message: ..., severity: ..., read: ..., targetRole: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await upsertSystemAlert(dataConnect, upsertSystemAlertVars);

console.log(data.systemAlert_upsert);

// Or, you can use the `Promise` API.
upsertSystemAlert(upsertSystemAlertVars).then((response) => {
  const data = response.data;
  console.log(data.systemAlert_upsert);
});
```

### Using `UpsertSystemAlert`'s `MutationRef` function

```typescript
import { getDataConnect, executeMutation } from 'firebase/data-connect';
import { connectorConfig, upsertSystemAlertRef, UpsertSystemAlertVariables } from '@dataconnect/dairysync-generated';

// The `UpsertSystemAlert` mutation requires an argument of type `UpsertSystemAlertVariables`:
const upsertSystemAlertVars: UpsertSystemAlertVariables = {
  id: ..., 
  timestamp: ..., 
  type: ..., 
  title: ..., 
  message: ..., 
  severity: ..., 
  read: ..., 
  targetRole: ..., // optional
};

// Call the `upsertSystemAlertRef()` function to get a reference to the mutation.
const ref = upsertSystemAlertRef(upsertSystemAlertVars);
// Variables can be defined inline as well.
const ref = upsertSystemAlertRef({ id: ..., timestamp: ..., type: ..., title: ..., message: ..., severity: ..., read: ..., targetRole: ..., });

// You can also pass in a `DataConnect` instance to the `MutationRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = upsertSystemAlertRef(dataConnect, upsertSystemAlertVars);

// Call `executeMutation()` on the reference to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeMutation(ref);

console.log(data.systemAlert_upsert);

// Or, you can use the `Promise` API.
executeMutation(ref).then((response) => {
  const data = response.data;
  console.log(data.systemAlert_upsert);
});
```

## DeleteSystemAlert
You can execute the `DeleteSystemAlert` mutation using the following action shortcut function, or by calling `executeMutation()` after calling the following `MutationRef` function, both of which are defined in [dairysync/index.d.ts](./index.d.ts):
```typescript
deleteSystemAlert(vars: DeleteSystemAlertVariables): MutationPromise<DeleteSystemAlertData, DeleteSystemAlertVariables>;

interface DeleteSystemAlertRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: DeleteSystemAlertVariables): MutationRef<DeleteSystemAlertData, DeleteSystemAlertVariables>;
}
export const deleteSystemAlertRef: DeleteSystemAlertRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `MutationRef` function.
```typescript
deleteSystemAlert(dc: DataConnect, vars: DeleteSystemAlertVariables): MutationPromise<DeleteSystemAlertData, DeleteSystemAlertVariables>;

interface DeleteSystemAlertRef {
  ...
  (dc: DataConnect, vars: DeleteSystemAlertVariables): MutationRef<DeleteSystemAlertData, DeleteSystemAlertVariables>;
}
export const deleteSystemAlertRef: DeleteSystemAlertRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the deleteSystemAlertRef:
```typescript
const name = deleteSystemAlertRef.operationName;
console.log(name);
```

### Variables
The `DeleteSystemAlert` mutation requires an argument of type `DeleteSystemAlertVariables`, which is defined in [dairysync/index.d.ts](./index.d.ts). It has the following fields:

```typescript
export interface DeleteSystemAlertVariables {
  id: string;
}
```
### Return Type
Recall that executing the `DeleteSystemAlert` mutation returns a `MutationPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `DeleteSystemAlertData`, which is defined in [dairysync/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface DeleteSystemAlertData {
  systemAlert_delete?: SystemAlert_Key | null;
}
```
### Using `DeleteSystemAlert`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, deleteSystemAlert, DeleteSystemAlertVariables } from '@dataconnect/dairysync-generated';

// The `DeleteSystemAlert` mutation requires an argument of type `DeleteSystemAlertVariables`:
const deleteSystemAlertVars: DeleteSystemAlertVariables = {
  id: ..., 
};

// Call the `deleteSystemAlert()` function to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await deleteSystemAlert(deleteSystemAlertVars);
// Variables can be defined inline as well.
const { data } = await deleteSystemAlert({ id: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await deleteSystemAlert(dataConnect, deleteSystemAlertVars);

console.log(data.systemAlert_delete);

// Or, you can use the `Promise` API.
deleteSystemAlert(deleteSystemAlertVars).then((response) => {
  const data = response.data;
  console.log(data.systemAlert_delete);
});
```

### Using `DeleteSystemAlert`'s `MutationRef` function

```typescript
import { getDataConnect, executeMutation } from 'firebase/data-connect';
import { connectorConfig, deleteSystemAlertRef, DeleteSystemAlertVariables } from '@dataconnect/dairysync-generated';

// The `DeleteSystemAlert` mutation requires an argument of type `DeleteSystemAlertVariables`:
const deleteSystemAlertVars: DeleteSystemAlertVariables = {
  id: ..., 
};

// Call the `deleteSystemAlertRef()` function to get a reference to the mutation.
const ref = deleteSystemAlertRef(deleteSystemAlertVars);
// Variables can be defined inline as well.
const ref = deleteSystemAlertRef({ id: ..., });

// You can also pass in a `DataConnect` instance to the `MutationRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = deleteSystemAlertRef(dataConnect, deleteSystemAlertVars);

// Call `executeMutation()` on the reference to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeMutation(ref);

console.log(data.systemAlert_delete);

// Or, you can use the `Promise` API.
executeMutation(ref).then((response) => {
  const data = response.data;
  console.log(data.systemAlert_delete);
});
```

## UpsertIsoRating
You can execute the `UpsertIsoRating` mutation using the following action shortcut function, or by calling `executeMutation()` after calling the following `MutationRef` function, both of which are defined in [dairysync/index.d.ts](./index.d.ts):
```typescript
upsertIsoRating(vars: UpsertIsoRatingVariables): MutationPromise<UpsertIsoRatingData, UpsertIsoRatingVariables>;

interface UpsertIsoRatingRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: UpsertIsoRatingVariables): MutationRef<UpsertIsoRatingData, UpsertIsoRatingVariables>;
}
export const upsertIsoRatingRef: UpsertIsoRatingRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `MutationRef` function.
```typescript
upsertIsoRating(dc: DataConnect, vars: UpsertIsoRatingVariables): MutationPromise<UpsertIsoRatingData, UpsertIsoRatingVariables>;

interface UpsertIsoRatingRef {
  ...
  (dc: DataConnect, vars: UpsertIsoRatingVariables): MutationRef<UpsertIsoRatingData, UpsertIsoRatingVariables>;
}
export const upsertIsoRatingRef: UpsertIsoRatingRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the upsertIsoRatingRef:
```typescript
const name = upsertIsoRatingRef.operationName;
console.log(name);
```

### Variables
The `UpsertIsoRating` mutation requires an argument of type `UpsertIsoRatingVariables`, which is defined in [dairysync/index.d.ts](./index.d.ts). It has the following fields:

```typescript
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
```
### Return Type
Recall that executing the `UpsertIsoRating` mutation returns a `MutationPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `UpsertIsoRatingData`, which is defined in [dairysync/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface UpsertIsoRatingData {
  isoEvaluationRating_upsert: IsoEvaluationRating_Key;
}
```
### Using `UpsertIsoRating`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, upsertIsoRating, UpsertIsoRatingVariables } from '@dataconnect/dairysync-generated';

// The `UpsertIsoRating` mutation requires an argument of type `UpsertIsoRatingVariables`:
const upsertIsoRatingVars: UpsertIsoRatingVariables = {
  id: ..., 
  functionalSuitability: ..., 
  performanceEfficiency: ..., 
  compatibility: ..., 
  interactionCapability: ..., 
  reliability: ..., 
  security: ..., 
  maintainability: ..., 
  flexibility: ..., 
  safety: ..., 
  comments: ..., 
  date: ..., 
};

// Call the `upsertIsoRating()` function to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await upsertIsoRating(upsertIsoRatingVars);
// Variables can be defined inline as well.
const { data } = await upsertIsoRating({ id: ..., functionalSuitability: ..., performanceEfficiency: ..., compatibility: ..., interactionCapability: ..., reliability: ..., security: ..., maintainability: ..., flexibility: ..., safety: ..., comments: ..., date: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await upsertIsoRating(dataConnect, upsertIsoRatingVars);

console.log(data.isoEvaluationRating_upsert);

// Or, you can use the `Promise` API.
upsertIsoRating(upsertIsoRatingVars).then((response) => {
  const data = response.data;
  console.log(data.isoEvaluationRating_upsert);
});
```

### Using `UpsertIsoRating`'s `MutationRef` function

```typescript
import { getDataConnect, executeMutation } from 'firebase/data-connect';
import { connectorConfig, upsertIsoRatingRef, UpsertIsoRatingVariables } from '@dataconnect/dairysync-generated';

// The `UpsertIsoRating` mutation requires an argument of type `UpsertIsoRatingVariables`:
const upsertIsoRatingVars: UpsertIsoRatingVariables = {
  id: ..., 
  functionalSuitability: ..., 
  performanceEfficiency: ..., 
  compatibility: ..., 
  interactionCapability: ..., 
  reliability: ..., 
  security: ..., 
  maintainability: ..., 
  flexibility: ..., 
  safety: ..., 
  comments: ..., 
  date: ..., 
};

// Call the `upsertIsoRatingRef()` function to get a reference to the mutation.
const ref = upsertIsoRatingRef(upsertIsoRatingVars);
// Variables can be defined inline as well.
const ref = upsertIsoRatingRef({ id: ..., functionalSuitability: ..., performanceEfficiency: ..., compatibility: ..., interactionCapability: ..., reliability: ..., security: ..., maintainability: ..., flexibility: ..., safety: ..., comments: ..., date: ..., });

// You can also pass in a `DataConnect` instance to the `MutationRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = upsertIsoRatingRef(dataConnect, upsertIsoRatingVars);

// Call `executeMutation()` on the reference to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeMutation(ref);

console.log(data.isoEvaluationRating_upsert);

// Or, you can use the `Promise` API.
executeMutation(ref).then((response) => {
  const data = response.data;
  console.log(data.isoEvaluationRating_upsert);
});
```

## DeleteIsoRating
You can execute the `DeleteIsoRating` mutation using the following action shortcut function, or by calling `executeMutation()` after calling the following `MutationRef` function, both of which are defined in [dairysync/index.d.ts](./index.d.ts):
```typescript
deleteIsoRating(vars: DeleteIsoRatingVariables): MutationPromise<DeleteIsoRatingData, DeleteIsoRatingVariables>;

interface DeleteIsoRatingRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: DeleteIsoRatingVariables): MutationRef<DeleteIsoRatingData, DeleteIsoRatingVariables>;
}
export const deleteIsoRatingRef: DeleteIsoRatingRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `MutationRef` function.
```typescript
deleteIsoRating(dc: DataConnect, vars: DeleteIsoRatingVariables): MutationPromise<DeleteIsoRatingData, DeleteIsoRatingVariables>;

interface DeleteIsoRatingRef {
  ...
  (dc: DataConnect, vars: DeleteIsoRatingVariables): MutationRef<DeleteIsoRatingData, DeleteIsoRatingVariables>;
}
export const deleteIsoRatingRef: DeleteIsoRatingRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the deleteIsoRatingRef:
```typescript
const name = deleteIsoRatingRef.operationName;
console.log(name);
```

### Variables
The `DeleteIsoRating` mutation requires an argument of type `DeleteIsoRatingVariables`, which is defined in [dairysync/index.d.ts](./index.d.ts). It has the following fields:

```typescript
export interface DeleteIsoRatingVariables {
  id: string;
}
```
### Return Type
Recall that executing the `DeleteIsoRating` mutation returns a `MutationPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `DeleteIsoRatingData`, which is defined in [dairysync/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface DeleteIsoRatingData {
  isoEvaluationRating_delete?: IsoEvaluationRating_Key | null;
}
```
### Using `DeleteIsoRating`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, deleteIsoRating, DeleteIsoRatingVariables } from '@dataconnect/dairysync-generated';

// The `DeleteIsoRating` mutation requires an argument of type `DeleteIsoRatingVariables`:
const deleteIsoRatingVars: DeleteIsoRatingVariables = {
  id: ..., 
};

// Call the `deleteIsoRating()` function to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await deleteIsoRating(deleteIsoRatingVars);
// Variables can be defined inline as well.
const { data } = await deleteIsoRating({ id: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await deleteIsoRating(dataConnect, deleteIsoRatingVars);

console.log(data.isoEvaluationRating_delete);

// Or, you can use the `Promise` API.
deleteIsoRating(deleteIsoRatingVars).then((response) => {
  const data = response.data;
  console.log(data.isoEvaluationRating_delete);
});
```

### Using `DeleteIsoRating`'s `MutationRef` function

```typescript
import { getDataConnect, executeMutation } from 'firebase/data-connect';
import { connectorConfig, deleteIsoRatingRef, DeleteIsoRatingVariables } from '@dataconnect/dairysync-generated';

// The `DeleteIsoRating` mutation requires an argument of type `DeleteIsoRatingVariables`:
const deleteIsoRatingVars: DeleteIsoRatingVariables = {
  id: ..., 
};

// Call the `deleteIsoRatingRef()` function to get a reference to the mutation.
const ref = deleteIsoRatingRef(deleteIsoRatingVars);
// Variables can be defined inline as well.
const ref = deleteIsoRatingRef({ id: ..., });

// You can also pass in a `DataConnect` instance to the `MutationRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = deleteIsoRatingRef(dataConnect, deleteIsoRatingVars);

// Call `executeMutation()` on the reference to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeMutation(ref);

console.log(data.isoEvaluationRating_delete);

// Or, you can use the `Promise` API.
executeMutation(ref).then((response) => {
  const data = response.data;
  console.log(data.isoEvaluationRating_delete);
});
```

## UpsertAuditLogEntry
You can execute the `UpsertAuditLogEntry` mutation using the following action shortcut function, or by calling `executeMutation()` after calling the following `MutationRef` function, both of which are defined in [dairysync/index.d.ts](./index.d.ts):
```typescript
upsertAuditLogEntry(vars: UpsertAuditLogEntryVariables): MutationPromise<UpsertAuditLogEntryData, UpsertAuditLogEntryVariables>;

interface UpsertAuditLogEntryRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: UpsertAuditLogEntryVariables): MutationRef<UpsertAuditLogEntryData, UpsertAuditLogEntryVariables>;
}
export const upsertAuditLogEntryRef: UpsertAuditLogEntryRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `MutationRef` function.
```typescript
upsertAuditLogEntry(dc: DataConnect, vars: UpsertAuditLogEntryVariables): MutationPromise<UpsertAuditLogEntryData, UpsertAuditLogEntryVariables>;

interface UpsertAuditLogEntryRef {
  ...
  (dc: DataConnect, vars: UpsertAuditLogEntryVariables): MutationRef<UpsertAuditLogEntryData, UpsertAuditLogEntryVariables>;
}
export const upsertAuditLogEntryRef: UpsertAuditLogEntryRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the upsertAuditLogEntryRef:
```typescript
const name = upsertAuditLogEntryRef.operationName;
console.log(name);
```

### Variables
The `UpsertAuditLogEntry` mutation requires an argument of type `UpsertAuditLogEntryVariables`, which is defined in [dairysync/index.d.ts](./index.d.ts). It has the following fields:

```typescript
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
```
### Return Type
Recall that executing the `UpsertAuditLogEntry` mutation returns a `MutationPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `UpsertAuditLogEntryData`, which is defined in [dairysync/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface UpsertAuditLogEntryData {
  auditLogEntry_upsert: AuditLogEntry_Key;
}
```
### Using `UpsertAuditLogEntry`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, upsertAuditLogEntry, UpsertAuditLogEntryVariables } from '@dataconnect/dairysync-generated';

// The `UpsertAuditLogEntry` mutation requires an argument of type `UpsertAuditLogEntryVariables`:
const upsertAuditLogEntryVars: UpsertAuditLogEntryVariables = {
  id: ..., 
  timestamp: ..., 
  category: ..., 
  subsystem: ..., 
  action: ..., 
  description: ..., 
  details: ..., // optional
  userName: ..., 
  userTitle: ..., 
  terminalOrStation: ..., // optional
  severity: ..., 
};

// Call the `upsertAuditLogEntry()` function to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await upsertAuditLogEntry(upsertAuditLogEntryVars);
// Variables can be defined inline as well.
const { data } = await upsertAuditLogEntry({ id: ..., timestamp: ..., category: ..., subsystem: ..., action: ..., description: ..., details: ..., userName: ..., userTitle: ..., terminalOrStation: ..., severity: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await upsertAuditLogEntry(dataConnect, upsertAuditLogEntryVars);

console.log(data.auditLogEntry_upsert);

// Or, you can use the `Promise` API.
upsertAuditLogEntry(upsertAuditLogEntryVars).then((response) => {
  const data = response.data;
  console.log(data.auditLogEntry_upsert);
});
```

### Using `UpsertAuditLogEntry`'s `MutationRef` function

```typescript
import { getDataConnect, executeMutation } from 'firebase/data-connect';
import { connectorConfig, upsertAuditLogEntryRef, UpsertAuditLogEntryVariables } from '@dataconnect/dairysync-generated';

// The `UpsertAuditLogEntry` mutation requires an argument of type `UpsertAuditLogEntryVariables`:
const upsertAuditLogEntryVars: UpsertAuditLogEntryVariables = {
  id: ..., 
  timestamp: ..., 
  category: ..., 
  subsystem: ..., 
  action: ..., 
  description: ..., 
  details: ..., // optional
  userName: ..., 
  userTitle: ..., 
  terminalOrStation: ..., // optional
  severity: ..., 
};

// Call the `upsertAuditLogEntryRef()` function to get a reference to the mutation.
const ref = upsertAuditLogEntryRef(upsertAuditLogEntryVars);
// Variables can be defined inline as well.
const ref = upsertAuditLogEntryRef({ id: ..., timestamp: ..., category: ..., subsystem: ..., action: ..., description: ..., details: ..., userName: ..., userTitle: ..., terminalOrStation: ..., severity: ..., });

// You can also pass in a `DataConnect` instance to the `MutationRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = upsertAuditLogEntryRef(dataConnect, upsertAuditLogEntryVars);

// Call `executeMutation()` on the reference to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeMutation(ref);

console.log(data.auditLogEntry_upsert);

// Or, you can use the `Promise` API.
executeMutation(ref).then((response) => {
  const data = response.data;
  console.log(data.auditLogEntry_upsert);
});
```

## DeleteAuditLogEntry
You can execute the `DeleteAuditLogEntry` mutation using the following action shortcut function, or by calling `executeMutation()` after calling the following `MutationRef` function, both of which are defined in [dairysync/index.d.ts](./index.d.ts):
```typescript
deleteAuditLogEntry(vars: DeleteAuditLogEntryVariables): MutationPromise<DeleteAuditLogEntryData, DeleteAuditLogEntryVariables>;

interface DeleteAuditLogEntryRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: DeleteAuditLogEntryVariables): MutationRef<DeleteAuditLogEntryData, DeleteAuditLogEntryVariables>;
}
export const deleteAuditLogEntryRef: DeleteAuditLogEntryRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `MutationRef` function.
```typescript
deleteAuditLogEntry(dc: DataConnect, vars: DeleteAuditLogEntryVariables): MutationPromise<DeleteAuditLogEntryData, DeleteAuditLogEntryVariables>;

interface DeleteAuditLogEntryRef {
  ...
  (dc: DataConnect, vars: DeleteAuditLogEntryVariables): MutationRef<DeleteAuditLogEntryData, DeleteAuditLogEntryVariables>;
}
export const deleteAuditLogEntryRef: DeleteAuditLogEntryRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the deleteAuditLogEntryRef:
```typescript
const name = deleteAuditLogEntryRef.operationName;
console.log(name);
```

### Variables
The `DeleteAuditLogEntry` mutation requires an argument of type `DeleteAuditLogEntryVariables`, which is defined in [dairysync/index.d.ts](./index.d.ts). It has the following fields:

```typescript
export interface DeleteAuditLogEntryVariables {
  id: string;
}
```
### Return Type
Recall that executing the `DeleteAuditLogEntry` mutation returns a `MutationPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `DeleteAuditLogEntryData`, which is defined in [dairysync/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface DeleteAuditLogEntryData {
  auditLogEntry_delete?: AuditLogEntry_Key | null;
}
```
### Using `DeleteAuditLogEntry`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, deleteAuditLogEntry, DeleteAuditLogEntryVariables } from '@dataconnect/dairysync-generated';

// The `DeleteAuditLogEntry` mutation requires an argument of type `DeleteAuditLogEntryVariables`:
const deleteAuditLogEntryVars: DeleteAuditLogEntryVariables = {
  id: ..., 
};

// Call the `deleteAuditLogEntry()` function to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await deleteAuditLogEntry(deleteAuditLogEntryVars);
// Variables can be defined inline as well.
const { data } = await deleteAuditLogEntry({ id: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await deleteAuditLogEntry(dataConnect, deleteAuditLogEntryVars);

console.log(data.auditLogEntry_delete);

// Or, you can use the `Promise` API.
deleteAuditLogEntry(deleteAuditLogEntryVars).then((response) => {
  const data = response.data;
  console.log(data.auditLogEntry_delete);
});
```

### Using `DeleteAuditLogEntry`'s `MutationRef` function

```typescript
import { getDataConnect, executeMutation } from 'firebase/data-connect';
import { connectorConfig, deleteAuditLogEntryRef, DeleteAuditLogEntryVariables } from '@dataconnect/dairysync-generated';

// The `DeleteAuditLogEntry` mutation requires an argument of type `DeleteAuditLogEntryVariables`:
const deleteAuditLogEntryVars: DeleteAuditLogEntryVariables = {
  id: ..., 
};

// Call the `deleteAuditLogEntryRef()` function to get a reference to the mutation.
const ref = deleteAuditLogEntryRef(deleteAuditLogEntryVars);
// Variables can be defined inline as well.
const ref = deleteAuditLogEntryRef({ id: ..., });

// You can also pass in a `DataConnect` instance to the `MutationRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = deleteAuditLogEntryRef(dataConnect, deleteAuditLogEntryVars);

// Call `executeMutation()` on the reference to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeMutation(ref);

console.log(data.auditLogEntry_delete);

// Or, you can use the `Promise` API.
executeMutation(ref).then((response) => {
  const data = response.data;
  console.log(data.auditLogEntry_delete);
});
```

## UpsertUserProfile
You can execute the `UpsertUserProfile` mutation using the following action shortcut function, or by calling `executeMutation()` after calling the following `MutationRef` function, both of which are defined in [dairysync/index.d.ts](./index.d.ts):
```typescript
upsertUserProfile(vars: UpsertUserProfileVariables): MutationPromise<UpsertUserProfileData, UpsertUserProfileVariables>;

interface UpsertUserProfileRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: UpsertUserProfileVariables): MutationRef<UpsertUserProfileData, UpsertUserProfileVariables>;
}
export const upsertUserProfileRef: UpsertUserProfileRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `MutationRef` function.
```typescript
upsertUserProfile(dc: DataConnect, vars: UpsertUserProfileVariables): MutationPromise<UpsertUserProfileData, UpsertUserProfileVariables>;

interface UpsertUserProfileRef {
  ...
  (dc: DataConnect, vars: UpsertUserProfileVariables): MutationRef<UpsertUserProfileData, UpsertUserProfileVariables>;
}
export const upsertUserProfileRef: UpsertUserProfileRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the upsertUserProfileRef:
```typescript
const name = upsertUserProfileRef.operationName;
console.log(name);
```

### Variables
The `UpsertUserProfile` mutation requires an argument of type `UpsertUserProfileVariables`, which is defined in [dairysync/index.d.ts](./index.d.ts). It has the following fields:

```typescript
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
```
### Return Type
Recall that executing the `UpsertUserProfile` mutation returns a `MutationPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `UpsertUserProfileData`, which is defined in [dairysync/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface UpsertUserProfileData {
  userProfile_upsert: UserProfile_Key;
}
```
### Using `UpsertUserProfile`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, upsertUserProfile, UpsertUserProfileVariables } from '@dataconnect/dairysync-generated';

// The `UpsertUserProfile` mutation requires an argument of type `UpsertUserProfileVariables`:
const upsertUserProfileVars: UpsertUserProfileVariables = {
  id: ..., 
  name: ..., 
  role: ..., 
  title: ..., 
  department: ..., 
  avatar: ..., 
  email: ..., 
  username: ..., 
  nickname: ..., // optional
};

// Call the `upsertUserProfile()` function to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await upsertUserProfile(upsertUserProfileVars);
// Variables can be defined inline as well.
const { data } = await upsertUserProfile({ id: ..., name: ..., role: ..., title: ..., department: ..., avatar: ..., email: ..., username: ..., nickname: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await upsertUserProfile(dataConnect, upsertUserProfileVars);

console.log(data.userProfile_upsert);

// Or, you can use the `Promise` API.
upsertUserProfile(upsertUserProfileVars).then((response) => {
  const data = response.data;
  console.log(data.userProfile_upsert);
});
```

### Using `UpsertUserProfile`'s `MutationRef` function

```typescript
import { getDataConnect, executeMutation } from 'firebase/data-connect';
import { connectorConfig, upsertUserProfileRef, UpsertUserProfileVariables } from '@dataconnect/dairysync-generated';

// The `UpsertUserProfile` mutation requires an argument of type `UpsertUserProfileVariables`:
const upsertUserProfileVars: UpsertUserProfileVariables = {
  id: ..., 
  name: ..., 
  role: ..., 
  title: ..., 
  department: ..., 
  avatar: ..., 
  email: ..., 
  username: ..., 
  nickname: ..., // optional
};

// Call the `upsertUserProfileRef()` function to get a reference to the mutation.
const ref = upsertUserProfileRef(upsertUserProfileVars);
// Variables can be defined inline as well.
const ref = upsertUserProfileRef({ id: ..., name: ..., role: ..., title: ..., department: ..., avatar: ..., email: ..., username: ..., nickname: ..., });

// You can also pass in a `DataConnect` instance to the `MutationRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = upsertUserProfileRef(dataConnect, upsertUserProfileVars);

// Call `executeMutation()` on the reference to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeMutation(ref);

console.log(data.userProfile_upsert);

// Or, you can use the `Promise` API.
executeMutation(ref).then((response) => {
  const data = response.data;
  console.log(data.userProfile_upsert);
});
```

## UpdateOwnUserProfile
You can execute the `UpdateOwnUserProfile` mutation using the following action shortcut function, or by calling `executeMutation()` after calling the following `MutationRef` function, both of which are defined in [dairysync/index.d.ts](./index.d.ts):
```typescript
updateOwnUserProfile(vars: UpdateOwnUserProfileVariables): MutationPromise<UpdateOwnUserProfileData, UpdateOwnUserProfileVariables>;

interface UpdateOwnUserProfileRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: UpdateOwnUserProfileVariables): MutationRef<UpdateOwnUserProfileData, UpdateOwnUserProfileVariables>;
}
export const updateOwnUserProfileRef: UpdateOwnUserProfileRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `MutationRef` function.
```typescript
updateOwnUserProfile(dc: DataConnect, vars: UpdateOwnUserProfileVariables): MutationPromise<UpdateOwnUserProfileData, UpdateOwnUserProfileVariables>;

interface UpdateOwnUserProfileRef {
  ...
  (dc: DataConnect, vars: UpdateOwnUserProfileVariables): MutationRef<UpdateOwnUserProfileData, UpdateOwnUserProfileVariables>;
}
export const updateOwnUserProfileRef: UpdateOwnUserProfileRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the updateOwnUserProfileRef:
```typescript
const name = updateOwnUserProfileRef.operationName;
console.log(name);
```

### Variables
The `UpdateOwnUserProfile` mutation requires an argument of type `UpdateOwnUserProfileVariables`, which is defined in [dairysync/index.d.ts](./index.d.ts). It has the following fields:

```typescript
export interface UpdateOwnUserProfileVariables {
  id: string;
  name: string;
  title: string;
  department: string;
  avatar: string;
  username: string;
  nickname?: string | null;
}
```
### Return Type
Recall that executing the `UpdateOwnUserProfile` mutation returns a `MutationPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `UpdateOwnUserProfileData`, which is defined in [dairysync/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface UpdateOwnUserProfileData {
  userProfile_updateMany: number;
}
```
### Using `UpdateOwnUserProfile`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, updateOwnUserProfile, UpdateOwnUserProfileVariables } from '@dataconnect/dairysync-generated';

// The `UpdateOwnUserProfile` mutation requires an argument of type `UpdateOwnUserProfileVariables`:
const updateOwnUserProfileVars: UpdateOwnUserProfileVariables = {
  id: ..., 
  name: ..., 
  title: ..., 
  department: ..., 
  avatar: ..., 
  username: ..., 
  nickname: ..., // optional
};

// Call the `updateOwnUserProfile()` function to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await updateOwnUserProfile(updateOwnUserProfileVars);
// Variables can be defined inline as well.
const { data } = await updateOwnUserProfile({ id: ..., name: ..., title: ..., department: ..., avatar: ..., username: ..., nickname: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await updateOwnUserProfile(dataConnect, updateOwnUserProfileVars);

console.log(data.userProfile_updateMany);

// Or, you can use the `Promise` API.
updateOwnUserProfile(updateOwnUserProfileVars).then((response) => {
  const data = response.data;
  console.log(data.userProfile_updateMany);
});
```

### Using `UpdateOwnUserProfile`'s `MutationRef` function

```typescript
import { getDataConnect, executeMutation } from 'firebase/data-connect';
import { connectorConfig, updateOwnUserProfileRef, UpdateOwnUserProfileVariables } from '@dataconnect/dairysync-generated';

// The `UpdateOwnUserProfile` mutation requires an argument of type `UpdateOwnUserProfileVariables`:
const updateOwnUserProfileVars: UpdateOwnUserProfileVariables = {
  id: ..., 
  name: ..., 
  title: ..., 
  department: ..., 
  avatar: ..., 
  username: ..., 
  nickname: ..., // optional
};

// Call the `updateOwnUserProfileRef()` function to get a reference to the mutation.
const ref = updateOwnUserProfileRef(updateOwnUserProfileVars);
// Variables can be defined inline as well.
const ref = updateOwnUserProfileRef({ id: ..., name: ..., title: ..., department: ..., avatar: ..., username: ..., nickname: ..., });

// You can also pass in a `DataConnect` instance to the `MutationRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = updateOwnUserProfileRef(dataConnect, updateOwnUserProfileVars);

// Call `executeMutation()` on the reference to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeMutation(ref);

console.log(data.userProfile_updateMany);

// Or, you can use the `Promise` API.
executeMutation(ref).then((response) => {
  const data = response.data;
  console.log(data.userProfile_updateMany);
});
```

## DeleteUserProfile
You can execute the `DeleteUserProfile` mutation using the following action shortcut function, or by calling `executeMutation()` after calling the following `MutationRef` function, both of which are defined in [dairysync/index.d.ts](./index.d.ts):
```typescript
deleteUserProfile(vars: DeleteUserProfileVariables): MutationPromise<DeleteUserProfileData, DeleteUserProfileVariables>;

interface DeleteUserProfileRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: DeleteUserProfileVariables): MutationRef<DeleteUserProfileData, DeleteUserProfileVariables>;
}
export const deleteUserProfileRef: DeleteUserProfileRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `MutationRef` function.
```typescript
deleteUserProfile(dc: DataConnect, vars: DeleteUserProfileVariables): MutationPromise<DeleteUserProfileData, DeleteUserProfileVariables>;

interface DeleteUserProfileRef {
  ...
  (dc: DataConnect, vars: DeleteUserProfileVariables): MutationRef<DeleteUserProfileData, DeleteUserProfileVariables>;
}
export const deleteUserProfileRef: DeleteUserProfileRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the deleteUserProfileRef:
```typescript
const name = deleteUserProfileRef.operationName;
console.log(name);
```

### Variables
The `DeleteUserProfile` mutation requires an argument of type `DeleteUserProfileVariables`, which is defined in [dairysync/index.d.ts](./index.d.ts). It has the following fields:

```typescript
export interface DeleteUserProfileVariables {
  id: string;
}
```
### Return Type
Recall that executing the `DeleteUserProfile` mutation returns a `MutationPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `DeleteUserProfileData`, which is defined in [dairysync/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface DeleteUserProfileData {
  userProfile_delete?: UserProfile_Key | null;
}
```
### Using `DeleteUserProfile`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, deleteUserProfile, DeleteUserProfileVariables } from '@dataconnect/dairysync-generated';

// The `DeleteUserProfile` mutation requires an argument of type `DeleteUserProfileVariables`:
const deleteUserProfileVars: DeleteUserProfileVariables = {
  id: ..., 
};

// Call the `deleteUserProfile()` function to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await deleteUserProfile(deleteUserProfileVars);
// Variables can be defined inline as well.
const { data } = await deleteUserProfile({ id: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await deleteUserProfile(dataConnect, deleteUserProfileVars);

console.log(data.userProfile_delete);

// Or, you can use the `Promise` API.
deleteUserProfile(deleteUserProfileVars).then((response) => {
  const data = response.data;
  console.log(data.userProfile_delete);
});
```

### Using `DeleteUserProfile`'s `MutationRef` function

```typescript
import { getDataConnect, executeMutation } from 'firebase/data-connect';
import { connectorConfig, deleteUserProfileRef, DeleteUserProfileVariables } from '@dataconnect/dairysync-generated';

// The `DeleteUserProfile` mutation requires an argument of type `DeleteUserProfileVariables`:
const deleteUserProfileVars: DeleteUserProfileVariables = {
  id: ..., 
};

// Call the `deleteUserProfileRef()` function to get a reference to the mutation.
const ref = deleteUserProfileRef(deleteUserProfileVars);
// Variables can be defined inline as well.
const ref = deleteUserProfileRef({ id: ..., });

// You can also pass in a `DataConnect` instance to the `MutationRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = deleteUserProfileRef(dataConnect, deleteUserProfileVars);

// Call `executeMutation()` on the reference to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeMutation(ref);

console.log(data.userProfile_delete);

// Or, you can use the `Promise` API.
executeMutation(ref).then((response) => {
  const data = response.data;
  console.log(data.userProfile_delete);
});
```

