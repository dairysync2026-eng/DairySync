import React, { useState } from 'react';
import { useDairySync } from '../context/DairySyncContext';
import { BomIngredientRequirement, FinishedGood } from '../types';
import { ClipboardList, Plus, Save, Trash2, X } from 'lucide-react';
import { usePagination } from '../hooks/usePagination';
import { TablePagination } from './TablePagination';

const getRecipeOutputUnitLabel = (unit: FinishedGood['unit']) =>
  unit === 'bottles' || unit === 'packs' ? 'bottles / packs' : unit;

export const ProductRecipes: React.FC = () => {
  const {
    finishedGoods,
    ingredients,
    currentRole,
    isDeveloperActive,
    updateFinishedGoodRecipe,
    deleteFinishedGoodRecipe,
  } = useDairySync();
  const canEditRecipes = ['developer', 'director', 'plant_manager'].includes(currentRole);
  const canDeleteRecipes = isDeveloperActive && currentRole === 'developer';
  const productsNeedingRecipes = finishedGoods.filter(product => !product.recipe?.length);
  const pagination = usePagination(finishedGoods);
  const [selectedProduct, setSelectedProduct] = useState<FinishedGood | null>(null);
  const [showProductPicker, setShowProductPicker] = useState(false);
  const [pickerProductId, setPickerProductId] = useState('');
  const [recipe, setRecipe] = useState<BomIngredientRequirement[]>([]);
  const [baseBatch, setBaseBatch] = useState('100');
  const [error, setError] = useState('');

  const openEditor = (product: FinishedGood) => {
    setSelectedProduct(product);
    setRecipe((product.recipe || []).map(item => ({ ...item })));
    setBaseBatch(String(product.batchUnitQuantity || 100));
    setError('');
  };

  const handleDeleteRecipe = (product: FinishedGood) => {
    if (!window.confirm(`Delete the recipe for ${product.name}? The finished product remains in Cold Storage, but WIP production will require a new recipe.`)) return;
    if (!deleteFinishedGoodRecipe(product.id)) {
      window.alert('The recipe could not be deleted. Confirm you are signed in as the Lead Developer and try again.');
    }
  };

  const openProductPicker = () => {
    setPickerProductId(productsNeedingRecipes[0]?.id || '');
    setShowProductPicker(true);
  };

  const continueToRecipeEditor = () => {
    const product = productsNeedingRecipes.find(item => item.id === pickerProductId);
    if (!product) return;
    setShowProductPicker(false);
    openEditor(product);
  };

  const updateRecipeRow = (index: number, updates: Partial<BomIngredientRequirement>) => {
    setRecipe(rows => rows.map((row, rowIndex) =>
      rowIndex === index ? { ...row, ...updates } : row
    ));
  };

  const handleSave = (event: React.FormEvent) => {
    event.preventDefault();
    if (!selectedProduct) return;

    const parsedBaseBatch = Number(baseBatch);
    if (!Number.isFinite(parsedBaseBatch) || parsedBaseBatch <= 0) {
      setError('Enter a base batch quantity greater than zero.');
      return;
    }
    if (recipe.some(item =>
      !item.ingredientId ||
      !Number.isFinite(item.quantityRequired) ||
      item.quantityRequired <= 0
    )) {
      setError('Choose an ingredient and enter a quantity greater than zero for each row.');
      return;
    }
    if (new Set(recipe.map(item => item.ingredientId)).size !== recipe.length) {
      setError('Each ingredient can only appear once in a recipe.');
      return;
    }

    const savedRecipe = recipe.map(item => {
      const ingredient = ingredients.find(row => row.id === item.ingredientId);
      return ingredient
        ? {
            ingredientId: ingredient.id,
            ingredientName: ingredient.name,
            quantityRequired: item.quantityRequired,
            unit: ingredient.unit,
          }
        : item;
    });
    if (savedRecipe.some(item => !ingredients.some(row => row.id === item.ingredientId))) {
      setError('A selected raw material is no longer available. Replace or remove it.');
      return;
    }

    if (!updateFinishedGoodRecipe(selectedProduct.id, savedRecipe, parsedBaseBatch)) {
      setError('Could not save the recipe. Check your permissions, connection, and try again.');
      return;
    }
    setSelectedProduct(null);
  };

  return (
    <div className="space-y-6">
      <header className="rounded-3xl border-2 border-indigo-200 bg-gradient-to-r from-indigo-950 via-slate-900 to-slate-900 p-6 text-white shadow-sm">
        <div className="flex items-center gap-3">
          <span className="rounded-2xl border border-indigo-400/30 bg-indigo-500/20 p-3 text-indigo-200">
            <ClipboardList className="h-6 w-6" />
          </span>
          <div>
            <p className="text-[10px] font-extrabold uppercase tracking-wider text-indigo-200">Production Formulas</p>
            <h1 className="text-2xl font-black tracking-tight">Product Recipe Management</h1>
          </div>
          {canEditRecipes && (
            <button
              type="button"
              onClick={openProductPicker}
              disabled={productsNeedingRecipes.length === 0}
              title={productsNeedingRecipes.length === 0 ? 'All existing products already have recipes. Add a product in Cold Storage first.' : 'Add a recipe to a product that does not have one yet'}
              className="ml-auto inline-flex shrink-0 items-center gap-2 rounded-2xl border border-indigo-300 bg-indigo-500 px-4 py-2.5 text-xs font-extrabold text-white shadow-sm transition-colors hover:bg-indigo-400 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Plus className="h-4 w-4" />
              Add Recipe
            </button>
          )}
        </div>
        <p className="mt-3 max-w-3xl text-sm text-slate-200">
          Define the raw materials and quantities needed for each finished product. Recipe quantities are for the stated base output, and WIP batches scale them to the requested production quantity.
        </p>
        <p className="mt-2 text-xs text-indigo-200">
          Add materials in Raw Ingredients first. Quantities use each material’s inventory unit.
        </p>
      </header>

      {finishedGoods.length === 0 ? (
        <div className="rounded-2xl border-2 border-dashed border-slate-300 bg-white p-8 text-center text-sm text-slate-600">
          Add a finished product before setting up its recipe.
        </div>
      ) : (
        <div className="overflow-x-auto rounded-3xl border-2 border-slate-200 bg-white shadow-sm">
          <table className="w-full min-w-[640px] border-collapse text-left text-sm">
            <thead>
              <tr className="border-b-2 border-slate-200 bg-slate-50 text-[10px] font-extrabold uppercase tracking-wider text-slate-600">
                <th className="px-5 py-4">Product</th>
                <th className="px-4 py-4">Recipe output</th>
                <th className="px-4 py-4">Ingredients</th>
                <th className="px-5 py-4 text-right">Recipe status</th>
                {canEditRecipes && <th className="px-5 py-4 text-right">Action</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {pagination.pageItems.map(product => {
                const ingredientCount = product.recipe?.length || 0;
                const hasRecipe = ingredientCount > 0;
                return (
                  <tr key={product.id} className="hover:bg-slate-50/70">
                    <td className="px-5 py-4">
                      <div className="font-bold text-slate-900">{product.name}</div>
                      <div className="mt-0.5 font-mono text-xs text-slate-500">{product.sku}</div>
                    </td>
                    <td className="px-4 py-4 font-mono text-xs font-semibold text-slate-700">
                      {product.batchUnitQuantity || 100} {getRecipeOutputUnitLabel(product.unit)}
                    </td>
                    <td className="px-4 py-4 text-xs text-slate-700">
                      {hasRecipe
                        ? product.recipe.map(item => item.ingredientName).join(', ')
                        : 'No ingredients configured'}
                    </td>
                    <td className="px-5 py-4 text-right">
                      <span className={`inline-flex rounded-full border px-2.5 py-1 text-[10px] font-extrabold uppercase ${
                        hasRecipe
                          ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
                          : 'border-amber-200 bg-amber-50 text-amber-800'
                      }`}>
                        {hasRecipe ? 'Configured' : 'Needs recipe'}
                      </span>
                    </td>
                    {canEditRecipes && (
                      <td className="px-5 py-4 text-right">
                        <div className="flex justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => openEditor(product)}
                          className="inline-flex items-center gap-1.5 rounded-xl border border-indigo-200 bg-indigo-50 px-3 py-2 text-xs font-bold text-indigo-800 hover:bg-indigo-100"
                        >
                          <ClipboardList className="h-3.5 w-3.5" />
                          {hasRecipe ? 'Edit recipe' : 'Add recipe'}
                        </button>
                        {canDeleteRecipes && hasRecipe && (
                          <button
                            type="button"
                            onClick={() => handleDeleteRecipe(product)}
                            aria-label={`Delete recipe for ${product.name}`}
                            title="Delete product recipe"
                            className="inline-flex items-center justify-center rounded-xl border border-rose-200 bg-rose-50 p-2 text-rose-700 hover:bg-rose-100"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        )}
                        </div>
                      </td>
                    )}
                  </tr>
                );
              })}
            </tbody>
          </table>
          <TablePagination
            totalItems={finishedGoods.length}
            pageIndex={pagination.pageIndex}
            pageSize={pagination.pageSize}
            pageCount={pagination.pageCount}
            onPageChange={pagination.setPageIndex}
            onPageSizeChange={pagination.setPageSize}
          />
        </div>
      )}

      {showProductPicker && canEditRecipes && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-lg space-y-4 rounded-3xl border-2 border-slate-200 bg-white p-6 text-slate-900 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h2 className="text-lg font-extrabold">Add a Product Recipe</h2>
                <p className="text-xs font-medium text-slate-500">Choose a product that does not have a recipe yet.</p>
              </div>
              <button
                type="button"
                onClick={() => setShowProductPicker(false)}
                className="text-slate-400 hover:text-slate-900"
                aria-label="Close product picker"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {productsNeedingRecipes.length > 0 ? (
              <>
                <label className="block space-y-1.5">
                  <span className="text-xs font-bold text-slate-700">Product</span>
                  <select
                    value={pickerProductId}
                    onChange={event => setPickerProductId(event.target.value)}
                    className="w-full rounded-xl border-2 border-slate-200 bg-white px-3 py-2.5 text-sm font-semibold text-slate-900 focus:border-indigo-500 focus:outline-none"
                  >
                    {productsNeedingRecipes.map(product => (
                      <option key={product.id} value={product.id}>
                        {product.name} ({product.sku})
                      </option>
                    ))}
                  </select>
                </label>
                <p className="text-xs text-slate-500">
                  Don’t see the product? Add it in Cold Storage first, then return here to configure its formula.
                </p>
              </>
            ) : (
              <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
                There are no products waiting for a recipe. Add a new finished product in Cold Storage first.
              </div>
            )}

            <div className="flex justify-end gap-3 border-t border-slate-100 pt-3">
              <button
                type="button"
                onClick={() => setShowProductPicker(false)}
                className="rounded-2xl bg-slate-100 px-4 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-200"
              >
                Cancel
              </button>
              {productsNeedingRecipes.length > 0 && (
                <button
                  type="button"
                  onClick={continueToRecipeEditor}
                  disabled={!pickerProductId}
                  className="rounded-2xl bg-indigo-600 px-5 py-2.5 text-xs font-bold text-white shadow-md hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Continue to Recipe
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {selectedProduct && canEditRecipes && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm">
          <div className="max-h-[90vh] w-full max-w-2xl space-y-4 overflow-y-auto rounded-3xl border-2 border-slate-200 bg-white p-6 text-slate-900 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h2 className="text-lg font-extrabold">Edit Product Recipe</h2>
                <p className="text-xs font-medium text-slate-500">{selectedProduct.name}</p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedProduct(null)}
                className="text-slate-400 hover:text-slate-900"
                aria-label="Close recipe editor"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4">
              <div className="rounded-2xl border border-indigo-100 bg-indigo-50/60 p-4">
                <label className="mb-1 block text-xs font-bold text-slate-700">
                  Formula output (finished product units)
                </label>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-600">This recipe makes</span>
                  <input
                    type="number"
                    min="0.000001"
                    step="any"
                    required
                    value={baseBatch}
                    onChange={event => setBaseBatch(event.target.value)}
                    className="w-28 rounded-xl border-2 border-slate-200 bg-white px-3 py-2 text-sm font-mono font-bold focus:border-indigo-500 focus:outline-none"
                  />
                  <span className="text-xs font-semibold text-slate-700">{getRecipeOutputUnitLabel(selectedProduct.unit)}</span>
                </div>
                <p className="mt-2 text-[11px] text-slate-500">
                  Enter ingredient quantities for this output amount. WIP production scales them automatically.
                </p>
              </div>

              <div className="space-y-2">
                <div className="grid grid-cols-[minmax(0,1fr)_9rem_5rem_2.5rem] gap-2 px-1 text-[10px] font-bold uppercase tracking-wide text-slate-500">
                  <span>Raw material</span>
                  <span>Quantity per recipe</span>
                  <span>Unit</span>
                  <span />
                </div>
                {recipe.map((item, index) => {
                  const selectedIngredient = ingredients.find(row => row.id === item.ingredientId);
                  return (
                    <div key={`${item.ingredientId || 'new'}-${index}`} className="grid grid-cols-[minmax(0,1fr)_9rem_5rem_2.5rem] items-center gap-2">
                      <select
                        required
                        value={item.ingredientId}
                        onChange={event => {
                          const ingredient = ingredients.find(row => row.id === event.target.value);
                          updateRecipeRow(index, ingredient
                            ? { ingredientId: ingredient.id, ingredientName: ingredient.name, unit: ingredient.unit }
                            : { ingredientId: '', ingredientName: '', unit: '' }
                          );
                        }}
                        className="min-w-0 w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-xs font-semibold text-slate-900"
                      >
                        <option value="">Choose raw material...</option>
                        {item.ingredientId && !selectedIngredient && (
                          <option value={item.ingredientId}>Unavailable: {item.ingredientName || item.ingredientId}</option>
                        )}
                        {ingredients.map(ingredient => {
                          const alreadySelected = recipe.some((other, otherIndex) =>
                            otherIndex !== index && other.ingredientId === ingredient.id
                          );
                          return (
                            <option key={ingredient.id} value={ingredient.id} disabled={alreadySelected}>
                              {ingredient.name} ({ingredient.sku})
                            </option>
                          );
                        })}
                      </select>
                      <input
                        type="number"
                        min="0.000001"
                        step="any"
                        required
                        value={item.quantityRequired || ''}
                        onChange={event => updateRecipeRow(index, {
                          quantityRequired: Number(event.target.value) || 0,
                        })}
                        placeholder="Amount"
                        aria-label={`Quantity for recipe ingredient ${index + 1}`}
                        className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-xs font-mono font-bold"
                      />
                      <span className="text-xs font-semibold text-slate-600">
                        {selectedIngredient?.unit || item.unit || '—'}
                      </span>
                      <button
                        type="button"
                        onClick={() => setRecipe(rows => rows.filter((_, rowIndex) => rowIndex !== index))}
                        className="inline-flex h-9 w-9 items-center justify-center rounded-xl text-rose-600 hover:bg-rose-50"
                        aria-label={`Remove recipe ingredient ${index + 1}`}
                        title="Remove ingredient"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  );
                })}

                {recipe.length === 0 && (
                  <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-4 text-center text-xs text-slate-600">
                    This product has no raw material requirements yet. Add at least one ingredient to enable WIP production.
                  </div>
                )}
                {ingredients.length === 0 && (
                  <p className="text-xs text-amber-700">Add raw materials in Raw Ingredients before building this formula.</p>
                )}
                <button
                  type="button"
                  disabled={ingredients.length === 0 || recipe.length >= ingredients.length}
                  onClick={() => setRecipe(rows => [
                    ...rows,
                    { ingredientId: '', ingredientName: '', quantityRequired: 0, unit: '' },
                  ])}
                  className="inline-flex items-center gap-1.5 rounded-xl border border-indigo-200 bg-indigo-50 px-3 py-2 text-xs font-bold text-indigo-700 hover:bg-indigo-100 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <Plus className="h-3.5 w-3.5" />
                  Add ingredient
                </button>
              </div>

              {error && (
                <p role="alert" className="rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-xs font-semibold text-rose-700">
                  {error}
                </p>
              )}

              <div className="flex justify-end gap-3 border-t border-slate-100 pt-3">
                <button
                  type="button"
                  onClick={() => setSelectedProduct(null)}
                  className="rounded-2xl bg-slate-100 px-4 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="inline-flex items-center gap-1.5 rounded-2xl bg-indigo-600 px-5 py-2.5 text-xs font-bold text-white shadow-md hover:bg-indigo-700"
                >
                  <Save className="h-3.5 w-3.5" />
                  Save Recipe
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
