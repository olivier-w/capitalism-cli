import React from 'react';
import { Box, Text } from 'ink';
import { useGameStore } from '../../store/gameStore.ts';
import { getLocation, getRegion } from '../../data/locations.ts';
import { getVehicle } from '../../data/vehicles.ts';
import { getCommodity } from '../../data/commodities.ts';
import { getEvent } from '../../data/events.ts';

export const Header: React.FC = () => {
  const {
    money,
    day,
    maxDays,
    energy,
    maxEnergy,
    location,
    vehicle,
    getCargoUsed,
    getCargoCapacity,
    weeklyStatus,
    activeEvents,
  } = useGameStore();

  const locationData = getLocation(location);
  const regionData = getRegion(locationData?.region ?? 'starter');
  const vehicleData = getVehicle(vehicle);
  const cargoUsed = getCargoUsed();
  const cargoCapacity = getCargoCapacity();

  const energyColor = energy > 50 ? 'green' : energy > 20 ? 'yellow' : 'red';

  // Get hot/cold commodity names
  const hotCommodity = weeklyStatus.hotCommodity
    ? getCommodity(weeklyStatus.hotCommodity)
    : null;
  const coldCommodity = weeklyStatus.coldCommodity
    ? getCommodity(weeklyStatus.coldCommodity)
    : null;

  return (
    <Box flexDirection="column" borderStyle="round" paddingX={1} marginBottom={1}>
      {/* Row 1: Money, Day, Energy */}
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
          Energy:{' '}
          <Text color={energyColor}>
            {energy}/{maxEnergy}
          </Text>
        </Text>
      </Box>

      {/* Row 2: Location, Cargo, Vehicle */}
      <Box justifyContent="space-between" width="100%">
        <Text>
          <Text color="cyanBright">{locationData?.name ?? 'Unknown'}</Text>
          <Text color="dim"> ({regionData?.name ?? 'Unknown'})</Text>
        </Text>
        <Text>
          Cargo: {cargoUsed}/{cargoCapacity}
        </Text>
        <Text color="dim">{vehicleData?.name ?? 'Bicycle'}</Text>
      </Box>

      {/* Row 3: Hot/Cold commodities */}
      {(hotCommodity || coldCommodity) && (
        <Box justifyContent="flex-start" width="100%" gap={2}>
          {hotCommodity && (
            <Text>
              <Text color="yellowBright" bold>
                HOT:
              </Text>{' '}
              <Text color="yellowBright">{hotCommodity.name}</Text>
            </Text>
          )}
          {coldCommodity && (
            <Text>
              <Text color="white" bold>
                COLD:
              </Text>{' '}
              <Text color="gray">{coldCommodity.name}</Text>
            </Text>
          )}
        </Box>
      )}

      {/* Row 4: Active events */}
      {activeEvents.length > 0 && (
        <Box flexDirection="column" width="100%">
          {activeEvents.slice(0, 2).map((active) => {
            const event = getEvent(active.eventId);
            if (!event) return null;
            const daysLeft = active.endDay - day + 1;
            return (
              <Text key={active.eventId} color="magentaBright">
                ! {event.name} ({daysLeft}d left)
              </Text>
            );
          })}
          {activeEvents.length > 2 && (
            <Text color="gray">+{activeEvents.length - 2} more events</Text>
          )}
        </Box>
      )}
    </Box>
  );
};
