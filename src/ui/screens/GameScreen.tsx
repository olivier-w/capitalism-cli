import React, { useState } from 'react';
import { Box, Text, useInput } from 'ink';
import { useGameStore } from '../../store/gameStore.ts';
import { getMarketPrices } from '../../systems/MarketSystem.ts';
import { Header } from '../components/Header.tsx';
import { Message } from '../components/Message.tsx';
import { Ticker } from '../components/Ticker.tsx';
import { CargoHold } from '../components/CargoHold.tsx';
import { EventLog } from '../components/EventAlert.tsx';
import { MarketScreen } from './MarketScreen.tsx';
import { TravelScreen } from './TravelScreen.tsx';
import { StatsScreen } from './StatsScreen.tsx';
import { UpgradeScreen } from './UpgradeScreen.tsx';
import { RegionScreen } from './RegionScreen.tsx';
import { ScannerScreen } from './ScannerScreen.tsx';

type Screen = 'main' | 'market' | 'travel' | 'stats' | 'upgrade' | 'regions' | 'scanner';

interface GameScreenProps {
  onQuit: () => void;
}

export const GameScreen: React.FC<GameScreenProps> = ({ onQuit }) => {
  const [screen, setScreen] = useState<Screen>('main');
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState<'info' | 'success' | 'error'>('info');
  const [selectedIndex, setSelectedIndex] = useState(0);

  const {
    rest,
    eventLog,
    saveGame,
    resetGame,
    location,
    cargo,
    getCargoUsed,
    getCargoCapacity,
    getMarketContext,
    weeklyStatus,
    activeEvents,
    day,
  } = useGameStore();

  const context = getMarketContext();
  const prices = getMarketPrices(location, context);

  // Build price map for cargo display
  const priceMap = new Map<string, { buyPrice: number; sellPrice: number }>();
  for (const p of prices) {
    priceMap.set(p.commodityId, { buyPrice: p.buyPrice, sellPrice: p.sellPrice });
  }

  const showMessage = (text: string, type: 'info' | 'success' | 'error' = 'info') => {
    setMessage(text);
    setMessageType(type);
  };

  const menuItems = [
    { label: 'Trade Goods', value: 'market', key: 'M' },
    { label: 'Travel', value: 'travel', key: 'T' },
    { label: 'Profit Scanner', value: 'scanner', key: 'P' },
    { label: 'Unlock Regions', value: 'regions', key: 'U' },
    { label: 'Upgrade Vehicle', value: 'upgrade', key: 'V' },
    { label: 'View Stats', value: 'stats', key: 'S' },
    { label: 'Rest Until Tomorrow', value: 'rest', key: 'R' },
    { label: 'Save & Quit', value: 'quit', key: 'Q' },
  ];

  const handleAction = (action: string) => {
    setMessage('');
    switch (action) {
      case 'market':
        setScreen('market');
        break;
      case 'travel':
        setScreen('travel');
        break;
      case 'scanner':
        setScreen('scanner');
        break;
      case 'regions':
        setScreen('regions');
        break;
      case 'upgrade':
        setScreen('upgrade');
        break;
      case 'stats':
        setScreen('stats');
        break;
      case 'rest':
        rest();
        const latestEvents = useGameStore.getState().eventLog;
        const newEvents = latestEvents.filter((e) => e.isStarting);
        if (newEvents.length > 0) {
          showMessage(
            `You rest until tomorrow. Energy restored! News: ${newEvents[0]?.eventName}`,
            'info'
          );
        } else {
          showMessage('You rest until tomorrow. Energy restored!', 'success');
        }
        break;
      case 'quit':
        saveGame();
        resetGame();
        onQuit();
        break;
    }
  };

  // Keyboard shortcuts for main screen
  useInput((input, key) => {
    if (screen !== 'main') return;

    const upperInput = input.toUpperCase();

    // Check for shortcut keys
    const matchedItem = menuItems.find((item) => item.key === upperInput);
    if (matchedItem) {
      handleAction(matchedItem.value);
      return;
    }

    // Arrow navigation
    if (key.upArrow) {
      setSelectedIndex((prev) => Math.max(0, prev - 1));
    } else if (key.downArrow) {
      setSelectedIndex((prev) => Math.min(menuItems.length - 1, prev + 1));
    } else if (key.return) {
      const selected = menuItems[selectedIndex];
      if (selected) {
        handleAction(selected.value);
      }
    }
  });

  const handleBack = () => {
    setScreen('main');
    setMessage('');
  };

  // Render sub-screens
  if (screen === 'market') {
    return <MarketScreen onBack={handleBack} onMessage={showMessage} />;
  }
  if (screen === 'travel') {
    return <TravelScreen onBack={handleBack} onMessage={showMessage} />;
  }
  if (screen === 'stats') {
    return <StatsScreen onBack={handleBack} />;
  }
  if (screen === 'upgrade') {
    return <UpgradeScreen onBack={handleBack} onMessage={showMessage} />;
  }
  if (screen === 'regions') {
    return <RegionScreen onBack={handleBack} onMessage={showMessage} />;
  }
  if (screen === 'scanner') {
    return <ScannerScreen onBack={handleBack} />;
  }

  // Main screen
  return (
    <Box flexDirection="column">
      <Header />

      {/* Market ticker */}
      <Ticker
        prices={prices}
        hotCommodity={weeklyStatus.hotCommodity}
        coldCommodity={weeklyStatus.coldCommodity}
        activeEvents={activeEvents}
        day={day}
      />

      {message && <Message text={message} type={messageType} />}

      {/* Event log */}
      <EventLog events={eventLog} maxItems={3} />

      {/* Cargo hold */}
      <CargoHold
        cargo={cargo}
        cargoUsed={getCargoUsed()}
        cargoCapacity={getCargoCapacity()}
        currentPrices={priceMap}
      />

      {/* Menu */}
      <Box marginTop={1} marginBottom={1}>
        <Text bold color="cyan">
          {'='.repeat(15)} ACTIONS {'='.repeat(15)}
        </Text>
      </Box>

      <Box flexDirection="column" marginBottom={1}>
        {menuItems.map((item, index) => {
          const isSelected = index === selectedIndex;
          return (
            <Box key={item.value} paddingX={1} backgroundColor={isSelected ? 'blue' : undefined}>
              <Text color={isSelected ? 'white' : 'dim'}>
                {isSelected ? '>' : ' '}
              </Text>
              <Text color="yellowBright" bold>
                [{item.key}]
              </Text>
              <Text color={isSelected ? 'white' : 'white'} bold={isSelected}>
                {' '}
                {item.label}
              </Text>
            </Box>
          );
        })}
      </Box>

      {/* Controls hint */}
      <Box borderStyle="single" paddingX={1}>
        <Text color="dim">
          [Up/Down] Navigate [Enter] Select [Letter] Quick action
        </Text>
      </Box>
    </Box>
  );
};
