import React from 'react';
import { Box } from 'ink';
import { useGameStore } from '../store/gameStore.ts';
import { MainMenu } from './screens/MainMenu.tsx';
import { GameScreen } from './screens/GameScreen.tsx';
import { GameOverScreen } from './screens/GameOverScreen.tsx';

interface AppProps {
  onExit: () => void;
}

export const App: React.FC<AppProps> = ({ onExit }) => {
  const { gameStarted, gameOver, startGame, resetGame } = useGameStore();

  const handleNewGame = () => {
    resetGame();
    startGame();
  };

  const handleQuit = () => {
    onExit();
  };

  // Game over screen
  if (gameOver) {
    return (
      <Box flexDirection="column">
        <GameOverScreen onNewGame={handleNewGame} onQuit={handleQuit} />
      </Box>
    );
  }

  // Main menu (not started)
  if (!gameStarted) {
    return (
      <Box flexDirection="column">
        <MainMenu onNewGame={handleNewGame} onQuit={handleQuit} />
      </Box>
    );
  }

  // In-game
  return (
    <Box flexDirection="column">
      <GameScreen onQuit={handleQuit} />
    </Box>
  );
};
