const { queryRef, executeQuery, validateArgsWithOptions, mutationRef, executeMutation, validateArgs, makeMemoryCacheProvider } = require('firebase/data-connect');

const connectorConfig = {
  connector: 'dairysync',
  service: 'dairysync-pcc-94978-2-service',
  location: 'asia-southeast1'
};
exports.connectorConfig = connectorConfig;
const dataConnectSettings = {
  cacheSettings: {
    cacheProvider: makeMemoryCacheProvider(),
    maxAgeSeconds: 5
  }
};
exports.dataConnectSettings = dataConnectSettings;

const seedStockTransactionRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'SeedStockTransaction', inputVars);
}
seedStockTransactionRef.operationName = 'SeedStockTransaction';
exports.seedStockTransactionRef = seedStockTransactionRef;

exports.seedStockTransaction = function seedStockTransaction(dcOrVars, vars) {
  const { dc: dcInstance, vars: inputVars } = validateArgs(connectorConfig, dcOrVars, vars, true);
  return executeMutation(seedStockTransactionRef(dcInstance, inputVars));
}
;

const seedIsoRatingRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'SeedIsoRating', inputVars);
}
seedIsoRatingRef.operationName = 'SeedIsoRating';
exports.seedIsoRatingRef = seedIsoRatingRef;

exports.seedIsoRating = function seedIsoRating(dcOrVars, vars) {
  const { dc: dcInstance, vars: inputVars } = validateArgs(connectorConfig, dcOrVars, vars, true);
  return executeMutation(seedIsoRatingRef(dcInstance, inputVars));
}
;

const seedAuditLogEntryRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'SeedAuditLogEntry', inputVars);
}
seedAuditLogEntryRef.operationName = 'SeedAuditLogEntry';
exports.seedAuditLogEntryRef = seedAuditLogEntryRef;

exports.seedAuditLogEntry = function seedAuditLogEntry(dcOrVars, vars) {
  const { dc: dcInstance, vars: inputVars } = validateArgs(connectorConfig, dcOrVars, vars, true);
  return executeMutation(seedAuditLogEntryRef(dcInstance, inputVars));
}
;

const listRawIngredientsRef = (dc) => {
  const { dc: dcInstance} = validateArgs(connectorConfig, dc, undefined);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'ListRawIngredients');
}
listRawIngredientsRef.operationName = 'ListRawIngredients';
exports.listRawIngredientsRef = listRawIngredientsRef;

exports.listRawIngredients = function listRawIngredients(dcOrOptions, options) {
  
  const { dc: dcInstance, vars: inputVars, options: inputOpts } = validateArgsWithOptions(connectorConfig, dcOrOptions, options, undefined,false, false);
  return executeQuery(listRawIngredientsRef(dcInstance, inputVars), inputOpts && { fetchPolicy: inputOpts.fetchPolicy });
}
;

const upsertRawIngredientRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'UpsertRawIngredient', inputVars);
}
upsertRawIngredientRef.operationName = 'UpsertRawIngredient';
exports.upsertRawIngredientRef = upsertRawIngredientRef;

exports.upsertRawIngredient = function upsertRawIngredient(dcOrVars, vars) {
  const { dc: dcInstance, vars: inputVars } = validateArgs(connectorConfig, dcOrVars, vars, true);
  return executeMutation(upsertRawIngredientRef(dcInstance, inputVars));
}
;

const deleteRawIngredientRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'DeleteRawIngredient', inputVars);
}
deleteRawIngredientRef.operationName = 'DeleteRawIngredient';
exports.deleteRawIngredientRef = deleteRawIngredientRef;

exports.deleteRawIngredient = function deleteRawIngredient(dcOrVars, vars) {
  const { dc: dcInstance, vars: inputVars } = validateArgs(connectorConfig, dcOrVars, vars, true);
  return executeMutation(deleteRawIngredientRef(dcInstance, inputVars));
}
;

const listStockTransactionsRef = (dc) => {
  const { dc: dcInstance} = validateArgs(connectorConfig, dc, undefined);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'ListStockTransactions');
}
listStockTransactionsRef.operationName = 'ListStockTransactions';
exports.listStockTransactionsRef = listStockTransactionsRef;

exports.listStockTransactions = function listStockTransactions(dcOrOptions, options) {
  
  const { dc: dcInstance, vars: inputVars, options: inputOpts } = validateArgsWithOptions(connectorConfig, dcOrOptions, options, undefined,false, false);
  return executeQuery(listStockTransactionsRef(dcInstance, inputVars), inputOpts && { fetchPolicy: inputOpts.fetchPolicy });
}
;

const upsertStockTransactionRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'UpsertStockTransaction', inputVars);
}
upsertStockTransactionRef.operationName = 'UpsertStockTransaction';
exports.upsertStockTransactionRef = upsertStockTransactionRef;

exports.upsertStockTransaction = function upsertStockTransaction(dcOrVars, vars) {
  const { dc: dcInstance, vars: inputVars } = validateArgs(connectorConfig, dcOrVars, vars, true);
  return executeMutation(upsertStockTransactionRef(dcInstance, inputVars));
}
;

const deleteStockTransactionRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'DeleteStockTransaction', inputVars);
}
deleteStockTransactionRef.operationName = 'DeleteStockTransaction';
exports.deleteStockTransactionRef = deleteStockTransactionRef;

exports.deleteStockTransaction = function deleteStockTransaction(dcOrVars, vars) {
  const { dc: dcInstance, vars: inputVars } = validateArgs(connectorConfig, dcOrVars, vars, true);
  return executeMutation(deleteStockTransactionRef(dcInstance, inputVars));
}
;

const updateFinishedGoodRecipeRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'UpdateFinishedGoodRecipe', inputVars);
}
updateFinishedGoodRecipeRef.operationName = 'UpdateFinishedGoodRecipe';
exports.updateFinishedGoodRecipeRef = updateFinishedGoodRecipeRef;

exports.updateFinishedGoodRecipe = function updateFinishedGoodRecipe(dcOrVars, vars) {
  const { dc: dcInstance, vars: inputVars } = validateArgs(connectorConfig, dcOrVars, vars, true);
  return executeMutation(updateFinishedGoodRecipeRef(dcInstance, inputVars));
}
;

const listFinishedGoodsRef = (dc) => {
  const { dc: dcInstance} = validateArgs(connectorConfig, dc, undefined);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'ListFinishedGoods');
}
listFinishedGoodsRef.operationName = 'ListFinishedGoods';
exports.listFinishedGoodsRef = listFinishedGoodsRef;

exports.listFinishedGoods = function listFinishedGoods(dcOrOptions, options) {
  
  const { dc: dcInstance, vars: inputVars, options: inputOpts } = validateArgsWithOptions(connectorConfig, dcOrOptions, options, undefined,false, false);
  return executeQuery(listFinishedGoodsRef(dcInstance, inputVars), inputOpts && { fetchPolicy: inputOpts.fetchPolicy });
}
;

const upsertFinishedGoodRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'UpsertFinishedGood', inputVars);
}
upsertFinishedGoodRef.operationName = 'UpsertFinishedGood';
exports.upsertFinishedGoodRef = upsertFinishedGoodRef;

exports.upsertFinishedGood = function upsertFinishedGood(dcOrVars, vars) {
  const { dc: dcInstance, vars: inputVars } = validateArgs(connectorConfig, dcOrVars, vars, true);
  return executeMutation(upsertFinishedGoodRef(dcInstance, inputVars));
}
;

const setRetailFinishedGoodStockRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'SetRetailFinishedGoodStock', inputVars);
}
setRetailFinishedGoodStockRef.operationName = 'SetRetailFinishedGoodStock';
exports.setRetailFinishedGoodStockRef = setRetailFinishedGoodStockRef;

exports.setRetailFinishedGoodStock = function setRetailFinishedGoodStock(dcOrVars, vars) {
  const { dc: dcInstance, vars: inputVars } = validateArgs(connectorConfig, dcOrVars, vars, true);
  return executeMutation(setRetailFinishedGoodStockRef(dcInstance, inputVars));
}
;

const deleteFinishedGoodRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'DeleteFinishedGood', inputVars);
}
deleteFinishedGoodRef.operationName = 'DeleteFinishedGood';
exports.deleteFinishedGoodRef = deleteFinishedGoodRef;

exports.deleteFinishedGood = function deleteFinishedGood(dcOrVars, vars) {
  const { dc: dcInstance, vars: inputVars } = validateArgs(connectorConfig, dcOrVars, vars, true);
  return executeMutation(deleteFinishedGoodRef(dcInstance, inputVars));
}
;

const listWipBatchesRef = (dc) => {
  const { dc: dcInstance} = validateArgs(connectorConfig, dc, undefined);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'ListWipBatches');
}
listWipBatchesRef.operationName = 'ListWipBatches';
exports.listWipBatchesRef = listWipBatchesRef;

exports.listWipBatches = function listWipBatches(dcOrOptions, options) {
  
  const { dc: dcInstance, vars: inputVars, options: inputOpts } = validateArgsWithOptions(connectorConfig, dcOrOptions, options, undefined,false, false);
  return executeQuery(listWipBatchesRef(dcInstance, inputVars), inputOpts && { fetchPolicy: inputOpts.fetchPolicy });
}
;

const upsertWipBatchRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'UpsertWipBatch', inputVars);
}
upsertWipBatchRef.operationName = 'UpsertWipBatch';
exports.upsertWipBatchRef = upsertWipBatchRef;

exports.upsertWipBatch = function upsertWipBatch(dcOrVars, vars) {
  const { dc: dcInstance, vars: inputVars } = validateArgs(connectorConfig, dcOrVars, vars, true);
  return executeMutation(upsertWipBatchRef(dcInstance, inputVars));
}
;

const deleteWipBatchRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'DeleteWipBatch', inputVars);
}
deleteWipBatchRef.operationName = 'DeleteWipBatch';
exports.deleteWipBatchRef = deleteWipBatchRef;

exports.deleteWipBatch = function deleteWipBatch(dcOrVars, vars) {
  const { dc: dcInstance, vars: inputVars } = validateArgs(connectorConfig, dcOrVars, vars, true);
  return executeMutation(deleteWipBatchRef(dcInstance, inputVars));
}
;

const listCommitmentsRef = (dc) => {
  const { dc: dcInstance} = validateArgs(connectorConfig, dc, undefined);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'ListCommitments');
}
listCommitmentsRef.operationName = 'ListCommitments';
exports.listCommitmentsRef = listCommitmentsRef;

exports.listCommitments = function listCommitments(dcOrOptions, options) {
  
  const { dc: dcInstance, vars: inputVars, options: inputOpts } = validateArgsWithOptions(connectorConfig, dcOrOptions, options, undefined,false, false);
  return executeQuery(listCommitmentsRef(dcInstance, inputVars), inputOpts && { fetchPolicy: inputOpts.fetchPolicy });
}
;

const upsertCommitmentRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'UpsertCommitment', inputVars);
}
upsertCommitmentRef.operationName = 'UpsertCommitment';
exports.upsertCommitmentRef = upsertCommitmentRef;

exports.upsertCommitment = function upsertCommitment(dcOrVars, vars) {
  const { dc: dcInstance, vars: inputVars } = validateArgs(connectorConfig, dcOrVars, vars, true);
  return executeMutation(upsertCommitmentRef(dcInstance, inputVars));
}
;

const deleteCommitmentRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'DeleteCommitment', inputVars);
}
deleteCommitmentRef.operationName = 'DeleteCommitment';
exports.deleteCommitmentRef = deleteCommitmentRef;

exports.deleteCommitment = function deleteCommitment(dcOrVars, vars) {
  const { dc: dcInstance, vars: inputVars } = validateArgs(connectorConfig, dcOrVars, vars, true);
  return executeMutation(deleteCommitmentRef(dcInstance, inputVars));
}
;

const listSystemAlertsRef = (dc) => {
  const { dc: dcInstance} = validateArgs(connectorConfig, dc, undefined);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'ListSystemAlerts');
}
listSystemAlertsRef.operationName = 'ListSystemAlerts';
exports.listSystemAlertsRef = listSystemAlertsRef;

exports.listSystemAlerts = function listSystemAlerts(dcOrOptions, options) {
  
  const { dc: dcInstance, vars: inputVars, options: inputOpts } = validateArgsWithOptions(connectorConfig, dcOrOptions, options, undefined,false, false);
  return executeQuery(listSystemAlertsRef(dcInstance, inputVars), inputOpts && { fetchPolicy: inputOpts.fetchPolicy });
}
;

const upsertSystemAlertRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'UpsertSystemAlert', inputVars);
}
upsertSystemAlertRef.operationName = 'UpsertSystemAlert';
exports.upsertSystemAlertRef = upsertSystemAlertRef;

exports.upsertSystemAlert = function upsertSystemAlert(dcOrVars, vars) {
  const { dc: dcInstance, vars: inputVars } = validateArgs(connectorConfig, dcOrVars, vars, true);
  return executeMutation(upsertSystemAlertRef(dcInstance, inputVars));
}
;

const deleteSystemAlertRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'DeleteSystemAlert', inputVars);
}
deleteSystemAlertRef.operationName = 'DeleteSystemAlert';
exports.deleteSystemAlertRef = deleteSystemAlertRef;

exports.deleteSystemAlert = function deleteSystemAlert(dcOrVars, vars) {
  const { dc: dcInstance, vars: inputVars } = validateArgs(connectorConfig, dcOrVars, vars, true);
  return executeMutation(deleteSystemAlertRef(dcInstance, inputVars));
}
;

const listIsoRatingsRef = (dc) => {
  const { dc: dcInstance} = validateArgs(connectorConfig, dc, undefined);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'ListIsoRatings');
}
listIsoRatingsRef.operationName = 'ListIsoRatings';
exports.listIsoRatingsRef = listIsoRatingsRef;

exports.listIsoRatings = function listIsoRatings(dcOrOptions, options) {
  
  const { dc: dcInstance, vars: inputVars, options: inputOpts } = validateArgsWithOptions(connectorConfig, dcOrOptions, options, undefined,false, false);
  return executeQuery(listIsoRatingsRef(dcInstance, inputVars), inputOpts && { fetchPolicy: inputOpts.fetchPolicy });
}
;

const upsertIsoRatingRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'UpsertIsoRating', inputVars);
}
upsertIsoRatingRef.operationName = 'UpsertIsoRating';
exports.upsertIsoRatingRef = upsertIsoRatingRef;

exports.upsertIsoRating = function upsertIsoRating(dcOrVars, vars) {
  const { dc: dcInstance, vars: inputVars } = validateArgs(connectorConfig, dcOrVars, vars, true);
  return executeMutation(upsertIsoRatingRef(dcInstance, inputVars));
}
;

const deleteIsoRatingRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'DeleteIsoRating', inputVars);
}
deleteIsoRatingRef.operationName = 'DeleteIsoRating';
exports.deleteIsoRatingRef = deleteIsoRatingRef;

exports.deleteIsoRating = function deleteIsoRating(dcOrVars, vars) {
  const { dc: dcInstance, vars: inputVars } = validateArgs(connectorConfig, dcOrVars, vars, true);
  return executeMutation(deleteIsoRatingRef(dcInstance, inputVars));
}
;

const listAuditLogEntriesRef = (dc) => {
  const { dc: dcInstance} = validateArgs(connectorConfig, dc, undefined);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'ListAuditLogEntries');
}
listAuditLogEntriesRef.operationName = 'ListAuditLogEntries';
exports.listAuditLogEntriesRef = listAuditLogEntriesRef;

exports.listAuditLogEntries = function listAuditLogEntries(dcOrOptions, options) {
  
  const { dc: dcInstance, vars: inputVars, options: inputOpts } = validateArgsWithOptions(connectorConfig, dcOrOptions, options, undefined,false, false);
  return executeQuery(listAuditLogEntriesRef(dcInstance, inputVars), inputOpts && { fetchPolicy: inputOpts.fetchPolicy });
}
;

const upsertAuditLogEntryRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'UpsertAuditLogEntry', inputVars);
}
upsertAuditLogEntryRef.operationName = 'UpsertAuditLogEntry';
exports.upsertAuditLogEntryRef = upsertAuditLogEntryRef;

exports.upsertAuditLogEntry = function upsertAuditLogEntry(dcOrVars, vars) {
  const { dc: dcInstance, vars: inputVars } = validateArgs(connectorConfig, dcOrVars, vars, true);
  return executeMutation(upsertAuditLogEntryRef(dcInstance, inputVars));
}
;

const deleteAuditLogEntryRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'DeleteAuditLogEntry', inputVars);
}
deleteAuditLogEntryRef.operationName = 'DeleteAuditLogEntry';
exports.deleteAuditLogEntryRef = deleteAuditLogEntryRef;

exports.deleteAuditLogEntry = function deleteAuditLogEntry(dcOrVars, vars) {
  const { dc: dcInstance, vars: inputVars } = validateArgs(connectorConfig, dcOrVars, vars, true);
  return executeMutation(deleteAuditLogEntryRef(dcInstance, inputVars));
}
;

const listUserProfilesRef = (dc) => {
  const { dc: dcInstance} = validateArgs(connectorConfig, dc, undefined);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'ListUserProfiles');
}
listUserProfilesRef.operationName = 'ListUserProfiles';
exports.listUserProfilesRef = listUserProfilesRef;

exports.listUserProfiles = function listUserProfiles(dcOrOptions, options) {
  
  const { dc: dcInstance, vars: inputVars, options: inputOpts } = validateArgsWithOptions(connectorConfig, dcOrOptions, options, undefined,false, false);
  return executeQuery(listUserProfilesRef(dcInstance, inputVars), inputOpts && { fetchPolicy: inputOpts.fetchPolicy });
}
;

const upsertUserProfileRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'UpsertUserProfile', inputVars);
}
upsertUserProfileRef.operationName = 'UpsertUserProfile';
exports.upsertUserProfileRef = upsertUserProfileRef;

exports.upsertUserProfile = function upsertUserProfile(dcOrVars, vars) {
  const { dc: dcInstance, vars: inputVars } = validateArgs(connectorConfig, dcOrVars, vars, true);
  return executeMutation(upsertUserProfileRef(dcInstance, inputVars));
}
;

const updateOwnUserProfileRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'UpdateOwnUserProfile', inputVars);
}
updateOwnUserProfileRef.operationName = 'UpdateOwnUserProfile';
exports.updateOwnUserProfileRef = updateOwnUserProfileRef;

exports.updateOwnUserProfile = function updateOwnUserProfile(dcOrVars, vars) {
  const { dc: dcInstance, vars: inputVars } = validateArgs(connectorConfig, dcOrVars, vars, true);
  return executeMutation(updateOwnUserProfileRef(dcInstance, inputVars));
}
;

const deleteUserProfileRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'DeleteUserProfile', inputVars);
}
deleteUserProfileRef.operationName = 'DeleteUserProfile';
exports.deleteUserProfileRef = deleteUserProfileRef;

exports.deleteUserProfile = function deleteUserProfile(dcOrVars, vars) {
  const { dc: dcInstance, vars: inputVars } = validateArgs(connectorConfig, dcOrVars, vars, true);
  return executeMutation(deleteUserProfileRef(dcInstance, inputVars));
}
;
