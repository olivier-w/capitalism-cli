import React, { useState } from 'react';
import { Box, Text, useInput } from 'ink';
import { useGameStore } from '../../store/gameStore.ts';
import { getMarketPrices, type MarketContext } from '../../systems/MarketSystem.ts';
import { locations, getLocation, getRegion, type RegionId } from '../../data/locations.ts';
import { Header } from '../components/Header.tsx';
import { MarginBar } from '../components/ProgressBar.tsx';

interface ScannerScreenProps {
  onBack: () => void;
}

interface ArbitrageOpportunity {
  commodityId: string;
  commodityName: string;
  buyLocationId: string;
  buyLocationName: string;
  buyPrice: number;
  sellLocationId: string;
  sellLocationName: string;
  sellPrice: number;
  margin: number;
  profitPerUnit: number;
}

export const ScannerScreen: React.FC<ScannerScreenProps> = ({ onBack }) => {
  const { getMarketContext, unlockedRegions, location: currentLocation } = useGameStore();
  const [selectedIndex, setSelectedIndex] = useState(0);

  const context = getMarketContext();

  // Calculate arbitrage opportunities across all unlocked locations
  const opportunities: ArbitrageOpportunity[] = [];

  // Get all unlocked locations
  const unlockedLocations = locations.filter((loc) =>
    unlockedRegions.includes(loc.region)
  );

  // Get prices at each location
  const pricesByLocation = new Map<string, Map<string, { buyPrice: number; sellPrice: number }>>();

  for (const loc of unlockedLocations) {
    const prices = getMarketPrices(loc.id, context);
    const priceMap = new Map<string, { buyPrice: number; sellPrice: number }>();
    for (const p of prices) {
      priceMap.set(p.commodityId, { buyPrice: p.buyPrice, sellPrice: p.sellPrice });
    }
    pricesByLocation.set(loc.id, priceMap);
  }

  // Find arbitrage opportunities
  for (const buyLoc of unlockedLocations) {
    const buyPrices = pricesByLocation.get(buyLoc.id);
    if (!buyPrices) continue;

    for (const [commodityId, buyData] of buyPrices.entries()) {
      for (const sellLoc of unlockedLocations) {
        if (buyLoc.id === sellLoc.id) continue;

        const sellPrices = pricesByLocation.get(sellLoc.id);
        if (!sellPrices) continue;

        const sellData = sellPrices.get(commodityId);
        if (!sellData) continue;

        const profitPerUnit = sellData.sellPrice - buyData.buyPrice;
        if (profitPerUnit > 0) {
          const margin = ((sellData.sellPrice - buyData.buyPrice) / buyData.buyPrice) * 100;

          const prices = getMarketPrices(buyLoc.id, context);
          const commodity = prices.find((p) => p.commodityId === commodityId);

          opportunities.push({
            commodityId,
            commodityName: commodity?.name ?? commodityId,
            buyLocationId: buyLoc.id,
            buyLocationName: buyLoc.name,
            buyPrice: buyData.buyPrice,
            sellLocationId: sellLoc.id,
            sellLocationName: sellLoc.name,
            sellPrice: sellData.sellPrice,
            margin,
            profitPerUnit,
          });
        }
      }
    }
  }

  // Sort by margin (best opportunities first)
  opportunities.sort((a, b) => b.margin - a.margin);

  // Take top 10
  const topOpportunities = opportunities.slice(0, 10);

  useInput((input, key) => {
    if (key.upArrow) {
      setSelectedIndex((prev) => Math.max(0, prev - 1));
    } else if (key.downArrow) {
      setSelectedIndex((prev) => Math.min(topOpportunities.length - 1, prev + 1));
    } else if (key.escape || input === 'q' || input === 'Q') {
      onBack();
    }
  });

  const selectedOpp = topOpportunities[selectedIndex];

  return (
    <Box flexDirection="column">
      <Header />

      {/* Title */}
      <Box marginBottom={1}>
        <Text bold color="yellowBright">
          {'='.repeat(15)} [$] PROFIT SCANNER {'='.repeat(15)}
        </Text>
      </Box>

      {/* Subtitle */}
      <Box marginBottom={1}>
        <Text color="dim">
          Scanning {unlockedLocations.length} locations for arbitrage opportunities...
        </Text>
      </Box>

      {/* Opportunities list */}
      {topOpportunities.length === 0 ? (
        <Box marginY={2}>
          <Text color="yellow">No profitable opportunities found. Try unlocking more regions!</Text>
        </Box>
      ) : (
        <Box flexDirection="column" marginBottom={1}>
          {topOpportunities.map((opp, index) => {
            const isSelected = index === selectedIndex;
            const isAtBuyLocation = opp.buyLocationId === currentLocation;
            const isAtSellLocation = opp.sellLocationId === currentLocation;

            return (
              <Box
                key={`${opp.commodityId}-${opp.buyLocationId}-${opp.sellLocationId}`}
                flexDirection="column"
                paddingX={1}
                marginBottom={1}
                backgroundColor={isSelected ? 'blue' : undefined}
                borderStyle={isSelected ? 'single' : undefined}
              >
                <Box>
                  <Text color={isSelected ? 'white' : 'dim'}>
                    {index + 1}.{' '}
                  </Text>
                  <Text bold color="cyan">
                    {opp.commodityName}
                  </Text>
                </Box>
                <Box>
                  <Text color={isAtBuyLocation ? 'greenBright' : 'green'}>
                    {isAtBuyLocation ? '[*]' : '   '} Buy @ {opp.buyLocationName}
                  </Text>
                  <Text color="dim"> ${opp.buyPrice} </Text>
                  <Text color="dim">----{'>'} </Text>
                  <Text color={isAtSellLocation ? 'yellowBright' : 'yellow'}>
                    Sell @ {opp.sellLocationName}
                  </Text>
                  <Text color="dim"> ${opp.sellPrice}</Text>
                </Box>
                <Box>
                  <Text>
                    Profit: <Text color="greenBright" bold>+${opp.profitPerUnit}/unit</Text>
                  </Text>
                  <Text color="dim"> | </Text>
                  <Text>
                    Margin: <Text color="greenBright">+{Math.round(opp.margin)}%</Text>
                  </Text>
                  <Text color="dim"> </Text>
                  <MarginBar percentage={opp.margin} width={15} />
                </Box>
              </Box>
            );
          })}
        </Box>
      )}

      {/* Selected opportunity details */}
      {selectedOpp && (
        <Box flexDirection="column" borderStyle="double" paddingX={1} marginBottom={1}>
          <Text bold color="cyan">
            TRADE ROUTE DETAILS
          </Text>
          <Box flexDirection="column" marginTop={1}>
            <Text>
              <Text color="greenBright">1.</Text> Travel to{' '}
              <Text bold>{selectedOpp.buyLocationName}</Text>
              {selectedOpp.buyLocationId === currentLocation && (
                <Text color="green"> (You are here!)</Text>
              )}
            </Text>
            <Text>
              <Text color="greenBright">2.</Text> Buy <Text bold>{selectedOpp.commodityName}</Text>{' '}
              @ <Text color="green">${selectedOpp.buyPrice}</Text> each
            </Text>
            <Text>
              <Text color="yellowBright">3.</Text> Travel to{' '}
              <Text bold>{selectedOpp.sellLocationName}</Text>
              {selectedOpp.sellLocationId === currentLocation && (
                <Text color="green"> (You are here!)</Text>
              )}
            </Text>
            <Text>
              <Text color="yellowBright">4.</Text> Sell @ <Text color="yellow">${selectedOpp.sellPrice}</Text>{' '}
              = <Text color="greenBright" bold>+${selectedOpp.profitPerUnit}</Text> profit per unit
            </Text>
          </Box>
        </Box>
      )}

      {/* Legend */}
      <Box marginBottom={1}>
        <Text color="dim">
          <Text color="greenBright">[*]</Text> = Your current location
        </Text>
      </Box>

      {/* Controls */}
      <Box borderStyle="single" paddingX={1}>
        <Text>
          <Text color="dim">[Up/Down]</Text> Browse opportunities{' '}
          <Text color="dim">[Esc/Q]</Text> Back
        </Text>
      </Box>
    </Box>
  );
};
