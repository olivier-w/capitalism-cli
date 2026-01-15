import React from 'react';
import { Box, Text } from 'ink';
import { type CargoItem } from '../../game/GameState.ts';
import { getCommodity } from '../../data/commodities.ts';
import { InlineBar } from './ProgressBar.tsx';

interface CargoHoldProps {
  cargo: CargoItem[];
  cargoUsed: number;
  cargoCapacity: number;
  currentPrices?: Map<string, { buyPrice: number; sellPrice: number }>;
}

// Get ASCII letter icon for commodity
const getCommodityIcon = (commodityId: string): string => {
  const icons: Record<string, string> = {
    coffee: 'C',
    textiles: 'T',
    fuel: 'F',
    electronics: 'E',
    produce: 'P',
    grain: 'G',
    spices: 'S',
    silk: 'K',
    seafood: 'W',
    leather: 'L',
  };
  return icons[commodityId] ?? commodityId.charAt(0).toUpperCase();
};

export const CargoHold: React.FC<CargoHoldProps> = ({
  cargo,
  cargoUsed,
  cargoCapacity,
  currentPrices,
}) => {
  const usagePercent = cargoCapacity > 0 ? Math.round((cargoUsed / cargoCapacity) * 100) : 0;

  // Calculate total potential profit
  let totalProfit = 0;
  const cargoWithProfit = cargo.map((item) => {
    const commodity = getCommodity(item.commodityId);
    const priceData = currentPrices?.get(item.commodityId);
    const sellPrice = priceData?.sellPrice ?? 0;
    const profit = (sellPrice - item.purchasePrice) * item.quantity;
    totalProfit += profit;
    return {
      ...item,
      name: commodity?.name ?? item.commodityId,
      unit: commodity?.unit ?? 'units',
      sellPrice,
      profit,
      icon: getCommodityIcon(item.commodityId),
    };
  });

  if (cargo.length === 0) {
    return (
      <Box flexDirection="column" borderStyle="double" paddingX={1}>
        <Box justifyContent="space-between">
          <Text bold color="cyan">
            CARGO HOLD
          </Text>
          <Text>
            <InlineBar
              value={cargoUsed}
              max={cargoCapacity}
              width={10}
              thresholds={{ low: 0, high: 0.7 }}
            />
            <Text color="dim">
              {' '}
              {cargoUsed}/{cargoCapacity} ({usagePercent}%)
            </Text>
          </Text>
        </Box>
        <Box marginY={1} justifyContent="center">
          <Text color="dim">[ Empty - Buy some goods! ]</Text>
        </Box>
      </Box>
    );
  }

  // Calculate bar width based on quantity relative to largest item
  const maxQuantity = Math.max(...cargo.map((c) => c.quantity));

  return (
    <Box flexDirection="column" borderStyle="double" paddingX={1}>
      {/* Header */}
      <Box justifyContent="space-between" marginBottom={1}>
        <Text bold color="cyan">
          CARGO HOLD
        </Text>
        <Text>
          <InlineBar
            value={cargoUsed}
            max={cargoCapacity}
            width={10}
            thresholds={{ low: 0, high: 0.7 }}
          />
          <Text color="dim">
            {' '}
            {cargoUsed}/{cargoCapacity} ({usagePercent}%)
          </Text>
        </Text>
      </Box>

      {/* Cargo items */}
      {cargoWithProfit.map((item) => {
        const barWidth = Math.max(1, Math.round((item.quantity / maxQuantity) * 10));
        const profitColor = item.profit >= 0 ? 'green' : 'red';
        const profitSign = item.profit >= 0 ? '+' : '';

        return (
          <Box key={item.commodityId} justifyContent="space-between">
            <Box width={30}>
              <Text color="cyan">[{item.icon}]</Text>
              <Text> {item.name} </Text>
              <Text color="yellow">{'█'.repeat(barWidth)}</Text>
              <Text color="gray">{'░'.repeat(10 - barWidth)}</Text>
              <Text>
                {' '}
                {item.quantity} {item.unit}
              </Text>
            </Box>
            <Box>
              <Text color="dim">@${item.purchasePrice} </Text>
              {currentPrices && (
                <Text color={profitColor}>
                  {profitSign}${item.profit}
                </Text>
              )}
            </Box>
          </Box>
        );
      })}

      {/* Total */}
      {currentPrices && (
        <Box marginTop={1} justifyContent="flex-end" borderStyle="single" borderTop borderBottom={false} borderLeft={false} borderRight={false}>
          <Text>
            Potential profit:{' '}
            <Text color={totalProfit >= 0 ? 'greenBright' : 'red'} bold>
              {totalProfit >= 0 ? '+' : ''}${totalProfit}
            </Text>
          </Text>
        </Box>
      )}
    </Box>
  );
};

// Compact inline cargo summary for headers
interface CargoSummaryProps {
  cargo: CargoItem[];
  cargoUsed: number;
  cargoCapacity: number;
}

export const CargoSummary: React.FC<CargoSummaryProps> = ({
  cargo,
  cargoUsed,
  cargoCapacity,
}) => {
  const items = cargo.slice(0, 3).map((item) => {
    const icon = getCommodityIcon(item.commodityId);
    return `[${icon}]${item.quantity}`;
  });

  const moreCount = cargo.length - 3;

  return (
    <Text>
      <InlineBar value={cargoUsed} max={cargoCapacity} width={6} thresholds={{ low: 0, high: 0.7 }} />
      <Text color="dim"> </Text>
      <Text color="cyan">{items.join(' ')}</Text>
      {moreCount > 0 && <Text color="dim"> +{moreCount}</Text>}
    </Text>
  );
};
