import React, { useState } from 'react';
import { Box, Text, useInput } from 'ink';
import { useGameStore } from '../../store/gameStore.ts';
import { getConnectedLocations, getLocation, getRegion } from '../../data/locations.ts';
import { Header } from '../components/Header.tsx';
import { Message } from '../components/Message.tsx';
import { LocationMap } from '../components/LocationMap.tsx';
import { InlineBar } from '../components/ProgressBar.tsx';

interface TravelScreenProps {
  onBack: () => void;
  onMessage: (text: string, type: 'info' | 'success' | 'error') => void;
}

export const TravelScreen: React.FC<TravelScreenProps> = ({ onBack, onMessage }) => {
  const { location, energy, travel, getTravelCost, unlockedRegions, canAccessLocation } =
    useGameStore();

  const [selectedIndex, setSelectedIndex] = useState(0);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState<'info' | 'success' | 'error'>('info');
  const [showMap, setShowMap] = useState(true);

  const currentLocation = getLocation(location);
  const allDestinations = getConnectedLocations(location);

  // Build destinations list with metadata
  const destinations = allDestinations.map((dest) => {
    const cost = getTravelCost(dest.id);
    const isLocked = !canAccessLocation(dest.id);
    const region = getRegion(dest.region);
    return {
      id: dest.id,
      name: dest.name,
      region: region?.name ?? dest.region,
      cost,
      isLocked,
      canAfford: energy >= cost,
      description: dest.description,
      produces: dest.produces,
      needs: dest.needs,
    };
  });

  // Filter to only selectable destinations (accessible and affordable)
  const selectableDestinations = destinations.filter((d) => !d.isLocked);

  useInput((input, key) => {
    if (key.upArrow) {
      setSelectedIndex((prev) => Math.max(0, prev - 1));
    } else if (key.downArrow) {
      setSelectedIndex((prev) => Math.min(selectableDestinations.length - 1, prev + 1));
    } else if (key.return) {
      const selected = selectableDestinations[selectedIndex];
      if (selected && !selected.isLocked && selected.canAfford) {
        const result = travel(selected.id);
        if (result.success) {
          onMessage(result.message, 'success');
          onBack();
        } else {
          setMessage(result.message);
          setMessageType('error');
        }
      } else if (selected && !selected.canAfford) {
        setMessage(`Need ${selected.cost} energy to travel (have ${energy})`);
        setMessageType('error');
      }
    } else if (input === 'm' || input === 'M') {
      setShowMap((prev) => !prev);
    } else if (key.escape || input === 'q' || input === 'Q') {
      onBack();
    }
  });

  const selectedDest = selectableDestinations[selectedIndex];

  return (
    <Box flexDirection="column">
      <Header />
      {message && <Message text={message} type={messageType} />}

      {/* Current location info */}
      <Box flexDirection="column" borderStyle="round" paddingX={1} marginBottom={1}>
        <Box>
          <Text bold color="greenBright">
            [*] CURRENT: {currentLocation?.name}
          </Text>
          <Text color="dim"> ({getRegion(currentLocation?.region ?? 'starter')?.name})</Text>
        </Box>
        <Text color="dim">{currentLocation?.description}</Text>
      </Box>

      {/* Map toggle */}
      {showMap && (
        <LocationMap
          currentLocation={location}
          selectedLocation={selectedDest?.id ?? null}
          unlockedRegions={unlockedRegions}
          getTravelCost={getTravelCost}
        />
      )}

      {/* Destination list */}
      <Box marginTop={1} marginBottom={1}>
        <Text bold color="cyan">
          {'='.repeat(10)} AVAILABLE ROUTES {'='.repeat(10)}
        </Text>
      </Box>

      <Box flexDirection="column" marginBottom={1}>
        {selectableDestinations.map((dest, index) => {
          const isSelected = index === selectedIndex;
          const isCurrent = dest.id === location;

          return (
            <Box
              key={dest.id}
              paddingX={1}
              backgroundColor={isSelected ? 'blue' : undefined}
            >
              <Box width={3}>
                <Text color={isSelected ? 'cyanBright' : 'dim'}>
                  {isSelected ? '>' : ' '}
                </Text>
              </Box>
              <Box width={18}>
                <Text
                  color={isCurrent ? 'green' : isSelected ? 'white' : 'white'}
                  bold={isSelected}
                >
                  {dest.name}
                </Text>
              </Box>
              <Box width={12}>
                <Text color="dim">({dest.region})</Text>
              </Box>
              <Box width={14}>
                {isCurrent ? (
                  <Text color="green">[HERE]</Text>
                ) : dest.canAfford ? (
                  <Text color="yellow">
                    <InlineBar value={dest.cost} max={100} width={5} thresholds={{ low: 0.3, high: 0.6 }} />
                    {' '}{dest.cost}E
                  </Text>
                ) : (
                  <Text color="red">{dest.cost}E [!]</Text>
                )}
              </Box>
            </Box>
          );
        })}
      </Box>

      {/* Locked destinations notice */}
      {destinations.filter((d) => d.isLocked).length > 0 && (
        <Box marginBottom={1}>
          <Text color="gray">
            {destinations.filter((d) => d.isLocked).length} destinations locked (unlock regions to access)
          </Text>
        </Box>
      )}

      {/* Selected destination details */}
      {selectedDest && selectedDest.id !== location && (
        <Box flexDirection="column" borderStyle="single" paddingX={1} marginBottom={1}>
          <Text bold>{selectedDest.name}</Text>
          <Text color="dim">{selectedDest.description}</Text>
          <Box gap={2}>
            {selectedDest.produces.length > 0 && (
              <Text>
                <Text color="greenBright">Produces:</Text>{' '}
                <Text color="green">{selectedDest.produces.join(', ')}</Text>
              </Text>
            )}
            {selectedDest.needs.length > 0 && (
              <Text>
                <Text color="redBright">Needs:</Text>{' '}
                <Text color="red">{selectedDest.needs.join(', ')}</Text>
              </Text>
            )}
          </Box>
          <Box marginTop={1}>
            <Text>
              Travel cost:{' '}
              <Text color={selectedDest.canAfford ? 'yellow' : 'red'} bold>
                {selectedDest.cost} energy
              </Text>
              {!selectedDest.canAfford && (
                <Text color="red"> (need {selectedDest.cost - energy} more)</Text>
              )}
            </Text>
          </Box>
        </Box>
      )}

      {/* Controls */}
      <Box borderStyle="single" paddingX={1}>
        <Text>
          <Text color="dim">[Up/Down]</Text> Select{' '}
          <Text color="greenBright" bold>[Enter]</Text> Travel{' '}
          <Text color="dim">[M]</Text> Toggle map{' '}
          <Text color="dim">[Esc/Q]</Text> Back
        </Text>
      </Box>
    </Box>
  );
};
