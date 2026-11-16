type UnitDefinition = {
  dimension: string;
  factor: number;
  label: string;
  aliases: string[];
};

const UNIT_DEFINITIONS: UnitDefinition[] = [
  { dimension: 'mass', factor: 1000, label: 'kg', aliases: ['kg', 'kilogram', 'kilograms'] },
  { dimension: 'mass', factor: 1, label: 'g', aliases: ['g', 'gram', 'grams'] },
  { dimension: 'mass', factor: 0.001, label: 'mg', aliases: ['mg', 'milligram', 'milligrams'] },
  { dimension: 'volume', factor: 1000, label: 'L', aliases: ['l', 'liter', 'liters', 'litre', 'litres'] },
  { dimension: 'volume', factor: 1, label: 'ml', aliases: ['ml', 'milliliter', 'milliliters', 'millilitre', 'millilitres'] },
  { dimension: 'volume', factor: 4.92892159375, label: 'tsp', aliases: ['tsp', 'teaspoon', 'teaspoons'] },
  { dimension: 'volume', factor: 14.78676478125, label: 'tbsp', aliases: ['tbsp', 'tablespoon', 'tablespoons'] },
  { dimension: 'volume', factor: 3785.411784, label: 'gal', aliases: ['gal', 'gallon', 'gallons'] },
  { dimension: 'count', factor: 1, label: 'pcs', aliases: ['piece', 'pieces', 'pc', 'pcs', 'bottle', 'bottles', 'can', 'cans', 'cap', 'caps', 'label', 'labels', 'block', 'blocks'] },
  { dimension: 'drop', factor: 1, label: 'drops', aliases: ['drop', 'drops'] },
  { dimension: 'percent', factor: 1, label: '%', aliases: ['%', 'percent', 'percentage'] },
  { dimension: 'pack', factor: 1, label: 'packs', aliases: ['pack', 'packs'] },
  { dimension: 'box', factor: 1, label: 'boxes', aliases: ['box', 'boxes'] },
  { dimension: 'bag', factor: 1, label: 'bags', aliases: ['bag', 'bags'] },
  { dimension: 'roll', factor: 1, label: 'rolls', aliases: ['roll', 'rolls'] },
  { dimension: 'sachet', factor: 1, label: 'sachets', aliases: ['sachet', 'sachets'] },
  { dimension: 'tank', factor: 1, label: 'tank', aliases: ['tank', 'tanks'] },
];

const normalizeUnit = (unit: string) => unit.trim().toLowerCase();

const getUnitDefinition = (unit: string) => {
  const normalized = normalizeUnit(unit);
  return UNIT_DEFINITIONS.find(definition =>
    definition.aliases.includes(normalized)
  );
};

export const RECIPE_UNIT_OPTIONS = [
  { value: 'mg', label: 'Milligrams (mg)' },
  { value: 'g', label: 'Grams (g)' },
  { value: 'kg', label: 'Kilograms (kg)' },
  { value: 'drops', label: 'Drops' },
  { value: 'ml', label: 'Milliliters (ml)' },
  { value: 'L', label: 'Liters (L)' },
  { value: 'tsp', label: 'Teaspoons (tsp)' },
  { value: 'tbsp', label: 'Tablespoons (tbsp)' },
  { value: 'gal', label: 'Gallons (gal)' },
  { value: 'pcs', label: 'Pieces (pcs)' },
  { value: 'bottles', label: 'Bottles' },
  { value: 'cans', label: 'Cans' },
  { value: 'packs', label: 'Packs' },
  { value: 'boxes', label: 'Boxes' },
  { value: 'bags', label: 'Bags' },
  { value: 'rolls', label: 'Rolls' },
  { value: 'sachets', label: 'Sachets' },
];

export const convertUnitQuantity = (
  quantity: number,
  fromUnit: string,
  toUnit: string
): number | null => {
  if (!Number.isFinite(quantity) || !fromUnit.trim() || !toUnit.trim()) return null;

  const from = getUnitDefinition(fromUnit);
  const to = getUnitDefinition(toUnit);
  if (!from || !to) {
    return normalizeUnit(fromUnit) === normalizeUnit(toUnit) ? quantity : null;
  }
  if (from.dimension !== to.dimension) return null;
  return quantity * from.factor / to.factor;
};

export const getRecipeUnitsPerInventoryUnit = (
  inventoryUnit: string,
  recipeUnit: string,
  customRecipeUnitsPerInventoryUnit?: number
): number | null => {
  const automaticRatio = convertUnitQuantity(1, inventoryUnit, recipeUnit);
  if (automaticRatio !== null) return automaticRatio;
  return customRecipeUnitsPerInventoryUnit !== undefined &&
    Number.isFinite(customRecipeUnitsPerInventoryUnit) &&
    customRecipeUnitsPerInventoryUnit > 0
    ? customRecipeUnitsPerInventoryUnit
    : null;
};

export const convertRecipeQuantityToInventory = (
  recipeQuantity: number,
  inventoryUnit: string,
  recipeUnit: string,
  recipeUnitsPerInventoryUnit?: number
): number | null => {
  const ratio = getRecipeUnitsPerInventoryUnit(
    inventoryUnit,
    recipeUnit,
    recipeUnitsPerInventoryUnit
  );
  return ratio === null ? null : recipeQuantity / ratio;
};

export const convertInventoryQuantityToRecipe = (
  inventoryQuantity: number,
  inventoryUnit: string,
  recipeUnit: string,
  recipeUnitsPerInventoryUnit?: number
): number | null => {
  const ratio = getRecipeUnitsPerInventoryUnit(
    inventoryUnit,
    recipeUnit,
    recipeUnitsPerInventoryUnit
  );
  return ratio === null ? null : inventoryQuantity * ratio;
};
