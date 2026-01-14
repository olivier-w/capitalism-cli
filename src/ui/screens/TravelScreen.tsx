import React from 'react';
import { Box, Text } from 'ink';
import { Select } from '../components/Select.tsx';
import { useGameStore } from '../../store/gameStore.ts';
import { getConnectedLocations, getLocation, getRegion } from '../../data/locations.ts';
import { Header } from '../components/Header.tsx';

interface TravelScreenProps {
  onBack: () => void;
  onMessage: (text: string, type: 'info' | 'success' | 'error') => void;
}

export const TravelScreen: React.FC<TravelScreenProps> = ({ onBack, onMessage }) => {
  const { location, energy, travel, getTravelCost, unlockedRegions, canAccessLocation } =
    useGameStore();

  const currentLocation = getLocation(location);
  const destinations = getConnectedLocations(location);

  // Separate accessible and locked destinations
  const accessible = destinations.filter((dest) => canAccessLocation(dest.id));
  const locked = destinations.filter((dest) => !canAccessLocation(dest.id));

  const items = accessible.map((dest) => {
    const cost = getTravelCost(dest.id);
    const canAfford = energy >= cost;
    const regionLabel =
      dest.region !== currentLocation?.region
        ? ` [${getRegion(dest.region)?.name ?? dest.region}]`
        : '';
    return {
      label: `${dest.name}${regionLabel} (${cost} energy)${!canAfford ? ' [Not enough energy]' : ''}`,
      value: dest.id,
      disabled: !canAfford,
    };
  });

  // Show locked destinations greyed out
  for (const dest of locked) {
    const region = getRegion(dest.region);
    items.push({
      label: `${dest.name} [LOCKED - ${region?.name} $${region?.unlockCost}]`,
      value: `locked_${dest.id}`,
      disabled: true,
    });
  }

  items.push({ label: 'Back', value: 'back', disabled: false });

  const handleSelect = (item: { value: string }) => {
    if (item.value === 'back' || item.value.startsWith('locked_')) {
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
          <Text color="dim"> ({getRegion(currentLocation?.region ?? 'starter')?.name})</Text>
        </Text>
        <Text color="dim">{currentLocation?.description}</Text>
      </Box>

      <Box marginBottom={1}>
        <Text>Available destinations:</Text>
      </Box>

      {accessible.map((dest) => (
        <Box key={dest.id} marginLeft={2}>
          <Text color="dim">
            {dest.name}: {dest.description}
          </Text>
        </Box>
      ))}

      {locked.length > 0 && (
        <>
          <Box marginTop={1} marginBottom={1}>
            <Text color="yellow">Locked destinations (unlock region to access):</Text>
          </Box>
          {locked.map((dest) => (
            <Box key={dest.id} marginLeft={2}>
              <Text color="dim">
                {dest.name} ({getRegion(dest.region)?.name}): {dest.description}
              </Text>
            </Box>
          ))}
        </>
      )}

      <Box marginTop={1}>
        <Text>Where would you like to go?</Text>
      </Box>

      <Select items={items} onSelect={handleSelect} />
    </Box>
  );
};
