export interface CargoItem {
  commodityId: string;
  quantity: number;
  purchasePrice: number; // Track what we paid for profit calculations
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

  // Tracking
  totalProfit: number;
  tradesCompleted: number;

  // Game flow
  gameStarted: boolean;
  gameOver: boolean;
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

  totalProfit: 0,
  tradesCompleted: 0,

  gameStarted: false,
  gameOver: false,
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
