export interface Vehicle {
  id: string;
  name: string;
  capacity: number;
  cost: number;
  energyMultiplier: number; // Lower = more efficient
  description: string;
  tier: number; // For part requirements
  specialty?: {
    type: 'speed' | 'liquid_bonus' | 'rail_only';
    value?: number; // e.g., 20 for 20% liquid bonus
    restrictedRoutes?: string[]; // For rail_only
  };
}

export const vehicles: Vehicle[] = [
  // === TIER 1: STARTER ===
  {
    id: 'bicycle',
    name: 'Bicycle',
    capacity: 20,
    cost: 0,
    energyMultiplier: 1.5,
    tier: 1,
    description: 'Slow but free. Every empire starts somewhere.',
  },

  // === TIER 2: EARLY UPGRADES ===
  {
    id: 'scooter',
    name: 'Scooter',
    capacity: 35,
    cost: 200,
    energyMultiplier: 1.2,
    tier: 2,
    description: 'Zippy and cheap. A step up from pedaling.',
  },
  {
    id: 'car',
    name: 'Car',
    capacity: 50,
    cost: 500,
    energyMultiplier: 1.0,
    tier: 2,
    description: 'Reliable transportation with decent cargo space.',
  },

  // === TIER 3: MID GAME ===
  {
    id: 'van',
    name: 'Cargo Van',
    capacity: 80,
    cost: 1500,
    energyMultiplier: 1.1,
    tier: 3,
    description: 'Popular with traders who need room to grow.',
  },
  {
    id: 'truck',
    name: 'Truck',
    capacity: 150,
    cost: 2000,
    energyMultiplier: 0.9,
    tier: 3,
    description: 'Serious hauling capacity for serious traders.',
  },
  {
    id: 'speedster',
    name: 'Speedster',
    capacity: 40,
    cost: 4000,
    energyMultiplier: 0.4,
    tier: 3,
    description: 'Lightning fast but limited cargo. Perfect for high-value runs.',
    specialty: {
      type: 'speed',
    },
  },

  // === TIER 4: LATE GAME ===
  {
    id: 'train',
    name: 'Freight Train',
    capacity: 300,
    cost: 8000,
    energyMultiplier: 1.3,
    tier: 4,
    description: 'Massive capacity but only runs between major hubs.',
    specialty: {
      type: 'rail_only',
      restrictedRoutes: ['metro', 'port', 'harbor', 'farmtown', 'industrial'],
    },
  },
  {
    id: 'plane',
    name: 'Cargo Plane',
    capacity: 120,
    cost: 10000,
    energyMultiplier: 0.5,
    tier: 4,
    description: 'Skip the roads entirely. Time is money.',
  },
  {
    id: 'tanker',
    name: 'Tanker Truck',
    capacity: 200,
    cost: 15000,
    energyMultiplier: 1.0,
    tier: 4,
    description: '+25% bonus capacity for liquids (fuel, coffee). Built for bulk.',
    specialty: {
      type: 'liquid_bonus',
      value: 25,
    },
  },

  // === TIER 5: END GAME ===
  {
    id: 'ship',
    name: 'Cargo Ship',
    capacity: 500,
    cost: 25000,
    energyMultiplier: 0.6,
    tier: 5,
    description: 'Massive capacity for the true trade baron.',
  },
];

// Liquid commodities that get tanker bonus
export const liquidCommodities = ['fuel', 'coffee'];

export const getVehicle = (id: string): Vehicle | undefined => {
  return vehicles.find((v) => v.id === id);
};

export const getAffordableVehicles = (money: number, currentVehicleId: string): Vehicle[] => {
  return vehicles.filter((v) => v.cost <= money && v.id !== currentVehicleId);
};

export const getVehicleTier = (id: string): number => {
  return getVehicle(id)?.tier ?? 1;
};

// Check if vehicle can travel to a location
export const canVehicleTravelTo = (vehicleId: string, locationId: string): boolean => {
  const vehicle = getVehicle(vehicleId);
  if (!vehicle?.specialty || vehicle.specialty.type !== 'rail_only') {
    return true; // No restrictions
  }
  return vehicle.specialty.restrictedRoutes?.includes(locationId) ?? false;
};
