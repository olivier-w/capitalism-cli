import { create } from 'zustand';
import { existsSync, readFileSync, writeFileSync, unlinkSync } from 'fs';
import { homedir } from 'os';
import { join } from 'path';
import {
  type GameState,
  type CargoItem,
  type ActiveEvent,
  type EventLogEntry,
  INITIAL_STATE,
  getTotalCargoUnits,
} from '../game/GameState.ts';
import { getVehicle, getVehicleTier, canVehicleTravelTo } from '../data/vehicles.ts';
import { getLocation, getRegion, type RegionId } from '../data/locations.ts';
import {
  getPart,
  getCapacityBonus,
  getEfficiencyMultiplier,
  canEquipPart,
  MAX_EQUIPPED_PARTS,
} from '../data/parts.ts';
import { getBuyPrice, getSellPrice, type MarketContext } from '../systems/MarketSystem.ts';
import { addSaturation, decaySaturation } from '../systems/MarketSaturation.ts';
import { generateWeeklyStatus } from '../systems/HotColdSystem.ts';
import { marketEvents, getEvent } from '../data/events.ts';

const SAVE_FILE_PATH = join(homedir(), '.capitalism-cli-save.json');

export const hasSaveGame = (): boolean => {
  return existsSync(SAVE_FILE_PATH);
};

interface GameActions {
  // Game flow
  startGame: () => void;
  resetGame: () => void;
  saveGame: () => void;
  loadGame: () => boolean;
  deleteSave: () => void;

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

  // Parts system
  buyPart: (partId: string) => { success: boolean; message: string };
  equipPart: (partId: string) => { success: boolean; message: string };
  unequipPart: (partId: string) => { success: boolean; message: string };

  // Region system
  unlockRegion: (regionId: RegionId) => { success: boolean; message: string };
  canAccessLocation: (locationId: string) => boolean;

  // Computed helpers
  getCargoCapacity: () => number;
  getCargoUsed: () => number;
  getTravelCost: (destinationId: string) => number;
  getMarketContext: () => MarketContext;
}

type GameStore = GameState & GameActions;

// Helper: Generate a random event
const generateRandomEvent = (
  currentDay: number,
  currentEvents: ActiveEvent[],
  unlockedRegions: RegionId[]
): ActiveEvent | null => {
  // Don't allow too many concurrent events
  if (currentEvents.length >= 3) return null;

  // Filter events that aren't already active
  const activeIds = new Set(currentEvents.map((e) => e.eventId));
  const availableEvents = marketEvents.filter((e) => !activeIds.has(e.id));

  if (availableEvents.length === 0) return null;

  // Weighted random selection
  const totalWeight = availableEvents.reduce((sum, e) => sum + e.weight, 0);
  let random = Math.random() * totalWeight;

  let selectedEvent = availableEvents[0];
  for (const event of availableEvents) {
    random -= event.weight;
    if (random <= 0) {
      selectedEvent = event;
      break;
    }
  }

  if (!selectedEvent) return null;

  // Determine affected location/region
  let affectedLocationId: string | undefined;
  let affectedRegionId: RegionId | undefined;

  if (selectedEvent.scope === 'location' && selectedEvent.affectedLocations) {
    // Pick random affected location (prefer unlocked regions)
    const validLocations = selectedEvent.affectedLocations.filter((locId) => {
      const loc = getLocation(locId);
      return loc && unlockedRegions.includes(loc.region);
    });
    if (validLocations.length > 0) {
      affectedLocationId = validLocations[Math.floor(Math.random() * validLocations.length)];
    } else {
      // Fall back to any location
      affectedLocationId =
        selectedEvent.affectedLocations[
          Math.floor(Math.random() * selectedEvent.affectedLocations.length)
        ];
    }
  } else if (selectedEvent.scope === 'region' && selectedEvent.affectedRegion) {
    affectedRegionId = selectedEvent.affectedRegion;
  }

  return {
    eventId: selectedEvent.id,
    startDay: currentDay,
    endDay: currentDay + selectedEvent.durationDays - 1,
    affectedLocationId,
    affectedRegionId,
  };
};

export const useGameStore = create<GameStore>()((set, get) => ({
  ...INITIAL_STATE,

  startGame: () => {
    // Generate initial weekly status
    const weeklyStatus = generateWeeklyStatus(0, null, null);
    set({ ...INITIAL_STATE, gameStarted: true, weeklyStatus });
  },

  resetGame: () => {
    set({ ...INITIAL_STATE });
  },

  saveGame: () => {
    const state = get();
    const saveData: GameState = {
      money: state.money,
      day: state.day,
      maxDays: state.maxDays,
      energy: state.energy,
      maxEnergy: state.maxEnergy,
      location: state.location,
      vehicle: state.vehicle,
      cargo: state.cargo,
      ownedParts: state.ownedParts,
      equippedParts: state.equippedParts,
      totalProfit: state.totalProfit,
      tradesCompleted: state.tradesCompleted,
      gameStarted: state.gameStarted,
      gameOver: state.gameOver,
      unlockedRegions: state.unlockedRegions,
      marketSaturation: state.marketSaturation,
      activeEvents: state.activeEvents,
      eventLog: state.eventLog,
      weeklyStatus: state.weeklyStatus,
    };
    writeFileSync(SAVE_FILE_PATH, JSON.stringify(saveData, null, 2));
  },

  loadGame: () => {
    try {
      if (!existsSync(SAVE_FILE_PATH)) {
        return false;
      }
      const data = readFileSync(SAVE_FILE_PATH, 'utf-8');
      const saveData = JSON.parse(data) as GameState;
      set(saveData);
      return true;
    } catch {
      return false;
    }
  },

  deleteSave: () => {
    try {
      if (existsSync(SAVE_FILE_PATH)) {
        unlinkSync(SAVE_FILE_PATH);
      }
    } catch {
      // Ignore errors when deleting
    }
  },

  getMarketContext: () => {
    const state = get();
    return {
      day: state.day,
      activeEvents: state.activeEvents,
      marketSaturation: state.marketSaturation,
      weeklyStatus: state.weeklyStatus,
      unlockedRegions: state.unlockedRegions,
    };
  },

  buy: (commodityId: string, quantity: number) => {
    const state = get();
    const context = state.getMarketContext();
    const price = getBuyPrice(commodityId, state.location, context);
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
      newCargo = [...state.cargo, { commodityId, quantity, purchasePrice: price }];
    }

    // Buying removes local supply (slight negative saturation)
    const newSaturation = addSaturation(
      state.marketSaturation,
      state.location,
      commodityId,
      -quantity * 0.3
    );

    set({
      money: state.money - totalCost,
      cargo: newCargo,
      energy: Math.max(0, state.energy - 5),
      marketSaturation: newSaturation,
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

    const context = state.getMarketContext();
    const price = getSellPrice(commodityId, state.location, context);
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

    // Selling floods local market (positive saturation)
    const newSaturation = addSaturation(
      state.marketSaturation,
      state.location,
      commodityId,
      quantity
    );

    set({
      money: state.money + totalRevenue,
      cargo: newCargo,
      energy: Math.max(0, state.energy - 5),
      totalProfit: state.totalProfit + profit,
      tradesCompleted: state.tradesCompleted + 1,
      marketSaturation: newSaturation,
    });

    return {
      success: true,
      message: `Sold for $${totalRevenue} (${profit >= 0 ? '+' : ''}$${profit})`,
    };
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

    // Check if vehicle can travel to this location (train restrictions)
    if (!canVehicleTravelTo(state.vehicle, destinationId)) {
      return { success: false, message: 'Your Freight Train can only travel to major hubs!' };
    }

    // Check if region is unlocked
    if (!state.unlockedRegions.includes(destination.region)) {
      const region = getRegion(destination.region);
      return {
        success: false,
        message: `Unlock ${region?.name ?? 'region'} first ($${region?.unlockCost ?? '???'})`,
      };
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
      get().deleteSave();
      return;
    }

    // 1. Decay market saturation
    const decayedSaturation = decaySaturation(state.marketSaturation);

    // 2. Check for expired events and log them
    const newEventLog: EventLogEntry[] = [];
    const stillActive: ActiveEvent[] = [];

    for (const active of state.activeEvents) {
      if (newDay > active.endDay) {
        const event = getEvent(active.eventId);
        if (event) {
          newEventLog.push({
            day: newDay,
            eventName: event.name,
            description: `${event.name} has ended`,
            isStarting: false,
          });
        }
      } else {
        stillActive.push(active);
      }
    }

    // 3. Check for new week (every 7 days)
    let newWeeklyStatus = state.weeklyStatus;
    const currentWeek = Math.floor(newDay / 7);
    if (currentWeek > state.weeklyStatus.week) {
      newWeeklyStatus = generateWeeklyStatus(
        currentWeek,
        state.weeklyStatus.hotCommodity,
        state.weeklyStatus.coldCommodity
      );
    }

    // 4. Random chance for new event (25% per day)
    let newEvent: ActiveEvent | null = null;
    if (Math.random() < 0.25) {
      newEvent = generateRandomEvent(newDay, stillActive, state.unlockedRegions);
      if (newEvent) {
        const event = getEvent(newEvent.eventId);
        if (event) {
          newEventLog.push({
            day: newDay,
            eventName: event.name,
            description: event.description,
            isStarting: true,
          });
        }
      }
    }

    set({
      day: newDay,
      energy: state.maxEnergy,
      marketSaturation: decayedSaturation,
      activeEvents: newEvent ? [...stillActive, newEvent] : stillActive,
      weeklyStatus: newWeeklyStatus,
      eventLog: [...newEventLog, ...state.eventLog].slice(0, 15),
    });
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

  buyPart: (partId: string) => {
    const state = get();
    const part = getPart(partId);

    if (!part) {
      return { success: false, message: 'Invalid part' };
    }

    if (state.ownedParts.includes(partId)) {
      return { success: false, message: 'Already own this part' };
    }

    if (part.cost > state.money) {
      return { success: false, message: 'Not enough money' };
    }

    // Check vehicle tier requirement
    const vehicleTier = getVehicleTier(state.vehicle);
    if (part.minTier && vehicleTier < part.minTier) {
      return { success: false, message: `Requires a Tier ${part.minTier}+ vehicle` };
    }

    set({
      money: state.money - part.cost,
      ownedParts: [...state.ownedParts, partId],
    });

    return { success: true, message: `Purchased ${part.name}!` };
  },

  equipPart: (partId: string) => {
    const state = get();
    const part = getPart(partId);

    if (!part) {
      return { success: false, message: 'Invalid part' };
    }

    if (!state.ownedParts.includes(partId)) {
      return { success: false, message: 'You do not own this part' };
    }

    if (state.equippedParts.includes(partId)) {
      return { success: false, message: 'Part already equipped' };
    }

    if (state.equippedParts.length >= MAX_EQUIPPED_PARTS) {
      return { success: false, message: `Can only equip ${MAX_EQUIPPED_PARTS} parts at a time` };
    }

    // Check vehicle tier requirement
    const vehicleTier = getVehicleTier(state.vehicle);
    if (!canEquipPart(partId, vehicleTier)) {
      return { success: false, message: `Your vehicle cannot use this part` };
    }

    set({
      equippedParts: [...state.equippedParts, partId],
    });

    return { success: true, message: `Equipped ${part.name}!` };
  },

  unequipPart: (partId: string) => {
    const state = get();
    const part = getPart(partId);

    if (!part) {
      return { success: false, message: 'Invalid part' };
    }

    if (!state.equippedParts.includes(partId)) {
      return { success: false, message: 'Part is not equipped' };
    }

    set({
      equippedParts: state.equippedParts.filter((id) => id !== partId),
    });

    return { success: true, message: `Unequipped ${part.name}` };
  },

  unlockRegion: (regionId: RegionId) => {
    const state = get();

    if (state.unlockedRegions.includes(regionId)) {
      return { success: false, message: 'Region already unlocked' };
    }

    const region = getRegion(regionId);
    if (!region) {
      return { success: false, message: 'Invalid region' };
    }

    if (state.money < region.unlockCost) {
      return {
        success: false,
        message: `Need $${region.unlockCost} to unlock (have $${state.money})`,
      };
    }

    set({
      money: state.money - region.unlockCost,
      unlockedRegions: [...state.unlockedRegions, regionId],
    });

    return { success: true, message: `Unlocked ${region.name}!` };
  },

  canAccessLocation: (locationId: string) => {
    const state = get();
    const location = getLocation(locationId);
    if (!location) return false;
    return state.unlockedRegions.includes(location.region);
  },

  getCargoCapacity: () => {
    const state = get();
    const vehicle = getVehicle(state.vehicle);
    const baseCapacity = vehicle?.capacity ?? 20;
    const partsBonus = getCapacityBonus(state.equippedParts);
    return baseCapacity + partsBonus;
  },

  getCargoUsed: () => {
    return getTotalCargoUnits(get().cargo);
  },

  getTravelCost: (destinationId: string) => {
    const state = get();
    const destination = getLocation(destinationId);
    const vehicle = getVehicle(state.vehicle);
    if (!destination || !vehicle) return 999;
    const baseCost = destination.travelCost * vehicle.energyMultiplier;
    const efficiencyMultiplier = getEfficiencyMultiplier(state.equippedParts);
    return Math.round(baseCost * efficiencyMultiplier);
  },
}));
