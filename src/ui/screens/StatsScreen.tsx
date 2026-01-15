import React from 'react';
import { Box, Text, useInput } from 'ink';
import { useGameStore } from '../../store/gameStore.ts';
import { getVehicle, vehicles } from '../../data/vehicles.ts';
import { commodities } from '../../data/commodities.ts';
import { Header } from '../components/Header.tsx';
import { getSellPrice } from '../../systems/MarketSystem.ts';
import { InlineBar, ProgressBar } from '../components/ProgressBar.tsx';

interface StatsScreenProps {
  onBack: () => void;
}

// Determine rank based on net worth
const getRank = (netWorth: number): { name: string; color: string; next: string; nextAmount: number } => {
  if (netWorth >= 50000) {
    return { name: 'Trade Baron', color: 'yellowBright', next: 'MAX', nextAmount: 0 };
  } else if (netWorth >= 25000) {
    return { name: 'Merchant Prince', color: 'magentaBright', next: 'Trade Baron', nextAmount: 50000 };
  } else if (netWorth >= 10000) {
    return { name: 'Established Trader', color: 'cyanBright', next: 'Merchant Prince', nextAmount: 25000 };
  } else if (netWorth >= 3000) {
    return { name: 'Traveling Merchant', color: 'greenBright', next: 'Established Trader', nextAmount: 10000 };
  } else {
    return { name: 'Struggling Peddler', color: 'gray', next: 'Traveling Merchant', nextAmount: 3000 };
  }
};

export const StatsScreen: React.FC<StatsScreenProps> = ({ onBack }) => {
  const {
    money,
    day,
    maxDays,
    vehicle,
    cargo,
    totalProfit,
    tradesCompleted,
    location,
    getMarketContext,
  } = useGameStore();

  useInput((input, key) => {
    if (key.escape || input === 'q' || input === 'Q' || key.return) {
      onBack();
    }
  });

  const vehicleData = getVehicle(vehicle);
  const context = getMarketContext();

  // Calculate cargo value at current location
  const cargoValue = cargo.reduce((sum, item) => {
    const sellPrice = getSellPrice(item.commodityId, location, context);
    return sum + sellPrice * item.quantity;
  }, 0);

  // Calculate vehicle value (resale at 50%)
  const vehicleValue = Math.round((vehicleData?.cost ?? 0) * 0.5);

  // Total net worth
  const netWorth = money + cargoValue + vehicleValue;

  // Get rank info
  const rank = getRank(netWorth);

  // Calculate average profit per trade
  const avgProfit = tradesCompleted > 0 ? Math.round(totalProfit / tradesCompleted) : 0;

  // Days remaining
  const daysRemaining = maxDays - day + 1;

  return (
    <Box flexDirection="column">
      <Header />

      {/* Title */}
      <Box marginBottom={1}>
        <Text bold color="cyan">
          {'='.repeat(15)} [*] EMPIRE STATISTICS {'='.repeat(15)}
        </Text>
      </Box>

      {/* Main stats dashboard - two column layout */}
      <Box borderStyle="double" paddingX={1} marginBottom={1}>
        <Box flexDirection="column" width="50%">
          {/* Financial section */}
          <Text bold color="yellow">
            FINANCIAL
          </Text>
          <Text color="dim">{'─'.repeat(25)}</Text>

          <Box>
            <Box width={16}>
              <Text>Cash:</Text>
            </Box>
            <Text color="green" bold>
              ${money.toLocaleString()}
            </Text>
          </Box>

          <Box>
            <Box width={16}>
              <Text>Cargo Value:</Text>
            </Box>
            <Text color="yellow">${cargoValue.toLocaleString()}</Text>
          </Box>

          <Box>
            <Box width={16}>
              <Text>Vehicle Value:</Text>
            </Box>
            <Text color="dim">${vehicleValue.toLocaleString()}</Text>
          </Box>

          <Text color="dim">{'─'.repeat(25)}</Text>

          <Box>
            <Box width={16}>
              <Text bold>NET WORTH:</Text>
            </Box>
            <Text color="greenBright" bold>
              ${netWorth.toLocaleString()}
            </Text>
          </Box>
        </Box>

        <Box width={2}>
          <Text color="dim">│</Text>
        </Box>

        <Box flexDirection="column" width="48%">
          {/* Performance section */}
          <Text bold color="magenta">
            PERFORMANCE
          </Text>
          <Text color="dim">{'─'.repeat(22)}</Text>

          <Box>
            <Box width={14}>
              <Text>Trades:</Text>
            </Box>
            <Text>{tradesCompleted}</Text>
          </Box>

          <Box>
            <Box width={14}>
              <Text>Total Profit:</Text>
            </Box>
            <Text color={totalProfit >= 0 ? 'green' : 'red'}>
              {totalProfit >= 0 ? '+' : ''}${totalProfit.toLocaleString()}
            </Text>
          </Box>

          <Box>
            <Box width={14}>
              <Text>Avg/Trade:</Text>
            </Box>
            <Text color={avgProfit >= 0 ? 'green' : 'red'}>
              {avgProfit >= 0 ? '+' : ''}${avgProfit}
            </Text>
          </Box>

          <Text color="dim">{'─'.repeat(22)}</Text>

          <Box>
            <Box width={14}>
              <Text bold>Rank:</Text>
            </Box>
            <Text color={rank.color} bold>
              {rank.name}
            </Text>
          </Box>

          {rank.nextAmount > 0 && (
            <Box>
              <Box width={14}>
                <Text color="dim">Next:</Text>
              </Box>
              <Text color="dim">
                {rank.next} @ ${rank.nextAmount.toLocaleString()}
              </Text>
            </Box>
          )}
        </Box>
      </Box>

      {/* Time remaining */}
      <Box flexDirection="column" borderStyle="single" paddingX={1} marginBottom={1}>
        <Box justifyContent="space-between">
          <Text bold>TIME REMAINING</Text>
          <Text>
            <Text color="cyan" bold>
              {daysRemaining}
            </Text>{' '}
            days left
          </Text>
        </Box>
        <ProgressBar
          value={day}
          max={maxDays}
          width={40}
          thresholds={{ low: 0.8, high: 0.6 }}
          filledChar="█"
          emptyChar="░"
        />
        <Text color="dim">
          Day {day} of {maxDays}
        </Text>
      </Box>

      {/* Vehicle info */}
      <Box flexDirection="column" borderStyle="single" paddingX={1} marginBottom={1}>
        <Text bold>VEHICLE: {vehicleData?.name ?? 'Unknown'}</Text>
        <Text color="dim">{vehicleData?.description}</Text>
        <Box gap={2}>
          <Text>
            Capacity: <Text color="cyan">{vehicleData?.capacity}</Text>
          </Text>
          <Text>
            Efficiency: <Text color="cyan">{vehicleData?.energyMultiplier}x</Text>
          </Text>
        </Box>
      </Box>

      {/* Cargo manifest */}
      {cargo.length > 0 && (
        <Box flexDirection="column" borderStyle="single" paddingX={1} marginBottom={1}>
          <Text bold>CARGO MANIFEST</Text>
          {cargo.map((item) => {
            const commodity = commodities.find((c) => c.id === item.commodityId);
            const currentSellPrice = getSellPrice(item.commodityId, location, context);
            const potentialProfit = (currentSellPrice - item.purchasePrice) * item.quantity;
            const profitColor = potentialProfit >= 0 ? 'green' : 'red';

            return (
              <Box key={item.commodityId} justifyContent="space-between">
                <Box width={20}>
                  <Text>
                    {commodity?.name}: <Text color="cyan">{item.quantity}</Text>
                  </Text>
                </Box>
                <Box width={12}>
                  <Text color="dim">@${item.purchasePrice}</Text>
                </Box>
                <Box>
                  <Text color={profitColor}>
                    {potentialProfit >= 0 ? '+' : ''}${potentialProfit} here
                  </Text>
                </Box>
              </Box>
            );
          })}
        </Box>
      )}

      {/* Controls */}
      <Box borderStyle="single" paddingX={1}>
        <Text color="dim">[Enter/Esc/Q] Back</Text>
      </Box>
    </Box>
  );
};
