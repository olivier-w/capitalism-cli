import React from 'react';
import { Box, Text } from 'ink';
import SelectInput from 'ink-select-input';
import { useGameStore } from '../../store/gameStore.ts';
import { vehicles, getVehicle } from '../../data/vehicles.ts';
import { Header } from '../components/Header.tsx';

interface UpgradeScreenProps {
  onBack: () => void;
  onMessage: (text: string, type: 'info' | 'success' | 'error') => void;
}

export const UpgradeScreen: React.FC<UpgradeScreenProps> = ({ onBack, onMessage }) => {
  const { money, vehicle, buyVehicle } = useGameStore();

  const currentVehicle = getVehicle(vehicle);

  // Show vehicles better than current one
  const availableVehicles = vehicles.filter(
    (v) => v.id !== vehicle && v.capacity > (currentVehicle?.capacity ?? 0)
  );

  const items = availableVehicles.map((v) => {
    const canAfford = money >= v.cost;
    return {
      label: `${v.name} - $${v.cost.toLocaleString()} (Capacity: ${v.capacity})${!canAfford ? ' [Cannot afford]' : ''}`,
      value: v.id,
    };
  });
  items.push({ label: 'Back', value: 'back' });

  const handleSelect = (item: { value: string }) => {
    if (item.value === 'back') {
      onBack();
      return;
    }

    const result = buyVehicle(item.value);
    if (result.success) {
      onMessage(result.message, 'success');
      onBack();
    } else {
      onMessage(result.message, 'error');
    }
  };

  return (
    <Box flexDirection="column">
      <Header />

      <Box flexDirection="column" marginBottom={1}>
        <Text bold>Current Vehicle: {currentVehicle?.name}</Text>
        <Text color="dim">{currentVehicle?.description}</Text>
        <Text>
          Capacity: {currentVehicle?.capacity} | Energy Efficiency:{' '}
          {currentVehicle?.energyMultiplier === 1
            ? 'Normal'
            : currentVehicle?.energyMultiplier && currentVehicle.energyMultiplier < 1
              ? 'Good'
              : 'Poor'}
        </Text>
      </Box>

      <Box marginBottom={1}>
        <Text bold>Available Upgrades:</Text>
      </Box>

      {availableVehicles.length === 0 ? (
        <Text color="dim">No upgrades available (you have the best vehicle!)</Text>
      ) : (
        availableVehicles.map((v) => (
          <Box key={v.id} marginLeft={2} marginBottom={1} flexDirection="column">
            <Text color={money >= v.cost ? 'white' : 'dim'}>
              {v.name} - ${v.cost.toLocaleString()}
            </Text>
            <Text color="dim">{v.description}</Text>
            <Text color="dim">
              Capacity: {v.capacity} | Efficiency:{' '}
              {v.energyMultiplier < 1 ? 'Better' : v.energyMultiplier === 1 ? 'Normal' : 'Worse'}
            </Text>
          </Box>
        ))
      )}

      <Box marginTop={1}>
        <Text>Your funds: ${money.toLocaleString()}</Text>
      </Box>

      <SelectInput items={items} onSelect={handleSelect} />
    </Box>
  );
};
