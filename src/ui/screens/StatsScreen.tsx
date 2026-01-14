import React from 'react';
import { Box, Text } from 'ink';
import SelectInput from 'ink-select-input';
import { useGameStore } from '../../store/gameStore.ts';
import { getVehicle, vehicles } from '../../data/vehicles.ts';
import { commodities } from '../../data/commodities.ts';
import { Header } from '../components/Header.tsx';
import { getSellPrice } from '../../systems/MarketSystem.ts';

interface StatsScreenProps {
  onBack: () => void;
}

export const StatsScreen: React.FC<StatsScreenProps> = ({ onBack }) => {
  const { money, day, maxDays, vehicle, cargo, totalProfit, tradesCompleted, location } =
    useGameStore();

  const vehicleData = getVehicle(vehicle);

  // Calculate cargo value at current location
  const cargoValue = cargo.reduce((sum, item) => {
    const sellPrice = getSellPrice(item.commodityId, location, day);
    return sum + sellPrice * item.quantity;
  }, 0);

  // Calculate vehicle value (resale at 50%)
  const vehicleValue = Math.round((vehicleData?.cost ?? 0) * 0.5);

  // Total net worth
  const netWorth = money + cargoValue + vehicleValue;

  const items = [{ label: 'Back', value: 'back' }];

  return (
    <Box flexDirection="column">
      <Header />

      <Box flexDirection="column" borderStyle="round" paddingX={1} marginBottom={1}>
        <Text bold color="yellow">
          Statistics
        </Text>

        <Box marginTop={1}>
          <Box width={20}>
            <Text>Days Remaining:</Text>
          </Box>
          <Text color="cyan">{maxDays - day + 1}</Text>
        </Box>

        <Box>
          <Box width={20}>
            <Text>Cash on Hand:</Text>
          </Box>
          <Text color="green">${money.toLocaleString()}</Text>
        </Box>

        <Box>
          <Box width={20}>
            <Text>Cargo Value:</Text>
          </Box>
          <Text color="yellow">${cargoValue.toLocaleString()}</Text>
        </Box>

        <Box>
          <Box width={20}>
            <Text>Vehicle Value:</Text>
          </Box>
          <Text color="dim">${vehicleValue.toLocaleString()}</Text>
        </Box>

        <Box borderStyle="single" borderTop borderBottom={false} borderLeft={false} borderRight={false}>
          <Box width={20}>
            <Text bold>Net Worth:</Text>
          </Box>
          <Text bold color="green">
            ${netWorth.toLocaleString()}
          </Text>
        </Box>

        <Box marginTop={1}>
          <Box width={20}>
            <Text>Total Profit:</Text>
          </Box>
          <Text color={totalProfit >= 0 ? 'green' : 'red'}>
            {totalProfit >= 0 ? '+' : ''}${totalProfit.toLocaleString()}
          </Text>
        </Box>

        <Box>
          <Box width={20}>
            <Text>Trades Completed:</Text>
          </Box>
          <Text>{tradesCompleted}</Text>
        </Box>

        <Box>
          <Box width={20}>
            <Text>Current Vehicle:</Text>
          </Box>
          <Text>{vehicleData?.name}</Text>
        </Box>
      </Box>

      {cargo.length > 0 && (
        <Box flexDirection="column" borderStyle="round" paddingX={1} marginBottom={1}>
          <Text bold>Cargo Manifest:</Text>
          {cargo.map((item) => {
            const commodity = commodities.find((c) => c.id === item.commodityId);
            const currentSellPrice = getSellPrice(item.commodityId, location, day);
            const potentialProfit = (currentSellPrice - item.purchasePrice) * item.quantity;
            return (
              <Box key={item.commodityId}>
                <Box width={15}>
                  <Text>{commodity?.name}:</Text>
                </Box>
                <Box width={8}>
                  <Text>{item.quantity}</Text>
                </Box>
                <Text color={potentialProfit >= 0 ? 'green' : 'red'}>
                  ({potentialProfit >= 0 ? '+' : ''}${potentialProfit} if sold here)
                </Text>
              </Box>
            );
          })}
        </Box>
      )}

      <SelectInput items={items} onSelect={() => onBack()} />
    </Box>
  );
};
