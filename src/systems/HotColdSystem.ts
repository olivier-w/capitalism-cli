// Hot/Cold Commodity System
// Each week (every 7 days):
// - 1 commodity becomes "hot" (+35% demand everywhere)
// - 1 commodity becomes "cold" (-30% demand everywhere)
// - Rotates to different commodities each week

import type { WeeklyStatus } from '../game/GameState.ts';

const HOT_MULTIPLIER = 1.35; // +35%
const COLD_MULTIPLIER = 0.7; // -30%

// Only universal commodities can be hot/cold (not regional ones)
const ELIGIBLE_COMMODITIES = ['coffee', 'electronics', 'textiles', 'fuel', 'produce'];

export const generateWeeklyStatus = (
  week: number,
  previousHot: string | null,
  previousCold: string | null
): WeeklyStatus => {
  // Filter out previous week's hot/cold to ensure variety
  const available = ELIGIBLE_COMMODITIES.filter(
    (id) => id !== previousHot && id !== previousCold
  );

  // Shuffle and pick
  const shuffled = [...available].sort(() => Math.random() - 0.5);

  return {
    hotCommodity: shuffled[0] ?? null,
    coldCommodity: shuffled[1] ?? null,
    week,
  };
};

export const getHotColdMultiplier = (
  commodityId: string,
  weeklyStatus: WeeklyStatus
): number => {
  if (commodityId === weeklyStatus.hotCommodity) {
    return HOT_MULTIPLIER;
  }
  if (commodityId === weeklyStatus.coldCommodity) {
    return COLD_MULTIPLIER;
  }
  return 1.0;
};

export const isHotCommodity = (commodityId: string, weeklyStatus: WeeklyStatus): boolean => {
  return commodityId === weeklyStatus.hotCommodity;
};

export const isColdCommodity = (commodityId: string, weeklyStatus: WeeklyStatus): boolean => {
  return commodityId === weeklyStatus.coldCommodity;
};
