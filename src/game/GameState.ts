import type { RegionId } from '../data/locations.ts';

export interface CargoItem {
  commodityId: string;
  quantity: number;
  purchasePrice: number;
}

export interface ActiveEvent {
  eventId: string;
  startDay: number;
  endDay: number;
  affectedLocationId?: string;
  affectedRegionId?: RegionId;
}

export interface EventLogEntry {
  day: number;
  eventName: string;
  description: string;
  isStarting: boolean;
}

export interface WeeklyStatus {
  hotCommodity: string | null;
  coldCommodity: string | null;
  week: number;
}

export interface GameState {
  // Core state
  money: number;
  day: number;
  maxDays: number;
  energy: number;
  maxEnergy: number;
  location: string;
  vehicle: string;
  cargo: CargoItem[];

  // Vehicle parts system
  ownedParts: string[]; // All purchased part IDs
  equippedParts: string[]; // Currently active parts (max 3)

  // Tracking
  totalProfit: number;
  tradesCompleted: number;

  // Game flow
  gameStarted: boolean;
  gameOver: boolean;

  // Region system
  unlockedRegions: RegionId[];

  // Dynamic market
  marketSaturation: Record<string, number>; // "locationId:commodityId" -> saturation amount
  activeEvents: ActiveEvent[];
  eventLog: EventLogEntry[];
  weeklyStatus: WeeklyStatus;
}

export const INITIAL_STATE: GameState = {
  money: 100,
  day: 1,
  maxDays: 30,
  energy: 100,
  maxEnergy: 100,
  location: 'metro',
  vehicle: 'bicycle',
  cargo: [],

  // Parts start empty
  ownedParts: [],
  equippedParts: [],

  totalProfit: 0,
  tradesCompleted: 0,

  gameStarted: false,
  gameOver: false,

  // Start with only starter region unlocked
  unlockedRegions: ['starter'],

  // Dynamic market starts empty
  marketSaturation: {},
  activeEvents: [],
  eventLog: [],
  weeklyStatus: { hotCommodity: null, coldCommodity: null, week: 0 },
};

export const getCargoQuantity = (cargo: CargoItem[], commodityId: string): number => {
  const item = cargo.find((c) => c.commodityId === commodityId);
  return item?.quantity ?? 0;
};

export const getTotalCargoUnits = (cargo: CargoItem[]): number => {
  return cargo.reduce((sum, item) => sum + item.quantity, 0);
};

export const getCargoValue = (
  cargo: CargoItem[],
  getPriceForCommodity: (commodityId: string) => number
): number => {
  return cargo.reduce((sum, item) => {
    return sum + item.quantity * getPriceForCommodity(item.commodityId);
  }, 0);
};
