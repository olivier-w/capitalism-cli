import React from 'react';
import { Box, Text } from 'ink';
import SelectInput from 'ink-select-input';

interface MainMenuProps {
  onNewGame: () => void;
  onQuit: () => void;
}

export const MainMenu: React.FC<MainMenuProps> = ({ onNewGame, onQuit }) => {
  const items = [
    { label: 'New Game', value: 'new' },
    { label: 'Quit', value: 'quit' },
  ];

  const handleSelect = (item: { value: string }) => {
    switch (item.value) {
      case 'new':
        onNewGame();
        break;
      case 'quit':
        onQuit();
        break;
    }
  };

  return (
    <Box flexDirection="column" alignItems="center" padding={2}>
      <Box marginBottom={2} flexDirection="column" alignItems="center">
        <Text color="yellow" bold>
          ╔═══════════════════════════════════════╗
        </Text>
        <Text color="yellow" bold>
          ║         CAPITALISM CLI                ║
        </Text>
        <Text color="yellow" bold>
          ║      Buy Low, Sell High, Repeat       ║
        </Text>
        <Text color="yellow" bold>
          ╚═══════════════════════════════════════╝
        </Text>
      </Box>

      <Box marginBottom={1}>
        <Text color="dim">
          Travel between cities, trade goods, build your empire.
        </Text>
      </Box>

      <Box marginBottom={1}>
        <Text color="dim">You have 30 days to make as much money as possible.</Text>
      </Box>

      <Box marginTop={1}>
        <SelectInput items={items} onSelect={handleSelect} />
      </Box>
    </Box>
  );
};
