import type { RegionId } from './locations.ts';

export type EventScope = 'global' | 'region' | 'location';

export interface MarketEvent {
  id: string;
  name: string;
  description: string;
  scope: EventScope;
  affectedLocations?: string[];
  affectedRegion?: RegionId;
  commodityEffects: {
    commodityId: string;
    priceMultiplier: number;
  }[];
  durationDays: number;
  weight: number; // Higher = more likely
}

export const marketEvents: MarketEvent[] = [
  // === GLOBAL EVENTS ===
  {
    id: 'fuel_shortage',
    name: 'Fuel Shortage',
    description: 'Refinery problems cause fuel scarcity worldwide',
    scope: 'global',
    commodityEffects: [{ commodityId: 'fuel', priceMultiplier: 1.8 }],
    durationDays: 4,
    weight: 8,
  },
  {
    id: 'trade_boom',
    name: 'Trade Boom',
    description: 'Economic optimism boosts all trade activity',
    scope: 'global',
    commodityEffects: [
      { commodityId: 'electronics', priceMultiplier: 1.3 },
      { commodityId: 'textiles', priceMultiplier: 1.2 },
    ],
    durationDays: 5,
    weight: 6,
  },
  {
    id: 'market_crash',
    name: 'Market Downturn',
    description: 'Economic uncertainty depresses prices',
    scope: 'global',
    commodityEffects: [
      { commodityId: 'electronics', priceMultiplier: 0.7 },
      { commodityId: 'silk', priceMultiplier: 0.6 },
    ],
    durationDays: 3,
    weight: 5,
  },

  // === STARTER REGION EVENTS ===
  {
    id: 'harbor_storm',
    name: 'Harbor Storm',
    description: 'Severe weather disrupts shipping at the port',
    scope: 'location',
    affectedLocations: ['port'],
    commodityEffects: [
      { commodityId: 'coffee', priceMultiplier: 1.4 },
      { commodityId: 'textiles', priceMultiplier: 1.3 },
    ],
    durationDays: 3,
    weight: 12,
  },
  {
    id: 'tech_expo',
    name: 'Tech Expo',
    description: 'Annual technology exhibition drives demand in Metro City',
    scope: 'location',
    affectedLocations: ['metro'],
    commodityEffects: [{ commodityId: 'electronics', priceMultiplier: 1.6 }],
    durationDays: 4,
    weight: 10,
  },
  {
    id: 'factory_overtime',
    name: 'Factory Overtime',
    description: 'Industrial Zone ramps up production',
    scope: 'location',
    affectedLocations: ['industrial'],
    commodityEffects: [{ commodityId: 'fuel', priceMultiplier: 0.7 }],
    durationDays: 3,
    weight: 10,
  },

  // === COASTAL REGION EVENTS ===
  {
    id: 'spice_fleet',
    name: 'Spice Fleet Arrives',
    description: 'A merchant fleet brings abundant exotic spices',
    scope: 'region',
    affectedRegion: 'coastal',
    commodityEffects: [
      { commodityId: 'spices', priceMultiplier: 0.6 },
      { commodityId: 'silk', priceMultiplier: 0.8 },
    ],
    durationDays: 5,
    weight: 8,
  },
  {
    id: 'fishing_season',
    name: 'Fishing Season Peak',
    description: 'Abundant catches flood the coastal markets',
    scope: 'region',
    affectedRegion: 'coastal',
    commodityEffects: [{ commodityId: 'seafood', priceMultiplier: 0.5 }],
    durationDays: 6,
    weight: 10,
  },
  {
    id: 'dock_strike',
    name: 'Dock Workers Strike',
    description: 'Labor disputes slow cargo handling at the docks',
    scope: 'location',
    affectedLocations: ['docks', 'harbor'],
    commodityEffects: [
      { commodityId: 'textiles', priceMultiplier: 1.5 },
      { commodityId: 'silk', priceMultiplier: 1.4 },
    ],
    durationDays: 4,
    weight: 8,
  },

  // === FARMING REGION EVENTS ===
  {
    id: 'bumper_harvest',
    name: 'Bumper Harvest',
    description: 'Excellent growing conditions flood markets with produce',
    scope: 'region',
    affectedRegion: 'farming',
    commodityEffects: [
      { commodityId: 'produce', priceMultiplier: 0.5 },
      { commodityId: 'grain', priceMultiplier: 0.6 },
      { commodityId: 'coffee', priceMultiplier: 0.7 },
    ],
    durationDays: 6,
    weight: 10,
  },
  {
    id: 'drought',
    name: 'Drought',
    description: 'Dry conditions reduce agricultural output',
    scope: 'region',
    affectedRegion: 'farming',
    commodityEffects: [
      { commodityId: 'produce', priceMultiplier: 1.6 },
      { commodityId: 'grain', priceMultiplier: 1.5 },
    ],
    durationDays: 5,
    weight: 7,
  },
  {
    id: 'cattle_drive',
    name: 'Cattle Drive',
    description: 'Large herds arrive at the ranch, leather prices drop',
    scope: 'location',
    affectedLocations: ['ranch'],
    commodityEffects: [{ commodityId: 'leather', priceMultiplier: 0.6 }],
    durationDays: 4,
    weight: 9,
  },
  {
    id: 'orchard_blight',
    name: 'Orchard Blight',
    description: 'Disease affects coffee and fruit production',
    scope: 'location',
    affectedLocations: ['orchards'],
    commodityEffects: [
      { commodityId: 'coffee', priceMultiplier: 1.7 },
      { commodityId: 'produce', priceMultiplier: 1.4 },
    ],
    durationDays: 5,
    weight: 6,
  },
];

export const getEvent = (id: string): MarketEvent | undefined => {
  return marketEvents.find((e) => e.id === id);
};
