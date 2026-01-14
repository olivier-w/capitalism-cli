import React from 'react';
import { Box, Text } from 'ink';
import SelectInput from 'ink-select-input';
import { useGameStore } from '../../store/gameStore.ts';
import { getVehicle } from '../../data/vehicles.ts';
import { getSellPrice } from '../../systems/MarketSystem.ts';

interface GameOverScreenProps {
  onNewGame: () => void;
  onQuit: () => void;
}

export const GameOverScreen: React.FC<GameOverScreenProps> = ({ onNewGame, onQuit }) => {
  const { money, cargo, vehicle, totalProfit, tradesCompleted, location, day } = useGameStore();

  const vehicleData = getVehicle(vehicle);
  const vehicleValue = Math.round((vehicleData?.cost ?? 0) * 0.5);

  const cargoValue = cargo.reduce((sum, item) => {
    const sellPrice = getSellPrice(item.commodityId, location, day);
    return sum + sellPrice * item.quantity;
  }, 0);

  const finalScore = money + cargoValue + vehicleValue;

  // Determine rank
  let rank = 'Struggling Peddler';
  let rankColor = 'red';
  if (finalScore >= 50000) {
    rank = 'Trade Baron';
    rankColor = 'yellow';
  } else if (finalScore >= 20000) {
    rank = 'Wealthy Merchant';
    rankColor = 'green';
  } else if (finalScore >= 10000) {
    rank = 'Successful Trader';
    rankColor = 'cyan';
  } else if (finalScore >= 5000) {
    rank = 'Aspiring Entrepreneur';
    rankColor = 'blue';
  } else if (finalScore >= 1000) {
    rank = 'Small Business Owner';
    rankColor = 'white';
  }

  const items = [
    { label: 'Play Again', value: 'new' },
    { label: 'Quit', value: 'quit' },
  ];

  const handleSelect = (item: { value: string }) => {
    if (item.value === 'new') {
      onNewGame();
    } else {
      onQuit();
    }
  };

  return (
    <Box flexDirection="column" alignItems="center" padding={2}>
      <Box marginBottom={2} flexDirection="column" alignItems="center">
        <Text color="yellow" bold>
          ════════════════════════════════════════
        </Text>
        <Text color="yellow" bold>
                    GAME OVER
        </Text>
        <Text color="yellow" bold>
          ════════════════════════════════════════
        </Text>
      </Box>

      <Box flexDirection="column" alignItems="center" marginBottom={2}>
        <Text>After 30 days of trading...</Text>
        <Text>
          You achieved the rank of: <Text color={rankColor} bold>{rank}</Text>
        </Text>
      </Box>

      <Box
        flexDirection="column"
        borderStyle="round"
        paddingX={2}
        paddingY={1}
        marginBottom={2}
      >
        <Box>
          <Box width={20}>
            <Text>Cash:</Text>
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
            <Text bold>Final Score:</Text>
          </Box>
          <Text bold color="green">
            ${finalScore.toLocaleString()}
          </Text>
        </Box>

        <Box marginTop={1}>
          <Box width={20}>
            <Text color="dim">Total Profit:</Text>
          </Box>
          <Text color={totalProfit >= 0 ? 'green' : 'red'}>
            {totalProfit >= 0 ? '+' : ''}${totalProfit.toLocaleString()}
          </Text>
        </Box>
        <Box>
          <Box width={20}>
            <Text color="dim">Trades Made:</Text>
          </Box>
          <Text>{tradesCompleted}</Text>
        </Box>
        <Box>
          <Box width={20}>
            <Text color="dim">Final Vehicle:</Text>
          </Box>
          <Text>{vehicleData?.name}</Text>
        </Box>
      </Box>

      <SelectInput items={items} onSelect={handleSelect} />
    </Box>
  );
};
