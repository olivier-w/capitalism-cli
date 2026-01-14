import React from 'react';
import { Box, Text } from 'ink';
import { useGameStore } from '../../store/gameStore.ts';
import { getLocation } from '../../data/locations.ts';
import { getVehicle } from '../../data/vehicles.ts';

export const Header: React.FC = () => {
  const { money, day, maxDays, energy, maxEnergy, location, vehicle, getCargoUsed, getCargoCapacity } =
    useGameStore();

  const locationData = getLocation(location);
  const vehicleData = getVehicle(vehicle);
  const cargoUsed = getCargoUsed();
  const cargoCapacity = getCargoCapacity();

  const energyColor = energy > 50 ? 'green' : energy > 20 ? 'yellow' : 'red';

  return (
    <Box
      flexDirection="column"
      borderStyle="round"
      paddingX={1}
      marginBottom={1}
    >
      <Box justifyContent="space-between" width="100%">
        <Text>
          <Text color="yellow" bold>
            ${money.toLocaleString()}
          </Text>
        </Text>
        <Text>
          Day <Text color="cyan">{day}</Text>/{maxDays}
        </Text>
        <Text>
          Energy: <Text color={energyColor}>{energy}/{maxEnergy}</Text>
        </Text>
      </Box>
      <Box justifyContent="space-between" width="100%">
        <Text>
          <Text color="blue">{locationData?.name ?? 'Unknown'}</Text>
        </Text>
        <Text>
          Cargo: {cargoUsed}/{cargoCapacity}
        </Text>
        <Text color="dim">
          {vehicleData?.name ?? 'Bicycle'}
        </Text>
      </Box>
    </Box>
  );
};
