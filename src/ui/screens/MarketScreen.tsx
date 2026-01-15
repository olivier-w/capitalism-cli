import React, { useState } from 'react';
import { Box, Text, useInput } from 'ink';
import { useGameStore } from '../../store/gameStore.ts';
import { getMarketPrices } from '../../systems/MarketSystem.ts';
import { Header } from '../components/Header.tsx';
import { Message } from '../components/Message.tsx';
import { QuantitySlider } from '../components/QuantitySlider.tsx';
import { getCargoQuantity } from '../../game/GameState.ts';
import { InlineBar } from '../components/ProgressBar.tsx';

type Mode = 'browse' | 'buy' | 'sell' | 'slider';

interface MarketScreenProps {
  onBack: () => void;
  onMessage: (text: string, type: 'info' | 'success' | 'error') => void;
}

export const MarketScreen: React.FC<MarketScreenProps> = ({ onBack, onMessage }) => {
  const [mode, setMode] = useState<Mode>('browse');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [isBuying, setIsBuying] = useState(true);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState<'info' | 'success' | 'error'>('info');

  const { location, money, cargo, buy, sell, getCargoCapacity, getCargoUsed, getMarketContext } =
    useGameStore();

  const context = getMarketContext();
  const prices = getMarketPrices(location, context);
  const cargoCapacity = getCargoCapacity();
  const cargoUsed = getCargoUsed();

  const selectedCommodity = prices[selectedIndex];

  useInput((input, key) => {
    if (mode === 'browse') {
      if (key.upArrow) {
        setSelectedIndex((prev) => Math.max(0, prev - 1));
      } else if (key.downArrow) {
        setSelectedIndex((prev) => Math.min(prices.length - 1, prev + 1));
      } else if (input === 'b' || input === 'B') {
        setIsBuying(true);
        setMode('slider');
      } else if (input === 's' || input === 'S') {
        setIsBuying(false);
        setMode('slider');
      } else if (key.escape || input === 'q' || input === 'Q') {
        onBack();
      }
    }
  });

  const handleSliderConfirm = (quantity: number) => {
    if (!selectedCommodity) return;

    const result = isBuying
      ? buy(selectedCommodity.commodityId, quantity)
      : sell(selectedCommodity.commodityId, quantity);

    setMessage(result.message);
    setMessageType(result.success ? 'success' : 'error');

    if (result.success) {
      setMode('browse');
    }
  };

  const handleSliderCancel = () => {
    setMode('browse');
  };

  // Slider mode
  if (mode === 'slider' && selectedCommodity) {
    const owned = getCargoQuantity(cargo, selectedCommodity.commodityId);
    const price = isBuying ? selectedCommodity.buyPrice : selectedCommodity.sellPrice;
    const maxQuantity = isBuying ? 999 : owned;

    return (
      <Box flexDirection="column">
        <Header />
        {message && <Message text={message} type={messageType} />}
        <QuantitySlider
          value={1}
          min={0}
          max={maxQuantity}
          price={price}
          money={money}
          cargoUsed={cargoUsed}
          cargoCapacity={cargoCapacity}
          isBuying={isBuying}
          commodityName={selectedCommodity.name}
          onConfirm={handleSliderConfirm}
          onCancel={handleSliderCancel}
        />
      </Box>
    );
  }

  // Browse mode - main market view
  return (
    <Box flexDirection="column">
      <Header />
      {message && <Message text={message} type={messageType} />}

      {/* Market title */}
      <Box marginBottom={1}>
        <Text bold color="cyan">
          {'='.repeat(20)} MARKET {'='.repeat(20)}
        </Text>
      </Box>

      {/* Price table header */}
      <Box borderStyle="single" paddingX={1}>
        <Box width={12}>
          <Text bold color="white">
            COMMODITY
          </Text>
        </Box>
        <Box width={10}>
          <Text bold color="green">
            BUY
          </Text>
        </Box>
        <Box width={10}>
          <Text bold color="yellow">
            SELL
          </Text>
        </Box>
        <Box width={8}>
          <Text bold>OWNED</Text>
        </Box>
        <Box width={20}>
          <Text bold>STATUS</Text>
        </Box>
      </Box>

      {/* Price table rows */}
      <Box flexDirection="column" marginBottom={1}>
        {prices.map((p, index) => {
          const owned = getCargoQuantity(cargo, p.commodityId);
          const isSelected = index === selectedIndex;

          // Build status indicators
          const statuses: string[] = [];
          if (p.isHot) statuses.push('HOT');
          if (p.isCold) statuses.push('COLD');
          if (p.eventAffected) statuses.push('!');
          if (p.trend === 'cheap') statuses.push('LOW');
          else if (p.trend === 'expensive') statuses.push('HIGH');
          if (p.saturationLevel === 'flooded') statuses.push('FLOOD');
          else if (p.saturationLevel === 'oversupplied') statuses.push('OVER');
          else if (p.saturationLevel === 'scarce') statuses.push('SCARCE');
          else if (p.saturationLevel === 'shortage') statuses.push('SHORT');

          const statusStr = statuses.join(' ');

          // Determine status color
          let statusColor = 'white';
          if (p.isHot) statusColor = 'yellowBright';
          else if (p.isCold) statusColor = 'cyanBright';
          else if (p.eventAffected) statusColor = 'magentaBright';
          else if (p.trend === 'cheap') statusColor = 'greenBright';
          else if (p.trend === 'expensive') statusColor = 'redBright';

          return (
            <Box
              key={p.commodityId}
              paddingX={1}
              backgroundColor={isSelected ? 'blue' : undefined}
            >
              <Box width={12}>
                <Text color={isSelected ? 'white' : 'white'} bold={isSelected}>
                  {isSelected ? '>' : ' '} {p.name}
                </Text>
              </Box>
              <Box width={10}>
                <Text color="green">${p.buyPrice}</Text>
              </Box>
              <Box width={10}>
                <Text color="yellow">${p.sellPrice}</Text>
              </Box>
              <Box width={8}>
                {owned > 0 ? (
                  <Text color="cyan">{owned}</Text>
                ) : (
                  <Text color="dim">-</Text>
                )}
              </Box>
              <Box width={20}>
                <Text color={statusColor}>{statusStr || '-'}</Text>
              </Box>
            </Box>
          );
        })}
      </Box>

      {/* Selected commodity detail */}
      {selectedCommodity && (
        <Box flexDirection="column" borderStyle="round" paddingX={1} marginBottom={1}>
          <Text bold>{selectedCommodity.name}</Text>
          <Box gap={2}>
            <Text>
              Buy: <Text color="green" bold>${selectedCommodity.buyPrice}</Text>
            </Text>
            <Text>
              Sell: <Text color="yellow" bold>${selectedCommodity.sellPrice}</Text>
            </Text>
            <Text>
              Spread:{' '}
              <Text color="dim">
                {Math.round(
                  ((selectedCommodity.buyPrice - selectedCommodity.sellPrice) /
                    selectedCommodity.buyPrice) *
                    100
                )}
                %
              </Text>
            </Text>
          </Box>
          {getCargoQuantity(cargo, selectedCommodity.commodityId) > 0 && (
            <Text color="cyan">
              You own: {getCargoQuantity(cargo, selectedCommodity.commodityId)} {selectedCommodity.unit}
            </Text>
          )}
        </Box>
      )}

      {/* Legend */}
      <Box marginBottom={1} flexDirection="column">
        <Text color="dim">
          <Text color="yellowBright">HOT</Text>=+35% demand{' '}
          <Text color="cyanBright">COLD</Text>=-30% demand{' '}
          <Text color="magentaBright">!</Text>=event{' '}
          <Text color="greenBright">LOW</Text>=cheap here{' '}
          <Text color="redBright">HIGH</Text>=expensive here
        </Text>
      </Box>

      {/* Controls */}
      <Box borderStyle="single" paddingX={1}>
        <Text>
          <Text color="dim">[Up/Down]</Text> Select{' '}
          <Text color="greenBright" bold>[B]</Text> Buy{' '}
          <Text color="yellow" bold>[S]</Text> Sell{' '}
          <Text color="dim">[Esc/Q]</Text> Back
        </Text>
      </Box>
    </Box>
  );
};
