import React from 'react';
import { Box, Text } from 'ink';
import SelectInput from 'ink-select-input';
import { useGameStore } from '../../store/gameStore.ts';
import { getConnectedLocations, getLocation } from '../../data/locations.ts';
import { Header } from '../components/Header.tsx';

interface TravelScreenProps {
  onBack: () => void;
  onMessage: (text: string, type: 'info' | 'success' | 'error') => void;
}

export const TravelScreen: React.FC<TravelScreenProps> = ({ onBack, onMessage }) => {
  const { location, energy, travel, getTravelCost } = useGameStore();

  const currentLocation = getLocation(location);
  const destinations = getConnectedLocations(location);

  const items = destinations.map((dest) => {
    const cost = getTravelCost(dest.id);
    const canAfford = energy >= cost;
    return {
      label: `${dest.name} (${cost} energy)${!canAfford ? ' [Not enough energy]' : ''}`,
      value: dest.id,
      disabled: !canAfford,
    };
  });
  items.push({ label: 'Back', value: 'back', disabled: false });

  const handleSelect = (item: { value: string }) => {
    if (item.value === 'back') {
      onBack();
      return;
    }

    const result = travel(item.value);
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

      <Box marginBottom={1} flexDirection="column">
        <Text>
          Current location: <Text color="blue">{currentLocation?.name}</Text>
        </Text>
        <Text color="dim">{currentLocation?.description}</Text>
      </Box>

      <Box marginBottom={1}>
        <Text>Available destinations:</Text>
      </Box>

      {destinations.map((dest) => (
        <Box key={dest.id} marginLeft={2}>
          <Text color="dim">
            {dest.name}: {dest.description}
          </Text>
        </Box>
      ))}

      <Box marginTop={1}>
        <Text>Where would you like to go?</Text>
      </Box>

      <SelectInput items={items} onSelect={handleSelect} />
    </Box>
  );
};
