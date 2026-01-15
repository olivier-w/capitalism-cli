import React, { useState } from 'react';
import { Box, Text, useInput } from 'ink';
import { useGameStore } from '../../store/gameStore.ts';
import { vehicles, getVehicle, getVehicleTier, canVehicleTravelTo } from '../../data/vehicles.ts';
import {
  vehicleParts,
  getPart,
  canEquipPart,
  MAX_EQUIPPED_PARTS,
  getCapacityBonus,
  getEfficiencyMultiplier,
} from '../../data/parts.ts';
import { Header } from '../components/Header.tsx';
import { ProgressBar } from '../components/ProgressBar.tsx';

interface UpgradeScreenProps {
  onBack: () => void;
  onMessage: (text: string, type: 'info' | 'success' | 'error') => void;
}

type Tab = 'vehicles' | 'parts' | 'equipped';

export const UpgradeScreen: React.FC<UpgradeScreenProps> = ({ onBack, onMessage }) => {
  const { money, vehicle, buyVehicle, ownedParts, equippedParts, buyPart, equipPart, unequipPart } =
    useGameStore();

  const [activeTab, setActiveTab] = useState<Tab>('vehicles');
  const [selectedIndex, setSelectedIndex] = useState(0);

  const currentVehicle = getVehicle(vehicle);
  const currentTier = getVehicleTier(vehicle);

  // Get lists for each tab
  const availableVehicles = vehicles.filter((v) => v.id !== vehicle);

  const availableParts = vehicleParts.filter((p) => !ownedParts.includes(p.id));

  const ownedPartsList = ownedParts.map((id) => getPart(id)).filter(Boolean);

  // Determine max index for current tab
  const getMaxIndex = () => {
    switch (activeTab) {
      case 'vehicles':
        return availableVehicles.length;
      case 'parts':
        return availableParts.length;
      case 'equipped':
        return ownedPartsList.length;
    }
  };

  useInput((input, key) => {
    if (key.escape || input === 'q' || input === 'Q') {
      onBack();
      return;
    }

    // Tab switching
    if (input === '1') {
      setActiveTab('vehicles');
      setSelectedIndex(0);
    } else if (input === '2') {
      setActiveTab('parts');
      setSelectedIndex(0);
    } else if (input === '3') {
      setActiveTab('equipped');
      setSelectedIndex(0);
    } else if (key.tab || key.leftArrow || key.rightArrow) {
      const tabs: Tab[] = ['vehicles', 'parts', 'equipped'];
      const currentTabIndex = tabs.indexOf(activeTab);
      const direction = key.leftArrow ? -1 : 1;
      const newIndex = (currentTabIndex + direction + tabs.length) % tabs.length;
      setActiveTab(tabs[newIndex]!);
      setSelectedIndex(0);
    }

    // Navigation
    if (key.upArrow) {
      setSelectedIndex((prev) => Math.max(0, prev - 1));
    } else if (key.downArrow) {
      setSelectedIndex((prev) => Math.min(getMaxIndex() - 1, prev + 1));
    }

    // Selection
    if (key.return) {
      handleSelect();
    }
  });

  const handleSelect = () => {
    if (activeTab === 'vehicles') {
      const selectedVehicle = availableVehicles[selectedIndex];
      if (!selectedVehicle) return;

      const result = buyVehicle(selectedVehicle.id);
      if (result.success) {
        onMessage(result.message, 'success');
      } else {
        onMessage(result.message, 'error');
      }
    } else if (activeTab === 'parts') {
      const selectedPart = availableParts[selectedIndex];
      if (!selectedPart) return;

      const result = buyPart(selectedPart.id);
      if (result.success) {
        onMessage(result.message, 'success');
        // Switch to equipped tab to show the new part
        setActiveTab('equipped');
        setSelectedIndex(0);
      } else {
        onMessage(result.message, 'error');
      }
    } else if (activeTab === 'equipped') {
      const selectedPart = ownedPartsList[selectedIndex];
      if (!selectedPart) return;

      const isEquipped = equippedParts.includes(selectedPart.id);
      if (isEquipped) {
        const result = unequipPart(selectedPart.id);
        if (result.success) {
          onMessage(result.message, 'success');
        } else {
          onMessage(result.message, 'error');
        }
      } else {
        const result = equipPart(selectedPart.id);
        if (result.success) {
          onMessage(result.message, 'success');
        } else {
          onMessage(result.message, 'error');
        }
      }
    }
  };

  // Calculate current bonuses from equipped parts
  const capacityBonus = getCapacityBonus(equippedParts);
  const efficiencyMult = getEfficiencyMultiplier(equippedParts);
  const efficiencyPercent = Math.round((1 - efficiencyMult) * 100);

  return (
    <Box flexDirection="column">
      <Header />

      {/* Title */}
      <Box marginBottom={1}>
        <Text bold color="cyan">
          {'='.repeat(12)} UPGRADE CENTER {'='.repeat(12)}
        </Text>
      </Box>

      {/* Current Vehicle Info */}
      <Box borderStyle="single" paddingX={1} marginBottom={1}>
        <Box flexDirection="column" width="50%">
          <Text bold color="yellow">
            {currentVehicle?.name ?? 'Unknown'}
          </Text>
          <Text color="dim">{currentVehicle?.description}</Text>
          <Box gap={2}>
            <Text>
              Capacity: <Text color="cyan">{currentVehicle?.capacity}</Text>
              {capacityBonus > 0 && <Text color="green"> +{capacityBonus}</Text>}
            </Text>
            <Text>
              Tier: <Text color="magenta">{currentTier}</Text>
            </Text>
          </Box>
          {currentVehicle?.specialty && (
            <Text color="yellowBright">
              Special:{' '}
              {currentVehicle.specialty.type === 'speed'
                ? 'High Speed'
                : currentVehicle.specialty.type === 'liquid_bonus'
                  ? `+${currentVehicle.specialty.value}% Liquid Capacity`
                  : 'Rail Routes Only'}
            </Text>
          )}
        </Box>
        <Box flexDirection="column" width="50%">
          <Text bold>Parts Equipped</Text>
          <ProgressBar
            value={equippedParts.length}
            max={MAX_EQUIPPED_PARTS}
            width={20}
            filledChar="●"
            emptyChar="○"
            color="cyan"
          />
          <Text color="dim">
            {equippedParts.length}/{MAX_EQUIPPED_PARTS} slots used
          </Text>
          {efficiencyPercent > 0 && (
            <Text color="green">Energy: -{efficiencyPercent}% cost</Text>
          )}
        </Box>
      </Box>

      {/* Tabs */}
      <Box marginBottom={1} gap={2}>
        <Text
          backgroundColor={activeTab === 'vehicles' ? 'blue' : undefined}
          color={activeTab === 'vehicles' ? 'white' : 'dim'}
        >
          {' '}
          [1] Vehicles{' '}
        </Text>
        <Text
          backgroundColor={activeTab === 'parts' ? 'blue' : undefined}
          color={activeTab === 'parts' ? 'white' : 'dim'}
        >
          {' '}
          [2] Buy Parts{' '}
        </Text>
        <Text
          backgroundColor={activeTab === 'equipped' ? 'blue' : undefined}
          color={activeTab === 'equipped' ? 'white' : 'dim'}
        >
          {' '}
          [3] My Parts ({ownedParts.length}){' '}
        </Text>
      </Box>

      {/* Content Area */}
      <Box flexDirection="column" borderStyle="double" paddingX={1} minHeight={12}>
        {activeTab === 'vehicles' && (
          <>
            <Box marginBottom={1}>
              <Text bold color="yellow">
                VEHICLE DEALERSHIP
              </Text>
            </Box>
            {availableVehicles.length === 0 ? (
              <Text color="dim">No vehicles available for purchase.</Text>
            ) : (
              availableVehicles.map((v, i) => {
                const isSelected = i === selectedIndex;
                const canAfford = money >= v.cost;
                const isDowngrade = v.capacity < (currentVehicle?.capacity ?? 0);
                const isUpgrade = v.capacity > (currentVehicle?.capacity ?? 0);

                return (
                  <Box
                    key={v.id}
                    flexDirection="column"
                    marginBottom={1}
                    borderStyle={isSelected ? 'single' : undefined}
                    borderColor={isSelected ? 'cyan' : undefined}
                    paddingX={isSelected ? 1 : 0}
                  >
                    <Box>
                      <Text color={isSelected ? 'cyan' : canAfford ? 'white' : 'dim'} bold>
                        {isSelected ? '>' : ' '} {v.name}
                      </Text>
                      <Text color={canAfford ? 'green' : 'red'}> ${v.cost.toLocaleString()}</Text>
                      {isUpgrade && <Text color="greenBright"> [UPGRADE]</Text>}
                      {isDowngrade && <Text color="yellow"> [downgrade]</Text>}
                    </Box>
                    {isSelected && (
                      <>
                        <Text color="dim">{v.description}</Text>
                        <Box gap={2}>
                          <Text>
                            Capacity: <Text color="cyan">{v.capacity}</Text>
                          </Text>
                          <Text>
                            Energy:{' '}
                            <Text
                              color={
                                v.energyMultiplier < 1
                                  ? 'green'
                                  : v.energyMultiplier > 1
                                    ? 'red'
                                    : 'white'
                              }
                            >
                              {v.energyMultiplier}x
                            </Text>
                          </Text>
                          <Text>
                            Tier: <Text color="magenta">{v.tier}</Text>
                          </Text>
                        </Box>
                        {v.specialty && (
                          <Text color="yellowBright">
                            Special:{' '}
                            {v.specialty.type === 'speed'
                              ? 'Ultra-efficient travel'
                              : v.specialty.type === 'liquid_bonus'
                                ? `+${v.specialty.value}% capacity for liquids`
                                : `Rail only: ${v.specialty.restrictedRoutes?.join(', ')}`}
                          </Text>
                        )}
                        {!canAfford && (
                          <Text color="red">Need ${(v.cost - money).toLocaleString()} more</Text>
                        )}
                      </>
                    )}
                  </Box>
                );
              })
            )}
          </>
        )}

        {activeTab === 'parts' && (
          <>
            <Box marginBottom={1}>
              <Text bold color="yellow">
                PARTS SHOP
              </Text>
            </Box>
            {availableParts.length === 0 ? (
              <Text color="dim">You own all available parts!</Text>
            ) : (
              availableParts.map((p, i) => {
                const isSelected = i === selectedIndex;
                const canAfford = money >= p.cost;
                const meetsRequirement = canEquipPart(p.id, currentTier);
                const categoryColor =
                  p.category === 'cargo' ? 'blue' : p.category === 'efficiency' ? 'green' : 'magenta';

                return (
                  <Box
                    key={p.id}
                    flexDirection="column"
                    marginBottom={1}
                    borderStyle={isSelected ? 'single' : undefined}
                    borderColor={isSelected ? 'cyan' : undefined}
                    paddingX={isSelected ? 1 : 0}
                  >
                    <Box>
                      <Text color={isSelected ? 'cyan' : canAfford ? 'white' : 'dim'} bold>
                        {isSelected ? '>' : ' '} {p.name}
                      </Text>
                      <Text color={canAfford ? 'green' : 'red'}> ${p.cost.toLocaleString()}</Text>
                      <Text color={categoryColor}> [{p.category}]</Text>
                    </Box>
                    {isSelected && (
                      <>
                        <Text color="dim">{p.description}</Text>
                        {p.minTier && (
                          <Text color={meetsRequirement ? 'green' : 'red'}>
                            Requires: Tier {p.minTier}+ vehicle{' '}
                            {meetsRequirement ? '✓' : `(you have tier ${currentTier})`}
                          </Text>
                        )}
                        {!canAfford && (
                          <Text color="red">Need ${(p.cost - money).toLocaleString()} more</Text>
                        )}
                      </>
                    )}
                  </Box>
                );
              })
            )}
          </>
        )}

        {activeTab === 'equipped' && (
          <>
            <Box marginBottom={1}>
              <Text bold color="yellow">
                MY PARTS INVENTORY
              </Text>
            </Box>
            {ownedPartsList.length === 0 ? (
              <Text color="dim">No parts owned. Visit the Parts Shop to buy some!</Text>
            ) : (
              ownedPartsList.map((p, i) => {
                if (!p) return null;
                const isSelected = i === selectedIndex;
                const isEquipped = equippedParts.includes(p.id);
                const meetsRequirement = canEquipPart(p.id, currentTier);
                const canEquip = meetsRequirement && equippedParts.length < MAX_EQUIPPED_PARTS;

                return (
                  <Box
                    key={p.id}
                    flexDirection="column"
                    marginBottom={1}
                    borderStyle={isSelected ? 'single' : undefined}
                    borderColor={isSelected ? 'cyan' : undefined}
                    paddingX={isSelected ? 1 : 0}
                  >
                    <Box>
                      <Text color={isSelected ? 'cyan' : 'white'} bold>
                        {isSelected ? '>' : ' '} {p.name}
                      </Text>
                      {isEquipped ? (
                        <Text color="greenBright"> [EQUIPPED]</Text>
                      ) : (
                        <Text color="dim"> [stored]</Text>
                      )}
                    </Box>
                    {isSelected && (
                      <>
                        <Text color="dim">{p.description}</Text>
                        {p.minTier && !meetsRequirement && (
                          <Text color="red">
                            Requires: Tier {p.minTier}+ vehicle (you have tier {currentTier})
                          </Text>
                        )}
                        <Text color="cyan">
                          Press Enter to {isEquipped ? 'unequip' : canEquip ? 'equip' : 'equip'}
                          {!isEquipped && !canEquip && equippedParts.length >= MAX_EQUIPPED_PARTS && (
                            <Text color="red"> (slots full)</Text>
                          )}
                        </Text>
                      </>
                    )}
                  </Box>
                );
              })
            )}
          </>
        )}
      </Box>

      {/* Footer */}
      <Box borderStyle="single" paddingX={1} marginTop={1} justifyContent="space-between">
        <Text>
          Cash: <Text color="green" bold>${money.toLocaleString()}</Text>
        </Text>
        <Text color="dim">[1-3] Tabs [↑↓] Navigate [Enter] Select [Esc] Back</Text>
      </Box>
    </Box>
  );
};
