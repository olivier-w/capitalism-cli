import type { RegionId } from './locations.ts';

export interface Commodity {
  id: string;
  name: string;
  basePrice: number;
  minPrice: number;
  maxPrice: number;
  unit: string;
  regional?: boolean;
  regions?: RegionId[];
}

export const commodities: Commodity[] = [
  // === UNIVERSAL COMMODITIES ===
  {
    id: 'coffee',
    name: 'Coffee',
    basePrice: 40,
    minPrice: 20,
    maxPrice: 80,
    unit: 'bags',
  },
  {
    id: 'electronics',
    name: 'Electronics',
    basePrice: 150,
    minPrice: 80,
    maxPrice: 300,
    unit: 'units',
  },
  {
    id: 'textiles',
    name: 'Textiles',
    basePrice: 30,
    minPrice: 15,
    maxPrice: 60,
    unit: 'bales',
  },
  {
    id: 'fuel',
    name: 'Fuel',
    basePrice: 60,
    minPrice: 35,
    maxPrice: 120,
    unit: 'barrels',
  },
  {
    id: 'produce',
    name: 'Produce',
    basePrice: 20,
    minPrice: 10,
    maxPrice: 45,
    unit: 'crates',
  },

  // === COASTAL COMMODITIES ===
  {
    id: 'spices',
    name: 'Exotic Spices',
    basePrice: 80,
    minPrice: 40,
    maxPrice: 180,
    unit: 'cases',
    regional: true,
    regions: ['coastal'],
  },
  {
    id: 'silk',
    name: 'Silk',
    basePrice: 200,
    minPrice: 100,
    maxPrice: 400,
    unit: 'rolls',
    regional: true,
    regions: ['coastal'],
  },
  {
    id: 'seafood',
    name: 'Fresh Seafood',
    basePrice: 50,
    minPrice: 25,
    maxPrice: 100,
    unit: 'crates',
    regional: true,
    regions: ['coastal'],
  },

  // === FARMING COMMODITIES ===
  {
    id: 'grain',
    name: 'Grain',
    basePrice: 25,
    minPrice: 12,
    maxPrice: 55,
    unit: 'bushels',
    regional: true,
    regions: ['farming'],
  },
  {
    id: 'leather',
    name: 'Leather',
    basePrice: 70,
    minPrice: 35,
    maxPrice: 140,
    unit: 'hides',
    regional: true,
    regions: ['farming'],
  },
];

export const getCommodity = (id: string): Commodity | undefined => {
  return commodities.find((c) => c.id === id);
};

export const getCommoditiesForRegions = (unlockedRegions: RegionId[]): Commodity[] => {
  return commodities.filter((c) => {
    if (!c.regional) return true;
    if (!c.regions) return true;
    return c.regions.some((r) => unlockedRegions.includes(r));
  });
};
