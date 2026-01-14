import React, { useState } from 'react';
import { Box, Text, useInput } from 'ink';
import { Select } from '../components/Select.tsx';
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

  const { location, money, cargo, buy, sell, getCargoCapacity, getCargoUsed, getMarketContext } =
    useGameStore();

  const context = getMarketContext();
  const prices = getMarketPrices(location, context);
  const cargoCapacity = getCargoCapacity();
  const cargoUsed = getCargoUsed();

  useInput((input, key) => {
    if (mode === 'quantity') {
      if (key.return) {
        const qty = parseInt(quantity) || 0;
        if (qty > 0) {
          const result = isBuying ? buy(selectedCommodity, qty) : sell(selectedCommodity, qty);

          setMessage(result.message);
          setMessageType(result.success ? 'success' : 'error');

          if (result.success) {
            setMode('menu');
            setQuantity('1');
          }
        }
      } else if ((key.escape || key.backspace) && quantity === '') {
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

    // Build indicator string
    const indicators: string[] = [];
    if (p.isHot) indicators.push('HOT');
    if (p.isCold) indicators.push('COLD');
    if (p.eventAffected) indicators.push('EVENT');
    if (p.trend === 'cheap') indicators.push('LOW');
    if (p.trend === 'expensive') indicators.push('HIGH');

    const indicatorStr = indicators.length > 0 ? ` [${indicators.join(' ')}]` : '';

    return {
      label: `${p.name}: $${price}${indicatorStr} (You have: ${owned})`,
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
        <Box width={8}>
          <Text bold>Owned</Text>
        </Box>
        <Box width={18}>
          <Text bold>Status</Text>
        </Box>
      </Box>
      {prices.map((p) => {
        const owned = getCargoQuantity(cargo, p.commodityId);

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

        // Color for status (use bright colors for readability)
        let statusColor = 'white';
        if (p.isHot) statusColor = 'yellowBright';
        else if (p.isCold) statusColor = 'cyanBright';
        else if (p.eventAffected) statusColor = 'magentaBright';
        else if (p.trend === 'cheap') statusColor = 'greenBright';
        else if (p.trend === 'expensive') statusColor = 'redBright';

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
            <Box width={8}>
              <Text>{owned}</Text>
            </Box>
            <Box width={18}>
              <Text color={statusColor}>{statusStr || '-'}</Text>
            </Box>
          </Box>
        );
      })}
    </Box>
  );

  if (mode === 'quantity') {
    const priceInfo = prices.find((p) => p.commodityId === selectedCommodity);
    const price = isBuying ? (priceInfo?.buyPrice ?? 0) : (priceInfo?.sellPrice ?? 0);
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

      <Box marginBottom={1}>
        <Text color="gray">
          <Text color="yellowBright">HOT</Text>=+35% | <Text color="cyanBright">COLD</Text>=-30% | <Text color="magentaBright">!</Text>=event
        </Text>
      </Box>

      {mode === 'menu' && (
        <>
          <Text>Market Actions:</Text>
          <Select items={menuItems} onSelect={handleMenuSelect} />
        </>
      )}

      {(mode === 'buy' || mode === 'sell') && (
        <>
          <Text>{isBuying ? 'Select item to buy:' : 'Select item to sell:'}</Text>
          <Select items={commodityItems} onSelect={handleCommoditySelect} />
        </>
      )}
    </Box>
  );
};
