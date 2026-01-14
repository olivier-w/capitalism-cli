export interface Commodity {
  id: string;
  name: string;
  basePrice: number;
  minPrice: number;
  maxPrice: number;
  unit: string;
}

export const commodities: Commodity[] = [
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
];

export const getCommodity = (id: string): Commodity | undefined => {
  return commodities.find((c) => c.id === id);
};
