import { create } from 'zustand';
import {
  type GameState,
  type CargoItem,
  INITIAL_STATE,
  getTotalCargoUnits,
} from '../game/GameState.ts';
import { getVehicle } from '../data/vehicles.ts';
import { getLocation } from '../data/locations.ts';
import { getBuyPrice, getSellPrice } from '../systems/MarketSystem.ts';

interface GameActions {
  // Game flow
  startGame: () => void;
  resetGame: () => void;

  // Trading
  buy: (commodityId: string, quantity: number) => { success: boolean; message: string };
  sell: (commodityId: string, quantity: number) => { success: boolean; message: string };

  // Movement
  travel: (destinationId: string) => { success: boolean; message: string };

  // Day management
  rest: () => void;
  advanceDay: () => void;

  // Vehicle
  buyVehicle: (vehicleId: string) => { success: boolean; message: string };

  // Computed helpers
  getCargoCapacity: () => number;
  getCargoUsed: () => number;
  getTravelCost: (destinationId: string) => number;
}

type GameStore = GameState & GameActions;

export const useGameStore = create<GameStore>()((set, get) => ({
  ...INITIAL_STATE,

  startGame: () => {
    set({ ...INITIAL_STATE, gameStarted: true });
  },

  resetGame: () => {
    set({ ...INITIAL_STATE });
  },

  buy: (commodityId: string, quantity: number) => {
    const state = get();
    const price = getBuyPrice(commodityId, state.location, state.day);
    const totalCost = price * quantity;
    const capacity = state.getCargoCapacity();
    const used = state.getCargoUsed();

    if (quantity <= 0) {
      return { success: false, message: 'Invalid quantity' };
    }

    if (totalCost > state.money) {
      return { success: false, message: 'Not enough money' };
    }

    if (used + quantity > capacity) {
      return { success: false, message: 'Not enough cargo space' };
    }

    // Add to cargo
    const existingIndex = state.cargo.findIndex((c) => c.commodityId === commodityId);
    let newCargo: CargoItem[];

    if (existingIndex >= 0) {
      // Update existing cargo with weighted average purchase price
      const existing = state.cargo[existingIndex]!;
      const totalQuantity = existing.quantity + quantity;
      const avgPrice = Math.round(
        (existing.purchasePrice * existing.quantity + price * quantity) / totalQuantity
      );
      newCargo = [...state.cargo];
      newCargo[existingIndex] = {
        ...existing,
        quantity: totalQuantity,
        purchasePrice: avgPrice,
      };
    } else {
      newCargo = [
        ...state.cargo,
        { commodityId, quantity, purchasePrice: price },
      ];
    }

    set({
      money: state.money - totalCost,
      cargo: newCargo,
      energy: Math.max(0, state.energy - 5),
    });

    return { success: true, message: `Bought ${quantity} for $${totalCost}` };
  },

  sell: (commodityId: string, quantity: number) => {
    const state = get();
    const cargoItem = state.cargo.find((c) => c.commodityId === commodityId);

    if (!cargoItem || cargoItem.quantity < quantity) {
      return { success: false, message: 'Not enough to sell' };
    }

    if (quantity <= 0) {
      return { success: false, message: 'Invalid quantity' };
    }

    const price = getSellPrice(commodityId, state.location, state.day);
    const totalRevenue = price * quantity;
    const profit = totalRevenue - cargoItem.purchasePrice * quantity;

    // Update cargo
    let newCargo: CargoItem[];
    if (cargoItem.quantity === quantity) {
      newCargo = state.cargo.filter((c) => c.commodityId !== commodityId);
    } else {
      newCargo = state.cargo.map((c) =>
        c.commodityId === commodityId ? { ...c, quantity: c.quantity - quantity } : c
      );
    }

    set({
      money: state.money + totalRevenue,
      cargo: newCargo,
      energy: Math.max(0, state.energy - 5),
      totalProfit: state.totalProfit + profit,
      tradesCompleted: state.tradesCompleted + 1,
    });

    return { success: true, message: `Sold for $${totalRevenue} (${profit >= 0 ? '+' : ''}$${profit})` };
  },

  travel: (destinationId: string) => {
    const state = get();
    const destination = getLocation(destinationId);
    const current = getLocation(state.location);

    if (!destination || !current) {
      return { success: false, message: 'Invalid destination' };
    }

    if (!current.connections.includes(destinationId)) {
      return { success: false, message: 'No route to that location' };
    }

    const cost = state.getTravelCost(destinationId);
    if (state.energy < cost) {
      return { success: false, message: `Need ${cost} energy to travel (have ${state.energy})` };
    }

    set({
      location: destinationId,
      energy: state.energy - cost,
    });

    return { success: true, message: `Traveled to ${destination.name}` };
  },

  rest: () => {
    const state = get();
    set({
      energy: state.maxEnergy,
    });
    get().advanceDay();
  },

  advanceDay: () => {
    const state = get();
    const newDay = state.day + 1;

    if (newDay > state.maxDays) {
      set({ gameOver: true });
    } else {
      set({ day: newDay, energy: state.maxEnergy });
    }
  },

  buyVehicle: (vehicleId: string) => {
    const state = get();
    const vehicle = getVehicle(vehicleId);

    if (!vehicle) {
      return { success: false, message: 'Invalid vehicle' };
    }

    if (vehicleId === state.vehicle) {
      return { success: false, message: 'Already own this vehicle' };
    }

    if (vehicle.cost > state.money) {
      return { success: false, message: 'Not enough money' };
    }

    set({
      vehicle: vehicleId,
      money: state.money - vehicle.cost,
    });

    return { success: true, message: `Purchased ${vehicle.name}!` };
  },

  getCargoCapacity: () => {
    const state = get();
    const vehicle = getVehicle(state.vehicle);
    return vehicle?.capacity ?? 20;
  },

  getCargoUsed: () => {
    return getTotalCargoUnits(get().cargo);
  },

  getTravelCost: (destinationId: string) => {
    const state = get();
    const destination = getLocation(destinationId);
    const vehicle = getVehicle(state.vehicle);
    if (!destination || !vehicle) return 999;
    return Math.round(destination.travelCost * vehicle.energyMultiplier);
  },
}));
