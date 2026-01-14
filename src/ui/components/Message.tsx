import React from 'react';
import { Box, Text } from 'ink';

interface MessageProps {
  text: string;
  type?: 'info' | 'success' | 'error' | 'warning';
}

export const Message: React.FC<MessageProps> = ({ text, type = 'info' }) => {
  if (!text) return null;

  const colors: Record<string, string> = {
    info: 'blue',
    success: 'green',
    error: 'red',
    warning: 'yellow',
  };

  return (
    <Box marginY={1}>
      <Text color={colors[type]}>{text}</Text>
    </Box>
  );
};
