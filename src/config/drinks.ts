export const ALCOHOLIC_DRINKS = [
  'Castel',
  'Beaufort',
  'Primus',
  'Tembo',
  'Turbo King',
  'Mutzig',
  'Heineken',
  'Nkoyi',
  'Likofi',
] as const;

export const SOFT_DRINKS = [
  'Coca',
  'Fanta',
  'Vitalo',
  'Maltina',
  'Sprite',
  'Energy Malt',
  'Eau',
] as const;

export type DrinkCategory = 'alcoholic' | 'soft' | 'other';

const ALCOHOLIC_PALETTE = [
  '#b45309',
  '#c2410c',
  '#9a3412',
  '#d97706',
  '#ea580c',
  '#92400e',
  '#78350f',
  '#f59e0b',
  '#fb923c',
];

const SOFT_PALETTE = [
  '#2563eb',
  '#0891b2',
  '#059669',
  '#7c3aed',
  '#0284c7',
  '#0d9488',
  '#4f46e5',
];

export function getDrinkCategory(name: string): DrinkCategory {
  const key = name.toLowerCase();
  if (ALCOHOLIC_DRINKS.some((d) => d.toLowerCase() === key)) return 'alcoholic';
  if (SOFT_DRINKS.some((d) => d.toLowerCase() === key)) return 'soft';
  return 'other';
}

export function getDrinkBarColor(name: string, indexInCategory: number): string {
  const category = getDrinkCategory(name);
  if (category === 'alcoholic') {
    return ALCOHOLIC_PALETTE[indexInCategory % ALCOHOLIC_PALETTE.length];
  }
  if (category === 'soft') {
    return SOFT_PALETTE[indexInCategory % SOFT_PALETTE.length];
  }
  return '#94a3b8';
}

export function buildDrinksChartData(stats: Record<string, number> = {}) {
  const alcoholicIndex = { current: 0 };
  const softIndex = { current: 0 };

  return Object.entries(stats)
    .sort((a, b) => b[1] - a[1])
    .map(([name, value]) => {
      const category = getDrinkCategory(name);
      let fill: string;
      if (category === 'alcoholic') {
        fill = getDrinkBarColor(name, alcoholicIndex.current);
        alcoholicIndex.current += 1;
      } else if (category === 'soft') {
        fill = getDrinkBarColor(name, softIndex.current);
        softIndex.current += 1;
      } else {
        fill = getDrinkBarColor(name, 0);
      }

      return {
        name,
        value,
        fill,
        category,
        categoryLabel:
          category === 'alcoholic'
            ? 'Avec alcool'
            : category === 'soft'
              ? 'Sans alcool'
              : 'Autre',
      };
    });
}
