export const INGREDIENT_CATEGORY_GROUPS = [
  {
    label: 'Raw Materials',
    prefix: 'RM',
    categories: [
      { key: 'milk', label: 'Milk' },
      { key: 'sweetener', label: 'Sweetener' },
      { key: 'flavoring', label: 'Flavoring' },
      { key: 'stabilizer', label: 'Stabilizer & Emulsifiers' },
      { key: 'additive', label: 'Additives & Minerals' },
      { key: 'culture', label: 'Cultures' },
      { key: 'raw_others', label: 'Others' },
    ],
  },
  {
    label: 'Packaging Materials',
    prefix: 'PM',
    categories: [
      { key: 'packaging_fresh_milk', label: 'Fresh Milk' },
      { key: 'packaging_school_milk', label: 'School Milk' },
      { key: 'packaging_lactojuice', label: 'Lactojuice' },
      { key: 'packaging_plastic_bottle', label: 'Plastic Bottle' },
      { key: 'packaging_mercury_plastics', label: 'Mercury Plastics' },
    ],
  },
  {
    label: 'Other Materials',
    categories: [
      { key: 'cleaning_materials', label: 'Cleaning Material', prefix: 'CM' },
      { key: 'lpg_tank', label: 'LPG Tank', prefix: 'LPG' },
      { key: 'milk_labels_print', label: 'Milk Labels - Print', prefix: 'ML' },
      { key: 'others', label: 'Others', prefix: 'OT' },
    ],
  },
];

const RAW_MATERIAL_CATEGORY_KEYS = new Set(
  INGREDIENT_CATEGORY_GROUPS.find(group => group.prefix === 'RM')?.categories.map(category => category.key) || [],
);

export const isRawMaterialCategory = (category: string): boolean => {
  const normalizedCategory = category.trim().toLowerCase();
  return RAW_MATERIAL_CATEGORY_KEYS.has(normalizedCategory) || /^rm(?:\s*[-_:]|$)/i.test(category.trim());
};

export const LEGACY_INGREDIENT_CATEGORY_KEYS = ['packaging', 'sanitizer'];

const categoryOutputLabels = new Map(
  INGREDIENT_CATEGORY_GROUPS.flatMap(group =>
    group.categories.map(category => [
      category.key,
      {
        dropdown: `${'prefix' in category ? category.prefix : group.prefix} - ${category.label}`,
        output: `${'prefix' in category ? category.prefix : group.prefix} - ${category.label}`,
      },
    ] as const)
  )
);

categoryOutputLabels.set('packaging', {
  dropdown: 'PM - Packaging (Existing)',
  output: 'PM - Packaging (Existing)',
});
categoryOutputLabels.set('sanitizer', {
  dropdown: 'CM - Sanitizer (Existing)',
  output: 'CM - Sanitizer (Existing)',
});

export const formatIngredientCategory = (category: string) =>
  categoryOutputLabels.get(category.trim().toLowerCase())?.output ??
  category.replace(/_/g, ' ').replace(/\b\w/g, character => character.toUpperCase());

const UNPREFIXED_INGREDIENT_CATEGORY_OPTIONS = new Set([
  'cleaning_materials',
  'lpg_tank',
  'milk_labels_print',
  'others',
]);

export const formatIngredientCategoryOption = (category: string) => {
  const normalizedCategory = category.trim().toLowerCase();
  const labels = categoryOutputLabels.get(normalizedCategory);
  if (UNPREFIXED_INGREDIENT_CATEGORY_OPTIONS.has(normalizedCategory)) return labels?.output ?? category;
  return labels?.dropdown ?? category.replace(/_/g, ' ').replace(/\b\w/g, character => character.toUpperCase());
};
