import React from 'react';
import { Text } from 'ink';
import SelectInput from 'ink-select-input';

interface SelectItem {
  label: string;
  value: string;
  disabled?: boolean;
}

interface SelectProps {
  items: SelectItem[];
  onSelect: (item: SelectItem) => void;
}

export const Select: React.FC<SelectProps> = ({ items, onSelect }) => {
  return (
    <SelectInput
      items={items}
      onSelect={onSelect}
      indicatorComponent={({ isSelected }) => (
        <Text color="greenBright">{isSelected ? '> ' : '  '}</Text>
      )}
      itemComponent={({ isSelected, label }) => (
        <Text color={isSelected ? 'greenBright' : 'white'}>{label}</Text>
      )}
    />
  );
};
