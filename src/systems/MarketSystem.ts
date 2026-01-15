import { commodities, getCommoditiesForRegions, type Commodity } from '../data/commodities.ts';
import { getLocation, type Location, type RegionId } from '../data/locations.ts';
import { getEvent, type MarketEvent } from '../data/events.ts';
import type { ActiveEvent, WeeklyStatus } from '../game/GameState.ts';
import { getSaturationMultiplier } from './MarketSaturation.ts';
import { getHotColdMultiplier } from './HotColdSystem.ts';

// Deterministic hash function for seeded random variance
const simpleHash = (str: string): number => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  return Math.abs(hash);
};

export interface MarketPrice {
  commodityId: string;
  name: string;
  buyPrice: number;
  sellPrice: number;
  trend: 'cheap' | 'expensive' | 'normal';
  unit: string;
  isHot: boolean;
  isCold: boolean;
  eventAffected: boolean;
  saturationLevel: 'flooded' | 'oversupplied' | 'normal' | 'scarce' | 'shortage';
}

export interface MarketContext {
  day: number;
  activeEvents: ActiveEvent[];
  marketSaturation: Record<string, number>;
  weeklyStatus: WeeklyStatus;
  unlockedRegions: RegionId[];
}

const getEventMultiplier = (
  commodity: Commodity,
  location: Location,
  activeEvents: ActiveEvent[]
): { multiplier: number; affected: boolean } => {
  let multiplier = 1;
  let affected = false;

  for (const active of activeEvents) {
    const event = getEvent(active.eventId);
    if (!event) continue;

    // Check if event applies to this location
    let applies = false;
    if (event.scope === 'global') {
      applies = true;
    } else if (event.scope === 'region' && active.affectedRegionId === location.region) {
      applies = true;
    } else if (event.scope === 'location' && active.affectedLocationId === location.id) {
      applies = true;
    }

    if (applies) {
      const effect = event.commodityEffects.find((e) => e.commodityId === commodity.id);
      if (effect) {
        multiplier *= effect.priceMultiplier;
        affected = true;
      }
    }
  }

  return { multiplier, affected };
};

export const calculatePrice = (
  commodity: Commodity,
  location: Location,
  context: MarketContext
): { price: number; eventAffected: boolean } => {
  let price = commodity.basePrice;

  // 1. Location modifier: cheap where produced, expensive where needed
  if (location.produces.includes(commodity.id)) {
    price *= 0.6; // 40% cheaper
  } else if (location.needs.includes(commodity.id)) {
    price *= 1.5; // 50% more expensive
  }

  // 2. Hot/Cold commodity modifier
  price *= getHotColdMultiplier(commodity.id, context.weeklyStatus);

  // 3. Active events modifier
  const { multiplier: eventMultiplier, affected: eventAffected } = getEventMultiplier(
    commodity,
    location,
    context.activeEvents
  );
  price *= eventMultiplier;

  // 4. Market saturation effect
  price *= getSaturationMultiplier(context.marketSaturation, location.id, commodity.id);

  // 5. Daily variance - seeded by day/location/commodity for consistency
  const seed = `${context.day}-${location.id}-${commodity.id}`;
  const hash = simpleHash(seed);
  const variance = ((hash % 1000) / 1000 - 0.5) * 0.2; // -10% to +10%
  price *= 1 + variance;

  // Clamp to min/max
  price = Math.max(commodity.minPrice, Math.min(commodity.maxPrice, price));

  return { price: Math.round(price), eventAffected };
};

export const getMarketPrices = (
  locationId: string,
  context: MarketContext
): MarketPrice[] => {
  const location = getLocation(locationId);
  if (!location) return [];

  // Only show commodities available in unlocked regions
  const availableCommodities = getCommoditiesForRegions(context.unlockedRegions);

  return availableCommodities.map((commodity) => {
    const { price: buyPrice, eventAffected } = calculatePrice(commodity, location, context);
    const sellPrice = Math.round(buyPrice * 0.85); // 15% spread

    let trend: 'cheap' | 'expensive' | 'normal' = 'normal';
    if (location.produces.includes(commodity.id)) {
      trend = 'cheap';
    } else if (location.needs.includes(commodity.id)) {
      trend = 'expensive';
    }

    const isHot = commodity.id === context.weeklyStatus.hotCommodity;
    const isCold = commodity.id === context.weeklyStatus.coldCommodity;

    // Get saturation level
    const satKey = `${locationId}:${commodity.id}`;
    const satAmount = context.marketSaturation[satKey] ?? 0;
    let saturationLevel: MarketPrice['saturationLevel'] = 'normal';
    if (satAmount > 30) saturationLevel = 'flooded';
    else if (satAmount > 10) saturationLevel = 'oversupplied';
    else if (satAmount < -30) saturationLevel = 'shortage';
    else if (satAmount < -10) saturationLevel = 'scarce';

    return {
      commodityId: commodity.id,
      name: commodity.name,
      buyPrice,
      sellPrice,
      trend,
      unit: commodity.unit,
      isHot,
      isCold,
      eventAffected,
      saturationLevel,
    };
  });
};

export const getBuyPrice = (
  commodityId: string,
  locationId: string,
  context: MarketContext
): number => {
  const prices = getMarketPrices(locationId, context);
  return prices.find((p) => p.commodityId === commodityId)?.buyPrice ?? 0;
};

export const getSellPrice = (
  commodityId: string,
  locationId: string,
  context: MarketContext
): number => {
  const prices = getMarketPrices(locationId, context);
  return prices.find((p) => p.commodityId === commodityId)?.sellPrice ?? 0;
};
