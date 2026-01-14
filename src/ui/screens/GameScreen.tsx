import React, { useState } from 'react';
import { Box, Text } from 'ink';
import SelectInput from 'ink-select-input';
import { useGameStore } from '../../store/gameStore.ts';
import { Header } from '../components/Header.tsx';
import { Message } from '../components/Message.tsx';
import { MarketScreen } from './MarketScreen.tsx';
import { TravelScreen } from './TravelScreen.tsx';
import { StatsScreen } from './StatsScreen.tsx';
import { UpgradeScreen } from './UpgradeScreen.tsx';

type Screen = 'main' | 'market' | 'travel' | 'stats' | 'upgrade';

interface GameScreenProps {
  onQuit: () => void;
}

export const GameScreen: React.FC<GameScreenProps> = ({ onQuit }) => {
  const [screen, setScreen] = useState<Screen>('main');
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState<'info' | 'success' | 'error'>('info');

  const { rest, energy } = useGameStore();

  const showMessage = (text: string, type: 'info' | 'success' | 'error' = 'info') => {
    setMessage(text);
    setMessageType(type);
  };

  const items = [
    { label: 'Trade Goods', value: 'market' },
    { label: 'Travel', value: 'travel' },
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
      case 'upgrade':
        setScreen('upgrade');
        break;
      case 'stats':
        setScreen('stats');
        break;
      case 'rest':
        rest();
        showMessage('You rest until tomorrow. Energy restored!', 'success');
        break;
      case 'quit':
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

  return (
    <Box flexDirection="column">
      <Header />

      {message && <Message text={message} type={messageType} />}

      <Box marginBottom={1}>
        <Text>What would you like to do?</Text>
      </Box>

      <SelectInput items={items} onSelect={handleSelect} />
    </Box>
  );
};
