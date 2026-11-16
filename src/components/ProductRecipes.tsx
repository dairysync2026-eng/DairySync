import React, { useState } from 'react';
import { useDairySync } from '../context/DairySyncContext';
import { BomIngredientRequirement, BomIngredientSubstitute, FinishedGood } from '../types';
import { ClipboardList, Plus, Save, Trash2, X } from 'lucide-react';
import { usePagination } from '../hooks/usePagination';
import { TablePagination } from './TablePagination';
import {
  convertUnitQuantity,
  getRecipeUnitsPerInventoryUnit,
  RECIPE_UNIT_OPTIONS,
} from '../utils/unitConversions';
import { isRawMaterialCategory } from '../utils/ingredientCategories';

const parseSingleRecipeQuantity = (value: string): number | null => {
  const normalized = value.trim();
  if (!normalized) return null;

  const mixedFraction = normalized.match(/^(\d+)\s+(\d+)\s*\/\s*(\d+)$/);
  if (mixedFraction) {
    const [, whole, numerator, denominator] = mixedFraction;
    const denominatorValue = Number(denominator);
    if (denominatorValue === 0) return null;
    return Number(whole) + Number(numerator) / denominatorValue;
  }

  const fraction = normalized.match(/^(\d+)\s*\/\s*(\d+)$/);
  if (fraction) {
    const [, numerator, denominator] = fraction;
    const denominatorValue = Number(denominator);
    if (denominatorValue === 0) return null;
    return Number(numerator) / denominatorValue;
  }

  if (!/^(?:\d+(?:\.\d*)?|\.\d+)$/.test(normalized)) return null;
  const quantity = Number(normalized);
  return Number.isFinite(quantity) ? quantity : null;
};

const parseRecipeQuantity = (value: string): { min: number; max: number } | null => {
  const range = value.trim().match(/^(.+?)\s*[-–]\s*(.+)$/);
  if (range) {
    const min = parseSingleRecipeQuantity(range[1]);
    const max = parseSingleRecipeQuantity(range[2]);
    return min !== null && max !== null && min <= max ? { min, max } : null;
  }
  const quantity = parseSingleRecipeQuantity(value);
  return quantity === null ? null : { min: quantity, max: quantity };
};

const isDropsUnit = (unit: string) => ['drop', 'drops'].includes(unit.trim().toLowerCase());

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
  const [quantityInputs, setQuantityInputs] = useState<string[]>([]);
  const [baseBatch, setBaseBatch] = useState('100');
  const [outputUnit, setOutputUnit] = useState('');
  const [containerVolumeMl, setContainerVolumeMl] = useState('');
  const [error, setError] = useState('');

  const openEditor = (product: FinishedGood) => {
    setSelectedProduct(product);
    const productRecipe = (product.recipe || []).map(item => ({
      ...item,
      unit: item.unit || ingredients.find(ingredient => ingredient.id === item.ingredientId)?.unit || '',
    }));
    setRecipe(productRecipe);
    setQuantityInputs(productRecipe.map(item => item.quantityRequiredMax === undefined
      ? String(item.quantityRequired)
      : `${item.quantityRequired}-${item.quantityRequiredMax}`
    ));
    setBaseBatch(String(product.batchUnitQuantity || 100));
    setOutputUnit(product.unit);
    setContainerVolumeMl(product.containerVolumeMl ? String(product.containerVolumeMl) : '');
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

  const updateSubstitute = (
    rowIndex: number,
    substituteIndex: number,
    updates: Partial<BomIngredientSubstitute>
  ) => {
    const substitutes = [...(recipe[rowIndex].substitutes || [])];
    substitutes[substituteIndex] = { ...substitutes[substituteIndex], ...updates };
    updateRecipeRow(rowIndex, { substitutes });
  };

  const handleSave = (event: React.FormEvent) => {
    event.preventDefault();
    if (!selectedProduct) return;

    const parsedBaseBatch = Number(baseBatch);
    if (!Number.isFinite(parsedBaseBatch) || parsedBaseBatch <= 0) {
      setError('Enter a base batch quantity greater than zero.');
      return;
    }
    if (!outputUnit.trim()) {
      setError('Enter a unit for the finished product output.');
      return;
    }
    if (outputUnit.trim().toLowerCase() === 'bottles' && !containerVolumeMl) {
      setError('Choose the volume for each bottle.');
      return;
    }
    const parsedQuantities = quantityInputs.map(parseRecipeQuantity);
    if (recipe.some((item, index) => {
      const quantity = parsedQuantities[index];
      return !item.ingredientId || quantity === null || quantity.min <= 0 || quantity.max <= 0;
    })) {
      setError('Enter a valid quantity greater than zero. Use fractions like 1/2 or ranges like 15-20 for drops.');
      return;
    }
    if (recipe.some((item, index) =>
      parsedQuantities[index]!.min !== parsedQuantities[index]!.max && !isDropsUnit(item.unit)
    )) {
      setError('Quantity ranges are supported for drops only.');
      return;
    }
    if (new Set(recipe.map(item => item.ingredientId)).size !== recipe.length) {
      setError('Each ingredient can only appear once in a recipe.');
      return;
    }
    if (recipe.some(item => {
      const ingredient = ingredients.find(row => row.id === item.ingredientId);
      return !ingredient || getRecipeUnitsPerInventoryUnit(
        ingredient.unit,
        item.unit,
        item.recipeUnitsPerInventoryUnit
      ) === null;
    })) {
      setError('Enter the conversion ratio for units that cannot be converted automatically.');
      return;
    }
    if (recipe.some(item => {
      const substituteIds = (item.substitutes || []).map(substitute => substitute.ingredientId);
      return substituteIds.some((id, index) =>
        !id ||
        id === item.ingredientId ||
        substituteIds.indexOf(id) !== index ||
        !ingredients.some(ingredient => ingredient.id === id)
      );
    })) {
      setError('Choose a different available raw ingredient for each substitute.');
      return;
    }
    if (recipe.some(item => (item.substitutes || []).some(substitute => {
      const ingredient = ingredients.find(row => row.id === substitute.ingredientId);
      return ingredient && getRecipeUnitsPerInventoryUnit(
        ingredient.unit,
        item.unit,
        substitute.recipeUnitsPerInventoryUnit
      ) === null;
    }))) {
      setError('Enter the conversion ratio for substitute ingredients with incompatible units.');
      return;
    }
    const savedRecipe = recipe.map((item, index) => {
      const ingredient = ingredients.find(row => row.id === item.ingredientId);
      const quantity = parsedQuantities[index];
      return ingredient
        ? {
            ingredientId: ingredient.id,
            ingredientName: ingredient.name,
            quantityRequired: quantity?.min ?? item.quantityRequired,
            ...(quantity && quantity.min !== quantity.max ? { quantityRequiredMax: quantity.max } : {}),
            unit: item.unit,
            recipeUnitsPerInventoryUnit: item.recipeUnitsPerInventoryUnit,
            optional: Boolean(item.optional),
            substitutes: (item.substitutes || []).map(substitute => {
              const substituteIngredient = ingredients.find(row => row.id === substitute.ingredientId);
              return substituteIngredient
                ? {
                    ingredientId: substituteIngredient.id,
                    ingredientName: substituteIngredient.name,
                    recipeUnitsPerInventoryUnit: substitute.recipeUnitsPerInventoryUnit,
                  }
                : substitute;
            }),
          }
        : item;
    });
    if (savedRecipe.some(item => !ingredients.some(row => row.id === item.ingredientId))) {
      setError('A selected raw material is no longer available. Replace or remove it.');
      return;
    }

    const parsedContainerVolume = outputUnit.trim().toLowerCase() === 'bottles' && containerVolumeMl
      ? Number(containerVolumeMl)
      : undefined;
    if (!updateFinishedGoodRecipe(
      selectedProduct.id,
      savedRecipe,
      parsedBaseBatch,
      outputUnit.trim(),
      parsedContainerVolume,
    )) {
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
          Add materials in Raw Ingredients first. Recipe quantities convert compatible units to match inventory during production.
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
                      {product.batchUnitQuantity || 100} {product.unit}
                      {product.unit.trim().toLowerCase() === 'bottles' && product.containerVolumeMl
                        ? ` · ${product.containerVolumeMl >= 1000
                          ? `${product.containerVolumeMl / 1000} L`
                          : `${product.containerVolumeMl} ml`} each`
                        : ''}
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
                  Formula output (quantity and unit)
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
                  <select
                    required
                    value={outputUnit}
                    onChange={event => setOutputUnit(event.target.value)}
                    aria-label="Finished product output unit"
                    aria-describedby="recipe-output-unit-hint"
                    className="w-40 rounded-xl border-2 border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 focus:border-indigo-500 focus:outline-none"
                  >
                    {Array.from(new Set([
                      outputUnit,
                      'bottles',
                      'packs',
                      'cones',
                      'pcs',
                      'boxes',
                      'bags',
                    ])).map(unit => (
                      <option key={unit} value={unit}>{unit}</option>
                    ))}
                  </select>
                  {outputUnit.trim().toLowerCase() === 'bottles' && (
                    <select
                      required
                      value={containerVolumeMl}
                      onChange={event => setContainerVolumeMl(event.target.value)}
                      aria-label="Bottle volume"
                      className="w-40 rounded-xl border-2 border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 focus:border-indigo-500 focus:outline-none"
                    >
                      <option value="">Bottle size...</option>
                      {[
                        // { ml: 100, label: '100 ml' },
                        // { ml: 150, label: '150 ml' },
                        { ml: 200, label: '200 ml' },
                        // { ml: 250, label: '250 ml' },
                        // { ml: 330, label: '330 ml' },
                        { ml: 500, label: '500 ml' },
                        // { ml: 750, label: '750 ml' },
                        { ml: 1000, label: '1 L (1000 ml)' },
                        // { ml: 1500, label: '1.5 L (1500 ml)' },
                        // { ml: 2000, label: '2 L (2000 ml)' },
                      ].map(option => (
                        <option key={option.ml} value={option.ml}>{option.label}</option>
                      ))}
                    </select>
                  )}
                </div>
                <p id="recipe-output-unit-hint" className="mt-2 text-[11px] text-slate-500">
                  Choose the finished product unit. For bottles, select the volume of each bottle. WIP production scales ingredients to the requested output amount.
                </p>
              </div>

              <div className="space-y-3">
                <div className="hidden grid-cols-[minmax(0,1fr)_9rem_7rem_2.5rem] gap-2 px-1 text-[10px] font-bold uppercase tracking-wide text-slate-500 sm:grid">
                  <span>Raw material</span>
                  <span>Quantity per recipe</span>
                  <span>Unit</span>
                  <span />
                </div>
                {recipe.map((item, index) => {
                  const selectedIngredient = ingredients.find(row => row.id === item.ingredientId);
                  return (
                    <React.Fragment key={`${item.ingredientId || 'new'}-${index}`}>
                    <div className="grid grid-cols-1 items-center gap-2 sm:grid-cols-[minmax(0,1fr)_9rem_7rem_2.5rem]">
                      <select
                        required
                        value={item.ingredientId}
                        onChange={event => {
                          const ingredient = ingredients.find(row => row.id === event.target.value);
                          updateRecipeRow(index, ingredient
                            ? {
                                ingredientId: ingredient.id,
                                ingredientName: ingredient.name,
                                unit: ingredient.unit,
                                recipeUnitsPerInventoryUnit: undefined,
                              }
                            : { ingredientId: '', ingredientName: '', unit: '' }
                          );
                        }}
                        className="min-w-0 w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-xs font-semibold text-slate-900"
                      >
                        <option value="">Choose raw material...</option>
                        {item.ingredientId && !selectedIngredient && (
                          <option value={item.ingredientId}>Unavailable: {item.ingredientName || item.ingredientId}</option>
                        )}
                        {selectedIngredient && !isRawMaterialCategory(selectedIngredient.category) && (
                          <option value={selectedIngredient.id} disabled>
                            Not an RM category: {selectedIngredient.name}
                          </option>
                        )}
                        {ingredients.filter(ingredient => isRawMaterialCategory(ingredient.category)).map(ingredient => {
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
                        type="text"
                        inputMode="text"
                        required
                        value={quantityInputs[index] ?? ''}
                        onChange={event => {
                          const value = event.target.value;
                          setQuantityInputs(values => values.map((quantity, rowIndex) =>
                            rowIndex === index ? value : quantity
                          ));
                          const parsedQuantity = parseRecipeQuantity(value);
                          if (parsedQuantity !== null) {
                            updateRecipeRow(index, {
                              quantityRequired: parsedQuantity.min,
                              quantityRequiredMax: parsedQuantity.max !== parsedQuantity.min
                                ? parsedQuantity.max
                                : undefined,
                            });
                          }
                        }}
                        placeholder={isDropsUnit(item.unit) ? 'e.g. 15-20' : 'e.g. 1/2'}
                        aria-label={`Quantity for recipe ingredient ${index + 1}`}
                        aria-describedby="recipe-quantity-hint"
                        className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-xs font-mono font-bold"
                      />
                      {selectedIngredient ? (
                        <select
                          required
                          value={item.unit}
                          onChange={event => updateRecipeRow(index, {
                            unit: event.target.value,
                            recipeUnitsPerInventoryUnit: undefined,
                          })}
                          aria-label={`Recipe unit for ingredient ${index + 1}`}
                          className="w-full rounded-xl border border-slate-300 bg-white px-2 py-2.5 text-xs font-semibold text-slate-900"
                        >
                          {Array.from(new Map([
                            ...RECIPE_UNIT_OPTIONS,
                            { value: selectedIngredient.unit, label: selectedIngredient.unit },
                            { value: item.unit, label: item.unit },
                          ].map(option => [option.value.toLowerCase(), option])).values()).map(option => (
                            <option key={option.value} value={option.value}>{option.label}</option>
                          ))}
                        </select>
                      ) : (
                        <span className="text-xs font-semibold text-slate-600">{item.unit || '—'}</span>
                      )}
                      <button
                        type="button"
                        onClick={() => {
                          setRecipe(rows => rows.filter((_, rowIndex) => rowIndex !== index));
                          setQuantityInputs(values => values.filter((_, rowIndex) => rowIndex !== index));
                        }}
                        className="inline-flex h-9 w-9 items-center justify-center rounded-xl text-rose-600 hover:bg-rose-50"
                        aria-label={`Remove recipe ingredient ${index + 1}`}
                        title="Remove ingredient"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                    <div className="space-y-2 rounded-xl border border-slate-200 bg-slate-50 p-3">
                      <label className="flex items-center gap-2 text-xs font-semibold text-slate-700">
                        <input
                          type="checkbox"
                          checked={Boolean(item.optional)}
                          onChange={event => updateRecipeRow(index, { optional: event.target.checked })}
                          className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                        />
                        Optional ingredient
                        <span className="text-[10px] font-normal text-slate-500">
                          (can be skipped for a production batch)
                        </span>
                      </label>
                      <div className="space-y-2">
                        {(item.substitutes || []).map((substitute, substituteIndex) => {
                          const substituteIngredient = ingredients.find(row => row.id === substitute.ingredientId);
                          return (
                            <div key={`${substitute.ingredientId}-${substituteIndex}`} className="space-y-2">
                              <div className="flex gap-2">
                                <select
                                  value={substitute.ingredientId}
                                  onChange={event => {
                                    const nextIngredient = ingredients.find(row => row.id === event.target.value);
                                    updateSubstitute(index, substituteIndex, nextIngredient
                                      ? {
                                          ingredientId: nextIngredient.id,
                                          ingredientName: nextIngredient.name,
                                          recipeUnitsPerInventoryUnit: undefined,
                                        }
                                      : { ingredientId: '', ingredientName: '', recipeUnitsPerInventoryUnit: undefined }
                                    );
                                  }}
                                  aria-label={`Substitute ${substituteIndex + 1} for ${item.ingredientName || 'ingredient'}`}
                                  className="min-w-0 flex-1 rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs"
                                >
                                  <option value="">Choose substitute raw material...</option>
                                  {ingredients.filter(ingredient =>
                                    isRawMaterialCategory(ingredient.category) &&
                                    ingredient.id !== item.ingredientId &&
                                    !(item.substitutes || []).some((other, otherIndex) =>
                                      otherIndex !== substituteIndex && other.ingredientId === ingredient.id
                                    )
                                  ).map(ingredient => (
                                    <option key={ingredient.id} value={ingredient.id}>
                                      {ingredient.name} ({ingredient.sku})
                                    </option>
                                  ))}
                                </select>
                                <button
                                  type="button"
                                  onClick={() => updateRecipeRow(index, {
                                    substitutes: (item.substitutes || []).filter((_, rowIndex) => rowIndex !== substituteIndex),
                                  })}
                                  className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-rose-600 hover:bg-rose-100"
                                  aria-label={`Remove substitute ${substituteIndex + 1}`}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </button>
                              </div>
                              {substituteIngredient && convertUnitQuantity(1, substituteIngredient.unit, item.unit) === null && (
                                <div className="flex items-center gap-2 pl-1 text-[11px] text-amber-900">
                                  <span className="shrink-0 font-semibold">1 {substituteIngredient.unit} =</span>
                                  <input
                                    type="number"
                                    min="0.000001"
                                    step="any"
                                    required
                                    value={substitute.recipeUnitsPerInventoryUnit ?? ''}
                                    onChange={event => updateSubstitute(index, substituteIndex, {
                                      recipeUnitsPerInventoryUnit: Number(event.target.value) || undefined,
                                    })}
                                    aria-label={`Recipe units per ${substituteIngredient.unit} for substitute ${substituteIndex + 1}`}
                                    className="w-24 rounded-lg border border-amber-300 bg-white px-2 py-1.5 font-mono font-bold"
                                  />
                                  <span className="shrink-0 font-semibold">{item.unit}</span>
                                </div>
                              )}
                            </div>
                          );
                        })}
                        <button
                          type="button"
                          disabled={ingredients.length < 2}
                          onClick={() => updateRecipeRow(index, {
                            substitutes: [
                              ...(item.substitutes || []),
                              { ingredientId: '', ingredientName: '' },
                            ],
                          })}
                          className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-[11px] font-bold text-indigo-700 hover:bg-indigo-100 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          <Plus className="h-3 w-3" />
                          Add substitute
                        </button>
                      </div>
                    </div>
                    {selectedIngredient && convertUnitQuantity(1, selectedIngredient.unit, item.unit) === null && (
                      <div className="ml-auto mr-12 flex w-fit items-center gap-2 rounded-xl bg-amber-50 px-2.5 py-2 text-[11px] text-amber-900">
                        <span className="shrink-0 font-semibold">1 {selectedIngredient.unit} =</span>
                        <input
                          type="number"
                          min="0.000001"
                          step="any"
                          required
                          value={item.recipeUnitsPerInventoryUnit ?? ''}
                          onChange={event => updateRecipeRow(index, {
                            recipeUnitsPerInventoryUnit: Number(event.target.value) || undefined,
                          })}
                          aria-label={`Recipe units per ${selectedIngredient.unit} for ingredient ${index + 1}`}
                          className="w-24 rounded-lg border border-amber-300 bg-white px-2 py-1.5 font-mono font-bold"
                        />
                        <span className="shrink-0 font-semibold">{item.unit}</span>
                      </div>
                    )}
                    </React.Fragment>
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
                <p id="recipe-quantity-hint" className="text-[11px] text-slate-500">
                  Enter whole numbers, decimals, or fractions (1/2). For drops, enter a range such as 15-20; production deducts the maximum.
                </p>
                <button
                  type="button"
                  disabled={ingredients.length === 0 || recipe.length >= ingredients.length}
                  onClick={() => {
                    setRecipe(rows => [
                      ...rows,
                      { ingredientId: '', ingredientName: '', quantityRequired: 0, unit: '' },
                    ]);
                    setQuantityInputs(values => [...values, '']);
                  }}
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
