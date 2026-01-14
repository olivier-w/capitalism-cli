export const formatMoney = (amount: number): string => {
  return `$${amount.toLocaleString()}`;
};

export const formatPercent = (value: number): string => {
  return `${Math.round(value * 100)}%`;
};

export const formatEnergy = (current: number, max: number): string => {
  return `${current}/${max}`;
};
