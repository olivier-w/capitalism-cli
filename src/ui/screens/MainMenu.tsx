import React from 'react';
import { Box, Text } from 'ink';
import { Select } from '../components/Select.tsx';
import { hasSaveGame } from '../../store/gameStore.ts';

interface MainMenuProps {
  onNewGame: () => void;
  onContinue: () => void;
  onQuit: () => void;
}

export const MainMenu: React.FC<MainMenuProps> = ({ onNewGame, onContinue, onQuit }) => {
  const saveExists = hasSaveGame();

  const items = saveExists
    ? [
        { label: 'Continue', value: 'continue' },
        { label: 'New Game', value: 'new' },
        { label: 'Quit', value: 'quit' },
      ]
    : [
        { label: 'New Game', value: 'new' },
        { label: 'Quit', value: 'quit' },
      ];

  const handleSelect = (item: { value: string }) => {
    switch (item.value) {
      case 'continue':
        onContinue();
        break;
      case 'new':
        onNewGame();
        break;
      case 'quit':
        onQuit();
        break;
    }
  };

  return (
    <Box flexDirection="column" alignItems="center" padding={1}>
      {/* Top decorative border */}
      <Text color="cyan">{'═'.repeat(58)}</Text>

      {/* ASCII Art Logo */}
      <Box flexDirection="column" alignItems="center" marginY={1}>
        <Text color="green">{'    ╔═══╗                                       ╔═══╗'}</Text>
        <Text color="green">{'    ║ $ ║                                       ║ $ ║'}</Text>
        <Text color="green">{'    ╚═╦═╝                                       ╚═╦═╝'}</Text>
        <Text color="yellow" bold>{'  ════╩═══════════════════════════════════════╩════'}</Text>
        <Text color="yellow" bold>{'  ║  ╔═╗ ╔═╗ ╔═╗ ╦ ╔╦╗ ╔═╗ ╦   ╦ ╔═╗ ╔╦╗  ║'}</Text>
        <Text color="yellow" bold>{'  ║  ║   ╠═╣ ╠═╝ ║  ║  ╠═╣ ║   ║ ╚═╗ ║║║  ║'}</Text>
        <Text color="yellow" bold>{'  ║  ╚═╝ ╩ ╩ ╩   ╩  ╩  ╩ ╩ ╩═╝ ╩ ╚═╝ ╩ ╩  ║'}</Text>
        <Text color="yellow" bold>{'  ═══════════════════════════════════════════════'}</Text>
        <Text color="cyan">{'       ░▒▓█ B U Y   L O W ,   S E L L   H I G H █▓▒░'}</Text>
      </Box>

      {/* Decorative trade illustration */}
      <Box flexDirection="column" alignItems="center">
        <Text color="white">{'      🏙️ ════════════ 🚛 ════════════ 🏙️'}</Text>
        <Text color="dim">{'         CITY          TRADE          CITY'}</Text>
      </Box>

      {/* Tagline box */}
      <Box marginY={1} flexDirection="column" alignItems="center">
        <Text color="magenta">{'    ┌─────────────────────────────────────────┐'}</Text>
        <Text color="magenta">{'    │'}<Text color="white"> Travel between cities, trade goods,  </Text>{'│'}</Text>
        <Text color="magenta">{'    │'}<Text color="white">         build your empire.           </Text>{'│'}</Text>
        <Text color="magenta">{'    │'}<Text color="cyan">   30 DAYS TO MAKE YOUR FORTUNE!      </Text>{'│'}</Text>
        <Text color="magenta">{'    └─────────────────────────────────────────┘'}</Text>
      </Box>

      {/* Menu */}
      <Box marginTop={1}>
        <Select items={items} onSelect={handleSelect} />
      </Box>

      {/* Bottom decorative border */}
      <Box marginTop={1}>
        <Text color="cyan">{'═'.repeat(58)}</Text>
      </Box>
    </Box>
  );
};
