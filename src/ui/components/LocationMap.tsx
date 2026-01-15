import React from 'react';
import { Box, Text } from 'ink';
import { getLocation, getRegion, type RegionId } from '../../data/locations.ts';

interface LocationMapProps {
  currentLocation: string;
  selectedLocation: string | null;
  unlockedRegions: RegionId[];
  getTravelCost: (destinationId: string) => number;
}

export const LocationMap: React.FC<LocationMapProps> = ({
  currentLocation,
  selectedLocation,
  unlockedRegions,
  getTravelCost,
}) => {
  // Helper to render a location node
  const renderNode = (id: string, label: string) => {
    const isCurrent = id === currentLocation;
    const isSelected = id === selectedLocation;
    const location = getLocation(id);
    const isLocked = location && !unlockedRegions.includes(location.region);

    let color = 'white';
    let marker = '[ ]';

    if (isCurrent) {
      color = 'greenBright';
      marker = '[*]';
    } else if (isSelected) {
      color = 'cyanBright';
      marker = '[>]';
    } else if (isLocked) {
      color = 'gray';
      marker = '[x]';
    }

    const costStr = !isCurrent && !isLocked ? ` (${getTravelCost(id)})` : '';

    return (
      <Text color={color}>
        {marker} {label}
        <Text color="dim">{costStr}</Text>
      </Text>
    );
  };

  return (
    <Box flexDirection="column">
      {/* Map Title */}
      <Box marginBottom={1}>
        <Text bold color="cyan">
          {'='.repeat(15)} TRADE ROUTE MAP {'='.repeat(15)}
        </Text>
      </Box>

      {/* ASCII Map - arranged to show connections */}
      <Box flexDirection="column" paddingX={2}>
        {/* COASTAL REGION (TOP) */}
        <Box flexDirection="column" marginBottom={1}>
          <Text color={unlockedRegions.includes('coastal') ? 'blueBright' : 'gray'} bold>
            --- COASTAL TERRITORIES ---
          </Text>
          <Box>
            <Box width={24}>{renderNode('harbor', 'Grand Harbor')}</Box>
            <Text color="dim">----</Text>
            <Box width={24}>{renderNode('lighthouse', 'Lighthouse Bay')}</Box>
          </Box>
          <Box>
            <Text color="dim">        |                         |</Text>
          </Box>
          <Box>
            <Text color="dim">        |                         |</Text>
          </Box>
          <Box>
            <Box width={24}>
              <Text> </Text>
            </Box>
            <Text color="dim">----</Text>
            <Box width={24}>{renderNode('docks', 'The Docks')}</Box>
          </Box>
        </Box>

        {/* Connection line to Starter */}
        <Box>
          <Text color="dim">        |</Text>
        </Box>

        {/* STARTER REGION (MIDDLE) */}
        <Box flexDirection="column" marginBottom={1}>
          <Text color="yellowBright" bold>
            --- CENTRAL HUB ---
          </Text>
          <Box>
            <Box width={24}>{renderNode('port', 'Port Town')}</Box>
            <Text color="dim">----</Text>
            <Box width={24}>{renderNode('metro', 'Metro City')}</Box>
          </Box>
          <Box>
            <Text color="dim">        |                         |</Text>
          </Box>
          <Box>
            <Box width={24}>{renderNode('industrial', 'Industrial Zone')}</Box>
            <Text color="dim">    </Text>
            <Box width={24}>{renderNode('crossroads', 'Crossroads Jct')}</Box>
          </Box>
        </Box>

        {/* Connection lines to Farming */}
        <Box>
          <Text color="dim">        |                         |</Text>
        </Box>

        {/* FARMING REGION (BOTTOM) */}
        <Box flexDirection="column">
          <Text color={unlockedRegions.includes('farming') ? 'greenBright' : 'gray'} bold>
            --- AGRICULTURAL HEARTLAND ---
          </Text>
          <Box>
            <Box width={24}>{renderNode('farmtown', 'Farmtown')}</Box>
            <Text color="dim">----</Text>
            <Box width={24}>{renderNode('orchards', 'Orchard Valley')}</Box>
          </Box>
          <Box>
            <Text color="dim">        |              |</Text>
          </Box>
          <Box>
            <Box width={24}>
              <Text> </Text>
            </Box>
            <Text color="dim">    </Text>
            <Box width={24}>{renderNode('ranch', 'Dusty Ranch')}</Box>
          </Box>
        </Box>
      </Box>

      {/* Legend */}
      <Box marginTop={1} flexDirection="column">
        <Text color="dim">
          <Text color="greenBright">[*]</Text> Current location{' '}
          <Text color="cyanBright">[{'>'}]</Text> Selected{' '}
          <Text color="gray">[x]</Text> Locked region
        </Text>
        <Text color="dim">Numbers in () = energy cost to travel</Text>
      </Box>
    </Box>
  );
};

// Compact list view as alternative
interface LocationListProps {
  currentLocation: string;
  selectedIndex: number;
  destinations: Array<{
    id: string;
    name: string;
    region: string;
    cost: number;
    isLocked: boolean;
    description: string;
  }>;
}

export const LocationList: React.FC<LocationListProps> = ({
  currentLocation,
  selectedIndex,
  destinations,
}) => {
  return (
    <Box flexDirection="column">
      {destinations.map((dest, index) => {
        const isSelected = index === selectedIndex;
        const isCurrent = dest.id === currentLocation;

        let color = 'white';
        if (isCurrent) color = 'greenBright';
        else if (isSelected) color = 'cyanBright';
        else if (dest.isLocked) color = 'gray';

        return (
          <Box key={dest.id} paddingX={1} backgroundColor={isSelected ? 'blue' : undefined}>
            <Box width={3}>
              <Text color={color}>{isSelected ? '>' : ' '}</Text>
            </Box>
            <Box width={18}>
              <Text color={color} bold={isSelected}>
                {dest.name}
              </Text>
            </Box>
            <Box width={12}>
              <Text color="dim">({dest.region})</Text>
            </Box>
            <Box width={10}>
              {dest.isLocked ? (
                <Text color="red">[LOCKED]</Text>
              ) : isCurrent ? (
                <Text color="green">[HERE]</Text>
              ) : (
                <Text color="yellow">{dest.cost} energy</Text>
              )}
            </Box>
          </Box>
        );
      })}
    </Box>
  );
};
