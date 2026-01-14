import { commodities, type Commodity } from '../data/commodities.ts';
import { getLocation, type Location } from '../data/locations.ts';

export interface MarketPrice {
  commodityId: string;
  name: string;
  buyPrice: number;
  sellPrice: number;
  trend: 'cheap' | 'expensive' | 'normal';
  unit: string;
}

// Seeded random for reproducible prices per day
const seededRandom = (seed: number): number => {
  const x = Math.sin(seed * 9999) * 10000;
  return x - Math.floor(x);
};

export const calculatePrice = (
  commodity: Commodity,
  location: Location,
  day: number
): number => {
  let price = commodity.basePrice;

  // Location modifier: cheap where produced, expensive where needed
  if (location.produces.includes(commodity.id)) {
    price *= 0.6; // 40% cheaper
  } else if (location.needs.includes(commodity.id)) {
    price *= 1.5; // 50% more expensive
  }

  // Weekly cycle (learnable pattern)
  const weekDay = day % 7;
  if (commodity.id === 'electronics' && weekDay === 0) {
    price *= 1.2; // Electronics spike on "Sundays"
  }
  if (commodity.id === 'coffee' && (weekDay === 1 || weekDay === 2)) {
    price *= 0.9; // Coffee dips early week
  }

  // Daily variance using seeded random (+/- 15%)
  const seed = day * 1000 + commodity.id.charCodeAt(0) * 100 + location.id.charCodeAt(0);
  const variance = (seededRandom(seed) - 0.5) * 0.3; // -15% to +15%
  price *= 1 + variance;

  // Clamp to min/max
  price = Math.max(commodity.minPrice, Math.min(commodity.maxPrice, price));

  return Math.round(price);
};

export const getMarketPrices = (locationId: string, day: number): MarketPrice[] => {
  const location = getLocation(locationId);
  if (!location) return [];

  return commodities.map((commodity) => {
    const buyPrice = calculatePrice(commodity, location, day);
    const sellPrice = Math.round(buyPrice * 0.85); // 15% spread

    let trend: 'cheap' | 'expensive' | 'normal' = 'normal';
    if (location.produces.includes(commodity.id)) {
      trend = 'cheap';
    } else if (location.needs.includes(commodity.id)) {
      trend = 'expensive';
    }

    return {
      commodityId: commodity.id,
      name: commodity.name,
      buyPrice,
      sellPrice,
      trend,
      unit: commodity.unit,
    };
  });
};

export const getBuyPrice = (commodityId: string, locationId: string, day: number): number => {
  const prices = getMarketPrices(locationId, day);
  return prices.find((p) => p.commodityId === commodityId)?.buyPrice ?? 0;
};

export const getSellPrice = (commodityId: string, locationId: string, day: number): number => {
  const prices = getMarketPrices(locationId, day);
  return prices.find((p) => p.commodityId === commodityId)?.sellPrice ?? 0;
};
