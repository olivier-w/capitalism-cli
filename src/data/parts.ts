export type PartEffectType = 'capacity' | 'efficiency' | 'special';
export type SpecialEffectType = 'refrigeration' | 'secure_lock' | 'gps' | 'bulk_bonus';

export interface VehiclePart {
  id: string;
  name: string;
  description: string;
  cost: number;
  category: 'cargo' | 'efficiency' | 'special';
  effect: {
    type: PartEffectType;
    value: number; // +capacity, efficiency multiplier, or special identifier
    specialEffect?: SpecialEffectType;
  };
  minTier?: number; // Minimum vehicle tier required
}

export const vehicleParts: VehiclePart[] = [
  // === CARGO MODULES ===
  {
    id: 'cargo_rack_small',
    name: 'Small Cargo Rack',
    description: 'Adds external storage. +10 capacity.',
    cost: 300,
    category: 'cargo',
    effect: { type: 'capacity', value: 10 },
  },
  {
    id: 'cargo_bay_medium',
    name: 'Medium Cargo Bay',
    description: 'Expanded internal storage. +25 capacity.',
    cost: 800,
    category: 'cargo',
    effect: { type: 'capacity', value: 25 },
  },
  {
    id: 'cargo_container',
    name: 'Large Cargo Container',
    description: 'Serious hauling upgrade. +50 capacity.',
    cost: 2000,
    category: 'cargo',
    effect: { type: 'capacity', value: 50 },
    minTier: 3,
  },
  {
    id: 'mega_hauler',
    name: 'Mega Hauler Module',
    description: 'Industrial-grade expansion. +100 capacity.',
    cost: 5000,
    category: 'cargo',
    effect: { type: 'capacity', value: 100 },
    minTier: 4,
  },

  // === EFFICIENCY UPGRADES ===
  {
    id: 'fuel_saver',
    name: 'Fuel Saver',
    description: 'Optimized fuel injection. -15% energy cost.',
    cost: 400,
    category: 'efficiency',
    effect: { type: 'efficiency', value: 0.85 },
  },
  {
    id: 'turbo_engine',
    name: 'Turbo Engine',
    description: 'More power, better mileage. -25% energy cost.',
    cost: 1200,
    category: 'efficiency',
    effect: { type: 'efficiency', value: 0.75 },
    minTier: 2,
  },
  {
    id: 'hybrid_drive',
    name: 'Hybrid Drive System',
    description: 'Cutting-edge efficiency. -40% energy cost.',
    cost: 3500,
    category: 'efficiency',
    effect: { type: 'efficiency', value: 0.60 },
    minTier: 3,
  },

  // === SPECIAL MODULES ===
  {
    id: 'refrigeration',
    name: 'Refrigeration Unit',
    description: 'Keeps perishables fresh. Produce & seafood sell for 10% more.',
    cost: 1500,
    category: 'special',
    effect: { type: 'special', value: 10, specialEffect: 'refrigeration' },
  },
  {
    id: 'secure_lock',
    name: 'Secure Cargo Lock',
    description: 'Heavy-duty security. Cargo protected from theft events.',
    cost: 800,
    category: 'special',
    effect: { type: 'special', value: 1, specialEffect: 'secure_lock' },
  },
  {
    id: 'gps_navigator',
    name: 'GPS Trade Navigator',
    description: 'Real-time market data. Shows price trends in travel screen.',
    cost: 600,
    category: 'special',
    effect: { type: 'special', value: 1, specialEffect: 'gps' },
  },
  {
    id: 'bulk_containers',
    name: 'Bulk Trade Containers',
    description: 'Optimized for volume. +20% sell price on trades of 20+ units.',
    cost: 2500,
    category: 'special',
    effect: { type: 'special', value: 20, specialEffect: 'bulk_bonus' },
    minTier: 3,
  },
];

// Perishable commodities affected by refrigeration
export const perishableCommodities = ['produce', 'seafood'];

export const getPart = (id: string): VehiclePart | undefined => {
  return vehicleParts.find((p) => p.id === id);
};

export const getPartsByCategory = (category: VehiclePart['category']): VehiclePart[] => {
  return vehicleParts.filter((p) => p.category === category);
};

export const canEquipPart = (partId: string, vehicleTier: number): boolean => {
  const part = getPart(partId);
  if (!part) return false;
  return (part.minTier ?? 1) <= vehicleTier;
};

// Calculate total capacity bonus from equipped parts
export const getCapacityBonus = (equippedParts: string[]): number => {
  return equippedParts.reduce((total, partId) => {
    const part = getPart(partId);
    if (part?.effect.type === 'capacity') {
      return total + part.effect.value;
    }
    return total;
  }, 0);
};

// Calculate efficiency multiplier from equipped parts (multiplicative)
export const getEfficiencyMultiplier = (equippedParts: string[]): number => {
  return equippedParts.reduce((multiplier, partId) => {
    const part = getPart(partId);
    if (part?.effect.type === 'efficiency') {
      return multiplier * part.effect.value;
    }
    return multiplier;
  }, 1);
};

// Check if a special effect is active
export const hasSpecialEffect = (equippedParts: string[], effect: SpecialEffectType): boolean => {
  return equippedParts.some((partId) => {
    const part = getPart(partId);
    return part?.effect.specialEffect === effect;
  });
};

// Get the value of a special effect (e.g., refrigeration bonus percentage)
export const getSpecialEffectValue = (equippedParts: string[], effect: SpecialEffectType): number => {
  for (const partId of equippedParts) {
    const part = getPart(partId);
    if (part?.effect.specialEffect === effect) {
      return part.effect.value;
    }
  }
  return 0;
};

export const MAX_EQUIPPED_PARTS = 3;
