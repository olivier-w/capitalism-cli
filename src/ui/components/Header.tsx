import React from 'react';
import { Box, Text } from 'ink';
import { useGameStore } from '../../store/gameStore.ts';
import { getLocation, getRegion } from '../../data/locations.ts';
import { getVehicle } from '../../data/vehicles.ts';
import { getCommodity } from '../../data/commodities.ts';
import { getEvent } from '../../data/events.ts';
import { InlineBar } from './ProgressBar.tsx';

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

  // Get hot/cold commodity names
  const hotCommodity = weeklyStatus.hotCommodity
    ? getCommodity(weeklyStatus.hotCommodity)
    : null;
  const coldCommodity = weeklyStatus.coldCommodity
    ? getCommodity(weeklyStatus.coldCommodity)
    : null;

  return (
    <Box flexDirection="column" borderStyle="round" paddingX={1} marginBottom={1}>
      {/* Row 1: Money, Day progress, Energy bar */}
      <Box justifyContent="space-between" width="100%">
        <Box>
          <Text color="yellow" bold>
            ${money.toLocaleString()}
          </Text>
        </Box>
        <Box>
          <Text color="dim">Day </Text>
          <InlineBar value={day} max={maxDays} width={12} thresholds={{ low: 0.8, high: 0.6 }} />
          <Text color="cyan"> {day}</Text>
          <Text color="dim">/{maxDays}</Text>
        </Box>
        <Box>
          <Text>Energy </Text>
          <InlineBar value={energy} max={maxEnergy} width={8} thresholds={{ low: 0.2, high: 0.5 }} />
          <Text> {energy}</Text>
        </Box>
      </Box>

      {/* Row 2: Location, Cargo bar, Vehicle */}
      <Box justifyContent="space-between" width="100%">
        <Box>
          <Text color="cyanBright">{locationData?.name ?? 'Unknown'}</Text>
          <Text color="dim"> ({regionData?.name ?? 'Unknown'})</Text>
        </Box>
        <Box>
          <Text>Cargo </Text>
          <InlineBar
            value={cargoUsed}
            max={cargoCapacity}
            width={8}
            thresholds={{ low: 0, high: 0.7 }}
          />
          <Text>
            {' '}
            {cargoUsed}/{cargoCapacity}
          </Text>
        </Box>
        <Text color="dim">[{vehicleData?.name ?? 'Bicycle'}]</Text>
      </Box>

      {/* Row 3: Hot/Cold commodities with visual indicators */}
      {(hotCommodity || coldCommodity) && (
        <Box justifyContent="flex-start" width="100%" gap={2}>
          {hotCommodity && (
            <Text>
              <Text color="yellowBright" bold>
                [HOT]
              </Text>{' '}
              <Text color="yellowBright">{hotCommodity.name} +35%</Text>
            </Text>
          )}
          {coldCommodity && (
            <Text>
              <Text color="gray" bold>
                [COLD]
              </Text>{' '}
              <Text color="gray">{coldCommodity.name} -30%</Text>
            </Text>
          )}
        </Box>
      )}

      {/* Row 4: Active events with visual emphasis */}
      {activeEvents.length > 0 && (
        <Box flexDirection="column" width="100%">
          {activeEvents.slice(0, 2).map((active) => {
            const event = getEvent(active.eventId);
            if (!event) return null;
            const daysLeft = active.endDay - day + 1;
            return (
              <Text key={active.eventId}>
                <Text color="magentaBright" bold>
                  [!]
                </Text>
                <Text color="magentaBright"> {event.name}</Text>
                <Text color="dim"> ({daysLeft}d)</Text>
              </Text>
            );
          })}
          {activeEvents.length > 2 && (
            <Text color="gray">    +{activeEvents.length - 2} more events...</Text>
          )}
        </Box>
      )}
    </Box>
  );
};
