// Market Saturation System
// Selling floods the market -> prices drop locally
// Effect decays 15% per day
// Max impact: ±50% price swing

const SATURATION_PRICE_FACTOR = 0.01; // 1% per unit of saturation
const SATURATION_DECAY_RATE = 0.15; // 15% decay per day
const MAX_SATURATION_EFFECT = 0.5; // Cap at ±50%

export const getSaturationKey = (locationId: string, commodityId: string): string => {
  return `${locationId}:${commodityId}`;
};

export const getSaturationMultiplier = (
  saturation: Record<string, number>,
  locationId: string,
  commodityId: string
): number => {
  const key = getSaturationKey(locationId, commodityId);
  const amount = saturation[key] ?? 0;

  // Positive saturation = oversupply = lower prices (multiplier < 1)
  // Negative saturation = high demand = higher prices (multiplier > 1)
  const effect = -amount * SATURATION_PRICE_FACTOR;
  const clampedEffect = Math.max(-MAX_SATURATION_EFFECT, Math.min(MAX_SATURATION_EFFECT, effect));

  return 1 + clampedEffect;
};

export const addSaturation = (
  saturation: Record<string, number>,
  locationId: string,
  commodityId: string,
  amount: number
): Record<string, number> => {
  const key = getSaturationKey(locationId, commodityId);
  const current = saturation[key] ?? 0;

  return {
    ...saturation,
    [key]: current + amount,
  };
};

export const decaySaturation = (saturation: Record<string, number>): Record<string, number> => {
  const result: Record<string, number> = {};

  for (const [key, amount] of Object.entries(saturation)) {
    const decayed = amount * (1 - SATURATION_DECAY_RATE);
    // Only keep if still significant (> 0.5 units)
    if (Math.abs(decayed) > 0.5) {
      result[key] = decayed;
    }
  }

  return result;
};

export const getSaturationLevel = (
  saturation: Record<string, number>,
  locationId: string,
  commodityId: string
): 'flooded' | 'oversupplied' | 'normal' | 'scarce' | 'shortage' => {
  const key = getSaturationKey(locationId, commodityId);
  const amount = saturation[key] ?? 0;

  if (amount > 30) return 'flooded';
  if (amount > 10) return 'oversupplied';
  if (amount < -30) return 'shortage';
  if (amount < -10) return 'scarce';
  return 'normal';
};
