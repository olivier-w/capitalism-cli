import React, { useState } from 'react';
import { Box, Text, useInput } from 'ink';
import SelectInput from 'ink-select-input';
import { useGameStore } from '../../store/gameStore.ts';
import { getMarketPrices } from '../../systems/MarketSystem.ts';
import { Header } from '../components/Header.tsx';
import { Message } from '../components/Message.tsx';
import { getCargoQuantity } from '../../game/GameState.ts';

type Mode = 'menu' | 'buy' | 'sell' | 'quantity';

interface MarketScreenProps {
  onBack: () => void;
  onMessage: (text: string, type: 'info' | 'success' | 'error') => void;
}

export const MarketScreen: React.FC<MarketScreenProps> = ({ onBack, onMessage }) => {
  const [mode, setMode] = useState<Mode>('menu');
  const [selectedCommodity, setSelectedCommodity] = useState<string>('');
  const [quantity, setQuantity] = useState('1');
  const [isBuying, setIsBuying] = useState(true);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState<'info' | 'success' | 'error'>('info');

  const { location, day, money, cargo, buy, sell, getCargoCapacity, getCargoUsed } = useGameStore();

  const prices = getMarketPrices(location, day);
  const cargoCapacity = getCargoCapacity();
  const cargoUsed = getCargoUsed();

  useInput((input, key) => {
    if (mode === 'quantity') {
      if (key.return) {
        const qty = parseInt(quantity) || 0;
        if (qty > 0) {
          const result = isBuying
            ? buy(selectedCommodity, qty)
            : sell(selectedCommodity, qty);

          setMessage(result.message);
          setMessageType(result.success ? 'success' : 'error');

          if (result.success) {
            setMode('menu');
            setQuantity('1');
          }
        }
      } else if (key.escape || key.backspace && quantity === '') {
        setMode(isBuying ? 'buy' : 'sell');
        setQuantity('1');
      } else if (key.backspace) {
        setQuantity((prev) => prev.slice(0, -1));
      } else if (/^\d$/.test(input)) {
        setQuantity((prev) => prev + input);
      }
    }
  });

  const menuItems = [
    { label: 'Buy Goods', value: 'buy' },
    { label: 'Sell Goods', value: 'sell' },
    { label: 'Back', value: 'back' },
  ];

  const handleMenuSelect = (item: { value: string }) => {
    setMessage('');
    switch (item.value) {
      case 'buy':
        setMode('buy');
        setIsBuying(true);
        break;
      case 'sell':
        setMode('sell');
        setIsBuying(false);
        break;
      case 'back':
        onBack();
        break;
    }
  };

  const commodityItems = prices.map((p) => {
    const owned = getCargoQuantity(cargo, p.commodityId);
    const price = isBuying ? p.buyPrice : p.sellPrice;
    const trendIndicator = p.trend === 'cheap' ? ' [LOW]' : p.trend === 'expensive' ? ' [HIGH]' : '';

    return {
      label: `${p.name}: $${price}${trendIndicator} (You have: ${owned})`,
      value: p.commodityId,
    };
  });
  commodityItems.push({ label: 'Back', value: 'back' });

  const handleCommoditySelect = (item: { value: string }) => {
    if (item.value === 'back') {
      setMode('menu');
      return;
    }
    setSelectedCommodity(item.value);
    setMode('quantity');
    setQuantity('1');
  };

  const renderPriceTable = () => (
    <Box flexDirection="column" marginBottom={1}>
      <Box borderStyle="single" paddingX={1}>
        <Box width={14}>
          <Text bold>Item</Text>
        </Box>
        <Box width={10}>
          <Text bold>Buy</Text>
        </Box>
        <Box width={10}>
          <Text bold>Sell</Text>
        </Box>
        <Box width={10}>
          <Text bold>Owned</Text>
        </Box>
        <Box width={12}>
          <Text bold>Trend</Text>
        </Box>
      </Box>
      {prices.map((p) => {
        const owned = getCargoQuantity(cargo, p.commodityId);
        return (
          <Box key={p.commodityId} paddingX={1}>
            <Box width={14}>
              <Text>{p.name}</Text>
            </Box>
            <Box width={10}>
              <Text color="green">${p.buyPrice}</Text>
            </Box>
            <Box width={10}>
              <Text color="yellow">${p.sellPrice}</Text>
            </Box>
            <Box width={10}>
              <Text>{owned}</Text>
            </Box>
            <Box width={12}>
              <Text color={p.trend === 'cheap' ? 'green' : p.trend === 'expensive' ? 'red' : 'white'}>
                {p.trend === 'cheap' ? 'LOW' : p.trend === 'expensive' ? 'HIGH' : '-'}
              </Text>
            </Box>
          </Box>
        );
      })}
    </Box>
  );

  if (mode === 'quantity') {
    const priceInfo = prices.find((p) => p.commodityId === selectedCommodity);
    const price = isBuying ? priceInfo?.buyPrice ?? 0 : priceInfo?.sellPrice ?? 0;
    const qty = parseInt(quantity) || 0;
    const total = price * qty;
    const owned = getCargoQuantity(cargo, selectedCommodity);

    return (
      <Box flexDirection="column">
        <Header />
        {message && <Message text={message} type={messageType} />}
        <Text>
          {isBuying ? 'Buying' : 'Selling'} {priceInfo?.name} at ${price} each
        </Text>
        {isBuying && (
          <Text color="dim">
            Available funds: ${money} | Space: {cargoCapacity - cargoUsed} units
          </Text>
        )}
        {!isBuying && <Text color="dim">You own: {owned}</Text>}
        <Box marginY={1}>
          <Text>
            Quantity: <Text color="cyan">{quantity || '0'}</Text>
          </Text>
        </Box>
        <Text>
          Total: <Text color="yellow">${total}</Text>
        </Text>
        <Box marginTop={1}>
          <Text color="dim">Type quantity and press Enter (Backspace to go back)</Text>
        </Box>
      </Box>
    );
  }

  return (
    <Box flexDirection="column">
      <Header />
      {message && <Message text={message} type={messageType} />}

      {renderPriceTable()}

      {mode === 'menu' && (
        <>
          <Text>Market Actions:</Text>
          <SelectInput items={menuItems} onSelect={handleMenuSelect} />
        </>
      )}

      {(mode === 'buy' || mode === 'sell') && (
        <>
          <Text>{isBuying ? 'Select item to buy:' : 'Select item to sell:'}</Text>
          <SelectInput items={commodityItems} onSelect={handleCommoditySelect} />
        </>
      )}
    </Box>
  );
};
