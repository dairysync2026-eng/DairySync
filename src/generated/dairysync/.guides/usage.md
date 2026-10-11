# Basic Usage

Always prioritize using a supported framework over using the generated SDK
directly. Supported frameworks simplify the developer experience and help ensure
best practices are followed.





## Advanced Usage
If a user is not using a supported framework, they can use the generated SDK directly.

Here's an example of how to use it with the first 5 operations:

```js
import { seedStockTransaction, seedIsoRating, seedAuditLogEntry, listRawIngredients, upsertRawIngredient, deleteRawIngredient, listStockTransactions, upsertStockTransaction, deleteStockTransaction, updateFinishedGoodRecipe } from '@dataconnect/dairysync-generated';


// Operation SeedStockTransaction:  For variables, look at type SeedStockTransactionVars in ../index.d.ts
const { data } = await SeedStockTransaction(dataConnect, seedStockTransactionVars);

// Operation SeedIsoRating:  For variables, look at type SeedIsoRatingVars in ../index.d.ts
const { data } = await SeedIsoRating(dataConnect, seedIsoRatingVars);

// Operation SeedAuditLogEntry:  For variables, look at type SeedAuditLogEntryVars in ../index.d.ts
const { data } = await SeedAuditLogEntry(dataConnect, seedAuditLogEntryVars);

// Operation ListRawIngredients: 
const { data } = await ListRawIngredients(dataConnect);

// Operation UpsertRawIngredient:  For variables, look at type UpsertRawIngredientVars in ../index.d.ts
const { data } = await UpsertRawIngredient(dataConnect, upsertRawIngredientVars);

// Operation DeleteRawIngredient:  For variables, look at type DeleteRawIngredientVars in ../index.d.ts
const { data } = await DeleteRawIngredient(dataConnect, deleteRawIngredientVars);

// Operation ListStockTransactions: 
const { data } = await ListStockTransactions(dataConnect);

// Operation UpsertStockTransaction:  For variables, look at type UpsertStockTransactionVars in ../index.d.ts
const { data } = await UpsertStockTransaction(dataConnect, upsertStockTransactionVars);

// Operation DeleteStockTransaction:  For variables, look at type DeleteStockTransactionVars in ../index.d.ts
const { data } = await DeleteStockTransaction(dataConnect, deleteStockTransactionVars);

// Operation UpdateFinishedGoodRecipe:  For variables, look at type UpdateFinishedGoodRecipeVars in ../index.d.ts
const { data } = await UpdateFinishedGoodRecipe(dataConnect, updateFinishedGoodRecipeVars);


```