import React from 'react';
import { Box, Text } from 'ink';
import { Select } from '../components/Select.tsx';
import { useGameStore } from '../../store/gameStore.ts';
import { regions, getLocationsByRegion, type RegionId } from '../../data/locations.ts';
import { Header } from '../components/Header.tsx';

interface RegionScreenProps {
  onBack: () => void;
  onMessage: (text: string, type: 'info' | 'success' | 'error') => void;
}

export const RegionScreen: React.FC<RegionScreenProps> = ({ onBack, onMessage }) => {
  const { money, unlockedRegions, unlockRegion } = useGameStore();

  const lockedRegions = regions.filter((r) => !unlockedRegions.includes(r.id));

  const items: { label: string; value: string; disabled: boolean }[] = lockedRegions.map(
    (region) => {
      const canAfford = money >= region.unlockCost;
      const locationCount = getLocationsByRegion(region.id).length;
      return {
        label: `${region.name} - $${region.unlockCost.toLocaleString()} (${locationCount} locations)${!canAfford ? ' [Cannot afford]' : ''}`,
        value: region.id,
        disabled: !canAfford,
      };
    }
  );
  items.push({ label: 'Back', value: 'back', disabled: false });

  const handleSelect = (item: { value: string }) => {
    if (item.value === 'back') {
      onBack();
      return;
    }

    const result = unlockRegion(item.value as RegionId);
    onMessage(result.message, result.success ? 'success' : 'error');
    if (result.success) {
      onBack();
    }
  };

  return (
    <Box flexDirection="column">
      <Header />

      <Box flexDirection="column" marginBottom={1}>
        <Text bold color="yellow">
          Expand Your Trade Empire
        </Text>
        <Text color="dim">Unlock new regions to access more markets and commodities</Text>
      </Box>

      <Box flexDirection="column" marginBottom={1}>
        <Text bold>Unlocked Regions:</Text>
        {unlockedRegions.map((regionId) => {
          const region = regions.find((r) => r.id === regionId);
          const locCount = getLocationsByRegion(regionId).length;
          return (
            <Text key={regionId} color="green">
              - {region?.name ?? regionId} ({locCount} locations)
            </Text>
          );
        })}
      </Box>

      {lockedRegions.length > 0 ? (
        <>
          <Box marginBottom={1}>
            <Text bold>Available to Unlock:</Text>
          </Box>
          {lockedRegions.map((region) => (
            <Box key={region.id} flexDirection="column" marginLeft={2} marginBottom={1}>
              <Text color={money >= region.unlockCost ? 'white' : 'dim'}>
                {region.name} - ${region.unlockCost.toLocaleString()}
              </Text>
              <Text color="dim">{region.description}</Text>
            </Box>
          ))}
        </>
      ) : (
        <Text color="green">All regions unlocked!</Text>
      )}

      <Box marginTop={1}>
        <Text>
          Your funds: <Text color="yellow">${money.toLocaleString()}</Text>
        </Text>
      </Box>

      <Box marginTop={1}>
        <Select items={items} onSelect={handleSelect} />
      </Box>
    </Box>
  );
};
