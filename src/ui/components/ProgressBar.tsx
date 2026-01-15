import React from 'react';
import { Box, Text } from 'ink';

interface ProgressBarProps {
  value: number;
  max: number;
  width?: number;
  showValue?: boolean;
  showPercentage?: boolean;
  label?: string;
  filledChar?: string;
  emptyChar?: string;
  // Color thresholds - green above high, yellow between, red below low
  thresholds?: { low: number; high: number };
  // Override color entirely
  color?: string;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  value,
  max,
  width = 10,
  showValue = false,
  showPercentage = false,
  label,
  filledChar = '█',
  emptyChar = '░',
  thresholds = { low: 0.3, high: 0.7 },
  color,
}) => {
  const percentage = max > 0 ? Math.min(value / max, 1) : 0;
  const filledWidth = Math.round(percentage * width);
  const emptyWidth = width - filledWidth;

  // Determine color based on thresholds
  let barColor = color;
  if (!barColor) {
    if (percentage <= thresholds.low) {
      barColor = 'red';
    } else if (percentage <= thresholds.high) {
      barColor = 'yellow';
    } else {
      barColor = 'green';
    }
  }

  const filled = filledChar.repeat(filledWidth);
  const empty = emptyChar.repeat(emptyWidth);

  return (
    <Box>
      {label && <Text>{label} </Text>}
      <Text color={barColor}>{filled}</Text>
      <Text color="gray">{empty}</Text>
      {showValue && (
        <Text>
          {' '}
          {value}/{max}
        </Text>
      )}
      {showPercentage && !showValue && <Text> {Math.round(percentage * 100)}%</Text>}
    </Box>
  );
};

// Compact inline version for headers
interface InlineBarProps {
  value: number;
  max: number;
  width?: number;
  thresholds?: { low: number; high: number };
}

export const InlineBar: React.FC<InlineBarProps> = ({
  value,
  max,
  width = 8,
  thresholds = { low: 0.3, high: 0.7 },
}) => {
  const percentage = max > 0 ? Math.min(value / max, 1) : 0;
  const filledWidth = Math.round(percentage * width);
  const emptyWidth = width - filledWidth;

  let barColor: string;
  if (percentage <= thresholds.low) {
    barColor = 'red';
  } else if (percentage <= thresholds.high) {
    barColor = 'yellow';
  } else {
    barColor = 'green';
  }

  return (
    <Text>
      <Text color={barColor}>{'█'.repeat(filledWidth)}</Text>
      <Text color="gray">{'░'.repeat(emptyWidth)}</Text>
    </Text>
  );
};

// Slider-style bar for quantity selection
interface SliderBarProps {
  value: number;
  min: number;
  max: number;
  width?: number;
}

export const SliderBar: React.FC<SliderBarProps> = ({ value, min, max, width = 30 }) => {
  const range = max - min;
  const percentage = range > 0 ? (value - min) / range : 0;
  const position = Math.round(percentage * (width - 1));

  const chars: string[] = [];
  for (let i = 0; i < width; i++) {
    if (i === position) {
      chars.push('●');
    } else {
      chars.push('─');
    }
  }

  return (
    <Box>
      <Text color="dim">◄</Text>
      <Text color="cyan">{chars.join('')}</Text>
      <Text color="dim">►</Text>
    </Box>
  );
};

// Margin/percentage bar for profit display
interface MarginBarProps {
  percentage: number; // 0-200+ as percentage
  width?: number;
}

export const MarginBar: React.FC<MarginBarProps> = ({ percentage, width = 20 }) => {
  // Cap at 200% for display
  const cappedPct = Math.min(percentage, 200);
  const filledWidth = Math.round((cappedPct / 200) * width);
  const emptyWidth = width - filledWidth;

  let color: string;
  if (percentage >= 100) {
    color = 'greenBright';
  } else if (percentage >= 50) {
    color = 'green';
  } else if (percentage >= 20) {
    color = 'yellow';
  } else {
    color = 'red';
  }

  return (
    <Text>
      <Text color={color}>{'█'.repeat(filledWidth)}</Text>
      <Text color="gray">{'░'.repeat(emptyWidth)}</Text>
    </Text>
  );
};
