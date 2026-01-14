import React, { useState } from 'react';
import { Box, Text } from 'ink';
import { Select } from '../components/Select.tsx';
import { useGameStore } from '../../store/gameStore.ts';
import { Header } from '../components/Header.tsx';
import { Message } from '../components/Message.tsx';
import { MarketScreen } from './MarketScreen.tsx';
import { TravelScreen } from './TravelScreen.tsx';
import { StatsScreen } from './StatsScreen.tsx';
import { UpgradeScreen } from './UpgradeScreen.tsx';
import { RegionScreen } from './RegionScreen.tsx';

type Screen = 'main' | 'market' | 'travel' | 'stats' | 'upgrade' | 'regions';

interface GameScreenProps {
  onQuit: () => void;
}

export const GameScreen: React.FC<GameScreenProps> = ({ onQuit }) => {
  const [screen, setScreen] = useState<Screen>('main');
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState<'info' | 'success' | 'error'>('info');

  const { rest, eventLog, saveGame, resetGame } = useGameStore();

  const showMessage = (text: string, type: 'info' | 'success' | 'error' = 'info') => {
    setMessage(text);
    setMessageType(type);
  };

  const items = [
    { label: 'Trade Goods', value: 'market' },
    { label: 'Travel', value: 'travel' },
    { label: 'Unlock Regions', value: 'regions' },
    { label: 'Upgrade Vehicle', value: 'upgrade' },
    { label: 'View Stats', value: 'stats' },
    { label: 'Rest Until Tomorrow', value: 'rest' },
    { label: 'Save & Quit', value: 'quit' },
  ];

  const handleSelect = (item: { value: string }) => {
    setMessage('');
    switch (item.value) {
      case 'market':
        setScreen('market');
        break;
      case 'travel':
        setScreen('travel');
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
        // Check if any new events happened
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

  const handleBack = () => {
    setScreen('main');
    setMessage('');
  };

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

  // Show recent event news on main screen
  const recentNews = eventLog.filter((e) => e.isStarting).slice(0, 2);

  return (
    <Box flexDirection="column">
      <Header />

      {message && <Message text={message} type={messageType} />}

      {recentNews.length > 0 && (
        <Box flexDirection="column" marginBottom={1}>
          <Text bold color="magenta">
            Recent News:
          </Text>
          {recentNews.map((news, i) => (
            <Text key={i} color="dim">
              Day {news.day}: {news.description}
            </Text>
          ))}
        </Box>
      )}

      <Box marginBottom={1}>
        <Text>What would you like to do?</Text>
      </Box>

      <Select items={items} onSelect={handleSelect} />
    </Box>
  );
};
