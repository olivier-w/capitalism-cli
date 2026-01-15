import React from 'react';
import { Box, Text, useInput } from 'ink';
import { type EventLogEntry } from '../../game/GameState.ts';
import { getEvent } from '../../data/events.ts';
import { getCommodity } from '../../data/commodities.ts';
import { getCargoQuantity, type CargoItem } from '../../game/GameState.ts';

interface EventAlertProps {
  event: EventLogEntry;
  cargo: CargoItem[];
  onDismiss: () => void;
}

export const EventAlert: React.FC<EventAlertProps> = ({ event, cargo, onDismiss }) => {
  useInput((input, key) => {
    if (key.return || key.escape || input === ' ') {
      onDismiss();
    }
  });

  // Get full event data for effects
  const fullEvent = getEvent(event.eventName.toLowerCase().replace(/\s+/g, '_'));

  // Calculate impact on player's cargo
  const impacts: Array<{ commodity: string; effect: string; ownedQty: number }> = [];

  if (fullEvent) {
    for (const effect of fullEvent.commodityEffects) {
      const commodity = getCommodity(effect.commodityId);
      const ownedQty = getCargoQuantity(cargo, effect.commodityId);

      if (commodity) {
        const pctChange = Math.round((effect.priceMultiplier - 1) * 100);
        const sign = pctChange >= 0 ? '+' : '';
        impacts.push({
          commodity: commodity.name,
          effect: `${sign}${pctChange}%`,
          ownedQty,
        });
      }
    }
  }

  return (
    <Box
      flexDirection="column"
      borderStyle="double"
      borderColor={event.isStarting ? 'yellowBright' : 'gray'}
      paddingX={2}
      paddingY={1}
      marginY={1}
    >
      {/* Header */}
      <Box justifyContent="center" marginBottom={1}>
        <Text bold color={event.isStarting ? 'yellowBright' : 'gray'}>
          [!] {event.isStarting ? 'BREAKING NEWS' : 'EVENT ENDED'} [!]
        </Text>
      </Box>

      {/* Event name */}
      <Box justifyContent="center" marginBottom={1}>
        <Text bold color="cyan">
          {'>>> '}{event.eventName}{' <<<'}
        </Text>
      </Box>

      {/* Description */}
      <Box justifyContent="center" marginBottom={1}>
        <Text>{event.description}</Text>
      </Box>

      {/* Price effects */}
      {impacts.length > 0 && (
        <Box flexDirection="column" marginBottom={1}>
          <Text bold color="dim">
            Price Effects:
          </Text>
          {impacts.map((impact, i) => (
            <Box key={i} paddingLeft={2}>
              <Text>
                <Text color="cyan">{impact.commodity}</Text>:{' '}
                <Text color={impact.effect.startsWith('+') ? 'red' : 'green'}>
                  {impact.effect}
                </Text>
                {impact.ownedQty > 0 && (
                  <Text color="yellow">
                    {' '}
                    (You own {impact.ownedQty})
                  </Text>
                )}
              </Text>
            </Box>
          ))}
        </Box>
      )}

      {/* Continue prompt */}
      <Box justifyContent="center" marginTop={1}>
        <Text color="dim">[Press ENTER to continue]</Text>
      </Box>
    </Box>
  );
};

// List of recent events for the game screen
interface EventLogProps {
  events: EventLogEntry[];
  maxItems?: number;
}

export const EventLog: React.FC<EventLogProps> = ({ events, maxItems = 5 }) => {
  const recentEvents = events.slice(0, maxItems);

  if (recentEvents.length === 0) {
    return null;
  }

  return (
    <Box flexDirection="column" marginBottom={1}>
      <Text bold color="magentaBright">
        Recent News:
      </Text>
      {recentEvents.map((event, i) => (
        <Box key={i} paddingLeft={1}>
          <Text color="dim">Day {event.day}: </Text>
          <Text color={event.isStarting ? 'magentaBright' : 'gray'}>
            {event.isStarting ? '[!] ' : '[x] '}
            {event.eventName}
            {event.isStarting ? ' began' : ' ended'}
          </Text>
        </Box>
      ))}
    </Box>
  );
};
