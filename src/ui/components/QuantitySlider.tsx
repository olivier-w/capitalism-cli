import React from 'react';
import { Box, Text, useInput } from 'ink';

interface QuantitySliderProps {
  value: number;
  min: number;
  max: number;
  price: number;
  money: number;
  cargoUsed: number;
  cargoCapacity: number;
  isBuying: boolean;
  commodityName: string;
  onConfirm: (quantity: number) => void;
  onCancel: () => void;
}

export const QuantitySlider: React.FC<QuantitySliderProps> = ({
  value,
  min,
  max,
  price,
  money,
  cargoUsed,
  cargoCapacity,
  isBuying,
  commodityName,
  onConfirm,
  onCancel,
}) => {
  const [quantity, setQuantity] = React.useState(value);

  // Calculate constraints
  const maxAffordable = isBuying ? Math.floor(money / price) : max;
  const maxCargoSpace = isBuying ? cargoCapacity - cargoUsed : max;
  const effectiveMax = Math.min(max, maxAffordable, maxCargoSpace);

  const totalCost = price * quantity;
  const canAfford = isBuying ? totalCost <= money : true;
  const hasSpace = isBuying ? cargoUsed + quantity <= cargoCapacity : true;
  const isValid = quantity > 0 && quantity <= effectiveMax && canAfford && hasSpace;

  useInput((input, key) => {
    if (key.leftArrow) {
      setQuantity((prev) => Math.max(min, prev - 1));
    } else if (key.rightArrow) {
      setQuantity((prev) => Math.min(effectiveMax, prev + 1));
    } else if (key.upArrow) {
      // Jump by 10
      setQuantity((prev) => Math.min(effectiveMax, prev + 10));
    } else if (key.downArrow) {
      // Jump by 10
      setQuantity((prev) => Math.max(min, prev - 10));
    } else if (input === 'a' || input === 'A') {
      // All / max
      setQuantity(effectiveMax);
    } else if (input === 'h' || input === 'H') {
      // Half
      setQuantity(Math.floor(effectiveMax / 2));
    } else if (key.return && isValid) {
      onConfirm(quantity);
    } else if (key.escape) {
      onCancel();
    }
  });

  // Build slider visualization
  const sliderWidth = 30;
  const range = effectiveMax - min;
  const position = range > 0 ? Math.round(((quantity - min) / range) * (sliderWidth - 1)) : 0;

  const sliderChars: string[] = [];
  for (let i = 0; i < sliderWidth; i++) {
    if (i === position) {
      sliderChars.push('O');
    } else {
      sliderChars.push('-');
    }
  }

  const afterMoney = money - totalCost;
  const afterCargo = cargoUsed + (isBuying ? quantity : -quantity);

  return (
    <Box flexDirection="column" borderStyle="double" paddingX={2} paddingY={1}>
      {/* Title */}
      <Box marginBottom={1}>
        <Text bold color="cyan">
          {isBuying ? 'BUYING' : 'SELLING'}: {commodityName} @ ${price} each
        </Text>
      </Box>

      {/* Slider */}
      <Box flexDirection="column" marginBottom={1}>
        <Box>
          <Text color="dim">{min} </Text>
          <Text color="dim">{`<`}</Text>
          <Text color="cyan">{sliderChars.join('')}</Text>
          <Text color="dim">{`>`}</Text>
          <Text color="dim"> {effectiveMax}</Text>
        </Box>
        <Box justifyContent="center">
          <Text bold color="greenBright">
            {quantity}
          </Text>
        </Box>
      </Box>

      {/* Transaction preview */}
      <Box flexDirection="column" borderStyle="single" paddingX={1} marginBottom={1}>
        <Box justifyContent="space-between">
          <Text>Total {isBuying ? 'cost' : 'revenue'}:</Text>
          <Text color={isBuying ? 'red' : 'green'} bold>
            ${totalCost.toLocaleString()}
          </Text>
        </Box>
        <Box justifyContent="space-between">
          <Text>Your money:</Text>
          <Text>
            <Text color="yellow">${money.toLocaleString()}</Text>
            <Text color="dim"> {'->'} </Text>
            <Text color={afterMoney >= 0 ? 'yellow' : 'red'}>
              ${(isBuying ? afterMoney : money + totalCost).toLocaleString()}
            </Text>
          </Text>
        </Box>
        {isBuying && (
          <Box justifyContent="space-between">
            <Text>Cargo space:</Text>
            <Text>
              <Text>{cargoUsed}/{cargoCapacity}</Text>
              <Text color="dim"> {'->'} </Text>
              <Text color={afterCargo <= cargoCapacity ? 'white' : 'red'}>
                {afterCargo}/{cargoCapacity}
              </Text>
            </Text>
          </Box>
        )}
      </Box>

      {/* Validation messages */}
      {!canAfford && (
        <Text color="red" bold>
          [X] Not enough money!
        </Text>
      )}
      {!hasSpace && (
        <Text color="red" bold>
          [X] Not enough cargo space!
        </Text>
      )}

      {/* Controls */}
      <Box marginTop={1} flexDirection="column">
        <Text color="dim">
          [{'<-'}/{'->'}] +-1 [Up/Down] +-10 [A] All [H] Half
        </Text>
        <Text color="dim">[Enter] Confirm [Esc] Cancel</Text>
      </Box>
    </Box>
  );
};
